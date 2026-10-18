import {computed,nextTick,onScopeDispose,toRaw,watch} from 'vue';
import type {HistoricalId,HistoricalSave} from '../../shared/history.ts';
import type {RoundResult} from '../../shared/game.ts';
import * as H from '../history/index.ts';
import {createHistoricalStorage} from '../history/storage.ts';
import * as E from '../engine.ts';
import type {SessionCore} from './session-core.ts';
import type {SessionActions} from './session-actions.ts';

export function useHistorical(core:SessionCore,actions:SessionActions){
 const {historicalStore,historical,historicalNotice,historicalRevision,busy,computer,runtime,router,mode,pendingTurn,torpWindow,planeMode,airRole,replan,swapMode,showRanges,showPlans,rangeMode,ordersOpen,mapView}=core;
 const storage=createHistoricalStorage({getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value)});
 let previousControls:{showRanges:boolean;showPlans:boolean;rangeMode:typeof rangeMode.value;ordersOpen:boolean}|null=null;
 const historicalRecords=computed(()=>{
  void historicalRevision.value;
  return H.HISTORICAL_BATTLES.map(definition=>({definition,saved:storage.read(definition.id),best:storage.best(definition.id)}));
 });
 const historicalProgress=computed(()=>historical.value&&historicalStore.game?H.historicalObjectives(historicalStore.game,historical.value):[]);
 function resetTransient(){
  historicalStore.wakeTimeline=null;
  historicalStore.generation++;computer.dispose();runtime.stopPlayback?.();runtime.stopPlayback=undefined;
  historicalStore.busy=false;historicalStore.finished=null;historicalStore.playFrame=null;historicalStore.progress=0;historicalStore.history={};historicalStore.lastMovement={};historicalStore.hover=null;
  mode.value='move';pendingTurn.value=0;torpWindow.value=0;planeMode.value='point';airRole.value='bomber';replan.value=false;swapMode.value=false;
 }
 function saveHistorical(){
  if(!historical.value||!historicalStore.game||historicalStore.busy||runtime.disposed)return;
  const save:HistoricalSave={state:E.clone(toRaw(historical.value)),game:E.clone(toRaw(historicalStore.game)),plans:E.clone(toRaw(historicalStore.plans)),selected:historicalStore.selected};
  const result=storage.write(save);
  historicalNotice.value=result.ok?'本场进度已保存到本机':'历史战斗保存失败：'+result.message;
  historicalRevision.value++;
 }
 function exitHistorical(navigate=true){
  if(!historical.value)return;
  saveHistorical();resetTransient();historical.value=null;historicalStore.game=null;historicalStore.plans={};historicalStore.selected='';
  if(previousControls){showRanges.value=previousControls.showRanges;showPlans.value=previousControls.showPlans;rangeMode.value=previousControls.rangeMode;ordersOpen.value=previousControls.ordersOpen;previousControls=null;}
  if(navigate)void router.push('/');
 }
 function startHistorical(id:HistoricalId,resume=true,navigate=true){
  if(busy.value||runtime.disposed)return;
  const definition=H.getHistoricalDefinition(id);
  if(!definition){historicalNotice.value='没有找到这场历史战斗';void router.replace('/history');return;}
  if(resume&&historical.value?.scenarioId===id){if(navigate)void router.push({name:'historical-battle',params:{scenarioId:id}});return;}
  if(historical.value)exitHistorical(false);else actions.autosave();
  if(core.campaign.value)actions.exitCampaign(false);
  if(core.tutorial.value)actions.exitTutorial(false);
  const loaded=resume?storage.read(id):{kind:'missing' as const};
  if(loaded.kind==='error'){
   historicalNotice.value='历史战斗读取失败：'+loaded.message;
   historicalRevision.value++;void router.replace('/history');return;
  }
  previousControls={showRanges:showRanges.value,showPlans:showPlans.value,rangeMode:rangeMode.value,ordersOpen:ordersOpen.value};
  const save=loaded.kind==='resume'?loaded.save:H.createHistoricalBattle(id);
  if(!resume)storage.restart(save);
  resetTransient();historical.value=E.clone(save.state);historicalStore.game=E.clone(save.game);historicalStore.plans=E.clone(save.plans);historicalStore.selected=save.selected;
  E.updateExploration(historicalStore.game);showRanges.value=true;showPlans.value=true;rangeMode.value='auto';ordersOpen.value=true;
  const selected=historicalStore.game.ships.find(s=>s.id===save.selected);airRole.value=selected?.cfg.carrier?.slots?.[0]?.role??'bomber';
  saveHistorical();void nextTick(()=>mapView.value?.reset());
  if(navigate)void router.push({name:'historical-battle',params:{scenarioId:id}});
 }
 function recordHistoricalRound(result:RoundResult){
  if(historical.value&&result.historical&&historical.value.scenarioId===result.historical.scenarioId)historical.value=E.clone(result.historical);
 }
 function setHistoricalConvoy(route:'central'|'east',wait:boolean){
  const state=historical.value,g=historicalStore.game;
  if(!state||state.scenarioId!=='samar'||state.status!=='playing'||!g||busy.value)return;
  state.convoyRoute=route;state.convoyWait=wait&&state.convoyWaitLastRound!==g.round-1;saveHistorical();
 }
 function historicalMenu(){if(busy.value)return;exitHistorical(false);historicalRevision.value++;void router.push('/history');}
 watch([historical,()=>historicalStore.game,()=>historicalStore.plans,()=>historicalStore.selected],saveHistorical,{deep:true,flush:'post'});
 onScopeDispose(()=>{historicalStore.generation++;});
 return {historicalRecords,historicalProgress,startHistorical,exitHistorical,saveHistorical,recordHistoricalRound,setHistoricalConvoy,historicalMenu};
}
