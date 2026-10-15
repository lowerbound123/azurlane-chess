import {test,expect} from 'vitest';
import * as E from '../src/engine.ts';
import * as P from '../src/planning.ts';
import {applyStatus,applyBattleStatus,type StatusDefinition} from '../shared/status.ts';
import {playerView,playerResult,validateOrders} from '../server/views.ts';
import {planeFixture} from './helpers/game-fixtures.ts';
import {createSave,serializeSave,deserializeSave} from '../src/save.ts';
import {createDominationState} from '../shared/domination.ts';
import {initializeMatchStats,accumulateRoundStats} from '../server/match-records.ts';
import {contracts,parseContract} from '../shared/contracts.ts';
import {materializeResult} from '../shared/network.ts';
const definition=(id:string,effects:StatusDefinition['effects']):StatusDefinition=>({id,name:id,description:'测试状态',kind:'buff',icon:'up',effects});
function battle(){const g=E.createFleetGame();g.phase='plan';g.map.islands=[];g.map.mines=[];g.ships.forEach(s=>{delete s.cfg.secondary;delete s.cfg.aa;});return g;}
test('speed status agrees between path, previews, server orders, actual movement and save validation',()=>{
 const g=battle(),s=g.ships[0];g.round=5;s.pos={q:0,r:7};s.xy=E.hexToXY(s.pos);s.heading=0;
 g.ships.slice(1).forEach((x,i)=>{x.pos=E.fromCR(i+1,13);x.xy=E.hexToXY(x.pos);});
 applyStatus(s,definition('speed',[{kind:'speed',value:1}]),{round:5,duration:1});
 const p={...E.emptyPlan(),moves:Array.from({length:5},()=>({turn:0,forward:true}))};
 expect(E.route(s,p,g.map,g.round)).toHaveLength(6);expect(P.reachable(s,E.emptyPlan(),g.map,null,g.round).get('5,7')?.cost).toBe(5);
 expect(validateOrders(g,0,{[s.id]:p})[s.id].moves).toHaveLength(5);
 const result=E.resolveRound(g,{[s.id]:p});expect(result.game.ships[0].pos).toEqual({q:5,r:7});expect(result.game.ships[0].statuses).toBeUndefined();expect(s.cfg.speed).toBe(4);
 const state={game:g,roster:['dd','cl','ca','bb','cv'],seed:g.seed,selected:s.id,plans:{[s.id]:p}};
 expect(deserializeSave(serializeSave(createSave(state))).state.game.ships[0].statuses).toEqual(s.statuses);
 expect(()=>validateOrders(g,0,{[s.id]:{statuses:s.statuses}})).toThrow();
});
test('status outgoing then existing defense then incoming modify shell damage',()=>{
 const g=battle();g.ships=[E.createCatalogShip('bb-1',0,0,{q:0,r:7}),E.createCatalogShip('ca-1',1,0,{q:7,r:7})];g.ships.forEach(s=>delete s.cfg.secondary);
 applyStatus(g.ships[0],definition('attack',[{kind:'outgoingDamage',value:1}]),{round:1,duration:1});
 applyStatus(g.ships[1],definition('defense',[{kind:'incomingDamage',value:-.25}]),{round:1,duration:1});
 const r=E.resolveRound(g,{[g.ships[0].id]:{...E.emptyPlan(),main:[g.ships[1].pos]},[g.ships[1].id]:{...E.emptyPlan(),guard:true}});
 expect(r.game.ships[1].hp).toBe(167); // 60 * 2 * .7 * .75 = 63
 expect(r.combatStats[g.ships[0].id].damageDealt).toBe(63);
});
test('periodic damage precedes healing and victory; snapshots retain the ending round independently',()=>{
 const g=battle();g.ships=[g.ships[0],g.ships[5]];g.ships.forEach(s=>{s.hp=8;applyStatus(s,definition('dot',[{kind:'periodicDamage',value:8},{kind:'periodicHeal',value:100}]),{round:1,duration:2,source:{unitId:g.ships.find(x=>x.team!==s.team)!.id}});});
 const r=E.resolveRound(g);expect(r.game.ships.map(s=>s.hp)).toEqual([0,0]);expect(r.game.winner).toBe('draw');expect(r.game.ships.every(s=>!s.statuses)).toBe(true);
 expect(r.frames[0].round).toBe(1);expect(r.frames[0].ships[0].statuses).toHaveLength(1);expect(r.frames[0].ships[0].statuses![0].lastSettledRound).toBeUndefined();
 expect(r.combatStats[g.ships[0].id].damageBySource.status.dealt).toBe(8);
});
test('plane speed and vision work, recovery clears statuses, periodic deaths account for lost slots',()=>{
 const g=battle(),mother=g.ships.find(s=>s.team===0&&s.cfg.carrier)!;mother.pos={q:0,r:7};mother.xy=E.hexToXY(mother.pos);mother.airReady[0]=Infinity;
 const p=planeFixture('status-plane',0,{q:1,r:7},{mother:mother.id,target:{q:12,r:7},cfg:{...mother.cfg.carrier!.plane,speed:1,vision:1},hp:3});g.planes=[p];
 applyStatus(p,definition('air',[{kind:'speed',value:1},{kind:'vision',value:2}]),{round:1,duration:2});
 g.ships.forEach(s=>s.cfg.vision=0);expect(E.visibleCells(g,0).has('4,7')).toBe(true);
 const r=E.resolveRound(g);expect(E.xyToHex(r.game.planes[0].xy)).toEqual({q:3,r:7});
 const recovery=E.clone(g);recovery.planes[0].state='return';expect(E.resolveRound(recovery).game.planes).toEqual([]);
 applyStatus(p,definition('dead',[{kind:'periodicDamage',value:3}]),{round:1,duration:1});const dead=E.resolveRound(g);expect(dead.game.planes).toEqual([]);expect(dead.game.ships.find(s=>s.id===mother.id)!.destroyedPlanes).toBe(1);
});
test('visible status data survives live and replay projections without exposing a hidden source',()=>{
 const g=battle();applyStatus(g.ships[0],definition('concealment-test',[{kind:'vision',value:1}]),{round:1,duration:2,instanceId:'SECRET-effect',source:{unitId:'SECRET',shipId:'SECRET-mother',name:'SECRET-name'}});
 const v=playerView(g,0);expect(v.ships[0].statuses).toHaveLength(1);expect(JSON.stringify(v)).not.toContain('SECRET');
 const r=playerResult(g,E.resolveRound(g),0);expect(r.frames[0].round).toBe(1);expect(r.frames[0].ships[0].statuses).toHaveLength(1);expect(JSON.stringify(r)).not.toContain('SECRET');
 const wire=parseContract(contracts.RoundMessage,JSON.parse(JSON.stringify({type:'round',matchId:'test',round:1,result:r})));const materialized=materializeResult(wire.result);
 expect(materialized.frames[0].ships[0].statuses![0].effects).toEqual([{kind:'vision',value:1}]);materialized.frames[0].ships[0].statuses![0].effects[0].value=99;
 expect(g.ships[0].statuses![0].effects[0].value).toBe(1);expect(materialized.frames[1].ships[0].statuses![0].effects[0].value).toBe(1);
});
test('torpedo and mine output damage remains snapshotted after the launch buff expires',()=>{
 const g=battle();g.ships=[E.createCatalogShip('dd-2',0,0,{q:0,r:4}),E.createCatalogShip('bb-1',1,0,{q:0,r:9})];g.ships.forEach(s=>delete s.cfg.secondary);
 applyStatus(g.ships[0],definition('weapon',[{kind:'outgoingDamage',value:.5}]),{round:1,duration:1});
 const first=E.resolveRound(g,{[g.ships[0].id]:{...E.emptyPlan(),torps:[{window:0,dir:1}]}}).game;
 expect(first.torpedoes[0].cfg.damage).toBe(60);expect(first.ships[0].statuses).toBeUndefined();expect(first.ships[0].cfg.torpedo!.damage).toBe(40);
 applyStatus(first.ships[1],definition('armor',[{kind:'incomingDamage',value:-.5}]),{round:2,duration:1});
 expect(E.resolveRound(first).game.ships[1].hp).toBe(240);
 const m=battle();m.ships=[E.createCatalogShip('dd-1',0,0,{q:0,r:4}),E.createCatalogShip('bb-1',1,0,{q:10,r:9})];m.ships.forEach(s=>delete s.cfg.secondary);
 applyStatus(m.ships[0],definition('mine-boost',[{kind:'outgoingDamage',value:1}]),{round:1,duration:1});
 const mined=E.resolveRound(m,{[m.ships[0].id]:{...E.emptyPlan(),moves:[{turn:0,forward:true}],mineSteps:[1]}}).game;
 expect(mined.map.mines[0].damage).toBe(80);expect(mined.ships[0].cfg.minelayer!.damage).toBe(40);
});
test('periodic sinking is included before domination victory even if the dead team reaches target score',()=>{
 const g=battle();g.round=2;g.battleMode='domination';g.domination=createDominationState();g.domination.scores=[95,0];g.domination.lastRound=1;
 const point=g.domination.points[0];point.owner=0;point.capturedRound=1;
 g.ships.filter(s=>s.team===0).forEach(s=>s.hp=0);g.ships[0].hp=8;
 applyStatus(g.ships[0],definition('sink',[{kind:'periodicDamage',value:8}]),{round:2,duration:1});
 const r=E.resolveRound(g);expect(r.game.domination!.scores[0]).toBe(100);expect(r.game.winner).toBe(1);
});
test('aircraft damage uses its own status instead of inheriting the carrier bonus',()=>{
 const g=battle();g.ships=[E.createCatalogShip('cv-1',0,0,{q:0,r:7}),E.createCatalogShip('bb-1',1,0,{q:6,r:7})];g.ships.forEach(s=>{delete s.cfg.secondary;delete s.cfg.aa;});
 const mother=g.ships[0];mother.airReady[0]=Infinity;g.planes=[planeFixture('bomber',0,g.ships[1].pos,{mother:mother.id,cfg:{...mother.cfg.carrier!.plane},hp:3,target:{q:8,r:7}})];
 applyStatus(mother,definition('carrier-attack',[{kind:'outgoingDamage',value:1}]),{round:1,duration:1});
 expect(E.resolveRound(g).game.ships[1].hp).toBe(235);
 applyStatus(g.planes[0],definition('plane-attack',[{kind:'outgoingDamage',value:1}]),{round:1,duration:1});expect(E.resolveRound(g).game.ships[1].hp).toBe(200);
});
test('battle status captures aircraft attribution before recovery and accumulates into match records',()=>{
 const g=battle(),mother=g.ships.find(s=>s.team===0&&s.cfg.carrier)!,target=g.ships[5];mother.airReady[0]=Infinity;
 g.planes=[planeFixture('source-plane',0,mother.pos,{mother:mother.id,cfg:{...mother.cfg.carrier!.plane},state:'return',target:mother.pos})];
 applyBattleStatus(g,target.id,definition('air-dot',[{kind:'periodicDamage',value:10}]),{sourceId:'source-plane',duration:2});
 const match={game:g,combatStats:{},roundsResolved:0} as import('../server/types.ts').Match;initializeMatchStats(match);
 const result=E.resolveRound(g);expect(result.game.planes).toHaveLength(0);expect(result.combatStats[mother.id].damageDealt).toBe(10);expect(result.combatStats[target.id].damageTaken.environment).toBe(0);
 accumulateRoundStats(match,result);expect(match.combatStats[mother.id].damageBySource.status.dealt).toBe(10);
 expect(()=>applyBattleStatus(g,target.id,definition('invalid',[{kind:'speed',value:1}]),{sourceId:'missing',duration:2})).toThrow();
});
test('large legal output modifiers produce serializable torpedo snapshots without changing base config limits',()=>{
 const g=battle(),ship=g.ships[0];ship.pos={q:0,r:4};ship.xy=E.hexToXY(ship.pos);ship.heading=0;
 applyBattleStatus(g,ship.id,definition('large-bonus',[{kind:'outgoingDamage',value:100000}]),{duration:1});
 const result=E.resolveRound(g,{[ship.id]:{...E.emptyPlan(),torps:[{window:0,dir:1}]}}).game;
 expect(result.torpedoes[0].cfg.damage).toBe(4000040);expect(result.ships[0].cfg.torpedo!.damage).toBe(40);
 const state={game:result,roster:result.ships.filter(s=>s.team===0).map(s=>s.template),seed:result.seed,selected:ship.id,plans:{}};
 expect(deserializeSave(serializeSave(createSave(state))).state.game.torpedoes[0].cfg.damage).toBe(4000040);
});
