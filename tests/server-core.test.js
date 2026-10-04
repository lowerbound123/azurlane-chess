import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { GameService } from '../server/game-service.js';

function setup() {
  let now = 1000, sequence = 0, pending = [];
  const pool = { resolve(game, orders) { return new Promise((resolve, reject) => pending.push({ game, orders, resolve, reject })); } };
  const service = new GameService({ pool, now: () => now, autoTick: false, logger: { error() {} } });
  const player = name => { const session = service.session(name), messages = []; const send = m => messages.push(m); const p = service.connect(session.token, send); return { p, session, messages, send }; };
  const cmd = (u, type, payload = {}, extra = {}) => service.command(u.p, { v: 1, id: String(++sequence), type, payload, ...extra });
  const matchCmd = (u, type, payload = {}) => { const m = service.matches.get(u.p.match); return cmd(u, type, payload, { matchId: m.id, round: m.game.round }); };
  const pair = () => { const a = player('a'), b = player('b'); cmd(a, 'queue.join', { roster: E.DEFAULT_ROSTER }); cmd(b, 'queue.join', { roster: E.DEFAULT_ROSTER }); const m = service.matches.get(a.p.match); return { a, b, m }; };
  const flush = () => new Promise(resolve => setImmediate(resolve));
  const complete = async (ended = false) => { await flush(); const job = pending.shift(); assert.ok(job, 'resolution job queued'); const game = E.clone(job.game); game.round++; game.phase = ended ? 'ended' : 'plan'; game.winner = ended ? 0 : null; job.resolve({ game, frames: [], events: [], presentation: [] }); await flush(); };
  return { service, player, cmd, matchCmd, pair, flush, complete, pending, advance(ms) { now += ms; }, get now() { return now; } };
}

