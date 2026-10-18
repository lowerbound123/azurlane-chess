import {effectiveSpeed} from '../../shared/status.ts';
import {columnLabel} from '../map-coordinates.ts';
import type {Ship, ShipType, Hex, FrameShip, Plan, TorpedoOrder,AirRole} from '../../shared/game.ts';

import type {OrderMode} from '../stores/ui.ts';

import {materializeObservation} from '../../shared/network.ts';

import {toRaw} from "vue";
import * as E from "../engine.ts";
import {planeForSlot} from '../ship-definitions.ts';
import * as P from "../planning.ts";

import {getShip, fleetError, sortFleet, nameFleet} from "../ship-catalog.ts";

import type {SessionCore} from './session-core.ts';
import type {SessionActions} from './session-actions.ts';
export function usePlanning(core:SessionCore,actions:SessionActions){
const {role, ui, connectionOpen, disconnectOpen, accountModal, mode, pendingTurn, torpWindow, planeMode, airRole, showRules, toast, showLog, showRanges, rangeMode, replan, showPlans, saveOpen, pendingSave, ordersOpen, swapMode, battleMode, roster, slot, seed, selectedFleet, onlineState, onlineActive, game, plans, selected, busy, playFrame, finished, progress, history, lastMovement, hover, screen, myTeam, onlineLocked, mapView, ship, plan, nodes, own, visible, mines, phase, readyAircraft, explored, knowledge, reachable, certain, routeConflicts, runtime}=core;
const setFleet = (ids: string[]) => { selectedFleet.value = ids; };
function chooseTurn(turn: number) {
    if(plan.value.guard)return say("海域封锁已牺牲本回合全部移动力，请先取消技能");
    pendingTurn.value = turn;
    actions.teach({ type: "turn", turn });
  }
function truncateNode(index: number, id: string) {
    if (phase.value !== "plan" || busy.value) return;
    if (selected.value !== id || mode.value !== "move") return;
    trimRoute(index);
    actions.teach({ type: "truncate", index });
  }
const say = (t: string) => {
    toast.value = t;
    clearTimeout(runtime.toastTimer);
    runtime.toastTimer = setTimeout(() => toast.value = "", 3500);
  };
const coord = (h: Hex) => {
    const p = E.toCR(h);
    return `${columnLabel(p.c)}${p.r + 1}`;
  };
function pickType(t: ShipType) {
    if (E.TEMPLATES[t].role === role.value) roster.value[slot.value] = t;
  }
function start(confirmed = false) {
    if (game.value && confirmed !== true) {
      actions.autosave(); actions.refreshSaves(); saveOpen.value = true;
      pendingSave.value = {kind:'new',start:true,message:'开始新游戏会替换当前本地战局。需要保留时，请先存入手动槽位或导出 JSON。'};
      return;
    }
    const error = fleetError(selectedFleet.value);
    if (error) { say(error); return; }
    selectedFleet.value = sortFleet(selectedFleet.value);
    roster.value = selectedFleet.value.map(id => getShip(id)!.template);
    ordersOpen.value=true; swapMode.value=false; mapView.value?.reset();
    const requestedSeed = Number(seed.value);
    seed.value = Number.isFinite(requestedSeed) ? Math.max(-Number.MAX_SAFE_INTEGER, Math.min(Number.MAX_SAFE_INTEGER, Math.trunc(requestedSeed))) || 20261004 : 20261004;
    runtime.stopPlayback?.();
    clearTimeout(runtime.toastTimer);
    busy.value = false;
    playFrame.value = null;
    progress.value = 0;
    pendingTurn.value = 0;
    torpWindow.value = 0;
    planeMode.value = "point";
    hover.value = null;
    toast.value = "";
    showLog.value = false;
    history.value = {};
    replan.value = false;
    rangeMode.value = "auto";
    showRanges.value = true;
    showPlans.value = true;
    game.value = E.createFleetGame(selectedFleet.value, Number(seed.value) || 20261004, undefined, battleMode.value);
    core.activeBattle.value.wakeTimeline=null;
    nameFleet(game.value!.ships, selectedFleet.value, 0);
    selected.value = "0-0";
    plans.value = {};
    lastMovement.value = {};
    screen.value = "battle";
    mode.value = "move";
    finished.value = null;
    actions.autosave();
  }
function choose(s: FrameShip) {
    if (s.team !== myTeam.value || !E.alive(s) || busy.value) return;
    swapMode.value=false;
    selected.value = s.id;airRole.value=s.cfg.carrier?.slots?.[0]?.role??'bomber';
    pendingTurn.value = 0;
    torpWindow.value = (plans.value[s.id]?.moves || []).length;
    mode.value = "move";
    replan.value = false;
    rangeMode.value = "auto";
    actions.autosave();
    actions.teach({ type: "select", shipId: s.id });
  }
function edit() {
    if(core.historical.value&&(!core.historicalControlled(selected.value)||core.historical.value.status!=='playing'))return null;
    if(core.campaign.value&&(core.campaign.value.status!=='playing'||core.campaignTransit.value))return null;
    if (onlineLocked.value) return null;
    if (!ship.value || !E.alive(ship.value) || phase.value !== "plan") return null;
    if (!plans.value[ship.value.id]) plans.value[ship.value.id] = E.emptyPlan();
    return plans.value[ship.value.id];
  }
function applyEdit(next: Plan) {
    const before = E.clone(toRaw(plan.value));
    if (!edit()) return false;
    P.recordEdit(history.value, selected.value, before, next);
    plans.value[selected.value] = next;
    torpWindow.value = Math.min(torpWindow.value, next.moves.length);
    actions.autosave();
    return true;
  }
function mutate(fn: (plan:Plan)=>unknown) {
    const next = E.clone(toRaw(plan.value));
    fn(next);
    return applyEdit(next);
  }
function toggleGuard() {
    if(!ship.value?.cfg.guard||!edit())return;
    mutate(p=>{if(p.guard)delete p.guard;else{p.guard=true;p.moves=[];p.segments=[];p.torps=p.torps.filter(t=>t.window===0);}});
    pendingTurn.value=0;torpWindow.value=0;
    say(plan.value.guard?"海域封锁已规划：当回合封锁邻格，牺牲全部移动力，鱼雷减伤60%":"已取消海域封锁，可重新规划移动");
  }
function toggleSmoke(){if(!ship.value?.cfg.smoke||!edit())return;if(!plan.value.smoke&&(ship.value.smokeLeft??0)<=0)return say('烟幕次数已用完');mutate(p=>{if(p.smoke)delete p.smoke;else{p.smoke=true;p.torps=[];}});}
function toggleEscort(){if(!ship.value?.cfg.escort||!edit())return;mutate(p=>{if(p.escort)delete p.escort;else{p.escort=true;Object.assign(p,P.trimMovement(ship.value!,p,knowledge.value,ship.value!.cfg.escort!.steps,game.value!.round).plan);}});}
function toggleMineStep(k:number){if(!ship.value?.cfg.minelayer||!edit())return;if(!nodes.value[k]||E.same(nodes.value[k].pos,nodes.value[k-1].pos))return say('仅可绑定前进步骤');const selected=plan.value.mineSteps??[];if(!selected.includes(k)&&selected.length>=Math.min(ship.value.minesLeft??0,ship.value.cfg.minelayer.max))return say('本回合布雷数量或库存已用完');mutate(p=>{p.mineSteps=selected.includes(k)?selected.filter(x=>x!==k):[...selected,k];});}
function selectAirRole(role:AirRole){airRole.value=role;if(role==='fighter'||role==='scout')planeMode.value='point';}
function nextAirSlot(){const s=ship.value!;return s.airReady.map((ready,slot)=>({ready,slot})).filter(x=>x.ready<=game.value!.round&&!plan.value.planes.some(p=>p.slot===x.slot)&&(!s.cfg.carrier!.slots||planeForSlot(s.cfg,x.slot).role===airRole.value)).sort((a,b)=>s.airHP[b.slot]-s.airHP[a.slot]||a.slot-b.slot)[0]?.slot;}
function trimRoute(length: number) {
    if(!ship.value)return;
    const result = P.trimMovement(ship.value, toRaw(plan.value), knowledge.value, length,game.value!.round);
    if (applyEdit(result.plan) && (result.removedTorps||result.removedMines)) say(`航线改变，取消 ${result.removedTorps} 个失效鱼雷指令、${result.removedMines} 个布雷步骤`);
    torpWindow.value = Math.min(torpWindow.value, length);
  }
function addMove(turn: number, forward: boolean) {
    if(plan.value.guard)return say("海域封锁已牺牲本回合全部移动力，请先取消技能");
    if (!edit()) return;
    if (plan.value.moves.length >= (plan.value.escort?Math.min(ship.value!.cfg.escort!.steps,effectiveSpeed(ship.value!,game.value!.round)):effectiveSpeed(ship.value!,game.value!.round))) return say("\u8BE5\u8230\u7684\u79FB\u52A8\u6B65\u9AA4\u5DF2\u7528\u5B8C");
    const end = nodes.value.at(-1)!, next = forward ? E.add(end.pos, E.mod(end.heading + turn)) : end.pos;
    if (!E.legal(knowledge.value, next)) return say("\u8FD9\u4E00\u6B65\u4F1A\u9A76\u5165\u5DF2\u77E5\u5C9B\u5C7F\u6216\u6D77\u56FE\u5916");
    mutate((p) => {
      const start2 = p.moves.length;
      p.moves.push({ turn, forward });
      (p.segments || (p.segments = [])).push({ start: start2, end: p.moves.length, target: { ...next } });
    });
    pendingTurn.value = 0;
    torpWindow.value = plan.value.moves.length;
    actions.teach({ type: "move", turn, forward });
  }
function undo(index: number|null = null) {
    if (!edit()) return;
    trimRoute(index === null ? Math.max(0, plan.value.moves.length - 1) : index);
    actions.teach({ type: "undo" });
  }
function undoWaypoint() {
    if(!ship.value)return;
    const segments = plan.value.segments || [];
    if (!segments.length) return undo();
    const target = P.trimMovement(ship.value, toRaw(plan.value), knowledge.value, segments.at(-1)!.start,game.value!.round).plan, last = history.value[selected.value]?.undo.at(-1);
    if (last && JSON.stringify(last) === JSON.stringify(target)) historyChange("undo");
    else {
      trimRoute(segments.at(-1)!.start);
      actions.teach({ type: "undo" });
    }
  }
function removeWaypoint(i: number) {
    const segment = plan.value.segments?.[i];
    if (segment) {
      trimRoute(segment.start);
      actions.teach({ type: "truncate", index: segment.start });
    }
  }
function clearMovement() {
    if (!edit()) return;
    trimRoute(0);
    pendingTurn.value = 0;
    torpWindow.value = 0;
  }
function startReplan() {
    clearMovement();
    replan.value = true;
    mode.value = "move";
    say("\u5DF2\u6E05\u9664\u672C\u8230\u822A\u7EBF\uFF0C\u5176\u4ED6\u6B66\u5668\u6307\u4EE4\u4FDD\u7559\u3002\u70B9\u51FB\u65B0\u822A\u70B9\u91CD\u65B0\u89C4\u5212");
    actions.teach({ type: "redraw" });
  }
function historyChange(direction: 'undo'|'redo') {
    if (busy.value || !edit()) return;
    const next = P.historyStep(history.value, selected.value, toRaw(plan.value), direction);
    if (next) {
      plans.value[selected.value] = next;
      torpWindow.value = Math.min(torpWindow.value, next.moves.length);
      pendingTurn.value = 0;
      actions.autosave();
      actions.teach({ type: direction });
    }
  }
function removeOrder(kind: 'moves'|'torps'|'main'|'planes'|'sweep'|'radar', index: number=0) {
    mutate((p) => {
      if(kind==='radar')delete p.radar;else if (kind === "sweep") p.sweep = null;
      else p[kind].splice(index, 1);
    });
  }
function pathTo(h: Hex) {
    if(plan.value.guard)return say("海域封锁已牺牲本回合全部移动力，请先取消技能");
    if (!edit()) return;
    const end = nodes.value.at(-1)!;
    if (E.same(end.pos, h)) return say("\u7528\u201C\u7B49\u5F85\u201D\u6D88\u8017\u4E00\u6B65\u539F\u5730\u505C\u7559");
    const state = certain.value.get(E.key(h)) || reachable.value.get(E.key(h));
    if (!state) return say("\u5269\u4F59\u6B65\u6570\u4E0E\u8F6C\u5411\u9650\u5236\u5185\u65E0\u6CD5\u62B5\u8FBE\uFF1B\u53EF\u5148\u539F\u5730\u8F6C\u5411");
    mutate((p) => {
      const start2 = p.moves.length;
      p.moves.push(...state.moves);
      (p.segments || (p.segments = [])).push({ start: start2, end: p.moves.length, target: { q: h.q, r: h.r } });
    });
    torpWindow.value = plan.value.moves.length;
    replan.value = false;
    if (!state.path.every((x) => explored.value.has(E.key(x)))) say("\u8FD9\u662F\u672A\u63A2\u7D22\u7684\u8BD5\u63A2\u822A\u8DEF\uFF0C\u6267\u884C\u65F6\u53EF\u80FD\u88AB\u5C9B\u5C7F\u622A\u505C");
    if (routeConflicts.value.length) say(`航路已记录 ${plan.value.moves.length} 步，但可能与 ${routeConflicts.value.join('、')} 碰撞并回退`);
    else if (state.path.every(x => explored.value.has(E.key(x)))) say(`航路已记录，共 ${plan.value.moves.length} 步`);
    actions.teach({ type: "route", target: { q: h.q, r: h.r } });
  }
function setMode(m: OrderMode) {
    if (phase.value !== "plan" || !ship.value) return;
    if(!actions.campaignAllowed(m))return say("后续航段会介绍这项能力，先完成当前任务。");
    const cfg = ship.value.cfg;
    if (m === "main" && (!cfg.main || ship.value.mainReady > game.value!.round)) return say("\u672C\u8230\u6CA1\u6709\u53EF\u7528\u4E3B\u70AE");
    if (m === "torp" && (!cfg.torpedo || ship.value.torps <= 0)) return say("\u672C\u8230\u6CA1\u6709\u53EF\u7528\u9C7C\u96F7");
    if (m === "plane" && (!cfg.carrier || readyAircraft.value === 0)) return say("\u672C\u8230\u6CA1\u6709\u5DF2\u6574\u5907\u98DE\u673A");
    if (m === "mine" && !cfg.secondary) return say("\u672C\u8230\u6CA1\u6709\u526F\u70AE\uFF0C\u65E0\u6CD5\u8FDC\u7A0B\u6392\u96F7");
    if(m==='radar'&&(!cfg.radar||(ship.value.radarLeft??0)<=0))return say('雷达次数已用完');
    mode.value = m;
    replan.value = false;
    rangeMode.value = "auto";
    actions.teach({ type: "mode" });
  }
function clickHex(h: Hex, event: PointerEvent|undefined, forceMove: boolean = false) {
    if (actions.inspectCell(h, true)) return;
    hover.value = h;
    if (busy.value || !ship.value || onlineLocked.value) return;
    const here = game.value!.ships.find((s) => E.alive(s) && E.same(s.pos, h) && (s.team === myTeam.value || (onlineActive.value?visible.value.has(E.key(h)):E.shipVisible(game.value!,s,myTeam.value,visible.value))));
    const desktop=event?.pointerType==='mouse',targetCell=desktop&&event.shiftKey;
    if(desktop&&here?.team===myTeam.value&&!targetCell&&!forceMove&&!swapMode.value&&(phase.value==='plan'||phase.value==='deploy')){choose(here);return;}
    if (phase.value === "deploy") {
      if (here?.team === myTeam.value && !forceMove && !targetCell && !swapMode.value) {
        choose(here);
        return;
      }
      if (!core.deploymentCells.value.has(E.key(h))) return say(core.campaign.value ? "请选择当前战区南侧蓝色部署格" : myTeam.value === 1 ? "请选择右上角我方高亮的 3×3 部署区" : "请选择左下角我方高亮的 3×3 部署区");
      if (here && here.id !== ship.value.id) {
        here.pos = { ...ship.value.pos };
        here.xy = E.hexToXY(here.pos);
      }
      if(swapMode.value && (!here || here.id===ship.value.id)) return say("请选择另一艘友舰交换位置，或取消交换");
      swapMode.value=false;
      ship.value.pos = { q: h.q, r: h.r };
      ship.value.xy = E.hexToXY(h);
      if (onlineActive.value) actions.onlineCommand("deploy.update", {positions:own.value.map(s => ({id:s.id,pos:s.pos})),ready:false}).then(ok => { if (!ok) game.value = materializeObservation(toRaw(onlineState.value!.match!.game!)); });
      else E.updateExploration(game.value!);
      actions.autosave();
      actions.teach({ type: "deploy", target: { q: h.q, r: h.r } });
      return;
    }
    if (phase.value !== "plan") return;
    if (forceMove || mode.value === "move") {
      if (here?.team === myTeam.value && !forceMove && !targetCell) {
        choose(here);
        return;
      }
      pathTo(h);
      return;
    }
    const p = edit();
    if(!p)return;
    if(mode.value==='radar'&&ship.value.cfg.radar){if(E.hexDist(ship.value.pos,h)>ship.value.cfg.radar.range)return say('超出雷达扫描射程');mutate(p=>{p.radar={...h};p.sweep=null;});}
    if (mode.value === "main" && ship.value.cfg.main) {
      if (ship.value.mainReady > game.value!.round) return say(`主炮正在装填，第 ${ship.value.mainReady} 回合可用`);
      if (E.hexDist(ship.value.pos, h) > ship.value.cfg.main.range) return say(`落点超出主炮 ${ship.value.cfg.main.range} 格射程`);
      if (p.main.length >= ship.value.cfg.main.shots) return say(`已设置 ${ship.value.cfg.main.shots} 个落点，可在指令列表删除`);
      mutate((p2) => p2.main.push({ q: h.q, r: h.r }));
      actions.teach({ type: "main", target: { q: h.q, r: h.r } });
    }
    if (mode.value === "torp" && ship.value.cfg.torpedo) {
      const n = nodes.value[torpWindow.value];
      if (!n) return;
      if(p.smoke)return say('烟幕当轮不能发射鱼雷');
      if(p.torps.filter(t=>t.window===torpWindow.value).length>=(ship.value.cfg.torpedo.perWindow??1))return say('当前窗口发射数量已满');
      if(p.torps.length>=Math.min(ship.value.torps,ship.value.cfg.torpedo.max))return say('达到当轮鱼雷数量或备弹上限');
      if (E.same(n.pos, h)) return say("\u70B9\u51FB\u53D1\u5C04\u65B9\u5411\u4E0A\u7684\u5176\u4ED6\u683C");
      const a = E.hexToXY(n.pos), b = E.hexToXY(h), angle = Math.atan2(b.y - a.y, b.x - a.x);
      const dir = E.mod(Math.round(angle / (Math.PI / 3)));
      if ([n.heading, E.mod(n.heading + 3)].includes(dir)) return say("\u9C7C\u96F7\u53EA\u80FD\u6CBF\u4FA7\u9762\u56DB\u4E2A\u65B9\u5411\u53D1\u5C04");
      if(p.torps.some(t=>t.window===torpWindow.value&&t.dir===dir))return say('该方向已安排鱼雷');
      mutate((p2) => p2.torps.push({ window: torpWindow.value, dir }));
      actions.teach({ type: "torpedo", window: torpWindow.value, dir });
    }
    if (mode.value === "plane" && ship.value.cfg.carrier) {
      if (p.planes.length >= Math.min(ship.value.cfg.carrier.launch, readyAircraft.value)) return say("\u6BCF\u56DE\u5408\u6700\u591A\u653E\u98DE 2 \u67B6\uFF0C\u4E14\u9700\u8981\u5DF2\u6574\u5907\u98DE\u673A");
      const slot=nextAirSlot();if(slot===undefined)return say('该机型没有可用槽位');const aircraft=planeForSlot(ship.value.cfg,slot),role=aircraft.role??'bomber';const explicit=game.value!.ruleset?{slot}:{};
      if (planeMode.value === "target"&&role!=='fighter'&&role!=='scout') {
        if (!here || here.team === myTeam.value || !visible.value.has(E.key(h))) return say("\u8BF7\u9009\u62E9\u5F53\u524D\u53EF\u89C1\u7684\u654C\u8230");
        mutate((p2) => p2.planes.push({ ...explicit,mode: "target", targetId: here.id }));
        actions.teach({ type: "plane", target: here.pos });
      } else {
        if (P.airDistance(ship.value.pos, h) > aircraft.range + 1e-8) return say("\u7EC8\u70B9\u8D85\u8FC7\u98DE\u673A\u5355\u7A0B\u822A\u7A0B\u6781\u9650\uFF0C\u8BF7\u9009\u62E9\u7D2B\u8272\u8FB9\u754C\u5185\u4F4D\u7F6E");
        mutate((p2) => p2.planes.push({ ...explicit,mode: role==='fighter'?'patrol':"point", target: { q: h.q, r: h.r } }));
        actions.teach({ type: "plane", target: { q: h.q, r: h.r } });
      }
    }
    if (mode.value === "mine" && ship.value.cfg.secondary) {
      if (!mines.value.some((x) => E.same(x, h))) return say("\u8BF7\u9009\u62E9\u516C\u5F00\u6C34\u96F7\u683C");
      if (E.hexDist(ship.value.pos, h) > ship.value.cfg.secondary.range || !E.hasLOS(game.value!.map, ship.value.pos, h)) return say("\u6C34\u96F7\u4E0D\u5728\u56DE\u5408\u521D\u526F\u70AE\u5C04\u7A0B\u6216\u88AB\u5C9B\u5C7F\u906E\u6321");
      mutate((p2) => {p2.sweep = { q: h.q, r: h.r };delete p2.radar;});
      actions.teach({ type: "sweep", target: { q: h.q, r: h.r } });
    }
  }
function shipClick(s: FrameShip, event: PointerEvent|undefined) {
    // OrbitControls ends its gesture on document pointerup; do not stop this native event.
    if(event?.pointerType==='mouse'&&s.team===myTeam.value){clickHex(E.xyToHex(s.xy),event);return;}
    if (actions.inspectCell(E.xyToHex(s.xy), true)) return;
    if (phase.value === "deploy" && swapMode.value) { clickHex(E.xyToHex(s.xy), event, true); return; }
    if (phase.value === "plan" && mode.value !== "move") clickHex(E.xyToHex(s.xy), event);
    else choose(s);
  }
function begin() {
    if(!game.value)return;
    if (onlineActive.value && onlineLocked.value) return;
    if (onlineActive.value) return actions.onlineCommand("deploy.update", {positions:own.value.map(s => ({id:s.id,pos:s.pos})),ready:true});
    swapMode.value=false;
    E.updateExploration(game.value!);
    game.value!.phase = "plan";
    say("\u89C4\u5212\u4E0D\u9650\u65F6\u3002\u7ED9\u5404\u8230\u4E0B\u4EE4\u540E\uFF0C\u6309\u201C\u6267\u884C\u56DE\u5408\u201D");
    actions.autosave();
    actions.teach({ type: "begin" });
  }
function resetPlan() {
    if(core.historical.value&&!core.historicalControlled(selected.value))return;
    if (edit()) applyEdit(E.emptyPlan());
    torpWindow.value = 0;
    pendingTurn.value = 0;
  }
function mainCounts(s: FrameShip) {
    const p = plans.value[s.id] || E.emptyPlan();
    return p.moves.length + p.torps.length + p.main.length + p.planes.length + (p.sweep ? 1 : 0) + (p.guard ? 1 : 0)+(p.smoke?1:0)+(p.escort?1:0)+(p.radar?1:0)+(p.mineSteps?.length??0);
  }
function plannedPolyline(s: Ship) {
    const ns = E.route(s, plans.value[s.id] || E.emptyPlan(), knowledge.value,game.value!.round);
    return ns.map((n) => {
      const p = actions.point(n.pos);
      return `${p.x},${p.y}`;
    }).join(" ");
  }
function torpEnd(t: TorpedoOrder) {
    const n = nodes.value[t.window];
    if (!n || !ship.value?.cfg.torpedo) return null;
    return actions.point({ q: n.pos.q + E.DIRS[t.dir][0] * ship.value!.cfg.torpedo!.speed, r: n.pos.r + E.DIRS[t.dir][1] * ship.value.cfg.torpedo.speed });
  }
function keydown(e: KeyboardEvent) {
    if(connectionOpen.value||disconnectOpen.value||accountModal.value||saveOpen.value||showRules.value||document.querySelector('[role="dialog"],[role="alertdialog"],[role="listbox"],[role="menu"]'))return;
    if ((e.target instanceof Element && e.target.matches("input,select,textarea")) || showRules.value) return;
    if (screen.value !== "battle" || phase.value !== "plan") return;
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === "z") {
      e.preventDefault();
      historyChange(e.shiftKey ? "redo" : "undo");
      return;
    }
    if ([" ", "backspace", "enter", "q", "e", "w", "t", "g", "f", "m", "escape", "z"].includes(k)) e.preventDefault();
    if (k === "q") chooseTurn(-1);
    else if (k === "e") chooseTurn(1);
    else if (k === "z") chooseTurn(0);
    else if (k === "w") addMove(pendingTurn.value, true);
    else if (k === " ") addMove(pendingTurn.value, false);
    else if (k === "backspace") undo();
    else if (k === "t") setMode("torp");
    else if (k === "g") setMode("main");
    else if (k === "f") setMode("plane");
    else if (k === "m") setMode("mine");
    else if (k === "escape") {
      mode.value = "move";
      replan.value = false;
      rangeMode.value = "auto";
    } else if (k === "enter") actions.execute();
    else if (/[1-5]/.test(k)) {
      const s = own.value[Number(k) - 1];
      if (s) choose(s);
    }
  }
return {toggleSmoke,toggleEscort,toggleMineStep,selectAirRole,toggleGuard,setFleet,chooseTurn,truncateNode,say,coord,pickType,start,choose,edit,applyEdit,mutate,trimRoute,addMove,undo,undoWaypoint,removeWaypoint,clearMovement,startReplan,historyChange,removeOrder,pathTo,setMode,clickHex,shipClick,begin,resetPlan,mainCounts,plannedPolyline,torpEnd,keydown};
}
