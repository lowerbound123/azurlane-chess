// @vitest-environment happy-dom
import {test,expect,afterEach} from 'vitest';
import {mountGame,settleGame} from './helpers/mount-game.ts';
import {CAMPAIGN_SAVE_KEY,createCampaignStorage} from '../src/campaign/storage.ts';
import * as C from '../src/campaign/index.ts';
let mounted:Awaited<ReturnType<typeof mountGame>>|undefined;
afterEach(()=>{mounted?.wrapper.unmount();mounted=undefined;localStorage.clear();window.history.replaceState({},'','/');});
const button=(text:string)=>[...document.querySelectorAll<HTMLButtonElement>('button')].find(b=>b.textContent?.includes(text));
async function setup(){window.history.replaceState({},'','/tutorial');document.body.innerHTML='<div id="app"></div>';mounted=await mountGame();await settleGame();return mounted;}
test('campaign entrance starts one real ship on the long map and preserves ordinary saves',async()=>{
 localStorage.setItem('azurlane-chess:v1:auto','ordinary-preserved');const {session:vm}=await setup();
 expect(button('开始归航行动')).toBeTruthy();button('开始归航行动')!.click();await settleGame();
 expect(vm.game?.map).toMatchObject({width:13,height:72});expect(vm.own).toHaveLength(1);expect(vm.game?.ships.filter(s=>s.team===1)).toHaveLength(0);
 const deadline=Date.now()+2000;while(!document.querySelector('[data-map-cell]')&&Date.now()<deadline){await new Promise(r=>setTimeout(r,10));await settleGame();}
 expect(document.querySelectorAll('[data-map-cell]')).toHaveLength(936);expect(button('继续航行')?.disabled).toBe(true);
 expect(button('鱼雷 T')).toBeUndefined();expect(localStorage.getItem('azurlane-chess:v1:auto')).toBe('ordinary-preserved');
 expect(localStorage.getItem(CAMPAIGN_SAVE_KEY)).toBeTruthy();
});
test('finishing the last checkpoint preserves the victorious board and resumes as completed',async()=>{
 const {session:vm}=await setup();vm.startCampaign(false);await settleGame();
 const state={...C.createCampaignState(),chapter:9,status:'checkpoint-complete' as const};
 const fixture=C.createCampaignFixture(state);fixture.game.ships.filter(s=>s.team===1).forEach(s=>s.hp=0);fixture.game.phase='ended';fixture.game.winner=0;
 vm.game=fixture.game;vm.plans={};vm.selected=fixture.selected;vm.campaign=state;await settleGame();
 vm.nextCampaign();vm.finishCampaignTransit();vm.finishCampaignTransit();await settleGame();
 expect(vm.campaign?.status).toBe('complete');expect(vm.game?.phase).toBe('ended');expect(vm.game?.winner).toBe(0);
 expect(vm.game?.ships.filter(s=>s.team===1).every(s=>s.hp===0)).toBe(true);
 vm.goHome();await settleGame();vm.startCampaign(true);await settleGame();expect(vm.campaign?.status).toBe('complete');expect(vm.game?.winner).toBe(0);
});
test('real campaign actions advance a checkpoint; exit and resume retain stable progress',async()=>{
 const {session:vm}=await setup();vm.startCampaign(false);await settleGame();const initial=vm.campaign?.checkpoint;
 vm.nextCampaign();expect(vm.campaign?.checkpoint).toBe(initial);
 for(let turn=0;turn<8&&vm.campaign?.status==='playing';turn++){
  vm.campaignSuggest();await vm.execute();vm.complete();await settleGame();
 }
 expect(vm.campaign?.status).toBe('checkpoint-complete');vm.nextCampaign();vm.finishCampaignTransit();await settleGame();
 const checkpoint=vm.campaign?.checkpoint;expect(checkpoint).toBeGreaterThan(initial!);
 vm.goHome();await settleGame();expect(vm.campaign).toBeNull();vm.startCampaign(true);await settleGame();
 expect(vm.campaign?.checkpoint).toBe(checkpoint);expect(vm.game?.map.height).toBe(72);
 vm.retryCampaign();await settleGame();expect(vm.campaign?.checkpoint).toBe(checkpoint);expect(vm.campaign?.status).toBe('playing');
});
test('direct campaign route resumes a saved final deployment and accepts a different legal fleet',async()=>{
 const state={...C.createCampaignState(),chapter:9},fixture=C.createCampaignFixture(state);
 expect(createCampaignStorage(localStorage).write({state,...fixture}).ok).toBe(true);
 window.history.replaceState({},'','/tutorial/campaign');document.body.innerHTML='<div id="app"></div>';mounted=await mountGame();await settleGame();const vm=mounted.session;
 expect(vm.campaign?.chapter).toBe(9);expect(vm.game?.phase).toBe('deploy');
 const fleet=['dd-1','cl-1','ca-3','bb-2','cv-2'];vm.setCampaignFleet(fleet);await settleGame();expect(new Set(vm.own.map(s=>s.catalogId))).toEqual(new Set(fleet));
 vm.begin();await settleGame();expect(vm.game?.phase).toBe('plan');
});
test('damaged campaign save redirects to the tutorial menu without overwriting it',async()=>{
 localStorage.setItem(CAMPAIGN_SAVE_KEY,'broken');window.history.replaceState({},'','/tutorial/campaign');document.body.innerHTML='<div id="app"></div>';mounted=await mountGame();await settleGame();
 expect(mounted.router.currentRoute.value.name).toBe('tutorial');expect(mounted.session.campaign).toBeNull();expect(localStorage.getItem(CAMPAIGN_SAVE_KEY)).toBe('broken');expect(document.body.textContent).toContain('读取失败');
});
test('reload during calculation restores the last planned checkpoint without leaking a stale result',async()=>{
 const {session:vm}=await setup();vm.startCampaign(false);await settleGame();vm.campaignSuggest();await settleGame();const saved=localStorage.getItem(CAMPAIGN_SAVE_KEY);
 const resolving=vm.execute();expect(vm.busy).toBe(true);expect(localStorage.getItem(CAMPAIGN_SAVE_KEY)).toBe(saved);mounted!.wrapper.unmount();mounted=undefined;await resolving;
 document.body.innerHTML='<div id="app"></div>';mounted=await mountGame();await settleGame();expect(mounted.session.campaign?.status).toBe('playing');expect(mounted.session.game?.round).toBe(1);expect(mounted.session.plans['0-0'].moves.length).toBeGreaterThan(0);
});
