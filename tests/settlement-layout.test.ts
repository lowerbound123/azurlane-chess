import {describe,it,expect} from 'vitest';
import type {FrameShip} from '../shared/game.ts';
import {settlementAction,settlementFormation} from '../src/scene/settlement-layout.ts';

function ship(id:string,team:number,role:'front'|'back',hp=100):FrameShip {
 return {id,team,label:id,template:role==='front'?'dd':'bb',hp,cfg:{name:id,role,hp:100,speed:1,vision:3,collision:1,radius:1},pos:{q:0,r:0},xy:{x:0,y:0},heading:0};
}

describe('battle settlement formation',()=>{
 it('我方后排在上、前排在下，保留角色在各排的参战顺序和阵亡舰',()=>{
  const ships=[ship('front-1',7,'front'),ship('back-1',7,'back',0),ship('enemy',2,'front'),ship('front-2',7,'front',0),ship('back-2',7,'back'),ship('front-3',7,'front')];
  const slots=settlementFormation(ships,7,true);
  expect(slots.map(s=>[s.ship.id,s.role,s.row,s.column])).toEqual([
   ['back-1','back',0,0],['back-2','back',0,1],['front-1','front',1,0],['front-2','front',1,1],['front-3','front',1,2],
  ]);
  expect(slots[0]!.y).toBeLessThan(slots[2]!.y);
  expect(slots.map(s=>s.x)).toEqual([1/3,2/3,1/4,1/2,3/4]);
  expect(slots.filter(s=>s.ship.hp<=0).map(s=>s.ship.id)).toEqual(['back-1','front-2']);
  expect(ships.map(s=>s.id)).toEqual(['front-1','back-1','enemy','front-2','back-2','front-3']);
 });

 it('敌方前排在上、后排在下，三舰排比两舰排更宽',()=>{
  const ships=[ship('back-1',2,'back'),ship('front-1',2,'front'),ship('front-2',2,'front'),ship('back-2',2,'back'),ship('front-3',2,'front')];
  const slots=settlementFormation(ships,2,false);
  expect(slots.map(s=>[s.ship.id,s.role,s.row,s.column])).toEqual([
   ['front-1','front',0,0],['front-2','front',0,1],['front-3','front',0,2],['back-1','back',1,0],['back-2','back',1,1],
  ]);
  expect(slots[0]!.y).toBeLessThan(slots[3]!.y);
  expect(slots[2]!.x-slots[0]!.x).toBeGreaterThan(slots[4]!.x-slots[3]!.x);
 });

 it('不足五舰时居中保留前后排位置，历史大编队不会丢舰或越界',()=>{
  const sparse=settlementFormation([ship('only-front',0,'front')],0,true);
  expect(sparse).toHaveLength(1);expect(sparse[0]).toMatchObject({x:.5,row:1,rows:2});
  const ships=Array.from({length:8},(_,i)=>ship(`historical-${i}`,0,i<5?'front':'back',i===7?0:100));
  const slots=settlementFormation(ships,0,true);
  expect(new Set(slots.map(s=>s.ship.id)).size).toBe(8);
  expect(slots.every(s=>s.x>0&&s.x<1&&s.y>0&&s.y<1)).toBe(true);
  expect(slots.filter(s=>s.role==='back').every(s=>s.row<2)).toBe(true);
  expect(slots.filter(s=>s.role==='front').every(s=>s.row>=2)).toBe(true);
  expect(settlementFormation([],0,true)).toEqual([]);
 });
});

describe('settlement animation by team result',()=>{
 it.each([
  [0,0,'dance'],[1,0,'yun'],[7,7,'dance'],[2,7,'yun'],[0,'draw','yun'],[1,'draw','yun'],[0,null,'yun'],
 ] as const)('team %s / winner %s → %s',(team,winner,action)=>{
  expect(settlementAction(team,winner)).toBe(action);
 });
});
