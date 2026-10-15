import {effectiveSpeed} from '../shared/status.ts';
import type {ModelConfig,Logger,GenerateOptions} from './types.ts';
import type {Ship,Game,Hex,Plan,Plans} from '../shared/game.ts';
import type {ClientGame,ClientShip} from '../shared/network.ts';
import {planeForSlot} from '../src/ship-definitions.ts';
import {materializeObservation} from '../shared/network.ts';
import {isRecord,errorMessage} from '../src/lib/errors.ts';
import {projectRoot} from './paths.ts';
import path from 'node:path';
const codeOf=(error:unknown)=>isRecord(error)&&typeof error.code==='string'?error.code:null;
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { playerView, validateOrders } from './views.ts';
import { add, hexDist, hasLOS, inBounds, route, planAI } from '../src/engine.ts';
import { safeUsage, safeBilling, safeIdentifier, safeEndpoint, fingerprint, summarizeRequest, responseHeaders, summarizeResponse } from './ai-log.ts';

const failure = (code:string, message:string) => Object.assign(new Error(message), { code });
export function loadModels({ env = process.env, configPath }:{env?:NodeJS.ProcessEnv;configPath?:string|URL} = {}):ModelConfig[] {
  const filename = configPath || env.AI_MODELS_FILE || 'config/ai-models.json';
  let parsed:unknown;
  try { parsed = JSON.parse(readFileSync(filename, 'utf8')); }
  catch (error) {
    if (codeOf(error) === 'ENOENT' && !configPath && !env.AI_MODELS_FILE) parsed = JSON.parse(readFileSync(path.join(projectRoot,'config/ai-models.example.json'), 'utf8'));
    else throw failure('AI_CONFIG', '无法读取 AI 模型配置文件');
  }
  const entries = Array.isArray(parsed) ? parsed : isRecord(parsed)?parsed.models:undefined;
  if (!Array.isArray(entries)) throw failure('AI_CONFIG', 'AI 模型配置必须是数组');
  const ids = new Set();
  return entries.map((input:unknown):ModelConfig => {
    if(!isRecord(input))throw failure('AI_CONFIG','AI 模型配置字段无效或重复');const entry=input;
    const { model_id: id, name, url: baseURL, protocol = 'chat', structuredOutput = false, timeoutMs = 60000, maxOutputTokens = 4096, reasoning_effort = 'medium', fast = 'none' } = entry || {};
    const model = id;
    const secretEnvName = typeof id === 'string' ? id.toUpperCase().replace(/[^A-Z0-9_]/g, '_') + '_API_KEY' : '';
    let url;
    try { if(typeof baseURL!=='string')throw new Error();url = new URL(baseURL); } catch { throw failure('AI_CONFIG', 'AI 服务地址无效'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash ||
        typeof id!=='string'||!id.trim()||typeof name!=='string'||!name.trim()||typeof baseURL!=='string'||!baseURL.trim() ||
        !/^[A-Za-z_][A-Za-z0-9_]*$/.test(secretEnvName) || ids.has(secretEnvName) || (protocol!=='chat'&&protocol!=='responses') ||
        typeof structuredOutput !== 'boolean' || typeof timeoutMs!=='number'||!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 300000 ||
        typeof maxOutputTokens!=='number'||!Number.isInteger(maxOutputTokens) || maxOutputTokens < 1 || maxOutputTokens > 32768 ||
        typeof reasoning_effort !== 'string' || !reasoning_effort.trim() ||
        (fast!=='none'&&fast!=='fast') ||
        Object.keys(entry).some(k => !['model_id','name','url','protocol','structuredOutput','timeoutMs','maxOutputTokens','reasoning_effort','fast'].includes(k))) {
      throw failure('AI_CONFIG', 'AI 模型配置字段无效或重复');
    }
    ids.add(secretEnvName);
    return { id, name, model:id, baseURL: baseURL.replace(/\/$/, ''), protocol, structuredOutput, timeoutMs, maxOutputTokens, reasoning_effort, fast, apiKey: env[secretEnvName]??'' };
  }).filter(model => typeof model.apiKey === 'string' && model.apiKey.trim());
}
export const publicModels = (models:{id:string;name:string}[]) => models.map(({ id, name }) => ({ id, name }));

const object = (properties:Record<string,unknown>):Record<string,unknown> => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const hex = object({ q: { type: 'integer' }, r: { type: 'integer' } });
const array = (items:Record<string,unknown>, maxItems:number) => ({ type: 'array', items, maxItems });
function commandConstraints(ship:ClientShip, view:ClientGame, team:number) {
  const enemies = view.ships.filter(s => s.team !== team && s.hp > 0);
  const guide:CommandGuide = {
    canGuard:!!ship.cfg.guard,
    ...(view.ruleset?{skills:{minesLeft:ship.minesLeft??0,maxMines:ship.cfg.minelayer?.max??0,smokeLeft:ship.smokeLeft??0,radarLeft:ship.radarLeft??0,radarRange:ship.cfg.radar?.range??0,escort:ship.cfg.escort??null},readySlots:(ship.airReady??[]).flatMap((ready,slot)=>ready!==null&&ready<=view.round?[{slot,hp:ship.airHP?.[slot],cfg:ship.cfg.carrier?.slots?.[slot]??ship.cfg.carrier?.plane}]:[])}:{}),
    maxMoves: effectiveSpeed(ship,view.round),
    maxTorps: Math.min(ship.torps || 0, ship.cfg.torpedo?.max || 0),
    maxMain: ship.cfg.main && (ship.mainReady??Infinity) <= view.round ? ship.cfg.main.shots : 0,
    maxPlanes: Math.min(ship.cfg.carrier?.launch || 0, (ship.airReady || []).filter(n => n !== null && n <= view.round).length),
    visibleEnemyIds: enemies.map(s => s.id),
    firstMoves: [-1, 0, 1].flatMap(turn => [false, true].map(forward => ({ turn, forward })))
      .filter(move => route(materializeObservation({...view,ships:[ship]}).ships[0], { moves: [move] }, view.map,view.round).length === 2),
    mainTargetSuggestions: [],
    sweepTargets: view.map.mines.filter(h => ship.cfg.secondary && hexDist(ship.pos, h) <= ship.cfg.secondary.range && hasLOS(view.map, ship.pos, h)),
  };
  if (guide.maxMain) {
    const targets = enemies.flatMap(s => [s.pos, add(s.pos, s.heading)]);
    guide.mainTargetSuggestions = targets.filter((h, i) => inBounds(h,view.map) && hexDist(ship.pos, h) <= ship.cfg.main!.range && targets.findIndex(p => p.q === h.q && p.r === h.r) === i);
  }
  const point = object({ q: { type: 'integer', minimum: -Math.floor((view.map.height - 1) / 2), maximum: view.map.width - 1 }, r: { type: 'integer', minimum: 0, maximum: view.map.height - 1 } });
  const planeChoices:Record<string,unknown>[]=[];
  if(view.ruleset){for(const item of guide.readySlots??[]){const slot={type:'integer',enum:[item.slot]},role=item.cfg?.role??'bomber';planeChoices.push(object({slot,mode:{type:'string',enum:[role==='fighter'?'patrol':'point']},target:point}));if(enemies.length&&role!=='fighter'&&role!=='scout')planeChoices.push(object({slot,mode:{type:'string',enum:['target']},targetId:{type:'string',enum:guide.visibleEnemyIds}}));}}
  else {planeChoices.push(object({mode:{type:'string',enum:['point']},target:point}));if(enemies.length)planeChoices.push(object({mode:{type:'string',enum:['target']},targetId:{type:'string',enum:guide.visibleEnemyIds}}));}
  if(!planeChoices.length)planeChoices.push(object({slot:{type:'integer'},mode:{type:'string',enum:['point']},target:point}));
  const schema = object({
    ...(view.ruleset?{smoke:{type:'boolean',...(ship.smokeLeft?{}:{enum:[false]})},escort:{type:'boolean',...(ship.cfg.escort?{}:{enum:[false]})},mineSteps:array({type:'integer',minimum:1,maximum:effectiveSpeed(ship,view.round)},Math.min(ship.minesLeft??0,ship.cfg.minelayer?.max??0)),...(ship.radarLeft?{radar:{anyOf:[point,{type:'null'}]}}:{})}:{}),
    moves: array(object({ turn: { type: 'integer', enum: [-1, 0, 1] }, forward: { type: 'boolean' } }), guide.maxMoves),
    torps: array(object({ window: { type: 'integer', minimum: 0, maximum: guide.maxMoves }, dir: { type: 'integer', minimum: 0, maximum: 5 } }), guide.maxTorps),
    main: array(point, guide.maxMain),
    planes: array({ anyOf: planeChoices }, guide.maxPlanes),
    guard: guide.canGuard ? {type:'boolean'} : {type:'boolean',enum:[false]},
    sweep: guide.sweepTargets.length ? { anyOf: [hex, { type: 'null' }] } : { type: 'null' },
  });
  return { guide, schema };
}
const RULES = `You command one fleet in a simultaneous-order hex naval game. Return ONLY JSON {"plans":{"own-ship-id":{"moves":[],"torps":[],"main":[],"planes":[],"sweep":null,"guard":false}}}. Include each living own ship. Never issue enemy orders. No commentary, markdown or extra keys.
The supplied player view is all information available to you; unseen cells/enemies remain unknown. Do not infer hidden map mines or enemy orders. There are no human orders in this snapshot. Teams commit simultaneously, then the server simulates the round. Your task is ONLY to choose reasonable orders for the CURRENT round: preserve your fleet and attack visible opportunities. Do not simulate future rounds, enumerate hypothetical enemy orders, or search for a globally optimal plan.
Coordinates are axial q,r; rectangular bounds use c=q+floor(r/2), 0<=c<map.width, 0<=r<map.height. Directions 0..5 are [(1,0),(0,1),(-1,1),(-1,0),(0,-1),(1,-1)]. Distance=max(abs(dq),abs(dr),abs(dq+dr)). Islands block movement and line of sight; unexplored map is unknown.
Capabilities come from each ship.cfg, not its class label. moves has at most commandGuide.maxMoves steps; temporary statuses can change base cfg.speed. Status outgoingDamage/incomingDamage values are additive ratios and speed/vision are flat modifiers. Each step turns -1/0/+1 first (heading modulo 6), then moves one hex if forward=true; turning in place still costs a full step. A shorter route stops early. Avoid islands, known mines and crossing friendly routes: collisions damage and stop ships and may roll routes back.
torps is available only with cfg.torpedo. Each entry {window,dir}: window=0 is round start, window=k is after k movement steps, so 0<=window<=moves.length. Up to cfg.torpedo.perWindow (default 1) distinct directions per window, at most min(ship.torps,cfg.torpedo.max) per round. Only broadside launch: dir must differ from route-node heading and opposite heading ((heading+3)%6). Torpedoes travel straight at configured speed, survive configured life, stop at islands and damage friendly as well as enemy ships; unreached windows cancel. Reserve is finite.
main uses coordinate targets in bounds within cfg.main.range of START position. Only if mainReady<=round; at most cfg.main.shots shots. Duplicate coordinates allowed. Shells hit at END of round; lead moving targets. Reload skips cfg.main.reload following rounds. main is unavailable without cfg.main.
guard is true only with cfg.guard and MUST have moves=[]. It sacrifices ALL movement for THIS round, including turns in place: enemies already in the six adjacent hexes cannot move; entering enemies stop in their first adjacent hex. Allies and aircraft are unaffected. Only the guarding cruiser takes 60% less torpedo damage; cfg.guard.gunReduction reduces main and secondary gun damage if configured; aircraft damage is unaffected. Guard ends after this round. Use it to pin nearby enemies or brace for torpedoes, not while advancing.
Secondary guns and anti-air work automatically using cfg.secondary/cfg.aa. sweep is null or one known mine hex within secondary range and line of sight from START; sweep sacrifices ALL secondary attacks this round but not main. Contact-sweeping ships can clear touched mines safely.
planes exists only for carriers: at most min(cfg.carrier.launch, number of airReady slots non-null and <=round) launches. null airReady means unavailable/airborne. {mode:'point',target:{q,r}} flies toward any in-bounds point and bombs first enemy crossed; {mode:'target',targetId:'id'} may lock only an enemy currently visible at round START. For fleet-v1 each order MUST include an available unique slot from commandGuide.readySlots; use that slot cfg. Fighters must use patrol mode with target point, scouts point mode only; bombers/heavy use point or target. Fighters attack one enemy plane each round, patrol for one accumulated round then return; scouts do not bomb. Aircraft move using their slot config (legacy cfg.carrier.plane), outbound range is limited; they return to moving mother, then rearm. AA hits before bombing; multiple AA ships can destroy a plane before its attack. Avoid dense AA. No ability to command already airborne aircraft.
fleet-v1 extra orders: smoke=true only with smokeLeft>0, forbids torps this round and conceals seven cells for two rounds; radar={q,r} only with radarLeft>0 and START cfg.radar.range, reveals seven cells through smoke/islands for two rounds and excludes sweep/secondary; use radar:null when unused. escort=true only with cfg.escort, limits moves to cfg.escort.steps (1), protects adjacent OTHER allies against main/bombs, not self. mineSteps=[k] only with cfg.minelayer, k is a 1-based route node whose step moves forward; drop at its origin only on completion, capped by maxMines/minesLeft, arms next round and has friendly fire. Main blast affects neighbors including allies, centerMultiplier doubles center. Additional skills may be omitted. Never invent skills or spend exhausted charges. Smoke does not block AA; radar does not remove secondary LOS requirements.
Use commandGuide[shipId] as the precomputed current-round limits: zero means that weapon MUST be []. firstMoves lists legal FIRST steps only; if designing a new route, check later steps from their new positions. mainTargetSuggestions are legal visible-enemy starting/predicted points, not guaranteed hits. sweep may only select sweepTargets, otherwise null.
Each commandGuide supplies a legal suggestedPlan and suggestedRoute nodes with window, position, heading and torpedoDirs. COPY suggestedPlan as your default for each ship. Unchanged suggested orders need no repeated legality calculations. Review only currently visible threats and opportunities; modify a default only to address a concrete risk or a clearly better attack. Consider at most ONE alternative per ship. Uncertain enemy movement is not a reason to branch into multiple predictions: use current visible positions or the supplied target suggestions. If no clear improvement exists, keep the default and move on. Suggestions use only your current view; legal orders do not guarantee safe battle outcomes.
Validate only your changes and affected interactions: new routes must stay in bounds and avoid known islands; route changes require updated node headings and torpedo windows/directions, and a check for friendly route conflicts. Changed weapon orders must respect commandGuide counts/readiness, unique torpedo window/direction pairs, per-window count, windows <= actual moves.length and broadside at THAT node, START main range, visible targetIds and rectangular bounds. Do not recalculate unchanged routes or unavailable weapons. Preserve useful default movement and attacks; omit only newly proposed actions whose legality or benefit is uncertain.
Stop as soon as the fleet has legal, reasonable current-round orders. A good-enough plan is the goal; further optimization is unnecessary. Return the final compact JSON immediately, with no reasoning, commentary or repeated input. Obey all rules on the first response.`;

const DOMINATION_GUIDE = `Domination objective: control the public A/B/C capture areas (radius 2). Capture a neutral point after two effective round-end settlements with only your living ships inside; multiple ships do not speed capture. Empty neutral areas clear partial progress; both teams present freeze progress and block income. An enemy alone neutralizes an owned point and starts its own 50% progress. Owned points remain owned when empty. Newly captured points begin earning 5 points per round on the NEXT settlement. Every enemy ship sunk awards 15 points, regardless of damage source. Aircraft do not capture or score. Only final living ship positions after all damage and collision rollback count. Capture progress and scores are public region-level information; they never reveal hidden ship identities, exact positions, or orders. Reach 100 points to trigger the final comparison; at round 30 compare scores, then surviving ship count, then surviving HP. A sole surviving fleet wins even against a higher score. If both fleets sink, compare scores alone. Prefer useful safe routes toward neutral/enemy objectives and defend income or contest the opponent when feasible. Keep only visible enemy facts in targeting decisions; do not assume contested points reveal a legal target. The current view.domination contains public state; history uses the public state from each corresponding time. Pending settlement must not be inferred from future history.`;

const FULL_RULES = `FULL mode supplies history containing every completed round of THIS match in chronological order. Each entry has round, start, orders, observations, and end. These are the observations available to YOUR team at that time, not an omniscient replay. orders contains only your own committed plans for that round; collisions, destruction, or other game rules may have interrupted those plans. The observations and end state show what actually happened. No human private orders are supplied.
start/end contain compact player views. observations are chronological changes at time t: appeared/changed contain visible unit facts; lost means an enemy left the observable view, not confirmed destruction; removed means an own unit stopped appearing, which can include aircraft returning. A witnessed HP of zero is a confirmed loss. Unit positions are axial hexes. Missing fields in a change record do not grant new information. Previously observed positions and resources may now be stale; use the current view for current visibility, readiness, legal targets and planning. Learn from prior outcomes, but return orders ONLY for the current round.`;

const MAX_RESPONSE_BYTES = 1024 * 1024;
async function boundedJSON(response:Response, onBytes:(bytes:number)=>void = () => {}):Promise<unknown> {
  if (Number(response.headers?.get('content-length')) > MAX_RESPONSE_BYTES) {
    await response.body?.cancel();
    throw failure('AI_RESPONSE_SIZE', 'AI 服务响应超过 1 MiB 限制');
  }
  const reader = response.body?.getReader();
  if (!reader) throw failure('AI_NETWORK', 'AI 服务返回空响应');
  let size = 0; const chunks:Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      onBytes(size);
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
interface CommandGuide {skills?:Record<string,unknown>;readySlots?:{slot:number;hp?:number;cfg?:import('../shared/game.ts').PlaneConfig}[];canGuard:boolean;maxMoves:number;maxTorps:number;maxMain:number;maxPlanes:number;visibleEnemyIds:string[];firstMoves:{turn:number;forward:boolean}[];mainTargetSuggestions:Hex[];sweepTargets:Hex[];suggestedPlan?:Plan;suggestedRoute?:{window:number;pos:Hex;heading:number;torpedoDirs:number[]}[]}
interface Audit {generationId?:string;matchId?:string|null;round?:number;team?:number;aiMode?:string;historyRounds?:number;attempt?:number}
interface Message {role:string;content:string}
export class AIService {
  readonly models:ModelConfig[];readonly concurrency:number;readonly fetchImpl:typeof fetch;readonly logger:Logger|null;active:number;queue:{resolve:()=>void}[];

  constructor({ models = [], concurrency = 2, fetchImpl = globalThis.fetch, logger = console }:{models?:ModelConfig[];concurrency?:number;fetchImpl?:typeof fetch;logger?:Logger|null} = {}) {
    if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error('Invalid concurrency');
    this.models = models; this.concurrency = concurrency; this.fetchImpl = fetchImpl; this.logger = logger; this.active = 0; this.queue = [];
  }
  async acquire(signal?:AbortSignal) {
    if (signal?.aborted) throw failure('AI_ABORTED', 'AI 请求已取消');
    if (this.active < this.concurrency) { this.active++; return; }
    await new Promise<void>((resolve, reject) => {
      const entry = { resolve: () => { signal?.removeEventListener('abort', abort); resolve(); } };
      const abort = () => { this.queue = this.queue.filter(item => item !== entry); reject(failure('AI_ABORTED', 'AI 请求已取消')); };
      signal?.addEventListener('abort', abort, { once: true }); this.queue.push(entry);
    });
  }
  release() { const next = this.queue.shift(); if (next) next.resolve(); else this.active--; }
  async generate({ game, team, modelId, matchId = null, signal, aiMode = 'standard', history = [] }:GenerateOptions):Promise<Plans> {
    const model = this.models.find(item => item.id === modelId);
    if (!model) throw failure('AI_MODEL', '所选 AI 模型不可用');
    if (!['standard', 'full'].includes(aiMode)) throw failure('AI_MODE', 'AI 模式无效');
    // The match owns fog-filtered round memories. Snapshot them before queueing;
    // this shared provider service never retains any game's conversation state.
    const snapshot = structuredClone(game);
    const view = playerView(snapshot, team);
    const own = view.ships.filter(ship => ship.team === team && ship.hp > 0);
    const ownIds = own.map(ship => ship.id);
    const constraints = own.map(ship => [ship.id, commandConstraints(ship, view, team)] as const);
    // Navigate using only the supplied fog-filtered view. Restore the engine's
    // unavailable-slot representation without bringing any hidden state back.
    const navigationView = materializeObservation(structuredClone(view));
    
    const suggestions = planAI(navigationView, team);
    for (const [id, c] of constraints) {
      c.guide.suggestedPlan = suggestions[id];
      c.guide.suggestedRoute = route(navigationView.ships.find(ship=>ship.id===id)!, suggestions[id], view.map,view.round).map((node, window) => ({
        window, pos: node.pos, heading: node.heading,
        torpedoDirs: [0, 1, 2, 3, 4, 5].filter(d => d !== node.heading && d !== (node.heading + 3) % 6),
      }));
    }
    const schema = object({ plans: object(Object.fromEntries(constraints.map(([id, c]) => [id, c.schema]))) });
    const commandGuide = Object.fromEntries(constraints.map(([id, c]) => [id, c.guide]));
    const context = aiMode === 'full' ? { team, view, commandGuide, aiMode, history: structuredClone(history) } : { team, view, commandGuide };
    const messages = [{ role: 'system', content: RULES + (view.battleMode==='domination'?'\n'+DOMINATION_GUIDE:'') + (aiMode === 'full' ? '\n' + FULL_RULES : '') }, { role: 'user', content: JSON.stringify(context) }];
    const audit = { generationId: randomUUID(), matchId, round: snapshot.round, team, aiMode, historyRounds: aiMode === 'full' ? history.length : 0 };
    await this.acquire(signal);
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const output = await this.request(model, messages, schema, signal, { ...audit, attempt: attempt + 1 });
        let reason = 'Invalid JSON syntax';
        try {
          if(typeof output!=='string')throw new Error('Invalid text');
          const parsed:unknown = JSON.parse(output);
          reason = 'Expected exactly one object field: plans';
          if (!isRecord(parsed) || Object.keys(parsed).length !== 1 || !isRecord(parsed.plans)) throw new Error('Invalid envelope');
          reason = 'Orders contain an unknown, enemy, or destroyed ship ID';
          if (Object.keys(parsed.plans).some(id => !ownIds.includes(id))) throw new Error('Invalid ship');
          reason = 'Orders violate movement, weapon readiness, targeting, bounds, or field rules described above';
          const plans=parsed.plans;
          for (const id of ownIds.filter(id => Object.hasOwn(plans, id))) {
            try { validateOrders(snapshot, team, { [id]: plans[id] }); }
            catch { reason = `Invalid orders for own ship ${id}. Recheck its commandGuide limits, full route and torpedo node headings, START main range, visible targets and bounds`; throw new Error('Invalid ship plan'); }
          }
          return validateOrders(snapshot, team, parsed.plans);
        } catch {
          if (attempt === 1) throw failure('AI_INVALID', 'AI 连续返回无效指令，请重试');
          messages.push({ role: 'user', content: `Validation error: ${reason}. Regenerate ONLY the required JSON from the SAME original snapshot with legal orders. Missing own ships receive empty plans. Do not add keys.` });
        }
      }
    } finally { this.release(); }
    throw failure('AI_INVALID','AI 连续返回无效指令，请重试');
  }
  async request(model:ModelConfig, messages:Message[], schema:Record<string,unknown>, outerSignal?:AbortSignal, audit:Audit = {}):Promise<unknown> {
    const controller = new AbortController(); let timedOut = false;
    const started = performance.now(), startedAt = new Date().toISOString(), requestId = randomUUID();
    let status:number|null = null, outcome = 'ok', usage:Record<string,unknown> = {}, serviceTier:string|null = null, responseSummary:Record<string,unknown>|null = null, providerBilling:Record<string,unknown>|null = null;
    const abort = () => controller.abort();
    outerSignal?.addEventListener('abort', abort, { once: true });
    if (outerSignal?.aborted) controller.abort();
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, model.timeoutMs ?? 60000);
    const format = { type: 'json_schema', name: 'fleet_orders', strict: true, schema };
    const responses = model.protocol === 'responses';
    const reasoningEffort = model.reasoning_effort ?? 'medium';
    const body:Record<string,unknown> = responses
      ? { model: model.model, input: messages, reasoning: { effort: reasoningEffort }, max_output_tokens: model.maxOutputTokens ?? 4096, ...(model.structuredOutput !== false ? { text: { format } } : {}) }
      : { model: model.model, messages, reasoning_effort: reasoningEffort, max_completion_tokens: model.maxOutputTokens ?? 4096, ...(model.structuredOutput !== false ? { response_format: { type: 'json_schema', json_schema: { name: format.name, strict: true, schema } } } : {}) };
    if (model.fast === 'fast') body.service_tier = 'fast';
    const serialized = JSON.stringify(body), endpoint = `${model.baseURL}/${responses ? 'responses' : 'chat/completions'}`;
    const capture = (input:unknown) => {const data=isRecord(input)?input:{};
      usage = safeUsage(data?.usage);
      providerBilling = safeBilling(data, model.apiKey);
      responseSummary = { ...responseSummary, ...summarizeResponse(data, model.apiKey) };
      if (['auto', 'default', 'flex', 'scale', 'priority', 'fast', 'ultrafast'].includes(String(data.service_tier))) serviceTier = typeof data.service_tier==='string'?data.service_tier:null;
    };
    try {
      const response = await this.fetchImpl(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${model.apiKey}` }, body: serialized, signal: controller.signal, redirect: 'error' });
      status = response.status;
      responseSummary = responseHeaders(response, model.apiKey);
      const onBytes = (bytes:number) => { responseSummary!.bodyBytes = bytes; };
      if (!response.ok) {
        // Error responses can still contain usage or billing metadata. Preserve
        // it within the same size cap without exposing an upstream error body.
        try { capture(await boundedJSON(response, onBytes)); } catch { /* HTTP status remains authoritative. */ }
        throw failure(response.status === 429 ? 'AI_RATE_LIMIT' : 'AI_UPSTREAM', response.status === 429 ? 'AI 服务请求过多，请稍后重试' : `AI 服务请求失败（HTTP ${response.status}）`);
      }
      const value=await boundedJSON(response,onBytes);if(!isRecord(value))throw failure('AI_NETWORK','AI 服务响应格式无效');const data=value;
      capture(data);
      if (controller.signal.aborted) throw failure('AI_ABORTED', 'AI 请求已取消');
      if (data.error) throw failure('AI_UPSTREAM', 'AI 服务返回错误');
      if (responses) {
        if (data.status === 'incomplete') throw failure('AI_TRUNCATED', 'AI 输出未完成，请重试');
        if (data.status && data.status !== 'completed') throw failure('AI_UPSTREAM', 'AI 服务未完成请求');
        const content=(Array.isArray(data.output)?data.output:[]).flatMap(item=>isRecord(item)&&Array.isArray(item.content)?item.content:[]).filter(isRecord);
        if (content.some(item => item.type === 'refusal')) throw failure('AI_REFUSAL', 'AI 拒绝生成本回合指令');
        const output = content.filter(item => item.type === 'output_text').map(item => typeof item.text==='string'?item.text:'').join('');
        responseSummary!.output = fingerprint(output);
        return output;
      }
      const choices=Array.isArray(data.choices)?data.choices:[],choice=isRecord(choices[0])?choices[0]:{};const message=isRecord(choice.message)?choice.message:{};
      if (message.refusal || choice?.finish_reason === 'content_filter') throw failure('AI_REFUSAL', 'AI 拒绝生成本回合指令');
      if (choice?.finish_reason === 'length') throw failure('AI_TRUNCATED', 'AI 输出被截断，请重试');
      if (choice?.finish_reason && choice.finish_reason !== 'stop') throw failure('AI_UPSTREAM', 'AI 服务未完成请求');
      const output = message.content ?? '';
      responseSummary!.output = typeof output === 'string' ? fingerprint(output) : null;
      return output;
    } catch (error) {
      outcome = controller.signal.aborted ? (timedOut ? 'AI_TIMEOUT' : 'AI_ABORTED') : (codeOf(error)?.startsWith('AI_') ? codeOf(error)! : 'AI_NETWORK');
      if (controller.signal.aborted) throw failure(timedOut ? 'AI_TIMEOUT' : 'AI_ABORTED', timedOut ? 'AI 请求超时，请重试' : 'AI 请求已取消');
      if (codeOf(error)?.startsWith('AI_')) throw error;
      throw failure('AI_NETWORK', '无法连接 AI 服务或响应格式无效');
    } finally {
      clearTimeout(timer); outerSignal?.removeEventListener('abort', abort);
      // Keep every billable attempt; context and output use fingerprints rather
      // than text, and provider metadata is limited to safe, bounded fields.
      try { this.logger?.info?.({
        event: 'ai_request', logVersion: 2, ...audit, matchId: safeIdentifier(audit.matchId, model.apiKey), requestId,
        modelId: safeIdentifier(model.id, model.apiKey), model: safeIdentifier(model.model, model.apiKey),
        protocol: model.protocol, endpoint: safeEndpoint(endpoint, model.apiKey),
        startedAt, finishedAt: new Date().toISOString(), status,
        outcome: ['ok', 'AI_NETWORK', 'AI_TIMEOUT', 'AI_ABORTED', 'AI_RATE_LIMIT', 'AI_UPSTREAM', 'AI_RESPONSE_SIZE', 'AI_TRUNCATED', 'AI_REFUSAL'].includes(outcome) ? outcome : 'AI_NETWORK',
        latencyMs: Math.round(performance.now() - started),
        request: summarizeRequest(body, serialized, model), response: responseSummary,
        usage, serviceTier, providerBilling,
      }); } catch { /* Logging must not alter gameplay. */ }
    }
  }
}
