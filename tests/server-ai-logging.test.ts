import type {Game} from '../shared/game.ts';
import {requestFixture,historyFixture} from './helpers/ai-fixtures.ts';
import type {RequestFixture,LogFixture,ContextFixture} from './helpers/ai-fixtures.ts';
import type {ModelConfig} from '../server/types.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import { BinaryLike, createHash } from 'node:crypto';
import { AIService } from '../server/ai.ts';
import { createGame, emptyPlan } from '../src/engine.ts';


const model:ModelConfig={ id: 'test', name: 'Test', model: 'provider-model', baseURL: 'https://example.test/v1', apiKey: 'secret-test', protocol: 'responses', timeoutMs: 1000, reasoning_effort: 'high', fast: 'fast', maxOutputTokens: 8192, structuredOutput: true };
const game = () => { const g = createGame(); g.phase = 'plan'; return g; };
const orders = (g:Game) => ({ plans: Object.fromEntries(g.ships.filter((s) => s.team === 1).map((s) => [s.id, emptyPlan()])) });
const reply = (g: Game, fields = {}, headers = {}) => new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(orders(g)) }] }], ...fields }), { headers });
const digest = (text:string) => createHash('sha256').update(text).digest('hex');

test('Responses logging retains cache reads/writes, reasoning, provider billing and request identifiers without content', async () => {
  const g = game(), logs:LogFixture[] = []; let body!:RequestFixture,bodyText!:string;
  const service = new AIService({ models:[model], logger: { info: log => logs.push(log as LogFixture) }, fetchImpl: async (_, init) => {
    bodyText=String(init!.body);body=requestFixture(init);
    return reply(g, { id: 'resp_test_01', model: 'provider-model-20261001', created_at: 1791183600, service_tier: 'fast',
      usage: { input_tokens: 1000, output_tokens: 80, total_tokens: 1080, input_tokens_details: { cached_tokens: 700, cache_write_tokens: 200, private: 'PRIVATE_USAGE' }, output_tokens_details: { reasoning_tokens: 60 }, cost: 0.0001, currency: 'USD', cost_details: { upstream_inference_cost: 0.00009, private: 'PRIVATE_BILLING' } },
      pricing: { input_price: 0.2, output_price: 1, currency: 'USD', private: 'PRIVATE_PRICE' } }, { 'x-request-id': 'req_provider_01', 'openai-processing-ms': '31.5' });
  } });
  const history = [{...historyFixture(0),private:'PRIVATE_FULL_CONTEXT'}];
  assert.deepEqual(await service.generate({ game: g, team: 1, modelId: model.id, matchId: 'match_test_full', aiMode: 'full', history }), orders(g).plans);
  assert.equal(logs.length, 1);
  const log = logs[0];
  assert.equal(log.logVersion, 2);
  assert.equal(log.matchId, 'match_test_full');
  assert.equal(log.modelId, model.id); assert.equal(log.model, model.model);
  assert.equal(log.endpoint, 'https://example.test/v1/responses');
  assert.equal(log.round, g.round); assert.equal(log.team, 1); assert.equal(log.aiMode, 'full'); assert.equal(log.historyRounds, 1); assert.equal(log.attempt, 1);
  assert.match(log.generationId, /^[0-9a-f-]{36}$/); assert.match(log.requestId, /^[0-9a-f-]{36}$/);
  assert.equal(log.request.reasoningEffort, 'high'); assert.equal(log.request.serviceTier, 'fast');
  assert.equal(log.request.maxOutputTokens, 8192); assert.equal(log.request.structuredOutput, true); assert.equal(log.request.timeoutMs, 1000);
  assert.equal(log.request.bodyBytes, Buffer.byteLength(bodyText));
  assert.equal(log.request.context.messageCount, 2);
  assert.equal(log.request.context.bytes, Buffer.byteLength(JSON.stringify(body!.input)));
  assert.equal(log.request.context.sha256, digest(JSON.stringify(body!.input)));
  assert.equal(log.request.context.messages[1].sha256, digest(body!.input[1].content));
  assert.deepEqual(log.usage.input_tokens_details, { cached_tokens: 700, cache_write_tokens: 200 });
  assert.deepEqual(log.usage.output_tokens_details, { reasoning_tokens: 60 });
  assert.equal(log.providerBilling.usage.cost, 0.0001); assert.equal(log.providerBilling.usage.currency, 'USD');
  assert.equal(log.providerBilling.usage.cost_details.upstream_inference_cost, 0.00009);
  assert.equal(log.providerBilling.pricing.input_price, 0.2);
  assert.equal(log.response.requestId, 'req_provider_01'); assert.equal(log.response.id, 'resp_test_01');
  assert.equal(log.response.model, 'provider-model-20261001'); assert.equal(log.response.processingMs, 31.5);
  assert.equal(log.response.status, 'completed'); assert.equal(log.response.createdAt, 1791183600);
  assert.equal(log.response.output.sha256, digest(JSON.stringify(orders(g)))); assert(log.response.bodyBytes > 0);
  assert(Date.parse(log.finishedAt) >= Date.parse(log.startedAt));
  for (const secret of ['secret-test', 'PRIVATE_FULL_CONTEXT', 'PRIVATE_USAGE', 'PRIVATE_BILLING', 'PRIVATE_PRICE', body!.input[0].content, body!.input[1].content, JSON.stringify(orders(g))]) assert(!JSON.stringify(log).includes(secret));
});

