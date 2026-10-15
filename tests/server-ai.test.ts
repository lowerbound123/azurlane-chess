import type {Game,Plan} from '../shared/game.ts';

import {requestFixture,historyFixture} from './helpers/ai-fixtures.ts';
import type {RequestFixture,LogFixture,ContextFixture} from './helpers/ai-fixtures.ts';
import type {ModelConfig} from '../server/types.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AIService, loadModels, publicModels } from '../server/ai.ts';
import { createGame, emptyPlan } from '../src/engine.ts';
import {applyBattleStatus} from '../shared/status.ts';


const model:ModelConfig={ id: 'test', name: 'Test', model: 'provider-model', baseURL: 'https://example.test/v1', apiKey: 'secret-test', protocol: 'chat', timeoutMs: 1000 };
const game = () => { const g = createGame(); g.phase = 'plan'; return g; };
const orders = (g:Game) => ({ plans: Object.fromEntries(g.ships.filter((s) => s.team === 1).map((s) => [s.id, emptyPlan()])) });
const chat = (content:unknown) => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(content) } }] });
const response = (data:unknown) => new Response(JSON.stringify(data), { status: 200 });
const generate = (service: AIService, g = game(), signal:AbortSignal|undefined=undefined) => service.generate({ game: g, team: 1, modelId: 'test', signal });

test('AI movement guide and submitted schema use the effective speed at the current round',async()=>{
 const g=game();g.round=5;const ship=g.ships.find(s=>s.team===1&&s.template==='dd')!;
 applyBattleStatus(g,ship.id,{id:'test-speed',name:'航速测试',kind:'buff',icon:'up',description:'测试',effects:[{kind:'speed',value:1}]},{duration:1});
 let body!:RequestFixture;const service=new AIService({models:[model],logger:null,fetchImpl:async(_,init)=>{body=requestFixture(init);return response(chat(orders(g)));}});
 await generate(service,g);const context=JSON.parse(body.messages[1].content) as ContextFixture;
 assert.equal(context.commandGuide[ship.id].maxMoves,5);assert.equal(body.response_format.json_schema.schema.properties.plans.properties[ship.id].properties.moves.maxItems,5);assert.equal(ship.cfg.speed,4);
});

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
    for (const bad of [{ ...entry, apiKey: 'inline' }, { ...entry, protocol: 'other' }, { ...entry, url: 'https://name:pass@example.test' }, { ...entry, timeoutMs: 300001 }]) {
      writeFileSync(path, JSON.stringify([bad]));
      assert.throws(() => loadModels({ configPath: path, env: {} }), { code: 'AI_CONFIG' });
    }
    assert.throws(() => loadModels({ configPath: join(dir, 'missing'), env: {} }), { code: 'AI_CONFIG' });
  } finally { rmSync(dir, { recursive: true }); }
});

test('chat completions sends private key only in header; fog-safe schema snapshot excludes enemy orders', async () => {
  const g = game(); Reflect.set(g,'humanOrders',{secret:'human-order-secret'});Reflect.set(g.ships[0],'secret','enemy-secret');
  let request!:{url:string;init:RequestInit;body:RequestFixture};
  const service = new AIService({ models:[model], fetchImpl: async (url, init) => { request = {url:String(url),init:init!,body:requestFixture(init)}; return response(chat(orders(g))); } });
  assert.deepEqual(await generate(service, g), orders(g).plans);
  const body = requestFixture(request!.init);
  assert.equal(request!.url, 'https://example.test/v1/chat/completions');
  assert.equal(new Headers(request!.init.headers).get('Authorization'), 'Bearer secret-test');
  assert.equal(body.response_format.json_schema.strict, true);
  for (const secret of ['human-order-secret', 'enemy-secret', 'secret-test']) assert(!String(request!.init.body).includes(secret));
  assert(!JSON.parse(body.messages[1].content).view.ships.some((s:{team:number}) => s.team === 0));
});

