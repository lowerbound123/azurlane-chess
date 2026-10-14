import type {ShipType} from '../../shared/game.ts';
import type {OnlineState, RoundMessage, CommandPayload} from '../../shared/network.ts';

import {errorMessage} from '../lib/errors.ts';

import {materializeObservation, materializeResult} from '../../shared/network.ts';

import {toRaw} from "vue";
import * as E from "../engine.ts";

import {playFrames} from "../playback.ts";

import {normalizePublicModels} from "../server-preferences.ts";
import type {SessionCore} from './session-core.ts';
import type {SessionActions} from './session-actions.ts';
export function useConnection(core:SessionCore,actions:SessionActions){
const {mode, pendingTurn, torpWindow, replan, onlineGame, connectionOpen, disconnectOpen, playSpeed, connectionBusy, disconnectBusy, connectionWanted, connectionNickname, configLoading, configStale, onlineStatus, onlineError, onlineConfig, roster, aiFleet, aiMode, onlineBattleMode, onlineState, onlinePending, tutorial, accountState, onlineActive, game, plans, selected, busy, playFrame, finished, progress, history, lastMovement, preferences, roomCode, roomSeconds, onlineHasFlow, onlineUnavailable, onlineDominationAvailable, onlineModeHelp, currentAIModel, myTeam, onlineClient, accountClient, saves, lesson, router, runtime}=core;
async function syncAccount() { try { await accountClient.refresh(); } catch { /* A transient outage must not sign a player out. */ } }
function openOnline() { disconnectOpen.value = false; connectionOpen.value = true; }
function closeConnectionCard() { if (connectionBusy.value || disconnectBusy.value) return; connectionOpen.value = false; disconnectOpen.value = false; }
function requestDisconnect() {
    if (onlineHasFlow.value && onlineState.value?.match?.stage !== 'ended') {  connectionOpen.value = false; disconnectOpen.value = true; }
    else return confirmDisconnect();
  }
async function confirmDisconnect() {
    if (disconnectBusy.value || onlinePending.value) return false;
    if (onlineHasFlow.value && onlineStatus.value !== 'connected') { onlineError.value = '请等待连接恢复后确认退出'; return false; }
    disconnectBusy.value = true;
    try {
      if (onlineState.value?.match) {
        if (onlineState.value!.match!.stage !== 'ended' && !await onlineCommand('match.resign')) return false;
        if (!await onlineCommand('match.leave')) return false;
      } else if (onlineState.value?.room) {
        if (!await onlineCommand('room.leave')) return false;
      } else if (onlineState.value?.queue) {
        if (!await onlineCommand('queue.leave')) return false;
      }
      runtime.connectionAttempt++; connectionBusy.value = false;
      onlineClient.close(); connectionWanted.value = false; preferences.saveConnection(false);
      if (onlineActive.value) restoreOfflineBattle();
      onlineState.value = null; connectionOpen.value = false; disconnectOpen.value = false;
      await router.push('/'); return true;
    } finally { disconnectBusy.value = false; }
  }
function navigateScreen(next: string) {
    if (next === 'battle') return router.push(tutorial.value ? {name:'lesson',params:{lessonId:tutorial.value!.lessonId}} : onlineActive.value ? {name:'online-battle',params:{matchId:onlineState.value!.match!.id}} : '/battle/local');
    if (next === 'online') return continueOnline();
    return router.push(({home:'/',new:'/new',fleet:'/new/local',book:'/guide',lessons:'/tutorial',saves:'/saves'})[next] || '/');
  }
function onlineDestination(state=onlineState.value) {
    return state?.match ? {name:state.match.game?'online-battle':'draft',params:{matchId:state.match.id}} : state?.room ? {name:'room',params:{code:state.room.code}} : state?.queue ? {name:'matchmaking'} : {name:'new-game'};
  }
function continueOnline() { if (onlineState.value?.match?.game) return enterOnlineBattle(); return router.push(onlineDestination()); }
function resumeLocal() { if (onlineActive.value) restoreOfflineBattle(); return router.push('/battle/local'); }
async function refreshOnlineConfig() {
    const attempt=++runtime.configAttempt;
    configLoading.value = true;
    try {
      const response = await fetch('/api/config',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(5000)});
      if (!response.ok) throw new Error('模型列表暂不可用');
      const config = await response.json();
      if (runtime.disposed || attempt!==runtime.configAttempt) return;
      onlineConfig.value = {...config,models:normalizePublicModels(config.models)}; preferences.saveModels(onlineConfig.value.models); configStale.value = false;
    } catch { if (!runtime.disposed && attempt===runtime.configAttempt) configStale.value = true; }
    finally { if (attempt===runtime.configAttempt) configLoading.value = false; }
  }
