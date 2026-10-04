import { createApp, ref, computed, onMounted, onUnmounted, toRaw } from "vue/dist/vue.esm-bundler.js";
import * as E from "./engine.js";
import * as P from "./planning.js";
import * as S from "./save.js";
import * as T from "./tutorial-content.js";
import { HomeScreen, SaveManager, TutorialBook, TutorialMenu } from "./screens.js";
import { MapViewport } from "./map-viewport.js";
import { playFrames } from "./playback.js";
import "./style.css";
const app = createApp({ components: { MapViewport, HomeScreen, SaveManager, TutorialBook, TutorialMenu }, setup() {
  const screen = ref("home"), roster = ref([...E.DEFAULT_ROSTER]), slot = ref(0), seed = ref(20261004), game = ref(null), plans = ref({}), selected = ref("0-0"), mode = ref("move"), pendingTurn = ref(0), torpWindow = ref(0), planeMode = ref("point"), showRules = ref(false), toast = ref(""), busy = ref(false), playFrame = ref(null), playSpeed = ref(1), progress = ref(0), showLog = ref(false), hover = ref(null), finished = ref(null), history = ref({}), showRanges = ref(true), rangeMode = ref("auto"), replan = ref(false), showPlans = ref(true), saveOpen = ref(false), saveRecords = ref([]), saveNotice = ref(""), pendingSave = ref(null), saveStatus = ref(""), tutorial = ref(null), tutorialFixture = ref(null), tutorialFeedback = ref(""), practiceSave = ref(null);
  const lastMovement = ref({});
  const mapView = ref(null), mapZoom = ref(1), ordersOpen = ref(true), rangeToolsOpen = ref(false), portraitHint = ref(true), swapMode = ref(false), coachOpen = ref(false);
  const modeLabel = computed(() => phase.value === 'deploy' ? (swapMode.value ? '交换位置：点另一艘友舰' : '部署') : ({move:'航线',torp:'鱼雷',main:'主炮',plane:'飞机',mine:'排雷'}[mode.value] || '查看'));
  function locateShip() { if(ship.value) mapView.value?.focus(point(ship.value.pos)); }
  function planeAngle(p) {
    const units = playFrame.value?.ships || game.value?.ships || [];
    const destination = p.state === 'return'
      ? units.find(s => s.id === p.mother)?.xy
      : (p.tracking ? units.find(s => s.id === p.targetId)?.xy : null) || E.hexToXY(p.target);
    return destination ? Math.atan2(destination.y-p.xy.y, destination.x-p.xy.x)*180/Math.PI : 0;
  }
  const saves = S.createSaveStorage();
  let normalSession = null;
  let toastTimer, stopPlayback;
  const shapes = E.allHexes().map((h) => {
    const p = E.hexToXY(h);
    return { ...h, k: E.key(h), x: p.x * 25 + 35, y: p.y * 25 + 35 };
  }), point = (h) => {
    const p = E.hexToXY(h);
    return { x: p.x * 25 + 35, y: p.y * 25 + 35 };
  }, xy = (p) => ({ x: p.x * 25 + 35, y: p.y * 25 + 35 });
  const polygon = (h) => {
    const p = point(h);
    return Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60 - 30) * Math.PI / 180;
      return `${p.x + 24.3 * Math.cos(a)},${p.y + 24.3 * Math.sin(a)}`;
    }).join(" ");
  }, island = computed(() => new Set(game.value?.map.islands || [])), currentTemplate = computed(() => E.TEMPLATES[roster.value[slot.value]]), role = computed(() => slot.value < 3 ? "front" : "back");
  const ship = computed(() => game.value?.ships.find((s) => s.id === selected.value)), plan = computed(() => plans.value[selected.value] || E.emptyPlan()), nodes = computed(() => ship.value ? E.route(ship.value, plan.value, knowledge.value) : []), own = computed(() => game.value?.ships.filter((s) => s.team === 0) || []), visible = computed(() => new Set(playFrame.value?.visible || (game.value ? [...E.visibleCells(game.value, 0)] : []))), displayShips = computed(() => (playFrame.value?.ships || game.value?.ships.filter(E.alive) || []).filter((s) => s.team === 0 || visible.value.has(E.key(E.xyToHex(s.xy))))), displayTorps = computed(() => (playFrame.value?.torpedoes || game.value?.torpedoes || []).filter((p) => p.team === 0 || visible.value.has(E.key(E.xyToHex(p.xy))))), displayPlanes = computed(() => (playFrame.value?.planes || game.value?.planes || []).filter((p) => p.team === 0 || visible.value.has(E.key(E.xyToHex(p.xy))))), mines = computed(() => playFrame.value?.mines || game.value?.map.mines || []), ourHP = computed(() => own.value.reduce((n, s) => n + s.hp, 0)), ourCount = computed(() => own.value.filter(E.alive).length), visibleEnemies = computed(() => displayShips.value.filter((s) => s.team === 1).length), phase = computed(() => busy.value ? "execute" : game.value?.phase), readyAircraft = computed(() => ship.value?.airReady.filter((n) => n <= game.value.round).length || 0), safeLogs = computed(() => (game.value?.log || []).filter((e) => e.team === 0 || e.team === null).slice(-35).reverse());
  const explored = computed(() => new Set(playFrame.value?.explored || game.value?.explored?.[0] || []));
  const knowledge = computed(() => game.value ? P.knowledgeMap(game.value.map, explored.value) : { islands: [], mines: [] });
  const reachable = computed(() => ship.value && phase.value === "plan" ? P.reachable(ship.value, plan.value, knowledge.value) : /* @__PURE__ */ new Map());
  const certain = computed(() => ship.value && phase.value === "plan" ? P.knownReachable(ship.value, plan.value, knowledge.value, explored.value) : /* @__PURE__ */ new Map());
  const ranges = computed(() => ship.value ? P.ranges(ship.value, plan.value, knowledge.value) : { main: /* @__PURE__ */ new Set(), secondary: /* @__PURE__ */ new Set(), aa: /* @__PURE__ */ new Set(), sweep: /* @__PURE__ */ new Set(), air: /* @__PURE__ */ new Set() });
  const rays = computed(() => ship.value ? P.torpedoRays(ship.value, plan.value, knowledge.value, torpWindow.value) : []);
  const overlayType = computed(() => rangeMode.value !== "auto" ? rangeMode.value : mode.value === "move" ? "reach" : mode.value === "main" ? "main" : mode.value === "plane" ? "air" : mode.value === "mine" ? "sweep" : mode.value === "torp" ? "torp" : "reach");
  const overlayCells = computed(() => !showRanges.value || phase.value !== "plan" ? /* @__PURE__ */ new Set() : overlayType.value === "reach" ? new Set(certain.value.keys()) : overlayType.value === "torp" ? new Set(rays.value.flatMap((r) => r.cells).map(E.key).filter((k) => explored.value.has(k))) : new Set([...ranges.value[overlayType.value] || []].filter((k) => ["main", "air", "aa"].includes(overlayType.value) || explored.value.has(k))));
  const routeConflicts = computed(() => ship.value && phase.value === 'plan'
    ? P.friendlyRouteConflicts(ship.value, plan.value, own.value, plans.value, knowledge.value) : []);
  const canUndo = computed(() => !!history.value[selected.value]?.undo.length), canRedo = computed(() => !!history.value[selected.value]?.redo.length);
  const hoverHint = computed(() => {
    if (!hover.value || !ship.value) return "";
    const h = hover.value, k = E.key(h), distance = E.hexDist(ship.value.pos, h), known = explored.value.has(k);
    let hint = known ? "" : "\u672A\u63A2\u7D22 \xB7 ";
    if (mode.value === "move") {
      const state = reachable.value.get(k);
      hint += state ? `\u4ECE\u822A\u7EBF\u672B\u7AEF ${state.cost} \u6B65${certain.value.has(k) ? "\u53EF\u8FBE" : " \xB7 \u8BD5\u63A2\u822A\u8DEF"}` : "\u5269\u4F59\u6B65\u9AA4\u5185\u4E0D\u53EF\u8FBE";
    } else if (mode.value === "main") hint += ranges.value.main.has(k) ? `\u4E3B\u70AE\u5C04\u7A0B\u5185 \xB7 ${distance} \u683C` : `\u4E3B\u70AE\u5C04\u7A0B\u5916 \xB7 ${distance} \u683C`;
    else if (mode.value === "plane") {
      const n = P.airDistance(ship.value.pos, h);
      hint += `\u5355\u7A0B ${n.toFixed(1)} / ${ship.value.cfg.carrier.plane.range} \u683C${n > ship.value.cfg.carrier.plane.range ? " \xB7 \u8D85\u51FA\u822A\u7A0B" : ""}`;
    } else if (mode.value === "mine") hint += ranges.value.sweep.has(k) ? "\u56DE\u5408\u521D\u6392\u96F7\u8303\u56F4\u5185" : "\u6392\u96F7\u8303\u56F4\u5916\u6216\u88AB\u5DF2\u77E5\u5C9B\u5C7F\u906E\u6321";
    else if (mode.value === "torp") hint += "\u91D1\u7EBF\uFF1A\u672C\u56DE\u5408\u822A\u7A0B \xB7 \u865A\u7EBF\uFF1A\u5269\u4F59\u5BFF\u547D\u8303\u56F4";
    return hint;
  });
  const rangeHint = computed(() => overlayType.value === "reach" ? `\u822A\u7EBF\u672B\u7AEF\u5269\u4F59 ${Math.max(0, (ship.value?.cfg.speed || 0) - plan.value.moves.length)} \u6B65 \xB7 \u7EFF\u8272\u4E3A\u5DF2\u77E5\u53EF\u8FBE` : overlayType.value === "secondary" ? "\u526F\u70AE\uFF1A\u89C4\u5212\u7EC8\u70B9\u8303\u56F4\uFF1B\u6CBF\u9014\u4ECD\u53EF\u81EA\u52A8\u5F00\u706B" : overlayType.value === "aa" ? "\u9632\u7A7A\uFF1A\u89C4\u5212\u7EC8\u70B9\u8303\u56F4\uFF0C\u4E0D\u53D7\u5C9B\u5C7F\u906E\u6321" : overlayType.value === "main" ? "\u4E3B\u70AE\uFF1A\u56DE\u5408\u521D\u8230\u4F4D\u5C04\u7A0B\uFF0C\u53EF\u9694\u5C9B\u76F2\u5C04" : overlayType.value === "sweep" ? "\u6392\u96F7\uFF1A\u56DE\u5408\u521D\u8230\u4F4D\u4E0E\u5DF2\u77E5\u76F4\u89C6\u8303\u56F4" : overlayType.value === "air" ? `飞机：母舰起飞位置的单程 ${ship.value?.cfg.carrier?.plane.range ?? E.RULES.plane.range} 格极限` : overlayType.value === "torp" ? "\u9C7C\u96F7\uFF1A\u5F53\u524D\u7A97\u53E3\u7684\u56DB\u4E2A\u5408\u6CD5\u4FA7\u5411\uFF1B\u5C9B\u5C7F\u5916\u7684\u672A\u77E5\u8DEF\u5F84\u4E0D\u4FDD\u8BC1\u7545\u901A" : "");
  const airborne = computed(() => displayPlanes.value.filter((p) => p.team === 0 && p.mother === selected.value));
  const previews = computed(() => own.value.filter(E.alive).map((s) => {
    const p = plans.value[s.id] || E.emptyPlan(), ns = E.route(s, p, knowledge.value);
    return { ship: s, plan: p, nodes: ns, selected: s.id === selected.value, torps: p.torps.map((t) => {
      const n = ns[t.window];
      if (!n) return null;
      const ray = P.torpedoRays(s, p, knowledge.value, t.window).find((r) => r.dir === t.dir);
      return ray ? { ...t, origin: n.pos, end: ray.roundEnd, fullEnd: ray.fullEnd } : null;
    }).filter(Boolean), planes: p.planes.map((o) => {
      const target = o.mode === "point" ? o.target : game.value.ships.find((t) => t.id === o.targetId && visible.value.has(E.key(t.pos)))?.pos;
      return target ? { ...o, target } : null;
    }).filter(Boolean) };
  }));
  const mainTargets = computed(() => {
    const targets = /* @__PURE__ */ new Map();
    for (const preview of previews.value) for (const h of preview.plan.main) {
      const k = E.key(h), t = targets.get(k) || { at: h, count: 0, selected: false };
      t.count++;
      t.selected = t.selected || preview.selected;
      targets.set(k, t);
    }
    return [...targets.values()];
  });
  const canSave = computed(() => !!game.value && !busy.value && !tutorial.value);
  const lesson = computed(() => tutorial.value ? T.TUTORIAL_LESSONS.find((l) => l.id === tutorial.value.lessonId) : null);
  const tutorialStep = computed(() => lesson.value?.steps[tutorial.value?.stepIndex] || null);
  const tutorialIndex = computed(() => lesson.value ? T.TUTORIAL_LESSONS.findIndex((l) => l.id === lesson.value.id) : -1);
  function snapshot() {
    return { game: E.clone(toRaw(game.value)), plans: E.clone(toRaw(plans.value)), selected: selected.value, roster: [...roster.value], seed: Number(seed.value), metadata: { showPlans: showPlans.value, showRanges: showRanges.value, rangeMode: rangeMode.value } };
  }
  function refreshSaves() {
    saveRecords.value = saves.list();
  }
  function autosave() {
    if (!canSave.value) return;
    const result = saves.write("auto", snapshot(), { label: `\u81EA\u52A8 \xB7 R${String(game.value.round).padStart(2, "0")}` });
    if (result.ok) saveStatus.value = "\u5DF2\u81EA\u52A8\u4FDD\u5B58";
    else {
      const first = saveStatus.value !== result.error.message;
      saveStatus.value = result.error.message;
      if (first) say(result.error.message);
    }
    refreshSaves();
  }
  function openSaves() {
    if (tutorial.value) return savePractice();
    if (busy.value) return say("\u8BF7\u5148\u5B8C\u6210\u56DE\u5408\u7ED3\u7B97\uFF0C\u518D\u4FDD\u5B58\u6216\u8BFB\u53D6");
    saveNotice.value = "";
    pendingSave.value = null;
    refreshSaves();
    saveOpen.value = true;
  }
  function closeSaves() {
    saveOpen.value = false;
    pendingSave.value = null;
  }
  function writeSave({ id, label }, confirmed = false) {
    if (!canSave.value) return;
    if (!confirmed && saveRecords.value.find((r) => r.id === id)?.save) {
      pendingSave.value = { kind: "write", id, label, message: `\u8986\u76D6\u624B\u52A8\u69FD\u4F4D ${id.slice(-1)} \u4F1A\u66FF\u6362\u5176\u4E2D\u7684\u65E7\u6218\u5C40\u3002\u8BF7\u786E\u8BA4\uFF0C\u6216\u5148\u5BFC\u51FA\u65E7\u5B58\u6863` };
      return;
    }
    const result = saves.write(id, snapshot(), { label: label || `\u8230\u961F \xB7 R${String(game.value.round).padStart(2, "0")}` });
    saveNotice.value = result.ok ? "\u624B\u52A8\u5B58\u6863\u5DF2\u4FDD\u5B58" : result.error.message;
    pendingSave.value = null;
    refreshSaves();
  }
  function applySavedState(state) {
    swapMode.value=false; ordersOpen.value=true; mapView.value?.reset();
    stopPlayback?.();
    clearTimeout(toastTimer);
    game.value = E.clone(state.game);
    E.updateExploration(game.value);
    plans.value = E.clone(state.plans);
    selected.value = state.selected;
    roster.value = [...state.roster];
    seed.value = state.seed;
    busy.value = false;
    playFrame.value = null;
    finished.value = null;
    progress.value = 0;
    history.value = {};
    pendingTurn.value = 0;
    torpWindow.value = 0;
    mode.value = "move";
    planeMode.value = "point";
    hover.value = null;
    replan.value = false;
    showPlans.value = state.metadata?.showPlans ?? true;
    showRanges.value = state.metadata?.showRanges ?? true;
    rangeMode.value = "auto";
    toast.value = "";
    screen.value = "battle";
  }
  function loadSave(id, confirmed = false) {
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
      screen.value = "fleet";
    }
  }
  function commitImport(id, json) {
    const result = saves.import(id, json);
    saveNotice.value = result.ok ? "JSON \u5DF2\u5BFC\u5165\u69FD\u4F4D\uFF0C\u53EF\u70B9\u51FB\u8BFB\u53D6" : result.error.message;
    pendingSave.value = null;
    refreshSaves();
  }
  async function importSave({ id, file }) {
    if (!file) return;
    try {
      if (file.size > S.MAX_SAVE_BYTES) throw new Error("\u5B58\u6863\u6587\u4EF6\u8FC7\u5927\uFF08\u6700\u5927 2 MB\uFF09");
      const json = await file.text();
      S.deserializeSave(json);
      if (saveRecords.value.find((r) => r.id === id)?.save) pendingSave.value = { kind: "import", id, json, message: `\u5BFC\u5165\u4F1A\u8986\u76D6\u624B\u52A8\u69FD\u4F4D ${id.slice(-1)}\uFF0C\u8BF7\u786E\u8BA4\u6216\u5148\u5BFC\u51FA\u65E7\u5B58\u6863` };
      else commitImport(id, json);
    } catch (error) {
      saveNotice.value = error.message;
    }
  }
  function exportSave(envelope = null) {
    try {
      const save = envelope || S.createSave(snapshot(), { label: `\u8230\u961F R${game.value.round}` }), json = S.serializeSave(save), blob = new Blob([json], { type: "application/json" }), url = URL.createObjectURL(blob), link = document.createElement("a");
      link.href = url;
      link.download = S.exportFilename(save);
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1e3);
      saveNotice.value = "JSON \u5907\u4EFD\u5DF2\u5BFC\u51FA";
    } catch (error) {
      saveNotice.value = error.message;
    }
  }
  function goHome() {
    if (busy.value) return;
    if (tutorial.value) {
      exitTutorial();
      return;
    }
    autosave();
    screen.value = "home";
    refreshSaves();
  }
  function newGame() {
    if (game.value) {
      autosave();
      saveOpen.value = true;
      refreshSaves();
      pendingSave.value = { kind: "new", message: "\u5F00\u59CB\u65B0\u6E38\u620F\u4F1A\u66FF\u6362\u5F53\u524D\u6218\u5C40\uFF0C\u5E76\u66F4\u65B0\u81EA\u52A8\u5B58\u6863\u3002\u8BF7\u5148\u628A\u9700\u8981\u4FDD\u7559\u7684\u5185\u5BB9\u5B58\u5165\u624B\u52A8\u69FD\u4F4D\u6216\u5BFC\u51FA JSON" };
    } else screen.value = "fleet";
  }
  function tutorialContext() {
    return { game: toRaw(game.value), plans: toRaw(plans.value), selected: selected.value, mode: mode.value, rangeMode: { air: "plane", reach: "reachable" }[overlayType.value] || overlayType.value, showRanges: showRanges.value };
  }
  function teach(event, quiet = false) {
    if (!tutorial.value) return;
    const result = T.recordTutorialEvent(E, toRaw(tutorial.value), tutorialContext(), { shipId: selected.value, ...event });
    tutorial.value = result.state;
    if (result.feedback) {
      tutorialFeedback.value = result.feedback;
      if (result.advanced || !quiet) say(result.feedback);
    }
  }
  function startLesson(id) {
    ordersOpen.value=true; swapMode.value=false; mapView.value?.reset();
    if (!tutorial.value) {
      if (game.value) autosave();
      normalSession = game.value ? snapshot() : null;
    }
    const fixture = T.createTutorialGame(E, id);
    tutorialFixture.value = fixture;
    tutorial.value = T.createTutorialState(id);
    game.value = fixture.game;
    E.updateExploration(game.value);
    plans.value = fixture.plans;
    selected.value = fixture.selected;
    mode.value = fixture.mode || "move";
    rangeMode.value = fixture.rangeMode || "auto";
    showRanges.value = fixture.showRanges ?? true;
    showPlans.value = true;
    screen.value = "battle";
    busy.value = false;
    playFrame.value = null;
    finished.value = null;
    progress.value = 0;
    history.value = {};
    for (const [id2, p] of Object.entries(fixture.plans)) {
      const s = fixture.game.ships.find((x) => x.id === id2);
      if (s && p.segments?.length) history.value[id2] = { undo: p.segments.map((segment) => P.trimMovement(s, p, knowledge.value, segment.start).plan), redo: [] };
    }
    pendingTurn.value = 0;
    torpWindow.value = 0;
    hover.value = null;
    replan.value = false;
    tutorialFeedback.value = lesson.value?.description || "";
    practiceSave.value = null;
  }
  function exitTutorial() {
    stopPlayback?.();
    tutorial.value = null;
    tutorialFixture.value = null;
    tutorialFeedback.value = "";
    if (normalSession) {
      applySavedState(normalSession);
      normalSession = null;
    } else {
      game.value = null;
      plans.value = {};
    lastMovement.value = {};
      busy.value = false;
      playFrame.value = null;
      finished.value = null;
    }
    screen.value = "home";
    refreshSaves();
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
    practiceSave.value = E.clone(snapshot());
    teach({ type: "save", saved: true });
    say("\u6F14\u7EC3\u5DF2\u4FDD\u5B58\u5230\u5185\u5B58\uFF0C\u666E\u901A\u5B58\u6863\u672A\u6539\u52A8");
  }
  function conditionHas(condition, type) {
    return condition?.kind === "event" ? condition.types.includes(type) : condition?.kind === "all" && condition.conditions.some((c) => conditionHas(c, type));
  }
  function inspectCell(h, clicked = false) {
    hover.value = h;
    if (tutorial.value && conditionHas(tutorialStep.value?.condition, "inspect")) {
      teach({ type: "inspect", cell: { q: h.q, r: h.r } }, !clicked);
      return true;
    }
    return false;
  }
  function isControl(id) {
    return !!tutorialStep.value?.highlights.some((h) => h.kind === "control" && h.id === id);
  }
  function isTutorialCell(h) {
    return !!tutorialStep.value?.highlights.some((x) => x.kind === "cell" && E.same(x.cell, h));
  }
  function isTutorialShip(id) {
    return !!tutorialStep.value?.highlights.some((x) => x.kind === "ship" && x.shipId === id);
  }
  function rangeChanged() {
    teach({ type: "overlay", rangeMode: overlayType.value });
  }
  function toggleRanges() {
    showRanges.value = !showRanges.value;
    rangeChanged();
  }
  function chooseTurn(turn) {
    pendingTurn.value = turn;
    teach({ type: "turn", turn });
  }
  function truncateNode(index, id) {
    if (phase.value !== "plan" || busy.value) return;
    if (selected.value !== id || mode.value !== "move") return;
    trimRoute(index);
    teach({ type: "truncate", index });
  }
  refreshSaves();
  const say = (t) => {
    toast.value = t;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.value = "", 3500);
  };
  const coord = (h) => {
    const p = E.toCR(h);
    return `${String.fromCharCode(65 + p.c)}${p.r + 1}`;
  };
  function pickType(t) {
    if (E.TEMPLATES[t].role === role.value) roster.value[slot.value] = t;
  }
  function start() {
    ordersOpen.value=true; swapMode.value=false; mapView.value?.reset();
    const requestedSeed = Number(seed.value);
    seed.value = Number.isFinite(requestedSeed) ? Math.max(-Number.MAX_SAFE_INTEGER, Math.min(Number.MAX_SAFE_INTEGER, Math.trunc(requestedSeed))) || 20261004 : 20261004;
    stopPlayback?.();
    clearTimeout(toastTimer);
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
    game.value = E.createGame(roster.value, Number(seed.value) || 20261004);
    selected.value = "0-0";
    plans.value = {};
    lastMovement.value = {};
    screen.value = "battle";
    mode.value = "move";
    finished.value = null;
    autosave();
  }
  function choose(s) {
    if (s.team !== 0 || !E.alive(s) || busy.value) return;
    swapMode.value=false;
    selected.value = s.id;
    pendingTurn.value = 0;
    torpWindow.value = (plans.value[s.id]?.moves || []).length;
    mode.value = "move";
    replan.value = false;
    rangeMode.value = "auto";
    autosave();
    teach({ type: "select", shipId: s.id });
  }
  function edit() {
    if (!ship.value || !E.alive(ship.value) || phase.value !== "plan") return null;
    if (!plans.value[ship.value.id]) plans.value[ship.value.id] = E.emptyPlan();
    return plans.value[ship.value.id];
  }
  function applyEdit(next) {
    const before = E.clone(toRaw(plan.value));
    if (!edit()) return false;
    P.recordEdit(history.value, selected.value, before, next);
    plans.value[selected.value] = next;
    torpWindow.value = Math.min(torpWindow.value, next.moves.length);
    autosave();
    return true;
  }
  function mutate(fn) {
    const next = E.clone(toRaw(plan.value));
    fn(next);
    return applyEdit(next);
  }
  function trimRoute(length) {
    const result = P.trimMovement(ship.value, toRaw(plan.value), knowledge.value, length);
    if (applyEdit(result.plan) && result.removedTorps) say(`\u822A\u7EBF\u6539\u53D8\uFF0C\u5DF2\u53D6\u6D88 ${result.removedTorps} \u4E2A\u5931\u6548\u9C7C\u96F7\u7A97\u53E3`);
    torpWindow.value = Math.min(torpWindow.value, length);
  }
  function addMove(turn, forward) {
    if (!edit()) return;
    if (plan.value.moves.length >= ship.value.cfg.speed) return say("\u8BE5\u8230\u7684\u79FB\u52A8\u6B65\u9AA4\u5DF2\u7528\u5B8C");
    const end = nodes.value.at(-1), next = forward ? E.add(end.pos, E.mod(end.heading + turn)) : end.pos;
    if (!E.legal(knowledge.value, next)) return say("\u8FD9\u4E00\u6B65\u4F1A\u9A76\u5165\u5DF2\u77E5\u5C9B\u5C7F\u6216\u6D77\u56FE\u5916");
    mutate((p) => {
      const start2 = p.moves.length;
      p.moves.push({ turn, forward });
      (p.segments || (p.segments = [])).push({ start: start2, end: p.moves.length, target: { ...next } });
    });
    pendingTurn.value = 0;
    torpWindow.value = plan.value.moves.length;
    teach({ type: "move", turn, forward });
  }
  function undo(index = null) {
    if (!edit()) return;
    trimRoute(index === null ? Math.max(0, plan.value.moves.length - 1) : index);
    teach({ type: "undo" });
  }
  function undoWaypoint() {
    const segments = plan.value.segments || [];
    if (!segments.length) return undo();
    const target = P.trimMovement(ship.value, toRaw(plan.value), knowledge.value, segments.at(-1).start).plan, last = history.value[selected.value]?.undo.at(-1);
    if (last && JSON.stringify(last) === JSON.stringify(target)) historyChange("undo");
    else {
      trimRoute(segments.at(-1).start);
      teach({ type: "undo" });
    }
  }
  function removeWaypoint(i) {
    const segment = plan.value.segments?.[i];
    if (segment) {
      trimRoute(segment.start);
      teach({ type: "truncate", index: segment.start });
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
    teach({ type: "redraw" });
  }
  function historyChange(direction) {
    if (!edit()) return;
    const next = P.historyStep(history.value, selected.value, toRaw(plan.value), direction);
    if (next) {
      plans.value[selected.value] = next;
      torpWindow.value = Math.min(torpWindow.value, next.moves.length);
      pendingTurn.value = 0;
      autosave();
      teach({ type: direction });
    }
  }
  function removeOrder(kind, index) {
    mutate((p) => {
      if (kind === "sweep") p.sweep = null;
      else p[kind].splice(index, 1);
    });
  }
  function pathTo(h) {
    if (!edit()) return;
    const end = nodes.value.at(-1);
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
    teach({ type: "route", target: { q: h.q, r: h.r } });
  }
  function setMode(m) {
    if (phase.value !== "plan" || !ship.value) return;
    const cfg = ship.value.cfg;
    if (m === "main" && (!cfg.main || ship.value.mainReady > game.value.round)) return say("\u672C\u8230\u6CA1\u6709\u53EF\u7528\u4E3B\u70AE");
    if (m === "torp" && (!cfg.torpedo || ship.value.torps <= 0)) return say("\u672C\u8230\u6CA1\u6709\u53EF\u7528\u9C7C\u96F7");
    if (m === "plane" && (!cfg.carrier || readyAircraft.value === 0)) return say("\u672C\u8230\u6CA1\u6709\u5DF2\u6574\u5907\u98DE\u673A");
    if (m === "mine" && !cfg.secondary) return say("\u672C\u8230\u6CA1\u6709\u526F\u70AE\uFF0C\u65E0\u6CD5\u8FDC\u7A0B\u6392\u96F7");
    mode.value = m;
    replan.value = false;
    rangeMode.value = "auto";
    teach({ type: "mode" });
  }
  function clickHex(h, event, forceMove = false) {
    if (inspectCell(h, true)) return;
    hover.value = h;
    if (busy.value || !ship.value) return;
    const here = game.value.ships.find((s) => E.alive(s) && E.same(s.pos, h) && (s.team === 0 || visible.value.has(E.key(h))));
    if (phase.value === "deploy") {
      if (here?.team === 0 && !forceMove && !swapMode.value) {
        choose(here);
        return;
      }
      if (!E.deployment(0).some((x) => E.same(x, h))) return say("\u8BF7\u9009\u62E9\u5DE6\u4E0B\u89D2\u84DD\u8272 3\xD73 \u90E8\u7F72\u533A");
      if (here && here.id !== ship.value.id) {
        here.pos = { ...ship.value.pos };
        here.xy = E.hexToXY(here.pos);
      }
      if(swapMode.value && (!here || here.id===ship.value.id)) return say("请选择另一艘友舰交换位置，或取消交换");
      swapMode.value=false;
      ship.value.pos = { q: h.q, r: h.r };
      ship.value.xy = E.hexToXY(h);
      E.updateExploration(game.value);
      autosave();
      teach({ type: "deploy", target: { q: h.q, r: h.r } });
      return;
    }
    if (phase.value !== "plan") return;
    if (forceMove || mode.value === "move") {
      if (here?.team === 0 && !forceMove) {
        choose(here);
        return;
      }
      pathTo(h);
      return;
    }
    const p = edit();
    if (mode.value === "main") {
      if (E.hexDist(ship.value.pos, h) > ship.value.cfg.main.range) return say(`落点超出主炮 ${ship.value.cfg.main.range} 格射程`);
      if (p.main.length >= ship.value.cfg.main.shots) return say("\u5DF2\u8BBE\u5B9A 3 \u4E2A\u843D\u70B9\uFF0C\u53EF\u5728\u884C\u52A8\u5217\u8868\u5220\u9664");
      mutate((p2) => p2.main.push({ q: h.q, r: h.r }));
      teach({ type: "main", target: { q: h.q, r: h.r } });
    }
    if (mode.value === "torp") {
      const n = nodes.value[torpWindow.value];
      if (!n) return;
      if (p.torps.some((t) => t.window === torpWindow.value)) return say("\u8FD9\u4E2A\u53D1\u5C04\u7A97\u53E3\u5DF2\u6709 1 \u679A\u9C7C\u96F7");
      if (p.torps.length >= Math.min(ship.value.torps, ship.value.cfg.torpedo.max)) return say("\u672C\u56DE\u5408\u6700\u591A 3 \u679A\uFF0C\u5E76\u53D7\u5907\u5F39\u9650\u5236");
      if (E.same(n.pos, h)) return say("\u70B9\u51FB\u53D1\u5C04\u65B9\u5411\u4E0A\u7684\u5176\u4ED6\u683C");
      const a = E.hexToXY(n.pos), b = E.hexToXY(h), angle = Math.atan2(b.y - a.y, b.x - a.x);
      const dir = E.mod(Math.round(angle / (Math.PI / 3)));
      if ([n.heading, E.mod(n.heading + 3)].includes(dir)) return say("\u9C7C\u96F7\u53EA\u80FD\u6CBF\u4FA7\u9762\u56DB\u4E2A\u65B9\u5411\u53D1\u5C04");
      mutate((p2) => p2.torps.push({ window: torpWindow.value, dir }));
      teach({ type: "torpedo", window: torpWindow.value, dir });
    }
    if (mode.value === "plane") {
      if (p.planes.length >= Math.min(ship.value.cfg.carrier.launch, readyAircraft.value)) return say("\u6BCF\u56DE\u5408\u6700\u591A\u653E\u98DE 2 \u67B6\uFF0C\u4E14\u9700\u8981\u5DF2\u6574\u5907\u98DE\u673A");
      if (planeMode.value === "target") {
        if (!here || here.team === 0 || !visible.value.has(E.key(h))) return say("\u8BF7\u9009\u62E9\u5F53\u524D\u53EF\u89C1\u7684\u654C\u8230");
        mutate((p2) => p2.planes.push({ mode: "target", targetId: here.id }));
        teach({ type: "plane", target: here.pos });
      } else {
        if (P.airDistance(ship.value.pos, h) > ship.value.cfg.carrier.plane.range + 1e-8) return say("\u7EC8\u70B9\u8D85\u8FC7\u98DE\u673A\u5355\u7A0B\u822A\u7A0B\u6781\u9650\uFF0C\u8BF7\u9009\u62E9\u7D2B\u8272\u8FB9\u754C\u5185\u4F4D\u7F6E");
        mutate((p2) => p2.planes.push({ mode: "point", target: { q: h.q, r: h.r } }));
        teach({ type: "plane", target: { q: h.q, r: h.r } });
      }
    }
    if (mode.value === "mine") {
      if (!mines.value.some((x) => E.same(x, h))) return say("\u8BF7\u9009\u62E9\u516C\u5F00\u6C34\u96F7\u683C");
      if (E.hexDist(ship.value.pos, h) > ship.value.cfg.secondary.range || !E.hasLOS(game.value.map, ship.value.pos, h)) return say("\u6C34\u96F7\u4E0D\u5728\u56DE\u5408\u521D\u526F\u70AE\u5C04\u7A0B\u6216\u88AB\u5C9B\u5C7F\u906E\u6321");
      mutate((p2) => p2.sweep = { q: h.q, r: h.r });
      teach({ type: "sweep", target: { q: h.q, r: h.r } });
    }
  }
  function shipClick(s, event) {
    event.stopPropagation();
    if (inspectCell(E.xyToHex(s.xy), true)) return;
    if (phase.value === "deploy" && swapMode.value) { clickHex(E.xyToHex(s.xy), event, true); return; }
    if (phase.value === "plan" && mode.value !== "move") clickHex(E.xyToHex(s.xy), event);
    else choose(s);
  }
  function begin() {
    swapMode.value=false;
    E.updateExploration(game.value);
    game.value.phase = "plan";
    say("\u89C4\u5212\u4E0D\u9650\u65F6\u3002\u7ED9\u5404\u8230\u4E0B\u4EE4\u540E\uFF0C\u6309\u201C\u6267\u884C\u56DE\u5408\u201D");
    autosave();
    teach({ type: "begin" });
  }
  function execute() {
    if (busy.value || phase.value !== "plan") return;
    busy.value = true;
    mode.value = "move";
    progress.value = 0;
    teach({ type: "execute" });
    setTimeout(() => {
      try {
        const state = E.clone(toRaw(game.value)), orders = E.clone(toRaw(plans.value)), ai = tutorial.value ? tutorialFixture.value.opponentPlansByRound?.[state.round] || tutorialFixture.value.opponentPlans || {} : E.planAI(state, 1), result = E.resolveRound(state, { ...ai, ...orders });
        finished.value = result;
        stopPlayback = playFrames(result.frames, {
          speed: () => playSpeed.value,
          render: (frame, fraction) => { playFrame.value = frame; progress.value = fraction; },
          complete,
        });
      } catch (e) {
        busy.value = false;
        say("\u7ED3\u7B97\u51FA\u73B0\u5F02\u5E38\uFF1A" + e.message);
        console.error(e);
      }
    }, 35);
  }
  function complete() {
    if (!finished.value) return;
    stopPlayback?.();
    const outcomes = P.movementOutcomes(toRaw(game.value), toRaw(plans.value), toRaw(finished.value));
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
    autosave();
    lastMovement.value = outcomes;
    const blocked = Object.entries(outcomes).filter(([,o])=>o.blocked);
    if (blocked.length) say(blocked.map(([id,o])=>`${game.value.ships.find(s=>s.id===id)?.label}：${o.reason}`).join('；'));
    teach({ type: "roundComplete" });
  }
  function resetPlan() {
    if (edit()) applyEdit(E.emptyPlan());
    torpWindow.value = 0;
    pendingTurn.value = 0;
  }
  const directionNames = ["\u4E1C", "\u4E1C\u5357", "\u897F\u5357", "\u897F", "\u897F\u5317", "\u4E1C\u5317"];
  function mainCounts(s) {
    const p = plans.value[s.id] || E.emptyPlan();
    return p.moves.length + p.torps.length + p.main.length + p.planes.length + (p.sweep ? 1 : 0);
  }
  function plannedPolyline(s) {
    const ns = E.route(s, plans.value[s.id] || E.emptyPlan(), knowledge.value);
    return ns.map((n) => {
      const p = point(n.pos);
      return `${p.x},${p.y}`;
    }).join(" ");
  }
  function torpEnd(t) {
    const n = nodes.value[t.window];
    if (!n) return null;
    return point({ q: n.pos.q + E.DIRS[t.dir][0] * ship.value.cfg.torpedo.speed, r: n.pos.r + E.DIRS[t.dir][1] * ship.value.cfg.torpedo.speed });
  }
  function keydown(e) {
    if (saveOpen.value) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (pendingSave.value) pendingSave.value = null;
        else closeSaves();
      }
      return;
    }
    if (e.target.matches("input,select,textarea") || showRules.value) return;
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
    } else if (k === "enter") execute();
    else if (/[1-5]/.test(k)) {
      const s = own.value[Number(k) - 1];
      if (s) choose(s);
    }
  }
  onMounted(() => window.addEventListener("keydown", keydown));
  onUnmounted(() => {
    window.removeEventListener("keydown", keydown);
    stopPlayback?.();
  });
  return { routeConflicts, lastMovement, planeAngle, mapView, mapZoom, ordersOpen, rangeToolsOpen, portraitHint, swapMode, coachOpen, modeLabel, locateShip, finished, S, T, saveOpen, saveRecords, saveNotice, pendingSave, saveStatus, canSave, tutorial, tutorialFixture, tutorialFeedback, lesson, tutorialStep, tutorialIndex, practiceSave, refreshSaves, autosave, openSaves, closeSaves, writeSave, loadSave, confirmSaveAction, importSave, exportSave, goHome, newGame, startLesson, exitTutorial, lessonMenu, nextLesson, savePractice, inspectCell, isControl, isTutorialCell, isTutorialShip, rangeChanged, toggleRanges, chooseTurn, truncateNode, showPlans, previews, mainTargets, P, history, showRanges, rangeMode, replan, explored, knowledge, reachable, certain, ranges, rays, overlayType, overlayCells, canUndo, canRedo, hoverHint, rangeHint, airborne, applyEdit, mutate, trimRoute, undoWaypoint, removeWaypoint, clearMovement, startReplan, historyChange, removeOrder, E, screen, roster, slot, seed, game, plans, selected, mode, pendingTurn, torpWindow, planeMode, showRules, toast, busy, playFrame, playSpeed, progress, showLog, hover, shapes, point, xy, polygon, island, currentTemplate, role, ship, plan, nodes, own, visible, displayShips, displayTorps, displayPlanes, mines, ourHP, ourCount, visibleEnemies, phase, readyAircraft, safeLogs, coord, pickType, start, choose, addMove, undo, pathTo, setMode, clickHex, shipClick, begin, execute, complete, resetPlan, directionNames, mainCounts, plannedPolyline, torpEnd };
}, template: `
<div class="shell" :class="{'battle-active':screen==='battle','orders-closed':!ordersOpen}">
<header class="topbar">
<div class="brand"><strong>碧蓝推演棋</strong></div>
<span class="release-tag">v0.3.2</span>
<div class="top-actions">
<span class="version-note">{{saveStatus||'PvAI \xB7 \u89C4\u5219\u6D4B\u8BD5\u7248'}}</span>
<button v-if="screen!=='home'" class="quiet" :disabled="busy" @click="goHome">\u4E3B\u83DC\u5355</button>
<button v-if="screen==='battle'" class="quiet" :disabled="busy" @click="openSaves">{{tutorial?'\u7EC3\u4E60\u4FDD\u5B58':'\u4FDD\u5B58/\u8BFB\u53D6'}}</button>
<button class="quiet" @click="showRules=true">\u89C4\u5219\u4E0E\u64CD\u4F5C <span class="key">?</span>
</button>
<button v-if="screen==='battle'&&!tutorial" class="quiet" :disabled="busy" @click="newGame">\u91CD\u65B0\u7F16\u961F</button>
</div>
</header>
<div v-if="showLog&&screen==='battle'" class="mobile-log modal-backdrop" @click.self="showLog=false">
<section role="dialog" aria-modal="true" aria-label="战报" class="rules-modal"><div class="panel-title"><h2>战报</h2><button @click="showLog=false">关闭战报</button></div><p v-if="!safeLogs.length">尚未交战</p><p v-for="(l,i) in safeLogs" :key="i">R{{l.round}} · {{l.text}}</p></section></div>
<HomeScreen v-if="screen==='home'" :can-resume="!!game" :save-count="saveRecords.filter(r=>r.save).length" @new="newGame" @load="openSaves" @book="screen='book'" @tutorial="lessonMenu" @resume="screen='battle'"/>
<TutorialBook v-if="screen==='book'" :chapters="T.TEXT_TUTORIAL" :figures="T.SVG_FIGURES" @home="goHome" @practice="lessonMenu"/>
<TutorialMenu v-if="screen==='lessons'" :lessons="T.TUTORIAL_LESSONS" @home="goHome" @start="startLesson"/>
<main v-if="screen==='fleet'" class="fleet-screen">
 <div class="section-intro">
<div>
<p class="eyebrow">01 / FLEET ASSEMBLY</p>
<h1>\u51FA\u51FB\u7F16\u961F</h1>
<p>\u9009\u62E9 3 \u8258\u524D\u6392\u30012 \u8258\u540E\u6392\u3002\u76F8\u540C\u914D\u7F6E\u53EF\u4EE5\u91CD\u590D\u9009\u7528</p>
</div>
<span class="flag">\u5BF9\u624B\uFF1A\u6218\u672F AI</span>
</div>
 <div class="assembly-grid">
<section class="roster-panel">
<div class="panel-title">
<h2>\u6211\u65B9\u8230\u961F</h2>
<span>05 / 05</span>
</div>
<div class="role-label">\u524D\u6392 \xB7 \u673A\u52A8\u4E0E\u62A4\u822A</div>
<button v-for="(type,i) in roster" :key="i" :class="['roster-slot',{active:slot===i}]" @click="slot=i">
<span class="slot-index">0{{i+1}}</span>
<div>
<small>{{i<3?'\u524D\u6392':'\u540E\u6392'}}</small>
<strong>{{E.TEMPLATES[type].name}}-{{i+1}}</strong>
</div>
<span class="slot-stat">{{E.TEMPLATES[type].hp}} <small>HP</small>
</span>
<span class="selection-indicator">{{slot===i?'\u7F16\u8F91\u4E2D':'\u66F4\u6362'}}</span>
</button>
<p class="muted roster-note">\u524D\u540E\u6392\u53EA\u662F\u7F16\u961F\u6807\u7B7E\uFF1B\u6240\u6709\u8230\u8239\u5728\u540C\u4E00\u7247\u6D77\u57DF\u81EA\u7531\u6D3B\u52A8</p>
</section>
 <section class="templates-panel">
<div class="panel-title">
<h2>\u9009\u62E9{{role==='front'?'\u524D\u6392':'\u540E\u6392'}}\u914D\u7F6E</h2>
<span>\u69FD\u4F4D 0{{slot+1}}</span>
</div>
<div class="template-options">
<button v-for="(t,id) in E.TEMPLATES" v-show="t.role===role" :key="id" :class="['template-card',{active:roster[slot]===id}]" @click="pickType(id)">
<div class="template-top">
<strong>{{t.name}}</strong>
<span>{{roster[slot]===id?'\u5DF2\u7F16\u5165':'\u9009\u7528'}}</span>
</div>
<div class="stat-grid">
<div>
<b>{{t.hp}}</b>
<small>\u8010\u4E45</small>
</div>
<div>
<b>{{t.speed}}</b>
<small>\u6B65 / \u56DE\u5408</small>
</div>
<div>
<b>{{t.vision}}</b>
<small>\u89C6\u91CE</small>
</div>
</div>
<p v-if="t.contactSweep">\u9AD8\u901F\u673A\u52A8 \xB7 \u5F3A\u5316\u9632\u7A7A \xB7 \u63A5\u89E6\u6392\u96F7</p>
<p v-else-if="t.torpedo">9 \u679A\u5907\u5F39 \xB7 \u9C7C\u96F7\u4E0E\u526F\u70AE\u517C\u987E</p>
<p v-else-if="t.secondary?.multi">\u591A\u76EE\u6807\u526F\u70AE \xB7 \u6BCF\u654C\u8230\u6BCF\u56DE\u5408\u4E00\u70AE</p>
<p v-else-if="t.main">{{t.main.shots}} 发主炮 · {{t.main.range}} 格盲射 · 隔轮装弹</p>
<p v-else>6 \u67B6\u98DE\u673A \xB7 \u6BCF\u56DE\u5408\u6700\u591A\u653E\u98DE 2 \u67B6</p>
<div class="loadout-line">
<span v-if="t.secondary">\u526F\u70AE {{t.secondary.damage}} / {{t.secondary.range}} \u683C</span>
<span v-if="t.torpedo">\u9C7C\u96F7 {{t.torpedo.reserve}} \u679A</span>
<span v-if="t.aa">\u9632\u7A7A {{t.aa.range}} \u683C</span>
<span v-if="t.carrier">飞机 {{t.carrier.plane.hp}} HP · 单程 {{t.carrier.plane.range}} 格 · 整备回血 {{t.carrier.heal ?? 1}}</span>
</div>
</button>
</div>
</section>
</div>
 <section class="sortie-bar">
<div>
<span class="eyebrow">\u4F5C\u6218\u6D77\u57DF</span>
<strong>19 \xD7 15 \u516D\u89D2\u6D77\u56FE</strong>
<span class="muted">\u955C\u50CF\u5C9B\u7FA4 \xB7 8 \u679A\u516C\u5171\u6C34\u96F7 \xB7 \u6700\u591A 30 \u56DE\u5408</span>
</div>
<label class="seed-label">\u5730\u56FE\u79CD\u5B50 <input type="number" v-model="seed" aria-label="\u5730\u56FE\u79CD\u5B50">
</label>
<button class="primary large" @click="start">\u8FDB\u5165\u90E8\u7F72</button>
</section>
 <p class="footnote">\u89C4\u5212\u4E0D\u9650\u65F6 \xB7 \u53CC\u65B9\u540C\u6B65\u6267\u884C \xB7 AI \u9075\u5B88\u76F8\u540C\u89C6\u91CE\u89C4\u5219 \xB7 \u65E0\u8054\u7F51\u5BF9\u6218</p>
</main>
<main v-if="screen==='battle'" class="battle-screen">
<div v-if="portraitHint" class="portrait-hint"><span>横屏海图更宽，竖屏也可完整操作</span><button aria-label="关闭横屏提示" @click="portraitHint=false">关闭</button></div>
 <section v-if="tutorial" class="tutorial-coach" :class="{expanded:coachOpen}">
<div>
<span class="eyebrow">\u72EC\u7ACB\u6F14\u7EC3 \xB7 {{tutorialIndex+1}} / {{T.TUTORIAL_LESSONS.length}}</span>
<h2>{{lesson.title}}</h2>
<strong>{{tutorial.complete?'\u672C\u8BFE\u5B8C\u6210':(tutorial.stepIndex+1)+' / '+lesson.steps.length+' \xB7 '+tutorialStep?.title}}</strong>
<p>{{tutorial.complete?tutorialFeedback:tutorialStep?.instruction}}</p>
<small>{{tutorial.complete?'\u53EF\u4EE5\u91CD\u8BD5\u672C\u8BFE\uFF0C\u6216\u7EE7\u7EED\u4E0B\u4E00\u8BFE':tutorialStep?.hint}}</small>
</div>
<div class="coach-actions">
<button :disabled="busy" @click="startLesson(lesson.id)">\u91CD\u8BD5\u672C\u8BFE</button>
<button :disabled="busy||tutorialIndex===0" @click="startLesson(T.TUTORIAL_LESSONS[tutorialIndex-1].id)">\u4E0A\u4E00\u8BFE</button>
<button class="primary" :disabled="busy||!tutorial.complete" @click="nextLesson">\u4E0B\u4E00\u8BFE</button>
<button :disabled="busy" @click="exitTutorial">\u9000\u51FA\u6559\u5B66</button>
</div>
</section>
 <section class="battle-strip">
<button v-if="tutorial" class="mobile-only" @click="coachOpen=!coachOpen" :aria-expanded="coachOpen">教学提示</button>
<div class="round">
<small>ROUND</small>
<strong>{{String(game.round).padStart(2,'0')}}<span>/ 30</span>
</strong>
</div>
<div class="phase-heading">
<span class="eyebrow">{{phase==='deploy'?'02 / DEPLOYMENT':phase==='execute'?'04 / SIMULTANEOUS EXECUTION':'03 / ORDERS'}}</span>
<h1>{{phase==='deploy'?'\u8230\u961F\u90E8\u7F72':phase==='execute'?'\u540C\u6B65\u6267\u884C\u4E2D':phase==='ended'?(game.winner==='draw'?'\u6218\u5C40\u7ED3\u675F \xB7 \u5E73\u5C40':game.winner===0?'\u6218\u5C40\u7ED3\u675F \xB7 \u80DC\u5229':'\u6218\u5C40\u7ED3\u675F \xB7 \u8D25\u5317'):'\u6218\u672F\u89C4\u5212'}}</h1>
</div>
<div class="fleet-metric">
<b>{{ourCount}} \u8258</b>
<small>\u6211\u65B9 / {{ourHP}} HP</small>
</div>
<div class="fleet-metric enemy">
<b>{{visibleEnemies}} \u8258</b>
<small>\u5F53\u524D\u53EF\u89C1\u654C\u8230</small>
</div>
<nav class="mobile-fleet" aria-label="选择舰船">
<button v-for="s in own" :key="s.id" :class="['mobile-ship',{active:selected===s.id,sunk:s.hp<=0}]" :disabled="s.hp<=0||busy" @click="choose(s)" :aria-pressed="selected===s.id">{{s.label}}</button>
</nav>
<button class="mobile-only orders-toggle" :aria-label="ordersOpen?'收起指令':'展开指令'" @click="ordersOpen=!ordersOpen" :aria-expanded="ordersOpen">指令</button>
<button class="mobile-only" @click="showLog=!showLog">战报</button>
<div class="execute-controls">
<template v-if="busy">
<select v-model.number="playSpeed" aria-label="\u6267\u884C\u901F\u5EA6">
<option :value="1">1\xD7 \u901F\u5EA6</option>
<option :value="2">2\xD7 \u901F\u5EA6</option>
<option :value="4">4\xD7 \u901F\u5EA6</option>
</select>
<button :disabled="!finished" @click="complete">\u8DF3\u8FC7\u52A8\u753B</button>
</template>
<button v-else-if="phase==='deploy'" class="primary" @click="begin" :data-tutorial-highlight="isControl('begin')?'true':null">\u5B8C\u6210\u90E8\u7F72</button>
<button v-else-if="phase==='ended'" class="primary" @click="screen='fleet'">\u518D\u6218\u4E00\u5C40</button>
<button v-else class="primary" @click="execute" :data-tutorial-highlight="isControl('execute')?'true':null">\u6267\u884C\u56DE\u5408 <span class="key">Enter</span>
</button>
</div>
</section>
 <div class="battle-layout">
<aside class="fleet-sidebar">
<div class="panel-title">
<h2>\u6211\u65B9\u8230\u961F</h2>
<span>1\u20135 \u9009\u62E9</span>
</div>
<button v-for="(s,i) in own" :key="s.id" :class="['ship-row',{active:selected===s.id,sunk:s.hp<=0}]" :disabled="s.hp<=0||busy" @click="choose(s)">
<div class="ship-row-title">
<b>{{s.label}}</b>
<span>{{s.hp>0?mainCounts(s)+' \u9879\u6307\u4EE4':'\u5DF2\u6C89\u6CA1'}}</span>
</div>
<div class="health">
<i :style="{width:s.hp/s.cfg.hp*100+'%'}">
</i>
</div>
<div class="ship-row-meta">
<span>{{s.hp}} / {{s.cfg.hp}}</span>
<span>{{s.cfg.speed}} \u6B65 \xB7 {{coord(s.pos)}}</span>
</div>
</button>
<div class="legend">
<span>
<i class="legend-dot cyan">
</i> \u6211\u65B9</span>
<span>
<i class="legend-dot red">
</i> \u654C\u65B9</span>
<span>\u25C7 \u6C34\u96F7\u5168\u56FE\u516C\u5F00</span>
<span>\u9ED1\u8272\uFF1A\u672A\u63A2\u7D22 \xB7 \u7070\u6697\uFF1A\u5DF2\u63A2\u7D22</span>
</div>
<button class="log-toggle" @click="showLog=!showLog">{{showLog?'\u6536\u8D77':'\u67E5\u770B'}}\u6218\u62A5 <span>{{safeLogs.length}}</span>
</button>
<div v-if="showLog" class="battle-log">
<p v-if="!safeLogs.length">\u5C1A\u672A\u4EA4\u6218</p>
<p v-for="(l,i) in safeLogs" :key="i">
<small>R{{l.round}}</small>{{l.text}}</p>
</div>
<div class="seed-caption">\u6D77\u56FE #{{game.seed}}</div>
</aside>
 <section class="ocean-panel" :class="{'tools-open':rangeToolsOpen}">
<div class="camera-tools">
<button aria-label="放大海图" @click="mapView?.zoomBy(1.25)" :disabled="mapZoom>=3">＋</button>
<button aria-label="缩小海图" @click="mapView?.zoomBy(.8)" :disabled="mapZoom<=1">−</button>
<button @click="mapView?.reset()">全图</button>
<button @click="locateShip">定位当前舰</button>
<button v-if="phase==='plan'" class="mobile-only" @click="rangeToolsOpen=!rangeToolsOpen" :aria-expanded="rangeToolsOpen">图层</button>
<span class="camera-help">单指拖动 · 双指缩放 · 点选下令</span>
</div>
<div class="map-caption">
<span>{{phase==='deploy'?'\u5728\u84DD\u8272\u533A\u57DF\u70B9\u51FB\u90E8\u7F72\uFF1B\u70B9\u8230\u8239\u5207\u6362\u9009\u62E9':phase==='plan'?'点友舰选中 · 航线模式点格子追加航段 · 面板切换武器':'\u6240\u6709\u8230\u8239\u3001\u98DE\u673A\u4E0E\u9C7C\u96F7\u5171\u7528\u65F6\u95F4\u8F74'}}</span>
<span>{{hover?coord(hover):'19 \xD7 15'}}</span>
</div>
<div v-if="phase==='plan'" class="map-tools">
<button :class="{active:showRanges}" @click="toggleRanges" :data-tutorial-highlight="isControl('ranges')?'true':null">{{showRanges?'\u9690\u85CF\u8303\u56F4':'\u663E\u793A\u8303\u56F4'}}</button>
<select v-model="rangeMode" @change="rangeChanged" aria-label="\u8303\u56F4\u63D0\u793A\u7C7B\u578B">
<option value="auto">\u5F53\u524D\u64CD\u4F5C</option>
<option value="reach">\u53EF\u8FBE\u4F4D\u7F6E</option>
<option v-if="ship?.cfg.secondary" value="secondary">\u526F\u70AE \xB7 \u7EC8\u70B9</option>
<option v-if="ship?.cfg.aa" value="aa">\u9632\u7A7A \xB7 \u7EC8\u70B9</option>
<option v-if="ship?.cfg.main" value="main">\u4E3B\u70AE \xB7 \u56DE\u5408\u521D</option>
<option v-if="ship?.cfg.carrier" value="air">\u98DE\u673A\u5355\u7A0B\u6781\u9650</option>
</select>
<button :class="{active:showPlans}" @click="showPlans=!showPlans">{{showPlans?'\u9690\u85CF\u5168\u90E8\u8BA1\u5212':'\u663E\u793A\u5168\u90E8\u8BA1\u5212'}}</button>
<span>{{showRanges?rangeHint:'\u8303\u56F4\u63D0\u793A\u5DF2\u9690\u85CF'}}</span>
</div>
<MapViewport ref="mapView" @zoom="mapZoom=$event">
<svg class="sea-map" viewBox="0 0 900 615" role="img" aria-label="\u516D\u89D2\u6D77\u6218\u5730\u56FE" @contextmenu.prevent>
 <defs>
<pattern id="sea-grid" width="12" height="12" patternUnits="userSpaceOnUse">
<circle cx="1" cy="1" r=".65" fill="#1d3447"/>
</pattern>
<marker id="route-tip" markerWidth="5" markerHeight="5" refX="3" refY="2" orient="auto">
<path d="M0 0L4 2 0 4" fill="none" stroke="#63dfd5"/>
</marker>
</defs>
<rect width="900" height="615" fill="url(#sea-grid)"/>
 <g v-for="h in shapes" :key="h.k" @click="clickHex(h,$event)" @contextmenu.prevent="clickHex(h,$event,true)" @mouseenter="inspectCell(h,false)">
<polygon :points="polygon(h)" :class="['hex',{unexplored:!explored.has(h.k),remembered:explored.has(h.k)&&!visible.has(h.k),island:island.has(h.k)&&explored.has(h.k),deploy:phase==='deploy'&&E.deployment(0).some(x=>E.same(x,h)),['overlay-'+overlayType]:overlayCells.has(h.k),'tutorial-focus':isTutorialCell(h),hovered:hover&&E.same(hover,h)}]"/>
<text v-if="island.has(h.k)&&explored.has(h.k)" :x="h.x" :y="h.y+4" class="island-label">\u5C9B</text>
<text v-if="h.r===0" :x="h.x" :y="h.y-25" class="coordinate">{{String.fromCharCode(65+E.toCR(h).c)}}</text>
<text v-if="E.toCR(h).c===0" :x="h.x-28" :y="h.y+4" class="coordinate">{{h.r+1}}</text>
</g>
 <g pointer-events="none">
<g class="public-mine" v-for="m in mines" :key="'m'+E.key(m)">
<path :d="'M'+point(m).x+' '+(point(m).y-8)+' l8 8 -8 8 -8 -8Z'" fill="#cda96522" stroke="#d9b471" stroke-width="1.7"/>
<circle :cx="point(m).x" :cy="point(m).y" r="2" fill="#edc27c"/>
</g>
 <template v-if="phase==='plan'&&showPlans">
<g v-for="v in previews" :key="'plan-'+v.ship.id" :class="['friendly-plan',{emphasized:v.selected}]" :data-ship-id="v.ship.id" :opacity="v.selected?1:.56">
<polyline :points="plannedPolyline(v.ship)" fill="none" stroke="#6ee6dc" :stroke-width="v.selected?2.6:1.3" stroke-dasharray="5 4" marker-end="url(#route-tip)"/>
<g v-for="(n,i) in v.nodes.slice(1)" :key="'n'+i" class="editable-node" :pointer-events="v.selected&&mode==='move'?'all':'none'" @click.stop="truncateNode(i+1,v.ship.id)">
<circle :cx="point(n.pos).x" :cy="point(n.pos).y" :r="v.selected?7:5.5" fill="#122d3b" stroke="#70dfd5"/>
<text :x="point(n.pos).x" :y="point(n.pos).y+3.5" class="node-label">{{i+1}}</text>
</g>
<g v-if="v.plan.moves.length" class="planning-endpoint">
<text :x="point(v.nodes.at(-1).pos).x" :y="point(v.nodes.at(-1).pos).y-15" class="endpoint-label">{{v.ship.label}} \xB7 {{v.plan.moves.length}}/{{v.ship.cfg.speed}}</text>
</g>
<g v-for="(t,i) in v.torps" :key="'t'+i" class="planned-torpedo">
<line :x1="point(t.origin).x" :y1="point(t.origin).y" :x2="point(t.fullEnd).x" :y2="point(t.fullEnd).y" stroke="#d4b576" stroke-width="1.2" stroke-dasharray="3 5"/>
<line :x1="point(t.origin).x" :y1="point(t.origin).y" :x2="point(t.end).x" :y2="point(t.end).y" stroke="#f0c672" stroke-width="2.5"/>
<text :x="point(t.origin).x+10" :y="point(t.origin).y+17" class="torp-window-label">\u9C7C{{t.window}}</text>
</g>
<g v-for="(p,i) in v.planes" :key="'p'+i" class="planned-aircraft">
<line :x1="point(v.ship.pos).x" :y1="point(v.ship.pos).y" :x2="point(p.target).x" :y2="point(p.target).y" stroke="#78e8d7" stroke-width="1.5" stroke-dasharray="4 4"/>
<circle :cx="point(p.target).x" :cy="point(p.target).y" r="13" fill="none" stroke="#78e8d7"/>
</g>
<circle v-if="v.plan.sweep" class="planned-sweep" :cx="point(v.plan.sweep).x" :cy="point(v.plan.sweep).y" r="16" fill="none" stroke="#edc27c"/>
</g>
<g v-for="t in mainTargets" :key="'a'+E.key(t.at)" class="planned-artillery" :opacity="t.selected?1:.5">
<circle :cx="point(t.at).x" :cy="point(t.at).y" r="15" fill="#f3916a22" stroke="#f3916a" :stroke-width="t.selected?2.5:1.3"/>
<text :x="point(t.at).x" :y="point(t.at).y+4" class="target-number">\xD7{{t.count}}</text>
</g>
</template>
 <g v-if="phase==='plan'&&showRanges&&overlayType==='torp'" class="torpedo-directions">
<g v-for="r in rays" :key="r.dir">
<line :x1="point(r.origin).x" :y1="point(r.origin).y" :x2="point(r.fullEnd).x" :y2="point(r.fullEnd).y" stroke="#baa06a" stroke-dasharray="2 6" opacity=".65"/>
<line :x1="point(r.origin).x" :y1="point(r.origin).y" :x2="point(r.roundEnd).x" :y2="point(r.roundEnd).y" stroke="#edc274" stroke-width="1.8"/>
</g>
</g>
 <circle v-if="phase==='plan'&&showRanges&&overlayType==='air'&&ship.cfg.carrier" class="plane-range-limit" :cx="point(ship.pos).x" :cy="point(ship.pos).y" :r="ship.cfg.carrier.plane.range*Math.sqrt(3)*25" fill="none" stroke="#b7a3f1" stroke-width="2" stroke-dasharray="7 5"/>
 </g>
 <g v-for="s in displayShips" :key="s.id" @click="shipClick(s,$event)" @contextmenu.prevent="clickHex(E.xyToHex(s.xy),$event,true)" class="ship-marker" @mouseenter="inspectCell(E.xyToHex(s.xy),false)" :data-tutorial-highlight="isTutorialShip(s.id)?'true':null">
<circle :cx="xy(s.xy).x" :cy="xy(s.xy).y" :r="s.cfg.radius*25" :class="['ship-circle',s.team===0?'friendly':'hostile',{selected:selected===s.id}]"/>
<g :transform="'translate('+xy(s.xy).x+' '+xy(s.xy).y+') rotate('+s.heading*60+')'">
<path d="M21 0L14 -5L14 5Z" :fill="s.team===0?'#93fff0':'#ff9b87'"/>
</g>
<text :x="xy(s.xy).x" :y="xy(s.xy).y+3" class="unit-label">{{s.label}}</text>
<line :x1="xy(s.xy).x-13" :y1="xy(s.xy).y+10" :x2="xy(s.xy).x+13" :y2="xy(s.xy).y+10" stroke="#071421" stroke-width="3"/>
<line :x1="xy(s.xy).x-13" :y1="xy(s.xy).y+10" :x2="xy(s.xy).x-13+26*s.hp/s.cfg.hp" :y2="xy(s.xy).y+10" :stroke="s.team===0?'#78e8d7':'#ef957e'" stroke-width="3"/>
</g>
 <g v-for="p in displayTorps" :key="p.id" :transform="'translate('+xy(p.xy).x+' '+xy(p.xy).y+') rotate('+p.heading*60+')'" pointer-events="none">
<path d="M-5 -2L5 0 -5 2Z" :fill="p.team===0?'#f2d18d':'#fa8c6d'"/>
</g>
<g v-for="p in displayPlanes" :key="p.id" class="plane-marker" :class="{returning:p.state==='return'}" :transform="'translate('+xy(p.xy).x+' '+xy(p.xy).y+')'" pointer-events="none">
<title>{{p.team===0?'友方':'敌方'}}飞机 · {{p.state==='return'?'返航':'出击'}}</title>
<path :transform="'rotate('+planeAngle(p)+')'" d="M11 0 L3 -2 L-2 -9 L-5 -9 L-3 -2 L-8 -2 L-10 -5 L-12 -5 L-10 0 L-12 5 L-10 5 L-8 2 L-3 2 L-5 9 L-2 9 L3 2 Z" :fill="p.team===0?'#78e8d7':'#ef957e'" stroke="#111d32" stroke-width="1.2" stroke-linejoin="round"/>
<text v-if="p.state==='return'" x="0" y="16" class="plane-letter" :style="{fill:p.team===0?'#78e8d7':'#ef957e'}">返</text>
</g>
 <g v-for="(e,i) in (playFrame?.effects||[]).filter(e=>visible.has(E.key(e.at)))" :key="i" pointer-events="none">
<line v-if="e.from&&visible.has(E.key(e.from))" :x1="point(e.from).x" :y1="point(e.from).y" :x2="point(e.at).x" :y2="point(e.at).y" :stroke="e.kind==='aa'?'#cdb4ff':'#f6d292'" stroke-width="1.5"/>
<circle v-if="e.kind==='main'" :cx="point(e.at).x" :cy="point(e.at).y" r="23" fill="#ff986633" stroke="#ffab75"/>
<text v-if="e.text" :x="point(e.at).x" :y="point(e.at).y-17" class="damage-label">{{e.text}}</text>
</g>
 </svg>
</MapViewport>
<div class="map-footer">
<span>
<i class="legend-dot cyan">
</i> \u5171\u4EAB\u89C6\u91CE {{ship?.cfg.vision||5}} \u683C \xB7 \u5C9B\u5C7F\u906E\u6321\u89C6\u7EBF</span>
<span class="hover-hint">{{hoverHint||'\u6C34\u96F7\u516C\u5F00 \xB7 \u9ED1\u8272\u672A\u63A2\u7D22 \xB7 \u7070\u6697\u8BB0\u5FC6\u5730\u5F62'}}</span>
</div>
<div v-if="busy" class="execution-progress" :style="{width:progress*100+'%'}">
</div>
</section>
 <aside class="orders-sidebar" v-if="ship" :class="{collapsed:!ordersOpen}" aria-label="舰船指令">

<div class="selected-heading">
<div>

<h2>{{ship.label}}</h2>
</div>
<span class="heading-label">{{directionNames[ship.heading]}}</span>
</div>
<details v-if="phase==='plan'" class="mobile-range-tools"><summary>范围与计划图层</summary>
<button :class="{active:showRanges}" @click="toggleRanges" :data-tutorial-highlight="isControl('ranges')?'true':null">{{showRanges?'\u9690\u85CF\u8303\u56F4':'\u663E\u793A\u8303\u56F4'}}</button>
<select v-model="rangeMode" @change="rangeChanged" aria-label="\u8303\u56F4\u63D0\u793A\u7C7B\u578B">
<option value="auto">\u5F53\u524D\u64CD\u4F5C</option>
<option value="reach">\u53EF\u8FBE\u4F4D\u7F6E</option>
<option v-if="ship?.cfg.secondary" value="secondary">\u526F\u70AE \xB7 \u7EC8\u70B9</option>
<option v-if="ship?.cfg.aa" value="aa">\u9632\u7A7A \xB7 \u7EC8\u70B9</option>
<option v-if="ship?.cfg.main" value="main">\u4E3B\u70AE \xB7 \u56DE\u5408\u521D</option>
<option v-if="ship?.cfg.carrier" value="air">\u98DE\u673A\u5355\u7A0B\u6781\u9650</option>
</select>
<button :class="{active:showPlans}" @click="showPlans=!showPlans">{{showPlans?'\u9690\u85CF\u5168\u90E8\u8BA1\u5212':'\u663E\u793A\u5168\u90E8\u8BA1\u5212'}}</button>
<span>{{showRanges?rangeHint:'\u8303\u56F4\u63D0\u793A\u5DF2\u9690\u85CF'}}</span>
</details>
<div class="selected-stats">
<span>
<b>{{ship.hp}}</b> HP</span>
<span>
<b>{{ship.cfg.speed}}</b> \u6B65</span>
<span>
<b>{{ship.torps}}</b> \u9C7C\u96F7</span>
</div>
 <div v-if="phase==='deploy'" class="deployment-help">
<button :class="{active:swapMode}" @click="swapMode=!swapMode">{{swapMode?'取消交换':'交换位置'}}</button>
<p v-if="swapMode">已选 {{ship.label}}，点击另一艘友舰交换。</p>
<h3>\u90E8\u7F72\u5230\u5DE6\u4E0B\u89D2</h3>
<p>\u70B9\u51FB\u6211\u65B9\u8230\u8239\uFF0C\u518D\u70B9\u51FB\u84DD\u8272\u90E8\u7F72\u683C\u3002点“交换位置”后点另一艘友舰，可交换位置</p>
<p>\u521D\u59CB\u8230\u9996\u671D\u4E1C\uFF0C\u654C\u65B9\u5728右上角\u671D\u897F</p>
<button class="primary full" @click="begin" :data-tutorial-highlight="isControl('begin')?'true':null">\u5B8C\u6210\u90E8\u7F72</button>
</div>
 <template v-else-if="phase==='plan'&&ship.hp>0">
<div class="mode-buttons">
<button :class="{active:mode==='move'}" @click="setMode('move')" :data-tutorial-highlight="isControl('move-mode')?'true':null">\u822A\u7EBF</button>
<button v-if="ship.cfg.torpedo" :class="{active:mode==='torp'}" @click="setMode('torp')" :data-tutorial-highlight="isControl('torp-mode')?'true':null">\u9C7C\u96F7 <small>T</small>
</button>
<button v-if="ship.cfg.main" :class="{active:mode==='main'}" :disabled="ship.mainReady>game.round" @click="setMode('main')" :data-tutorial-highlight="isControl('main-mode')?'true':null">\u4E3B\u70AE <small>G</small>
</button>
<button v-if="ship.cfg.carrier" :class="{active:mode==='plane'}" @click="setMode('plane')" :data-tutorial-highlight="isControl('plane-mode')?'true':null">\u98DE\u673A <small>F</small>
</button>
<button v-if="ship.cfg.secondary" :class="{active:mode==='mine'}" @click="setMode('mine')" :data-tutorial-highlight="isControl('mine-mode')?'true':null">\u6392\u96F7 <small>M</small>
</button>
</div>
 <section v-if="mode==='move'" class="order-tool">
<div class="tool-title">\u8FFD\u52A0\u79FB\u52A8\u6B65\u9AA4 <span>{{plan.moves.length}} / {{ship.cfg.speed}}</span>
</div>
<div class="turn-buttons">
<button :class="{active:pendingTurn===-1}" @click="chooseTurn(-1)" :data-tutorial-highlight="isControl('turn-left')?'true':null">\u5DE6\u8F6C 60\xB0 <small>Q</small>
</button>
<button :class="{active:pendingTurn===0}" @click="chooseTurn(0)" :data-tutorial-highlight="isControl('turn-straight')?'true':null">\u76F4\u884C <small>Z</small>
</button>
<button :class="{active:pendingTurn===1}" @click="chooseTurn(1)" :data-tutorial-highlight="isControl('turn-right')?'true':null">\u53F3\u8F6C 60\xB0 <small>E</small>
</button>
</div>
<div class="move-buttons">
<button @click="addMove(pendingTurn,true)" :data-tutorial-highlight="isControl('forward')?'true':null">\u524D\u8FDB <small>W</small>
</button>
<button @click="addMove(pendingTurn,false)" :data-tutorial-highlight="isControl('wait')?'true':null">{{pendingTurn?'\u539F\u5730\u8F6C\u5411':'\u539F\u5730\u7B49\u5F85'}} <small>Space</small>
</button>
</div>
<p class="tool-hint">{{replan?'\u91CD\u65B0\u89C4\u5212\u4E2D\uFF1A\u70B9\u51FB\u65B0\u822A\u70B9':'点击可达格追加航段（鼠标也可右键）'}}\u3002\u5148\u9009\u8F6C\u5411\uFF0C\u518D\u70B9\u524D\u8FDB\u6216\u539F\u5730\u786E\u8BA4\u4E00\u6B65</p>
</section>
 <section v-if="mode==='torp'" class="order-tool">
<label>\u53D1\u5C04\u7A97\u53E3 <select v-model.number="torpWindow">
<option v-for="(n,i) in nodes" :value="i">{{i===0?'\u56DE\u5408\u5F00\u59CB':'\u6B65\u9AA4 '+i+' \u540E'}} \xB7 {{coord(n.pos)}}</option>
</select>
</label>
<p class="tool-hint">\u70B9\u51FB\u4FA7\u9762\u56DB\u4E2A\u65B9\u5411\u4E4B\u4E00\uFF1B\u6BCF\u7A97\u53E3 1 \u679A\uFF0C\u6BCF\u56DE\u5408\u81F3\u591A 3 \u679A\u3002\u91D1\u8272\u865A\u7EBF\u6307\u793A\u65B9\u5411</p>
</section>
 <section v-if="mode==='main'" class="order-tool">
<div class="tool-title">\u4E3B\u70AE\u843D\u70B9 <span>{{plan.main.length}} / 3</span>
</div>
<p class="tool-hint">点击 {{ship.cfg.main.range}} 格内任意位置\uFF0C\u53EF\u91CD\u590D\u70B9\u540C\u4E00\u683C\u3002\u6BCF\u53D1 60 \u4F24\u5BB3\uFF0C\u56DE\u5408\u672B\u547D\u4E2D\uFF1B\u4E0B\u56DE\u5408\u88C5\u5F39</p>
</section>
 <section v-if="mode==='plane'" class="order-tool">
<div class="turn-buttons">
<button :class="{active:planeMode==='point'}" @click="planeMode='point'">\u5B9A\u70B9\u822A\u7EBF</button>
<button :class="{active:planeMode==='target'}" @click="planeMode='target'">\u6307\u5B9A\u654C\u8230</button>
</div>
<p class="tool-hint">{{planeMode==='point'?'\u70B9\u51FB\u7EC8\u70B9\uFF0C\u98DE\u673A\u6CBF\u516D\u89D2\u76F4\u7EBF\u98DE\u884C\uFF0C\u9047\u5230\u9996\u8258\u654C\u8230\u6295\u5F39':'\u70B9\u51FB\u53EF\u89C1\u654C\u8230\uFF0C\u8FFD\u8E2A\u5E76\u53EA\u8F70\u70B8\u8BE5\u76EE\u6807'}}\u3002\u6BCF\u56DE\u5408\u6700\u591A 2 \u67B6</p>
</section>
 <section v-if="mode==='mine'" class="order-tool">
<p class="tool-hint">\u70B9\u51FB\u526F\u70AE {{ship.cfg.secondary?.range}} \u683C\u5185\u53EF\u76F4\u89C6\u7684\u6C34\u96F7\uFF0C\u56DE\u5408\u5F00\u59CB\u79FB\u9664\u3002\u672C\u56DE\u5408\u5168\u90E8\u526F\u70AE\u673A\u4F1A\u53D6\u6D88\uFF0C\u4E3B\u70AE\u4E0D\u53D7\u5F71\u54CD</p>
</section>
 <section class="route-edit-tools">
<div class="edit-buttons">
<button @click="historyChange('undo')" :disabled="!canUndo">\u64A4\u9500\u4FEE\u6539</button>
<button @click="historyChange('redo')" :data-tutorial-highlight="isControl('redo')?'true':null" :disabled="!canRedo">\u91CD\u505A\u4FEE\u6539</button>
</div>
<div class="edit-buttons">
<button @click="undoWaypoint" :data-tutorial-highlight="isControl('undo-segment')?'true':null" :disabled="!plan.moves.length">\u64A4\u9500\u822A\u70B9</button>
<button @click="startReplan" :data-tutorial-highlight="isControl('redraw-movement')?'true':null">\u91CD\u65B0\u89C4\u5212</button>
<button @click="clearMovement" :disabled="!plan.moves.length">\u6E05\u9664\u822A\u7EBF</button>
</div>
<p>\u4EC5\u7F16\u8F91\u672C\u8230 \xB7 Ctrl/\u2318 Z \u64A4\u9500 \xB7 Shift Z \u91CD\u505A</p>
<div class="waypoint-item" v-for="(segment,i) in (plan.segments||[])" :key="i">
<span>\u822A\u70B9 {{i+1}} \xB7 {{coord(segment.target)}} \xB7 \u7D2F\u8BA1 {{segment.end}} \u6B65</span>
<button @click="removeWaypoint(i)" :aria-label="'\u5220\u9664\u822A\u70B9'+(i+1)+'\u53CA\u540E\u7EED\u8DEF\u7EBF'">\xD7</button>
</div>
</section>
 <p v-if="routeConflicts.length" class="route-warning" role="status">当前计划可能与 {{routeConflicts.join('、')}} 碰撞，移动会截停并可能退回起点。可调整航路或先移开友舰。</p>
<p v-if="lastMovement[selected]" class="movement-receipt" role="status">上回合：{{lastMovement[selected].steps}} 步指令已接收 · {{lastMovement[selected].reason}}</p>
 <section class="action-list">
<div class="tool-title">\u672C\u8230\u6307\u4EE4 <button class="text-button" @click="resetPlan">\u6E05\u7A7A\u5168\u90E8</button>
</div>
<p v-if="!mainCounts(ship)" class="empty-state">\u5C1A\u65E0\u6307\u4EE4\uFF0C\u6267\u884C\u65F6\u5C06\u539F\u5730\u5F85\u547D<br>\u526F\u70AE\u4E0E\u9632\u7A7A\u4ECD\u81EA\u52A8\u8FD0\u884C</p>
<div v-for="(m,i) in plan.moves" :key="'mv'+i" class="action-item movement">
<span class="action-number">{{i+1}}</span>
<span>{{m.turn===-1?'\u5DE6\u8F6C':m.turn===1?'\u53F3\u8F6C':'\u4FDD\u6301'}} \xB7 {{m.forward?'\u524D\u8FDB':'\u539F\u5730'}}<small>{{coord(nodes[i+1].pos)}}</small>
</span>
<button @click="undo(i)" :aria-label="'\u5220\u9664\u7B2C'+(i+1)+'\u6B65\u53CA\u540E\u7EED\u822A\u6BB5'">\xD7</button>
</div>
<div v-for="(t,i) in plan.torps" :key="'to'+i" class="action-item torp">
<span>\u9C7C\u96F7</span>
<span>\u8282\u70B9 {{t.window}} \xB7 {{directionNames[t.dir]}}</span>
<button @click="removeOrder('torps',i)" aria-label="\u5220\u9664\u9C7C\u96F7\u6307\u4EE4">\xD7</button>
</div>
<div v-for="(h,i) in plan.main" :key="'ma'+i" class="action-item artillery">
<span>\u4E3B\u70AE</span>
<span>{{coord(h)}} \xB7 60 \u4F24\u5BB3</span>
<button @click="removeOrder('main',i)" aria-label="\u5220\u9664\u4E3B\u70AE\u843D\u70B9">\xD7</button>
</div>
<div v-for="(p,i) in plan.planes" :key="'pl'+i" class="action-item aviation">
<span>\u98DE\u673A</span>
<span>{{p.mode==='point'?coord(p.target):'\u8FFD\u8E2A\u6307\u5B9A\u654C\u8230'}}</span>
<button @click="removeOrder('planes',i)" aria-label="\u5220\u9664\u98DE\u673A\u6307\u4EE4">\xD7</button>
</div>
<div v-if="plan.sweep" class="action-item torp">
<span>\u6E05\u96F7</span>
<span>{{coord(plan.sweep)}} \xB7 \u6D88\u8017\u526F\u70AE</span>
<button @click="removeOrder('sweep')" aria-label="\u53D6\u6D88\u6E05\u96F7">\xD7</button>
</div>
<button v-if="plan.moves.length" class="undo-button" @click="undo()">\u64A4\u9500\u672B\u6B65 <small>Backspace</small>
</button>
</section>
</template>
 <div v-if="ship.cfg.main" class="weapon-status">
<span>\u4E3B\u70AE</span>
<b>{{ship.mainReady>game.round?'\u88C5\u5F39\u4E2D \xB7 \u4E0B\u4E00\u8F6E\u53EF\u7528':'\u5DF2\u88C5\u586B'}}</b>
</div>
<div v-if="ship.cfg.carrier" class="weapon-status">
<span>\u673A\u5E93</span>
<b>{{readyAircraft}} \u53EF\u7528 / {{ship.destroyedPlanes}} \u635F\u5931</b>
</div>
<div v-if="airborne.length" class="airborne-status">
<p v-for="p in airborne" :key="p.id">\u98DE\u673A {{p.state==='return'?'\u8FD4\u822A\u4E2D':'\u5269\u4F59\u5355\u7A0B '+Math.max(0,p.cfg.range-p.traveled).toFixed(1)+' \u683C'}}</p>
</div>
<div class="capability-note">
<p v-if="ship.cfg.secondary">\u526F\u70AE {{ship.cfg.secondary.damage}} \u4F24\u5BB3 / {{ship.cfg.secondary.range}} \u683C \xB7 {{ship.cfg.secondary.multi?'\u6BCF\u654C\u8230\u4E00\u6B21':'\u5168\u56DE\u5408\u4E00\u6B21'}}</p>
<p v-if="ship.cfg.aa">\u9632\u7A7A {{ship.cfg.aa.range}} \u683C / \u6BCF\u654C\u673A\u6BCF\u56DE\u5408 1 \u4F24\u5BB3</p>
<p v-if="ship.cfg.contactSweep">\u63A5\u89E6\u6C34\u96F7\u81EA\u52A8\u6E05\u9664</p>
<p v-if="ship.cfg.carrier">飞机 {{ship.cfg.carrier.plane.hp}} HP · {{ship.cfg.carrier.plane.speed}} 格 / 回合 · 单程 {{ship.cfg.carrier.plane.range}} 格 · 炸弹 {{ship.cfg.carrier.plane.damage}} · 整备回血 {{ship.cfg.carrier.heal ?? 1}}</p>
</div>
</aside>
</div>
 <section v-if="phase==='ended'" class="result-panel">
<strong>{{game.winner==='draw'?'\u53CC\u65B9\u52BF\u5747\u529B\u654C':game.winner===0?'\u6D77\u57DF\u63A7\u5236\u5B8C\u6210':'\u8230\u961F\u4F5C\u6218\u7ED3\u675F'}}</strong>
<p>\u6211\u65B9 {{ourCount}} \u8258 / {{ourHP}} HP \xB7 \u654C\u65B9 {{game.ships.filter(s=>s.team===1&&s.hp>0).length}} \u8258 / {{game.ships.filter(s=>s.team===1).reduce((n,s)=>n+s.hp,0)}} HP</p>
<span>\u5148\u6BD4\u8F83\u5B58\u6D3B\u8230\u8239\u6570\uFF0C\u6570\u91CF\u76F8\u540C\u518D\u6BD4\u8F83\u603B\u8010\u4E45</span>
</section>
</main>
<SaveManager v-if="saveOpen" :records="saveRecords" :can-save="canSave" :notice="saveNotice" :pending="pendingSave" :in-battle="screen==='battle'" @close="closeSaves" @write="writeSave" @load="loadSave" @export="exportSave" @import="importSave" @confirm="confirmSaveAction" @cancel="pendingSave=null"/>
<div v-if="toast" class="toast" role="status">{{toast}}</div>
<div v-if="showRules" class="modal-backdrop" @click.self="showRules=false">
<section class="rules-modal" role="dialog" aria-modal="true" aria-label="\u89C4\u5219\u4E0E\u64CD\u4F5C">
<div class="panel-title">
<h2>\u4F5C\u6218\u624B\u518C \xB7 v0.3.2</h2>
<button @click="showRules=false" aria-label="\u5173\u95ED\u89C4\u5219">\u5173\u95ED</button>
</div>
<div class="rules-columns">
<section>
<h3>\u64CD\u4F5C</h3>
<p>\u5DE6\u952E\u9009\u62E9\u6211\u65B9\u8230\u8239\uFF1B\u53F3\u952E\u8FFD\u52A0\u822A\u6BB5\u3002\u624B\u673A\u53EF\u7528\u201C\u822A\u7EBF\u201D\u6A21\u5F0F\u70B9\u51FB\u76EE\u6807\u683C\uFF0C\u6216\u7528\u4FA7\u680F\u65B9\u5411\u4E0E\u524D\u8FDB\u6309\u94AE</p>
<p>Q / E \u9009\u62E9\u5DE6\u8F6C / \u53F3\u8F6C\uFF0CZ \u4FDD\u6301\uFF1BW \u524D\u8FDB\uFF0CSpace \u539F\u5730\u7B49\u5F85\u6216\u8F6C\u5411\uFF1BBackspace \u64A4\u9500\u672B\u6B65\uFF1B1\u20135 \u9009\u8230</p>
<p>T \u9C7C\u96F7\u3001G \u4E3B\u70AE\u3001F \u98DE\u673A\u3001M \u6392\u96F7\uFF0CEsc \u8FD4\u56DE\u822A\u7EBF\u6A21\u5F0F\uFF1BEnter \u6267\u884C\u56DE\u5408\u3002\u89C4\u5212\u6CA1\u6709\u65F6\u95F4\u9650\u5236</p>
<h3>\u8FF7\u96FE\u4E0E\u8BA1\u5212\u7F16\u8F91</h3>
<p>\u9ED1\u8272\u683C\u672A\u63A2\u7D22\uFF0C\u7070\u6697\u683C\u4FDD\u7559\u5DF2\u53D1\u73B0\u5730\u5F62\uFF0C\u6B63\u5E38\u4EAE\u5EA6\u4E3A\u5F53\u524D\u5171\u4EAB\u89C6\u91CE\u3002\u654C\u8230\u79BB\u5F00\u89C6\u91CE\u5373\u6D88\u5931\uFF0C\u6CA1\u6709\u6B8B\u5F71\uFF1B\u6C34\u96F7\u4ECD\u5168\u56FE\u516C\u5F00\u3002\u7EFF\u8272\u53EF\u8FBE\u8303\u56F4\u8003\u8651\u8230\u9996\u3001\u5269\u4F59\u6B65\u9AA4\u548C\u5DF2\u77E5\u5C9B\u5C7F\uFF0C\u672A\u63A2\u7D22\u822A\u8DEF\u53EA\u662F\u8BD5\u63A2</p>
<p>\u6240\u6709\u5DF1\u65B9\u8BA1\u5212\u9ED8\u8BA4\u53EF\u89C1\uFF0C\u9009\u4E2D\u8230\u9AD8\u4EAE\uFF1B\u4E3B\u70AE\u53E0\u70B9\u663E\u793A\u53D1\u6570\uFF0C\u98DE\u673A\u663E\u793A\u51FA\u51FB\u8DEF\u7EBF\uFF0C\u9C7C\u96F7\u5B9E\u7EBF\u662F\u672C\u8F6E\u822A\u7A0B\u3001\u865A\u7EBF\u662F\u5BFF\u547D\u4E0A\u9650\u3002\u53EF\u6309\u9700\u8981\u9690\u85CF\u8303\u56F4\u6216\u5168\u90E8\u8BA1\u5212\u3002\u822A\u70B9\u53EF\u6574\u6BB5\u64A4\u9500\uFF0C\u91CD\u65B0\u89C4\u5212/\u6E05\u9664\u822A\u7EBF\u4FDD\u7559\u5176\u4ED6\u6B66\u5668\u6307\u4EE4\uFF1B\u5931\u6548\u9C7C\u96F7\u7A97\u53E3\u4F1A\u53D6\u6D88\u5E76\u63D0\u793A\u3002Ctrl/\u2318 Z \u64A4\u9500\uFF0CShift Z \u91CD\u505A</p>
<h3>\u540C\u6B65\u4E0E\u78B0\u649E</h3>
<p>\u4E0D\u540C\u822A\u901F\u5171\u4EAB\u540C\u4E00\u56DE\u5408\u65F6\u95F4\u8F74\u3002\u8230\u8239\u6309\u5706\u5F62\u5B9E\u4F53\u78B0\u649E\uFF0C\u53CB\u519B\u540C\u6837\u53D7\u4F24\uFF1B\u78B0\u649E\u540E\u505C\u5728\u63A5\u89E6\u4F4D\u7F6E\uFF0C\u672A\u5230\u8FBE\u9C7C\u96F7\u8282\u70B9\u53D6\u6D88</p>
<p>\u4E3B\u70AE\u547D\u4E2D\u4E4B\u540E\uFF0C\u649E\u505C\u8230\u6CBF\u5B9E\u9645\u7ECF\u8FC7\u7684\u539F\u8DEF\u56DE\u9000\u5230\u5408\u6CD5\u683C\uFF1B\u65E0\u5904\u56DE\u9000\u5219\u6401\u6D45\u6C89\u6CA1\u3002\u65E0\u63A7\u5236\u533A\u622A\u505C</p>
<h3>\u80DC\u8D1F</h3>
<p>\u5168\u90E8\u8230\u8239\u6C89\u6CA1\u6216\u7B2C 30 \u56DE\u5408\u7ED3\u675F\u65F6\u7ED3\u7B97\u3002\u5148\u6BD4\u5B58\u6D3B\u8230\u6570\uFF0C\u518D\u6BD4\u603B HP\uFF1B\u5B8C\u5168\u76F8\u540C\u4E3A\u5E73\u5C40\uFF0C\u53CC\u65B9\u5168\u706D\u4E5F\u4E3A\u5E73\u5C40</p>
</section>
<section>
<h3>\u6B66\u5668</h3>
<p>\u4E3B\u70AE\uFF1A\u5F00\u5C40\u53D1\u5C04\uFF0C\u56DE\u5408\u672B\u843D\u5730\uFF0C12 \u683C\u76F2\u5C04\uFF0C\u6700\u591A\u4E09\u53D1\u4E14\u53EF\u53E0\u70B9\uFF0C\u6BCF\u53D1 60 \u4F24\u5BB3\uFF0C\u4E4B\u540E\u7A7A\u8FC7\u4E00\u8F6E</p>
<p>\u9C7C\u96F7\uFF1A\u8D77\u59CB\u4E0E\u6BCF\u6B65\u672B\u5C3E\u53EF\u53D1\u5C04\uFF0C\u6BCF\u7A97 1 \u679A\u3001\u6BCF\u8F6E\u6700\u591A 3 \u679A\u3002\u4FA7\u5411\u56DB\u9009\u4E00\uFF0C\u901F\u5EA6 5\u3001\u5BFF\u547D 3 \u56DE\u5408\u3001\u4F24\u5BB3 45\uFF0C\u9047\u5C9B\u6216\u7B2C\u4E00\u76EE\u6807\u505C\u6B62</p>
<p>\u526F\u70AE\uFF1A\u53EF\u89C1\u4E14\u65E0\u906E\u6321\u7684\u6700\u8FD1\u654C\u8230\uFF0C\u666E\u901A\u6BCF\u8F6E\u603B\u8BA1\u4E00\u70AE\uFF1B\u5F3A\u5316\u914D\u7F6E\u53EF\u5BF9\u6BCF\u8258\u654C\u8230\u5404\u4E00\u70AE\u3002\u8FDC\u7A0B\u6E05\u96F7\u6D88\u8017\u5168\u90E8\u526F\u70AE\uFF0C\u4E0D\u5F71\u54CD\u4E3B\u70AE</p>
<h3>\u98DE\u673A\u4E0E\u9632\u7A7A</h3>
<p>\u6BCF\u822A\u6BCD 6 \u67B6\uFF0C\u6700\u591A\u6BCF\u8F6E 2 \u67B6\u3002\u98DE\u673A 2 HP\u3001\u822A\u901F 6\u3001\u89C6\u91CE 3\u3001\u5355\u7A0B\u7D2F\u8BA1\u822A\u7A0B 18\u3001\u70B8\u5F39 25\u3002\u8FD4\u822A\u8FFD\u8E2A\u5F53\u524D\u6BCD\u8230\uFF0C\u4E0D\u6D88\u8017\u5355\u7A0B\u822A\u7A0B\uFF1B\u56DE\u6536\u540E\u6574\u5907\u4E00\u6574\u8F6E</p>
<p>\u5B9A\u70B9\u6A21\u5F0F\u6CBF\u76F4\u7EBF\u516D\u89D2\u822A\u8DEF\uFF0C\u9047\u7B2C\u4E00\u8258\u654C\u8230\u6295\u5F39\uFF1B\u6307\u5B9A\u6A21\u5F0F\u53EA\u70B8\u76EE\u6807\uFF0C\u672C\u8F6E\u4E22\u5931\u89C6\u91CE\u4ECD\u8FFD\u8E2A\uFF0C\u4E0B\u8F6E\u5411\u51BB\u7ED3\u7684\u76EE\u6807\u7EC8\u70B9\u98DE\u884C\uFF0C\u9014\u4E2D\u91CD\u83B7\u89C6\u91CE\u5219\u6062\u590D\u8FFD\u8E2A\uFF0C\u672A\u627E\u5230\u76EE\u6807\u800C\u5230\u8FBE\u7EC8\u70B9\u5219\u8FD4\u822A\u3002\u6BCF\u65F6\u523B\u5148\u9632\u7A7A\uFF0C\u540E\u6295\u5F39</p>
</section>
</div>
<div class="edge-rules">
<h3>\u672C\u539F\u578B\u91C7\u7528\u7684\u8FB9\u754C\u7EA6\u5B9A</h3>
<p>\u9C7C\u96F7\u79BB\u5F00\u53D1\u5C04\u8230\u6240\u5728\u683C\u540E\u542F\u7528\u78B0\u649E\uFF0C\u53EF\u8BEF\u4F24\u53CB\u519B\uFF1B\u4E3B\u70AE\u4E5F\u53EF\u8BEF\u4F24\u3002\u6C34\u96F7 40 \u4F24\u5BB3\uFF0C\u63A5\u89E6\u6392\u96F7\u4F18\u5148\u4E8E\u540C\u523B\u89E6\u96F7\u3002\u5C9B\u5C7F\u963B\u6321\u89C6\u91CE\u3001\u526F\u70AE\u4E0E\u9C7C\u96F7\uFF0C\u98DE\u673A\u53EF\u4EE5\u8D8A\u5C9B</p>
<p>\u540C\u8230\u5BF9\u6BCF\u56DE\u5408\u78B0\u649E\u4F24\u5BB3\u53EA\u7ED3\u7B97\u4E00\u6B21\uFF0C\u7B2C\u4E09\u8258\u540E\u7EED\u649E\u5165\u4ECD\u751F\u6548\u3002\u8230\u8239\u5706\u534A\u5F84\u4E3A\u516D\u89D2\u5185\u5207\u5706\u534A\u5F84\u51CF 0.001\uFF0C\u907F\u514D\u76F8\u90BB\u9759\u6B62\u8230\u63A5\u89E6\u8BEF\u5224\u3002\u6210\u7EC4\u63A5\u89E6\u540C\u523B\u5904\u7406\uFF1B\u56DE\u9000\u4F18\u5148\u961F\u4F0D\u9010\u8F6E\u4EA4\u66FF\uFF0C\u540C\u961F\u6309\u8230\u53F7\u6392\u5E8F\u3002\u4E3B\u70AE\u548C\u526F\u70AE\u540C\u523B\u4F24\u5BB3\u6309\u9F50\u5C04\u5904\u7406</p>
<p>\u98DE\u673A\u5230\u8FBE\u5B9A\u70B9\u3001\u5931\u53BB\u5DF2\u6C89\u6CA1\u76EE\u6807\uFF0C\u6216\u7528\u5C3D\u5355\u7A0B\u822A\u7A0B\u5373\u8FD4\u822A\uFF1B\u6BCD\u8230\u6C89\u6CA1\u65F6\u8FD4\u822A\u673A\u9500\u6BC1\u3002\u683C\u8FB9\u754C\u91C7\u7528\u7A33\u5B9A\u7684\u552F\u4E00\u5F52\u683C\u3002\u7269\u7406\u4F7F\u7528\u56FA\u5B9A 240 \u5B50\u6B65\u4E0E\u8FDE\u7EED\u626B\u63A0\u78B0\u649E\uFF0C\u786E\u4FDD\u76F8\u540C\u79CD\u5B50\u3001\u6307\u4EE4\u5F97\u5230\u76F8\u540C\u7ED3\u679C</p>
<p>AI \u53EA\u4F7F\u7528\u5F53\u8F6E\u5171\u4EAB\u89C6\u91CE\u53EF\u89C1\u4FE1\u606F\uFF0C\u8FDB\u884C\u822A\u8DEF\u3001\u96C6\u706B\u3001\u9C7C\u96F7\u65B9\u5411\u4E0E\u53CB\u519B\u907F\u78B0\u8BC4\u5206\uFF1B\u98DE\u673A\u7279\u6B8A\u8DE8\u89C6\u91CE\u8FFD\u8E2A\u4E0E\u73A9\u5BB6\u4E00\u81F4\u3002\u6240\u6709\u5355\u4F4D\u80FD\u529B\u5747\u6765\u81EA\u914D\u7F6E\uFF0C\u7F16\u961F\u6807\u7B7E\u4E0D\u53C2\u4E0E\u6218\u6597\u5224\u65AD</p>
</div>
<p class="muted">\u8FD9\u662F\u53EF\u73A9\u7684\u673A\u5236\u539F\u578B\uFF0C\u8010\u4E45\u3001\u4F24\u5BB3\u3001\u5730\u56FE\u5BC6\u5EA6\u548C AI \u5F3A\u5EA6\u4ECD\u9700\u5B9E\u6218\u8C03\u5E73</p>
</section>
</div>
</div>` });
app.mount("#app");
