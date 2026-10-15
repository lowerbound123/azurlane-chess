import {computed,nextTick,onScopeDispose,toRaw,watch,ref} from 'vue';
import type {Game,Plans,RoundResult} from '../../shared/game.ts';
import type {CampaignFixture,CampaignSave,CampaignState} from '../../shared/campaign.ts';
import type {SessionCore} from './session-core.ts';
import type {SessionActions} from './session-actions.ts';
import * as C from '../campaign/index.ts';
import * as E from '../engine.ts';
import {createCampaignStorage} from '../campaign/storage.ts';
import {fleetError,sortFleet} from '../ship-catalog.ts';
import {playFrames} from '../playback.ts';

export function useCampaign(core:SessionCore,actions:SessionActions){
 const {tutorialStore,campaign,campaignNotice,campaignTransit,campaignOverview,campaignViewChapter,campaignFleet,tutorial,game,plans,selected,busy,history,mode,pendingTurn,torpWindow,planeMode,airRole,showRanges,showPlans,rangeMode,ordersOpen,swapMode,replan,mapView,router,computer,runtime}=core;
 const repo=createCampaignStorage({getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value)});
 const initial=repo.read();const savePresent=ref(initial.kind!=='missing');
 const campaignHasSave=computed(()=>campaign.value!==null||savePresent.value);
 if(initial.kind==='error')campaignNotice.value='教学进度读取失败：'+initial.message;
 let checkpointBase:CampaignFixture|null=null,pending:{state:CampaignState;transit:C.CampaignTransit;fleet?:string[]}|null=null;
 let previousControls:{showRanges:boolean;showPlans:boolean;rangeMode:string}|null=null;
 const campaignChapter=computed(()=>campaign.value?C.CAMPAIGN_CHAPTERS[campaign.value.chapter]:null);
 const campaignStep=computed(()=>campaign.value?C.campaignCheckpoint(campaign.value):null);
 const campaignTransitNotice=computed(()=>(core.playFrame.value as C.CampaignTransitFrame|null)?.notice??'舰队正在自动航行。');
 const campaignLearned=computed(()=>{
  const learned=new Set(['move']);if(!campaign.value)return learned;
  for(let c=0;c<=campaign.value.chapter;c++)for(const [i,point]of C.CAMPAIGN_CHAPTERS[c].checkpoints.entries())if(c<campaign.value.chapter||i<=campaign.value.checkpoint)point.unlocks.forEach(s=>learned.add(s));
  return learned;
 });
 function campaignAllowed(kind:string){return !campaign.value||campaignLearned.value.has(kind);}
 function resetTransient(){
  runtime.stopPlayback?.();tutorialStore.generation++;computer.dispose();
  tutorialStore.busy=false;tutorialStore.finished=null;tutorialStore.playFrame=null;tutorialStore.progress=0;tutorialStore.history={};tutorialStore.lastMovement={};tutorialStore.hover=null;
  mode.value='move';pendingTurn.value=0;torpWindow.value=0;planeMode.value='point';airRole.value='bomber';swapMode.value=false;replan.value=false;
 }
 function install(state:CampaignState,fixture:CampaignFixture,exploration?:string[][],resetView=true){
  resetTransient();tutorial.value=null;campaign.value=E.clone(state);
  tutorialStore.game=E.clone(fixture.game);tutorialStore.plans=E.clone(fixture.plans);tutorialStore.selected=fixture.selected;
  if(exploration)for(let team=0;team<2;team++)tutorialStore.game.explored[team]=[...new Set([...exploration[team],...tutorialStore.game.explored[team]])];
  E.updateExploration(tutorialStore.game);showRanges.value=true;showPlans.value=true;rangeMode.value='auto';ordersOpen.value=true;
  campaignOverview.value=false;campaignViewChapter.value=null;
  if(resetView)void nextTick(()=>mapView.value?.reset());
 }
 function saveCampaign(){
  if(!campaign.value||!game.value||busy.value||campaignTransit.value||runtime.disposed)return;
  const save:CampaignSave={state:E.clone(toRaw(campaign.value)),game:E.clone(toRaw(game.value)),plans:E.clone(toRaw(plans.value)),selected:selected.value,fleet:[...campaignFleet.value],...(checkpointBase?{checkpointExplored:E.clone(checkpointBase.game.explored)}:{})};
  const result=repo.write(save);if(result.ok){savePresent.value=true;campaignNotice.value='教学进度已保存到本机';}else campaignNotice.value='教学进度未保存：'+result.message;
 }
 function fresh(state:CampaignState,exploration?:string[][]){
  const fixture=C.createCampaignFixture(state,[...campaignFleet.value]);
  if(state.chapter===9)fixture.game.phase='deploy';
  install(state,fixture,exploration);checkpointBase=E.clone({game:toRaw(game.value!),plans:toRaw(plans.value),selected:selected.value});saveCampaign();
 }
 function startCampaign(resume=true,navigate=true){
  if(busy.value||campaignTransit.value)return;
  const loaded=resume?repo.read():{kind:'missing' as const};
  if(loaded.kind==='error'){campaignNotice.value='教学进度读取失败：'+loaded.message;if(router.currentRoute.value.name==='campaign')void router.replace('/tutorial');return;}
  if(!campaign.value){actions.autosave();previousControls={showRanges:showRanges.value,showPlans:showPlans.value,rangeMode:rangeMode.value};}
  if(loaded.kind==='resume'){
   const save=loaded.save;
   if(!C.CAMPAIGN_CHAPTERS[save.state.chapter]?.checkpoints[save.state.checkpoint]){campaignNotice.value='教学检查点已变化，请从本章入口继续。';const state=C.createCampaignState();state.chapter=save.state.chapter;state.completed=save.state.completed;fresh(state);}
   else{
    campaignFleet.value=save.fleet&&!fleetError(save.fleet)?save.fleet:['dd-2','cl-3','ca-1','bb-1','cv-3'];
    install(save.state,save);checkpointBase=C.createCampaignFixture(save.state,[...campaignFleet.value]);if(save.checkpointExplored)checkpointBase.game.explored=E.clone(save.checkpointExplored);
    campaignNotice.value='已恢复教学进度';
   }
  }else if(loaded.kind==='migrate'){
   const state=C.createCampaignState();state.chapter=loaded.chapter;state.completed=loaded.completed;fresh(state);campaignNotice.value='教学内容已更新，保留已完成章节，从本章入口继续。';
  }else{campaignFleet.value=['dd-2','cl-3','ca-1','bb-1','cv-3'];fresh(C.createCampaignState());}
  if(navigate)void router.push({name:'campaign'});
 }
 function exitCampaign(navigate=true){
  saveCampaign();pending=null;campaignTransit.value=false;resetTransient();campaign.value=null;
  tutorialStore.game=null;tutorialStore.plans={};checkpointBase=null;
  if(previousControls){showRanges.value=previousControls.showRanges;showPlans.value=previousControls.showPlans;rangeMode.value=previousControls.rangeMode;previousControls=null;}
  if(navigate)void router.push('/');
 }
 function retryCampaign(){
  if(!campaign.value||busy.value||campaignTransit.value)return;
  const state={...E.clone(toRaw(campaign.value)),status:'playing' as const,evidence:{},hintLevel:0,attempts:0,feedback:undefined};
  const fixture=checkpointBase??C.createCampaignFixture(state,[...campaignFleet.value]);install(state,fixture);saveCampaign();
 }
 function nextCampaign(){
  if(!campaign.value||busy.value||campaignTransit.value||campaign.value.status!=='checkpoint-complete')return;
  const previous=E.clone(toRaw(campaign.value)),next=C.advanceCampaign(previous);
  if(next.status==='complete'){campaign.value=next;saveCampaign();return;}
  startTransit(next,C.createCampaignFixture(next,[...campaignFleet.value]));
 }
 function startTransit(next:CampaignState,fixture:CampaignFixture,fleet?:string[]){
  if(!game.value||!campaign.value)return;
  saveCampaign();
  const transit=C.buildCampaignTransit(E.clone(toRaw(game.value)),fixture,{from:C.campaignFocus(campaign.value),to:C.campaignFocus(next),fromRadius:campaign.value.chapter>=8?8:5,toRadius:next.chapter>=8?8:5});
  pending={state:next,transit,fleet};campaignTransit.value=true;busy.value=true;
  core.finished.value=null;plans.value={};showPlans.value=false;campaignOverview.value=false;campaignViewChapter.value=null;
  const generation=++tutorialStore.generation;
  runtime.stopPlayback=playFrames(transit.frames,{speed:()=>1,render:(frame,fraction)=>{
   if(runtime.disposed||tutorialStore.generation!==generation)return;
   core.playFrame.value=frame;core.progress.value=fraction;
  },complete:()=>{if(!runtime.disposed&&tutorialStore.generation===generation)finishCampaignTransit();},interpolate:!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches});
 }
 function finishCampaignTransit(){
  if(!pending)return;const {state,transit,fleet}=pending;pending=null;
  runtime.stopPlayback?.();if(fleet)campaignFleet.value=fleet;campaignTransit.value=false;install(state,transit.fixture,undefined,false);
  checkpointBase=E.clone(transit.fixture);saveCampaign();
 }
 function recordCampaignRound(before:Game,submitted:Plans,result:RoundResult){
  if(campaign.value)campaign.value=C.evaluateCampaignRound(E.clone(toRaw(campaign.value)),before,submitted,result);
 }
 function campaignHint(){if(campaign.value&&!busy.value)campaign.value.hintLevel=Math.min(campaign.value.hintLevel+1,Math.max(2,campaignStep.value?.hints.length??0));}
 function campaignSuggest(){
  if(!campaign.value||!game.value||busy.value||campaignTransit.value||campaign.value.status!=='playing'||game.value.phase!=='plan')return;
  plans.value=C.campaignReferencePlans(toRaw(campaign.value),toRaw(game.value));history.value={};
  const active=Object.entries(plans.value).filter(([,p])=>p.moves.length||p.torps.length||p.main.length||p.planes.length||p.sweep||p.radar||p.smoke||p.guard||p.escort||p.mineSteps?.length);
  if(active.length&&!active.some(([id])=>id===selected.value))selected.value=active[0][0];
  actions.say('参考指令已填入，可以修改；准备好后点击执行回合。');saveCampaign();
 }
 function focusCampaign(chapter?:number){
  if(!campaign.value)return;if(chapter!==undefined&&(chapter<0||chapter>campaign.value.chapter))return;
  campaignViewChapter.value=chapter??null;campaignOverview.value=false;void nextTick(()=>mapView.value?.reset());
 }
 function overviewCampaign(){campaignOverview.value=true;void nextTick(()=>mapView.value?.reset());}
 function setCampaignFleet(ids:string[]){
  if(!campaign.value||campaign.value.chapter!==9||game.value?.phase!=='deploy'||busy.value)return;
  const error=fleetError(ids);if(error){actions.say(error);return;}const fleet=sortFleet(ids),state={...E.clone(toRaw(campaign.value)),status:'playing' as const,evidence:{},attempts:0};
  startTransit(state,C.createCampaignFixture(state,fleet),fleet);
 }
 watch([campaign,game,plans,selected],()=>{if(campaign.value)saveCampaign();},{deep:true,flush:'post'});
 watch(()=>[campaign.value?.status,busy.value,campaignTransit.value],()=>{
  if(campaign.value?.status==='checkpoint-complete'&&!busy.value&&!campaignTransit.value)nextCampaign();
 },{flush:'post'});
 onScopeDispose(()=>{pending=null;});
 return {campaignHasSave,campaignChapter,campaignStep,campaignTransitNotice,campaignLearned,campaignAllowed,startCampaign,exitCampaign,retryCampaign,nextCampaign,finishCampaignTransit,recordCampaignRound,campaignHint,campaignSuggest,focusCampaign,overviewCampaign,setCampaignFleet,saveCampaign};
}
