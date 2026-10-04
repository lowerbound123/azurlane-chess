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

// Predict only friendly planned motion on the player's known map. Hidden enemy
// orders and terrain must never influence this UI warning.
export function friendlyRouteConflicts(ship, plan, friends, plans, map) {
  const position = (unit, nodes, time) => {
    const step = Math.min(time * unit.cfg.speed, nodes.length - 1), i = Math.floor(step);
    const a = E.hexToXY(nodes[i].pos), b = E.hexToXY(nodes[Math.min(i + 1, nodes.length - 1)].pos), f = step - i;
    return { x:a.x+(b.x-a.x)*f, y:a.y+(b.y-a.y)*f };
  };
  const ours = E.route(ship, plan, map), conflicts = [];
  for (const other of friends.filter(s => s.id !== ship.id && s.team === ship.team && E.alive(s))) {
    const theirs = E.route(other, plans[other.id] || E.emptyPlan(), map);
    const times = [...new Set([0, 1, ...ours.map((_,i)=>i/ship.cfg.speed), ...theirs.map((_,i)=>i/other.cfg.speed)])].sort((a,b)=>a-b);
    for (let i=1;i<times.length;i++) {
      const a=position(ship,ours,times[i-1]), b=position(ship,ours,times[i]), c=position(other,theirs,times[i-1]), d=position(other,theirs,times[i]);
      const x=a.x-c.x,y=a.y-c.y,vx=b.x-a.x-d.x+c.x,vy=b.y-a.y-d.y+c.y;
      const vv=vx*vx+vy*vy,t=vv?Math.max(0,Math.min(1,-(x*vx+y*vy)/vv)):0;
      if(Math.hypot(x+vx*t,y+vy*t)<=E.collisionRadius(ship)+E.collisionRadius(other)+1e-9){conflicts.push(other.label);break;}
    }
  }
  return conflicts;
}

export function movementOutcomes(before, submitted, result) {
  const map=knowledgeMap(before.map,new Set(before.explored?.[0]||[])), outcomes={};
  for(const ship of before.ships.filter(s=>s.team===0&&E.alive(s))) {
    const plan=submitted[ship.id];if(!plan?.moves?.length)continue;
    const target=E.route(ship,plan,map).at(-1).pos, actual=result.game.ships.find(s=>s.id===ship.id);
    const collision=result.events.some(e=>e.team===0&&e.text.startsWith(ship.label+' ')&&/碰撞|沿原路回退/.test(e.text));
    const received=E.validPlan(before,ship,plan).moves.length;
    const reason=!E.alive(actual)?'执行中沉没':collision?'碰撞截停并回退':received<plan.moves.length?'航路被地形截停':!E.same(actual.pos,target)?'未到达计划终点':'已执行并到达';
    outcomes[ship.id]={steps:plan.moves.length,received,reason,blocked:reason!=='已执行并到达'};
  }
  return outcomes;
}
