import {vi} from 'vitest';
import {mockFetch} from './helpers/fetch.ts';
import {TestSocket} from './helpers/socket.ts';
import type {ClientShip, OnlineState,User} from '../shared/network.ts';
import {flushPromises} from '@vue/test-utils';
// @vitest-environment happy-dom
import {mountGame,settleGame,chooseSelect} from './helpers/mount-game.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import * as E from '../src/engine.ts';
import { playerView } from '../server/views.ts';

document.body.innerHTML = '<div id="app"></div>';
const oldPerformance = globalThis.performance, oldError = console.error, errors:string[] = [];
let clock = 0, nextHandle = 0;
const animation = new Map();
Object.defineProperty(globalThis, 'performance', { configurable: true, value: { now: () => clock } });
window.requestAnimationFrame = callback => { animation.set(++nextHandle, callback); return nextHandle; };
window.cancelAnimationFrame = handle => animation.delete(handle);
const step = (ms:number)=> { clock += ms; const callbacks = [...animation.values()]; animation.clear(); callbacks.forEach(callback => callback(clock)); };
console.error = (...args) => errors.push(args.join(' '));
class Socket extends TestSocket {
 static current:Socket;
  constructor() {super(); this.readyState = 1; Socket.current = this; queueMicrotask(() => this.onopen()); }
  send(raw:string) { const m = JSON.parse(raw); queueMicrotask(() => this.push({ type: 'ack', id: m.id, ok: true })); }
  push(message:unknown) { this.onmessage({ data: JSON.stringify(message) }); }
  close() { this.onclose?.(); }
}
vi.stubGlobal('WebSocket',Socket);
vi.stubGlobal('fetch',mockFetch(async url => ({ ok: true, json: async () => url === '/api/config' ? { serverId: 'test', protocolVersion:2,models:[] } : url === '/api/session' ? { serverId: 'test', token: 'test', playerId: 'me' } : { enabled: false, user: null } })));
const {session:vm,router,wrapper}=await mountGame();
const flush = async () => { await settleGame(); await new Promise(resolve => setTimeout(resolve, 0)); };
await vm.connectOnline('测试');

async function fixture() {
  clock = 0; animation.clear();
  const game = E.createGame(); game.phase = 'plan';
  const before = playerView(game, 0), after = E.clone(before); after.round = 2;
  const moving = after.ships.find(s => s.id === '0-0'); moving!.pos = E.add(moving!.pos, 0); moving!.xy = E.hexToXY(moving!.pos);
  const frames = Array.from({ length: 12 }, (_, i) => ({ t: i / 11, ships: before.ships.map(s => s.id === moving!.id ? { ...s, xy: { x: s.xy.x + (moving!.xy.x - s.xy.x) * i / 11, y: s.xy.y } } : s), planes: [], torpedoes: [], mines: [], visible: before.visible, explored: before.explored[0], effects: [], visuals: { actions: [], projectiles: [], effects: [] } }));
  const state:OnlineState = { type: 'state', player: { id: 'me',nickname:'测试' }, room: null, queue: null, match: { id: 'm', kind: 'ai', myTeam: 0, stage: 'plan', round: 1, game: before, submitted: [false, false], disconnects: [], deadline: null } };
  Socket.current.push(state);
  await vm.enterOnlineBattle(); await flush();
  return { state, result: { game: after, frames, events: [], presentation: [] }, moving };
}
function startReplay(f: Awaited<ReturnType<typeof fixture>>, playbackUntil = Date.now() + 1320) {
  Socket.current.push({ type: 'round', matchId: 'm', round: 1, result: f.result, playbackUntil });
  Socket.current.push({ ...f.state, match: { ...f.state.match, stage: 'playback', round: 2, game: f.result.game } });
}
afterEach(async()=>{Socket.current.push({type:'state',player:{id:'me',nickname:'测试'},room:null,queue:null,match:null});animation.clear();await vm.goHome();await flush();});
afterAll(() => { wrapper.unmount(); console.error = oldError; Object.defineProperty(globalThis, 'performance', { configurable: true, value: oldPerformance }); });

