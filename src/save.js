const SAVE_MAGIC = "azurlane-chess";
const SAVE_VERSION = 1;
const SAVE_SLOTS = Object.freeze(["auto", "slot-1", "slot-2", "slot-3"]);
const MAX_SAVE_BYTES = 2e6;
const AIRBORNE = "azurlane:airborne";
const TYPES = ["dd", "cl", "ca", "bb", "cv"];
const UNSAFE_KEYS = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
const TRANSIENT_KEYS = /* @__PURE__ */ new Set(["busy", "playFrame", "progress", "finished", "animationTimer", "toastTimer", "hover", "toast", "screen", "showRules", "showLog", "pendingTurn", "torpWindow", "mode", "planeMode", "history", "playSpeed"]);
class SaveError extends Error {
  constructor(code, message, path = "") {
    super(path ? `${message} (${path})` : message);
    this.name = "SaveError";
    this.code = code;
    this.path = path;
  }
}
const fail = (code, message, path = "") => {
  throw new SaveError(code, message, path);
};
const expect = (condition, path, code = "INVALID_STATE") => {
  if (!condition) fail(code, "\u5B58\u6863\u6570\u636E\u4E0D\u7B26\u5408\u5F53\u524D\u89C4\u5219", path);
};
const integer = (value, min, max, path, code) => expect(Number.isSafeInteger(value) && value >= min && value <= max, path, code);
const finite = (value, min, max, path, code) => expect(typeof value === "number" && Number.isFinite(value) && value >= min && value <= max, path, code);
const text = (value, max, path, code, empty = true) => expect(typeof value === "string" && value.length <= max && (empty || value.length > 0), path, code);
const object = (value, path, code) => expect(value !== null && typeof value === "object" && !Array.isArray(value), path, code);
const boolean = (value, path, code) => expect(typeof value === "boolean", path, code);
const array = (value, max, path, code) => expect(Array.isArray(value) && value.length <= max, path, code);
const own = (value, key) => Object.hasOwn(value, key);
const pathText = (path) => path.join(".");
function isAirSlot(path) {
  const p = path[0] === "state" ? path.slice(1) : path;
  return p.length === 5 && p[0] === "game" && p[1] === "ships" && typeof p[2] === "number" && p[3] === "airReady" && typeof p[4] === "number";
}
function copyPlain(value, code = "INVALID_STATE", allowInfinity = true) {
  let nodes = 0, textSize = 0;
  const active = /* @__PURE__ */ new WeakSet();
  const countText = (value2, path) => {
    textSize += new TextEncoder().encode(value2).byteLength;
    if (textSize > MAX_SAVE_BYTES) fail(code, "\u5B58\u6863\u6570\u636E\u8FC7\u5927", pathText(path));
  };
  function visit(item, path, depth) {
    if (++nodes > 5e4 || depth > 32) fail(code, "\u5B58\u6863\u6570\u636E\u8FC7\u5927\u6216\u5D4C\u5957\u8FC7\u6DF1", pathText(path));
    if (item === null || typeof item === "boolean") return item;
    if (typeof item === "string") {
      if (item.length > 2e4) fail(code, "\u5B58\u6863\u6587\u672C\u8FC7\u957F", pathText(path));
      countText(item, path);
      return item;
    }
    if (typeof item === "number") {
      if (!Number.isFinite(item) && !(allowInfinity && item === Infinity && isAirSlot(path))) fail(code, "\u5B58\u6863\u5305\u542B\u65E0\u6548\u6570\u503C", pathText(path));
      return item;
    }
    if (typeof item !== "object") fail(code, "\u5B58\u6863\u53EA\u80FD\u5305\u542B\u666E\u901A\u6570\u636E", pathText(path));
    const proto = Object.getPrototypeOf(item), isArray = Array.isArray(item);
    if (isArray ? proto !== Array.prototype : proto !== Object.prototype && proto !== null) fail(code, "\u5B58\u6863\u5305\u542B\u4E0D\u53D7\u652F\u6301\u7684\u5BF9\u8C61", pathText(path));
    if (active.has(item)) fail(code, "\u5B58\u6863\u5305\u542B\u5FAA\u73AF\u5F15\u7528", pathText(path));
    active.add(item);
    const keys = Reflect.ownKeys(item);
    if (isArray && item.length > 1e4 || !isArray && keys.length > 200) fail(code, "\u5B58\u6863\u6570\u7EC4\u6216\u5BF9\u8C61\u8FC7\u5927", pathText(path));
    const result = isArray ? [] : {};
    for (const key of keys) {
      if (isArray && key === "length") continue;
      if (typeof key !== "string" || UNSAFE_KEYS.has(key)) fail(code, "\u5B58\u6863\u5305\u542B\u4E0D\u5B89\u5168\u5B57\u6BB5", pathText([...path, String(key)]));
      countText(key, [...path, key]);
      const descriptor = Object.getOwnPropertyDescriptor(item, key);
      if (!descriptor || !own(descriptor, "value") || !descriptor.enumerable) fail(code, "\u5B58\u6863\u5305\u542B\u975E\u666E\u901A\u5B57\u6BB5", pathText([...path, key]));
      if (isArray && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= item.length)) fail(code, "\u5B58\u6863\u6570\u7EC4\u683C\u5F0F\u65E0\u6548", pathText(path));
      Object.defineProperty(result, key, { value: visit(descriptor.value, [...path, isArray ? Number(key) : key], depth + 1), enumerable: true, writable: true, configurable: true });
    }
    if (isArray && keys.length !== item.length + 1) fail(code, "\u5B58\u6863\u6570\u7EC4\u5B58\u5728\u7A7A\u7F3A", pathText(path));
    active.delete(item);
    return result;
  }
  return visit(value, [], 0);
}
function hex(value, path, code) {
  object(value, path, code);
  integer(value.q, -7, 18, `${path}.q`, code);
  integer(value.r, 0, 14, `${path}.r`, code);
  const column = value.q + Math.floor(value.r / 2);
  expect(column >= 0 && column < 19, path, code);
}
function xy(value, path, code) {
  object(value, path, code);
  finite(value.x, -1e3, 1e3, `${path}.x`, code);
  finite(value.y, -1e3, 1e3, `${path}.y`, code);
}
function cellKey(value, path, code) {
  text(value, 16, path, code, false);
  expect(/^-?\d+,\d+$/.test(value), path, code);
  const [q, r] = value.split(",").map(Number);
  hex({ q, r }, path, code);
  expect(value === `${q},${r}`, path, code);
}
function unique(items, path, code, key = (value) => value) {
  expect(new Set(items.map(key)).size === items.length, path, code);
}
function config(value, path, code) {
  object(value, path, code);
  text(value.name, 100, `${path}.name`, code, false);
  expect(["front", "back"].includes(value.role), `${path}.role`, code);
  finite(value.radius, 1e-3, 20, `${path}.radius`, code);
  finite(value.hp, 1, 1e5, `${path}.hp`, code);
  integer(value.speed, 0, 20, `${path}.speed`, code);
  integer(value.vision, 0, 40, `${path}.vision`, code);
  finite(value.collision, 0, 1e5, `${path}.collision`, code);
  if (own(value, "contactSweep")) boolean(value.contactSweep, `${path}.contactSweep`, code);
  if (own(value, "secondary")) {
    const v = value.secondary;
    object(v, `${path}.secondary`, code);
    finite(v.damage, 0, 1e5, `${path}.secondary.damage`, code);
    finite(v.range, 0, 40, `${path}.secondary.range`, code);
    boolean(v.multi, `${path}.secondary.multi`, code);
  }
  if (own(value, "torpedo")) {
    projectileConfig(value.torpedo, `${path}.torpedo`, code);
    integer(value.torpedo.reserve, 0, 100, `${path}.torpedo.reserve`, code);
    integer(value.torpedo.max, 0, 100, `${path}.torpedo.max`, code);
  }
  if (own(value, "aa")) {
    object(value.aa, `${path}.aa`, code);
    finite(value.aa.range, 0, 40, `${path}.aa.range`, code);
    finite(value.aa.damage, 0, 1e5, `${path}.aa.damage`, code);
  }
  if (own(value, "main")) {
    object(value.main, `${path}.main`, code);
    finite(value.main.range, 0, 40, `${path}.main.range`, code);
    integer(value.main.shots, 0, 100, `${path}.main.shots`, code);
    finite(value.main.damage, 0, 1e5, `${path}.main.damage`, code);
    integer(value.main.reload, 0, 100, `${path}.main.reload`, code);
  }
  if (own(value, "carrier")) {
    const v = value.carrier;
    object(v, `${path}.carrier`, code);
    integer(v.stock, 0, 100, `${path}.carrier.stock`, code);
    integer(v.launch, 0, 100, `${path}.carrier.launch`, code);
    integer(v.rearm, 0, 100, `${path}.carrier.rearm`, code);
    if (own(v, "heal")) finite(v.heal, 0, 1e4, `${path}.carrier.heal`, code);
    planeConfig(v.plane, `${path}.carrier.plane`, code);
  }
}
function projectileConfig(value, path, code) {
  object(value, path, code);
  finite(value.speed, 1e-3, 100, `${path}.speed`, code);
  finite(value.damage, 0, 1e5, `${path}.damage`, code);
  finite(value.life, 1e-3, 100, `${path}.life`, code);
}
function planeConfig(value, path, code) {
  object(value, path, code);
  finite(value.hp, 1e-3, 1e5, `${path}.hp`, code);
  finite(value.speed, 1e-3, 100, `${path}.speed`, code);
  finite(value.vision, 0, 40, `${path}.vision`, code);
  finite(value.range, 1e-3, 1e3, `${path}.range`, code);
  finite(value.damage, 0, 1e5, `${path}.damage`, code);
}
function validateState(state, code) {
  object(state, "state", code);
  const game = state.game;
  object(game, "game", code);
  expect(["deploy", "plan", "ended"].includes(game.phase), "game.phase", code);
  integer(game.seed, -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, "game.seed", code);
  integer(game.round, 1, 30, "game.round", code);
  integer(game.nextId, 0, 1e6, "game.nextId", code);
  expect([null, 0, 1, "draw"].includes(game.winner), "game.winner", code);
  expect(game.phase === "ended" ? game.winner !== null : game.winner === null, "game.winner", code);
  object(game.map, "game.map", code);
  expect(game.map.width === 19 && game.map.height === 15, "game.map dimensions", code);
  array(game.map.islands, 285, "game.map.islands", code);
  game.map.islands.forEach((v, i) => cellKey(v, `game.map.islands.${i}`, code));
  unique(game.map.islands, "game.map.islands", code);
  array(game.map.mines, 285, "game.map.mines", code);
  game.map.mines.forEach((v, i) => hex(v, `game.map.mines.${i}`, code));
  unique(game.map.mines, "game.map.mines", code, (h) => `${h.q},${h.r}`);
  expect(game.map.mines.every((h) => !game.map.islands.includes(`${h.q},${h.r}`)), "game.map.mines", code);
  array(game.explored, 2, "game.explored", code);
  expect(game.explored.length === 2, "game.explored", code);
  game.explored.forEach((cells, team) => {
    array(cells, 285, `game.explored.${team}`, code);
    cells.forEach((v, i) => cellKey(v, `game.explored.${team}.${i}`, code));
    unique(cells, `game.explored.${team}`, code);
  });
  array(game.ships, 10, "game.ships", code);
  expect(game.ships.length === 10, "game.ships", code);
  unique(game.ships, "game.ships ids", code, (s) => s?.id);
  game.ships.forEach((ship, i) => {
    const p = `game.ships.${i}`;
    object(ship, p, code);
    text(ship.id, 80, `${p}.id`, code, false);
    expect(ship.kind === "ship", `${p}.kind`, code);
    integer(ship.team, 0, 1, `${p}.team`, code);
    text(ship.label, 100, `${p}.label`, code, false);
    expect(TYPES.includes(ship.template), `${p}.template`, code);
    config(ship.cfg, `${p}.cfg`, code);
    finite(ship.hp, 0, ship.cfg.hp, `${p}.hp`, code);
    hex(ship.pos, `${p}.pos`, code);
    xy(ship.xy, `${p}.xy`, code);
    integer(ship.heading, 0, 5, `${p}.heading`, code);
    integer(ship.torps, 0, ship.cfg.torpedo?.reserve || 0, `${p}.torps`, code);
    integer(ship.mainReady, 0, 1e3, `${p}.mainReady`, code);
    integer(ship.destroyedPlanes, 0, ship.cfg.carrier?.stock || 0, `${p}.destroyedPlanes`, code);
    array(ship.airReady, 100, `${p}.airReady`, code);
    expect(ship.airReady.length === (ship.cfg.carrier?.stock || 0), `${p}.airReady`, code);
    if (own(ship, "airHP")) {
      array(ship.airHP, 100, `${p}.airHP`, code);
      expect(ship.airHP.length === ship.airReady.length, `${p}.airHP`, code);
      ship.airHP.forEach((hp, j) => finite(hp, 0, ship.cfg.carrier?.plane.hp || 0, `${p}.airHP.${j}`, code));
    }
    ship.airReady.forEach((n, j) => {
      if (n !== Infinity) integer(n, 0, 1e3, `${p}.airReady.${j}`, code);
    });
  });
  expect([0, 1].every((team) => game.ships.filter((s) => s.team === team).length === 5), "game.ships teams", code);
  const ships = new Map(game.ships.map((s) => [s.id, s]));
  array(game.torpedoes, 300, "game.torpedoes", code);
  unique(game.torpedoes, "game.torpedoes ids", code, (p) => p?.id);
  game.torpedoes.forEach((torpedo, i) => {
    const p = `game.torpedoes.${i}`;
    object(torpedo, p, code);
    text(torpedo.id, 80, `${p}.id`, code, false);
    expect(torpedo.kind === "torpedo", `${p}.kind`, code);
    integer(torpedo.team, 0, 1, `${p}.team`, code);
    expect(ships.has(torpedo.owner) && ships.get(torpedo.owner).team === torpedo.team, `${p}.owner`, code);
    xy(torpedo.xy, `${p}.xy`, code);
    integer(torpedo.heading, 0, 5, `${p}.heading`, code);
    projectileConfig(torpedo.cfg, `${p}.cfg`, code);
    finite(torpedo.age, 0, torpedo.cfg.life, `${p}.age`, code);
    integer(torpedo.launched, 1, game.round, `${p}.launched`, code);
    finite(torpedo.birth, 0, 1, `${p}.birth`, code);
    boolean(torpedo.armed, `${p}.armed`, code);
  });
  array(game.planes, 100, "game.planes", code);
  unique(game.planes, "game.planes ids", code, (p) => p?.id);
  const occupiedSlots = /* @__PURE__ */ new Set();
  game.planes.forEach((plane, i) => {
    const p = `game.planes.${i}`;
    object(plane, p, code);
    text(plane.id, 80, `${p}.id`, code, false);
    expect(plane.kind === "plane", `${p}.kind`, code);
    integer(plane.team, 0, 1, `${p}.team`, code);
    const mother = ships.get(plane.mother);
    expect(!!mother && mother.team === plane.team && !!mother.cfg.carrier, `${p}.mother`, code);
    integer(plane.slot, 0, mother.airReady.length - 1, `${p}.slot`, code);
    expect(mother.airReady[plane.slot] === Infinity, `${p}.slot readiness`, code);
    const slot = `${plane.mother}:${plane.slot}`;
    expect(!occupiedSlots.has(slot), `${p}.slot duplicate`, code);
    occupiedSlots.add(slot);
    planeConfig(plane.cfg, `${p}.cfg`, code);
    finite(plane.hp, 1e-3, plane.cfg.hp, `${p}.hp`, code);
    xy(plane.xy, `${p}.xy`, code);
    hex(plane.target, `${p}.target`, code);
    expect(["point", "target"].includes(plane.mode), `${p}.mode`, code);
    expect(plane.targetId === null || ships.has(plane.targetId) && ships.get(plane.targetId).team !== plane.team, `${p}.targetId`, code);
    expect(plane.mode !== "target" || plane.targetId !== null, `${p}.targetId`, code);
    boolean(plane.tracking, `${p}.tracking`, code);
    expect(["outbound", "return"].includes(plane.state), `${p}.state`, code);
    finite(plane.traveled, 0, plane.cfg.range + 1e-6, `${p}.traveled`, code);
    array(plane.waypoints, 100, `${p}.waypoints`, code);
  });
  unique([...game.ships, ...game.torpedoes, ...game.planes], "game unit ids", code, (unit) => unit.id);
  array(game.log, 300, "game.log", code);
  game.log.forEach((event, i) => {
    const p = `game.log.${i}`;
    object(event, p, code);
    integer(event.round, 1, game.round, `${p}.round`, code);
    finite(event.t, 0, 1.1, `${p}.t`, code);
    text(event.text, 1e3, `${p}.text`, code);
    if (event.at !== null) hex(event.at, `${p}.at`, code);
    expect([null, 0, 1].includes(event.team), `${p}.team`, code);
  });
  array(state.roster, 5, "roster", code);
  expect(state.roster.length === 5 && state.roster.every((t, i) => TYPES.includes(t) && (i < 3 ? ["dd", "cl", "ca"].includes(t) : ["bb", "cv"].includes(t))), "roster", code);
  integer(state.seed, -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, "seed", code);
  expect(state.seed === game.seed, "seed", code);
  text(state.selected, 80, "selected", code);
  expect(state.selected === "" || ships.has(state.selected) && ships.get(state.selected).team === 0, "selected", code);
  object(state.plans, "plans", code);
  expect(Object.keys(state.plans).length <= 10, "plans", code);
  for (const [id, plan] of Object.entries(state.plans)) {
    const p = `plans.${id}`, ship = ships.get(id);
    expect(!!ship, p, code);
    object(plan, p, code);
    array(plan.moves, ship.cfg.speed, `${p}.moves`, code);
    plan.moves.forEach((move, i) => {
      object(move, `${p}.moves.${i}`, code);
      integer(move.turn, -1, 1, `${p}.moves.${i}.turn`, code);
      boolean(move.forward, `${p}.moves.${i}.forward`, code);
    });
    array(plan.torps, ship.cfg.torpedo ? Math.min(ship.cfg.torpedo.max, ship.torps) : 0, `${p}.torps`, code);
    unique(plan.torps, `${p}.torps windows`, code, (t) => t?.window);
    plan.torps.forEach((torp, i) => {
      object(torp, `${p}.torps.${i}`, code);
      integer(torp.window, 0, plan.moves.length, `${p}.torps.${i}.window`, code);
      integer(torp.dir, 0, 5, `${p}.torps.${i}.dir`, code);
    });
    array(plan.main, ship.cfg.main?.shots || 0, `${p}.main`, code);
    plan.main.forEach((target, i) => hex(target, `${p}.main.${i}`, code));
    array(plan.planes, ship.cfg.carrier?.launch || 0, `${p}.planes`, code);
    plan.planes.forEach((plane, i) => {
      object(plane, `${p}.planes.${i}`, code);
      expect(["point", "target"].includes(plane.mode), `${p}.planes.${i}.mode`, code);
      if (plane.mode === "point") hex(plane.target, `${p}.planes.${i}.target`, code);
      else expect(ships.has(plane.targetId) && ships.get(plane.targetId).team !== ship.team, `${p}.planes.${i}.targetId`, code);
    });
    if (plan.sweep !== null) {
      expect(!!ship.cfg.secondary, `${p}.sweep`, code);
      hex(plan.sweep, `${p}.sweep`, code);
    }
    if (own(plan, "segments")) {
      array(plan.segments, ship.cfg.speed, `${p}.segments`, code);
      plan.segments.forEach((segment, i) => {
        const sp = `${p}.segments.${i}`;
        object(segment, sp, code);
        integer(segment.start, 0, plan.moves.length, `${sp}.start`, code);
        integer(segment.end, segment.start, plan.moves.length, `${sp}.end`, code);
        hex(segment.target, `${sp}.target`, code);
      });
    }
  }
  return state;
}
function validateEnvelope(save, code = "INVALID_SAVE") {
  object(save, "save", code);
  expect(save.magic === SAVE_MAGIC, "magic", code);
  if (save.schemaVersion !== SAVE_VERSION) fail("UNSUPPORTED_VERSION", "\u8FD9\u4E2A\u5B58\u6863\u7248\u672C\u6682\u4E0D\u652F\u6301\uFF0C\u8BF7\u4F7F\u7528\u5BF9\u5E94\u7248\u672C\u7684\u6E38\u620F");
  text(save.label, 80, "label", code);
  text(save.timestamp, 30, "timestamp", code, false);
  expect(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(save.timestamp) && Number.isFinite(Date.parse(save.timestamp)) && new Date(save.timestamp).toISOString() === save.timestamp, "timestamp", code);
  validateState(save.state, code);
  return save;
}
function sizeCheck(json) {
  if (json.length > MAX_SAVE_BYTES || new TextEncoder().encode(json).byteLength > MAX_SAVE_BYTES) fail("SAVE_TOO_LARGE", "\u5B58\u6863\u6587\u4EF6\u8FC7\u5927\uFF08\u6700\u5927 2 MB\uFF09");
}
function createSave(input, { label = "\u672A\u547D\u540D\u5B58\u6863", timestamp = (/* @__PURE__ */ new Date()).toISOString() } = {}) {
  const state = copyPlain(input, "INVALID_STATE");
  for (const key of TRANSIENT_KEYS) delete state[key];
  validateState(state, "INVALID_STATE");
  const envelope = copyPlain({ magic: SAVE_MAGIC, schemaVersion: SAVE_VERSION, timestamp, label, state }, "INVALID_STATE");
  return validateEnvelope(envelope, "INVALID_STATE");
}
function validateSave(save) {
  return validateEnvelope(copyPlain(save, "INVALID_SAVE"));
}
function migrateSave(save) {
  return validateSave(save);
}
function serializeSave(save) {
  const copy = validateSave(save);
  for (const ship of copy.state.game.ships) ship.airReady = ship.airReady.map((n) => n === Infinity ? AIRBORNE : n);
  const json = JSON.stringify(copy, null, 2);
  sizeCheck(json);
  return json;
}
function deserializeSave(json) {
  if (typeof json !== "string") fail("INVALID_JSON", "\u8BF7\u9009\u62E9 JSON \u5B58\u6863\u6587\u4EF6");
  sizeCheck(json);
  let value;
  try {
    value = JSON.parse(json);
  } catch {
    fail("INVALID_JSON", "\u5B58\u6863\u6587\u4EF6\u4E0D\u662F\u6709\u6548\u7684 JSON");
  }
  const copy = copyPlain(value, "INVALID_SAVE", false);
  if (copy?.state?.game?.ships && Array.isArray(copy.state.game.ships)) {
    for (const ship of copy.state.game.ships) if (Array.isArray(ship?.airReady)) ship.airReady = ship.airReady.map((n) => n === AIRBORNE ? Infinity : n);
  }
  return migrateSave(copy);
}
function exportFilename(save) {
  const valid = validateSave(save), name = valid.label.normalize("NFKC").replace(/[\\/:*?"<>|\x00-\x1f]/g, "-").replace(/\s+/g, "-").replace(/^[. -]+|[. -]+$/g, "").slice(0, 40) || "save";
  return `azurlane-chess-${valid.timestamp.slice(0, 10)}-R${String(valid.state.game.round).padStart(2, "0")}-${name}.json`;
}
function resultError(error) {
  if (error instanceof SaveError) return { ok: false, error: { code: error.code, message: error.message } };
  if (error?.name === "QuotaExceededError" || error?.name === "NS_ERROR_DOM_QUOTA_REACHED" || error?.code === 22 || error?.code === 1014) return { ok: false, error: { code: "STORAGE_QUOTA", message: "\u6D4F\u89C8\u5668\u5B58\u50A8\u7A7A\u95F4\u4E0D\u8DB3\uFF0C\u8BF7\u5BFC\u51FA\u5907\u4EFD\u6216\u5220\u9664\u4E0D\u9700\u8981\u7684\u5B58\u6863" } };
  return { ok: false, error: { code: "STORAGE_UNAVAILABLE", message: "\u6D4F\u89C8\u5668\u65E0\u6CD5\u4FDD\u5B58\u5230\u672C\u5730\uFF1B\u8BF7\u5141\u8BB8\u7AD9\u70B9\u5B58\u50A8\uFF0C\u6216\u5BFC\u51FA JSON \u5907\u4EFD" } };
}
function createSaveStorage({ storage, prefix = "azurlane-chess:v1", now = () => (/* @__PURE__ */ new Date()).toISOString() } = {}) {
  function getStorage() {
    const target = storage === void 0 ? globalThis.localStorage : storage;
    if (!target || typeof target.getItem !== "function" || typeof target.setItem !== "function" || typeof target.removeItem !== "function") fail("STORAGE_UNAVAILABLE", "\u6D4F\u89C8\u5668\u65E0\u6CD5\u8BBF\u95EE\u672C\u5730\u5B58\u50A8\uFF0C\u8BF7\u5BFC\u51FA JSON \u5907\u4EFD");
    return target;
  }
  function key(id) {
    if (!SAVE_SLOTS.includes(id)) fail("INVALID_SLOT", "\u8BF7\u9009\u62E9\u6709\u6548\u7684\u5B58\u6863\u69FD");
    return `${prefix}:${id}`;
  }
  function attempt(callback) {
    try {
      return callback();
    } catch (error) {
      return resultError(error);
    }
  }
  const adapter = {
    read(id) {
      return attempt(() => {
        const name = key(id), json = getStorage().getItem(name);
        if (json === null) fail("SAVE_NOT_FOUND", "\u8FD9\u4E2A\u5B58\u6863\u69FD\u8FD8\u6CA1\u6709\u5B58\u6863");
        return { ok: true, save: deserializeSave(json) };
      });
    },
    write(id, state, options = {}) {
      return attempt(() => {
        const name = key(id), save = createSave(state, { ...options, timestamp: options.timestamp ?? now() }), json = serializeSave(save);
        getStorage().setItem(name, json);
        return { ok: true, save };
      });
    },
    import(id, json) {
      return attempt(() => {
        const name = key(id), save = deserializeSave(json), validated = serializeSave(save);
        getStorage().setItem(name, validated);
        return { ok: true, save };
      });
    },
    remove(id) {
      return attempt(() => {
        const name = key(id);
        getStorage().removeItem(name);
        return { ok: true };
      });
    },
    list() {
      return SAVE_SLOTS.map((id) => {
        const result = adapter.read(id);
        return { id, save: result.ok ? result.save : null, error: result.ok || result.error.code === "SAVE_NOT_FOUND" ? null : result.error };
      });
    }
  };
  return adapter;
}
export {
  MAX_SAVE_BYTES,
  SAVE_MAGIC,
  SAVE_SLOTS,
  SAVE_VERSION,
  SaveError,
  createSave,
  createSaveStorage,
  deserializeSave,
  exportFilename,
  migrateSave,
  serializeSave,
  validateSave
};
