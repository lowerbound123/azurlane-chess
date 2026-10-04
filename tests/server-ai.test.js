import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AIService, loadModels, publicModels } from '../server/ai.js';
import { createGame, emptyPlan } from '../src/engine.js';

const model = { id: 'test', name: 'Test', model: 'provider-model', baseURL: 'https://example.test/v1', apiKey: 'secret-test', protocol: 'chat', timeoutMs: 1000 };
const game = () => { const g = createGame(); g.phase = 'plan'; return g; };
const orders = g => ({ plans: Object.fromEntries(g.ships.filter(s => s.team === 1).map(s => [s.id, emptyPlan()])) });
const chat = content => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(content) } }] });
const response = data => new Response(JSON.stringify(data), { status: 200 });
const generate = (service, g = game(), signal) => service.generate({ game: g, team: 1, modelId: 'test', signal });

test('model configuration reads secrets only from environment and exposes only id/name', () => {
  const dir = mkdtempSync(join(tmpdir(), 'fleet-ai-'));
  const path = join(dir, 'models.json');
  try {
    const entry = { model_id: 'a', name: 'A', url: 'https://example.test/v1' };
    writeFileSync(path, JSON.stringify([entry]));
    assert.deepEqual(loadModels({ configPath: path, env: {} }), []);
    const models = loadModels({ configPath: path, env: { A_API_KEY: 'private' } });
    assert.equal(models[0].apiKey, 'private');
    assert.deepEqual(publicModels(models), [{ id: 'a', name: 'A' }]);
    for (const bad of [{ ...entry, apiKey: 'inline' }, { ...entry, protocol: 'other' }, { ...entry, url: 'https://name:pass@example.test' }, { ...entry, timeoutMs: 60001 }]) {
      writeFileSync(path, JSON.stringify([bad]));
      assert.throws(() => loadModels({ configPath: path, env: {} }), { code: 'AI_CONFIG' });
    }
    assert.throws(() => loadModels({ configPath: join(dir, 'missing'), env: {} }), { code: 'AI_CONFIG' });
  } finally { rmSync(dir, { recursive: true }); }
});

test('chat completions sends private key only in header; fog-safe schema snapshot excludes enemy orders', async () => {
  const g = game(); g.humanOrders = { secret: 'human-order-secret' }; g.ships[0].secret = 'enemy-secret';
  let request;
  const service = new AIService({ models: [model], fetchImpl: async (url, init) => { request = { url, init }; return response(chat(orders(g))); } });
  assert.deepEqual(await generate(service, g), orders(g).plans);
  const body = JSON.parse(request.init.body);
  assert.equal(request.url, 'https://example.test/v1/chat/completions');
  assert.equal(request.init.headers.Authorization, 'Bearer secret-test');
  assert.equal(body.response_format.json_schema.strict, true);
  for (const secret of ['human-order-secret', 'enemy-secret', 'secret-test']) assert(!request.init.body.includes(secret));
  assert(!JSON.parse(body.messages[1].content).view.ships.some(s => s.team === 0));
});

test('Responses protocol handles structured and plain JSON without relying on SDK output_text helper', async () => {
  for (const structuredOutput of [true, false]) {
    const g = game(); let request;
    const service = new AIService({ models: [{ ...model, protocol: 'responses', structuredOutput }], fetchImpl: async (url, init) => {
      request = { url, body: JSON.parse(init.body) };
      return response({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(orders(g)) }] }] });
    } });
    assert.deepEqual(await generate(service, g), orders(g).plans);
    assert(request.url.endsWith('/responses'));
    assert.equal(Boolean(request.body.text), structuredOutput);
    assert(request.body.input.length === 2);
  }
});