async function createRoom() { if (onlineUnavailable.value) return actions.say(onlineUnavailable.value); return onlineCommand('room.create',{turnSeconds:Number(roomSeconds.value),battleMode:onlineBattleMode.value}); }
async function joinRoom() { if (onlineUnavailable.value) return actions.say(onlineUnavailable.value); return onlineCommand('room.join',{code:roomCode.value.trim().toUpperCase()}); }
async function startMatchmaking() { if (onlineUnavailable.value) return actions.say(onlineUnavailable.value); return onlineCommand('queue.join',{battleMode:onlineBattleMode.value}); }
async function startAIMatch() {
    if (onlineUnavailable.value || !currentAIModel.value) return actions.say(onlineUnavailable.value || '模型已不可用');
    return onlineCommand('ai.start',{modelId:currentAIModel.value.id,roster:aiFleet.value,aiMode:aiMode.value,battleMode:onlineBattleMode.value});
  }
function restoreOfflineBattle(){runtime.stopPlayback?.();onlineGame.busy=false;onlineGame.playFrame=null;onlineGame.finished=null;onlineGame.progress=0;runtime.onlineReplay=null;}
function enterOnlineBattle() {
    if (!onlineState.value?.match?.game) return;
    receiveOnlineState(onlineState.value, true);
    return router.push(onlineDestination());
  }
async function connectOnline(nickname=connectionNickname.value) {
    if (connectionBusy.value) return false;
    if (onlineStatus.value === 'connected') { connectionOpen.value = false; return true; }
    const attempt=++runtime.connectionAttempt; connectionBusy.value = true; onlineError.value = ''; connectionNickname.value = nickname;
    try {
      if (!accountState.value.loaded) await accountClient.initialize(); else await accountClient.refresh();
      if (attempt !== runtime.connectionAttempt || runtime.disposed) return false;
      onlineClient.setAccount(accountState.value.user);
      const config = await onlineClient.connect(nickname);
      if (attempt !== runtime.connectionAttempt || runtime.disposed) return false;
      runtime.configAttempt++; configLoading.value = false;
      onlineConfig.value = {...config,models:normalizePublicModels(config.models)}; preferences.saveModels(onlineConfig.value.models); configStale.value = false;
      connectionWanted.value = true; preferences.saveConnection(true,nickname); connectionOpen.value = false;
      validateCurrentRoute(); return true;
    } catch(error) {
      if (attempt === runtime.connectionAttempt && !runtime.disposed) { onlineError.value = '联机服务不可用：' + errorMessage(error); onlineStatus.value = 'disconnected'; }
      return false;
    } finally { if (attempt === runtime.connectionAttempt) connectionBusy.value = false; }
  }
async function onlineCommand(type: string, payload: CommandPayload = {}) {
    if (['ai.start','room.create','room.update','queue.join'].includes(type) && payload.battleMode==='domination' && !onlineDominationAvailable.value) { onlineError.value=onlineModeHelp.value;actions.say(onlineModeHelp.value);return false; }
    if (onlinePending.value) return false;
    onlinePending.value = true; onlineError.value = '';
    try { const match = onlineState.value?.match; await onlineClient.send(type, payload, match ? {matchId:match.id,round:match.round} : {}); return true; }
    catch(error) { onlineError.value = errorMessage(error); actions.say(errorMessage(error)); return false; }
    finally { onlinePending.value = false; }
  }
