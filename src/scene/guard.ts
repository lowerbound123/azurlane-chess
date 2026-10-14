import * as THREE from 'three';
import type {Hex} from '../../shared/game.ts';
import {add,key} from '../engine.ts';
import {vector,line} from './resources.ts';

/** Six ground cells and a light shield rim, used by planning and live replay. */
export function guardArea(at:Hex,color:number,visible:Set<string>){
 const group=new THREE.Group();group.name='GuardArea';
 for(let d=0;d<6;d++){
  const cell=add(at,d);if(!visible.has(key(cell)))continue;
  const center=vector(cell,.13);
  const points=Array.from({length:7},(_,i)=>new THREE.Vector3(center.x+.94*Math.cos(Math.PI/6+i*Math.PI/3),.13,center.z+.94*Math.sin(Math.PI/6+i*Math.PI/3)));
  group.add(line(points,color,.9));
  const fill=new THREE.Mesh(new THREE.CircleGeometry(.93,6),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.11,depthWrite:false,side:THREE.DoubleSide}));
  fill.rotation.x=-Math.PI/2;fill.rotation.z=Math.PI/6;fill.position.copy(center);group.add(fill);
 }
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.66,.015,4,48),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.85,depthWrite:false}));
 rim.rotation.x=Math.PI/2;rim.position.copy(vector(at,.5));group.add(rim);
 return group;
}
