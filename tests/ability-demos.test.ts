import {describe,it,expect} from 'vitest';
import {buildAbilityDemo,compileAbilityDemo,sampleAbilityDemo} from '../src/ability-demos/scenarios.ts';

describe('真实规则演示场景',()=>{
 it('武藏仅一发主炮，对中心、邻格敌舰和邻格友军分别造成120/60/60伤害',()=>{
  const demo=compileAbilityDemo(buildAbilityDemo('bb-2'));
  const hits=demo.rounds[0].presentation.filter(e=>e.type==='effect').filter(e=>e.kind==='hit');
  expect(hits.map(e=>[e.type==='effect'?e.targetId:null,e.text])).toEqual([['1-0','−120'],['1-1','−60'],['0-1','−60']]);
  expect(demo.rounds[0].presentation.filter(e=>e.type==='projectile'&&e.kind==='main')).toHaveLength(1);
 });
 it('烟雾遮蔽、贴近发现、第三回合失效都来自实际可见性',()=>{
  const demo=compileAbilityDemo(buildAbilityDemo('dd-3'));
  expect(sampleAbilityDemo(demo,4).model.ships.some(s=>s.id==='0-0')).toBe(false);
  expect(sampleAbilityDemo(demo,9).model.ships.some(s=>s.id==='0-0')).toBe(true);
  expect(sampleAbilityDemo(demo,13).model.zones).toHaveLength(0);
 });
 it('埃塞克斯发射一战一轰，真实拦截、轰炸、回收并保留整备时间',()=>{
  const demo=compileAbilityDemo(buildAbilityDemo('cv-2'));
  expect(demo.rounds[0].events.filter(e=>e.team===0&&e.text.includes('放飞'))).toHaveLength(2);
  expect(demo.rounds.flatMap(r=>r.presentation).some(e=>e.type==='effect'&&e.kind==='fighter')).toBe(true);
  expect(demo.rounds.flatMap(r=>r.events).some(e=>e.text.includes('航空炸弹命中 −25'))).toBe(true);
  const last=demo.rounds.at(-1)!.game;
  expect(last.planes.filter(p=>p.team===0)).toHaveLength(0);
  const carrier=last.ships.find(s=>s.id==='0-0')!;
  expect(carrier.airReady[0]).toBeGreaterThan(1);
  expect(carrier.airReady[4]).toBeGreaterThan(1);
 });
 it('拒绝未编排舰船，采样不能越过最后一帧',()=>{
  expect(()=>buildAbilityDemo('unknown')).toThrow();
  const demo=compileAbilityDemo(buildAbilityDemo('bb-2'));
  expect(sampleAbilityDemo(demo,100).time).toBeLessThan(demo.spec.duration);
 });
});
