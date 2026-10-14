import {describe,it,expect} from 'vitest';
import * as E from '../src/engine.ts';
import {SHIPS,shipStats} from '../src/ship-catalog.ts';

describe('fleet-v1 definitions',()=>{
 it('has fifteen distinct named ships with frozen resources',()=>{
  expect(SHIPS.map(s=>s.name)).toEqual(['Z35','岛风','阿卡司塔','圣地亚哥','克利夫兰','海伦娜','欧根亲王','巴尔的摩','旧金山','北卡罗来纳','武藏','黎塞留','企业','埃塞克斯','香格里拉']);
  expect(shipStats('dd-1').minelayer?.reserve).toBe(6);
  expect(shipStats('dd-2')).toMatchObject({hp:90,torpedo:{reserve:8,max:4,damage:40}});
  expect(shipStats('cl-2').torpedo?.reserve).toBe(6);
  expect(shipStats('cl-3').torpedo?.reserve).toBe(6);
  expect(shipStats('ca-2').guard).toBeUndefined();
  expect(shipStats('ca-3').guard).toBeUndefined();
  expect(shipStats('cv-1').carrier?.stock).toBe(4);
 });
 it('creates isolated new fleets while retaining legacy entry point',()=>{
  const g=E.createFleetGame();
  expect(g.ruleset).toBe('fleet-v1');
  expect(g.ships.slice(0,5).map(s=>s.catalogId)).toEqual(['dd-2','cl-2','ca-1','bb-1','cv-1']);
  g.ships[0].cfg.torpedo!.damage=1;
  expect(g.ships[5].cfg.torpedo!.damage).toBe(40);
  expect(E.createGame().ruleset).toBeUndefined();
 });
});

