// @vitest-environment happy-dom
import {test,expect,afterEach,vi} from 'vitest';
import {mountGame,settleGame} from './helpers/mount-game.ts';
import {CAMPAIGN_SAVE_KEY,createCampaignStorage} from '../src/campaign/storage.ts';
import * as C from '../src/campaign/index.ts';
let mounted:Awaited<ReturnType<typeof mountGame>>|undefined;
afterEach(()=>{mounted?.wrapper.unmount();mounted=undefined;localStorage.clear();window.history.replaceState({},'','/');});
const button=(text:string)=>[...document.querySelectorAll<HTMLButtonElement>('button')].find(b=>b.textContent?.includes(text));
async function setup(){window.history.replaceState({},'','/tutorial');document.body.innerHTML='<div id="app"></div>';mounted=await mountGame();await settleGame();return mounted;}
test('campaign coach floats outside the battle and keeps hint, route and collapse controls usable',async()=>{
 const {session:vm}=await setup();vm.startCampaign(false);await settleGame();
 const coach=document.querySelector<HTMLElement>('.campaign-coach')!;
 expect(coach.parentElement).toBe(document.body);
 expect(document.querySelector('.battle-screen .campaign-coach')).toBeNull();
 const toggle=coach.querySelector<HTMLButtonElement>('.campaign-collapse')!;
 expect(toggle.getAttribute('aria-expanded')).toBe('true');
 toggle.click();await settleGame();expect(toggle.getAttribute('aria-expanded')).toBe('false');
 expect(coach.querySelector('.campaign-details')).toBeNull();
 toggle.click();await settleGame();button('给我提示')!.click();await settleGame();
 expect(coach.querySelector('.campaign-hint')).toBeTruthy();
 button('查看航程')!.click();await settleGame();expect(coach.querySelector('.campaign-route')).toBeTruthy();
 button('保存并退出')!.click();await settleGame();expect(document.querySelector('.campaign-coach')).toBeNull();
});
for(const key of [' ','Enter'])test(`reading the coach with ${JSON.stringify(key)} does not issue a battle command`,async()=>{
 const {session:vm}=await setup();vm.startCampaign(false);await settleGame();
 const details=document.querySelector<HTMLElement>('.campaign-details')!;details.focus();
 const orders=JSON.stringify(vm.plans),event=new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true});
 details.dispatchEvent(event);
 expect(event.defaultPrevented).toBe(false);
 expect(JSON.stringify(vm.plans)).toBe(orders);expect(vm.busy).toBe(false);
});
test('campaign entrance starts one real ship on the long map and preserves ordinary saves',async()=>{
 localStorage.setItem('azurlane-chess:v1:auto','ordinary-preserved');const {session:vm}=await setup();
 expect(button('开始归航行动')).toBeTruthy();button('开始归航行动')!.click();await settleGame();
 expect(vm.game?.map).toMatchObject({width:13,height:72});expect(vm.own).toHaveLength(1);expect(vm.game?.ships.filter(s=>s.team===1)).toHaveLength(0);
 const deadline=Date.now()+2000;while(!document.querySelector('[data-map-cell]')&&Date.now()<deadline){await new Promise(r=>setTimeout(r,10));await settleGame();}
 expect(document.querySelectorAll('[data-map-cell]')).toHaveLength(936);expect(button('继续航行')).toBeUndefined();
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
 expect(vm.campaignTransit).toBe(true);expect(button('继续航行')).toBeUndefined();expect(document.querySelector('.campaign-transit')).toBeNull();
 vm.finishCampaignTransit();await settleGame();
 const checkpoint=vm.campaign?.checkpoint;expect(checkpoint).toBeGreaterThan(initial!);
 vm.goHome();await settleGame();expect(vm.campaign).toBeNull();vm.startCampaign(true);await settleGame();
 expect(vm.campaign?.checkpoint).toBe(checkpoint);expect(vm.game?.map.height).toBe(72);
 vm.retryCampaign();await settleGame();expect(vm.campaign?.checkpoint).toBe(checkpoint);expect(vm.campaign?.status).toBe('playing');
});

test('a completed checkpoint sails into the next one automatically without a continue control',async()=>{
 const callbacks=new Map<number,FrameRequestCallback>();let handle=0,time=performance.now();
 const request=vi.spyOn(window,'requestAnimationFrame').mockImplementation(callback=>{callbacks.set(++handle,callback);return handle;});
 const cancel=vi.spyOn(window,'cancelAnimationFrame').mockImplementation(id=>{callbacks.delete(id);});
 try{
  const {session:vm}=await setup();vm.startCampaign(false);await settleGame();
  vm.campaignSuggest();await vm.execute();vm.complete();await settleGame();
  expect(vm.campaignTransit).toBe(true);expect(vm.campaign?.checkpoint).toBe(0);
  expect(document.querySelector('.campaign-transit')).toBeNull();expect(button('继续航行')).toBeUndefined();
  expect(document.querySelector('[data-campaign-focus],[data-tutorial-highlight="true"]')).toBeNull();
  expect(vm.mapModel.ships.some(s=>s.tutorial)).toBe(false);expect(vm.mapModel.cells.some(c=>c.tutorial)).toBe(false);
  vm.playSpeed=1;const progress=vm.progress;
  time=performance.now()+110;let next=[...callbacks.values()];callbacks.clear();next.forEach(callback=>callback(time));
  const normalStep=vm.progress-progress;expect(normalStep).toBeGreaterThan(0);
  const previousProgress=vm.progress;vm.playSpeed=4;time+=110;
  next=[...callbacks.values()];callbacks.clear();next.forEach(callback=>callback(time));
  expect(vm.progress-previousProgress).toBeCloseTo(normalStep,8);expect(vm.playSpeed).toBe(4);
  for(let i=0;i<1000&&vm.campaignTransit;i++){
   time+=110;const next=[...callbacks.values()];callbacks.clear();next.forEach(callback=>callback(time));
  }
  await settleGame();expect(vm.campaign?.checkpoint).toBe(1);expect(vm.campaign?.status).toBe('playing');expect(vm.busy).toBe(false);
 }finally{request.mockRestore();cancel.mockRestore();}
});

