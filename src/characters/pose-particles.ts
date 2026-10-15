import * as THREE from 'three';
/** Samples the actual final Spine triangles and their atlas UVs; textures stay owned by the library. */
export class PoseParticles {
 readonly root=new THREE.Group();
 private materials:THREE.ShaderMaterial[]=[];
 constructor(source:THREE.Object3D){
  source.updateMatrix();this.root.position.copy(source.position);this.root.quaternion.copy(source.quaternion);this.root.scale.copy(source.scale);
  const batches:THREE.Mesh[]=[];source.traverse(o=>{if(o instanceof THREE.Mesh&&o.visible&&o.geometry.drawRange.count>0)batches.push(o);});
  let seed=731;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(const mesh of batches){
   const g=mesh.geometry,index=g.index,p=g.getAttribute('position'),uv=g.getAttribute('uv'),color=g.getAttribute('color');
   const original=Array.isArray(mesh.material)?mesh.material[0]:mesh.material;
   const texture=original instanceof THREE.ShaderMaterial?original.uniforms.map?.value:(original as THREE.MeshBasicMaterial).map;
   if(!index||!p||!uv||!texture)continue;
   const triangles:{ids:number[];area:number}[]=[];let total=0;const end=Math.min(index.count,g.drawRange.start+g.drawRange.count);
   for(let i=g.drawRange.start;i+2<end;i+=3){const ids=[index.getX(i),index.getX(i+1),index.getX(i+2)];const [a,b,c]=ids.map(k=>new THREE.Vector3(p.getX(k),p.getY(k),p.getZ(k)));const area=b.sub(a).cross(c.sub(a)).length()/2;if(area>0){total+=area;triangles.push({ids,area});}}
   if(!total)continue;
   const positions:number[]=[],uvs:number[]=[],colors:number[]=[],drift:number[]=[];const bounds=new THREE.Box3().setFromBufferAttribute(p as THREE.BufferAttribute),height=Math.max(1,bounds.max.y-bounds.min.y);
   const budget=Math.max(600,Math.floor(10000/batches.length));
   for(const triangle of triangles){const count=Math.max(1,Math.round(budget*triangle.area/total));for(let n=0;n<count;n++){
    const r=Math.sqrt(random()),b=random(),weights=[1-r,r*(1-b),r*b];
    for(const axis of ['getX','getY','getZ'] as const)positions.push(triangle.ids.reduce((sum,k,j)=>sum+p[axis](k)*weights[j],0));
    uvs.push(triangle.ids.reduce((s,k,j)=>s+uv.getX(k)*weights[j],0),triangle.ids.reduce((s,k,j)=>s+uv.getY(k)*weights[j],0));
    for(const axis of ['getX','getY','getZ','getW'] as const)colors.push(color?triangle.ids.reduce((sum,k,j)=>sum+color[axis](k)*weights[j],0):1);
    drift.push((random()-.28)*height*.65,(.25+random()*.65)*height,(random()-.5)*height*.1,random());
   }}
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('sourceUV',new THREE.Float32BufferAttribute(uvs,2));geometry.setAttribute('sourceColor',new THREE.Float32BufferAttribute(colors,4));geometry.setAttribute('drift',new THREE.Float32BufferAttribute(drift,4));
   const material=new THREE.ShaderMaterial({uniforms:{map:{value:texture},progress:{value:0}},transparent:true,depthWrite:false,premultipliedAlpha:true,
    vertexShader:'attribute vec2 sourceUV; attribute vec4 sourceColor; attribute vec4 drift; uniform float progress; varying vec2 vUv; varying vec4 vColor; varying float fade; void main(){vUv=sourceUV;vColor=sourceColor;float t=max(0.0,progress-drift.w*0.16);fade=1.0-smoothstep(0.2,1.0,t);vec3 pos=position+drift.xyz*t*t;gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);gl_PointSize=2.8*(1.0-progress*0.45);}',
    fragmentShader:'uniform sampler2D map; varying vec2 vUv; varying vec4 vColor; varying float fade; void main(){vec4 c=texture2D(map,vUv)*vec4(vColor.rgb*vColor.a,vColor.a);if(c.a<0.08)discard;float edge=1.0-smoothstep(0.35,0.5,length(gl_PointCoord-0.5));gl_FragColor=c*fade*edge;}'
   });material.blending=original.blending;const points=new THREE.Points(geometry,material);points.frustumCulled=false;points.renderOrder=mesh.renderOrder;this.root.add(points);this.materials.push(material);
  }
 }
 seek(progress:number){const p=THREE.MathUtils.clamp(progress,0,1);this.root.visible=p<1;for(const m of this.materials)m.uniforms.progress.value=p;}
 dispose(){this.root.traverse(o=>{if(o instanceof THREE.Points)o.geometry.dispose();});for(const m of this.materials)m.dispose();this.materials=[];this.root.removeFromParent();this.root.clear();}
}