test('Responses protocol handles structured and plain JSON without relying on SDK output_text helper', async () => {
  for (const structuredOutput of [true, false]) {
    const g = game(); let request!:{url:string;init:RequestInit;body:RequestFixture};
    const service = new AIService({ models:[{ ...model, protocol: 'responses', structuredOutput }], fetchImpl: async (url, init) => {
      request = {url:String(url),init:init!,body: requestFixture(init) };
      return response({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(orders(g)) }] }] });
    } });
    assert.deepEqual(await generate(service, g), orders(g).plans);
    assert(request!.url.endsWith('/responses'));
    assert.equal(Boolean(request!.body.text), structuredOutput);
    assert(request!.body.input.length === 2);
  }
});

test('invalid JSON or invalid orders gets one correction with same snapshot; repeated invalid fails', async () => {
  for (const first of [{ choices: [{ message: { content: 'not json' } }] }, chat({ plans: { intruder: emptyPlan() } })]) {
    const g = game(); const requests:RequestFixture[] = [];
    const service = new AIService({ models:[model], fetchImpl: async (_, init) => { requests.push(requestFixture(init)); return response(requests.length === 1 ? first : chat(orders(g))); } });
    assert.deepEqual(await generate(service, g), orders(g).plans);
    assert.equal(requests.length, 2);
    assert.deepEqual(requests[0].messages.slice(0, 2), requests[1].messages.slice(0, 2));
    assert.equal(requests[1].messages.length, 3);
  }
  let calls = 0;
  const service = new AIService({ models:[model], fetchImpl: async () => { calls++; return response(chat({ plans: { intruder: emptyPlan() } })); } });
  await assert.rejects(generate(service), { code: 'AI_INVALID' });
  assert.equal(calls, 2);
});

test('upstream refusal, truncation, 429, 5xx and malformed network errors fail explicitly without corrective retry or secret leakage', async () => {
  const cases:[ModelConfig,Response,string][] = [
    [model, response({ choices: [{ message: { refusal: 'secret-test' } }] }), 'AI_REFUSAL'],
    [model, response({ choices: [{ finish_reason: 'length' }] }), 'AI_TRUNCATED'],
    [{ ...model, protocol: 'responses' }, response({ status: 'incomplete' }), 'AI_TRUNCATED'],
    [{ ...model, protocol: 'responses' }, response({ status: 'completed', output: [{ content: [{ type: 'refusal' }] }] }), 'AI_REFUSAL'],
    [model,new Response(null,{status:429}), 'AI_RATE_LIMIT'],
    [model,new Response(null,{status:503}), 'AI_UPSTREAM'],
    [model, response({ error: { message: 'secret-test' } }), 'AI_UPSTREAM'],
  ];
  for (const [configuration, reply, code] of cases) {
    let calls = 0;
    const service = new AIService({ models:[configuration], fetchImpl: async () => { calls++; return reply; } });
    await assert.rejects(generate(service), error => (error as Error&{code:string}).code === code && !(error as Error).message.includes('secret-test'));
    assert.equal(calls, 1);
  }
  const service = new AIService({ models:[model], fetchImpl: async () => { throw new Error('secret-test'); } });
  await assert.rejects(generate(service), error => (error as Error&{code:string}).code === 'AI_NETWORK' && !(error as Error).message.includes('secret-test'));
});

const pendingFetch:typeof fetch=async(_,init)=>new Promise<Response>((_resolve,reject)=>{const signal=init?.signal;assert.ok(signal);const abort=()=>reject(new Error('Aborted'));if(signal.aborted)abort();else signal.addEventListener('abort',abort,{once:true});});
test('request timeout and external cancellation release the concurrency slot', async () => {
  const timed = new AIService({ models:[{ ...model, timeoutMs: 10 }], fetchImpl: pendingFetch });
  await assert.rejects(generate(timed), { code: 'AI_TIMEOUT' });
  assert.equal(timed.active, 0);
  const cancelled = new AIService({ models:[model], fetchImpl: pendingFetch });
  const controller = new AbortController();
  const result = generate(cancelled, game(), controller.signal);
  controller.abort();
  await assert.rejects(result, { code: 'AI_ABORTED' });
  assert.equal(cancelled.active, 0);
});

