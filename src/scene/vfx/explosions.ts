import * as THREE from 'three';

/** Deterministic visual particles shared by battle rendering and the art preview. */
export type ExplosionKind='artillery'|'torpedo'|'bomb';
export const EXPLOSION_STUDIES={
 artillery:{name:'火炮命中',english:'ARTILLERY IMPACT',duration:1.8,accent:'#efbd79',description:'短促亮核、放射碎片、少量烟尘',peak:.24},
 torpedo:{name:'鱼雷命中',english:'TORPEDO DETONATION',duration:3,accent:'#8ed9de',description:'白色水柱、扇状喷溅、扩散泡沫',peak:.64},
 bomb:{name:'飞机轰炸',english:'AERIAL BOMB IMPACT',duration:3.6,accent:'#ed987b',description:'分层火球、厚重烟团、余烬消散',peak:.52},
} as const;

function random(seed:number){let value=seed>>>0;return()=>{value+=0x6d2b79f5;let t=value;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const noise=`
 float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 float fbm(vec2 p){return .56*noise(p)+.28*noise(p*2.03+7.)+.12*noise(p*4.11-3.)+.04*noise(p*8.2);}
`;

interface Particle {origin:number[];velocity:number[];birth:number;life:number;start:number;end:number;aspect?:number;opacity?:number;rotation?:number;seed:number}
function instancedPlane(segments=1){
 const source=new THREE.PlaneGeometry(1,1,1,segments),geometry=new THREE.InstancedBufferGeometry();
 geometry.index=source.index?.clone()??null;
 for(const name of ['position','normal','uv'])geometry.setAttribute(name,source.getAttribute(name).clone());
 source.dispose();return geometry;
}
function attribute(g:THREE.InstancedBufferGeometry,name:string,values:number[],size:number){g.setAttribute(name,new THREE.InstancedBufferAttribute(new Float32Array(values),size));}

const particleVertex=`
 attribute vec3 aOrigin,aVelocity;attribute vec4 aTiming;attribute vec4 aShape;
 uniform float uTime,uGravity,uDrag;
 varying vec2 vUv;varying float vProgress,vAlive,vSeed,vOpacity,vHeight;
 void main(){
  float age=uTime-aTiming.x;float p=clamp(age/aTiming.y,0.,1.);
  vUv=uv;vProgress=p;vAlive=step(0.,age)*(1.-step(aTiming.y,age));vSeed=aShape.w;vOpacity=aShape.y;
  float travel=uDrag>0.001?(1.-exp(-uDrag*max(age,0.)))/uDrag:max(age,0.);
  vec3 center=aOrigin+aVelocity*travel;center.y-=.5*uGravity*max(age,0.)*max(age,0.);
  if(center.y<-.04)vAlive=0.;
  float size=mix(aTiming.z,aTiming.w,smoothstep(0.,1.,p));
  size*=length(modelViewMatrix[0].xyz);
  float angle=aShape.z+p*(vSeed-.5)*1.6;
  vec2 point=position.xy*vec2(1.,aShape.x)*size;
  point=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*point;
  vHeight=center.y+point.x*modelViewMatrix[1][0]+point.y*modelViewMatrix[1][1];
  vec4 viewCenter=modelViewMatrix*vec4(center,1.);viewCenter.xy+=point;
  gl_Position=projectionMatrix*viewCenter;
 }
`;
const particleFragment=`
 uniform float uTime,uStyle;varying vec2 vUv;varying float vProgress,vAlive,vSeed,vOpacity,vHeight;
 ${noise}
 void main(){
  if(vAlive<.5)discard;
  vec2 p=vUv*2.-1.;float d=length(p);
  float n=fbm(vUv*4.7+vSeed*31.+vec2(uTime*.21,-uTime*.37));
  float edge=1.-d+(n-.5)*.54;
  float alpha=smoothstep(0.,.29,edge)*smoothstep(0.,.10,vProgress)*(1.-smoothstep(.56,1.,vProgress))*vOpacity;
  vec3 color;
  if(uStyle<.5){
   float heat=clamp((1.-d)*.66+n*.63-vProgress*.35,0.,1.);
   color=mix(vec3(.36,.025,.006),vec3(1.,.27,.013),smoothstep(.12,.51,heat));
   color=mix(color,vec3(1.,.90,.34),smoothstep(.50,.82,heat));
   color=mix(color,vec3(1.,.98,.81),smoothstep(.78,.99,heat));
   alpha*=1.-smoothstep(.55,1.,vProgress);
  }else if(uStyle<1.5){
   float light=clamp(.53+p.y*.24-p.x*.16+n*.23,0.,1.);
   color=mix(vec3(.018,.024,.030),vec3(.16,.18,.19),light);
   color+=vec3(.13,.045,.008)*pow(1.-vProgress,3.);
   alpha*=.90;
  }else if(uStyle<2.5){
   float light=clamp(.66+p.y*.22-p.x*.1+n*.25,0.,1.);
   color=mix(vec3(.20,.43,.53),vec3(.96,.99,1.),light);
   alpha*=.80;
  }else if(uStyle<3.5){
   alpha=pow(max(0.,1.-d),1.3)*(1.-vProgress)*vOpacity;
   color=mix(vec3(1.,.18,.01),vec3(1.,.94,.56),pow(max(0.,1.-d),.4));
  }else if(uStyle<4.5){
   if(abs(p.x)>(1.-vUv.y)*.85||vUv.y<.12)discard;
   alpha=(1.-smoothstep(.65,1.,vProgress))*vOpacity;color=vec3(.10,.105,.095);
  }else{
   alpha=pow(max(0.,1.-d),.65)*(1.-smoothstep(.75,1.,vProgress))*vOpacity;
   color=mix(vec3(.39,.67,.77),vec3(.96,.99,1.),max(0.,1.-d));
  }
  alpha*=smoothstep(0.,.16,vHeight);
  alpha*=smoothstep(0.,.09,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));
  if(alpha<.008)discard;
  gl_FragColor=vec4(color,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }
`;

function particleBatch(particles:Particle[],style:number,clock:{value:number},gravity=0,drag=0){
 const geometry=instancedPlane();geometry.instanceCount=particles.length;
 attribute(geometry,'aOrigin',particles.flatMap(p=>p.origin),3);attribute(geometry,'aVelocity',particles.flatMap(p=>p.velocity),3);
 attribute(geometry,'aTiming',particles.flatMap(p=>[p.birth,p.life,p.start,p.end]),4);
 attribute(geometry,'aShape',particles.flatMap(p=>[p.aspect??1,p.opacity??1,p.rotation??0,p.seed]),4);
 const material=new THREE.ShaderMaterial({uniforms:{uTime:clock,uStyle:{value:style},uGravity:{value:gravity},uDrag:{value:drag}},vertexShader:particleVertex,fragmentShader:particleFragment,transparent:true,depthWrite:false,blending:style===3?THREE.AdditiveBlending:THREE.NormalBlending});
 const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.renderOrder=style===1?3:style===0?5:style===3?6:4;return mesh;
}

function jets(clock:{value:number},rng:()=>number){
 const g=instancedPlane(20),count=25;g.instanceCount=count;
 const velocities:number[]=[],parameters:number[]=[];
 for(let i=0;i<count;i++){
  const angle=i/count*Math.PI*2,spread=i<5?.3+rng()*.3:1.1+rng()*1.6;
  velocities.push(Math.cos(angle)*spread,4.6+rng()*2.5,Math.sin(angle)*spread);
  parameters.push(rng()*.07,.62+rng()*.24,.08+rng()*.10,rng());
 }
 attribute(g,'aVelocity',velocities,3);attribute(g,'aJet',parameters,4);
 const material=new THREE.ShaderMaterial({uniforms:{uTime:clock},transparent:true,depthWrite:false,side:THREE.DoubleSide,
 vertexShader:`attribute vec3 aVelocity;attribute vec4 aJet;uniform float uTime;varying vec2 vUv;varying float vLife,vSeed;
 void main(){float elapsed=uTime-aJet.x;float age=max(0.,elapsed-uv.y*min(max(elapsed,0.),aJet.y));vUv=uv;vSeed=aJet.w;vLife=step(0.,elapsed)*(1.-smoothstep(.55,1.20,elapsed));
 vec3 center=aVelocity*age;center.y=.04+aVelocity.y*age-3.5*age*age;if(center.y<0.)vLife=0.;
 vec4 p=modelViewMatrix*vec4(center,1.);p.x+=position.x*aJet.z*(.4+.6*uv.y)*(1.+age*.5);gl_Position=projectionMatrix*p;}`,
 fragmentShader:`uniform float uTime;varying vec2 vUv;varying float vLife,vSeed;${noise}
 void main(){float edge=1.-abs(vUv.x*2.-1.);float n=fbm(vec2(vUv.x*5.,vUv.y*13.-uTime*4.)+vSeed*21.);float a=smoothstep(.02,.7,edge+(n-.5)*.5)*vLife*(.35+.65*n);
 a*=smoothstep(0.,.11,vUv.y)*(1.-smoothstep(.87,1.,vUv.y));if(a<.01)discard;
 vec3 c=mix(vec3(.19,.42,.53),vec3(.96,.99,1.),clamp(.45+n*.55+edge*.2,0.,1.));gl_FragColor=vec4(c,a*.74);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const mesh=new THREE.Mesh(g,material);mesh.frustumCulled=false;mesh.renderOrder=2;return mesh;
}

function surfaceWave(clock:{value:number},start:number,duration:number,radius:number,color:THREE.ColorRepresentation,glow=false){
 const material=new THREE.ShaderMaterial({uniforms:{uTime:clock,uStart:{value:start},uDuration:{value:duration},uRadius:{value:radius},uColor:{value:new THREE.Color(color)},uGlow:{value:glow?1:0}},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float uTime,uStart,uDuration,uRadius,uGlow;uniform vec3 uColor;varying vec2 vUv;${noise}
 void main(){float p=(uTime-uStart)/uDuration;if(p<0.||p>1.)discard;vec2 q=(vUv-.5)*2.;float r=length(q);float target=.10+pow(p,.64)*.80;
 float n=fbm(q*14.+uTime*.25);float ring=exp(-pow((r-target)/(.012+.025*(1.-p)),2.));
 float a=ring*(.28+.72*n)*pow(1.-p,1.4)*.75;
 if(uGlow>.5)a=pow(max(0.,1.-r),3.)*pow(1.-p,3.)*.7;
 if(a<.004)discard;gl_FragColor=vec4(uColor,a);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`,transparent:true,depthWrite:false,blending:glow?THREE.AdditiveBlending:THREE.NormalBlending});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(radius*2,radius*2),material);mesh.rotation.x=-Math.PI/2;mesh.position.y=.025+start*.002;mesh.renderOrder=1;return mesh;
}

export class ExplosionStudy {
 readonly root=new THREE.Group();
 readonly clock={value:0};
 readonly duration:number;
 constructor(readonly kind:ExplosionKind,seed=7){
  this.duration=EXPLOSION_STUDIES[kind].duration;this.root.name=`ExplosionStudy_${kind}`;
  const rng=random(seed),make=(origin:number[],velocity:number[],birth:number,life:number,start:number,end:number,extra:Partial<Particle>={}):Particle=>({origin,velocity,birth,life,start,end,seed:rng(),rotation:rng()*Math.PI*2,...extra});
  const radial=(speed:number,up:number)=>{const a=rng()*Math.PI*2;return[Math.cos(a)*speed,up,Math.sin(a)*speed];};
  const add=(p:Particle[],style:number,gravity=0,drag=0)=>this.root.add(particleBatch(p,style,this.clock,gravity,drag));
  const isBomb=kind==='bomb';
  if(kind==='torpedo'){
   this.root.add(jets(this.clock,rng));
   add(Array.from({length:48},()=>make([0,.10,0],radial(.15+rng()*.55,.5+rng()*4.2),rng()*.16,1.3+rng()*.7,.18,.5+rng()*.5,{opacity:.78})),2,2,.35);
   add(Array.from({length:90},()=>make([0,.12,0],radial(.7+rng()*2.9,2.5+rng()*4.7),rng()*.16,1.3+rng()*1.3,.026+rng()*.04,.009,{aspect:1.8,opacity:.9})),5,7);
   add(Array.from({length:16},()=>make([0,.10,0],radial(.4+rng()*.8,.15+rng()*.25),.45+rng()*.45,1.2+rng()*.65,.35,.9,{opacity:.37})),2,0,.6);
   add([make([0,.09,0],[0,.15,0],.002,.16,.65,.3,{opacity:.5})],0);
   this.root.add(surfaceWave(this.clock,.03,2.5,3.2,0xbce3e7),surfaceWave(this.clock,.32,2.4,2.8,0xd5f0ef),surfaceWave(this.clock,.04,.35,1.5,0xb6e4ec,true));
  }else{
   add([make([0,.2,0],[0,.3,0],0,isBomb?.22:.16,isBomb?1.5:1.1,.15,{opacity:.95})],3);
   const count=isBomb?24:13;
   add(Array.from({length:count},(_,i)=>make([0,.13,0],radial((isBomb?1.4:.7)*(.3+rng()),(isBomb?1.2:.8)*(.3+rng())),rng()*(isBomb?.18:.07),isBomb?.7+rng()*.5:.35+rng()*.3,.28+rng()*.23,isBomb?1.2+rng()*1.0:.75+rng()*.65)),0,.3,2.2);
   add(Array.from({length:isBomb?28:13},()=>make([0,.16,0],radial((isBomb?.9:.6)*rng(),(isBomb?1.0:.65)+rng()*.65),(isBomb?.42:.32)+rng()*(isBomb?.45:.18),isBomb?2.0+rng()*.85:1.0+rng()*.4,.25,isBomb?1.0+rng()*1.2:.6+rng()*.5,{opacity:isBomb?.85:.65})),1,-.05,.8);
   add(Array.from({length:isBomb?58:44},()=>make([0,.14,0],radial(1+rng()*(isBomb?3:3.4),1+rng()*(isBomb?3.4:2.2)),rng()*.08,.3+rng()*(isBomb?1.1:.75),.025+rng()*.045,.008,{aspect:2+rng()*2})),3,5.8,.5);
   add(Array.from({length:isBomb?20:16},()=>make([0,.18,0],radial(.7+rng()*2,1.3+rng()*3),rng()*.06,.7+rng()*.65,.04+rng()*.055,.015)),4,7,.2);
   if(isBomb)add(Array.from({length:16},()=>make([0,.12,0],radial(.5+rng()*1.7,.6+rng()*1.3),.08+rng()*.09,1+rng()*.6,.1,.55,{opacity:.45})),2,2.4,.3);
   this.root.add(surfaceWave(this.clock,0,isBomb?.52:.32,isBomb?3.3:2.0,0xffa940,true),surfaceWave(this.clock,.04,isBomb?1.8:1.1,isBomb?3.3:2.2,0xb6d1d2));
  }
  this.seek(0);
 }
 seek(seconds:number){this.clock.value=Number.isFinite(seconds)?seconds:-1;this.root.visible=this.clock.value>=0&&this.clock.value<this.duration;}
 dispose(){const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();this.root.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.root.clear();this.root.removeFromParent();}
}
