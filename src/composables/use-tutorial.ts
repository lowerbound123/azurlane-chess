import * as C from '../campaign/index.ts';
import type {Hex} from '../../shared/game.ts';

import type {TutorialCondition, TutorialAction} from '../../shared/tutorial.ts';

import {toRaw} from "vue";
import * as E from "../engine.ts";
import * as P from "../planning.ts";

import * as T from "../tutorial-content.ts";

import type {SessionCore} from './session-core.ts';
import type {SessionActions} from './session-actions.ts';
export function useTutorial(core:SessionCore,actions:SessionActions){
const {tutorialStore, mode, pendingTurn, torpWindow, showRanges, rangeMode, replan, showPlans, ordersOpen, swapMode, tutorial, tutorialFixture, tutorialFeedback, practiceSave, game, plans, selected, busy, playFrame, finished, progress, history, hover, screen, mapView, ship, plan, knowledge, reachable, overlayType, lesson, tutorialStep, tutorialIndex, router, runtime}=core;
function tutorialContext() {
    return { game: toRaw(game.value!), plans: toRaw(plans.value), selected: selected.value, mode: mode.value, rangeMode: { air: "plane", reach: "reachable" }[overlayType.value] || overlayType.value, showRanges: showRanges.value };
  }
function teach(event: TutorialAction, quiet: boolean = false) {
    if (!tutorial.value) return;
    const result = T.recordTutorialEvent(E, toRaw(tutorial.value), tutorialContext(), { shipId: selected.value, ...event });
    tutorial.value = result.state;
    if (result.feedback) {
      tutorialFeedback.value = result.feedback;
      if (result.advanced || !quiet) actions.say(result.feedback);
    }
  }
function startLesson(id: string, navigate: boolean = true) {
    if(core.campaign.value)actions.exitCampaign(false);
    ordersOpen.value=true; swapMode.value=false; mapView.value?.reset();
    if (!tutorial.value) {
      if (game.value) actions.autosave();

    }
    const fixture = T.createTutorialGame(E, id);
    tutorialFixture.value = fixture;
    tutorial.value = T.createTutorialState(id);
    game.value = fixture.game;
    E.updateExploration(game.value!);
    plans.value = fixture.plans;
    selected.value = fixture.selected;
    mode.value = fixture.mode || "move";
    rangeMode.value = fixture.rangeMode || "auto";
    showRanges.value = fixture.showRanges ?? true;
    showPlans.value = true;
    if (navigate) router.push({name:'lesson',params:{lessonId:id}});
    busy.value = false;
    playFrame.value = null;
    finished.value = null;
    progress.value = 0;
    history.value = {};
    for (const [id2, p] of Object.entries(fixture.plans)) {
      const s = fixture.game.ships.find((x) => x.id === id2);
      if (s && p.segments?.length) history.value[id2] = { undo: p.segments.map((segment) => P.trimMovement(s, p, knowledge.value, segment.start,game.value!.round).plan), redo: [] };
    }
    pendingTurn.value = 0;
    torpWindow.value = 0;
    hover.value = null;
    replan.value = false;
    tutorialFeedback.value = lesson.value?.description || "";
    practiceSave.value = null;
  }
function exitTutorial(navigate = true) {
    runtime.stopPlayback?.();
    tutorial.value = null;
    tutorialFixture.value = null;
    tutorialFeedback.value = "";
    tutorialStore.game=null;tutorialStore.plans={};tutorialStore.busy=false;tutorialStore.playFrame=null;tutorialStore.finished=null;
    if (navigate) screen.value = "home";
    actions.refreshSaves();
  }
function lessonMenu() {
    if (tutorial.value) exitTutorial();
    screen.value = "lessons";
  }
function nextLesson() {
    if (tutorial.value?.complete) {
      const next = T.TUTORIAL_LESSONS[tutorialIndex.value + 1];
      if (next) startLesson(next.id);
      else lessonMenu();
    }
  }
function savePractice() {
    practiceSave.value = E.clone(actions.snapshot());
    teach({ type: "save", saved: true });
    actions.say("\u6F14\u7EC3\u5DF2\u4FDD\u5B58\u5230\u5185\u5B58\uFF0C\u666E\u901A\u5B58\u6863\u672A\u6539\u52A8");
  }
function conditionHas(condition: TutorialCondition|null|undefined, type: string):boolean {
    return condition?.kind === "event" ? condition.types.includes(type) : !!(condition?.kind === "all" && condition.conditions.some((c) => conditionHas(c, type)));
  }
function inspectCell(h: Hex, clicked: boolean = false) {
    hover.value = h;
    if (tutorial.value && conditionHas(tutorialStep.value?.condition, "inspect")) {
      teach({ type: "inspect", cell: { q: h.q, r: h.r } }, !clicked);
      return true;
    }
    return false;
  }
function isControl(id: string) {
    if(core.campaign.value)return !core.campaignTransit.value&&core.campaign.value.status==='playing'&&C.campaignCheckpoint(core.campaign.value).controls.includes(id);
    return !!tutorialStep.value?.highlights.some((h) => h.kind === "control" && h.id === id);
  }
function isTutorialCell(h: Hex) {
    if(core.campaign.value)return !core.campaignTransit.value&&core.campaign.value.status==='playing'&&!!C.campaignCheckpoint(core.campaign.value).targets?.some(target=>E.same(target,h));
    return !!tutorialStep.value?.highlights.some((x) => x.kind === "cell" && E.same(x.cell, h));
  }
function isTutorialShip(id: string) {
    if(core.campaign.value){const s=game.value?.ships.find(s=>s.id===id);return !core.campaignTransit.value&&core.campaign.value.status==='playing'&&!!(s?.catalogId&&C.campaignCheckpoint(core.campaign.value).emphasis[s.catalogId]);}
    return !!tutorialStep.value?.highlights.some((x) => x.kind === "ship" && x.shipId === id);
  }
function rangeChanged() {
    teach({ type: "overlay", rangeMode: overlayType.value });
  }
function toggleRanges() {
    showRanges.value = !showRanges.value;
    rangeChanged();
  }
return {tutorialContext,teach,startLesson,exitTutorial,lessonMenu,nextLesson,savePractice,conditionHas,inspectCell,isControl,isTutorialCell,isTutorialShip,rangeChanged,toggleRanges};
}
