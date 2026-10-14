import type {Response as InjectResponse} from 'light-my-request';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server/app.ts';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { FastifyInstance,FastifyBaseLogger } from 'fastify';
import { Server,IncomingMessage,ServerResponse } from 'node:http';

const origin = 'http://localhost:3000';
const options = { requireBuild: false, protocolVersion:2,models:[], authEnabled: true, authDbPath: ':memory:', authCookieSecure: false, allowedOrigins: [origin] };
const post = (app: Awaited<ReturnType<typeof createApp>>, url: string, payload = {}, cookie?:string) => app.inject({ method: 'POST', url, payload, headers: { origin, ...(cookie ? { cookie } : {}) } });
const cookieOf = (response:InjectResponse) => String(response.headers['set-cookie']??'').split(';')[0];
const signup = (app: Awaited<ReturnType<typeof createApp>>, username = '指挥官', password = ' ') => post(app, '/api/auth/register', { username, password, confirmPassword: password });

test('disabled accounts reject mutations and history without creating a database or blocking guests', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'chess-auth-off-'));
  const database = path.join(dir, 'accounts.sqlite');
  const app = await createApp({ ...options, authEnabled: false, authDbPath: database });
  try {
    assert.equal((await app.inject('/api/config')).json().auth.enabled, false);
    for (const url of ['/api/auth/login', '/api/auth/register']) {
      const response = await post(app, url);
      assert.equal(response.statusCode, 403);
      assert.equal(response.json().code, 'AUTH_DISABLED');
      assert.equal(response.headers['set-cookie'], undefined);
    }
    assert.equal((await app.inject('/api/me/matches')).statusCode, 403);
    assert.deepEqual((await app.inject('/api/auth/me')).json(), { user: null });
    assert.equal((await post(app, '/api/session', { nickname: '访客' })).statusCode, 200);
    assert.match(String((await post(app,'/api/auth/logout')).headers['set-cookie']), /Max-Age=0/);
    assert.equal(existsSync(database), false);
  } finally { await app.close(); await rm(dir, { recursive: true }); }
});

test('registration preserves unrestricted passwords, sets private cookies and normalizes unique usernames', async () => {
  const app = await createApp(options);
  try {
    const response = await signup(app, '  舰长A  ');
    assert.equal(response.statusCode, 201, response.body);
    assert.deepEqual(Object.keys(response.json().user).sort(), ['id', 'username']);
    assert.equal(response.json().user.username, '舰长A');
    assert.match(String(response.headers['set-cookie']), /HttpOnly/);
    assert.match(String(response.headers['set-cookie']), /SameSite=Lax/);
    assert.match(String(response.headers['set-cookie']), /Max-Age=2592000/);
    const cookie = cookieOf(response);
    assert.equal((await app.inject({ url: '/api/auth/me', headers: { cookie } })).json().user.id, response.json().user.id);
    assert.equal((await signup(app, '舰长a', 'x')).statusCode, 409);
    assert.equal((await post(app, '/api/auth/login', { username: '舰长a', password: ' ' })).statusCode, 200);
    const wrong = await post(app, '/api/auth/login', { username: '舰长a', password: '' });
    assert.equal(wrong.statusCode, 400);
    const denied = await post(app, '/api/auth/login', { username: '舰长a', password: 'wrong' });
    assert.equal(denied.statusCode, 401);
    assert.equal(denied.json().message, '用户名或密码错误');
    for (const [i, password] of ['1', '中🔑', ' x ', 'a'.repeat(200)].entries()) {
      assert.equal((await signup(app, `玩家${i}`, password)).statusCode, 201);
      assert.equal((await post(app, '/api/auth/login', { username: `玩家${i}`, password })).statusCode, 200);
    }
    assert.equal((await post(app, '/api/auth/register', { username: '确认', password: '1', confirmPassword: '2' })).statusCode, 400);
    await post(app, '/api/auth/logout', {}, cookie);
    assert.deepEqual((await app.inject({ url: '/api/auth/me', headers: { cookie } })).json(), { user: null });
    assert.equal((await app.inject({ url: '/api/me/matches', headers: { cookie } })).statusCode, 401);
  } finally { await app.close(); }
});

test('account routes reject untrusted origins, incorrect types and forged user IDs', async () => {
  const app = await createApp(options);
  try {
    for (const headers of [{}, { origin: 'https://evil.test' }]) {
      assert.equal((await app.inject({ method: 'POST', url: '/api/auth/register', headers, payload: { username: 'x', password: '1', confirmPassword: '1' } })).statusCode, 403);
    }
    for (const payload of [{ username: 'x', password: 1, confirmPassword: 1 }, { username: 'x\u0000', password: '1', confirmPassword: '1' }, { username: 'x', password: '1', confirmPassword: '1', userId: 'chosen' }]) {
      assert.equal((await post(app, '/api/auth/register', payload)).statusCode, 400);
    }
    const cookie = cookieOf(await signup(app));
    const session = await post(app, '/api/session', { nickname: '伪造昵称' }, cookie);
    assert.equal(session.json().nickname, '指挥官');
    assert.equal(session.json().identityType, 'account');
    assert.equal(session.json().accountId, (await app.inject({ url: '/api/auth/me', headers: { cookie } })).json().user.id);
    assert.equal((await post(app, '/api/session', { nickname: '伪造', accountId: 'x' }, cookie)).statusCode, 400);
    assert.equal((await app.inject({ url: '/api/me/matches/not-mine', headers: { cookie } })).statusCode, 404);
  } finally { await app.close(); }
});

test('accounts and sessions survive restart while expired sessions cannot authenticate', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'chess-auth-persist-'));
  const authDbPath = path.join(dir, 'accounts.sqlite');
  let now = 1_800_000_000_000, app = await createApp({ ...options, authDbPath, authNow: () => now });
  try {
    const result = await signup(app, '持久用户', 'p');
    assert.equal(result.statusCode, 201);
    const cookie = cookieOf(result), id = result.json().user.id;
    await app.close();
    app = await createApp({ ...options, authDbPath, authNow: () => now });
    assert.equal((await app.inject({ url: '/api/auth/me', headers: { cookie } })).json().user.id, id);
    now += 30 * 86400000 + 1;
    const expired = await app.inject({ url: '/api/auth/me', headers: { cookie } });
    assert.deepEqual(expired.json(), { user: null });
    assert.match(String(expired.headers['set-cookie']), /Max-Age=0/, 'remove expired cookie so the browser can establish a guest session');
    assert.equal((await post(app, '/api/session', { nickname: '恢复游客' })).statusCode, 200);
    assert.equal((await post(app, '/api/auth/login', { username: '持久用户', password: 'p' })).statusCode, 200);
    assert.equal((await app.inject('/data/accounts.sqlite')).statusCode, 404);
  } finally { await app.close(); await rm(dir, { recursive: true }); }
});

test('concurrent duplicate registration creates one account and login attempts are rate limited', async () => {
  const app = await createApp(options);
  try {
    const responses = await Promise.all([signup(app, '唯一', '1'), signup(app, '唯一', '2')]);
    assert.deepEqual(responses.map(x => x.statusCode).sort(), [201, 409]);
    let last;
    for (let i = 0; i < 11; i++) last = await post(app, '/api/auth/login', { username: '无此用户', password: 'p' });
    assert.equal(last!.statusCode, 429);
  } finally { await app.close(); }
});
