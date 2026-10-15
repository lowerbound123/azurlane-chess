import {test,expect} from 'vitest';
import {reactive} from 'vue';
import {applyStatus,removeStatus,clearStatuses,effectiveSpeed,effectiveVision,statusModifiers,periodicStatusEffects,expireStatuses,projectStatuses,validateStatuses,type StatusDefinition} from '../shared/status.ts';

const boost:StatusDefinition={id:'test-boost',name:'航速测试',kind:'buff',icon:'up',description:'测试',effects:[{kind:'speed',value:1}]};
const unit=()=>({kind:'ship' as const,cfg:{speed:4,vision:5},statuses:undefined as import('../shared/status.ts').StatusInstance[]|undefined});
test('status modifies effective speed without changing base config and expires after two full rounds',()=>{
 const u=unit();applyStatus(u,boost,{round:5,duration:2});
 expect(effectiveSpeed(u,4)).toBe(4);expect(effectiveSpeed(u,5)).toBe(5);expect(effectiveSpeed(u,6)).toBe(5);expect(effectiveSpeed(u,7)).toBe(4);expect(u.cfg.speed).toBe(4);
 expireStatuses(u,6);expect(u.statuses).toBeUndefined();
});
test('execution application and refresh do not alter current round movement',()=>{
 const u=unit();applyStatus(u,boost,{round:5,duration:2,source:{unitId:'a'}});
 applyStatus(u,{...boost,effects:[{kind:'speed',value:2}]},{round:5,phase:'execute',duration:2,source:{unitId:'a'}});
 expect(effectiveSpeed(u,5)).toBe(5);expect(effectiveSpeed(u,6)).toBe(6);expect(effectiveSpeed(u,7)).toBe(6);
});
test('same source refreshes; strongest source wins and weaker resumes after expiration independent of array order',()=>{
 const u=unit();applyStatus(u,boost,{round:5,duration:3,source:{unitId:'a'}});applyStatus(u,boost,{round:5,duration:4,source:{unitId:'a'}});expect(u.statuses).toHaveLength(1);
 applyStatus(u,{...boost,strength:2,effects:[{kind:'speed',value:2}]},{round:5,duration:1,source:{unitId:'b'}});
 expect(effectiveSpeed(u,5)).toBe(6);u.statuses!.reverse();expect(effectiveSpeed(u,5)).toBe(6);expect(effectiveSpeed(u,6)).toBe(5);
});
test('stack cap replaces earliest-expiring layer and keeps other sources deadlines',()=>{
 const u=unit(),s={...boost,maxStacks:2};applyStatus(u,s,{round:5,duration:1,source:{unitId:'a'}});applyStatus(u,s,{round:5,duration:3,source:{unitId:'b'}});applyStatus(u,s,{round:5,duration:2,source:{unitId:'c'}});
 expect(u.statuses).toHaveLength(2);expect(u.statuses!.map(s=>s.source?.unitId).sort()).toEqual(['b','c']);expect(effectiveSpeed(u,6)).toBe(6);expect(effectiveSpeed(u,7)).toBe(5);
});
test('a capped stack added during execution replaces its old layer only next round',()=>{
 const u=unit(),s={...boost,maxStacks:2};applyStatus(u,s,{round:5,duration:3});applyStatus(u,s,{round:5,duration:4});
 applyStatus(u,s,{round:5,phase:'execute',duration:2});expect(effectiveSpeed(u,5)).toBe(6);expect(effectiveSpeed(u,6)).toBe(6);expect(validateStatuses(u.statuses)).toBe(true);
 const saved=JSON.parse(JSON.stringify(u));expect(effectiveSpeed(saved,5)).toBe(6);expireStatuses(saved,5);expect(saved.statuses).toHaveLength(2);
});
test('periodic settlement is idempotent and persistent removal deletes empty field',()=>{
 const u=unit();const s=applyStatus(u,{...boost,effects:[{kind:'periodicDamage',value:8},{kind:'periodicHeal',value:2}]},{round:5,duration:null});
 expect(periodicStatusEffects(u,5).map(x=>[x.damage,x.heal])).toEqual([[8,2]]);expect(periodicStatusEffects(u,5)).toEqual([]);
 const restored=JSON.parse(JSON.stringify(u));expect(periodicStatusEffects(restored,5)).toEqual([]);expect(periodicStatusEffects(restored,6)).toHaveLength(1);
 removeStatus(u,s.instanceId);expect(u.statuses).toBeUndefined();applyStatus(u,boost,{round:7,duration:null});clearStatuses(u,'buff');expect(u.statuses).toBeUndefined();
});
test('effects combine and clamp without multiplying percentage bonuses',()=>{
 const u=unit();for(const [id,effects]of [['a',[{kind:'outgoingDamage',value:.2},{kind:'speed',value:-20}]],['b',[{kind:'outgoingDamage',value:.3},{kind:'vision',value:-20}]]] as const)applyStatus(u,{...boost,id,effects:[...effects]},{round:1,duration:1});
 expect(statusModifiers(u,1).outgoing).toBe(1.5);expect(effectiveSpeed(u,1)).toBe(1);expect(effectiveVision(u,1)).toBe(0);
});
test('projection removes hidden sources and opaque IDs while preserving effects and stable ranking',()=>{
 const u=unit();applyStatus(u,boost,{round:1,duration:2,instanceId:'secret-source-effect',source:{unitId:'secret',shipId:'secret-mother',name:'秘密舰'}});
 const projected=projectStatuses(u.statuses,new Set());expect(JSON.stringify(projected)).not.toContain('secret');expect(JSON.stringify(projected)).not.toContain('秘密');expect(projected![0].effects).toEqual(boost.effects);
 expect(validateStatuses(projected)).toBe(true);
});
test('malformed states are rejected and legacy missing states remain valid',()=>{
 const u=unit();applyStatus(u,boost,{round:1,duration:2});expect(validateStatuses(undefined)).toBe(true);expect(validateStatuses(u.statuses)).toBe(true);
 for(const patch of [{startRound:0},{endRound:-1},{effects:[{kind:'speed',value:Infinity}]},{maxStacks:0},{stacks:3},{lastSettledRound:100}])expect(validateStatuses([{...u.statuses![0],...patch}])).toBe(false);
});
test('reactive unit states can be refreshed and projected without cloning proxies or mutating their effects',()=>{
 const u=reactive(unit());applyStatus(u,boost,{round:1,duration:2});applyStatus(u,boost,{round:2,duration:2});
 const projected=projectStatuses(u.statuses,new Set());expect(projected![0].endRound).toBe(3);projected![0].effects[0].value=99;expect(effectiveSpeed(u,2)).toBe(5);
});
