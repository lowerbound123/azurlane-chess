import type {Hex,XY,ShipConfig,TorpedoConfig,PlaneConfig} from "../shared/game.ts";
import type {SaveState,SaveEnvelope,SaveOptions,SaveFailure,SaveResult,StorageLike} from "../shared/save.ts";
import {planeForSlot} from './ship-definitions.ts';
import {CAPTURE_CENTERS} from '../shared/domination.ts';
import {validPlan} from './engine.ts';
const SAVE_MAGIC = "azurlane-chess";
const SAVE_VERSION = 1;
const SAVE_SLOTS = Object.freeze(["auto", "slot-1", "slot-2", "slot-3"]);
const MAX_SAVE_BYTES = 2e6;
const AIRBORNE = "azurlane:airborne";
const TYPES = ["dd", "cl", "ca", "bb", "cv"];
const UNSAFE_KEYS = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
const TRANSIENT_KEYS = /* @__PURE__ */ new Set(["busy", "playFrame", "progress", "finished", "animationTimer", "toastTimer", "hover", "toast", "screen", "showRules", "showLog", "pendingTurn", "torpWindow", "mode", "planeMode", "history", "playSpeed"]);
class SaveError extends Error {
  readonly code:string;readonly path:string;
  constructor(code:string, message:string, path = "") {
    super(path ? `${message} (${path})` : message);
    this.name = "SaveError";
    this.code = code;
    this.path = path;
  }
}
function fail(code: string, message: string, path: string = ""):never {
  throw new SaveError(code, message, path);
};
function expect(condition: unknown, path: string, code: string = "INVALID_STATE"):asserts condition {
  if (!condition) fail(code, "\u5B58\u6863\u6570\u636E\u4E0D\u7B26\u5408\u5F53\u524D\u89C4\u5219", path);
};
const integer = (value: unknown, min: number, max: number, path: string, code: string|undefined) => expect(typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max, path, code);
const finite = (value: unknown, min: number, max: number, path: string, code: string|undefined) => expect(typeof value === "number" && Number.isFinite(value) && value >= min && value <= max, path, code);
const text = (value: unknown, max: number, path: string, code: string|undefined, empty: boolean = true) => expect(typeof value === "string" && value.length <= max && (empty || value.length > 0), path, code);
const object = (value: unknown, path: string, code: string|undefined) => expect(value !== null && typeof value === "object" && !Array.isArray(value), path, code);
const boolean = (value: unknown, path: string, code: string|undefined) => expect(typeof value === "boolean", path, code);
const array = (value: unknown, max: number, path: string, code: string|undefined) => expect(Array.isArray(value) && value.length <= max, path, code);
const own = (value: object, key: PropertyKey) => Object.hasOwn(value, key);
const pathText = (path: (string|number)[]) => path.join(".");
function isAirSlot(path: (string|number)[]) {
  const p = path[0] === "state" ? path.slice(1) : path;
  return p.length === 5 && p[0] === "game" && p[1] === "ships" && typeof p[2] === "number" && p[3] === "airReady" && typeof p[4] === "number";
}
function copyPlain(value: unknown, code: string = "INVALID_STATE", allowInfinity: boolean = true) {
  let nodes = 0, textSize = 0;
  const active = /* @__PURE__ */ new WeakSet();
  const countText = (value2: string, path: (string|number)[]) => {
    textSize += new TextEncoder().encode(value2).byteLength;
    if (textSize > MAX_SAVE_BYTES) fail(code, "\u5B58\u6863\u6570\u636E\u8FC7\u5927", pathText(path));
  };
  function visit(item: unknown, path: (string|number)[], depth: number):unknown {
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
function mapHex(value: Hex, path: string, code: string, map:{width:number;height:number}) {
  object(value, path, code);
  integer(value.q, -Math.floor((map.height-1)/2), map.width-1, `${path}.q`, code);
  integer(value.r, 0, map.height-1, `${path}.r`, code);
  const column = value.q + Math.floor(value.r / 2);
  expect(column >= 0 && column < map.width, path, code);
}
function xy(value: XY, path: string, code: string) {
  object(value, path, code);
  finite(value.x, -1e3, 1e3, `${path}.x`, code);
  finite(value.y, -1e3, 1e3, `${path}.y`, code);
}
function mapCellKey(value: string, path: string, code: string, map:{width:number;height:number}) {
  text(value, 16, path, code, false);
  expect(/^-?\d+,\d+$/.test(value), path, code);
  const [q, r] = value.split(",").map(Number);
  mapHex({ q, r }, path, code, map);
  expect(value === `${q},${r}`, path, code);
}
function unique<T>(items:T[], path:string, code:string, key:(value:T)=>unknown = value => value) {
  expect(new Set(items.map(key)).size === items.length, path, code);
}
function config(value: ShipConfig, path: string, code: string) {
  object(value, path, code);
  text(value.name, 100, `${path}.name`, code, false);
  expect(["front", "back"].includes(value.role), `${path}.role`, code);
  finite(value.radius, 1e-3, 20, `${path}.radius`, code);
  finite(value.hp, 1, 1e5, `${path}.hp`, code);
  integer(value.speed, 0, 20, `${path}.speed`, code);
  integer(value.vision, 0, 40, `${path}.vision`, code);
  finite(value.collision, 0, 1e5, `${path}.collision`, code);
  if(value.minelayer){integer(value.minelayer.reserve,0,100,`${path}.minelayer.reserve`,code);integer(value.minelayer.max,0,20,`${path}.minelayer.max`,code);finite(value.minelayer.damage,0,1e5,`${path}.minelayer.damage`,code);}
  for(const kind of ['smoke','radar'] as const)if(value[kind]){const z=value[kind]!;integer(z.charges,0,100,`${path}.${kind}.charges`,code);integer(z.radius,0,40,`${path}.${kind}.radius`,code);integer(z.duration,1,100,`${path}.${kind}.duration`,code);}
  if(value.radar)finite(value.radar.range,0,40,`${path}.radar.range`,code);
  if(value.escort){finite(value.escort.range,0,40,`${path}.escort.range`,code);finite(value.escort.reduction,0,1,`${path}.escort.reduction`,code);integer(value.escort.steps,0,value.speed,`${path}.escort.steps`,code);}
  if(value.guard?.gunReduction!==undefined)finite(value.guard.gunReduction,0,1,`${path}.guard.gunReduction`,code);
  if(value.main?.blast!==undefined)integer(value.main.blast,0,40,`${path}.main.blast`,code);
  if(value.main?.centerMultiplier!==undefined)finite(value.main.centerMultiplier,0,100,`${path}.main.centerMultiplier`,code);
  if(value.secondary?.targets!==undefined)integer(value.secondary.targets,1,100,`${path}.secondary.targets`,code);
  if(value.secondary?.advanceSalvo!==undefined)boolean(value.secondary.advanceSalvo,`${path}.secondary.advanceSalvo`,code);
  if(value.torpedo?.perWindow!==undefined)integer(value.torpedo.perWindow,1,4,`${path}.torpedo.perWindow`,code);
  if(value.aa?.inner){finite(value.aa.inner.range,0,40,`${path}.aa.inner.range`,code);finite(value.aa.inner.damage,0,1e5,`${path}.aa.inner.damage`,code);}
  if (own(value, "contactSweep")) boolean(value.contactSweep, `${path}.contactSweep`, code);
  if(own(value,"guard")){object(value.guard!,`${path}.guard`,code);finite(value.guard!.range,0,40,`${path}.guard.range`,code);finite(value.guard!.torpedoReduction,0,1,`${path}.guard.torpedoReduction`,code);}
  if (own(value, "secondary")) {
    const v = value.secondary!;
    object(v, `${path}.secondary`, code);
    finite(v.damage, 0, 1e5, `${path}.secondary.damage`, code);
    finite(v.range, 0, 40, `${path}.secondary.range`, code);
    boolean(v.multi, `${path}.secondary.multi`, code);
  }
  if (own(value, "torpedo")) {
    projectileConfig(value.torpedo!, `${path}.torpedo`, code);
    integer(value.torpedo!.reserve, 0, 100, `${path}.torpedo.reserve`, code);
    integer(value.torpedo!.max, 0, 100, `${path}.torpedo.max`, code);
  }
  if (own(value, "aa")) {
    object(value.aa, `${path}.aa`, code);
    finite(value.aa!.range, 0, 40, `${path}.aa.range`, code);
    finite(value.aa!.damage, 0, 1e5, `${path}.aa.damage`, code);
  }
  if (own(value, "main")) {
    object(value.main, `${path}.main`, code);
    finite(value.main!.range, 0, 40, `${path}.main.range`, code);
    integer(value.main!.shots, 0, 100, `${path}.main.shots`, code);
    finite(value.main!.damage, 0, 1e5, `${path}.main.damage`, code);
    integer(value.main!.reload, 0, 100, `${path}.main.reload`, code);
  }
  if (own(value, "carrier")) {
    const v = value.carrier!;
    object(v, `${path}.carrier`, code);
    integer(v.stock, 0, 100, `${path}.carrier.stock`, code);
    integer(v.launch, 0, 100, `${path}.carrier.launch`, code);
    integer(v.rearm, 0, 100, `${path}.carrier.rearm`, code);
    if (own(v, "heal")) finite(v.heal, 0, 1e4, `${path}.carrier.heal`, code);
    planeConfig(v.plane, `${path}.carrier.plane`, code);
    if(v.slots){array(v.slots,100,`${path}.carrier.slots`,code);expect(v.slots.length===v.stock,`${path}.carrier.slots`,code);v.slots.forEach((p,i)=>planeConfig(p,`${path}.carrier.slots.${i}`,code));}
  }
}
function projectileConfig(value: TorpedoConfig, path: string, code: string) {
  object(value, path, code);
  finite(value.speed, 1e-3, 100, `${path}.speed`, code);
  finite(value.damage, 0, 1e5, `${path}.damage`, code);
  finite(value.life, 1e-3, 100, `${path}.life`, code);
}
function planeConfig(value: PlaneConfig, path: string, code: string) {
  object(value, path, code);
  if(value.role!==undefined)expect(['heavy','bomber','fighter','scout'].includes(value.role),`${path}.role`,code);
  if(value.rearm!==undefined)integer(value.rearm,0,100,`${path}.rearm`,code);
  if(value.attack){finite(value.attack.range,0,40,`${path}.attack.range`,code);finite(value.attack.damage,0,1e5,`${path}.attack.damage`,code);}
  finite(value.hp, 1e-3, 1e5, `${path}.hp`, code);
  finite(value.speed, 1e-3, 100, `${path}.speed`, code);
  finite(value.vision, 0, 40, `${path}.vision`, code);
  finite(value.range, 1e-3, 1e3, `${path}.range`, code);
  finite(value.damage, 0, 1e5, `${path}.damage`, code);
}
function validateDomination(game:SaveState['game'],code:string){
  if(game.battleMode!=='domination'){expect(game.domination===undefined,'game.domination',code);return;}
  const d=game.domination;object(d,'game.domination',code);expect(d,'game.domination',code);
  integer(d.lastRound,0,30,'game.domination.lastRound',code);
  expect(d.lastRound===(game.phase==='deploy'?0:game.phase==='ended'?game.round:game.round-1),'game.domination.lastRound/phase',code);
  array(d.scores,2,'game.domination.scores',code);expect(d.scores.length===2,'game.domination.scores',code);
  d.scores.forEach((n,i)=>{integer(n,0,525,`game.domination.scores.${i}`,code);expect(n%5===0,`game.domination.scores.${i}`,code);});
  array(d.points,3,'game.domination.points',code);expect(d.points.length===3,'game.domination.points',code);
  d.points.forEach((p,i)=>{const path=`game.domination.points.${i}`,expected=CAPTURE_CENTERS[i];object(p,path,code);
    expect(p.id===expected.id&&p.radius===2,path,code);object(p.center,`${path}.center`,code);expect(p.center.q===expected.center.q&&p.center.r===expected.center.r,`${path}.center`,code);
    expect([null,0,1].includes(p.owner)&&[null,0,1].includes(p.progressTeam),path,code);
    expect([0,50].includes(p.progress)&&(p.progress===0)===(p.progressTeam===null),`${path}.progress`,code);boolean(p.contested,`${path}.contested`,code);
    if(p.owner===null)expect(p.capturedRound===null,`${path}.capturedRound`,code);
    else {integer(p.capturedRound,1,d.lastRound,`${path}.capturedRound`,code);expect(p.progress===0,`${path}.progress`,code);}
    if(!d.lastRound)expect(p.owner===null&&p.progress===0&&!p.contested,path,code);
  });
  object(d.lastGain,'game.domination.lastGain',code);expect(d.lastGain.round===d.lastRound,'game.domination.lastGain.round',code);
  for(const kind of ['points','ships'] as const){const a=d.lastGain[kind],unit=kind==='points'?5:15;array(a,2,`game.domination.lastGain.${kind}`,code);expect(a.length===2,`game.domination.lastGain.${kind}`,code);a.forEach(n=>{integer(n,0,kind==='points'?15:75,`game.domination.lastGain.${kind}`,code);expect(n%unit===0,`game.domination.lastGain.${kind}`,code);});}
  d.scores.forEach((n,i)=>expect(n>=d.lastGain.points[i]+d.lastGain.ships[i]&& (d.lastRound>0||n===0),`game.domination.scores.${i}`,code));
}
function validateState(state: SaveState, code: string) {
  object(state, "state", code);
  const game = state.game;
  object(game, "game", code);
  if(game.ruleset!==undefined)expect(game.ruleset==='fleet-v1','game.ruleset',code);
  expect(game.battleMode===undefined||['annihilation','domination'].includes(game.battleMode),'game.battleMode',code);
  const domination=game.battleMode==='domination';
  object(game.map, 'game.map', code);
  expect(domination?game.ruleset==='fleet-v1'&&game.map.width===21&&game.map.height===17:game.map.width===19&&game.map.height===15,'game.map dimensions',code);
  const hex=(value:Hex,path:string,c:string)=>mapHex(value,path,c,game.map);
  const cellKey=(value:string,path:string,c:string)=>mapCellKey(value,path,c,game.map);
  const cellCount=game.map.width*game.map.height;

  if(game.zones){array(game.zones,100,'game.zones',code);game.zones.forEach((z,i)=>{const p=`game.zones.${i}`;object(z,p,code);expect(['smoke','radar'].includes(z.kind),p,code);integer(z.team,0,1,p,code);hex(z.center,p,code);integer(z.radius,0,40,p,code);integer(z.expires,game.round+1,100,p,code);});}
  expect(["deploy", "plan", "ended"].includes(game.phase), "game.phase", code);
  integer(game.seed, -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, "game.seed", code);
  integer(game.round, 1, 30, "game.round", code);
  integer(game.nextId, 0, 1e6, "game.nextId", code);
  expect([null, 0, 1, "draw"].includes(game.winner), "game.winner", code);
  expect(game.phase === "ended" ? game.winner !== null : game.winner === null, "game.winner", code);
  object(game.map, "game.map", code);
  validateDomination(game,code);
  array(game.map.islands, cellCount, "game.map.islands", code);
  game.map.islands.forEach((v, i) => cellKey(v, `game.map.islands.${i}`, code));
  unique(game.map.islands, "game.map.islands", code);
  array(game.map.mines, cellCount, "game.map.mines", code);
  game.map.mines.forEach((v, i) => hex(v, `game.map.mines.${i}`, code));
  unique(game.map.mines, "game.map.mines", code, (h) => `${h.q},${h.r}`);
  expect(game.map.mines.every((h) => !game.map.islands.includes(`${h.q},${h.r}`)), "game.map.mines", code);
  array(game.explored, 2, "game.explored", code);
  expect(game.explored.length === 2, "game.explored", code);
  game.explored.forEach((cells, team) => {
    array(cells, cellCount, `game.explored.${team}`, code);
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
    for(const [field,max]of [['minesLeft',ship.cfg.minelayer?.reserve],['smokeLeft',ship.cfg.smoke?.charges],['radarLeft',ship.cfg.radar?.charges]] as const)if(max!==undefined||ship[field]!==undefined)integer(ship[field],0,max??0,`${p}.${field}`,code);
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
      ship.airHP.forEach((hp, j) => finite(hp, 0, ship.cfg.carrier ? planeForSlot(ship.cfg,j).hp : 0, `${p}.airHP.${j}`, code));
    }
    ship.airReady.forEach((n, j) => {
      if (n !== Infinity) integer(n, 0, 1e3, `${p}.airReady.${j}`, code);
    });
  });
  expect([0, 1].every((team) => game.ships.filter((s) => s.team === team).length === 5), "game.ships teams", code);
  const ships = new Map(game.ships.map((s) => [s.id, s]));
  for(const m of game.map.mines)if(m.armedRound!==undefined){integer(m.armedRound,1,31,'mine.armedRound',code);expect(!!m.sourceId&&ships.has(m.sourceId),'mine.sourceId',code);expect(m.team===ships.get(m.sourceId!)!.team,'mine.team',code);finite(m.damage,0,1e5,'mine.damage',code);}
  array(game.torpedoes, 300, "game.torpedoes", code);
  unique(game.torpedoes, "game.torpedoes ids", code, (p) => p?.id);
  game.torpedoes.forEach((torpedo, i) => {
    const p = `game.torpedoes.${i}`;
    object(torpedo, p, code);
    text(torpedo.id, 80, `${p}.id`, code, false);
    expect(torpedo.kind === "torpedo", `${p}.kind`, code);
    integer(torpedo.team, 0, 1, `${p}.team`, code);
    expect(ships.has(torpedo.owner) && ships.get(torpedo.owner)!.team === torpedo.team, `${p}.owner`, code);
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
    if(game.ruleset){expect(JSON.stringify(plane.cfg)===JSON.stringify(planeForSlot(mother.cfg,plane.slot)),`${p}.cfg slot`,code);if(plane.mode==='patrol')finite(plane.patrolRemaining,0,1,`${p}.patrolRemaining`,code);if(plane.attackRound!==undefined)integer(plane.attackRound,1,game.round,`${p}.attackRound`,code);}
    finite(plane.hp, 1e-3, plane.cfg.hp, `${p}.hp`, code);
    xy(plane.xy, `${p}.xy`, code);
    hex(plane.target, `${p}.target`, code);
    expect(["point", "target", "patrol"].includes(plane.mode), `${p}.mode`, code);
    expect(plane.targetId === null || ships.has(plane.targetId) && ships.get(plane.targetId)!.team !== plane.team, `${p}.targetId`, code);
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
  expect(state.selected === "" || ships.has(state.selected) && ships.get(state.selected)!.team === 0, "selected", code);
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
    unique(plan.torps, `${p}.torps windows`, code, (t) => ship.cfg.torpedo?.perWindow ? `${t?.window}:${t?.dir}` : t?.window);
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
      expect(["point", "target", "patrol"].includes(plane.mode), `${p}.planes.${i}.mode`, code);
      if (plane.mode !== "target") hex(plane.target, `${p}.planes.${i}.target`, code);
      else expect(ships.has(plane.targetId) && ships.get(plane.targetId)!.team !== ship.team, `${p}.planes.${i}.targetId`, code);
    });
    if(game.ruleset){
      const normalized=validPlan({...game,map:{...game.map,islands:game.map.islands.filter(k=>game.explored[ship.team].includes(k))}},ship,plan);
      for(const k of ['mineSteps','smoke','radar','escort'] as const){if((plan[k]===false||Array.isArray(plan[k])&&!plan[k]!.length)&&normalized[k]===undefined)continue;expect(JSON.stringify(plan[k])===JSON.stringify(normalized[k]),`${p}.${k}`,code);}
      expect(JSON.stringify(plan.planes)===JSON.stringify(normalized.planes),`${p}.planes slots`,code);
    }
    if(own(plan,"guard")){boolean(plan.guard!,`${p}.guard`,code);expect(!plan.guard||!!ship.cfg.guard&&plan.moves.length===0,`${p}.guard`,code);}
    if (plan.sweep !== null) {
      expect(!!ship.cfg.secondary, `${p}.sweep`, code);
      hex(plan.sweep, `${p}.sweep`, code);
    }
    if (own(plan, "segments")) {
      array(plan.segments, ship.cfg.speed, `${p}.segments`, code);
      plan.segments!.forEach((segment, i) => {
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
function validateEnvelope(save: SaveEnvelope, code: string = "INVALID_SAVE") {
  object(save, "save", code);
  expect(save.magic === SAVE_MAGIC, "magic", code);
  if (![1,2].includes(save.schemaVersion)) fail("UNSUPPORTED_VERSION", "\u8FD9\u4E2A\u5B58\u6863\u7248\u672C\u6682\u4E0D\u652F\u6301\uFF0C\u8BF7\u4F7F\u7528\u5BF9\u5E94\u7248\u672C\u7684\u6E38\u620F");
  text(save.label, 80, "label", code);
  text(save.timestamp, 30, "timestamp", code, false);
  expect(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(save.timestamp) && Number.isFinite(Date.parse(save.timestamp)) && new Date(save.timestamp).toISOString() === save.timestamp, "timestamp", code);
  expect(save.schemaVersion===(save.state?.game?.ruleset==='fleet-v1'?2:1),"schemaVersion/ruleset",code);
  validateState(save.state, code);
  return save;
}
function sizeCheck(json: string) {
  if (json.length > MAX_SAVE_BYTES || new TextEncoder().encode(json).byteLength > MAX_SAVE_BYTES) fail("SAVE_TOO_LARGE", "\u5B58\u6863\u6587\u4EF6\u8FC7\u5927\uFF08\u6700\u5927 2 MB\uFF09");
}
function createSave(input: unknown, { label = "\u672A\u547D\u540D\u5B58\u6863", timestamp = (/* @__PURE__ */ new Date()).toISOString() }: SaveOptions = {}) {
  const state = copyPlain(input, "INVALID_STATE") as SaveState;
  for (const key of TRANSIENT_KEYS) delete state[key];
  validateState(state, "INVALID_STATE");
  const envelope = copyPlain({ magic: SAVE_MAGIC, schemaVersion: state.game.ruleset==='fleet-v1'?2:SAVE_VERSION, timestamp, label, state }, "INVALID_STATE") as SaveEnvelope;
  return validateEnvelope(envelope, "INVALID_STATE");
}
function validateSave(save: unknown) {
  return validateEnvelope(copyPlain(save, "INVALID_SAVE") as SaveEnvelope);
}
function migrateSave(save: unknown) {
  const valid=validateSave(save);
  return valid;
}
function serializeSave(save: unknown) {
  const copy = validateSave(save);
  const encoded = copy as unknown as {state:{game:{ships:{airReady:(number|string)[]}[]}}};
  for (const ship of encoded.state.game.ships) ship.airReady = ship.airReady.map(n => n === Infinity ? AIRBORNE : n);
  const json = JSON.stringify(copy, null, 2);
  sizeCheck(json);
  return json;
}
function deserializeSave(json: string) {
  if (typeof json !== "string") fail("INVALID_JSON", "\u8BF7\u9009\u62E9 JSON \u5B58\u6863\u6587\u4EF6");
  sizeCheck(json);
  let value:unknown;
  try {
    value = JSON.parse(json);
  } catch {
    fail("INVALID_JSON", "\u5B58\u6863\u6587\u4EF6\u4E0D\u662F\u6709\u6548\u7684 JSON");
  }
  const copy = copyPlain(value, "INVALID_SAVE", false) as {state?:{game?:{ships?:{airReady?:(number|string)[]}[]}}};
  if (copy?.state?.game?.ships && Array.isArray(copy.state.game.ships)) {
    for (const ship of copy.state.game.ships) if (Array.isArray(ship?.airReady)) ship.airReady = ship.airReady.map((n) => n === AIRBORNE ? Infinity : n);
  }
  return migrateSave(copy);
}
function exportFilename(save: unknown) {
  const valid = validateSave(save), name = valid.label.normalize("NFKC").replace(/[\\/:*?"<>|\x00-\x1f]/g, "-").replace(/\s+/g, "-").replace(/^[. -]+|[. -]+$/g, "").slice(0, 40) || "save";
  return `azurlane-chess-${valid.timestamp.slice(0, 10)}-R${String(valid.state.game.round).padStart(2, "0")}-${name}.json`;
}
function resultError(error:unknown):SaveFailure {
 const details = error as {name?:string;code?:number}|null;
  if (error instanceof SaveError) return { ok: false, error: { code: error.code, message: error.message } };
  if (details?.name === "QuotaExceededError" || details?.name === "NS_ERROR_DOM_QUOTA_REACHED" || details?.code === 22 || details?.code === 1014) return { ok: false, error: { code: "STORAGE_QUOTA", message: "\u6D4F\u89C8\u5668\u5B58\u50A8\u7A7A\u95F4\u4E0D\u8DB3\uFF0C\u8BF7\u5BFC\u51FA\u5907\u4EFD\u6216\u5220\u9664\u4E0D\u9700\u8981\u7684\u5B58\u6863" } };
  return { ok: false, error: { code: "STORAGE_UNAVAILABLE", message: "\u6D4F\u89C8\u5668\u65E0\u6CD5\u4FDD\u5B58\u5230\u672C\u5730\uFF1B\u8BF7\u5141\u8BB8\u7AD9\u70B9\u5B58\u50A8\uFF0C\u6216\u5BFC\u51FA JSON \u5907\u4EFD" } };
}
function createSaveStorage({ storage, prefix = "azurlane-chess:v1", now = () => (/* @__PURE__ */ new Date()).toISOString() }: {storage?:StorageLike|null;prefix?:string;now?:()=>string} = {}) {
  function getStorage() {
    const target = storage === void 0 ? globalThis.localStorage : storage;
    if (!target || typeof target.getItem !== "function" || typeof target.setItem !== "function" || typeof target.removeItem !== "function") fail("STORAGE_UNAVAILABLE", "\u6D4F\u89C8\u5668\u65E0\u6CD5\u8BBF\u95EE\u672C\u5730\u5B58\u50A8\uFF0C\u8BF7\u5BFC\u51FA JSON \u5907\u4EFD");
    return target;
  }
  function key(id: string) {
    if (!SAVE_SLOTS.includes(id)) fail("INVALID_SLOT", "\u8BF7\u9009\u62E9\u6709\u6548\u7684\u5B58\u6863\u69FD");
    return `${prefix}:${id}`;
  }
  function attempt<T extends {ok:true}>(callback:()=>T):T|SaveFailure {
    try {
      return callback();
    } catch (error) {
      return resultError(error);
    }
  }
  const adapter = {
    read(id: string) {
      return attempt(() => {
        const name = key(id), json = getStorage().getItem(name);
        if (json === null) fail("SAVE_NOT_FOUND", "\u8FD9\u4E2A\u5B58\u6863\u69FD\u8FD8\u6CA1\u6709\u5B58\u6863");
        return { ok: true as const, save: deserializeSave(json) };
      });
    },
    write(id: string, state: unknown, options: SaveOptions = {}) {
      return attempt(() => {
        const name = key(id), save = createSave(state, { ...options, timestamp: options.timestamp ?? now() }), json = serializeSave(save);
        getStorage().setItem(name, json);
        return { ok: true, save };
      });
    },
    import(id: string, json: string) {
      return attempt(() => {
        const name = key(id), save = deserializeSave(json), validated = serializeSave(save);
        getStorage().setItem(name, validated);
        return { ok: true, save };
      });
    },
    remove(id: string) {
      return attempt(() => {
        const name = key(id);
        getStorage().removeItem(name);
        return { ok: true as const };
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
