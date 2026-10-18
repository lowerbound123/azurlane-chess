import {useHistorical} from './composables/use-historical.ts';
import {getHistoricalDefinition} from './history/index.ts';
import type {HistoricalId} from '../shared/history.ts';
import {useCampaign} from './composables/use-campaign.ts';
import {useEventListener} from '@vueuse/core';

import type {Router} from 'vue-router';

import {watch, onMounted, onUnmounted} from "vue";
import * as E from "./engine.ts";
import * as P from "./planning.ts";
import * as S from "./save.ts";
import * as T from "./tutorial-content.ts";

import {createSessionCore} from './composables/session-core.ts';
import type {SessionActions} from './composables/session-actions.ts';
import {useConnection} from './composables/use-connection.ts';
import {useSaves} from './composables/use-saves.ts';
import {useTutorial} from './composables/use-tutorial.ts';
import {usePlanning} from './composables/use-planning.ts';
import {useReplay} from './composables/use-replay.ts';
import {useMap} from './composables/use-map.ts';
import {useGameAudio} from './composables/use-game-audio.ts';
export function createAppSession(router:Router){
// Actions are assembled synchronously before any lifecycle event or I/O callback can use them.
const actions={} as SessionActions;
const core=createSessionCore(router,actions);
const campaignController=useCampaign(core,actions);
const historicalController=useHistorical(core,actions);
Object.assign(actions,campaignController,historicalController,useConnection(core,actions),useSaves(core,actions),useTutorial(core,actions),usePlanning(core,actions),useReplay(core,actions),useMap(core,actions));
const audio=useGameAudio(core);
actions.refreshSaves();
useEventListener(window,'keydown',actions.keydown);useEventListener(window,'focus',actions.syncAccount);
const {ui, connection, localGame, showRules, showLog, connectionBusy, connectionWanted, startupComplete, onlineStatus, onlineState, tutorial, campaign, onlineActive, activeBattle, game, busy, preferences, onlineClient, accountClient, onlineTicker, saves, ship, lesson, computer, runtime}=core;
const {syncAccount, refreshOnlineConfig, restoreOfflineBattle, connectOnline, refreshSaves, applySavedState, startLesson, exitTutorial, say, keydown, validateCurrentRoute}=actions;
watch([onlineStatus,onlineState],()=>{if(!connectionBusy.value)validateCurrentRoute();},{flush:'post'});
const removeBefore=router.beforeEach((to,from)=>{
    if (busy.value && !onlineActive.value && from.meta.battle && to.fullPath !== from.fullPath) { say('请先完成本回合播放'); return false; }
    if (to.name === 'lesson' && !T.TUTORIAL_LESSONS.some(l=>l.id===to.params.lessonId)) return '/tutorial';
    if(to.name==='historical-battle'&&!getHistoricalDefinition(String(to.params.scenarioId)))return '/history';
    if(core.historical.value&&(to.name!=='historical-battle'||to.params.scenarioId!==core.historical.value.scenarioId))actions.exitHistorical(false);
    if(campaign.value&&to.name!=='campaign')actions.exitCampaign(false);
    if (tutorial.value && to.name !== 'lesson') exitTutorial(false);
    if (onlineActive.value && (to.name !== 'online-battle' || to.params.matchId !== onlineState.value?.match?.id)) restoreOfflineBattle();
    if (to.name === 'local-battle' && !localGame.game) {
      const saved=saves.read('auto');
      if (saved.ok) applySavedState(saved.save.state,false);
      else { say('没有可恢复的本地战局，请开始新游戏'); return '/new/local'; }
    }
    return true;
  });
const removeAfter=router.afterEach((to,from,failure)=>{
    if (failure || runtime.disposed) return;
    showRules.value=false; showLog.value=false;
    if (from.meta.battle && !to.meta.battle) computer.dispose();
    if (to.name === 'saves') refreshSaves();
    if(to.name==='historical-battle'&&core.historical.value?.scenarioId!==to.params.scenarioId)actions.startHistorical(String(to.params.scenarioId) as HistoricalId,true,false);
    if(to.name==='historical-menu')core.historicalRevision.value++;
    if(to.name==='campaign'&&!campaign.value)actions.startCampaign(true,false);
    if (to.name === 'lesson' && tutorial.value?.lessonId !== to.params.lessonId) startLesson(String(to.params.lessonId),false);
    validateCurrentRoute();
  });
onMounted(() => {
    // The startup loader may outlive the router's initial navigation. Re-run the
    // settled location through this session's guards and initialization hooks.
    const initialRoute=router.currentRoute.value;
    if(initialRoute.matched.length)void router.replace({path:initialRoute.path,query:initialRoute.query,hash:initialRoute.hash,force:true});
    (async()=>{await Promise.allSettled([accountClient.initialize(),refreshOnlineConfig()]);
      if (!runtime.disposed && connectionWanted.value) await connectOnline();
      startupComplete.value=true; validateCurrentRoute();
    })();
  });
onUnmounted(() => {
    runtime.disposed=true; runtime.connectionAttempt++; activeBattle.value.generation++;computer.dispose(); removeBefore(); removeAfter();
    onlineClient.close(); onlineTicker.pause();

    clearTimeout(runtime.resolveTimer);clearTimeout(runtime.toastTimer);
    runtime.stopPlayback?.();
  });
return {...core,...campaignController,...historicalController,...actions,audio,E,P,S,T};
}
