// @vitest-environment happy-dom
import {afterEach,expect,test,vi} from 'vitest';
import * as THREE from 'three';
import {Board} from '../src/scene/board.ts';
import {fromCR,hexToXY,emptyPlan} from '../src/engine.ts';
import type {TacticalModels} from '../src/scene/tactical-models.ts';
import {HISTORICAL_SAVE_PREFIX} from '../src/history/storage.ts';
import {mountGame,settleGame} from './helpers/mount-game.ts';
let mounted:Awaited<ReturnType<typeof mountGame>>|undefined;
afterEach(()=>{mounted?.wrapper.unmount();mounted=undefined;localStorage.clear();window.history.replaceState({},'','/');});
async function setup(path='/history'){window.history.replaceState({},'',path);document.body.innerHTML='<div id="app"></div>';mounted=await mountGame();await settleGame();return mounted;}
test('home offers historical battles and all five independent cards are immediately available',async()=>{
 const {router}=await setup('/');
 expect(document.body.textContent).toContain('历史战斗');
 await router.push('/history');await settleGame();
 expect(document.querySelectorAll('[data-history-card]')).toHaveLength(5);
 for(const name of ['拉普拉塔','纳尔维克','丹麦海峡','中途岛','萨马岛'])expect(document.body.textContent).toContain(name);
 expect(document.body.textContent).not.toContain('尚未解锁');
});
test('briefing opens from a card and the visible start button enters the selected battle',async()=>{
 const {session:vm,router}=await setup();
 const card=document.querySelector('[data-history-card="denmark-strait"]')!;
 const briefing=[...card.querySelectorAll('button')].find(b=>b.textContent?.includes('作战简报'))!;
 briefing.click();await settleGame();
 expect(document.querySelector('[role="dialog"]')?.textContent).toContain('俾斯麦');
 const start=[...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')].find(b=>b.textContent==='开始战斗')!;
 start.click();await settleGame();expect(router.currentRoute.value.fullPath).toBe('/history/denmark-strait');expect(vm.own).toHaveLength(2);
});
test('direct historical routes load special fleets without replacing normal local autosaves',async()=>{
 localStorage.setItem('azurlane-chess:v1:auto','ordinary-preserved');
 const {session:vm}=await setup('/history/denmark-strait');
 expect(vm.historical?.scenarioId).toBe('denmark-strait');
 expect(vm.own).toHaveLength(2);expect(vm.game?.phase).toBe('plan');
 expect(vm.own.map(s=>s.label).join(' ')).toContain('俾斯麦');
 expect(document.body.textContent).toContain('突破');
 vm.addMove(0,true);await settleGame();
 expect(localStorage.getItem('azurlane-chess:v1:auto')).toBe('ordinary-preserved');
 vm.historicalMenu();await settleGame();expect(vm.historical).toBeNull();
 vm.startHistorical('midway',false);await settleGame();expect(vm.own).toHaveLength(3);
 expect(vm.own.every(s=>s.cfg.carrier?.stock===6)).toBe(true);
 vm.startHistorical('denmark-strait',true);await settleGame();
 expect(vm.plans['0-0']?.moves).toHaveLength(1);
 expect(localStorage.getItem('azurlane-chess:v1:auto')).toBe('ordinary-preserved');
});
test('Samar AI carriers can be inspected but cannot receive player orders or consecutive waits',async()=>{
 const {session:vm}=await setup('/history/samar');
 expect(vm.historical?.scenarioId).toBe('samar');
 const npc=vm.own.find(s=>s.cfg.carrier)!;vm.choose(npc);vm.addMove(0,true);vm.resetPlan();
 expect(vm.plans[npc.id]).toBeUndefined();
 expect(vm.historicalControlled(npc.id)).toBe(false);
 await settleGame();expect(document.body.textContent).toContain('友军自动指挥');
 const previewBefore=JSON.stringify(vm.historicalFriendlyOrders);
 vm.setHistoricalConvoy('east',true);await settleGame();expect(JSON.stringify(vm.historicalFriendlyOrders)).not.toBe(previewBefore);expect(vm.historical?.convoyRoute).toBe('east');
 expect(vm.historical?.convoyWait).toBe(true);
 vm.historical!.convoyWaitLastRound=vm.game!.round-1;
 vm.setHistoricalConvoy('central',true);expect(vm.historical?.convoyWait).toBe(false);
});
test('historical Worker results install only after playback and resume with exact mission counters',async()=>{
 const {session:vm}=await setup('/history/river-plate');
 expect(vm.historical?.lastResolvedRound).toBe(0);
 await vm.execute();expect(vm.historical?.lastResolvedRound).toBe(0);
 expect(vm.finished?.historical).toBeTruthy();
 vm.complete();await settleGame();expect(vm.historical?.lastResolvedRound).toBe(1);expect(vm.game?.round).toBe(2);
 const state=JSON.stringify(vm.historical);
 vm.historicalMenu();await settleGame();vm.startHistorical('river-plate',true);await settleGame();
 expect(JSON.stringify(vm.historical)).toBe(state);expect(vm.game?.round).toBe(2);
});
test('a moving ship can extract, finish playback and resume the surviving fleet',async()=>{
 const {session:vm}=await setup('/history/denmark-strait');
 const eugen=vm.game!.ships.find(s=>s.id==='0-1')!;
 eugen.pos=fromCR(3,11);eugen.xy=hexToXY(eugen.pos);eugen.heading=1;
 vm.choose(eugen);vm.addMove(0,true);await settleGame();
 await vm.execute();expect(vm.finished?.historical?.extracted['0-1']).toBeTruthy();
 expect(()=>vm.complete()).not.toThrow();await settleGame();
 expect(vm.busy).toBe(false);expect(vm.historical?.status).toBe('playing');
 expect(vm.lastMovement['0-1']).toMatchObject({blocked:false,reason:'已撤离'});
 expect(vm.selected).toBe('0-0');expect(vm.historicalNotice).not.toContain('失败');
 vm.historicalMenu();await settleGame();vm.startHistorical('denmark-strait');await settleGame();
 expect(vm.game?.round).toBe(2);expect(vm.historical?.extracted['0-1']).toBeTruthy();
});
test('carrier extraction preview explains the loss of airborne and newly launched aircraft',async()=>{
 const {session:vm}=await setup('/history/midway');
 const carrier=vm.game!.ships.find(s=>s.id==='0-0')!;
 carrier.pos=fromCR(23,10);carrier.xy=hexToXY(carrier.pos);carrier.heading=0;
 const p=emptyPlan();p.moves=[{turn:0,forward:true}];p.planes=[{slot:0,mode:'point',target:fromCR(22,10)}];vm.plans[carrier.id]=p;
 await settleGame();
 const preview=document.querySelector('[data-extraction-preview]');
 expect(preview?.textContent).toContain('企业');expect(preview?.textContent).toContain('本轮计划起飞 1 架');
 expect(preview?.textContent).toContain('仍在场的舰载机将随队撤离');
 vm.plans[carrier.id].moves=[];await settleGame();expect(document.querySelector('[data-extraction-preview]')).toBeNull();
});
test('changing historical deep link exits the previous battle and invalid identifiers return to menu',async()=>{
 const {session:vm,router}=await setup('/history/narvik');
 expect(vm.own).toHaveLength(4);
 await router.push('/history/midway');await settleGame();expect(vm.historical?.scenarioId).toBe('midway');expect(vm.own).toHaveLength(3);
 await router.push('/history/not-a-battle');await settleGame();expect(router.currentRoute.value.name).toBe('historical-menu');expect(vm.historical).toBeNull();
 await router.push('/tutorial/campaign');await settleGame();expect(vm.campaign).toBeTruthy();expect(vm.historical).toBeNull();
});
test('wide historical charts use AA coordinates and show public task regions through fog',async()=>{
 const {session:vm}=await setup('/history/midway');
 expect(vm.coord(fromCR(25,0))).toBe('Z1');expect(vm.coord(fromCR(26,0))).toBe('AA1');
 const context={fillRect(){},strokeRect(){},fillText(){},measureText(text:string){return {width:text.length*90};}} as unknown as CanvasRenderingContext2D;
 const canvas=vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(context);
 const board=new Board(new THREE.Scene(),{create:()=>new THREE.Group()} as unknown as TacticalModels);
 try{
  const model={...vm.mapModel,showPlans:false,showRanges:false,cells:vm.mapModel.cells.map(c=>({...c,known:false,visible:false}))};
  for(const phase of ['plan','execute']){
   board.update({...model,phase});
   expect(board.objectives.children.filter(o=>o.userData.missionRegion).map(o=>o.userData.missionRegion)).toEqual(vm.historicalDefinition!.regions.map(r=>r.id));
  }
  board.update({...model,regions:undefined});expect(board.objectives.children).toHaveLength(0);
 }finally{board.dispose();canvas.mockRestore();}
});
test('damaged historical saves are preserved until an explicit restart and other battles survive',async()=>{
 const key=`${HISTORICAL_SAVE_PREFIX}:river-plate`;
 localStorage.setItem(key,'broken');
 const {session:vm,router}=await setup('/history/river-plate');
 expect(router.currentRoute.value.name).toBe('historical-menu');expect(vm.historical).toBeNull();
 expect(localStorage.getItem(key)).toBe('broken');expect(document.body.textContent).toContain('读取失败');
 vm.startHistorical('samar',false);await settleGame();
 const other=localStorage.getItem(`${HISTORICAL_SAVE_PREFIX}:samar`);
 vm.historicalMenu();await settleGame();vm.startHistorical('river-plate',false);await settleGame();
 expect(vm.historical?.scenarioId).toBe('river-plate');expect(localStorage.getItem(key)).not.toBe('broken');
 expect(localStorage.getItem(`${HISTORICAL_SAVE_PREFIX}:samar`)).toBe(other);
});
test('unmount during calculation restores the stable historical plan without installing a stale result',async()=>{
 const {session:vm}=await setup('/history/river-plate');vm.addMove(0,true);await settleGame();
 const saved=localStorage.getItem(`${HISTORICAL_SAVE_PREFIX}:river-plate`);
 const pending=vm.execute();expect(vm.busy).toBe(true);
 mounted!.wrapper.unmount();mounted=undefined;await pending;
 expect(localStorage.getItem(`${HISTORICAL_SAVE_PREFIX}:river-plate`)).toBe(saved);
 document.body.innerHTML='<div id="app"></div>';mounted=await mountGame();await settleGame();
 expect(mounted.session.game?.round).toBe(1);expect(mounted.session.historical?.lastResolvedRound).toBe(0);
 expect(mounted.session.plans['0-0'].moves).toHaveLength(1);
});
