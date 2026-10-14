import type {RecordShip,MatchRecord} from '../shared/network.ts';
import type {Identity,User} from '../shared/network.ts';
import {openWS} from './helpers/open-ws.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.ts';
import { GameService } from '../server/game-service.ts';
import * as E from '../src/engine.ts';
import { finishDraft } from './helpers/draft-match.ts';
import type { Player } from '../server/types.ts';

const origin = 'http://localhost:3000';
const settle = () => new Promise(resolve => setTimeout(resolve, 20));
async function setup() {
  let now = 1_800_000_000_000, sequence = 0;
  const service = new GameService({ autoTick: false, now: () => now, models:[{ id: 'test-ai', name: '测试AI' }],
    ai: { generate: async () => ({}) }, pool: { resolve: async (game, orders) => E.resolveRound(game, orders) }, logger: { error() {} } });
  const app = await createApp({ service, requireBuild: false, models:[{id:'test-ai',name:'测试AI',model:'test-ai',protocol:'chat',baseURL:'https://example.test',apiKey:'fixture'}],authEnabled: true,
    authDbPath: ':memory:', authCookieSecure: false, authNow: () => now, allowedOrigins: [origin] });
  const users:{cookie?:string;user?:User;session:Identity;messages:Record<string,unknown>[];p:Player}[] = [];
  const post = (url: string, payload = {}, cookie?:string) => app.inject({ method: 'POST', url, payload, headers: { origin, ...(cookie ? { cookie } : {}) } });
  const createUser = async (name:string, account = true) => {
    let cookie:string|undefined,user:User|undefined;
    if (account) {
      const r = await post('/api/auth/register', { username: name, password: '1', confirmPassword: '1' });
      assert.equal(r.statusCode, 201, r.body); cookie = String(r.headers['set-cookie']).split(';')[0]; user = r.json().user;
    }
    const r = await post('/api/session', { nickname: name }, cookie); assert.equal(r.statusCode, 200, r.body);
    const session = r.json<Identity>(), messages:Record<string,unknown>[] = [], send = (x:Record<string,unknown>) => messages.push(x);
    const auth = cookie ? app.accounts.session(cookie.split('=')[1]) : null;
    const p = service.connect(session.token, send, () => {}, auth);
    const item = { cookie, user, session, messages, p }; users.push(item); return item;
  };
  const command = (team: number, type: string, payload = {}) => {
    const p = users[team].p, m = service.matches.get(p.match!);
    return service.command(p, { v:2, id: `test-${++sequence}`, type, payload, ...(m ? { matchId: m.id, round: m.game?.round ?? 0 } : {}) });
  };
  const pair = (mode = 'random') => {
    if (mode === 'random') { command(0, 'queue.join'); command(1, 'queue.join'); }
    else {
      const code = command(0, 'room.create', { turnSeconds: 0 }).data!.code;
      command(1, 'room.join', { code }); command(0, 'room.ready', { ready: true }); command(1, 'room.ready', { ready: true }); command(0, 'room.start');
    }
    return service.matches.get(users[0].p.match!);
  };
  const get = (url:string,cookie?:string) => app.inject({ url, headers: cookie ? { cookie } : {} });
  return { app, service, users, post, get, createUser, command, pair, advance:(ms:number) => now += ms, close: () => app.close() };
}

test('account websocket requires its own cookie and origin; reconnect retains one player', async () => {
  const h = await setup();
  try {
    const a = await h.createUser('甲'), b = await h.createUser('乙'); await h.app.ready();
    for (const headers of [{}, { origin, cookie: b.cookie }, { cookie: a.cookie }]) {
      const ws = await openWS(h.app,'/ws', { headers });
      const first = new Promise<Record<string,unknown>>(resolve => ws.once('message', raw => resolve(JSON.parse(raw.toString()))));
      ws.send(JSON.stringify({ v:2, type: 'auth', id: 'bad', token: a.session.token }));
      assert.equal((await first).type, 'error'); ws.terminate();
    }
    const ws = await openWS(h.app,'/ws', { headers: { origin, cookie: a.cookie } }), messages:Record<string,unknown>[] = [];
    ws.on('message', raw => messages.push(JSON.parse(raw.toString())));
    ws.send(JSON.stringify({ v:2, type: 'auth', id: 'good', token: a.session.token }));
    await settle(); assert.ok(messages.some(m => m.type === 'ack' && m.ok));
    assert.equal((await h.post('/api/session', { nickname: '另一名字' }, a.cookie)).json().playerId, a.session.playerId);
    ws.terminate();
    await h.post('/api/auth/logout', {}, a.cookie);
    assert.throws(() => h.service.connect(a.session.token, () => {}), { code: 'AUTH_SESSION_EXPIRED' });
  } finally { await h.close(); }
});

