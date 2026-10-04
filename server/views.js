import * as E from '../src/engine.js';
import { sampleBattleVisuals } from '../src/battle-visuals.js';

const copy = E.clone;
const point = p => ({ q: p.q, r: p.r });
const xy = p => ({ x: p.x, y: p.y });
const seen = (unit, visible) => visible.has(E.key(E.xyToHex(unit.xy)));
function publicCfg(ship) {
  const cfg = copy(E.TEMPLATES[ship.template] || {});
  cfg.radius = E.RULES.shipRadius;
  if (cfg.torpedo) delete cfg.torpedo.reserve;
  return cfg;
}
function shipView(ship, team) {
  const out = { id: ship.id, kind: 'ship', team: ship.team, label: ship.label, template: ship.template,
    cfg: ship.team === team ? copy(ship.cfg) : publicCfg(ship), hp: ship.hp,
    pos: point(ship.pos || E.xyToHex(ship.xy)), xy: xy(ship.xy), heading: ship.heading };
  if (ship.team === team) {
    for (const k of ['torps', 'mainReady', 'airHP', 'destroyedPlanes']) if (ship[k] !== undefined) out[k] = copy(ship[k]);
    if (ship.airReady) out.airReady = ship.airReady.map(n => n === Infinity ? null : n);
  }
  return out;
}
function flyingView(unit, kind, team) {
  // Enemy ownership and all flight targets/waypoints remain private.
  const out = { id: unit.id, kind, team: unit.team, xy: xy(unit.xy) };
  for (const k of ['hp', 'heading', 'state']) if (unit[k] !== undefined) out[k] = unit[k];
  if (kind === 'plane' && unit.team === team) {
    if (Number.isFinite(unit.traveled)) out.traveled = unit.traveled;
    if (typeof unit.mother === 'string') out.mother = unit.mother;
    if (Number.isInteger(unit.slot)) out.slot = unit.slot;
  }
  out.cfg = copy(kind === 'plane' ? E.RULES.plane : E.RULES.torpedo);
  return out;
}
export function playerView(game, team) {
  const visible = E.visibleCells(game, team), explored = new Set(game.explored?.[team] || visible);
  const ownExplored = [[], []]; ownExplored[team] = [...explored];
  return { round: game.round, phase: game.phase, nextId: 0, winner: game.winner, log: [],
    visible: [...visible], explored: ownExplored,
    map: { width: E.W, height: E.H, islands: game.map.islands.filter(k => explored.has(k)), mines: game.map.mines.map(point) },
    ships: game.ships.filter(s => s.team === team || E.alive(s) && seen(s, visible)).map(s => shipView(s, team)),
    planes: game.planes.filter(p => p.team === team || seen(p, visible)).map(p => flyingView(p, 'plane', team)),
    torpedoes: game.torpedoes.filter(p => p.team === team || seen(p, visible)).map(p => flyingView(p, 'torpedo', team)) };
}

// Exact interval union of segment intersections with visible hex footprints.
// A gap means interpolation could display an enemy inside fog.
function safeSegment(a, b, visible) {
  const ranges = [], normals = Array.from({ length: 6 }, (_, i) => ({ x: Math.cos(i * Math.PI / 3), y: Math.sin(i * Math.PI / 3) }));
  for (const k of visible) {
    const [q, r] = k.split(',').map(Number), c = E.hexToXY({ q, r }); let lo = 0, hi = 1;
    for (const n of normals) {
      const start = (a.x - c.x) * n.x + (a.y - c.y) * n.y, delta = (b.x - a.x) * n.x + (b.y - a.y) * n.y;
      if (Math.abs(delta) < 1e-12) { if (start > Math.sqrt(3) / 2 + 1e-10) { hi = -1; break; } }
      else { const cut = (Math.sqrt(3) / 2 - start) / delta; if (delta > 0) hi = Math.min(hi, cut); else lo = Math.max(lo, cut); }
    }
    if (lo <= hi) ranges.push([lo, hi]);
  }
  ranges.sort((a, b) => a[0] - b[0]); let end = 0;
  for (const [lo, hi] of ranges) { if (lo > end + 1e-9) return false; end = Math.max(end, hi); if (end >= 1 - 1e-9) return true; }
  return false;
}
export function playerResult(before, result, team) {
  const sourceShips = new Map([...before.ships, ...result.game.ships].map(s => [s.id, s]));
  const frames = result.frames.slice(0, 64).map(frame => {
    const visible = new Set(frame.visibleByTeam?.[team] || (team === 0 ? frame.visible : []) || []);
    const units = (name, kind) => frame[name].filter(u => u.team === team || seen(u, visible)).map(u => kind === 'ship' ? shipView({ ...u, template: sourceShips.get(u.id)?.template }, team) : flyingView(u, kind, team));
    const visuals = sampleBattleVisuals(result.presentation || [], frame.t, visible);
    // Presentation IDs can contain a hidden source ID. Replace with opaque frame-local IDs.
    visuals.projectiles = visuals.projectiles.map((p, i) => ({ ...p, id: `v${i}` }));
    visuals.effects = visuals.effects.map((p, i) => ({ ...p, id: `e${i}`, text: /^−?\d+$/.test(p.text) ? p.text : '' }));
    return { t: frame.t, visible: [...visible], explored: [...(frame.exploredByTeam?.[team] || (team === 0 ? frame.explored : []) || [])],
      ships: units('ships', 'ship'), planes: units('planes', 'plane'), torpedoes: units('torpedoes', 'torpedo'),
      mines: frame.mines.map(point), effects: [], visuals };
  });
  for (let i = frames.length - 2; i >= 0; i--) for (const name of ['ships', 'planes', 'torpedoes']) {
    const next = new Map(frames[i + 1][name].map(u => [u.id, u]));
    frames[i][name] = frames[i][name].filter(u => u.team === team || !next.has(u.id) || safeSegment(u.xy, next.get(u.id).xy, frames[i].visible));
  }
  const events = (result.events || []).filter(e => {
    const frame = [...frames].reverse().find(f => f.t <= e.t) || frames[0];
    return e.at && frame?.visible.includes(E.key(e.at));
  }).slice(-300).map(e => ({ round: e.round, t: e.t, at: point(e.at), team: null, text: '可见区域发生战斗事件' }));
  return { game: playerView(result.game, team), frames, events, presentation: [] };
}

