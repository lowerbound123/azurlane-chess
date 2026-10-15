import * as THREE from 'three';
import type {MapRegion} from '../../shared/render.ts';
import {vector,label} from './resources.ts';

/** Mission chart markings use only public cells, never unit or visibility data. */
export function createMissionRegion(region:MapRegion):THREE.Group {
 const group=new THREE.Group();group.userData.missionRegion=region.id;
 const color=region.kind==='exit'?0x70dfd5:region.kind==='enemy-exit'?0xf39179:region.kind==='control'?0xedc274:0xb7a3f1;
 const edges=new Map<string,[THREE.Vector3,THREE.Vector3]>();
 for(const cell of region.cells){
  const center=vector(cell,.23);
  const vertices=Array.from({length:6},(_,i)=>new THREE.Vector3(center.x+Math.cos(Math.PI/6+i*Math.PI/3),.23,center.z+Math.sin(Math.PI/6+i*Math.PI/3)));
  for(let i=0;i<6;i++){
   const a=vertices[i],b=vertices[(i+1)%6];
   const stamp=[`${a.x.toFixed(5)},${a.z.toFixed(5)}`,`${b.x.toFixed(5)},${b.z.toFixed(5)}`].sort().join('|');
   if(edges.has(stamp))edges.delete(stamp);else edges.set(stamp,[a,b]);
  }
 }
 group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([...edges.values()].flat()),new THREE.LineBasicMaterial({color,transparent:true,opacity:.85,depthWrite:false})));
 if(region.cells.length){
  const tag=label(region.label,{width:3.6,height:.52,color:`#${color.toString(16).padStart(6,'0')}`});
  const positions=region.cells.map(c=>vector(c,.7)),center=positions.reduce((sum,p)=>sum.add(p),new THREE.Vector3()).divideScalar(positions.length);
  tag.position.copy(center);group.add(tag);
 }
 return group;
}
