import {test,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {TacticalModels} from '../src/scene/tactical-models.ts';
import {Units} from '../src/scene/units.ts';
import {AIRCRAFT} from '../src/ship-definitions.ts';
import type {MapModel,RenderPlane} from '../shared/render.ts';
import type {AirRole} from '../shared/game.ts';

// Canvas label painting is covered in the browser; keep real GLBs and Units here.
vi.mock('../src/scene/resources.ts',async original=>({...await original<typeof import('../src/scene/resources.ts')>(),label:()=>new THREE.Sprite(new THREE.SpriteMaterial())}));
const bytes=(name:string)=>{const b=readFileSync(new URL('../assets/models/'+name,import.meta.url));return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer;};

test('the battle renderer chooses all four models, animates every engine and releases removed aircraft',async()=>{
 const roles:AirRole[]=['fighter','bomber','scout','heavy'];
 const planes:RenderPlane[]=roles.map((role,i)=>({id:role,kind:'plane',team:0,mother:'cv',slot:i,hp:AIRCRAFT[role].hp,cfg:{...AIRCRAFT[role]},xy:{x:i*3,y:0},mode:'point',target:{q:8,r:8},targetId:null,tracking:false,state:'outbound',traveled:0,waypoints:[],angle:0}));
 const model:MapModel={cells:[],ships:[],planes,torpedoes:[],mines:[],myTeam:0,selected:'',phase:'plan',mode:'plane',previews:[],mainTargets:[],rays:[],showPlans:false,showRanges:false,overlayType:'',busy:false,airRange:null,visuals:{}};
 const library=await TacticalModels.fromBytes(bytes('aircraft.glb'),bytes('naval-mine.glb')),units=new Units(new THREE.Scene(),library);
 try{
  units.update(model);
  const pivots=roles.flatMap(role=>{
   const group=units.cache.get(`plane:${role}`)!;
   expect(group.userData.body.getObjectByName(`Aircraft_${role}`)).toBeDefined();
   expect(group.userData.propellers).toHaveLength(role==='heavy'?4:1);
   return group.userData.propellers!;
  });
  const before=pivots.map(o=>o.rotation.x);
  units.tick(.1,new THREE.PerspectiveCamera());
  pivots.forEach((o,i)=>expect(o.rotation.x-before[i]).toBeCloseTo(3.5));
  units.update(model);expect(units.root.children).toHaveLength(4);
  const mesh=units.cache.get('plane:heavy')!.getObjectByProperty('type','Mesh') as THREE.Mesh;
  const disposed=vi.spyOn(mesh.geometry,'dispose');
  units.update({...model,planes:planes.filter(p=>p.id!=='heavy')});
  expect(disposed).toHaveBeenCalledOnce();expect(units.cache.has('plane:heavy')).toBe(false);
 }finally{units.dispose();library.dispose();}
});

test('standard Mk 14 replaces the primitive torpedo and its two propellers seek with replay time',async()=>{
 const library=await TacticalModels.fromBytes(bytes('aircraft.glb'),bytes('naval-mine.glb'),bytes('torpedoes/mk14.glb'));
 const units=new Units(new THREE.Scene(),library),camera=new THREE.PerspectiveCamera();
 const torpedo={id:'standard',kind:'torpedo' as const,team:0,owner:'dd',xy:{x:0,y:0},heading:0,age:0,launched:1,birth:0,armed:true,cfg:{speed:4,damage:40,life:3,reserve:8,max:4}};
 const model:MapModel={cells:[],ships:[],planes:[],torpedoes:[torpedo],mines:[],myTeam:0,selected:'',phase:'plan',mode:'torp',previews:[],mainTargets:[],rays:[],showPlans:false,showRanges:false,overlayType:'',busy:true,airRange:null,visuals:{}};
 try{units.update(model);const group=units.cache.get('torpedo:standard')!;expect(group.getObjectByName('Torpedo_mk14')).toBeDefined();expect(group.userData.propellers).toHaveLength(2);
 units.tick(.1,camera,.25);const angles=group.userData.propellers!.map(p=>p.rotation.x);expect(angles[0]*angles[1]).toBeLessThan(0);units.tick(.1,camera,.8);units.tick(.1,camera,.25);expect(group.userData.propellers!.map(p=>p.rotation.x)).toEqual(angles);
 }finally{units.dispose();library.dispose();}
});
