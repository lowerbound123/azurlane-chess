import {campaignOrders} from '../campaign/index.ts';


import {errorMessage} from '../lib/errors.ts';

import {materializeObservation} from '../../shared/network.ts';

import {toRaw} from "vue";
import * as E from "../engine.ts";
import * as P from "../planning.ts";

import {playFrames} from "../playback.ts";

import type {SessionCore} from './session-core.ts';
import type {SessionActions} from './session-actions.ts';
export function useReplay(core:SessionCore,actions:SessionActions){
const {mode, pendingTurn, torpWindow, playSpeed, replan, onlineState, tutorial, campaign, campaignTransit, tutorialFixture, onlineActive, activeBattle, game, plans, selected, busy, playFrame, finished, progress, history, lastMovement, onlineLocked, ship, plan, own, phase, computer, runtime}=core;
function mapExit() {
    if (finished.value) complete();
    else {
      activeBattle.value.generation++;computer.dispose();
      clearTimeout(runtime.resolveTimer);
      runtime.stopPlayback?.();
      busy.value = false;
      playFrame.value = null;
      progress.value = 0;
    }
    actions.goHome();
  }
async function execute() {
    if (onlineActive.value) { if (onlineLocked.value) return; return actions.onlineCommand("orders.submit", {plans:toRaw(plans.value)}); }
    if (busy.value || phase.value !== 'plan'||campaignTransit.value||campaign.value&&campaign.value.status!=='playing') return;
    busy.value = true;
    mode.value = "move";
    progress.value = 0;
    actions.teach({ type: "execute" });
    const session=activeBattle.value, generation=++session.generation;
    try {
      const state=E.clone(toRaw(session.game!)),orders=E.clone(toRaw(session.plans));
      const result=await computer.resolve({game:state,plans:orders,...(campaign.value?{opponentPlans:campaignOrders(toRaw(campaign.value),state),resolution:{termination:campaign.value.chapter===9?'fleet' as const:'mission' as const}}:tutorial.value?{opponentPlans:toRaw(tutorialFixture.value!.opponentPlans)}:{})});
      if(runtime.disposed||session.generation!==generation)return;
      session.finished=result;
      runtime.stopPlayback=playFrames(result.frames,{speed:()=>playSpeed.value,render:(frame,fraction)=>{session.playFrame=frame;session.progress=fraction;},complete});
    } catch(error) {
      if(!runtime.disposed&&session.generation===generation){session.busy=false;actions.say('结算出现异常：'+errorMessage(error));}
    }
  }
function complete() {
    if (onlineActive.value) { runtime.stopPlayback?.(); runtime.onlineReplay = null; finished.value = null; playFrame.value = null; progress.value = 0; plans.value = {}; history.value = {}; game.value = materializeObservation(toRaw(onlineState.value!.match!.game!)); busy.value = ["playback","resolving"].includes(onlineState.value!.match!.stage); mode.value = "move"; pendingTurn.value = 0; torpWindow.value = 0; replan.value = false; return; }
    if (!finished.value) return;
    runtime.stopPlayback?.();
    const outcomes = P.movementOutcomes(toRaw(game.value!), toRaw(plans.value), toRaw(finished.value));
    if(campaign.value)actions.recordCampaignRound(toRaw(game.value!),toRaw(plans.value),toRaw(finished.value));
    game.value = finished.value.game;
    finished.value = null;
    playFrame.value = null;
    busy.value = false;
    progress.value = 0;
    plans.value = {};
    lastMovement.value = {};
    history.value = {};
    replan.value = false;
    if (!E.alive(ship.value || { hp: 0 })) selected.value = own.value.find(E.alive)?.id || "";
    mode.value = "move";
    torpWindow.value = 0;
    pendingTurn.value = 0;
    actions.autosave();
    lastMovement.value = outcomes;
    const blocked = Object.entries(outcomes).filter(([,o])=>o.blocked);
    if (blocked.length) actions.say(blocked.map(([id,o])=>`${game.value!.ships.find(s=>s.id===id)?.label}：${o.reason}`).join('；'));
    actions.teach({ type: "roundComplete" });
  }
return {mapExit,execute,complete};
}
