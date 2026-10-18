// @vitest-environment happy-dom
import {afterEach,expect,test} from 'vitest';
import {mountGame,settleGame} from './helpers/mount-game.ts';
import * as C from '../src/campaign/index.ts';
import * as E from '../src/engine.ts';
import type {EffectPresentation} from '../shared/game.ts';

let mounted:Awaited<ReturnType<typeof mountGame>>|undefined;
afterEach(()=>{mounted?.wrapper.unmount();mounted=undefined;localStorage.clear();window.history.replaceState({},'','/');});

async function artillery(checkpoint=0){
 window.history.replaceState({},'','/tutorial');document.body.innerHTML='<div id="app"></div>';
 mounted=await mountGame();const vm=mounted.session;vm.startCampaign(false);await settleGame();
 const state={...C.createCampaignState(),chapter:5,checkpoint},fixture=C.createCampaignFixture(state);
 const result=E.resolveRound(fixture.game,{...C.campaignReferencePlans(state,fixture.game),...C.campaignOrders(state,fixture.game)},{termination:'mission'});
 vm.campaign=state;vm.game=fixture.game;vm.selected=fixture.selected;vm.finished=result;vm.busy=true;
 const impact=result.presentation.find((e):e is EffectPresentation=>e.type==='effect'&&e.team===0&&['main','main-blast'].includes(e.kind))!;
 const take=(time:number)=>{vm.playFrame=result.frames.findLast(f=>f.t<=time)!;};
 const cell=(at=impact.at)=>vm.mapModel.cells.find(c=>c.k===E.key(at))!;
 return {vm,state,fixture,result,impact,take,cell};
}

for(const checkpoint of [0,1])test(`tutorial 06 checkpoint ${checkpoint} reveals a blind impact only during its explosion`,async()=>{
 const {vm,fixture,result,impact,take,cell}=await artillery(checkpoint);
 const target=fixture.game.ships.find(s=>s.team===1&&E.same(s.pos,impact.at))!;
 expect(E.shipVisible(fixture.game,target,0)).toBe(false);
 const original=JSON.stringify({game:fixture.game,frames:result.frames});
 take(1);const wasKnown=cell().known;expect(cell().visible).toBe(false);
 expect(vm.mapModel.ships.some(s=>s.id===target.id)).toBe(false);
 take(impact.time);
 expect(cell().visible).toBe(true);expect(cell().known).toBe(true);
 expect(vm.mapModel.ships.some(s=>s.id===target.id&&s.hp===0)).toBe(true);
 expect(vm.mapModel.visuals.effects.some(e=>e.id===impact.id)).toBe(true);
 if(checkpoint===1)for(let d=0;d<6;d++)expect(cell(E.add(impact.at,d)).visible).toBe(true);
 take(impact.time+impact.duration+.15);
 expect(cell().visible).toBe(false);expect(cell().known).toBe(wasKnown);
 expect(vm.mapModel.ships.some(s=>s.id===target.id)).toBe(false);
 expect(JSON.stringify({game:fixture.game,frames:result.frames})).toBe(original);
 vm.playFrame=null;expect(cell().visible).toBe(false);
});

test('ordinary local battle keeps an identical blind impact hidden',async()=>{
 const {vm,fixture,result,impact,cell}=await artillery();
 vm.busy=false;vm.campaign=null;vm.game=fixture.game;vm.finished=result;vm.playFrame=result.frames.find(f=>f.t===impact.time)!;vm.busy=true;
 expect(cell().visible).toBe(false);
 expect(vm.mapModel.ships.some(s=>s.team===1&&E.same(s.pos,impact.at))).toBe(false);
 expect(vm.mapModel.visuals.effects.some(e=>e.id===impact.id)).toBe(false);
});

test('other tutorial chapters and automatic transit do not inherit the artillery reveal',async()=>{
 const {vm,state,impact,take,cell}=await artillery();take(impact.time);
 vm.campaign={...state,chapter:6};expect(cell().visible).toBe(false);
 vm.campaign=state;vm.campaignTransit=true;expect(cell().visible).toBe(false);
});