const invalid = () => { const e = new Error('作战指令无效，请检查己方单位、指令格式和已知地图。'); e.code = 'INVALID_ORDERS'; throw e; };
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x) && [Object.prototype, null].includes(Object.getPrototypeOf(x));
const fields = (o, names) => object(o) && Object.keys(o).every(k => names.includes(k));
const hex = h => fields(h, ['q', 'r']) && Number.isInteger(h.q) && Number.isInteger(h.r) && E.inBounds(h);
export function validateOrders(game, team, submitted) {
  if (!object(submitted) || Object.keys(submitted).length > game.ships.length) invalid();
  const friends = game.ships.filter(s => s.team === team && E.alive(s)), ids = new Set(friends.map(s => s.id));
  if (Object.keys(submitted).some(id => !ids.has(id))) invalid();
  const view = playerView(game, team), normalized = {};
  for (const ship of friends) {
    const input = Object.hasOwn(submitted, ship.id) ? submitted[ship.id] : E.emptyPlan();
    if (!fields(input, ['moves', 'torps', 'main', 'planes', 'sweep', 'segments'])) invalid();
    const p = E.emptyPlan();
    for (const name of ['moves', 'torps', 'main', 'planes']) { if (input[name] !== undefined && !Array.isArray(input[name])) invalid(); p[name] = input[name] ? Array.from(input[name]) : []; if (p[name].length > 20) invalid(); }
    p.sweep = input.sweep ?? null;
    if (p.moves.length > ship.cfg.speed || p.moves.some(m => !fields(m, ['turn', 'forward']) || ![-1, 0, 1].includes(m.turn) || typeof m.forward !== 'boolean')) invalid();
    const nodes = E.route(ship, p, view.map);
    if (nodes.length !== p.moves.length + 1) invalid();
    if (p.torps.length > Math.min(ship.torps, ship.cfg.torpedo?.max || 0)) invalid();
    const windows = new Set();
    for (const t of p.torps) {
      if (!fields(t, ['window', 'dir']) || !Number.isInteger(t.window) || t.window < 0 || !nodes[t.window] || !Number.isInteger(t.dir) || t.dir < 0 || t.dir > 5 || windows.has(t.window) || [nodes[t.window].heading, E.mod(nodes[t.window].heading + 3)].includes(t.dir)) invalid();
      windows.add(t.window);
    }
    if (p.main.length > (ship.mainReady <= game.round ? ship.cfg.main?.shots || 0 : 0) || p.main.some(h => !hex(h) || E.hexDist(ship.pos, h) > ship.cfg.main.range)) invalid();
    if (p.planes.length > Math.min(ship.cfg.carrier?.launch || 0, ship.airReady?.filter(n => n <= game.round).length || 0)) invalid();
    for (const order of p.planes) {
      if (order?.mode === 'point') { if (!fields(order, ['mode', 'target']) || !hex(order.target)) invalid(); }
      else if (order?.mode === 'target') { if (!fields(order, ['mode', 'targetId']) || typeof order.targetId !== 'string' || !view.ships.some(s => s.id === order.targetId && s.team !== team && E.alive(s))) invalid(); }
      else invalid();
    }
    if (p.sweep !== null && (!hex(p.sweep) || !ship.cfg.secondary || E.hexDist(ship.pos, p.sweep) > ship.cfg.secondary.range || !view.map.mines.some(h => E.same(h, p.sweep)) || !E.hasLOS(view.map, ship.pos, p.sweep))) invalid();
    if (input.segments !== undefined && (!Array.isArray(input.segments) || input.segments.length > ship.cfg.speed || input.segments.some(s => !fields(s, ['start', 'end', 'target']) || !Number.isInteger(s.start) || !Number.isInteger(s.end) || s.start < 0 || s.end <= s.start || s.end > p.moves.length || !hex(s.target)))) invalid();
    normalized[ship.id] = copy(p);
  }
  return normalized;
}
