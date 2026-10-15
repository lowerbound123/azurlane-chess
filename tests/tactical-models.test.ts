import {test,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {TacticalModels} from '../src/scene/tactical-models.ts';
import {disposeTree} from '../src/scene/resources.ts';
import type {AirRole} from '../shared/game.ts';
const bytes=(name:string)=>{const data=readFileSync(new URL('../assets/models/'+name,import.meta.url));return data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength) as ArrayBuffer;};
test('Blender models have detailed meshes, a forward-facing aircraft and isolated disposable instances',async()=>{
 const library=await TacticalModels.fromBytes(bytes('aircraft.glb'),bytes('naval-mine.glb'));
 const a=library.create('aircraft'),b=library.create('aircraft'),mine=library.create('mine');
 const box=new THREE.Box3().setFromObject(a),size=box.getSize(new THREE.Vector3());
 expect(size.x).toBeGreaterThan(1.4);expect(size.z).toBeGreaterThan(1.3);
 expect(a.getObjectByName('Propeller')!.position.x).toBeGreaterThan(.6);
 let vertices=0;a.traverse(o=>{if(o instanceof THREE.Mesh)vertices+=o.geometry.attributes.position.count;});expect(vertices).toBeGreaterThan(1000);
 const first=a.getObjectByProperty('type','Mesh') as THREE.Mesh,second=b.getObjectByProperty('type','Mesh') as THREE.Mesh;
 expect(first.geometry).not.toBe(second.geometry);expect(first.material).not.toBe(second.material);
 disposeTree(a);expect(second.geometry.attributes.position.count).toBeGreaterThan(100);
 expect(new THREE.Box3().setFromObject(mine).getSize(new THREE.Vector3()).y).toBeGreaterThan(.65);
 disposeTree(b);disposeTree(mine);library.dispose();
});

test('each aircraft role selects an independent, centered model with its own silhouette and propeller pivots',async()=>{
 const library=await TacticalModels.fromBytes(bytes('aircraft.glb'),bytes('naval-mine.glb'));
 const roles:AirRole[]=['fighter','bomber','scout','heavy'];
 const instances=roles.map(role=>library.create('aircraft',role));
 try{
  const sizes=instances.map((instance,i)=>{
   expect(instance.name).toBe(`Aircraft_${roles[i]}`);
   const box=new THREE.Box3().setFromObject(instance,true),size=box.getSize(new THREE.Vector3());
   expect(Math.abs(box.getCenter(new THREE.Vector3()).z)).toBeLessThan(.02);
   expect(instance.position.length()).toBe(0);
   expect(size.x).toBeGreaterThan(1);expect(size.z).toBeGreaterThan(1);
   const props:THREE.Object3D[]=[];instance.traverse(o=>{if(o.userData.animatedPropeller)props.push(o);});
   expect(props).toHaveLength(roles[i]==='heavy'?4:1);
   expect(props.every(p=>p.position.x>0)).toBe(true);
   return size;
  });
  expect(new Set(sizes.map(s=>`${s.x.toFixed(2)}:${s.z.toFixed(2)}`)).size).toBe(4);
  expect(sizes[3].z).toBeGreaterThan(sizes[0].z*1.35);
  expect(sizes[2].z/sizes[2].x).toBeGreaterThan(sizes[0].z/sizes[0].x);
  const legacy=library.create('aircraft');expect(legacy.name).toBe('Aircraft_bomber');disposeTree(legacy);
 }finally{instances.forEach(disposeTree);library.dispose();}
});
