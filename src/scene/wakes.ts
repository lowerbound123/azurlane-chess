import * as THREE from 'three';
import type {MapModel,WakeSegment,WakeTimeline} from '../../shared/render.ts';

function material(kind:WakeSegment['kind']){
 return new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,side:THREE.DoubleSide,
  uniforms:{time:{value:0},replayTime:{value:0},fading:{value:0},narrow:{value:kind==='torpedo'?1:0},halfWidth:{value:kind==='torpedo'?.05:.18}},
  vertexShader:`attribute vec2 edge; attribute float born;
   varying vec2 flow; varying float birth; varying vec2 surface;
   uniform float fading; uniform float replayTime; uniform float halfWidth;
   void main(){flow=uv;birth=born;
    // Each newly formed section starts fine and spreads sideways behind the
    // moving unit. Both presentation phases stay inside the same narrow limit.
    float age=max(0.,replayTime-born);
    float spread=mix(.32,1.,1.-exp(-age*9.));
    vec3 p=position;float width=halfWidth*mix(spread,1.,fading);
    p.xz+=edge*uv.y*width;
    surface=(modelMatrix*vec4(p,1.)).xz;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
   }`,
  fragmentShader:`uniform float time; uniform float replayTime; uniform float fading; uniform float narrow;
   varying vec2 flow;varying float birth;varying vec2 surface;
   float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
   float crest(float phase){float w=sin(phase),aa=max(fwidth(w),.04);return smoothstep(.78-aa,.98+aa,w);}
   void main(){
    if(birth>replayTime+.00001)discard;
    float side=abs(flow.y),distance=flow.x;
    float swell=noise(surface*3.1+vec2(time*.07,-time*.09));
    float broken=noise(vec2(distance*5.3-time*.16,flow.y*3.7+time*.12));
    float edgeFade=1.-smoothstep(.58+.13*swell,1.,side);

    // Curved, broken wavefronts move away from the centre on both sides.
    // There is no constant strip fill or crest parallel to the route edge.
    float bow=crest(distance*mix(17.,24.,narrow)+side*side*7.8-time*2.1+(swell-.5)*2.4);
    bow*=smoothstep(.2,.72,broken)*(.35+.65*side);

    // Foam travels as separate irregular patches, with small bubble detail.
    float patches=smoothstep(.46,.75,noise(vec2(distance*13.-time*.37,flow.y*4.6+time*.19)));
    vec2 p=vec2(distance*29.-time*.45,flow.y*8.-sign(flow.y)*time*.35);
    vec2 cell=floor(p),local=fract(p)-(.22+.56*vec2(hash(cell),hash(cell+19.7)));
    float radius=.13+.16*hash(cell+4.1),bubbleDistance=length(local);
    float aa=max(fwidth(bubbleDistance),.045);
    float bubbles=1.-smoothstep(radius-aa,radius+aa,bubbleDistance);
    float foam=patches*(.28+.72*bubbles)*exp(-pow(side/.72,4.));

    // Planning keeps only irregular open ripple arcs. Their phase bends away
    // from the route, avoiding a row of identical rings or a continuous band.
    float eddy=noise(vec2(distance*2.1-time*.06,sign(flow.y)*1.7));
    float lateral=abs(flow.y+(swell-.5)*.2);
    float rings=crest(distance*mix(11.5,17.,narrow)+lateral*lateral*8.5-time*1.05+eddy*4.2);
    rings*=smoothstep(.2,.67,broken)*(.3+.7*side);

    float wakeAlpha=foam*.75+bow*.27;
    float rippleAlpha=rings*.3+bow*.07;
    float alpha=mix(wakeAlpha,rippleAlpha,fading)*edgeFade;
    if(alpha<.003)discard;
    vec3 wakeTint=mix(vec3(.42,.73,.77),vec3(.87,.97,.98),clamp(foam+bow*.45,0.,1.));
    vec3 rippleTint=mix(vec3(.36,.62,.69),vec3(.62,.83,.86),rings);
    vec3 tint=mix(wakeTint,rippleTint,fading);
    gl_FragColor=vec4(tint,alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`,
 });
}

function ribbon(segments:WakeSegment[],kind:WakeSegment['kind']){
 const positions:number[]=[],edges:number[]=[],uv:number[]=[],birth:number[]=[],indices:number[]=[];
 for(const segment of segments){
  const dx=segment.to.x-segment.from.x,dy=segment.to.y-segment.from.y,length=Math.hypot(dx,dy),base=birth.length;
  for(const [point,offset,time]of [[segment.from,0,segment.start],[segment.to,length,segment.end]] as const){
   for(const side of [-1,1]){positions.push(point.x,.085,point.y);edges.push(-dy/length,dx/length);uv.push(segment.distance+offset,side);birth.push(time);}
  }
  indices.push(base,base+2,base+1,base+1,base+2,base+3);
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('edge',new THREE.Float32BufferAttribute(edges,2));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geometry.setAttribute('born',new THREE.Float32BufferAttribute(birth,1));geometry.setIndex(indices);
 // The vertex shader widens the centreline into a ribbon.
 geometry.computeBoundingSphere();geometry.boundingSphere!.radius+=.7;
 const mesh=new THREE.Mesh(geometry,material(kind));mesh.name=`${kind}-wake`;mesh.renderOrder=1;return mesh;
}

export class Wakes {
 readonly root=new THREE.Group();
 private timeline?:WakeTimeline;
 private playing=false;
 private previousTime=0;
 private clock?:number;
 private meshes:THREE.Mesh<THREE.BufferGeometry,THREE.ShaderMaterial>[]=[];
 constructor(scene:THREE.Scene){this.root.name='surface-wakes';scene.add(this.root);}
 update(model:MapModel){
  if(model.phase==='deploy'||!model.wakeTimeline){this.clear();return;}
  const playing=model.busy&&model.visualTime!==undefined&&!!model.wakeTimeline;
  if(playing){
   if(this.timeline!==model.wakeTimeline||!this.playing||model.visualTime! < this.previousTime){
    this.replace(model.wakeTimeline);
   }
   this.previousTime=model.visualTime!;
   for(const mesh of this.meshes){mesh.material.uniforms.replayTime.value=model.visualTime!;mesh.material.uniforms.fading.value=0;}
  }else{
   if(!this.timeline||!model.busy&&this.timeline!==model.wakeTimeline){this.replace(model.wakeTimeline);for(const mesh of this.meshes)mesh.material.uniforms.fading.value=1;}
   for(const mesh of this.meshes)mesh.material.uniforms.replayTime.value=this.timeline?.endTime??0;
  }
  this.playing=playing;
 }
 private replace(timeline:WakeTimeline){
  this.clear();this.timeline=timeline;
  for(const kind of ['ship','torpedo'] as const){const segments=timeline.segments.filter(s=>s.kind===kind);if(segments.length){const mesh=ribbon(segments,kind);this.meshes.push(mesh);this.root.add(mesh);}}
 }
 tick(time:number,motion=true){
  const delta=this.clock===undefined?0:Math.max(0,time-this.clock);this.clock=time;
  for(const mesh of this.meshes){const uniforms=mesh.material.uniforms;if(motion)uniforms.time.value=time;if(!this.playing)uniforms.fading.value=Math.min(1,uniforms.fading.value+delta/.45);}
 }
 private clear(){for(const mesh of this.meshes){mesh.geometry.dispose();mesh.material.dispose();mesh.removeFromParent();}this.meshes=[];this.timeline=undefined;this.playing=false;}
 dispose(){this.clear();this.root.removeFromParent();}
}