test('concurrency limit is two, queue cancellation never dispatches, and queued snapshots are immutable', async () => {
  const g = game(); const waiting:{resolve:(arg0:Response)=>void;body:RequestFixture}[] = [];
  const service = new AIService({ models:[model], fetchImpl: async (_, init) => new Promise(resolve => waiting.push({ resolve, body: requestFixture(init) })) });
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
  const service = new AIService({ models:[model], logger: null, fetchImpl: async () => { calls++; return response(chat({ plans: {} })); } });
  const g = game();
  assert.deepEqual(await generate(service, g), orders(g).plans);
  assert.equal(calls, 1);
});

test('corrective reasons and request metrics contain no provider secrets or raw content', async () => {
  const g = game(), logs:LogFixture[] = [], requests:RequestFixture[] = [];
  const service = new AIService({ models:[model], logger: { info: log => logs.push(log as LogFixture) }, fetchImpl: async (_, init) => {
    requests.push(requestFixture(init));
    return response(requests.length === 1
      ? { service_tier: 'SECRET_USAGE', choices: [{ message: { content: 'PRIVATE_PROVIDER_ERROR' } }], usage: { prompt_tokens: 4, completion_tokens: 3, private: 'SECRET_USAGE' } }
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
    const service = new AIService({ models:[model], logger: null, fetchImpl: async () => new Response('x'.repeat(1024 * 1024 + 1), {
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

test('reasoning_effort config defaults to medium and preserves explicit provider values without exposing them', () => {
  const dir = mkdtempSync(join(tmpdir(), 'fleet-ai-reasoning-'));
  const path = join(dir, 'models.json');
  const entry = { model_id: 'test', name: 'Test', url: 'https://example.test/v1' };
  try {
    for (const effort of [undefined, 'low', 'medium', 'high', 'none', 'xhigh']) {
      writeFileSync(path, JSON.stringify([{ ...entry, ...(effort === undefined ? {} : { reasoning_effort: effort }) }]));
      const models = loadModels({ configPath: path, env: { TEST_API_KEY: 'private' } });
      assert.equal(models[0].reasoning_effort, effort ?? 'medium');
      assert.deepEqual(publicModels(models), [{ id: 'test', name: 'Test' }]);
    }
  } finally { rmSync(dir, { recursive: true }); }
});

test('reasoning_effort config rejects empty, null and non-string values', () => {
  const dir = mkdtempSync(join(tmpdir(), 'fleet-ai-reasoning-invalid-'));
  const path = join(dir, 'models.json');
  try {
    for (const effort of ['', ' \t\n', null, false, 1, [], {}]) {
      writeFileSync(path, JSON.stringify([{ model_id: 'test', name: 'Test', url: 'https://example.test/v1', reasoning_effort: effort }]));
      assert.throws(() => loadModels({ configPath: path, env: { TEST_API_KEY: 'private' } }), { code: 'AI_CONFIG' });
    }
  } finally { rmSync(dir, { recursive: true }); }
});

const reasoningReply = (protocol: string, value:unknown) => protocol === 'responses'
  ? { status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] }
  : chat(value);
const assertReasoning = (body:RequestFixture, protocol: string, effort: string) => {
  if (protocol === 'responses') {
    assert.deepEqual(body.reasoning, { effort });
    assert.equal(Object.hasOwn(body, 'reasoning_effort'), false);
  } else {
    assert.equal(body.reasoning_effort, effort);
    assert.equal(Object.hasOwn(body, 'reasoning'), false);
  }
};

test('reasoning_effort defaults to medium for direct model requests in both protocols and AI modes', async () => {
  for (const protocol of ['chat', 'responses'] as const) {
    for (const aiMode of ['standard', 'full'] as const) {
      const g = game(), requests:RequestFixture[] = [];
      const service = new AIService({ models:[{ ...model, protocol }], logger: null, fetchImpl: async (_, init) => {
        requests.push(requestFixture(init));
        return response(reasoningReply(protocol, orders(g)));
      } });
      assert.deepEqual(await service.generate({ game: g, team: 1, modelId: model.id, aiMode }), orders(g).plans);
      assert.equal(requests.length, 1);
      assertReasoning(requests[0], protocol, 'medium');
    }
  }
});

test('reasoning_effort explicit values survive corrective retries in both protocols and AI modes', async () => {
  for (const protocol of ['chat', 'responses'] as const) {
    for (const aiMode of ['standard', 'full'] as const) {
      for (const effort of ['low', 'high']) {
        const g = game(), requests:RequestFixture[] = [];
        const service = new AIService({ models:[{ ...model, protocol, reasoning_effort: effort }], logger: null, fetchImpl: async (_, init) => {
          requests.push(requestFixture(init));
          return response(reasoningReply(protocol, requests.length === 1 ? { plans: { intruder: emptyPlan() } } : orders(g)));
        } });
        assert.deepEqual(await service.generate({ game: g, team: 1, modelId: model.id, aiMode }), orders(g).plans);
        assert.equal(requests.length, 2);
        for (const body of requests) assertReasoning(body, protocol, effort);
        const messages = requests.map(body => body.messages || body.input);
        assert.deepEqual(messages[0], messages[1].slice(0, 2));
        assert.equal(messages[1].length, 3);
      }
    }
  }
});

test('slow reasoning models accept explicit timeouts through five minutes while defaults stay one minute', () => {
  const dir = mkdtempSync(join(tmpdir(), 'fleet-ai-timeout-'));
  const path = join(dir, 'models.json');
  const entry = {model_id:'slow',name:'Slow',url:'https://example.test/v1'};
  try {
    writeFileSync(path, JSON.stringify([entry]));
    assert.equal(loadModels({configPath:path,env:{SLOW_API_KEY:'test'}})[0].timeoutMs, 60000);
    for (const timeoutMs of [180000, 300000]) {
      writeFileSync(path, JSON.stringify([{...entry,timeoutMs}]));
      assert.equal(loadModels({configPath:path,env:{SLOW_API_KEY:'test'}})[0].timeoutMs, timeoutMs);
    }
    for (const timeoutMs of [0, 300001, 1.5]) {
      writeFileSync(path, JSON.stringify([{...entry,timeoutMs}]));
      assert.throws(()=>loadModels({configPath:path,env:{SLOW_API_KEY:'test'}}),{code:'AI_CONFIG'});
    }
  } finally { rmSync(dir,{recursive:true}); }
});

test('per-ship command guide and schema constrain readiness and fog-safe target choices', async () => {
  const g = game(), own = g.ships.filter(s => s.team === 1);
  const gun = own.find(s => s.cfg.main), carrier = own.find(s => s.cfg.carrier);
  gun!.mainReady = g.round + 1;
  carrier!.airReady = carrier!.airReady.map(() => Infinity);
  let body!:RequestFixture;
  const service = new AIService({ models:[model], logger: null, fetchImpl: async (_, init) => {
    body = requestFixture(init); return response(chat(orders(g)));
  } });
  await generate(service, g);
  const context = (JSON.parse(body!.messages[1].content) as ContextFixture), schema = body!.response_format.json_schema.schema.properties.plans;
  assert.deepEqual(Object.keys(context.commandGuide), own.map(s => s.id));
  assert.equal(context.commandGuide[gun!.id].maxMain, 0);
  assert.equal(schema.properties[gun!.id].properties.main.maxItems, 0);
  assert.equal(schema.properties[carrier!.id].properties.planes.maxItems, 0);
  for (const s of own) {
    const guide = context.commandGuide[s.id], fields = schema.properties[s.id].properties;
    assert.equal(fields.moves.maxItems, s.cfg.speed);
    assert.equal(fields.torps.maxItems, Math.min(s.torps || 0, s.cfg.torpedo?.max || 0));
    assert.deepEqual(guide.visibleEnemyIds, context.view.ships.filter((e) => e.team !== 1 && e.hp > 0).map((e) => e.id));
    for (const move of guide.firstMoves) assert.equal(typeof move.forward, 'boolean');
    assert.deepEqual(fields.sweep, guide.sweepTargets.length ? fields.sweep : { type: 'null' });
  }
  assert.match(body!.messages[0].content, /commandGuide/);
});

test('command guide targets are legal from starting position and correction names invalid own ship', async () => {
  const g = game(), own = g.ships.filter(s => s.team === 1), gun = own.find(s => s.cfg.main);
  const enemy = g.ships.find(s => s.team === 0);
  enemy!.pos = { ...gun!.pos }; enemy!.xy = { ...gun!.xy };
  const requests:RequestFixture[] = [], broken = orders(g);
  broken.plans[gun!.id].main = [{ q: 999, r: 999 }];
  const service = new AIService({ models:[model], logger: null, fetchImpl: async (_, init) => {
    requests.push(requestFixture(init)); return response(chat(requests.length === 1 ? broken : orders(g)));
  } });
  await generate(service, g);
  const { commandGuide } = JSON.parse(requests[0].messages[1].content) as ContextFixture;
  assert(commandGuide[gun!.id].mainTargetSuggestions.some((h) => h.q === gun!.pos.q && h.r === gun!.pos.r));
  assert(commandGuide[gun!.id].visibleEnemyIds.includes(enemy!.id));
  assert(requests[1].messages[2].content.includes(`own ship ${gun!.id}`));
  const targetChoices = requests[0].response_format.json_schema.schema.properties.plans.properties[gun!.id].properties.planes.items.anyOf;
  assert.deepEqual(targetChoices.find((s) => s.properties.mode.enum[0] === 'target')!.properties.targetId.enum, commandGuide[gun!.id].visibleEnemyIds);
});

test('fog-only suggested plans give non-idle legal routes and valid torpedo node directions', async () => {
  const g = game(); let context!:ContextFixture;
  const service = new AIService({ models:[model], logger: null, fetchImpl: async (_, init) => {
    context = JSON.parse(requestFixture(init).messages[1].content);
    return response(chat({plans:Object.fromEntries(Object.entries(context.commandGuide).map(([id,c])=>[id,c.suggestedPlan]))}));
  } });
  const plans = await generate(service,g);
  assert(Object.values(plans).some(p=>p.moves.some((m)=>m.forward)));
  for (const [id,c] of Object.entries(context!.commandGuide)) {
    assert.equal(c.suggestedRoute.length,c.suggestedPlan.moves.length+1);
    for(const n of c.suggestedRoute){assert.equal(n.torpedoDirs.length,4);assert(!n.torpedoDirs.includes(n.heading));assert(!n.torpedoDirs.includes((n.heading+3)%6));}
    assert.deepEqual(plans[id],c.suggestedPlan);
  }
});

test('fast config defaults to none, accepts fast and rejects unsupported values', () => {
  const dir=mkdtempSync(join(tmpdir(),'fleet-fast-')),path=join(dir,'models.json');
  const entry={model_id:'a',name:'A',url:'https://example.test/v1'};
  const read=(fast:Record<string,unknown>)=>{writeFileSync(path,JSON.stringify([{...entry,...fast}]));return loadModels({configPath:path,env:{A_API_KEY:'private'}})[0];};
  try {
    assert.equal(read({}).fast,'none');
    assert.equal(read({fast:'none'}).fast,'none');
    assert.equal(read({fast:'fast'}).fast,'fast');
    for(const fast of [true,false,null,'','priority','invalid',1])assert.throws(()=>read({fast}),{code:'AI_CONFIG'});
  } finally {rmSync(dir,{recursive:true});}
});

test('fast is omitted by default and sent as service_tier in both protocols including corrections', async () => {
  for(const protocol of ['chat','responses'] as const)for(const fast of [undefined,'none','fast'] as const){
    const g=game(),requests:RequestFixture[]=[],logs:LogFixture[]=[];
    const service=new AIService({models:[{...model,protocol,fast}],logger:{info:m=>logs.push(m as LogFixture)},fetchImpl:async(_,init)=>{
      const body=requestFixture(init);requests.push(body);
      const text=requests.length===1?'invalid-json':JSON.stringify(orders(g));
      return response(protocol==='responses'?{status:'completed',service_tier:'fast',output:[{content:[{type:'output_text',text}]}]}:{service_tier:'fast',choices:[{finish_reason:'stop',message:{content:text}}]});
    }});
    await generate(service,g);
    assert.equal(requests.length,2);
    for(const body of requests){assert.equal(Object.hasOwn(body,'service_tier'),fast==='fast');if(fast==='fast')assert.equal(body.service_tier,'fast');assert(!Object.hasOwn(body,'fast'));}
    assert(logs.every(m=>m.serviceTier==='fast'));
  }
});
