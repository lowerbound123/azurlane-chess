import { readFileSync } from 'node:fs';
import { playerView, validateOrders } from './views.js';

const failure = (code, message) => Object.assign(new Error(message), { code });
export function loadModels({ env = process.env, configPath } = {}) {
  const path = configPath || env.AI_MODELS_FILE || 'config/ai-models.json';
  let parsed;
  try { parsed = JSON.parse(readFileSync(path, 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT' && !configPath && !env.AI_MODELS_FILE) return [];
    throw failure('AI_CONFIG', '无法读取 AI 模型配置文件');
  }
  const entries = Array.isArray(parsed) ? parsed : parsed.models;
  if (!Array.isArray(entries)) throw failure('AI_CONFIG', 'AI 模型配置必须是数组');
  const ids = new Set();
  return entries.map(entry => {
    const { id, name, model, baseURL, protocol = 'chat', secretEnvName, structuredOutput = true, timeoutMs = 60000, maxOutputTokens = 4096 } = entry || {};
    let url;
    try { url = new URL(baseURL); } catch { throw failure('AI_CONFIG', 'AI 服务地址无效'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash ||
        ![id, name, model, secretEnvName].every(x => typeof x === 'string' && x.trim()) ||
        !/^[A-Za-z_][A-Za-z0-9_]*$/.test(secretEnvName) || ids.has(id) || !['chat', 'responses'].includes(protocol) ||
        typeof structuredOutput !== 'boolean' || !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000 ||
        !Number.isInteger(maxOutputTokens) || maxOutputTokens < 1 || maxOutputTokens > 32768 ||
        Object.keys(entry).some(k => !['id','name','model','baseURL','protocol','secretEnvName','structuredOutput','timeoutMs','maxOutputTokens'].includes(k))) {
      throw failure('AI_CONFIG', 'AI 模型配置字段无效或重复');
    }
    ids.add(id);
    return { id, name, model, baseURL: baseURL.replace(/\/$/, ''), protocol, structuredOutput, timeoutMs, maxOutputTokens, apiKey: env[secretEnvName] };
  }).filter(model => typeof model.apiKey === 'string' && model.apiKey.trim());
}
export const publicModels = models => models.map(({ id, name }) => ({ id, name }));

const object = properties => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const hex = object({ q: { type: 'integer' }, r: { type: 'integer' } });
const array = items => ({ type: 'array', items });
const plan = object({
  moves: array(object({ turn: { type: 'integer', enum: [-1, 0, 1] }, forward: { type: 'boolean' } })),
  torps: array(object({ window: { type: 'integer', minimum: 0 }, dir: { type: 'integer', minimum: 0, maximum: 5 } })),
  main: array(hex),
  planes: array({ anyOf: [object({ mode: { type: 'string', enum: ['point'] }, target: hex }), object({ mode: { type: 'string', enum: ['target'] }, targetId: { type: 'string' } })] }),
  sweep: { anyOf: [hex, { type: 'null' }] },
});
const RULES = `You command one fleet in a simultaneous-order hex naval game. Return ONLY JSON {"plans":{"own-ship-id":{"moves":[],"torps":[],"main":[],"planes":[],"sweep":null}}}. Include each living own ship. Never issue enemy orders. No commentary, markdown or extra keys.
The supplied player view is all information available to you; unseen cells/enemies remain unknown. Do not infer hidden map mines or enemy orders. There are no human orders in this snapshot. Choose orders independently. Teams commit simultaneously, then the server simulates the round. At round 30 victory compares surviving ships, then HP. Destroy the enemy fleet while preserving yours.
Coordinates are axial q,r; rectangular bounds use c=q+floor(r/2), 0<=c<map.width, 0<=r<map.height. Directions 0..5 are [(1,0),(0,1),(-1,1),(-1,0),(0,-1),(1,-1)]. Distance=max(abs(dq),abs(dr),abs(dq+dr)). Islands block movement and line of sight; unexplored map is unknown.
Capabilities come from each ship.cfg, not its class label. moves has at most cfg.speed steps. Each step turns -1/0/+1 first (heading modulo 6), then moves one hex if forward=true; turning in place still costs a full step. A shorter route stops early. Avoid islands, known mines and crossing friendly routes: collisions damage and stop ships and may roll routes back.
torps is available only with cfg.torpedo. Each entry {window,dir}: window=0 is round start, window=k is after k movement steps, so 0<=window<=moves.length. One torpedo per window, at most min(ship.torps,cfg.torpedo.max) per round. Only broadside launch: dir must differ from route-node heading and opposite heading ((heading+3)%6). Torpedoes travel straight at configured speed, survive configured life, stop at islands and damage friendly as well as enemy ships; unreached windows cancel. Reserve is finite.
main uses coordinate targets in bounds within cfg.main.range of START position. Only if mainReady<=round; at most cfg.main.shots shots. Duplicate coordinates allowed. Shells hit at END of round; lead moving targets. Reload skips cfg.main.reload following rounds. main is unavailable without cfg.main.
Secondary guns and anti-air work automatically using cfg.secondary/cfg.aa. sweep is null or one known mine hex within secondary range and line of sight from START; sweep sacrifices ALL secondary attacks this round but not main. Contact-sweeping ships can clear touched mines safely.
planes exists only for carriers: at most min(cfg.carrier.launch, number of airReady slots non-null and <=round) launches. null airReady means unavailable/airborne. {mode:'point',target:{q,r}} flies toward any in-bounds point and bombs first enemy crossed; {mode:'target',targetId:'id'} may lock only an enemy currently visible at round START. Aircraft move using cfg.carrier.plane, outbound range is limited; they return to moving mother, then rearm. AA hits before bombing; multiple AA ships can destroy a plane before its attack. Avoid dense AA. No ability to command already airborne aircraft.
Use empty arrays/null for unused capabilities. Obey reserve, readiness, movement, targeting and bounds rules exactly.`;

const MAX_RESPONSE_BYTES = 1024 * 1024;
async function boundedJSON(response) {
  if (Number(response.headers?.get('content-length')) > MAX_RESPONSE_BYTES) {
    await response.body?.cancel();
    throw failure('AI_RESPONSE_SIZE', 'AI 服务响应超过 1 MiB 限制');
  }
  const reader = response.body?.getReader();
  if (!reader) throw failure('AI_NETWORK', 'AI 服务返回空响应');
  let size = 0; const chunks = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw failure('AI_RESPONSE_SIZE', 'AI 服务响应超过 1 MiB 限制');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw failure('AI_NETWORK', 'AI 服务响应不是有效 JSON'); }
}
const safeUsage = usage => Object.fromEntries(['input_tokens', 'output_tokens', 'total_tokens', 'prompt_tokens', 'completion_tokens']
  .filter(key => Number.isSafeInteger(usage?.[key]) && usage[key] >= 0).map(key => [key, usage[key]]));

export class AIService {
  constructor({ models = [], concurrency = 2, fetchImpl = globalThis.fetch, logger = console } = {}) {
    if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error('Invalid concurrency');
    this.models = models; this.concurrency = concurrency; this.fetchImpl = fetchImpl; this.logger = logger; this.active = 0; this.queue = [];
  }
  async acquire(signal) {
    if (signal?.aborted) throw failure('AI_ABORTED', 'AI 请求已取消');
    if (this.active < this.concurrency) { this.active++; return; }
    await new Promise((resolve, reject) => {
      const entry = { resolve: () => { signal?.removeEventListener('abort', abort); resolve(); } };
      const abort = () => { this.queue = this.queue.filter(item => item !== entry); reject(failure('AI_ABORTED', 'AI 请求已取消')); };
      signal?.addEventListener('abort', abort, { once: true }); this.queue.push(entry);
    });
  }
  release() { const next = this.queue.shift(); if (next) next.resolve(); else this.active--; }
  async generate({ game, team, modelId, signal }) {
    const model = this.models.find(item => item.id === modelId);
    if (!model) throw failure('AI_MODEL', '所选 AI 模型不可用');
    // Snapshot before queueing; never append private orders or retain cross-game history.
    const snapshot = structuredClone(game);
    const view = playerView(snapshot, team);
    const ownIds = view.ships.filter(ship => ship.team === team && ship.hp > 0).map(ship => ship.id);
    const schema = object({ plans: object(Object.fromEntries(ownIds.map(id => [id, plan]))) });
    const messages = [{ role: 'system', content: RULES }, { role: 'user', content: JSON.stringify({ team, view }) }];
    await this.acquire(signal);
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const output = await this.request(model, messages, schema, signal);
        let reason = 'Invalid JSON syntax';
        try {
          const parsed = JSON.parse(output);
          reason = 'Expected exactly one object field: plans';
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Object.keys(parsed).length !== 1 || !parsed.plans || typeof parsed.plans !== 'object' || Array.isArray(parsed.plans)) throw new Error('Invalid envelope');
          reason = 'Orders contain an unknown, enemy, or destroyed ship ID';
          if (Object.keys(parsed.plans).some(id => !ownIds.includes(id))) throw new Error('Invalid ship');
          reason = 'Orders violate movement, weapon readiness, targeting, bounds, or field rules described above';
          return validateOrders(snapshot, team, parsed.plans);
        } catch {
          if (attempt === 1) throw failure('AI_INVALID', 'AI 连续返回无效指令，请重试');
          messages.push({ role: 'user', content: `Validation error: ${reason}. Regenerate ONLY the required JSON from the SAME original snapshot with legal orders. Missing own ships receive empty plans. Do not add keys.` });
        }
      }
    } finally { this.release(); }
  }
  async request(model, messages, schema, outerSignal) {
    const controller = new AbortController(); let timedOut = false;
    const started = performance.now(); let status = null, outcome = 'ok', usage = {};
    const abort = () => controller.abort();
    outerSignal?.addEventListener('abort', abort, { once: true });
    if (outerSignal?.aborted) controller.abort();
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, model.timeoutMs ?? 60000);
    const format = { type: 'json_schema', name: 'fleet_orders', strict: true, schema };
    const responses = model.protocol === 'responses';
    const body = responses
      ? { model: model.model, input: messages, max_output_tokens: model.maxOutputTokens ?? 4096, ...(model.structuredOutput !== false ? { text: { format } } : {}) }
      : { model: model.model, messages, max_completion_tokens: model.maxOutputTokens ?? 4096, ...(model.structuredOutput !== false ? { response_format: { type: 'json_schema', json_schema: { name: format.name, strict: true, schema } } } : {}) };
    try {
      const response = await this.fetchImpl(`${model.baseURL}/${responses ? 'responses' : 'chat/completions'}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${model.apiKey}` }, body: JSON.stringify(body), signal: controller.signal, redirect: 'error' });
      status = response.status;
      if (!response.ok) { await response.body?.cancel(); throw failure(response.status === 429 ? 'AI_RATE_LIMIT' : 'AI_UPSTREAM', response.status === 429 ? 'AI 服务请求过多，请稍后重试' : `AI 服务请求失败（HTTP ${response.status}）`); }
      const data = await boundedJSON(response);
      usage = safeUsage(data?.usage);
      if (controller.signal.aborted) throw failure('AI_ABORTED', 'AI 请求已取消');
      if (data.error) throw failure('AI_UPSTREAM', 'AI 服务返回错误');
      if (responses) {
        if (data.status === 'incomplete') throw failure('AI_TRUNCATED', 'AI 输出未完成，请重试');
        if (data.status && data.status !== 'completed') throw failure('AI_UPSTREAM', 'AI 服务未完成请求');
        const content = (data.output || []).flatMap(item => item.content || []);
        if (content.some(item => item.type === 'refusal')) throw failure('AI_REFUSAL', 'AI 拒绝生成本回合指令');
        return content.filter(item => item.type === 'output_text').map(item => item.text).join('');
      }
      const choice = data.choices?.[0];
      if (choice?.message?.refusal || choice?.finish_reason === 'content_filter') throw failure('AI_REFUSAL', 'AI 拒绝生成本回合指令');
      if (choice?.finish_reason === 'length') throw failure('AI_TRUNCATED', 'AI 输出被截断，请重试');
      if (choice?.finish_reason && choice.finish_reason !== 'stop') throw failure('AI_UPSTREAM', 'AI 服务未完成请求');
      return choice?.message?.content ?? '';
    } catch (error) {
      outcome = controller.signal.aborted ? (timedOut ? 'AI_TIMEOUT' : 'AI_ABORTED') : (typeof error.code === 'string' && error.code.startsWith('AI_') ? error.code : 'AI_NETWORK');
      if (controller.signal.aborted) throw failure(timedOut ? 'AI_TIMEOUT' : 'AI_ABORTED', timedOut ? 'AI 请求超时，请重试' : 'AI 请求已取消');
      if (typeof error.code === 'string' && error.code.startsWith('AI_')) throw error;
      throw failure('AI_NETWORK', '无法连接 AI 服务或响应格式无效');
    } finally {
      clearTimeout(timer); outerSignal?.removeEventListener('abort', abort);
      // Whitelist numeric usage only; never log keys, prompts, responses or provider error text.
      try { this.logger?.info?.({ event: 'ai_request', protocol: model.protocol, status, outcome, latencyMs: Math.round(performance.now() - started), usage }); } catch { /* Logging must not alter gameplay. */ }
    }
  }
}
