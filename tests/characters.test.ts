import type {Game,Presentation} from '../shared/game.ts';
// @vitest-environment happy-dom
import core from '../src/vendor/spine38/core.mjs';
import {parseSkeleton} from '../src/vendor/parse.mjs';

import {runtimeAssets} from '../src/assets/runtime.ts';
import type {CharacterAsset} from '../src/characters/spine.ts';
import type {CharacterProfile} from '../src/characters/config.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const {Skeleton,AnimationState,AnimationStateData}=core;
import { animationFor, characterConfig, profileFor } from '../src/characters/config.ts';
import { sampleBattleVisuals } from '../src/battle-visuals.ts';
import { playerResult } from '../server/views.ts';
import * as E from '../src/engine.ts';
function loadDefault(){return parseSkeleton(fs.readFileSync('public/characters/default/sailor.json'),fs.readFileSync('public/characters/default/sailor.atlas','utf8'),undefined,'json').data;}
test('default Spine asset parses and every mapped animation changes bone poses',()=>{
 const data=loadDefault(), profile=profileFor('unknown');
 assert(data!.version!.startsWith('3.8.'));assert(data.findSkin(profile.skin!));
 for(const name of new Set(Object.values(profile.animations))){
  const skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));
  state.setAnimation(0,name,true);state.update(.17);state.apply(skeleton);skeleton.updateWorldTransform();
  assert(skeleton.bones.every((b:any)=>[b.worldX,b.worldY,b.rotation].every(Number.isFinite)),name);
  assert(skeleton.bones.some((b:any)=>b.rotation!==b.data.rotation || b.y!==b.data.y || b.x!==b.data.x),name);
 }
 assert.equal(animationFor(data,{animations:{unknown:'missing',idle:'idle'}},'unknown'),'stand');
 assert.equal(profile,characterConfig.profiles.sailor);
});
test('actions never expose hidden enemy origin, target or private IDs',()=>{
 const events:Presentation[]=[{id:'secret',type:'action',shipId:'enemy',team:1,at:{q:8,r:8},action:'fire',time:0,duration:.65}];
 assert.deepEqual(sampleBattleVisuals(events,.2,new Set(['0,0']),0).actions,[]);
 const shown=sampleBattleVisuals(events,.2,new Set(['8,8']),0).actions[0];
 assert.deepEqual(Object.keys(shown).sort(),['action','age','id','shipId']);
 assert.equal(sampleBattleVisuals(events,.8,new Set(['8,8']),0).actions.length,0);
});
test('engine emits mainFire, torpedo and friendly hit actions, online frames keep only visible actors',()=>{
 const a=E.createShip('bb',0,0,{q:3,r:5}),b=E.createShip('dd',0,1,{q:5,r:5}),c=E.createShip('dd',1,0,{q:17,r:12});
 for(const s of [a,b,c]){delete s.cfg.secondary;delete s.cfg.aa;}
 const game:Game={seed:1,round:1,map:{width:E.W,height:E.H,islands:[],mines:[]},ships:[a,b,c],torpedoes:[],planes:[],nextId:0,log:[],winner:null,phase:'plan',explored:[[],[]]};
 const result=E.resolveRound(game,{[a.id]:{...E.emptyPlan(),main:[b.pos]},[b.id]:{...E.emptyPlan(),torps:[{window:0,dir:1}]},[c.id]:{...E.emptyPlan(),torps:[{window:0,dir:1}]}});
 const actions=result.presentation.filter(e=>e.type==='action');
 for(const action of ['mainFire','torpedo','hit'])assert(actions.some(e=>e.action===action),action);
 const view=playerResult(game,result,0);
 for(const frame of view.frames)for(const action of frame.visuals.actions){assert(frame.ships.some(s=>s.id===action.shipId));assert.match(action.id,/^a\d+$/);assert.notEqual(action.shipId,c.id);}
});