test('invalid JSON or invalid orders gets one correction with same snapshot; repeated invalid fails', async () => {
  for (const first of [{ choices: [{ message: { content: 'not json' } }] }, chat({ plans: { intruder: emptyPlan() } })]) {
    const g = game(); const requests = [];
    const service = new AIService({ models: [model], fetchImpl: async (_, init) => { requests.push(JSON.parse(init.body)); return response(requests.length === 1 ? first : chat(orders(g))); } });
    assert.deepEqual(await generate(service, g), orders(g).plans);
    assert.equal(requests.length, 2);
    assert.deepEqual(requests[0].messages.slice(0, 2), requests[1].messages.slice(0, 2));
    assert.equal(requests[1].messages.length, 3);
  }
  let calls = 0;
  const service = new AIService({ models: [model], fetchImpl: async () => { calls++; return response(chat({ plans: { intruder: emptyPlan() } })); } });
  await assert.rejects(generate(service), { code: 'AI_INVALID' });
  assert.equal(calls, 2);
});

test('upstream refusal, truncation, 429, 5xx and malformed network errors fail explicitly without corrective retry or secret leakage', async () => {
  const cases = [
    [model, response({ choices: [{ message: { refusal: 'secret-test' } }] }), 'AI_REFUSAL'],
    [model, response({ choices: [{ finish_reason: 'length' }] }), 'AI_TRUNCATED'],
    [{ ...model, protocol: 'responses' }, response({ status: 'incomplete' }), 'AI_TRUNCATED'],
    [{ ...model, protocol: 'responses' }, response({ status: 'completed', output: [{ content: [{ type: 'refusal' }] }] }), 'AI_REFUSAL'],
    [model, { ok: false, status: 429 }, 'AI_RATE_LIMIT'],
    [model, { ok: false, status: 503 }, 'AI_UPSTREAM'],
    [model, response({ error: { message: 'secret-test' } }), 'AI_UPSTREAM'],
  ];
  for (const [configuration, reply, code] of cases) {
    let calls = 0;
    const service = new AIService({ models: [configuration], fetchImpl: async () => { calls++; return reply; } });
    await assert.rejects(generate(service), error => error.code === code && !error.message.includes('secret-test'));
    assert.equal(calls, 1);
  }
  const service = new AIService({ models: [model], fetchImpl: async () => { throw new Error('secret-test'); } });
  await assert.rejects(generate(service), error => error.code === 'AI_NETWORK' && !error.message.includes('secret-test'));
});

const pendingFetch = (_, { signal }) => new Promise((resolve, reject) => {
  const abort = () => reject(new Error('Aborted'));
  if (signal.aborted) abort(); else signal.addEventListener('abort', abort, { once: true });
});
test('request timeout and external cancellation release the concurrency slot', async () => {
  const timed = new AIService({ models: [{ ...model, timeoutMs: 10 }], fetchImpl: pendingFetch });
  await assert.rejects(generate(timed), { code: 'AI_TIMEOUT' });
  assert.equal(timed.active, 0);
  const cancelled = new AIService({ models: [model], fetchImpl: pendingFetch });
  const controller = new AbortController();
  const result = generate(cancelled, game(), controller.signal);
  controller.abort();
  await assert.rejects(result, { code: 'AI_ABORTED' });
  assert.equal(cancelled.active, 0);
});

test('concurrency limit is two, queue cancellation never dispatches, and queued snapshots are immutable', async () => {
  const g = game(); const waiting = [];
  const service = new AIService({ models: [model], fetchImpl: async (_, init) => new Promise(resolve => waiting.push({ resolve, body: JSON.parse(init.body) })) });
  const a = generate(service, g), b = generate(service, g);
  const controller = new AbortController();
  const c = generate(service, g, controller.signal);
  const d = generate(service, g);
  g.round = 99;
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(waiting.length, 2);
  controller.abort();
  await assert.rejects(c, { code: 'AI_ABORTED' });
  waiting[0].resolve(response(chat(orders(g))));
  await a;
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(waiting.length, 3);
  assert.equal(JSON.parse(waiting[2].body.messages[1].content).view.round, 1);
  waiting[1].resolve(response(chat(orders(g)))); waiting[2].resolve(response(chat(orders(g))));
  await Promise.all([b, d]);
  assert.equal(service.active, 0);
});


