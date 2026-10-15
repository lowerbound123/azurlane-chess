import {describe,it,expect} from 'vitest';
import {HISTORICAL_BATTLES,createHistoricalBattle} from '../src/history/index.ts';
import {legal,hexDist} from '../src/engine.ts';
describe('independent historical fixtures',()=>{
 it.each([
  ['river-plate',4,3,21,17,14],['narvik',10,4,19,25,18],['denmark-strait',4,2,25,15,12],['midway',7,3,27,21,18],['samar',10,3,23,25,16],
 ] as const)('%s deploys its fixed legal fleet',(id,total,controlled,width,height,limit)=>{
  const d=HISTORICAL_BATTLES.find(x=>x.id===id)!;const s=createHistoricalBattle(id);
  expect(s.game.ships).toHaveLength(total);expect(d.units.filter(x=>x.controlled)).toHaveLength(controlled);
  expect([s.game.map.width,s.game.map.height,d.roundLimit]).toEqual([width,height,limit]);
  expect(s.game.ships.every(x=>legal(d.map,x.pos))).toBe(true);expect(d.regions.every(r=>r.cells.every(h=>legal(d.map,h)))).toBe(true);
  for(const x of s.game.ships){expect(x.cfg.guard).toBeUndefined();expect(x.cfg.escort).toBeUndefined();expect(x.cfg.radar).toBeUndefined();expect(x.cfg.contactSweep).toBeUndefined();expect(x.statuses??[]).toEqual([]);}
  for(let i=0;i<total;i++)for(let j=i+1;j<total;j++)expect(hexDist(s.game.ships[i].pos,s.game.ships[j].pos)).toBeGreaterThan(0);
 });
 it('has explicit historical weapons, injured Narvik destroyers, and delayed Japanese bombers',()=>{
  const river=createHistoricalBattle('river-plate');expect(river.game.ships.map(s=>s.hp)).toEqual([240,170,170,420]);
  expect(river.game.ships[0].cfg.main).toEqual({shots:2,damage:30,range:7,reload:0});
  expect(createHistoricalBattle('narvik').game.ships.slice(4).map(s=>s.hp)).toEqual([80,110,60,120,110,100]);
  const m=createHistoricalBattle('midway');expect(m.game.ships.slice(3).map(s=>s.airReady)).toEqual(Array.from({length:4},()=>[3,5,1,1]));
  expect(m.game.ships[0].airHP).toEqual([3,3,3,3,3,1]);
 });
});
