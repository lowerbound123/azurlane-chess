import {describe,it,expect} from 'vitest';
import {SHIPS} from '../src/ship-catalog.ts';
import {buildAbilityDemo,compileAbilityDemo,sampleAbilityDemo,DEMO_IDS} from '../src/ability-demos/scenarios.ts';
import {SHIP_DEFINITIONS} from '../src/ship-definitions.ts';
const compiled=(id:string)=>compileAbilityDemo(buildAbilityDemo(id));
const logs=(id:string)=>compiled(id).rounds.flatMap(r=>r.events.map(e=>e.text));
const hits=(id:string)=>compiled(id).rounds.flatMap(r=>r.presentation.filter(e=>e.type==='effect'&&e.kind==='hit').map(e=>e.text));
describe('十五舰真实能力演示',()=>{
 it('全目录都有完整无空隙时间线，主角配置未被演示篡改',()=>{
  expect([...DEMO_IDS].sort()).toEqual(SHIPS.map(s=>s.id).sort());
  for(const id of DEMO_IDS){const d=compiled(id);expect(d.spec.game.ships[0].cfg).toEqual(SHIP_DEFINITIONS[id]);let at=0;for(const b of d.spec.beats){expect(b.start).toBe(at);at=b.end;expect(()=>sampleAbilityDemo(d,(b.start+b.end)/2)).not.toThrow();}expect(at).toBe(d.spec.duration);expect(d.spec.beats.at(-1)!.end-d.spec.beats.at(-1)!.start).toBeGreaterThanOrEqual(1.5);}
 });
 it('Z35真实布设两枚且下一轮武装，敌舰踩雷40',()=>{
  const d=compiled('dd-1');expect(d.rounds[0].game.ships[0].minesLeft).toBe(4);expect(d.rounds[0].game.map.mines).toHaveLength(2);expect(d.rounds[0].game.map.mines.every(m=>m.armedRound===2)).toBe(true);expect(logs('dd-1').some(t=>t.includes('触雷 −40'))).toBe(true);expect(sampleAbilityDemo(d,4).model.mines.length).toBe(2);
 });
 it('岛风在同窗口向四个合法侧向发射，四个目标各40',()=>{const d=compiled('dd-2');expect(d.rounds[0].game.ships[0].torps).toBe(4);expect(d.rounds[0].events.filter(e=>e.text.includes('遭鱼雷命中 −40'))).toHaveLength(4);expect(sampleAbilityDemo(d,3).model.torpedoes.length).toBeGreaterThan(0);});
 it('圣地亚哥双层防空在投弹前击落2HP轰炸机',()=>{const d=compiled('cl-1');expect(d.rounds[0].events.some(e=>e.text.includes('击落敌机'))).toBe(true);expect(d.rounds[0].presentation.filter(e=>e.type==='projectile'&&e.kind==='aa')).toHaveLength(2);expect(d.rounds[0].events.some(e=>e.text.includes('航空炸弹'))).toBe(false);});
 it('克利夫兰副炮打两个不同目标，各12',()=>{const d=compiled('cl-2');expect(d.rounds[0].events.filter(e=>e.text.includes('副炮命中 −12'))).toHaveLength(2);expect(new Set(d.rounds[0].presentation.filter(e=>e.type==='effect'&&e.kind==='hit').map(e=>e.type==='effect'?e.targetId:'' )).size).toBe(2);});
 it('海伦娜雷达揭示岛后烟幕敌舰，持续下一轮并按时失效',()=>{const d=compiled('cl-3');expect(sampleAbilityDemo(d,1).model.ships.some(s=>s.id==='1-0')).toBe(false);expect(sampleAbilityDemo(d,4).model.ships.some(s=>s.id==='1-0')).toBe(true);expect(sampleAbilityDemo(d,7).model.ships.some(s=>s.id==='1-0')).toBe(true);expect(sampleAbilityDemo(d,13).model.ships.some(s=>s.id==='1-0')).toBe(false);expect(d.rounds[1].game.ships[0].radarLeft).toBe(2);});
 it('欧根驻守停住敌舰，45鱼雷变18、60主炮变42',()=>{const d=compiled('ca-1');expect(hits('ca-1')).toContain('−18');expect(hits('ca-1')).toContain('−42');expect(d.rounds[0].game.ships[0].pos).toEqual(d.spec.game.ships[0].pos);expect(d.rounds[0].events.some(e=>/封锁/.test(e.text))).toBe(true);});
 it('巴尔的摩护航只移动一步，友方炮击42/轰炸18，自身炮击60',()=>{const d=compiled('ca-2');expect(d.rounds[0].game.ships[0].pos).toEqual({q:4,r:5});expect(hits('ca-2')).toEqual(expect.arrayContaining(['−42','−18','−60']));});
 it('旧金山两次真实前进打32，一次前进加转向只打16',()=>{const d=compiled('ca-3');expect(d.rounds[0].events.filter(e=>e.text.includes('副炮命中 −16'))).toHaveLength(2);expect(d.experiments.partial.rounds[0].events.filter(e=>e.text.includes('副炮命中 −16'))).toHaveLength(1);expect(sampleAbilityDemo(d,8).beat.experiment).toBe('partial');});
 it('北卡三发合计180，第二轮不能开炮，第三轮再次就绪',()=>{const d=compiled('bb-1');expect(hits('bb-1')).toContain('−180');expect(d.rounds[0].presentation.filter(e=>e.type==='projectile'&&e.kind==='main')).toHaveLength(3);expect(d.rounds[1].presentation.filter(e=>e.type==='projectile'&&e.kind==='main')).toHaveLength(0);expect(d.rounds[1].game.ships[0].mainReady).toBe(3);});
 it('黎塞留连续两轮开火，每轮两发合计80',()=>{const d=compiled('bb-3');for(const r of d.rounds){expect(r.presentation.filter(e=>e.type==='projectile'&&e.kind==='main')).toHaveLength(2);expect(r.events.some(e=>e.text.includes('主炮命中 −80'))).toBe(true);}});
 it('企业强袭机能承受双层防空，命中35并真实回收/整备',()=>{const d=compiled('cv-1');expect(hits('cv-1')).toContain('−35');expect(d.rounds[0].events.filter(e=>e.text.includes('回收飞机'))).toHaveLength(2);expect(d.rounds[0].game.ships[0].airReady.slice(0,2)).toEqual([4,4]);expect(d.rounds.map(r=>r.game.ships[0].airHP[0])).toEqual([1,1,2,2]);});
 it('香格里拉先由侦察机发现，次轮才允许锁定并轰炸25',()=>{const d=compiled('cv-3');expect(sampleAbilityDemo(d,0).model.ships.some(s=>s.id==='1-0')).toBe(false);expect(sampleAbilityDemo(d,5).model.ships.some(s=>s.id==='1-0')).toBe(true);expect(d.rounds[0].events.some(e=>e.text.includes('航空炸弹'))).toBe(false);expect(d.rounds[1].events.some(e=>e.team===0&&e.text.includes('放飞'))).toBe(true);expect(hits('cv-3')).toContain('−25');});
});
it('能力数值与既定分镜不一致时拒绝导出，不能静默烘焙错误字幕',()=>{const spec=buildAbilityDemo('bb-3');spec.game.ships[0].cfg.main!.damage=41;expect(()=>compileAbilityDemo(spec)).toThrow('演示证据');});
