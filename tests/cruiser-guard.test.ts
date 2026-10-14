import {test,expect} from 'vitest';
import type {Game,Ship,ShipType,Plan,Hex} from '../shared/game.ts';
import * as E from '../src/engine.ts';
import {validateOrders,playerResult} from '../server/views.ts';
import {torpedoFixture} from './helpers/game-fixtures.ts';

const quiet=(type:ShipType,team:number,index:number,pos:Hex)=>{
  const ship=E.createShip(type,team,index,pos);delete ship.cfg.secondary;delete ship.cfg.aa;return ship;
};
const game=(ships:Ship[]):Game=>({seed:1,round:1,map:{width:19,height:15,islands:[],mines:[]},ships,torpedoes:[],planes:[],nextId:0,log:[],winner:null,phase:'plan',explored:[[],[]]});
const moves=(n:number)=>Array.from({length:n},()=>({turn:0,forward:true}));
const guard=():Plan&{guard:boolean}=>({...E.emptyPlan(),guard:true});

test('heavy cruiser secondary guns hit only one enemy per round',()=>{
 const ca=E.createShip('ca',0,0,{q:8,r:5}),a=quiet('cv',1,0,{q:10,r:5}),b=quiet('cv',1,1,{q:8,r:7});
 const result=E.resolveRound(game([ca,a,b]));
 expect(result.game.ships.slice(1).map(s=>s.hp).sort()).toEqual([194,210]);
 expect(result.combatStats[ca.id].damageBySource.secondary.dealt).toBe(16);
});
test('guard sacrifices even turning and clears all movement without mutating the submitted plan',()=>{
 const ca=quiet('ca',0,0,{q:8,r:5}),g=game([ca]),p={...guard(),moves:[{turn:1,forward:false},...moves(2)]};
 const validated=E.validPlan(g,ca,p);
 expect(validated.moves).toEqual([]);expect(validated.guard).toBe(true);expect(p.moves).toHaveLength(3);
 expect(E.route(ca,p,g.map)).toHaveLength(1);
 expect(E.resolveRound(g,{[ca.id]:p}).game.ships[0].pos).toEqual({q:8,r:5});
});
for(let direction=0;direction<6;direction++)test(`guard prevents movement from adjacent hex ${direction}`,()=>{
 const ca=quiet('ca',0,0,{q:8,r:5}),dd=quiet('dd',1,0,E.add(ca.pos,direction));dd.heading=direction;
 const result=E.resolveRound(game([ca,dd]),{[ca.id]:guard(),[dd.id]:{...E.emptyPlan(),moves:moves(2)}});
 expect(result.game.ships[1].pos).toEqual(dd.pos);expect(result.game.ships[1].hp).toBe(dd.hp);
 expect(result.events.some(e=>e.text.includes('封锁截停'))).toBe(true);
});
test('entering enemy stops at the first adjacent hex and never follows the rest of its route',()=>{
 const ca=quiet('ca',0,0,{q:8,r:5}),dd=quiet('dd',1,0,{q:5,r:5});dd.heading=0;
 const result=E.resolveRound(game([ca,dd]),{[ca.id]:guard(),[dd.id]:{...E.emptyPlan(),moves:moves(4)}});
 expect(result.game.ships[1].pos).toEqual({q:7,r:5});
 expect(result.frames.filter(f=>f.t>=.5&&f.t<=1).every(f=>E.same(f.ships[1].pos,{q:7,r:5}))).toBe(true);
 expect(result.events.some(e=>e.text.includes('沿原路回退'))).toBe(false);
});
test('guard does not stop allies or enemies outside the six adjacent cells',()=>{
 const ca=quiet('ca',0,0,{q:8,r:5}),friend=quiet('dd',0,1,{q:5,r:6}),enemy=quiet('dd',1,0,{q:5,r:8});friend.heading=enemy.heading=0;
 const result=E.resolveRound(game([ca,friend,enemy]),{[ca.id]:guard(),[friend.id]:{...E.emptyPlan(),moves:moves(3)},[enemy.id]:{...E.emptyPlan(),moves:moves(3)}});
 expect(result.game.ships[1].pos).toEqual({q:8,r:6});expect(result.game.ships[2].pos).toEqual({q:8,r:8});
});
test('guard reduces a 45 damage torpedo to 18 and records the actual damage in stats',()=>{
 const ca=quiet('ca',0,0,{q:8,r:5}),enemy=quiet('dd',1,0,{q:15,r:5}),g=game([ca,enemy]);g.torpedoes=[torpedoFixture('t0',1,ca.pos)];
 const result=E.resolveRound(g,{[ca.id]:guard()});
 expect(result.game.ships[0].hp).toBe(212);expect(result.combatStats[enemy.id].damageDealt).toBe(18);
 expect(result.presentation.some(e=>e.kind==='guard-block')).toBe(true);
 const next=E.clone(result.game);next.torpedoes=[torpedoFixture('t1',1,ca.pos)];
 expect(E.resolveRound(next).game.ships[0].hp).toBe(167);
});
test('a sunk guard no longer stops newly approaching enemies',()=>{
 const ca=quiet('ca',0,0,{q:8,r:5}),dd=quiet('dd',1,0,{q:5,r:5}),g=game([ca,dd]);ca.hp=1;dd.heading=0;g.torpedoes=[torpedoFixture('t0',1,ca.pos)];
 const result=E.resolveRound(g,{[ca.id]:guard(),[dd.id]:{...E.emptyPlan(),moves:moves(4)}});
 expect(result.game.ships[0].hp).toBe(0);expect(result.game.ships[1].pos).toEqual({q:9,r:5});
});
test('server accepts guard only for capable ships with no movement',()=>{
 const ca=quiet('ca',0,0,{q:8,r:5}),dd=quiet('dd',0,1,{q:4,r:9}),g=game([ca,dd]);
 expect(validateOrders(g,0,{[ca.id]:guard()})[ca.id].guard).toBe(true);
 expect(()=>validateOrders(g,0,{[dd.id]:guard()})).toThrow(/指令无效/);
 expect(()=>validateOrders(g,0,{[ca.id]:{...guard(),moves:moves(1)}})).toThrow(/指令无效/);
 expect(()=>validateOrders(g,0,{[ca.id]:{guard:'yes'}})).toThrow(/指令无效/);
});
test('guard is visible in authorized replay frames but cleared before the next planning phase',()=>{
 const ca=quiet('ca',0,0,{q:8,r:5}),dd=quiet('dd',1,0,{q:9,r:5}),g=game([ca,dd]);
 const result=E.resolveRound(g,{[ca.id]:guard()}),view=playerResult(g,result,1);
 expect(view.frames[0].ships.find(s=>s.id===ca.id)?.guarding).toBe(true);
 expect(result.game.ships[0].guarding).toBeUndefined();
});
test('guard does not reduce mine damage or stop aircraft',()=>{
 const ca=quiet('ca',0,0,{q:8,r:5}),cv=quiet('cv',1,0,{q:8,r:9}),g=game([ca,cv]);g.map.mines=[ca.pos];
 const result=E.resolveRound(g,{[ca.id]:guard(),[cv.id]:{...E.emptyPlan(),planes:[{mode:'point',target:{q:8,r:2}}]}});
 expect(result.game.ships[0].hp).toBe(165); // Mine 40 + aircraft bomb 25, no reduction.
 expect(result.events.some(e=>e.text.includes('触雷')&&e.text.includes('40'))).toBe(true);
});
