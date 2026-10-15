// @vitest-environment happy-dom
import {test,expect,vi} from 'vitest';
import fs from 'node:fs';
import * as THREE from 'three';
import {parseSkeleton} from '../src/vendor/parse.mjs';
import {animationFor,characterConfig} from '../src/characters/config.ts';
import {ShipCharacter,type CharacterAsset} from '../src/characters/spine.ts';
import * as E from '../src/engine.ts';
import type {Game} from '../shared/game.ts';
import {playerResult,playerView} from '../server/views.ts';
import {interpolateFrame} from '../src/playback.ts';

test('all official actors use stand, attack, attack_left, yun, dead and settlement loops',()=>{
 for(const [id,profile]of Object.entries(characterConfig.profiles)){
  if(id==='sailor')continue;
  const {data}=parseSkeleton(fs.readFileSync('public/'+profile.skeleton),fs.readFileSync('public/'+profile.atlas,'utf8'));
  for(const [action,name]of Object.entries({idle:'stand',fire:'attack',mainFire:'attack_left',aircraft:'attack',hit:'yun',dead:'dead',dance:'dance',yun:'yun'}))expect(animationFor(data,profile,action),id+':'+action).toBe(name);
 }
});
function battle(hp:number){const a=E.createShip('bb',0,0,{q:3,r:5}),b=E.createShip('dd',1,0,{q:5,r:5});for(const s of [a,b]){delete s.cfg.secondary;delete s.cfg.aa;}b.hp=hp;const game:Game={seed:1,round:1,map:{width:E.W,height:E.H,islands:[],mines:[]},ships:[a,b],torpedoes:[],planes:[],nextId:0,log:[],winner:null,phase:'plan',explored:[[],[]]};return {a,b,game};}
test('battleship main fire has a distinct action and fatal damage emits dead without hit',()=>{
 const {a,b,game}=battle(1),result=E.resolveRound(game,{[a.id]:{...E.emptyPlan(),main:[b.pos]}});
 expect(result.presentation.some(p=>p.type==='action'&&p.shipId===a.id&&p.action==='mainFire')).toBe(true);
 expect(result.presentation.filter(p=>p.type==='action'&&p.shipId===b.id).map(p=>p.action)).toEqual(['dead']);
 const death=result.presentation.find(p=>p.type==='action'&&p.action==='dead')!;
 const snapshots=result.frames.filter(f=>f.t>=death.time!&&f.t<death.time!+3);
 expect(snapshots.length).toBeGreaterThan(10);expect(snapshots.every(f=>f.ships.some(s=>s.id===b.id&&s.hp===0&&s.xy.x===b.xy.x&&s.xy.y===b.xy.y))).toBe(true);
 expect(result.frames.at(-1)!.t).toBeGreaterThanOrEqual(death.time!+3);
 const wire=playerResult(game,result,0);expect(wire.frames.some(f=>f.visuals.actions.some(a=>a.action==='dead'))).toBe(true);expect(wire.frames.at(-1)!.t).toBe(result.frames.at(-1)!.t);
});
test('nonfatal damage uses hit, secondary fire still uses fire',()=>{
 const {a,b,game}=battle(100);a.cfg.secondary={range:3,damage:1,multi:false};const result=E.resolveRound(game,{});
 expect(result.presentation.some(p=>p.type==='action'&&p.shipId===a.id&&p.action==='fire')).toBe(true);
 expect(result.presentation.some(p=>p.type==='action'&&p.shipId===b.id&&p.action==='hit')).toBe(true);expect(result.presentation.some(p=>p.action==='dead')).toBe(false);
});
test('death snapshots do not interpolate a hull away from its death position',()=>{
 const from={t:0,ships:[{id:'x',hp:0,xy:{x:2,y:3}}],planes:[],torpedoes:[]},to={...from,t:1,ships:[{id:'x',hp:0,xy:{x:9,y:10}}]};
 expect(interpolateFrame(from,to,.5).ships[0].xy).toEqual({x:2,y:3});
});
test('ended online view includes all participants only after the match is over',()=>{
 const {game,b}=battle(0);b.xy=E.hexToXY({q:20,r:12});b.pos={q:20,r:12};expect(playerView(game,0).ships.some(s=>s.id===b.id)).toBe(false);
 game.phase='ended';game.winner=0;expect(playerView(game,0).ships.some(s=>s.id===b.id)).toBe(true);
});
test('dead does not queue idle, holds final pose, and victory dance loops',async()=>{
 const queue=vi.fn(),set=vi.fn((..._args:any[])=>({trackTime:0}));let current={trackTime:0};
 const data={animations:[{name:'stand',duration:1},{name:'dead',duration:1},{name:'dance',duration:1},{name:'yun',duration:1}],findAnimation(name:string){return this.animations.find(a=>a.name===name);},findSkin(){return null;}};
 class Mesh extends THREE.Group{state={data:{defaultMix:0},setAnimation:(...args:any[])=>{set(...args);current={trackTime:0};return current;},getCurrent:()=>current,addAnimation:queue};skeleton={data,setSlotsToSetupPose(){},setSkinByName(){},getBoundsRect(){return{x:0,y:0,width:1,height:1}}};update(){}dispose(){}}
 const actor=new ShipCharacter({load:async()=>({data,spine:{SkeletonMesh:Mesh},manager:{dispose(){}}} as unknown as CharacterAsset)},'dd',0xffffff);await actor.ready;queue.mockClear();
 actor.setAction('dead','death',0,true);expect(queue).not.toHaveBeenCalled();actor.seek(2);expect(current.trackTime).toBe(1);
 actor.setAction('dance',null,0,true);expect(set.mock.lastCall).toEqual([0,'dance',true]);actor.setAction('dead',null,0,true);for(let i=0;i<40;i++){actor.setAction('dead',null,0);actor.tick(.05,new THREE.Camera());}expect(actor.age).toBeGreaterThan(1.8);expect(actor.mesh!.visible).toBe(false);actor.dispose();
});