test('lobby main menu restores offline play and background match updates do not reopen the battle', async () => {
  const offline = E.createGame(); offline.phase = 'plan'; vm.game = offline;
  const f = await fixture();
  await vm.goHome(); await flush();
  assert.equal(vm.screen, 'home'); assert.equal(vm.onlineActive, false);
  assert.equal(vm.game.seed, offline.seed); assert.equal(vm.game.ships.length, 10);
  Socket.current.push({ ...f.state, match: { ...f.state.match, round: 2, game: f.result.game } }); await flush();
  assert.equal(vm.screen, 'home'); assert.equal(vm.onlineActive, false); assert.equal(vm.game.round, 1);
  await vm.enterOnlineBattle(); await flush();
  assert.equal(vm.screen, 'battle'); assert.equal(vm.onlineActive, true); assert.equal(vm.game.round, 2);
});

test('expired absolute server playback deadline still displays intermediate frames', async () => {
  const f = await fixture(); startReplay(f, Date.now() - 5000); step(55);
  assert.ok(vm.finished, 'clock skew or delayed delivery must not skip playback');
  assert.ok(vm.playFrame); assert.equal(vm!.game!.round, 1); assert.ok(vm.progress < .2);
});

test('next planning state is retained without interrupting the current replay or allowing new orders', async () => {
  const f = await fixture(); startReplay(f); step(165);
  Socket.current.push({ ...f.state, match: { ...f.state.match, round: 2, game: f.result.game } });
  assert.ok(vm.finished); assert.equal(vm.busy, true); assert.equal(vm.onlineLocked, true); assert.equal(vm!.game!.round, 1);
  for (let i = 0; i < 15; i++) step(110);
  assert.equal(vm.finished, null); assert.equal(vm.busy, false); assert.equal(vm!.game!.round, 2);
  assert.equal(vm!.game!.ships.find(s => s.id === f!.moving!.id)!.xy.x, f!.moving!.xy.x);
});

test('online playback honors speed changes', async () => {
  const f = await fixture(); vm.playSpeed = .5; startReplay(f); step(100); const slow = vm.progress;
  vm.playSpeed = 2; step(100); assert.ok(vm.progress > slow * 2);
  vm.playSpeed = 1;
});
test('duplicate round messages do not restart the active replay', async () => {
  const f = await fixture(); startReplay(f); step(100);
  const progress = vm.progress;
  Socket.current.push({ type: 'round', matchId: 'm', round: 1, result: f.result, playbackUntil: Date.now() + 1320 });
  assert.equal(vm.progress, progress); assert.equal(errors.length, 0, errors.join('\n'));
});
test('switching offline and online preserves each game own unsent plans', async () => {
  vm.game = E.createGame(); vm.game.phase = 'plan';
  vm.plans = { '0-0': { ...E.emptyPlan(), moves: [{ turn: 0, forward: true }] } };
  await fixture(); vm.plans = { '0-0': { ...E.emptyPlan(), moves: [{ turn: 1, forward: false }] } };
  await vm.goHome(); await flush(); assert.equal(vm.plans['0-0'].moves[0].turn, 0);
  await vm.enterOnlineBattle(); await flush(); assert.equal(vm.plans['0-0'].moves[0].turn, 1);
});
test('returning to a later online round does not import offline or previous-round orders', async () => {
  vm.game = E.createGame(); vm.game.phase = 'plan';
  vm.plans = { '0-0': { ...E.emptyPlan(), moves: [{ turn: 0, forward: true }] } };
  const f = await fixture(); vm.plans = { '0-0': { ...E.emptyPlan(), moves: [{ turn: 1, forward: false }] } }; await vm.goHome(); await flush();
  Socket.current.push({ ...f.state, match: { ...f.state.match, round: 2, game: f.result.game } });
  await vm.enterOnlineBattle(); await flush(); assert.deepEqual(vm.plans, {});
});

afterAll(()=>wrapper.unmount());