test('checkpoint emphasis highlights movement and Cleveland dual targets, then clears for the next subject',async()=>{
 const {session:vm}=await setup();vm.startCampaign(false);await settleGame();
 expect(document.querySelector('.selected-stats [data-campaign-focus="speed"] strong')).toBeTruthy();
 const install=(chapter:number,checkpoint:number)=>{const state={...C.createCampaignState(),chapter,checkpoint},f=C.createCampaignFixture(state);vm.game=f.game;vm.plans=f.plans;vm.selected=f.selected;vm.campaign=state;};
 install(2,1);await settleGame();
 expect(document.querySelector('[data-campaign-focus="speed"]')).toBeNull();
 const dual=document.querySelector('.capability-note [data-campaign-focus="secondary"] strong');expect(dual?.textContent).toMatch(/2.*不同目标|两个不同目标/);
 install(3,0);await settleGame();
 expect(document.querySelector('[data-campaign-focus="secondary"]')).toBeNull();
 expect(document.querySelector('.selected-stats [data-campaign-focus="torpedo"] strong')).toBeTruthy();
 install(8,2);await settleGame();
 expect(vm.ship?.catalogId).toBe('cl-1');expect(document.querySelector('.capability-note [data-campaign-focus="aa"] strong')).toBeTruthy();
});
test('every checkpoint explains all of its configured ship capabilities in the rendered coach',async()=>{
 const {session:vm}=await setup();vm.startCampaign(false);await settleGame();
 for(const [chapter,definition] of C.CAMPAIGN_CHAPTERS.entries())for(const [checkpoint,point] of definition.checkpoints.entries()){
  const state={...C.createCampaignState(),chapter,checkpoint},f=C.createCampaignFixture(state);
  vm.game=f.game;vm.plans=f.plans;vm.selected=f.selected;vm.campaign=state;await settleGame();
  const topics=Object.values(point.emphasis).flat();expect(topics.length,point.id).toBeGreaterThan(0);
  for(const topic of topics)expect(document.querySelector(`.campaign-key-info [data-campaign-topic="${topic}"] strong`)?.textContent,point.id+' '+topic).toBeTruthy();
 }
},10000);
test('direct campaign route resumes a saved final deployment and accepts a different legal fleet',async()=>{
 const state={...C.createCampaignState(),chapter:9},fixture=C.createCampaignFixture(state);
 expect(createCampaignStorage(localStorage).write({state,...fixture}).ok).toBe(true);
 window.history.replaceState({},'','/tutorial/campaign');document.body.innerHTML='<div id="app"></div>';mounted=await mountGame();await settleGame();const vm=mounted.session;
 expect(vm.campaign?.chapter).toBe(9);expect(vm.game?.phase).toBe('deploy');
 const fleet=['dd-1','cl-1','ca-3','bb-2','cv-2'];vm.setCampaignFleet(fleet);await settleGame();expect(vm.campaignTransit).toBe(true);vm.finishCampaignTransit();await settleGame();expect(new Set(vm.own.map(s=>s.catalogId))).toEqual(new Set(fleet));
 vm.begin();await settleGame();expect(vm.game?.phase).toBe('plan');
});
test('reload during automatic sailing resumes the settled checkpoint and continues without losing progress',async()=>{
 const {session:vm}=await setup();vm.startCampaign(false);await settleGame();vm.campaignSuggest();await vm.execute();vm.complete();await settleGame();
 expect(vm.campaignTransit).toBe(true);const saved=JSON.parse(localStorage.getItem(CAMPAIGN_SAVE_KEY)!);
 expect(saved.save.state.status).toBe('checkpoint-complete');expect(saved.save.state.completed).toContain('forward');
 mounted!.wrapper.unmount();mounted=undefined;document.body.innerHTML='<div id="app"></div>';mounted=await mountGame();await settleGame();
 expect(mounted.session.campaignTransit).toBe(true);expect(mounted.session.campaign?.completed).toContain('forward');
 mounted.session.finishCampaignTransit();await settleGame();expect(mounted.session.campaign?.checkpoint).toBe(1);expect(mounted.session.busy).toBe(false);
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