test('logged participant records a draft result once; guest and later login cannot claim it', async () => {
  const h = await setup();
  try {
    const a = await h.createUser('甲'), guest = await h.createUser('游客', false), m = h.pair();
    const later = await h.createUser('后来账号');
    assert.equal((await h.get('/api/me/matches', a.cookie)).json().items.length, 0);
    assert.equal((await h.post('/api/auth/logout', {}, a.cookie)).statusCode, 409);
    h.command(1, 'match.resign');
    const first = (await h.get('/api/me/matches', a.cookie)).json();
    assert.equal(first.items.length, 1);
    const summary = first.items[0];
    assert.equal(summary.id, m!.id); assert.equal(summary.mode, 'random'); assert.equal(summary.winner, 0);
    assert.equal(summary.enteredBattle, false); assert.equal(summary.endStage, 'draft'); assert.equal(summary.rounds, 0);
    assert.equal(summary.participants[1].nickname, guest.p.nickname); assert.equal(summary.participants[0].accountId, undefined);
    const detail = (await h.get(`/api/me/matches/${m!.id}`, a.cookie)).json();
    assert.deepEqual(detail.participants.map((s:MatchRecord["participants"][number]) => s.ships), [[], []]);
    h.advance(1000); h.service.end(m!, 1, '不可覆盖的重复结果');
    assert.deepEqual((await h.get('/api/me/matches', a.cookie)).json(), first);
    assert.equal((await h.get('/api/me/matches', later.cookie)).json().items.length, 0);
    assert.equal((await h.get(`/api/me/matches/${m!.id}`, later.cookie)).statusCode, 404);
    assert.equal(h!.service.view(a.p).match!.recordStatus, 'saved');
    assert.equal(h!.service.view(guest.p).match!.recordStatus, undefined);
  } finally { await h.close(); }
});

test('friend battle accumulates two authoritative rounds and exposes statistics only after completion', async () => {
  const h = await setup();
  try {
    const a = await h.createUser('甲'), b = await h.createUser('乙'), m = h.pair('friend');
    finishDraft(m, h.command);
    for (let team = 0; team < 2; team++) h.command(team, 'deploy.update', { ready: true, positions: m!.game!.ships.filter(s => s.team === team).map(s=> ({ id: s.id, pos: s.pos })) });
    // Controlled battlefield, still resolved by the real engine through valid commands.
    for (const s of m!.game!.ships) {
      delete s.cfg.secondary; delete s.cfg.aa;
      s.pos = { q: s.team ? 14 : 0, r: Number(s.id.split('-')[1]) * 3 }; s.xy = E.hexToXY(s.pos);
    }
    const attacker = m!.game!.ships.find(s=> s.id === '0-0'), target = m!.game!.ships.find(s=> s.id === '1-0');
    attacker!.pos = { q: 3, r: 5 }; target!.pos = { q: 5, r: 5 };
    attacker!.xy = E.hexToXY(attacker!.pos); target!.xy = E.hexToXY(target!.pos); attacker!.cfg.secondary = { damage: 7, range: 3, multi:false };
    const startingHP = target!.hp;
    for (let i = 0; i < 2; i++) {
      h.command(0, 'orders.submit', { plans: {} }); h.command(1, 'orders.submit', { plans: {} }); await settle();
      assert.equal(m!.stage, 'playback');
      assert.ok(!JSON.stringify(h.service.view(a.p)).includes('damageDealt'));
      assert.ok(!a.messages.some(message => message.type === 'round' && JSON.stringify(message).includes('combatStats')));
      h.advance(100000); h.service.tick();
    }
    h.command(1, 'match.resign');
    const detail = (await h.get(`/api/me/matches/${m!.id}`, a.cookie)).json();
    assert.equal(detail.mode, 'friend'); assert.equal(detail.rounds, 2); assert.equal(detail.enteredBattle, true);
    assert.equal(detail.participants[0].ships.find((s:RecordShip) => s.id === attacker!.id).damageDealt, 14);
    assert.equal(detail.participants[0].ships.find((s:RecordShip) => s.id === attacker!.id).damageBySource.secondary.dealt, 14);
    const savedTarget = detail.participants[1].ships.find((s:RecordShip) => s.id === target!.id);
    assert.equal(savedTarget.damageTaken.enemy, 14); assert.equal(savedTarget.hp, startingHP - 14);
    assert.equal(savedTarget.damageBySource.secondary.taken, 14);
    assert.equal(detail.myTeam, 0); assert.equal((await h.get(`/api/me/matches/${m!.id}`, b.cookie)).json().myTeam, 1);
    assert.equal((await h.get('/api/me/matches', b.cookie)).json().items.length, 1);
  } finally { await h.close(); }
});

