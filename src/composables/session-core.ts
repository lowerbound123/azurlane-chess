import {shipCharacterProfile} from '../ship-art.ts';
import {useHistoricalStore} from '../stores/historical.ts';
import * as H from '../history/index.ts';
import {effectiveSpeed} from '../../shared/status.ts';
import * as C from '../campaign/index.ts';
import type {Ship,ShipType,Hex,XY,Plane,FrameShip,Plan,TorpedoOrder,GameMap} from '../../shared/game.ts';
import type {OnlineState,RoundMessage,CommandPayload} from '../../shared/network.ts';
import type {SaveState,SaveEnvelope} from '../../shared/save.ts';
import type {TutorialCondition,TutorialAction} from '../../shared/tutorial.ts';
import type {OrderMode} from '../stores/ui.ts';
import type {MapHandle} from '../composables/map-contract.ts';
import {BattleComputer} from '../composables/battle-computer.ts';
import {errorMessage} from '../lib/errors.ts';
import type {Router} from 'vue-router';
import {materializeObservation,materializeResult} from '../../shared/network.ts';
import {storeToRefs} from 'pinia';
import {useUIStore} from '../stores/ui.ts';
import {useConnectionStore} from '../stores/connection.ts';
import {useLocalGameStore} from '../stores/local-game.ts';
import {useOnlineGameStore} from '../stores/online-game.ts';
import {useTutorialStore} from '../stores/tutorial.ts';
import {useAccountStore} from '../stores/account.ts';
import { ref, computed, watch, nextTick, onMounted, onUnmounted, toRaw, shallowRef } from "vue";
import * as E from "../engine.ts";
import * as P from "../planning.ts";
import * as S from "../save.ts";
import * as T from "../tutorial-content.ts";
import { sampleBattleVisuals } from "../battle-visuals.ts";
import { playFrames } from "../playback.ts";
import { OnlineClient } from "../online.ts";
import { AccountClient } from "../account-client.ts";
import {planeForSlot} from '../ship-definitions.ts';
import { catalogFleet, getShip, fleetError, sortFleet, nameFleet, restoreFleet } from "../ship-catalog.ts";
import { createServerPreferences, normalizePublicModels } from "../server-preferences.ts";
import {useIntervalFn} from '@vueuse/core';
import type {SessionActions} from './session-actions.ts';
export function createSessionCore(router:Router,actions:SessionActions){
const runtime:{connectionAttempt:number;configAttempt:number;disposed:boolean;onlineReplay:{matchId:string;round:number}|null;lastOnlineRound:{matchId:string;round:number}|null;toastTimer:ReturnType<typeof setTimeout>|undefined;stopPlayback:(()=>void)|undefined;resolveTimer:ReturnType<typeof setTimeout>|undefined}={connectionAttempt:0,configAttempt:0,disposed:false,onlineReplay:null,lastOnlineRound:null,toastTimer:undefined,stopPlayback:undefined,resolveTimer:undefined};
const ui=useUIStore(),connection=useConnectionStore(),localGame=useLocalGameStore(),onlineGame=useOnlineGameStore(),tutorialStore=useTutorialStore(),historicalStore=useHistoricalStore();
const {historical,historicalNotice,historicalRevision}=storeToRefs(historicalStore);
const historicalDefinition=computed(()=>historical.value?H.getHistoricalDefinition(historical.value.scenarioId):undefined);
const historicalControlled=(id:string)=>!historical.value||!!historicalDefinition.value?.units.some(u=>u.id===id&&u.controlled);
const {connectionOpen,disconnectOpen,accountModal,mode,pendingTurn,torpWindow,planeMode,airRole,showRules,toast,playSpeed,showLog,showRanges,rangeMode,replan,showPlans,saveOpen,saveRecords,saveNotice,pendingSave,saveStatus,mapZoom,cameraRotate,ordersOpen,rangeToolsOpen,portraitHint,swapMode,coachOpen}=storeToRefs(ui);
const {connectionBusy,disconnectBusy,connectionWanted,connectionNickname,configLoading,configStale,startupComplete,onlineStatus,onlineError,onlineConfig}=storeToRefs(connection);
const {battleMode,roster,slot,seed,selectedFleet}=storeToRefs(localGame);
const {onlineBattleMode,aiFleet,aiMode,onlineState,onlinePending}=storeToRefs(onlineGame);
const {tutorial,tutorialFixture,tutorialFeedback,practiceSave,campaign,campaignNotice,campaignTransit,campaignOverview,campaignViewChapter,campaignFleet}=storeToRefs(tutorialStore);
const {accountState}=storeToRefs(useAccountStore());
const onlineActive=computed(()=>router.currentRoute.value.name==='online-battle');
const activeBattle=computed(()=>historical.value?historicalStore:tutorial.value||campaign.value?tutorialStore:onlineActive.value?onlineGame:localGame);
const game=computed({get:()=>activeBattle.value.game,set:value=>{activeBattle.value.game=value;}});
const plans=computed({get:()=>activeBattle.value.plans,set:value=>{activeBattle.value.plans=value;}});
const historicalFriendlyOrders=computed(()=>{
 if(!historical.value||!game.value)return {};
 // The planner clones plain data; track mutable convoy choices before unwrapping.
 void historical.value.convoyRoute;void historical.value.convoyWait;void historical.value.convoyWaitLastRound;
 return H.historicalFriendlyPlans(toRaw(game.value),toRaw(historical.value));
});
const previewPlans=computed(()=>({...plans.value,...historicalFriendlyOrders.value}));
const selected=computed({get:()=>activeBattle.value.selected,set:value=>{activeBattle.value.selected=value;}});
const busy=computed({get:()=>activeBattle.value.busy,set:value=>{activeBattle.value.busy=value;}});
const playFrame=computed({get:()=>activeBattle.value.playFrame,set:value=>{activeBattle.value.playFrame=value;}});
const finished=computed({get:()=>activeBattle.value.finished,set:value=>{activeBattle.value.finished=value;}});
const progress=computed({get:()=>activeBattle.value.progress,set:value=>{activeBattle.value.progress=value;}});
const history=computed({get:()=>activeBattle.value.history,set:value=>{activeBattle.value.history=value;}});
const lastMovement=computed({get:()=>activeBattle.value.lastMovement,set:value=>{activeBattle.value.lastMovement=value;}});
const hover=computed({get:()=>activeBattle.value.hover,set:value=>{activeBattle.value.hover=value;}});
const serverAddress = window.location.origin, serverHost = window.location.host;
const preferences = createServerPreferences(window.localStorage, serverAddress);
connectionWanted.value=preferences.wanted();
connectionNickname.value=preferences.nickname();
onlineConfig.value={models:preferences.models()};
const roomCode = ref(''),roomSeconds = ref(0);
const screen = computed<string>({get:()=>String(router.currentRoute.value.meta.screen||"home"),set:value=>actions.navigateScreen(value)});
const onlineClock = ref(Date.now());
const connectionStatusLabel = computed(() => ({connected:'已连接',connecting:'连接中',reconnecting:'断线重连中',disconnected:'未连接'})[onlineStatus.value] || '未连接');
const onlineHasFlow = computed(() => !!(onlineState.value?.room || onlineState.value?.queue || onlineState.value?.match));
const onlineUnavailable = computed(() => onlineStatus.value !== 'connected' ? '请先连接服务器' : onlinePending.value || disconnectBusy.value ? '正在确认操作，请稍候' : onlineHasFlow.value ? '请先继续或退出当前在线流程' : configStale.value ? '模型列表暂不可用，请重试连接' : '');
const onlineDominationAvailable=computed(()=>!configLoading.value&&!configStale.value&&onlineConfig.value.battleModes?.includes('domination')===true);
const onlineModeHelp=computed(()=>configLoading.value?'正在读取服务器对战模式，暂时只能选择舰队歼灭。':configStale.value?'服务器配置暂不可用，尚无法确认占领模式支持。':'当前服务器不支持三据点占领，请选择舰队歼灭。');
const currentAIModel = computed(() => onlineConfig.value?.models?.find(model => model.id === router.currentRoute.value.params.modelId));
const onlineResumeTitle = computed(() => onlineState.value?.match ? (onlineState.value!.match!.aiName || '玩家对战') + ' · ' + (onlineState.value!.match!.game ? '第 '+onlineState.value!.match!.round+' 回合' : '猜先与选禁') : onlineState.value?.room ? '房间 '+onlineState.value.room.code : '正在快速匹配');
const accountLocked = computed(() => !!(onlinePending.value || onlineState.value?.room || onlineState.value?.queue || onlineState.value?.match));
const myTeam = computed(() => onlineActive.value ? onlineState.value?.match?.myTeam ?? 0 : 0);
const onlineLocked = computed(() => onlineActive.value && (busy.value || onlineStatus.value !== 'connected' || onlinePending.value || onlineState.value?.match?.paused || onlineState.value?.match?.submitted?.[myTeam.value] || !['plan','deploy'].includes(onlineState.value?.match?.stage??'')));
const onlineClient = new OnlineClient({onState:state=>actions.receiveOnlineState(state), onRound:round=>actions.receiveOnlineRound(round), onStatus: status => onlineStatus.value = status, onError: error => onlineError.value = errorMessage(error), onAuthExpired: () => actions.syncAccount()});
const accountClient = new AccountClient({onChange: state => {
    const changed = accountState.value.user?.id !== state.user?.id;
    accountState.value = state;
    if (changed) {
      onlineClient.setAccount(state.user);
      if (accountLocked.value) onlineError.value = '账号状态已变化，请重新连接联机服务';
      actions.receiveOnlineState({player:null,room:null,queue:null,match:null});
    }
  }});
const onlineTicker = useIntervalFn(() => onlineClock.value = Date.now(), 1000);

const mapView = shallowRef<MapHandle|null>(null);
const modeLabel = computed(() => phase.value === 'deploy' ? (swapMode.value ? '交换位置：点另一艘友舰' : '部署') : ({move:'航线',torp:'鱼雷',main:'主炮',plane:'飞机',mine:'排雷',radar:'雷达'}[mode.value] || '查看'));
const saves = S.createSaveStorage();
const shapes = computed(()=>E.allHexes(game.value?.map).map((h) => {
    const p = E.hexToXY(h);
    return { ...h, k: E.key(h), x: p.x * 25 + 35, y: p.y * 25 + 35 };
  }));
const island = computed(() => new Set(game.value?.map.islands || [])),currentTemplate = computed(() => E.TEMPLATES[roster.value[slot.value]]),role = computed(() => slot.value < 3 ? "front" : "back");
const ship = computed(() => game.value?.ships.find((s) => s.id === selected.value)), plan = computed(() => previewPlans.value[selected.value] || E.emptyPlan()), nodes = computed(() => ship.value ? E.route(ship.value, plan.value, knowledge.value,game.value!.round) : []), own = computed(() => game.value?.ships.filter((s) => s.team === myTeam.value) || []), visible = computed(() => new Set(playFrame.value?.visible || (game.value ? (onlineActive.value ? game.value.visible || [] : [...E.visibleCells(game.value, 0)]) : []))), displayShips = computed(() => (playFrame.value?.ships || game.value?.ships.filter(E.alive) || []).filter((s) => s.team === myTeam.value || (onlineActive.value ? true : playFrame.value?.visibleShipIdsByTeam ? playFrame.value.visibleShipIdsByTeam[myTeam.value].includes(s.id) : E.shipVisible(game.value!,s,myTeam.value,visible.value)))), displayPlanes = computed(() => (playFrame.value?.planes || game.value?.planes || []).filter((p) => p.team === myTeam.value || visible.value.has(E.key(E.xyToHex(p.xy))))), mines = computed(() => (playFrame.value?.mines || game.value?.map.mines || []).filter(m=>explored.value.has(E.key(m)))), ourHP = computed(() => own.value.reduce((n, s) => n + s.hp, 0)), ourCount = computed(() => own.value.filter(E.alive).length), visibleEnemies = computed(() => displayShips.value.filter((s) => s.team !== myTeam.value).length), phase = computed(() => busy.value ? "execute" : onlineActive.value ? onlineState.value?.match?.stage : game.value?.phase), readyAircraft = computed(() => ship.value?.airReady.filter((n) => n <= game.value!.round).length || 0), safeLogs = computed(() => (game.value?.log || []).filter((e) => e.team === myTeam.value || e.team === null).slice(-35).reverse());
const explored = computed(() => new Set(playFrame.value?.explored || game.value?.explored?.[myTeam.value] || []));
const displayTorps = computed(() => (playFrame.value?.torpedoes || game.value?.torpedoes || []).filter(p => E.torpedoVisible(p, myTeam.value, visible.value, explored.value)));
const knowledge = computed(() => game.value ? P.knowledgeMap(game.value!.map, explored.value) : {width:E.W,height:E.H,islands: [], mines: [] });
const reachable = computed(() => ship.value && phase.value === "plan" ? P.reachable(ship.value, plan.value, knowledge.value,null,game.value!.round) : /* @__PURE__ */ new Map<string,P.ReachableState>());
const certain = computed(() => ship.value && phase.value === "plan" ? P.knownReachable(ship.value, plan.value, knowledge.value, explored.value,game.value!.round) : /* @__PURE__ */ new Map<string,P.ReachableState>());
const selectedAirConfig=computed(()=>ship.value?.cfg.carrier?.slots?.find(p=>p.role===airRole.value)??ship.value?.cfg.carrier?.plane);
const ranges = computed(() => ship.value ? P.ranges(ship.value, plan.value, knowledge.value,selectedAirConfig.value,game.value!.round) : { main: /* @__PURE__ */ new Set<string>(), secondary: /* @__PURE__ */ new Set<string>(), aa: /* @__PURE__ */ new Set<string>(), sweep: /* @__PURE__ */ new Set<string>(), air: /* @__PURE__ */ new Set<string>() });
const rays = computed(() => ship.value ? P.torpedoRays(ship.value, plan.value, knowledge.value, torpWindow.value,game.value!.round) : []);
const overlayType = computed(() => rangeMode.value !== "auto" ? rangeMode.value : mode.value === "move" ? "reach" : mode.value === "main" ? "main" : mode.value === "plane" ? "air" : mode.value === "radar" ? "radar" : mode.value === "mine" ? "sweep" : mode.value === "torp" ? "torp" : "reach");
const overlayCells = computed(() => !showRanges.value || phase.value !== "plan" ? /* @__PURE__ */ new Set() : overlayType.value === "radar" ? new Set(E.allHexes(game.value?.map).filter(h=>ship.value?.cfg.radar&&E.hexDist(ship.value.pos,h)<=ship.value.cfg.radar.range).map(E.key)) : overlayType.value === "reach" ? new Set(certain.value.keys()) : overlayType.value === "torp" ? new Set(rays.value.flatMap((r) => r.cells).map(E.key).filter((k) => explored.value.has(k))) : new Set([...(['main','secondary','aa','sweep','air'].includes(overlayType.value)?ranges.value[overlayType.value as 'main'|'secondary'|'aa'|'sweep'|'air']:[])].filter((k) => ["main", "air", "aa"].includes(overlayType.value) || explored.value.has(k))));
const routeConflicts = computed(() => ship.value && phase.value === 'plan'
    ? P.friendlyRouteConflicts(ship.value, plan.value, own.value, previewPlans.value, knowledge.value,game.value!.round) : []);
const canUndo = computed(() => !!history.value[selected.value]?.undo.length), canRedo = computed(() => !!history.value[selected.value]?.redo.length);
const hoverHint = computed(() => {
    if (!hover.value || !ship.value) return "";
    const h = hover.value, k = E.key(h), distance = E.hexDist(ship.value.pos, h), known = explored.value.has(k);
    let hint = known ? "" : "\u672A\u63A2\u7D22 \xB7 ";
    if (mode.value === "move") {
      const state = reachable.value.get(k);
      hint += state ? `\u4ECE\u822A\u7EBF\u672B\u7AEF ${state.cost} \u6B65${certain.value.has(k) ? "\u53EF\u8FBE" : " \xB7 \u8BD5\u63A2\u822A\u8DEF"}` : "\u5269\u4F59\u6B65\u9AA4\u5185\u4E0D\u53EF\u8FBE";
    } else if (mode.value === "main") hint += ranges.value.main.has(k) ? `\u4E3B\u70AE\u5C04\u7A0B\u5185 \xB7 ${distance} \u683C` : `\u4E3B\u70AE\u5C04\u7A0B\u5916 \xB7 ${distance} \u683C`;
    else if (mode.value === "plane" && ship.value.cfg.carrier) {
      const n = P.airDistance(ship.value.pos, h);
      hint += `\u5355\u7A0B ${n.toFixed(1)} / ${selectedAirConfig.value!.range} \u683C${n > selectedAirConfig.value!.range ? " \xB7 \u8D85\u51FA\u822A\u7A0B" : ""}`;
    } else if (mode.value === "mine") hint += ranges.value.sweep.has(k) ? "\u56DE\u5408\u521D\u6392\u96F7\u8303\u56F4\u5185" : "\u6392\u96F7\u8303\u56F4\u5916\u6216\u88AB\u5DF2\u77E5\u5C9B\u5C7F\u906E\u6321";
    else if (mode.value === "torp") hint += "\u91D1\u7EBF\uFF1A\u672C\u56DE\u5408\u822A\u7A0B \xB7 \u865A\u7EBF\uFF1A\u5269\u4F59\u5BFF\u547D\u8303\u56F4";
    return hint;
  });
const rangeHint = computed(() => overlayType.value === "reach" ? `\u822A\u7EBF\u672B\u7AEF\u5269\u4F59 ${plan.value.guard ? 0 : Math.max(0, (ship.value?effectiveSpeed(ship.value,game.value!.round):0) - plan.value.moves.length)} \u6B65 \xB7 \u7EFF\u8272\u4E3A\u5DF2\u77E5\u53EF\u8FBE` : overlayType.value === "secondary" ? "\u526F\u70AE\uFF1A\u89C4\u5212\u7EC8\u70B9\u8303\u56F4\uFF1B\u6CBF\u9014\u4ECD\u53EF\u81EA\u52A8\u5F00\u706B" : overlayType.value === "aa" ? "\u9632\u7A7A\uFF1A\u89C4\u5212\u7EC8\u70B9\u8303\u56F4\uFF0C\u4E0D\u53D7\u5C9B\u5C7F\u906E\u6321" : overlayType.value === "main" ? "\u4E3B\u70AE\uFF1A\u56DE\u5408\u521D\u8230\u4F4D\u5C04\u7A0B\uFF0C\u53EF\u9694\u5C9B\u76F2\u5C04" : overlayType.value === "sweep" ? "\u6392\u96F7\uFF1A\u56DE\u5408\u521D\u8230\u4F4D\u4E0E\u5DF2\u77E5\u76F4\u89C6\u8303\u56F4" : overlayType.value === "air" ? `飞机：母舰起飞位置的单程 ${selectedAirConfig.value?.range ?? E.RULES.plane.range} 格极限` : overlayType.value === "torp" ? "\u9C7C\u96F7\uFF1A\u5F53\u524D\u7A97\u53E3\u7684\u56DB\u4E2A\u5408\u6CD5\u4FA7\u5411\uFF1B\u5C9B\u5C7F\u5916\u7684\u672A\u77E5\u8DEF\u5F84\u4E0D\u4FDD\u8BC1\u7545\u901A" : "");
const airborne = computed(() => displayPlanes.value.filter((p) => p.team === myTeam.value && p.mother === selected.value));
const previews = computed(() => own.value.filter(E.alive).map((s) => {
    const p = previewPlans.value[s.id] || E.emptyPlan(), ns = E.route(s, p, knowledge.value,game.value!.round);
    return { ship: s, plan: p, nodes: ns, selected: s.id === selected.value, torps: p.torps.map((t) => {
      const n = ns[t.window];
      if (!n) return null;
      const ray = P.torpedoRays(s, p, knowledge.value, t.window,game.value!.round).find((r) => r.dir === t.dir);
      return ray ? { ...t, origin: n.pos, end: ray.roundEnd, fullEnd: ray.fullEnd } : null;
    }).filter((value):value is NonNullable<typeof value>=>value!==null), planes: p.planes.map((o) => {
      const target = o.mode !== "target" ? o.target : game.value!.ships.find((t) => t.id === o.targetId && visible.value.has(E.key(t.pos)))?.pos;
      return target ? { ...o, target } : null;
    }).filter((value):value is NonNullable<typeof value>=>value!==null) };
  }));
const mainTargets = computed(() => {
    const targets = new Map<string,{at:Hex;count:number;selected:boolean}>();
    for (const preview of previews.value) for (const h of preview.plan.main) {
      const k = E.key(h), t = targets.get(k) || { at: h, count: 0, selected: false };
      t.count++;
      t.selected = t.selected || preview.selected;
      targets.set(k, t);
    }
    return [...targets.values()];
  });
const canSave = computed(() => !!game.value && !busy.value && !tutorial.value && !campaign.value && !historical.value && !onlineActive.value);
const lesson = computed(() => tutorial.value ? T.TUTORIAL_LESSONS.find((l) => l.id === tutorial.value!.lessonId) : null);
const tutorialStep = computed(() => lesson.value?.steps[(tutorial.value?.stepIndex??0)] || null);
const tutorialIndex = computed(() => lesson.value ? T.TUTORIAL_LESSONS.findIndex((l) => l.id === lesson.value!.id) : -1);
const deploymentCells = computed(() => new Set((campaign.value ? E.allHexes(game.value?.map).filter(h=>{const {c,r}=E.toCR(h);return c>=2&&c<=10&&r>=8&&r<=11&&E.legal(game.value!.map,h);}) : E.deployment(myTeam.value,game.value?.map)).map(E.key)));
const mapCells = computed(() => shapes.value.map(h => ({q:h.q,r:h.r,k:h.k,
    known:explored.value.has(h.k), visible:visible.value.has(h.k),
    island:explored.value.has(h.k)&&island.value.has(h.k),
    deploy:phase.value==='deploy'&&deploymentCells.value.has(h.k),
    overlay:overlayCells.value.has(h.k)?overlayType.value:null,
    tutorial:actions.isTutorialCell(h), hovered:!!hover.value&&E.same(hover.value,h),
  })));
// A replay owns its public score, including before the final settlement frame.
const displayDomination = computed(() => playFrame.value ? playFrame.value.domination : game.value?.domination);
const mapModel = computed(() => ({
    visualTime:playFrame.value?.t,
    travelFocus:campaignTransit.value?playFrame.value?.cameraFocus:undefined,regions:historicalDefinition.value?.regions,domination:displayDomination.value,cells:mapCells.value, myTeam:myTeam.value, map:game.value?{width:game.value.map.width,height:game.value.map.height}:undefined,
    focusRegion:campaign.value&&!campaignOverview.value?{center:campaignViewChapter.value===null?C.campaignFocus(campaign.value):E.fromCR(6,Math.round((C.CAMPAIGN_CHAPTERS[campaignViewChapter.value].rows[0]+C.CAMPAIGN_CHAPTERS[campaignViewChapter.value].rows[1])/2)),radius:campaign.value.chapter===8||campaign.value.chapter===9?8:5}:undefined,
    ships:displayShips.value.map(s=>({...s,characterProfile:shipCharacterProfile(s,historical.value?.scenarioId),tutorial:actions.isTutorialShip(s.id)})),
    planes:displayPlanes.value.map(p=>({...p,angle:actions.planeAngle(p)})),
    torpedoes:displayTorps.value,mines:mines.value,round:playFrame.value?.round??game.value?.round,zones:playFrame.value?.zones??game.value?.zones,selected:selected.value,
    phase:phase.value,mode:mode.value,previews:previews.value,mainTargets:mainTargets.value,
    rays:rays.value,showPlans:showPlans.value,showRanges:showRanges.value,
    overlayType:overlayType.value,busy:busy.value,
    airRange:phase.value==='plan'&&showRanges.value&&overlayType.value==='air'&&ship.value?.cfg.carrier
      ?{origin:ship.value.pos,radius:selectedAirConfig.value!.range*Math.sqrt(3)}:null,
    visuals:playFrame.value&&finished.value
      ? onlineActive.value ? (playFrame.value.visuals || {projectiles:[],effects:[]}) : sampleBattleVisuals(finished.value.presentation||[],playFrame.value.t||0,E.presentationCells(visible.value,playFrame.value.zones),myTeam.value,[...displayShips.value,...displayPlanes.value])
      :{projectiles:[],effects:[]},
  }));
const computer=new BattleComputer();
const directionNames = ["\u4E1C", "\u4E1C\u5357", "\u897F\u5357", "\u897F", "\u897F\u5317", "\u4E1C\u5317"];
return {historicalStore,historical,historicalNotice,historicalRevision,historicalDefinition,historicalControlled,historicalFriendlyOrders,campaign,campaignNotice,campaignTransit,campaignOverview,campaignViewChapter,campaignFleet,shapes,island,currentTemplate,role,ui,connection,localGame,onlineGame,tutorialStore,connectionOpen,disconnectOpen,accountModal,mode,pendingTurn,torpWindow,planeMode,airRole,showRules,toast,playSpeed,showLog,showRanges,rangeMode,replan,showPlans,saveOpen,saveRecords,saveNotice,pendingSave,saveStatus,mapZoom,cameraRotate,ordersOpen,rangeToolsOpen,portraitHint,swapMode,coachOpen,connectionBusy,disconnectBusy,connectionWanted,connectionNickname,configLoading,configStale,startupComplete,onlineStatus,onlineError,onlineConfig,battleMode,roster,slot,seed,selectedFleet,onlineBattleMode,aiFleet,aiMode,onlineState,onlinePending,tutorial,tutorialFixture,tutorialFeedback,practiceSave,accountState,onlineActive,activeBattle,game,plans,selected,busy,playFrame,finished,progress,history,lastMovement,hover,serverAddress,serverHost,preferences,roomCode,roomSeconds,screen,onlineClock,connectionStatusLabel,onlineHasFlow,onlineUnavailable,onlineDominationAvailable,onlineModeHelp,currentAIModel,onlineResumeTitle,accountLocked,myTeam,onlineLocked,onlineClient,accountClient,onlineTicker,mapView,modeLabel,saves,ship,plan,nodes,own,visible,displayShips,displayPlanes,mines,ourHP,ourCount,visibleEnemies,phase,readyAircraft,safeLogs,explored,displayTorps,knowledge,reachable,certain,ranges,rays,overlayType,overlayCells,routeConflicts,canUndo,canRedo,hoverHint,rangeHint,airborne,previews,mainTargets,canSave,lesson,tutorialStep,tutorialIndex,deploymentCells,mapCells,displayDomination,mapModel,computer,directionNames,router,runtime};
}
export type SessionCore=ReturnType<typeof createSessionCore>;
