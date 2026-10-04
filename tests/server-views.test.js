import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { playerView, playerResult, validateOrders } from '../server/views.js';
import { interpolateFrame } from '../src/playback.js';

function fixture() { const g = E.createGame(); g.phase = 'plan'; return g; }
const bad = fn => assert.throws(fn, e => e.code === 'INVALID_ORDERS');
test('both perspectives exclude hidden units, terrain, seed and opponent exploration', () => {
  const g = fixture();
  for (const team of [0, 1]) {
    const v = playerView(g, team), visible = E.visibleCells(g, team);
    assert.equal(v.seed, undefined); assert.equal(v.nextId, 0);
    assert.deepEqual(v.explored[1 - team], []); assert.deepEqual(v.log, []);
    assert.ok(v.ships.every(s => s.team === team || visible.has(E.key(E.xyToHex(s.xy)))));
    assert.ok(v.map.islands.every(k => g.explored[team].includes(k)));
    assert.deepEqual(v.map.mines, g.map.mines);
    assert.equal(v.ships.filter(s => s.team === team).length, 5);
  }
});
test('visible enemy projections strip reserves and arbitrary private cfg; own infinity is explicit null', () => {
  const g = fixture(), own = g.ships[0], enemy = g.ships[5];
  enemy.pos = E.add(own.pos, 0); enemy.xy = E.hexToXY(enemy.pos); enemy.cfg.secret = 'SECRET'; enemy.waypoints = ['SECRET'];
  const cv = g.ships.find(s => s.team === 0 && s.template === 'cv'); cv.airReady[0] = Infinity;
  g.planes.push({ id: 'secret-plane', team: 1, hp: 2, xy: own.xy, target: 'SECRET', targetId: 'SECRET', waypoints: ['SECRET'], cfg: { secret: 'SECRET' } });
  const v = playerView(g, 0), e = v.ships.find(s => s.id === enemy.id);
  assert.equal(e.torps, undefined); assert.equal(e.mainReady, undefined); assert.equal(e.cfg.torpedo.reserve, undefined);
  assert.equal(v.ships.find(s => s.id === cv.id).airReady[0], null);
  assert.ok(!JSON.stringify(v).includes('SECRET')); assert.equal(g.ships.find(s => s.id === cv.id).airReady[0], Infinity);
});
test('strict structure and ownership errors never enter engine; empty plans normalized', () => {
  const g = fixture(), id = g.ships[0].id;
  assert.equal(Object.keys(validateOrders(g, 0, {})).length, 5);
  for (const input of [null, [], { [id]: null }, { [id]: { moves: Array(1) } }, { '1-0': {} }, { ghost: {} }, { [id]: { moves: [null] } }, { [id]: { moves: [{ turn: 2, forward: true }] } }, { [id]: { main: [null] } }, { [id]: { planes: [{ mode: 'evil' }] } }, { [id]: { torps: [{ window: -1, dir: 1 }] } }, { [id]: { moves: 'oops' } }, { [id]: { seed: 5 } }, { [id]: { segments: [null] } }]) bad(() => validateOrders(g, 0, input));
  const normalized = validateOrders(g, 1, {}); assert.ok(Object.keys(normalized).every(k => k.startsWith('1-')));
  assert.doesNotThrow(() => E.resolveRound(g, normalized));
});
test('unknown terrain cannot become an orders oracle, known island rejects', () => {
  const g = fixture(), ship = g.ships[0]; ship.pos = E.fromCR(8, 7); ship.xy = E.hexToXY(ship.pos); ship.heading = 0;
  const destination = E.add(ship.pos, 0), island = E.key(destination), orders = { [ship.id]: { moves: [{ turn: 0, forward: true }] } };
  g.explored[0] = []; g.map.islands = [];
  const a = validateOrders(g, 0, orders); g.map.islands = [island];
  assert.deepEqual(validateOrders(g, 0, orders), a);
  g.explored[0] = [island]; bad(() => validateOrders(g, 0, orders));
});
test('plane target validation rejects hidden ships and malformed coordinates', () => {
  const g = fixture(), cv = g.ships.find(s => s.team === 0 && s.cfg.carrier);
  for (const planes of [[{ mode: 'target', targetId: '1-0' }], [{ mode: 'point', target: { q: NaN, r: 0 } }], [null]]) bad(() => validateOrders(g, 0, { [cv.id]: { planes } }));
});
test('real round projects both teams, strips presentation metadata, remains bounded and wire serializable', () => {
  const g = fixture(), result = E.resolveRound(g, {});
  for (const team of [0, 1]) {
    const projected = playerResult(g, result, team);
    assert.ok(projected.frames.length > 1); assert.ok(projected.frames.every(f => f.visible.length > 0));
    assert.deepEqual(projected.presentation, []);
    assert.ok(projected.frames.every(f => !('visibleByTeam' in f) && !('exploredByTeam' in f)));
    assert.ok(JSON.stringify(projected).length < 1000000);
    assert.ok(projected.frames.every(f => f.ships.filter(s => s.team === team).length === 5));
  }
});
test('adversarial replay clips projectiles, redacts hidden attackers and blocks interpolation across fog', () => {
  const g = fixture(), enemy = g.ships[5], a = E.fromCR(6, 7), b = E.fromCR(10, 7), visible = [E.key(a), E.key(b)];
  const make = (t, pos) => ({ t, visibleByTeam: [visible, []], exploredByTeam: [visible, []], ships: [{ ...enemy, pos, xy: E.hexToXY(pos) }], planes: [], torpedoes: [], mines: [], effects: [{ at: a, from: b, secret: 'SECRET' }] });
  const result = { game: g, frames: [make(0, a), make(1, b)], events: [{ t: 0, round: 1, at: a, text: 'SECRET fired', team: 1 }], presentation: [{ id: 'SECRET', sourceId: 'SECRET', type: 'projectile', kind: 'main', team: 1, from: E.hexToXY(a), to: E.hexToXY(b), start: 0, end: 1 }] };
  const projected = playerResult(g, result, 0);
  assert.ok(!JSON.stringify(projected).includes('SECRET'));
  for (let fraction = 0; fraction < 1; fraction += .05) {
    const f = interpolateFrame(projected.frames[0], projected.frames[1], fraction);
    assert.ok(f.ships.every(s => visible.includes(E.key(E.xyToHex(s.xy)))));
    for (const p of f.visuals.projectiles) for (const point of [...p.trail, ...(p.position ? [p.position] : [])]) assert.ok(visible.includes(E.key(E.xyToHex({ x: point.x, y: point.z }))));
  }
});

