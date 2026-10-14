import type {Match,StoredMatch} from './types.ts';
import type {RoundResult} from '../shared/game.ts';
import { createCombatStatsTracker } from '../src/combat-stats.ts';

export function initializeMatchStats(match:Match) {
  match.combatStats = createCombatStatsTracker(match.game!.ships).stats;
  match.roundsResolved = 0;
}

export function accumulateRoundStats(match:Match, result:RoundResult) {
  for (const [id, stats] of Object.entries(result.combatStats || {})) {
    const total = match.combatStats[id];
    if (!total) continue;
    for (const key of ['damageDealt', 'friendlyDamage', 'shipsSunk', 'planesShotDown'] as const) total[key] += stats[key];
    for (const key of ['enemy', 'friendly', 'environment'] as const) total.damageTaken[key] += stats.damageTaken[key];
    for (const [source, damage] of Object.entries(stats.damageBySource || {})) {
      for (const key of ['dealt', 'friendly', 'taken'] as const) total.damageBySource[source][key] += damage[key];
    }
  }
  match.roundsResolved++;
}

const freeze = <T>(value:T):T => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

export function snapshotMatch(match:Match, endStage:string):StoredMatch {
  return freeze({
    id: match.id, mode: match.mode, battleMode:match.battleMode??'annihilation',...(match.game?.domination?{domination:structuredClone(match.game.domination)}:{}), modelId: match.modelId,
    createdAt: match.created, endedAt: match.endedAt, durationMs: Math.max(0, match.endedAt - match.created),
    rounds: match.roundsResolved || 0, endStage, enteredBattle: !!match.game,
    winner: match.result!.winner, reason: match.result!.reason,
    participants: match.seats.map((seat, team) => ({
      team, accountId: seat.accountId, nickname: seat.nickname,
      roster: [...(!match.game && match.draft ? match.draft.picks[team] : seat.roster)],
      ships: (match.game?.ships || []).filter(s => s.team === team).map(ship => ({
        id: ship.id, catalogId: ship.catalogId, name: ship.label, template: ship.template,
        ...structuredClone(match.combatStats[ship.id]), hp: ship.hp, maxHp: ship.cfg.hp, alive: ship.hp > 0,
      })),
    })),
  });
}
