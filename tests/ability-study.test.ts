import {test,expect,vi} from 'vitest';
import * as THREE from 'three';
import {AbilityStudy,ABILITY_STUDIES,SHIP_EFFECT_AUDIT} from '../src/dev/ability-studies/effect.ts';
import {SHIP_DEFINITIONS} from '../src/ship-definitions.ts';

test('every actual ship is audited and its presentation references existing studies',()=>{
 expect(Object.keys(SHIP_EFFECT_AUDIT).sort()).toEqual(Object.keys(SHIP_DEFINITIONS).sort());
 for(const ids of Object.values(SHIP_EFFECT_AUDIT))for(const id of ids)expect(ABILITY_STUDIES.some(s=>s.id===id)).toBe(true);
});
test('all studies rewind deterministically, remain finite and release owned resources once',()=>{
 for(const preset of ABILITY_STUDIES){
  const fx=new AbilityStudy(preset.id),nodes:THREE.Object3D[]=[];fx.root.traverse(o=>nodes.push(o));
  const sample=()=>nodes.map(o=>({p:o.position.toArray(),r:o.rotation.toArray(),s:o.scale.toArray(),visible:o.visible}));
  fx.seek(2.1);const initial=sample();fx.seek(5.9);fx.seek(2.1);expect(sample()).toEqual(initial);
  for(const t of [0,.2,1.5,3,5.5,7.99]){fx.seek(t);for(const n of nodes)expect([...n.position.toArray(),...n.scale.toArray()].every(Number.isFinite)).toBe(true);}
  fx.seek(preset.duration);expect(fx.root.visible).toBe(false);fx.seek(NaN);expect(fx.root.visible).toBe(false);
  const owned=new Set<THREE.BufferGeometry|THREE.Material>();fx.root.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line){owned.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])owned.add(m);}});
  const spies=[...owned].map(r=>vi.spyOn(r,'dispose'));fx.dispose();fx.dispose();spies.forEach(s=>expect(s).toHaveBeenCalledOnce());expect(fx.root.children).toHaveLength(0);
 }
});
