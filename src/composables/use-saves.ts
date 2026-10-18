

import type {SaveState, SaveEnvelope} from '../../shared/save.ts';

import {errorMessage} from '../lib/errors.ts';

import {toRaw} from "vue";
import * as E from "../engine.ts";

import * as S from "../save.ts";

import {restoreFleet} from "../ship-catalog.ts";

import type {SessionCore} from './session-core.ts';
import type {SessionActions} from './session-actions.ts';
export function useSaves(core:SessionCore,actions:SessionActions){
const {localGame, mode, pendingTurn, torpWindow, planeMode, toast, showRanges, rangeMode, replan, showPlans, saveOpen, saveRecords, saveNotice, pendingSave, saveStatus, ordersOpen, swapMode, battleMode, roster, seed, selectedFleet, tutorial, campaign, historical, onlineActive, game, plans, selected, busy, playFrame, finished, progress, history, hover, screen, mapView, saves, ship, canSave, router, runtime}=core;
function snapshot():SaveState {
    if(!game.value)throw new Error('没有可保存的战局');
    return { game: E.clone(toRaw(game.value)), plans: E.clone(toRaw(plans.value)), selected: selected.value, roster: [...roster.value], seed: Number(seed.value), metadata: { showPlans: showPlans.value, showRanges: showRanges.value, rangeMode: rangeMode.value } };
  }
function refreshSaves() {
    saveRecords.value = saves.list();
  }
function autosave() {
    if(historical.value){actions.saveHistorical();return;}
    if(campaign.value){actions.saveCampaign();return;}
    if (!canSave.value) return;
    const result = saves.write("auto", snapshot(), { label: `\u81EA\u52A8 \xB7 R${String(game.value!.round).padStart(2, "0")}` });
    if (result.ok) saveStatus.value = "\u5DF2\u81EA\u52A8\u4FDD\u5B58";
    else {
      const first = saveStatus.value !== result.error.message;
      saveStatus.value = result.error.message;
      if (first) actions.say(result.error.message);
    }
    refreshSaves();
  }
function openSaves() {
    if(historical.value){actions.saveHistorical();actions.say(core.historicalNotice.value);return;}
    if(campaign.value){actions.saveCampaign();actions.say(core.campaignNotice.value);return;}
    if (onlineActive.value) return actions.say("联机对局由服务器保存，不能载入离线存档");
    if (tutorial.value) return actions.savePractice();
    if (busy.value) return actions.say("\u8BF7\u5148\u5B8C\u6210\u56DE\u5408\u7ED3\u7B97\uFF0C\u518D\u4FDD\u5B58\u6216\u8BFB\u53D6");
    saveNotice.value = "";
    pendingSave.value = null;
    refreshSaves();
    saveOpen.value = true;
  }
function closeSaves() {
    saveOpen.value = false;
    pendingSave.value = null;
  }
function writeSave({ id, label }: {id:string;label:string}, confirmed: boolean = false) {
    if (!canSave.value) return;
    if (!confirmed && saveRecords.value.find((r) => r.id === id)?.save) {
      pendingSave.value = { kind: "write", id, label, message: `\u8986\u76D6\u624B\u52A8\u69FD\u4F4D ${id.slice(-1)} \u4F1A\u66FF\u6362\u5176\u4E2D\u7684\u65E7\u6218\u5C40\u3002\u8BF7\u786E\u8BA4\uFF0C\u6216\u5148\u5BFC\u51FA\u65E7\u5B58\u6863` };
      return;
    }
    const result = saves.write(id, snapshot(), { label: label || `\u8230\u961F \xB7 R${String(game.value!.round).padStart(2, "0")}` });
    saveNotice.value = result.ok ? "\u624B\u52A8\u5B58\u6863\u5DF2\u4FDD\u5B58" : result.error.message;
    if(result.ok)pendingSave.value = null;
    refreshSaves();
  }
function applySavedState(state: SaveState, navigate: boolean = true) {
    localGame.audioEpoch++;
    swapMode.value=false; ordersOpen.value=true; mapView.value?.reset();
    runtime.stopPlayback?.();
    clearTimeout(runtime.toastTimer);
    localGame.game = E.clone(state.game);
    localGame.wakeTimeline=null;
    E.updateExploration(localGame.game!);
    localGame.plans = E.clone(state.plans);
    localGame.selected = state.selected;
    roster.value = [...state.roster];
    selectedFleet.value = restoreFleet(state.game.ships, state.roster);
    seed.value = state.seed;
    battleMode.value = state.game.battleMode ?? 'annihilation';
    localGame.busy = false;
    localGame.playFrame = null;
    localGame.finished = null;
    localGame.progress = 0;
    localGame.history = {};
    pendingTurn.value = 0;
    torpWindow.value = 0;
    mode.value = "move";
    planeMode.value = "point";
    localGame.hover = null;
    replan.value = false;
    showPlans.value = state.metadata?.showPlans ?? true;
    showRanges.value = state.metadata?.showRanges ?? true;
    rangeMode.value = "auto";
    toast.value = "";
    if (navigate) screen.value = "battle";
  }
function loadSave(id: string, confirmed: boolean = false) {
    const result = saves.read(id);
    if (!result.ok) {
      saveNotice.value = result.error.message;
      return;
    }
    if (game.value && !confirmed) {
      pendingSave.value = { kind: "load", id, message: "\u8BFB\u53D6\u5C06\u66FF\u6362\u5F53\u524D\u6218\u5C40\uFF0C\u81EA\u52A8\u5B58\u6863\u968F\u540E\u4F1A\u8BB0\u5F55\u65B0\u6218\u5C40\u3002\u5982\u9700\u4FDD\u7559\u5F53\u524D\u5185\u5BB9\uFF0C\u8BF7\u5148\u5B58\u5165\u624B\u52A8\u69FD\u4F4D\u6216\u5BFC\u51FA JSON" };
      return;
    }
    applySavedState(result.save.state);
    closeSaves();
    saveStatus.value = "\u5DF2\u8BFB\u53D6\u5B58\u6863";
  }
function confirmSaveAction() {
    const action = pendingSave.value;
    if (!action) return;
    if (action.kind === "write") writeSave(action, true);
    else if (action.kind === "load") loadSave(action.id, true);
    else if (action.kind === "import") commitImport(action.id, action.json);
    else if (action.kind === "new") {
      closeSaves();
      if (action.start) actions.start(true); else screen.value = "fleet";
    }
  }
function commitImport(id: string, json: string) {
    const result = saves.import(id, json);
    saveNotice.value = result.ok ? "JSON \u5DF2\u5BFC\u5165\u69FD\u4F4D\uFF0C\u53EF\u70B9\u51FB\u8BFB\u53D6" : result.error.message;
    if(result.ok)pendingSave.value = null;
    refreshSaves();
  }
async function importSave({ id, file }: {id:string;file:File|undefined}) {
    if (!file) return;
    try {
      if (file.size > S.MAX_SAVE_BYTES) throw new Error("\u5B58\u6863\u6587\u4EF6\u8FC7\u5927\uFF08\u6700\u5927 2 MB\uFF09");
      const json = await file.text();
      S.deserializeSave(json);
      if (saveRecords.value.find((r) => r.id === id)?.save) pendingSave.value = { kind: "import", id, json, message: `\u5BFC\u5165\u4F1A\u8986\u76D6\u624B\u52A8\u69FD\u4F4D ${id.slice(-1)}\uFF0C\u8BF7\u786E\u8BA4\u6216\u5148\u5BFC\u51FA\u65E7\u5B58\u6863` };
      else commitImport(id, json);
    } catch (error) {
      saveNotice.value = errorMessage(error);
    }
  }
function exportSave(envelope: SaveEnvelope|null = null) {
    try {
      const save = envelope || S.createSave(snapshot(), { label: `\u8230\u961F R${game.value!.round}` }), json = S.serializeSave(save), blob = new Blob([json], { type: "application/json" }), url = URL.createObjectURL(blob), link = document.createElement("a");
      link.href = url;
      link.download = S.exportFilename(save);
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1e3);
      saveNotice.value = "JSON \u5907\u4EFD\u5DF2\u5BFC\u51FA";
    } catch (error) {
      saveNotice.value = errorMessage(error);
    }
  }
function goHome() {
    if (onlineActive.value) { actions.restoreOfflineBattle(); screen.value = "home"; refreshSaves(); return; }
    if (busy.value) return;
    if(historical.value){actions.exitHistorical();return;}
    if(campaign.value){actions.exitCampaign();return;}
    if (tutorial.value) {
      actions.exitTutorial();
      return;
    }
    autosave();
    screen.value = "home";
    refreshSaves();
  }
function newGame() {
    if (busy.value && !onlineActive.value) return;
    autosave(); return router.push('/new');
  }
return {snapshot,refreshSaves,autosave,openSaves,closeSaves,writeSave,applySavedState,loadSave,confirmSaveAction,commitImport,importSave,exportSave,goHome,newGame};
}
