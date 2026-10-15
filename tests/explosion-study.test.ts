import {test,expect,vi} from 'vitest';
import * as THREE from 'three';
import {ExplosionStudy,EXPLOSION_STUDIES} from '../src/scene/vfx/explosions.ts';

test('study effects can seek backwards exactly, remain bounded, and end without lingering particles',()=>{
 for(const kind of ['artillery','torpedo','bomb'] as const){
  const effect=new ExplosionStudy(kind,42);
  const objects:THREE.Object3D[]=[];effect.root.traverse(o=>objects.push(o));
  effect.seek(.42);effect.root.updateMatrixWorld(true);
  const before=objects.map(o=>({matrix:o.matrixWorld.toArray(),visible:o.visible}));
  effect.seek(EXPLOSION_STUDIES[kind].duration+.01);expect(effect.root.visible).toBe(false);
  effect.seek(.42);effect.root.updateMatrixWorld(true);
  expect(objects.map(o=>({matrix:o.matrixWorld.toArray(),visible:o.visible}))).toEqual(before);
  const count:number[]=[];effect.root.traverse(o=>count.push(o.id));expect(count).toEqual(objects.map(o=>o.id));
  effect.seek(-.01);expect(effect.root.visible).toBe(false);
  effect.dispose();expect(effect.root.children).toHaveLength(0);
 }
});

test('particle layouts are repeatable and geometry/material resources release once',()=>{
 const a=new ExplosionStudy('torpedo',19),b=new ExplosionStudy('torpedo',19);
 const layouts=(fx:ExplosionStudy)=>{const result:number[][]=[];fx.root.traverse(o=>{if(o instanceof THREE.Mesh&&o.geometry.getAttribute('aVelocity'))result.push(Array.from(o.geometry.getAttribute('aVelocity').array));});return result;};
 expect(layouts(a).length).toBeGreaterThan(0);expect(layouts(a)).toEqual(layouts(b));
 const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();a.root.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
 const spies=[...geometries,...materials].map(o=>vi.spyOn(o,'dispose'));
 a.dispose();spies.forEach(s=>expect(s).toHaveBeenCalledOnce());a.dispose();spies.forEach(s=>expect(s).toHaveBeenCalledOnce());b.dispose();
});
