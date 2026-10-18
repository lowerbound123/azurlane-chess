import {expect,test} from 'vitest';
import {battleAudioEvents,musicForPage,type AudioShip,type AudioRound} from '../src/audio/events.ts';
import type {Presentation,Plan} from '../shared/game.ts';
import {createFleetGame,createCatalogShip,emptyPlan,resolveRound} from '../src/engine.ts';
import {sampleBattleVisuals} from '../src/battle-visuals.ts';

const ship=(id:string,team:number,template:AudioShip['template'],hp=10):AudioShip=>({id,team,template,hp});
const action=(id:string,unit:AudioShip,action:string,time:number):Presentation=>({id,type:'action',shipId:unit.id,team:unit.team,at:{q:0,r:0},action,time,duration:.65});
function round(ships:AudioShip[],presentation:Presentation[]):AudioRound{return {game:{ships},presentation,frames:[{t:0,ships,visible:['0,0']},{t:1,ships,visible:['0,0']}]};}

test('only own BB main fire, carrier launches and frontline abilities trigger skill; simultaneous salvos speak once',()=>{
 const bb=ship('bb',1,'bb'),cv=ship('cv',1,'cv'),dd=ship('dd',1,'dd'),enemy=ship('enemy',0,'bb');
 const ships=[bb,cv,dd,enemy];
 const result=round(ships,[action('a',bb,'mainFire',0),action('b',bb,'fire',.1),action('c',cv,'aircraft',0),action('d',cv,'aircraft',0),action('e',dd,'torpedo',.3),action('f',dd,'torpedo',.3),action('g',dd,'guard',.5),action('h',dd,'skill',.7),action('i',enemy,'mainFire',0)]);
 expect(battleAudioEvents(result,ships,1).filter(event=>event.channel==='voice').map(event=>[event.ship.id,event.action,event.time])).toEqual([
  ['bb','skill',0],['cv','skill',0],['dd','skill',.3],['dd','skill',.5],['dd','skill',.7],
 ]);
});

test('lose follows an actual own HP transition to zero and never repeats an already sunk ship',()=>{
 const living=ship('living',0,'cl'),dead=ship('old',0,'dd',0),enemy=ship('enemy',1,'cv');
 const initial=[living,dead,enemy],after=[{...living,hp:0},dead,{...enemy,hp:0}];
 const result=round(after,[]);result.frames=[{t:0,ships:initial,visible:[]},{t:.4,ships:after,visible:[]},{t:.5,ships:after,visible:[]}];
 expect(battleAudioEvents(result,initial,0).filter(e=>e.channel==='voice')).toMatchObject([{ship:{id:'living'},action:'lose',time:.4}]);
});

test('projected online actions use actor ownership and stable IDs; effects stay on the server-visible timeline',()=>{
 const own=ship('own',1,'cv'),foe=ship('foe',0,'bb'),ships=[own,foe];
 const visuals={projectiles:[],actions:[{id:'a0',shipId:'own',action:'aircraft',age:.2},{id:'a1',shipId:'foe',action:'mainFire',age:.2}],effects:[{id:'e0',kind:'main',at:{q:0,r:0},text:'',age:.5,duration:.6}]};
 const result=round(ships,[]);result.frames=[{t:.2,ships,visible:[],visuals},{t:.3,ships,visible:[],visuals:{...visuals,actions:visuals.actions.map(a=>({...a,age:.3})),effects:visuals.effects.map(e=>({...e,age:2/3}))}}];
 const events=battleAudioEvents(result,ships,1);
 expect(events.filter(e=>e.channel==='voice')).toHaveLength(1);
 expect(events.filter(e=>e.channel==='voice')[0]).toMatchObject({ship:{id:'own'},action:'skill'});
 expect(events.filter(e=>e.channel==='effect'&&e.cue==='battle-boom1')).toHaveLength(1);
});

test('online sounds never reveal an enemy action before its first visible snapshot',()=>{
 const own=ship('own',0,'dd'),foe=ship('foe',1,'bb'),ships=[own,foe];
 const result=round(ships,[]);result.frames=[{t:0,ships:[own],visible:[]},{t:.4,ships,visible:['0,0'],visuals:{projectiles:[],actions:[{id:'late-gun',shipId:foe.id,action:'mainFire',age:.4}],effects:[{id:'late-blast',kind:'main',at:{q:0,r:0},text:'',age:.5,duration:.6}]}}];
 expect(battleAudioEvents(result,[own],0).filter(e=>e.channel==='effect').map(e=>e.time)).toEqual([.4,.4]);
});

test('local hidden enemy fire and explosions are silent while visible impacts remain audible',()=>{
 const foe=ship('foe',1,'bb'),ships=[ship('own',0,'dd'),foe];
 const result=round(ships,[{...action('a',foe,'mainFire',0),at:{q:8,r:8}},{id:'b',type:'effect',team:1,kind:'main',at:{q:8,r:8},time:.5,duration:.6},{id:'c',type:'effect',team:1,kind:'torpedo',at:{q:0,r:0},time:.6,duration:.6}]);
 const events=battleAudioEvents(result,ships,0);
 expect(events.filter(e=>e.channel==='effect').map(e=>e.cue)).toEqual(['battle-torpedo-hit']);
});

test('music follows page purpose and changes to calm music after a battle ends',()=>{
 expect(['home','new','fleet','ai-fleet','history','lessons','saves','book','online','battle'].map(screen=>musicForPage(screen))).toEqual(['main-menu','stage-select','fleet-assembly','fleet-assembly','campaign','port','archive','archive','port','combat']);
 expect(musicForPage('battle',true)).toBe('port');expect(musicForPage('battle',false,true)).toBe('campaign');
 expect(musicForPage('online',false,false,true)).toBe('fleet-assembly');
});

test.each([
 ['dd-1','mine',{moves:[{turn:0,forward:true}],mineSteps:[1]}],
 ['dd-3','smoke',{smoke:true}],
 ['cl-3','radar',{radar:{q:2,r:7}}],
 ['ca-2','escort',{escort:true}],
] satisfies [string,string,Partial<Plan>][])('real %s ability emits an audio marker preserved in projected frames',(_catalogId,ability,patch)=>{
 const game=createFleetGame();game.phase='plan';game.map.islands=[];game.map.mines=[];
 game.ships=[createCatalogShip(_catalogId,0,0,{q:0,r:7}),createCatalogShip('bb-1',1,0,{q:12,r:7})];
 game.ships.forEach(s=>delete s.cfg.secondary);
 const order={...emptyPlan(),...structuredClone(patch)};
 const result=resolveRound(game,{[game.ships[0].id]:order});
 const marker=result.presentation.find(event=>event.type==='action'&&event.action===ability)!;
 expect(marker).toMatchObject({type:'action',shipId:game.ships[0].id,soundOnly:true});
 const voices=battleAudioEvents(result,game.ships,0).filter(event=>event.channel==='voice');
 expect(voices).toMatchObject([{ship:{id:game.ships[0].id},action:'skill',time:marker.time}]);
 const projected=sampleBattleVisuals(result.presentation,marker.time,new Set(),0);
 expect(projected.actions.find(event=>event.action===ability)?.soundOnly).toBe(true);
});