test('rooms validate readiness, reset readiness after updates and release both players on host leave', () => {
  const h = setup(), a = h.player('a'), b = h.player('b'), c = h.player('c');
  const create = h.cmd(a, 'room.create', { roster: E.DEFAULT_ROSTER, turnSeconds: 60 }); assert.equal(create.ok, true);
  const code = create.data.code; assert.equal(h.cmd(b, 'room.join', { code, roster: E.DEFAULT_ROSTER }).ok, true);
  assert.equal(h.cmd(c, 'room.join', { code, roster: E.DEFAULT_ROSTER }).code, 'ROOM_UNAVAILABLE');
  assert.equal(h.cmd(a, 'room.start').code, 'NOT_READY');
  h.cmd(a, 'room.ready', { ready: true }); h.cmd(b, 'room.ready', { ready: true });
  assert.equal(h.cmd(b, 'room.update', { turnSeconds: 300 }).code, 'INVALID_TIME');
  h.cmd(a, 'room.update', { turnSeconds: 120 }); assert.deepEqual(h.service.rooms.get(code).ready, {});
  h.cmd(a, 'room.leave'); assert.equal(a.p.room, null); assert.equal(b.p.room, null); assert.equal(h.service.rooms.size, 0);
});
test('four-player queue pairs FIFO, never shares players between matches, disconnect removes waiting guest', () => {
  const h = setup(), users = ['a', 'b', 'c', 'd'].map(h.player);
  for (const u of users) assert.equal(h.cmd(u, 'queue.join', { roster: E.DEFAULT_ROSTER }).ok, true);
  assert.equal(users[0].p.match, users[1].p.match); assert.equal(users[2].p.match, users[3].p.match); assert.notEqual(users[0].p.match, users[2].p.match);
  assert.equal(h.service.queue.length, 0); assert.equal(h.service.matches.size, 2);
  const waiting = h.player('e'); h.cmd(waiting, 'queue.join', { roster: E.DEFAULT_ROSTER }); h.service.disconnect(waiting.p, waiting.send); assert.equal(h.service.queue.length, 0); assert.equal(waiting.p.queued, false);
});
test('deployment accepts only own unique positions and enters plan after both readiness flags', () => {
  const h = setup(), { a, b, m } = h.pair();
  const positions = u => m.game.ships.filter(s => s.team === m.seats.findIndex(x => x.playerId === u.p.id)).map(s => ({ id: s.id, pos: s.pos }));
  assert.equal(h.matchCmd(a, 'deploy.update', { positions: positions(b), ready: true }).code, 'INVALID_DEPLOY');
  assert.equal(h.matchCmd(a, 'deploy.update', { positions: positions(a), ready: true }).ok, true); assert.equal(m.stage, 'deploy');
  assert.equal(h.matchCmd(b, 'deploy.update', { positions: positions(b), ready: true }).ok, true); assert.equal(m.stage, 'plan'); assert.deepEqual(m.submitted, [false, false]);
});
test('submit/withdraw race locks atomically at second submission and resolves once; playback server controls stage', async () => {
  const h = setup(), { a, b, m } = h.pair(); h.service.beginPlan(m);
  assert.equal(h.matchCmd(a, 'orders.submit', { plans: {} }).ok, true);
  assert.equal(h.matchCmd(a, 'orders.withdraw').ok, true);
  h.matchCmd(a, 'orders.submit', { plans: {} }); h.matchCmd(b, 'orders.submit', { plans: {} });
  assert.equal(m.stage, 'resolving'); assert.equal(h.matchCmd(a, 'orders.withdraw').code, 'WRONG_STAGE');
  assert.equal(h.matchCmd(a, 'orders.submit', { plans: {} }).code, 'WRONG_STAGE'); await h.flush(); assert.equal(h.pending.length, 1);
  await h.complete(); assert.equal(m.stage, 'playback'); assert.equal(a.messages.filter(x => x.type === 'round').length, 1);
  assert.equal(h.matchCmd(a, 'orders.submit', { plans: {} }).code, 'WRONG_STAGE');
  h.advance(1001); h.service.tick(); assert.equal(m.stage, 'plan'); assert.equal(m.game.round, 2);
});
test('disconnect pause extends planning deadline and budget accumulates across reconnects', () => {
  const h = setup(), { a, m } = h.pair(); h.service.beginPlan(m); const deadline = m.deadline;
  h.service.disconnect(a.p, a.send); assert.notEqual(m.pauseSince, null); h.advance(40000);
  h.service.connect(a.session.token, a.send); assert.equal(m.pauseSince, null); assert.equal(m.deadline, deadline + 40000);
  const seat = m.seats.find(s => s.playerId === a.p.id); assert.equal(seat.remainingMs, 50000);
  h.service.disconnect(a.p, a.send); h.advance(50001); h.service.tick(); assert.equal(m.stage, 'ended'); assert.equal(m.result.winner, 1 - m.seats.indexOf(seat));
});
test('reconnecting after exhausted cumulative budget cannot bypass timeout before tick', () => {
  const h = setup(), { a, m } = h.pair(); h.service.beginPlan(m); h.service.disconnect(a.p, a.send); h.advance(90001);
  h.service.connect(a.session.token, a.send); assert.equal(m.stage, 'ended');
});
test('three consecutive missed planning deadlines forfeit, while opponent timely submissions survive', async () => {
  const h = setup(), { a, b, m } = h.pair(); h.service.beginPlan(m);
  for (let i = 0; i < 3; i++) {
    assert.equal(h.matchCmd(b, 'orders.submit', { plans: {} }).ok, true);
    h.advance(120001); h.service.tick();
    if (i < 2) { await h.complete(); h.advance(1001); h.service.tick(); }
  }
  assert.equal(m.stage, 'ended'); assert.equal(m.result.winner, m.seats.findIndex(s => s.playerId === b.p.id));
});
test('submit then withdraw does not reset prior consecutive deadline misses', () => {
  const h = setup(), { a, b, m } = h.pair(); h.service.beginPlan(m); const seat = m.seats.find(s => s.playerId === a.p.id); seat.timeouts = 2;
  h.matchCmd(a, 'orders.submit', { plans: {} }); h.matchCmd(a, 'orders.withdraw'); h.matchCmd(b, 'orders.submit', { plans: {} }); h.advance(120001); h.service.tick();
  assert.equal(m.stage, 'ended');
});
test('reconnect during playback returns current stage and terminal result appears only after playback', async () => {
  const h = setup(), { a, b, m } = h.pair(); h.service.beginPlan(m); h.matchCmd(a, 'orders.submit', { plans: {} }); h.matchCmd(b, 'orders.submit', { plans: {} }); await h.complete(true);
  h.service.disconnect(a.p, a.send); const messages = []; h.service.connect(a.session.token, message => messages.push(message));
  assert.equal(messages.at(-1).match.stage, 'playback'); assert.equal(messages.at(-1).match.result, null);
  h.advance(1001); h.service.tick(); assert.equal(m.stage, 'ended'); assert.equal(m.result.winner, 0);
  assert.equal(h.matchCmd(a, 'match.leave').ok, true); assert.equal(a.p.match, null);
});

test('selected AI display name follows model selection into match snapshot without private config', () => {
  const h=setup(),a=h.player('a');
  h.service.models=[{id:'deepseek-flash',name:'小肥鱼',apiKey:'secret',baseURL:'private'},{id:'second',name:'另一个AI'}];
  for(const selected of h.service.models){
    assert.equal(h.cmd(a,'ai.start',{roster:E.DEFAULT_ROSTER,modelId:selected.id}).ok,true);
    const view=h.service.view(a.p);
    assert.equal(view.match.aiName,selected.name);
    assert.ok(!JSON.stringify(view).includes('secret'));
    h.matchCmd(a,'match.resign');h.matchCmd(a,'match.leave');
  }
});