test('Chat logging preserves DeepSeek cache and reasoning usage and leaves absent monetary billing unknown', async () => {
  const g = game(), logs:LogFixture[] = [];
  const service = new AIService({ models:[{ ...model, protocol: 'chat', fast: 'none' }], logger: { info: log => logs.push(log as LogFixture) }, fetchImpl: async () => new Response(JSON.stringify({ id: 'chatcmpl_test', model: 'deepseek-flash', created: 1791183600,
    choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(orders(g)), reasoning_content: 'PRIVATE_REASONING' } }],
    usage: { prompt_tokens: 1000, completion_tokens: 90, total_tokens: 1090, prompt_cache_hit_tokens: 800, prompt_cache_miss_tokens: 200, prompt_tokens_details: { cached_tokens: 800 }, completion_tokens_details: { reasoning_tokens: 70, accepted_prediction_tokens: 0, rejected_prediction_tokens: 0 } } })) });
  await service.generate({ game: g, team: 1, modelId: model.id });
  const log = logs[0];
  assert.equal(log.usage.prompt_cache_hit_tokens, 800); assert.equal(log.usage.prompt_cache_miss_tokens, 200);
  assert.deepEqual(log.usage.completion_tokens_details, { reasoning_tokens: 70, accepted_prediction_tokens: 0, rejected_prediction_tokens: 0 });
  assert.equal(log.providerBilling, null); assert.equal(log.request.serviceTier, null); assert.equal(log.serviceTier, null);
  assert.equal(log.matchId, null);
  assert.equal(log.response.finishReason, 'stop'); assert.equal(log.historyRounds, 0);
  assert(!JSON.stringify(log).includes('PRIVATE_REASONING'));
});

test('corrective API attempts share generation context but have distinct request IDs and full individual usage', async () => {
  const g = game(), logs:LogFixture[] = [], bodies = [];
  const service = new AIService({ models:[model], logger: { info: log => logs.push(log as LogFixture) }, fetchImpl: async (_, init) => {
    bodies.push(requestFixture(init));
    return reply(g, { output: [{ content: [{ type: 'output_text', text: bodies.length === 1 ? 'PRIVATE_INVALID_OUTPUT' : JSON.stringify(orders(g)) }] }], usage: { input_tokens: bodies.length * 100, output_tokens: 20, total_tokens: bodies.length * 100 + 20 } });
  } });
  await service.generate({ game: g, team: 1, modelId: model.id, matchId: 'match_retry' });
  assert.equal(logs.length, 2); assert.equal(logs[0].generationId, logs[1].generationId);
  assert(logs.every(log => log.matchId === 'match_retry'));
  assert.notEqual(logs[0].requestId, logs[1].requestId); assert.deepEqual(logs.map(log => log.attempt), [1, 2]);
  assert.deepEqual(logs.map(log => log.usage.input_tokens), [100, 200]);
  assert.equal(logs[1].request.context.messageCount, 3);
  assert.deepEqual(logs[0].request.context.messages, logs[1].request.context.messages.slice(0, 2));
  assert(!JSON.stringify(logs).includes('PRIVATE_INVALID_OUTPUT'));
});

