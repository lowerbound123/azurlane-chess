import {test,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {TacticalModels} from '../src/scene/tactical-models.ts';
import {disposeTree} from '../src/scene/resources.ts';
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