test('pure guest matches do not persist; online AI, timeouts and aborted matches retain distinct results', async () => {
  const guest = await setup();
  try {
    await guest.createUser('游客甲', false); await guest.createUser('游客乙', false);
    const m = guest.pair(); guest.command(0, 'match.resign');
    assert.equal(guest!.app.accounts.store!.db.prepare('SELECT count(*) AS n FROM matches').get()!.n, 0);
    assert.equal(m!.recordStatus, undefined);
  } finally { await guest.close(); }
  const h = await setup();
  try {
    const a = await h.createUser('甲'); await h.createUser('乙');
    h.command(0, 'ai.start', { modelId: 'test-ai' }); let m = h.service.matches.get(a.p.match!); h.command(0, 'match.resign');
    let record = (await h.get(`/api/me/matches/${m!.id}`, a.cookie)).json();
    assert.equal(record.mode, 'ai'); assert.equal(record.modelId, 'test-ai'); assert.equal(record.participants[1].nickname, '测试AI');
    h.command(0, 'match.leave'); m = h.pair(); h.advance(120001); h.service.tick();
    record = (await h.get(`/api/me/matches/${m!.id}`, a.cookie)).json(); assert.equal(record.winner, 1); assert.match(record.reason, /超时/);
    h.command(0, 'match.leave'); h.command(1, 'match.leave'); m = h.pair(); h.service.end(m!, null, '服务器结算失败，对局中止');
    assert.equal((await h.get(`/api/me/matches/${m!.id}`, a.cookie)).json().winner, null);
  } finally { await h.close(); }
});

test('failed persistence retries at 1, 5 and 30 seconds using one immutable terminal result', async () => {
  const h = await setup();
  try {
    const a = await h.createUser('甲'); await h.createUser('游客', false); const m = h.pair();
    const store = h.app.accounts.store;
    assert.equal(typeof store!.saveMatch, 'function');
    const original = store!.saveMatch.bind(store); let attempts = 0;
    store!.saveMatch = record => { if (++attempts < 4) throw new Error('disk unavailable'); return original(record); };
    h.command(1, 'match.resign'); assert.equal(m!.stage, 'ended'); assert.equal(m!.recordStatus, 'pending');
    h.advance(999); h.service.tick(); assert.equal(attempts, 1);
    h.advance(1); h.service.tick(); assert.equal(attempts, 2);
    h.advance(4000); h.service.tick(); assert.equal(attempts, 3);
    h.advance(25000); h.service.tick(); assert.equal(attempts, 4); assert.equal(m!.recordStatus, 'saved');
    h.service.tick(); assert.equal(attempts, 4);
    const saved = (await h.get(`/api/me/matches/${m!.id}`, a.cookie)).json(); assert.equal(saved.durationMs, 0); assert.equal(saved.winner, 0);
    original(m!.recordSnapshot!); assert.equal((await h.get('/api/me/matches', a.cookie)).json().items.length, 1);
    h.command(0, 'match.leave'); h.command(1, 'match.leave'); const failed = h.pair();
    store!.saveMatch = () => { throw new Error('permanent disk error'); }; h.command(0, 'match.resign');
    for (const delta of [1000, 4000, 25000]) { h.advance(delta); h.service.tick(); }
    assert.equal(failed!.recordStatus, 'failed');
  } finally { await h.close(); }
});

test('history paginates in stable order and does not accept invalid cursors', async () => {
  const h = await setup();
  try {
    const a = await h.createUser('甲'); await h.createUser('游客', false); const ids = [];
    for (let i = 0; i < 22; i++) { h.advance(1); const m = h.pair(); ids.push(m!.id); h.command(0, 'match.resign'); h.command(0, 'match.leave'); h.command(1, 'match.leave'); }
    const page = (await h.get('/api/me/matches', a.cookie)).json(); assert.equal(page.items.length, 20); assert.equal(page.items[0].id, ids[21]);
    const next = (await h.get(`/api/me/matches?cursor=${page.nextCursor}`, a.cookie)).json();
    assert.deepEqual(next.items.map((m:MatchRecord) => m.id), [ids[1], ids[0]]); assert.equal(next.nextCursor, null);
    assert.equal((await h.get('/api/me/matches?cursor=invalid', a.cookie)).statusCode, 400);
  } finally { await h.close(); }
});

test('expired queued accounts are removed before pairing and cannot attach stale identity to a new match', async () => {
  const h = await setup();
  try {
    const a = await h.createUser('甲'); await h.createUser('游客', false);
    h.command(0, 'queue.join'); h.advance(30 * 86400000 + 1); h.command(1, 'queue.join');
    assert.equal(h.service.matches.size, 0); assert.equal(a.p.queued, false);
    assert.equal(h.users[1].p.queued, true); assert.ok(a.messages.some(m => m.code === 'AUTH_SESSION_EXPIRED'));
  } finally { await h.close(); }
});