test('missing own ships become empty plans without corrective request', async () => {
  let calls = 0;
  const service = new AIService({ models: [model], logger: null, fetchImpl: async () => { calls++; return response(chat({ plans: {} })); } });
  const g = game();
  assert.deepEqual(await generate(service, g), orders(g).plans);
  assert.equal(calls, 1);
});

test('corrective reasons and request metrics contain no provider secrets or raw content', async () => {
  const g = game(), logs = [], requests = [];
  const service = new AIService({ models: [model], logger: { info: log => logs.push(log) }, fetchImpl: async (_, init) => {
    requests.push(JSON.parse(init.body));
    return response(requests.length === 1
      ? { choices: [{ message: { content: 'PRIVATE_PROVIDER_ERROR' } }], usage: { prompt_tokens: 4, completion_tokens: 3, private: 'SECRET_USAGE' } }
      : { ...chat(orders(g)), usage: { prompt_tokens: 5, completion_tokens: 8, total_tokens: 13 } });
  } });
  await generate(service, g);
  assert(requests[1].messages[2].content.includes('Invalid JSON syntax'));
  assert(!requests[1].messages[2].content.includes('PRIVATE_PROVIDER_ERROR'));
  assert.equal(logs.length, 2);
  assert.deepEqual(logs[1].usage, { total_tokens: 13, prompt_tokens: 5, completion_tokens: 8 });
  assert(logs.every(log => log.status === 200 && log.latencyMs >= 0));
  for (const secret of ['secret-test', 'PRIVATE_PROVIDER_ERROR', 'SECRET_USAGE']) assert(!JSON.stringify(logs).includes(secret));
});

test('response body cap cancels oversized streams, with and without content-length', async () => {
  for (const contentLength of [true, false]) {
    const service = new AIService({ models: [model], logger: null, fetchImpl: async () => new Response('x'.repeat(1024 * 1024 + 1), {
      headers: contentLength ? { 'content-length': String(1024 * 1024 + 1) } : {},
    }) });
    await assert.rejects(generate(service), { code: 'AI_RESPONSE_SIZE' });
    assert.equal(service.active, 0);
  }
});

test('multiple model entries derive distinct environment keys and preserve display names', () => {
  const dir=mkdtempSync(join(tmpdir(),'fleet-model-list-')),path=join(dir,'models.json');
  try {
    const entries=[{url:'https://api.deepseek.com',model_id:'deepseek-flash',name:'小肥鱼'},{url:'https://example.test/v1',model_id:'second.model',name:'第二位对手',protocol:'responses'}];
    writeFileSync(path,JSON.stringify({models:entries}));
    const models=loadModels({configPath:path,env:{DEEPSEEK_FLASH_API_KEY:'first-secret',SECOND_MODEL_API_KEY:'second-secret'}});
    assert.deepEqual(publicModels(models),[{id:'deepseek-flash',name:'小肥鱼'},{id:'second.model',name:'第二位对手'}]);
    assert.equal(models[0].apiKey,'first-secret');assert.equal(models[1].apiKey,'second-secret');assert.equal(models[1].protocol,'responses');
    assert.equal(models[0].model,'deepseek-flash');assert.equal(models[0].structuredOutput,false);
    writeFileSync(path,JSON.stringify([...entries,{...entries[0],model_id:'deepseek_flash'}]));
    assert.throws(()=>loadModels({configPath:path,env:{}}),{code:'AI_CONFIG'});
  } finally {rmSync(dir,{recursive:true});}
});

test('shipped default list enables Little Fat Fish with only its environment key', () => {
  const models=loadModels({configPath:new URL('../config/ai-models.example.json',import.meta.url),env:{DEEPSEEK_FLASH_API_KEY:'test-key'}});
  assert.deepEqual(publicModels(models),[{id:'deepseek-flash',name:'小肥鱼'}]);
  assert.equal(models[0].baseURL,'https://api.deepseek.com');
});
