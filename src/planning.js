import * as E from "./engine.js";
const airDistance = (a, b) => {
  const x = E.hexToXY(a), y = E.hexToXY(b);
  return Math.hypot(x.x - y.x, x.y - y.y) / Math.sqrt(3);
};
const knowledgeMap = (map, explored) => ({ ...map, islands: map.islands.filter((k) => explored.has(k)) });
function reachable(ship, plan, map, known = null) {
  const nodes = E.route(ship, plan, map), end = nodes.at(-1), budget = Math.max(0, ship.cfg.speed - (plan.moves?.length || 0)), cells = /* @__PURE__ */ new Map(), queue = [{ pos: { ...end.pos }, heading: end.heading, cost: 0, moves: [], path: [{ ...end.pos }] }], seen = /* @__PURE__ */ new Set([`${E.key(end.pos)}:${end.heading}`]);
  for (let i = 0; i < queue.length; i++) {
    const state = queue[i], k = E.key(state.pos);
    if (!cells.has(k)) cells.set(k, state);
    if (state.cost >= budget) continue;
    for (const turn of [0, -1, 1]) for (const forward of [true, false]) {
      const heading = E.mod(state.heading + turn), pos = forward ? E.add(state.pos, heading) : state.pos, id = `${E.key(pos)}:${heading}`;
      if (!E.legal(map, pos) || known && !known.has(E.key(pos)) || seen.has(id)) continue;
      seen.add(id);
      queue.push({ pos: { ...pos }, heading, cost: state.cost + 1, moves: [...state.moves, { turn, forward }], path: [...state.path, { ...pos }] });
    }
  }
  return cells;
}
const knownReachable = (ship, plan, map, explored) => reachable(ship, plan, map, explored);
const certainReachable = (cells, explored) => new Map([...cells].filter(([k, state]) => explored.has(k) && state.path.every((h) => explored.has(E.key(h)))));
function ranges(ship, plan, map) {
  const end = E.route(ship, plan, map).at(-1).pos, main = /* @__PURE__ */ new Set(), secondary = /* @__PURE__ */ new Set(), aa = /* @__PURE__ */ new Set(), sweep = /* @__PURE__ */ new Set(), air = /* @__PURE__ */ new Set();
  for (const h of E.allHexes()) {
    const k = E.key(h);
    if (ship.cfg.main && E.hexDist(ship.pos, h) <= ship.cfg.main.range) main.add(k);
    if (ship.cfg.secondary && E.hexDist(end, h) <= ship.cfg.secondary.range && E.hasLOS(map, end, h)) secondary.add(k);
    if (ship.cfg.secondary && E.hexDist(ship.pos, h) <= ship.cfg.secondary.range && E.hasLOS(map, ship.pos, h)) sweep.add(k);
    if (ship.cfg.aa && E.hexDist(end, h) <= ship.cfg.aa.range) aa.add(k);
    if (ship.cfg.carrier && airDistance(ship.pos, h) <= ship.cfg.carrier.plane.range + 1e-8) air.add(k);
  }
  return { main, secondary, aa, sweep, air, end };
}
function torpedoRays(ship, plan, map, window) {
  if (!ship.cfg.torpedo) return [];
  const node = E.route(ship, plan, map)[window];
  if (!node) return [];
  const cfg = ship.cfg.torpedo, roundDistance = cfg.speed * (1 - window / ship.cfg.speed), maxDistance = cfg.speed * cfg.life, rays = [];
  for (let dir = 0; dir < 6; dir++) if (![node.heading, E.mod(node.heading + 3)].includes(dir)) {
    const cells = [];
    let at = node.pos;
    for (let n = 1; n <= Math.floor(maxDistance); n++) {
      at = E.add(at, dir);
      if (!E.legal(map, at)) break;
      cells.push({ ...at });
    }
    const available = Math.min(maxDistance, cells.length + 0.5 - 1e-6), atDistance = (n) => ({ q: node.pos.q + E.DIRS[dir][0] * n, r: node.pos.r + E.DIRS[dir][1] * n });
    rays.push({ dir, origin: { ...node.pos }, cells, roundDistance, maxDistance, roundEnd: atDistance(Math.min(roundDistance, available)), fullEnd: atDistance(available) });
  }
  return rays;
}
function trimMovement(ship, input, map, length) {
  const plan = E.clone(input), removed = [];
  plan.moves = plan.moves.slice(0, Math.max(0, length));
  plan.segments = (plan.segments || []).filter((s) => s.end <= plan.moves.length);
  const nodes = E.route(ship, plan, map);
  plan.torps = (plan.torps || []).filter((t) => {
    const n = nodes[t.window], valid = !!n && ![n.heading, E.mod(n.heading + 3)].includes(t.dir);
    if (!valid) removed.push(t);
    return valid;
  });
  return { plan, removedTorps: removed.length };
}
function recordEdit(history, id, before, after) {
  if (JSON.stringify(before) === JSON.stringify(after)) return false;
  const h = history[id] || (history[id] = { undo: [], redo: [] });
  h.undo.push(E.clone(before));
  if (h.undo.length > 60) h.undo.shift();
  h.redo = [];
  return true;
}
function historyStep(history, id, current, direction) {
  const h = history[id];
  if (!h || !h[direction]?.length) return null;
  const opposite = direction === "undo" ? "redo" : "undo";
  h[opposite].push(E.clone(current));
  return h[direction].pop();
}
export {
  airDistance,
  certainReachable,
  historyStep,
  knowledgeMap,
  knownReachable,
  ranges,
  reachable,
  recordEdit,
  torpedoRays,
  trimMovement
};