test('late asset completion cannot resurrect a disposed character',async()=>{
 const {ShipCharacter}=await import('../src/characters/spine.ts');
 let resolve!:(asset:CharacterAsset)=>void;const library={load:()=>new Promise<CharacterAsset>(done=>{resolve=done;})};
 const actor=new ShipCharacter(library,'dd',0xffffff);actor.dispose();resolve({spine:{SkeletonMesh:class {} as any},manager:{dispose(){}},data:loadDefault()});await actor.ready;
 assert.equal(actor.root.children.length,0);assert.equal(actor.mesh,undefined);
});
test('missing custom asset requests the default and still leaves a usable fallback if both fail',async()=>{
 const {ShipCharacter}=await import('../src/characters/spine.ts');
 const config=characterConfig;config.profiles.missing={...config.profiles.sailor,skeleton:'missing.json',atlas:'missing.atlas'};config.templates.dd='missing';
 const requests:CharacterProfile[]=[],warning=console.warn;console.warn=()=>{};
 try {const actor=new ShipCharacter({load:p=>{requests.push(p);return Promise.reject(new Error('not found'));}},'dd',0xffffff);await actor.ready;
 assert.deepEqual(requests,[config.profiles.missing,config.profiles.sailor]);assert.equal(actor.fallback.visible,true);assert.equal(actor.fallback.children.length,2);actor.dispose();
 }finally{console.warn=warning;delete config.templates.dd;delete config.profiles.missing;}
});
test('online action pose age advances with replay interpolation, rather than wall clock speed',async()=>{
 const {interpolateFrame}=await import('../src/playback.ts');
 const from={t:.2,ships:[],planes:[],torpedoes:[],visuals:{actions:[{shipId:'0-0',id:'a0',action:'fire',age:.2}]}},to={...from,t:.3};
 assert.equal(interpolateFrame!(from,to,.5).visuals!.actions[0].age,.25);assert.equal(from.visuals.actions[0].age,.2);
});

test('loaded default character assets release textures once when leaving the scene',async()=>{
 const {CharacterLibrary}=await import('../src/characters/spine.ts');
 const requests:string[]=[],originalFetch=globalThis.fetch,OriginalImage=globalThis.Image;
 const originalCreate=URL.createObjectURL,originalRevoke=URL.revokeObjectURL;
 globalThis.fetch=async(input)=>{const url=String(input);requests.push(url);if(url==='/api/config')return Response.json({assetStorage:{provider:'local'}});return new Response(fs.readFileSync(new URL('../assets/runtime/files'+url,import.meta.url)));};
 globalThis.Image=class {width=256;height=256;onload=()=>{};set src(_url:string){queueMicrotask(()=>this.onload());}} as any;
 URL.createObjectURL=()=> 'blob:fixture';URL.revokeObjectURL=()=>{};
 try {
  const library=new CharacterLibrary(),asset=await library.load(characterConfig.profiles.sailor);
  const paths=['/api/config',...['characters/default/sailor.atlas','characters/default/sailor.json','characters/default/sailor.webp'].map(id=>'/'+runtimeAssets.files[id].path)];
  assert.deepEqual(requests.sort(),paths.sort());
  const mesh=new asset.spine.SkeletonMesh({skeletonData:asset.data});mesh.update(0);
  let disposals=0;const textures=new Set<any>();mesh.traverse((object:any)=>{for(const material of Array.isArray(object.material)?object.material:[object.material])if(material?.uniforms?.map?.value)textures.add(material.uniforms.map.value);});
  assert.ok(textures.size>0);for(const texture of textures)texture.addEventListener('dispose',()=>disposals++);
  asset.manager.dispose();assert.equal(disposals,textures.size);
  library.dispose();await new Promise(resolve=>setImmediate(resolve));assert.equal(disposals,textures.size);mesh.dispose();
 }finally{globalThis.fetch=originalFetch;globalThis.Image=OriginalImage;URL.createObjectURL=originalCreate;URL.revokeObjectURL=originalRevoke;}
});
