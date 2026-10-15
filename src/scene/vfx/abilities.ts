import * as T from 'three';
export type AbilityVisualKind='smoke'|'escort'|'radar'|'scout'|'heavyShell';
const tau=Math.PI*2;
const v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const noise=`float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}float fbm(vec2 p){return .57*noise(p)+.28*noise(p*2.03)+.15*noise(p*4.11);}`;
function line(points:T.Vector3[],color:number,opacity=.5){return new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));}
function ring(radius:number,color:number,opacity=.3){return line(Array.from({length:65},(_,i)=>v(Math.cos(i/64*tau)*radius,.025,Math.sin(i/64*tau)*radius)),color,opacity);}
export function disposeVisual(root:T.Object3D){const owned=new Set<T.BufferGeometry|T.Material>();root.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line){owned.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])owned.add(m);}});owned.forEach(r=>r.dispose());root.clear();root.removeFromParent();}
/** Absolute-time visuals. Smoke/radar use one clipped hex per visible cell. */
export class AbilityVisual{
 readonly root=new T.Group();readonly clock={value:0};private updates:((time:number)=>void)[]=[];
 constructor(readonly kind:AbilityVisualKind,color=0x74e6d0){
  this.root.name=`AbilityVisual_${kind}`;
  if(kind==='smoke')this.smoke();
  if(kind==='radar')this.radar(color);
  if(kind==='escort')this.shields(color);
  if(kind==='scout'){
   const cone=new T.Mesh(new T.ConeGeometry(.52,1.55,32,1,true),new T.MeshBasicMaterial({color,transparent:true,opacity:.055,depthWrite:false,side:T.DoubleSide}));cone.position.y=.85;this.root.add(cone);
   const r=ring(.52,color,.25);this.root.add(r);this.updates.push(t=>{r.scale.setScalar(.9+.1*Math.sin(t*2));});
  }
  if(kind==='heavyShell'){
   // Centre and six adjacent hexes: radius is the same world unit as the board.
   for(let i=0;i<7;i++){const x=i?Math.cos((i-1)/6*tau)*Math.sqrt(3):0,z=i?Math.sin((i-1)/6*tau)*Math.sqrt(3):0;
    const edge=line(Array.from({length:7},(_,j)=>v(x+Math.cos(j/6*tau+Math.PI/6)*.96,.035,z+Math.sin(j/6*tau+Math.PI/6)*.96)),i?0xffa36b:0xffe6ac,i?.3:.65);this.root.add(edge);
    this.updates.push(t=>{const age=Math.max(0,t);edge.material.opacity=Math.max(0,1-age/1.3)*(i?.32:.7);});
   }
  }
 }
 private smoke(){
  const source=new T.PlaneGeometry(1,1),g=new T.InstancedBufferGeometry();g.index=source.index!.clone();for(const name of ['position','uv'])g.setAttribute(name,source.getAttribute(name).clone());source.dispose();
  const data=[];for(let i=0;i<28;i++){const a=i*2.399963,r=Math.sqrt(i/28)*.62;data.push(Math.cos(a)*r,.22+(i%4)*.11,Math.sin(a)*r,i*.618%1);}g.setAttribute('aPuff',new T.InstancedBufferAttribute(new Float32Array(data),4));g.instanceCount=28;
  const material=new T.ShaderMaterial({uniforms:{uTime:this.clock},transparent:true,depthWrite:false,
   vertexShader:`attribute vec4 aPuff;uniform float uTime;varying vec2 vUv,vLocal;varying float vSeed;void main(){vUv=uv;vSeed=aPuff.w;vec3 pos=aPuff.xyz;pos.x+=sin(uTime*.35+aPuff.w*6.)*.04;pos.y+=sin(uTime*.55+aPuff.w*6.)*.035;vec2 offset=position.xy*vec2(1.05,.8);vec4 view=modelViewMatrix*vec4(pos,1.);float scale=length(modelViewMatrix[0].xyz);view.xy+=offset*scale;vLocal=pos.xz+vec2(modelViewMatrix[0][0]*offset.x+modelViewMatrix[0][1]*offset.y,modelViewMatrix[2][0]*offset.x+modelViewMatrix[2][1]*offset.y)/scale;gl_Position=projectionMatrix*view;}`,
   fragmentShader:`uniform float uTime;varying vec2 vUv,vLocal;varying float vSeed;${noise}void main(){if(abs(vLocal.x)>.866||abs(vLocal.y)+abs(vLocal.x)*.57735>1.)discard;vec2 p=vUv*2.-1.;float n=fbm(vUv*4.+vSeed*37.+vec2(uTime*.11,-uTime*.08));float alpha=smoothstep(0.,.65,1.-length(p)+(n-.5)*.35)*.21;alpha*=smoothstep(0.,.1,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));vec3 color=mix(vec3(.29,.36,.40),vec3(.74,.79,.78),clamp(.4+p.y*.3+n*.5,0.,1.));gl_FragColor=vec4(color,alpha);\n#include <colorspace_fragment>}`});
  const puffs=new T.Mesh(g,material);puffs.frustumCulled=false;puffs.renderOrder=4;this.root.add(puffs);
 }
 private radar(color:number){
  // Local fragment coordinates are translated into the original scanning zone;
  // clipping each hex prevents geometry/echoes extending into hidden areas.
  const material=new T.ShaderMaterial({uniforms:{uTime:this.clock,uColor:{value:new T.Color(color)},uOffset:{value:new T.Vector2()},uRadius:{value:2.65}},transparent:true,depthWrite:false,side:T.DoubleSide,
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:`uniform float uTime,uRadius;uniform vec2 uOffset;uniform vec3 uColor;varying vec2 vUv;void main(){vec2 local=(vUv-.5)*2.;if(abs(local.x)>.866||abs(local.y)+abs(local.x)*.57735>1.)discard;vec2 p=(local+uOffset)/uRadius;float r=length(p);if(r>1.)discard;float angle=atan(p.y,p.x),a=mod(uTime*1.5-angle+6.283185,6.283185);float sweep=exp(-a*3.5);float rings=pow(.5+.5*cos(r*37.7),24.)*.15;float pulse=exp(-pow((r-fract(uTime*.45))/.035,2.))*.32;gl_FragColor=vec4(uColor,sweep*.32+rings+pulse);\n#include <colorspace_fragment>}`});
  const disk=new T.Mesh(new T.PlaneGeometry(2,2),material);disk.rotation.x=-Math.PI/2;disk.position.y=.035;this.root.add(disk);
 }
 radarOffset(x:number,z:number,radius:number){this.root.traverse(o=>{if(o instanceof T.Mesh&&o.material instanceof T.ShaderMaterial&&o.material.uniforms.uOffset){o.material.uniforms.uOffset.value.set(x,-z);o.material.uniforms.uRadius.value=radius;}});}
 private shields(color:number){
  const shape=new T.Shape();shape.moveTo(-.17,.22);shape.lineTo(.17,.22);shape.lineTo(.16,-.05);shape.quadraticCurveTo(.1,-.2,0,-.26);shape.quadraticCurveTo(-.1,-.2,-.16,-.05);shape.closePath();
  for(let i=0;i<5;i++){
   const panel=new T.Group(),face=new T.Mesh(new T.ShapeGeometry(shape),new T.MeshBasicMaterial({color,transparent:true,opacity:.13,depthWrite:false,side:T.DoubleSide})),outline=line(shape.getPoints(24).map(p=>v(p.x,p.y,0)),color,.55);
   panel.add(face,outline);this.root.add(panel);this.updates.push(t=>{const a=i/5*tau+t*.4;panel.position.set(Math.cos(a)*.78,.65+Math.sin(t*1.8+i)*.04,Math.sin(a)*.78);panel.rotation.y=Math.PI/2-a;face.material.opacity=.1+.04*Math.sin(t*2+i)**2;});
  }
  this.root.add(ring(.82,color,.22));
 }
 seek(time:number){this.clock.value=Number.isFinite(time)?time:0;for(const update of this.updates)update(this.clock.value);}
 dispose(){disposeVisual(this.root);this.updates=[];}
}