test('truncated and HTTP-failed requests retain billable usage and safe failure metadata', async () => {
  const g = game();
  for (const status of [200, 429, 503]) {
    const logs:LogFixture[] = [];
    const service = new AIService({ models:[model], logger: { info: log => logs.push(log as LogFixture) }, fetchImpl: async () => new Response(JSON.stringify({ id: 'resp_failed', status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' }, error: { code: 'rate_limit_exceeded', type: 'rate_limit_error', message: 'secret-test PRIVATE_ERROR' },
      usage: { input_tokens: 20, output_tokens: 10, total_tokens: 30, output_tokens_details: { reasoning_tokens: 10 } } }), { status, headers: { 'x-request-id': 'req_failed' } }) });
    await assert.rejects(service.generate({ game: g, team: 1, modelId: model.id }), { code: status === 429 ? 'AI_RATE_LIMIT' : 'AI_UPSTREAM' });
    assert.equal(logs.length, 1); assert.equal(logs[0].status, status); assert.equal(logs[0].response.requestId, 'req_failed');
    assert.equal(logs[0].usage.output_tokens, 10); assert.equal(logs[0].response.incompleteReason, 'max_output_tokens');
    assert.equal(logs[0].response.error!.code, 'rate_limit_exceeded');
    assert(!JSON.stringify(logs).includes('PRIVATE_ERROR')); assert(!JSON.stringify(logs).includes('secret-test'));
  }
  const logs:LogFixture[] = [];
  const service = new AIService({ models:[model], logger: { info: log => logs.push(log as LogFixture) }, fetchImpl: async () => reply(g, { status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' }, usage: { input_tokens: 10, output_tokens: 8192, output_tokens_details: { reasoning_tokens: 8192 } } }) });
  await assert.rejects(service.generate({ game: g, team: 1, modelId: model.id }), { code: 'AI_TRUNCATED' });
  assert.equal(logs[0].outcome, 'AI_TRUNCATED'); assert.equal(logs[0].usage.output_tokens, 8192);
});

test('numeric usage and billing whitelists reject invalid values and provider metadata containing the API key', async () => {
  const g = game(), logs:LogFixture[] = [];
  const service = new AIService({ models:[model], logger: { info: log => logs.push(log as LogFixture) }, fetchImpl: async () => reply(g, {
    id: 'secret-test', model: 'secret-test', service_tier: 'PRIVATE_TIER', cost: 'secret-test', currency: 'PRIVATE_CURRENCY',
    usage: { input_tokens: 10, output_tokens: -1, total_tokens: '10', prompt_cache_hit_tokens: 9007199254740992, input_tokens_details: { cached_tokens: 0, cache_write_tokens: 'PRIVATE_VALUE', private: 999 }, output_tokens_details: { reasoning_tokens: -1 }, cost: -1, private: 'PRIVATE_USAGE' },
    billing: { amount: 0, currency: 'CNY', private: 'PRIVATE_BILLING' }, pricing: { input_price: null, output_price: 'PRIVATE_PRICE' } }, { 'x-request-id': 'secret-test', 'openai-processing-ms': 'PRIVATE_HEADER' }) });
  await service.generate({ game: g, team: 1, modelId: model.id });
  assert.deepEqual(logs[0].usage, { input_tokens: 10, input_tokens_details: { cached_tokens: 0 } });
  assert.deepEqual(logs[0].providerBilling, { billing: { amount: 0, currency: 'CNY' } });
  assert.equal(logs[0].response.id, null); assert.equal(logs[0].response.model, null); assert.equal(logs[0].response.requestId, null);
  assert.equal(logs[0].response.processingMs, null); assert.equal(logs[0].serviceTier, null);
  for (const secret of ['secret-test', 'PRIVATE_']) assert(!JSON.stringify(logs).includes(secret));
});

test('large FULL context is sent completely while the serialized request log stays bounded', async () => {
  const g = game(), logs:LogFixture[] = []; let body!:RequestFixture;
  const history = [{...historyFixture(0),text:'PRIVATE_HISTORY_' + '海'.repeat(350000) }];
  const service = new AIService({ models:[model], logger: { info: log => logs.push(log as LogFixture) }, fetchImpl: async (_, init) => { body = requestFixture(init); return reply(g); } });
  await service.generate({ game: g, team: 1, modelId: model.id, aiMode: 'full', history });
  assert.deepEqual(JSON.parse(body!.input[1].content).history, history);
  assert(logs[0].request.context.bytes > 1000000); assert(Buffer.byteLength(JSON.stringify(logs[0])) < 10000);
  assert(!JSON.stringify(logs[0]).includes('PRIVATE_HISTORY_'));
});

test('network failures still produce a request log and a failed logger never changes gameplay', async () => {
  const g = game(), logs:LogFixture[] = [];
  const broken = new AIService({ models:[model], logger: { info: log => logs.push(log as LogFixture) }, fetchImpl: async () => { throw new Error('PRIVATE_NETWORK_ERROR secret-test'); } });
  await assert.rejects(broken.generate({ game: g, team: 1, modelId: model.id }), { code: 'AI_NETWORK' });
  assert.equal(logs[0].outcome, 'AI_NETWORK'); assert.equal(logs[0].response, null); assert.equal(logs[0].providerBilling, null);
  assert.equal(logs[0].attempt, 1); assert(!JSON.stringify(logs).includes('PRIVATE_NETWORK_ERROR'));
  const healthy = new AIService({ models:[model], logger: { info: () => { throw new Error('log storage failed'); } }, fetchImpl: async () => reply(g) });
  assert.deepEqual(await healthy.generate({ game: g, team: 1, modelId: model.id }), orders(g).plans);
});

test('non-text Chat content still reaches corrective validation rather than failing in log fingerprinting', async () => {
  const g = game(), logs:LogFixture[] = []; let calls = 0;
  const service = new AIService({ models:[{ ...model, protocol: 'chat' }], logger: { info: log => logs.push(log as LogFixture) }, fetchImpl: async () => new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: ++calls === 1 ? { private: 'PRIVATE_NON_TEXT' } : JSON.stringify(orders(g)) } }] })) });
  assert.deepEqual(await service.generate({ game: g, team: 1, modelId: model.id }), orders(g).plans);
  assert.equal(calls, 2); assert.equal(logs[0].response.output, null); assert.equal(logs[1].attempt, 2);
  assert(!JSON.stringify(logs).includes('PRIVATE_NON_TEXT'));
});