async function onlineRoster(next: ShipType[]) { if (!onlineState.value?.room || await onlineCommand('room.update',{roster:next})) roster.value = next; }
function receiveOnlineState(state: OnlineState, explicit: boolean = false) {
    const previous = onlineState.value?.match, previousRoom = onlineState.value?.room, entering = !onlineActive.value; onlineState.value = state;
    const route = router.currentRoute.value, following = explicit || route.meta.online;
    if (!state.match) {
      runtime.lastOnlineRound=null;onlineGame.game=null;onlineGame.plans={};onlineGame.history={};onlineGame.matchId=null;
      if (onlineActive.value) restoreOfflineBattle();

      if (following && (state.room || state.queue || (previous && ['online-battle','draft'].includes(String(route.name))) || (previousRoom && route.name === 'room'))) router.replace(onlineDestination(state));
      return;
    }
    if (!state.match.game) { if (following) router.replace(onlineDestination(state)); return; }
    if (following && !onlineActive.value) {
      actions.autosave(); tutorial.value = null;
      if (route.name !== 'online-battle' && !explicit) router.replace(onlineDestination(state));
    }
    // Retain the latest authoritative state, but finish the local replay first.
    if (onlineGame.finished && runtime.onlineReplay?.matchId === state.match.id && (state.match.stage !== 'ended' || state.match.result?.reason === '战斗结束')) return;
    if (onlineGame.finished) { runtime.stopPlayback?.(); runtime.onlineReplay=null;onlineGame.finished=null;onlineGame.playFrame=null; }
    const resetDraft=onlineGame.matchId!==state.match.id||onlineGame.game?.round!==state.match.round;
    onlineGame.matchId=state.match.id;
    onlineGame.game = materializeObservation(toRaw(state.match.game)); onlineGame.busy = ['resolving','playback'].includes(state.match.stage);
    if (resetDraft) { onlineGame.plans = {}; onlineGame.history = {}; onlineGame.lastMovement = {}; if (onlineActive.value) { mode.value = "move"; pendingTurn.value = 0; torpWindow.value = 0; replan.value = false; } }
    if (state.match.submitted?.[state.match.myTeam] && state.match.plans) onlineGame.plans = E.clone(toRaw(state.match.plans));
    if (!onlineGame.game.ships.some(s=>s.id===onlineGame.selected&&s.team===state.match!.myTeam)) onlineGame.selected=onlineGame.game.ships.find(s=>s.team===state.match!.myTeam&&E.alive(s))?.id||'';
  }
function receiveOnlineRound(message: RoundMessage) {
    if (!onlineActive.value || message.matchId !== onlineState.value?.match?.id) return;
    if (runtime.lastOnlineRound?.matchId === message.matchId && message.round <= runtime.lastOnlineRound!.round) return;
    runtime.lastOnlineRound = {matchId:message.matchId,round:message.round}; runtime.onlineReplay = runtime.lastOnlineRound;
    runtime.stopPlayback?.(); finished.value = materializeResult(message.result); busy.value = true; progress.value = 0;
    // Server snapshots are already clipped to visibility. Never interpolate into fog.
    runtime.stopPlayback = playFrames(finished.value!.frames || [], {
      speed: () => playSpeed.value, interpolate: false,
      render: (frame, fraction) => { playFrame.value = frame; progress.value = fraction; }, complete:actions.complete,
    });
  }
function validateCurrentRoute() {
    if (runtime.disposed) return;
    const route=router.currentRoute.value;
    if (route.name === 'ai-fleet' && !configLoading.value && !configStale.value && !currentAIModel.value) { actions.say('该 AI 模型已不可用，请重新选择'); router.replace('/new'); return; }
    if (!route.meta.online || onlineStatus.value !== 'connected' || !onlineState.value) return;
    const state=onlineState.value;
    if (['online-battle','draft'].includes(String(route.name))) {
      if (!state.match || state.match.id !== route.params.matchId) { actions.say('原在线对局已失效，请重新开始'); router.replace('/new'); return; }
      receiveOnlineState(state);
      const target=router.resolve(onlineDestination(state));
      if (target.path !== route.path) router.replace(target.fullPath);
    } else if (route.name === 'room') {
      if (state.match) router.replace(onlineDestination(state));
      else if (!state.room || state.room.code !== route.params.code) { roomCode.value=String(route.params.code||''); router.replace('/rooms/join'); }
    } else if (state.match || state.room) router.replace(onlineDestination(state));
  }
return {syncAccount,openOnline,closeConnectionCard,requestDisconnect,confirmDisconnect,navigateScreen,onlineDestination,continueOnline,resumeLocal,refreshOnlineConfig,createRoom,joinRoom,startMatchmaking,startAIMatch,restoreOfflineBattle,enterOnlineBattle,connectOnline,onlineCommand,onlineRoster,receiveOnlineState,receiveOnlineRound,validateCurrentRoute};
}