function battle(ids:string[],positions:{q:number;r:number}[],teams=ids.map((_,i)=>i?1:0)){
 const g=E.createFleetGame();g.phase='plan';g.map.islands=[];g.map.mines=[];
 g.ships=ids.map((id,i)=>E.createCatalogShip(id,teams[i],i,positions[i]));
 return g;
}
const h=(q:number,r=7)=>({q,r});
const order=(patch:Partial<import('../shared/game.ts').Plan>)=>({...E.emptyPlan(),...patch});
describe('fleet-v1 combat',()=>{
 it('permits four distinct side directions in one Shimakaze window',()=>{
  const g=battle(['dd-2','bb-1'],[h(2),h(10)]),s=g.ships[0];
  const p=E.validPlan(g,s,order({torps:[1,2,4,5,1].map(dir=>({window:0,dir}))}));
  expect(p.torps.map(t=>t.dir)).toEqual([1,2,4,5]);
 });
 it('applies Musashi center double and adjacent splash including friends',()=>{
  const g=battle(['bb-2','bb-1','bb-1'],[h(0),h(7),h(8)],[0,1,0]);
  g.ships.forEach(s=>delete s.cfg.secondary);
  const r=E.resolveRound(g,{[g.ships[0].id]:order({main:[h(7)]})});
  expect(r.game.ships.map(s=>s.hp)).toEqual([270,150,210]);
 });
 it('limits Cleveland to two distinct targets',()=>{
  const g=battle(['cl-2','bb-1','bb-1','bb-1'],[h(4),h(6),h(4,9),h(2)]);
  g.ships.slice(1).forEach(s=>delete s.cfg.secondary);
  const r=E.resolveRound(g);expect(r.game.ships.slice(1).map(s=>270-s.hp).sort()).toEqual([0,12,12]);
 });
 it('escort applies to others and samples providers before simultaneous artillery',()=>{
  const g=battle(['bb-1','ca-2','bb-1'],[h(0),h(6),h(7)],[0,1,1]);
  g.ships.forEach(s=>delete s.cfg.secondary);g.ships[1].hp=10;
  const r=E.resolveRound(g,{[g.ships[0].id]:order({main:[h(6),h(7)]}),[g.ships[1].id]:order({escort:true})});
  expect(r.game.ships[1].hp).toBe(0);expect(r.game.ships[2].hp).toBe(228);
 });
 it('Eugen guard reduces guns but cannot move',()=>{
  const g=battle(['bb-1','ca-1'],[h(0),h(7)]);g.ships.forEach(s=>delete s.cfg.secondary);
  const r=E.resolveRound(g,{[g.ships[0].id]:order({main:[h(7)]}),[g.ships[1].id]:order({guard:true})});
  expect(r.game.ships[1].hp).toBe(188);
 });
 it('San Francisco fires twice only after two completed forwards',()=>{
  const g=battle(['ca-3','bb-1'],[h(0),h(5)]);delete g.ships[1].cfg.secondary;
  const r=E.resolveRound(g,{[g.ships[0].id]:order({moves:[{turn:0,forward:true},{turn:0,forward:true}]})});
  expect(r.game.ships[1].hp).toBe(238);
 });
});
describe('fleet-v1 zones and mines',()=>{
 it('lays a mine only on a completed forward and arms next round',()=>{
  const g=battle(['dd-1','bb-1'],[h(0),h(12)]);
  const r=E.resolveRound(g,{[g.ships[0].id]:order({moves:[{turn:0,forward:true},{turn:0,forward:false}],mineSteps:[1,2]})});
  expect(r.game.map.mines).toEqual([{...h(0),armedRound:2,sourceId:g.ships[0].id,team:0,damage:40}]);
  expect(r.game.ships[0].minesLeft).toBe(5);
 });
 it('separates smoke concealment from terrain and radar reveals through smoke',()=>{
  const g=battle(['cl-3','dd-3'],[h(0),h(4)]);
  g.zones=[{kind:'smoke',team:1,center:h(4),radius:1,expires:3}];
  expect(E.visibleCells(g,0).has(E.key(h(4)))).toBe(true);
  expect(E.shipVisible(g,g.ships[1],0)).toBe(false);
  g.zones.push({kind:'radar',team:0,center:h(4),radius:1,expires:3});
  expect(E.shipVisible(g,g.ships[1],0)).toBe(true);
 });
 it('smoke consumes a charge, excludes torpedoes and expires before R+2',()=>{
  const g=battle(['dd-3','bb-1'],[h(0),h(12)]);
  const r=E.resolveRound(g,{[g.ships[0].id]:order({smoke:true,torps:[{window:0,dir:1}]})});
  expect(r.game.ships[0].smokeLeft).toBe(1);expect(r.game.ships[0].torps).toBe(3);expect(r.game.zones).toHaveLength(1);
  expect(E.resolveRound(r.game).game.zones).toEqual([]);
 });
});
describe('fleet-v1 aircraft',()=>{
 it('requires explicit ready slots and enforces role modes',()=>{
  const g=battle(['cv-2','bb-1'],[h(0),h(12)]),s=g.ships[0];
  const p=E.validPlan(g,s,order({planes:[{mode:'patrol',target:h(2),slot:0},{mode:'patrol',target:h(3),slot:0}]}));
  expect(p.planes).toHaveLength(1);
  expect(E.validPlan(g,s,order({planes:[{mode:'target',targetId:g.ships[1].id,slot:0}]})).planes).toEqual([]);
 });
 it('fighter patrol counts time across rounds and never bombs ships',()=>{
  const g=battle(['cv-2','bb-1'],[h(0),h(12)]);
  const r=E.resolveRound(g,{[g.ships[0].id]:order({planes:[{mode:'patrol',target:h(3),slot:0}]})});
  expect(r.game.planes[0].cfg.role).toBe('fighter');expect(r.game.planes[0].patrolRemaining).toBeCloseTo(.5,1);
  const next=E.resolveRound(r.game);expect(next.game.planes.length).toBe(0);expect(next.game.ships[0].airReady[0]).toBe(4);
 });
});
describe('fleet-v1 timing edges',()=>{
 it('San Francisco waiting steps do not grant double shots',()=>{
  const g=battle(['ca-3','bb-1'],[h(0),h(4)]);delete g.ships[1].cfg.secondary;
  const r=E.resolveRound(g,{[g.ships[0].id]:order({moves:[{turn:0,forward:false},{turn:0,forward:true}]})});expect(r.game.ships[1].hp).toBe(254);
 });
 it('unarmed mines cannot damage but can be swept',()=>{
  const g=battle(['bb-1','dd-1'],[h(1),h(10)]);g.map.mines=[{...h(1),armedRound:2,sourceId:g.ships[1].id,team:1,damage:40}];
  const first=E.resolveRound(g);expect(first.game.ships[0].hp).toBe(270);expect(first.game.map.mines).toHaveLength(1);
  const second=E.resolveRound(first.game);expect(second.game.ships[0].hp).toBe(230);expect(second.combatStats[g.ships[1].id].damageDealt).toBe(40);
 });
 it('remote sweep runs before armed mine contact damage',()=>{
  const g=battle(['bb-1','dd-1'],[h(1),h(10)]);g.map.mines=[{...h(1),armedRound:1,sourceId:g.ships[1].id,team:1,damage:40}];
  const r=E.resolveRound(g,{[g.ships[0].id]:order({sweep:h(1)})});expect(r.game.ships[0].hp).toBe(270);expect(r.game.map.mines).toEqual([]);
 });
 it('Richelieu can fire again immediately next round',()=>{
  const g=battle(['bb-3','bb-1'],[h(0),h(7)]);g.ships.forEach(s=>delete s.cfg.secondary);
  const r=E.resolveRound(g,{[g.ships[0].id]:order({main:[h(7)]})});expect(r.game.ships[0].mainReady).toBe(2);
  expect(E.validPlan(r.game,r.game.ships[0],order({main:[h(7),h(7)]})).main).toHaveLength(2);
 });
 it('layered AA deals two hits before heavy bombing and kills scouts',()=>{
  const g=battle(['cv-1','cl-1'],[h(0),h(4)]);delete g.ships[1].cfg.secondary;
  const r=E.resolveRound(g,{[g.ships[0].id]:order({planes:[{slot:0,mode:'point',target:h(4)}]})});expect(r.game.ships[1].hp).toBe(115);
  const scout=battle(['cv-3','cl-1'],[h(0),h(4)]);delete scout.ships[1].cfg.secondary;
  const next=E.resolveRound(scout,{[scout.ships[0].id]:order({planes:[{slot:0,mode:'point',target:h(4)}]})});expect(next.game.ships[1].hp).toBe(150);expect(next.game.ships[0].destroyedPlanes).toBe(1);
 });
 it('fighters kill hostile planes before bombing and credit their carrier',()=>{
  const g=battle(['cv-2','cv-1'],[h(0),h(2)]);g.ships[1].cfg.carrier!.slots![0].hp=2;g.ships[1].airHP[0]=2;
  const r=E.resolveRound(g,{[g.ships[0].id]:order({planes:[{slot:0,mode:'patrol',target:h(1)}]}),[g.ships[1].id]:order({planes:[{slot:0,mode:'target',targetId:g.ships[0].id}]})});
  expect(r.game.ships[0].hp).toBe(210);expect(r.combatStats[g.ships[0].id].planesShotDown).toBe(1);
 });
});
