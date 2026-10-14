import Type from 'typebox';
import Value from 'typebox/value';
const RulesInput=Type.Object({id:Type.Optional(Type.String()),poolMode:Type.Union([Type.Literal('shared'),Type.Literal('independent')]),banTarget:Type.Union([Type.Literal('self'),Type.Literal('opponent')]),fleetLimits:Type.Optional(Type.Object({front:Type.Number(),back:Type.Number()})),steps:Type.Array(Type.Object({actor:Type.Union([Type.Literal('first'),Type.Literal('second')]),action:Type.Union([Type.Literal('pick'),Type.Literal('ban')]),count:Type.Number()}))});
const PoolInput=Type.Array(Type.String());
import type {DraftRules,DraftState} from "../shared/draft.ts";
import { SHIPS, getShip, shipStats } from './ship-catalog.ts';

// Rules describe turns, not UI slots. Actors are relative to the coin-toss winner.
export const DEFAULT_DRAFT_RULES:DraftRules = Object.freeze({
  id: 'independent-placeholder-v1', poolMode: 'independent', banTarget: 'opponent',
  fleetLimits: Object.freeze({ front: 3, back: 2 }),
  steps: Object.freeze([
    { actor: 'second', action: 'ban', count: 1 },
    { actor: 'first', action: 'pick', count: 1 }, { actor: 'first', action: 'ban', count: 1 },
    { actor: 'second', action: 'pick', count: 2 }, { actor: 'second', action: 'ban', count: 2 },
    { actor: 'first', action: 'pick', count: 2 }, { actor: 'first', action: 'ban', count: 2 },
    { actor: 'second', action: 'pick', count: 2 }, { actor: 'second', action: 'ban', count: 2 },
    { actor: 'first', action: 'pick', count: 2 }, { actor: 'first', action: 'ban', count: 2 },
    { actor: 'second', action: 'pick', count: 1 },
  ] as const),
});
function assert(ok:unknown,code:string,message:string):asserts ok {if(!ok)throw Object.assign(new Error(message),{code});}
export function createDraft(input:unknown=DEFAULT_DRAFT_RULES, pool:unknown=SHIPS.map(s=>s.id)){
 assert(Value.Check(RulesInput,input),'INVALID_RULES','选禁池规则无效');
 assert(Value.Check(PoolInput,pool),'INVALID_RULES','舰船池无效');
 const rules=input;
  assert(['shared', 'independent'].includes(rules?.poolMode) && ['self', 'opponent'].includes(rules?.banTarget), 'INVALID_RULES', '选禁池规则无效');
  assert(Array.isArray(pool) && pool.length > 0 && pool.every(id => typeof id === 'string' && getShip(id)) && new Set(pool).size === pool.length, 'INVALID_RULES', '舰船池无效');
  assert(Array.isArray(rules.steps) && rules.steps.length > 0 && rules.steps.every(s => s && typeof s === 'object' && ['first', 'second'].includes(s.actor) && ['pick', 'ban'].includes(s.action) && Number.isSafeInteger(s.count) && s.count > 0), 'INVALID_RULES', '选禁步骤无效');
  const fleetLimits = rules.fleetLimits ?? DEFAULT_DRAFT_RULES.fleetLimits;
  assert((['front', 'back'] as const).every(role => Number.isSafeInteger(fleetLimits?.[role]) && fleetLimits[role] >= 0), 'INVALID_RULES', '阵容配额无效');
  const fleetSize = fleetLimits.front + fleetLimits.back;
  const consumed = [0, 0], picks = [0, 0];
  for (const step of rules.steps) {
    const actor = step.actor === 'first' ? 0 : 1;
    const target = step.action === 'ban' && rules.banTarget === 'opponent' ? 1 - actor : actor;
    consumed[target] += step.count;
    if (step.action === 'pick') picks[actor] += step.count;
  }
  assert(picks.every(n => n === fleetSize && n > 0 && n <= 9) && (rules.poolMode === 'shared' ? consumed[0] + consumed[1] <= pool.length : consumed.every(n => n <= pool.length)), 'INVALID_RULES', '选船数量须符合阵容配额，舰船池须足够且不超出部署容量');
  const draft:DraftState = { rules: structuredClone({ ...rules, fleetLimits }), pool: [...pool], status: 'guess', firstTeam: null, coin: null, stepIndex: 0, stepCount: 0, revision: 0, picks: [[], []], bans: [[], []], history: [], ready: [false, false] };
  assert(hasFleetCapacity(draft), 'INVALID_RULES', '舰船池无法满足双方前后排配额');
  return draft;
}
// Independent pools reserve each side's role supply separately. Shared pools
// must reserve the sum of both deficits from the same remaining catalog.
function hasFleetCapacity(draft: DraftState) {
  return (['front', 'back'] as const).every(role => {
    const needed = draft.picks.map(ids => draft.rules.fleetLimits[role] - ids.filter(id => shipStats(id).role === role).length);
    if (needed.some(n => n < 0)) return false;
    const available = (team: number) => {
      const unavailable = draftUnavailable(draft, team);
      return draft.pool.filter(id => shipStats(id).role === role && !unavailable.has(id)).length;
    };
    return draft.rules.poolMode === 'shared'
      ? available(0) >= needed[0] + needed[1]
      : needed.every((n, team) => available(team) >= n);
  });
}
export function draftActionError(draft: DraftState, team: number, shipId: string) {
  const turn = currentDraftTurn(draft);
  if (!turn || turn.team !== team) return { code: 'WRONG_TURN', message: '当前不是你的选禁回合' };
  if (!draft.pool.includes(shipId) || draftUnavailable(draft, turn.targetTeam).has(shipId)) return { code: 'SHIP_UNAVAILABLE', message: '该舰船已被选择、禁用或不存在' };
  if (turn.action === 'pick') {
    const role = shipStats(shipId).role;
    if (draft.picks[team].filter(id => shipStats(id).role === role).length >= draft.rules.fleetLimits[role]) return { code: 'INVALID_FLEET', message: `${role === 'front' ? '前排' : '后排'}配额已满` };
  }
  const next = { ...draft, picks: draft.picks.map(ids => [...ids]), bans: draft.bans.map(ids => [...ids]) };
  next[turn.action === 'pick' ? 'picks' : 'bans'][turn.targetTeam].push(shipId);
  if (!hasFleetCapacity(next)) return { code: 'FLEET_UNAVAILABLE', message: '此操作会导致无法凑齐前后排编队，请选择其他舰船' };
  return null;
}
export function currentDraftTurn(draft: DraftState) {
  if (draft.status !== 'draft') return null;
  const step = draft.rules.steps[draft.stepIndex];
  const team = step.actor === 'first' ? draft.firstTeam! : 1 - draft.firstTeam!;
  return { ...step, team, targetTeam: step.action === 'ban' && draft.rules.banTarget === 'opponent' ? 1 - team : team, remaining: step.count - draft.stepCount };
}
export function draftUnavailable(draft: DraftState, targetTeam: number) {
  return new Set(draft.rules.poolMode === 'shared'
    ? [...draft.picks.flat(), ...draft.bans.flat()]
    : [...draft.picks[targetTeam], ...draft.bans[targetTeam]]);
}
export function guessFirst(draft: DraftState, team: number, guess: number, face: number, revision: number) {
  assert(revision === draft.revision, 'STALE_DRAFT', '选禁进度已更新，请重试');
  assert(draft.status === 'guess' && team === 0, 'WRONG_TURN', '等待第一位玩家猜先');
  assert([0, 1].includes(guess) && [0, 1].includes(face), 'INVALID_GUESS', '请选择硬币正面或反面');
  const next = structuredClone(draft);
  next.coin = { guess, face }; next.firstTeam = guess === face ? 0 : 1;
  next.status = 'draft'; next.revision++; return next;
}
export function actDraft(draft: DraftState, team: number, shipId: string, revision: number) {
  assert(revision === draft.revision, 'STALE_DRAFT', '选禁进度已更新，请重试');
  const error = draftActionError(draft, team, shipId);
  if (error) assert(false, error.code, error.message);
  const turn = currentDraftTurn(draft)!;
  const next = structuredClone(draft);
  next[turn.action === 'pick' ? 'picks' : 'bans'][turn.targetTeam].push(shipId);
  next.history.push({ team, targetTeam: turn.targetTeam, action: turn.action, shipId, stepIndex: draft.stepIndex });
  next.revision++; next.stepCount++;
  if (next.stepCount === turn.count) { next.stepIndex++; next.stepCount = 0; }
  if (next.stepIndex === next.rules.steps.length) next.status = 'complete';
  return next;
}
export function confirmDraft(draft: DraftState, team: number, revision: number) {
  assert(revision === draft.revision, 'STALE_DRAFT', '选禁进度已更新，请重试');
  assert(draft.status === 'complete' && [0, 1].includes(team) && !draft.ready[team], 'WRONG_STAGE', '选禁完成后才能确认编队');
  const next = structuredClone(draft); next.ready[team] = true; next.revision++; return next;
}