test('delayed secondary salvo emits fire for the carrier of advanceSalvo',()=>{
 const s=E.createShip('ca',0,0,{q:3,r:5}),target=E.createShip('dd',1,0,{q:5,r:5});s.cfg.secondary={damage:10,range:3,multi:false,advanceSalvo:true};delete target.cfg.secondary;delete target.cfg.aa;
 const g:Game={seed:1,round:1,map:{width:E.W,height:E.H,islands:[],mines:[]},ships:[s,target],torpedoes:[],planes:[],nextId:0,log:[],winner:null,phase:'plan',explored:[[],[]]};
 const result=E.resolveRound(g,{});expect(result.presentation.some(p=>p.type==='action'&&p.shipId===s.id&&p.action==='fire')).toBe(true);
});

test('sampled death advances Spine mixing as well as track time, reaching the actual dead pose',async()=>{
 const {default:core}=await import('../src/vendor/spine38/core.mjs'),profile=characterConfig.profiles.z35;
 const {data}=parseSkeleton(fs.readFileSync('public/'+profile.skeleton),fs.readFileSync('public/'+profile.atlas,'utf8'));
 class Mesh extends THREE.Group{state=new core.AnimationState(new core.AnimationStateData(data));skeleton=Object.assign(new core.Skeleton(data),{getBoundsRect:()=>({x:0,y:0,width:1,height:1})});update(dt:number){this.state.update(dt);this.state.apply(this.skeleton);this.skeleton.updateWorldTransform();}dispose(){}}
 const actor=new ShipCharacter({load:async()=>({data,spine:{SkeletonMesh:Mesh},manager:{dispose(){}}} as unknown as CharacterAsset)},'dd',0xffffff,profile);await actor.ready;actor.setAction('dead','death',0);actor.seek(.5);
 const reference=new core.Skeleton(data),state=new core.AnimationState(new core.AnimationStateData(data));state.setAnimation(0,'dead',false);state.update(.5);state.apply(reference);reference.updateWorldTransform();
 const poses=(s:any)=>s.bones.map((b:any)=>[b.x,b.y,b.rotation].map(n=>Math.round(n*1000)/1000));expect(poses((actor.mesh as unknown as Mesh).skeleton)).toEqual(poses(reference));actor.dispose();
});