test('mines are globally public in both state and playback outside vision', () => {
  const g = fixture(), mine = E.fromCR(9, 7); g.map.mines = [mine];
  const frames = [{ t: 0, ships: [], planes: [], torpedoes: [], mines: [mine], effects: [], visibleByTeam: [[], []], exploredByTeam: [[], []] }];
  for (const team of [0, 1]) {
    assert.deepEqual(playerView(g, team).map.mines, [mine]);
    assert.deepEqual(playerResult(g, { game: g, frames, events: [], presentation: [] }, team).frames[0].mines, [mine]);
  }
});

test('own airborne roster keeps mother and slot but never leaks tracked target or waypoints', () => {
  const g = fixture();
  for (const team of [0, 1]) g.planes.push({ id: `plane-${team}`, team, mother: `${team}-4`, slot: 2, hp: 2, cfg: E.RULES.plane, xy: g.ships[0].xy, target: { q: 9, r: 7 }, targetId: 'SECRET', tracking: true, waypoints: ['SECRET'] });
  for (const team of [0, 1]) {
    const view = playerView(g, team), own = view.planes.find(p => p.team === team);
    assert.equal(own.mother, `${team}-4`); assert.equal(own.slot, 2);
    for (const plane of view.planes) { assert.equal(plane.target, undefined); assert.equal(plane.targetId, undefined); assert.equal(plane.waypoints, undefined); if (plane.team !== team) { assert.equal(plane.mother, undefined); assert.equal(plane.slot, undefined); } }
  }
});
