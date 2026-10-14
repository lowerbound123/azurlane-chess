import type { Ship, Contribution, CombatStats } from '../shared/game.ts';
// Round-local bookkeeping only. It must not be attached to saved games or live views.
const damageTypes = ['main', 'secondary', 'torpedo', 'air', 'collision', 'environment', 'grounding'];

export function createCombatStatsTracker(ships: Pick<Ship,"id"|"team"|"hp">[]) {
  const byId = new Map(ships.map(ship => [ship.id, ship]));
  const stats: Record<string,CombatStats> = Object.fromEntries(ships.map(ship => [ship.id, {
    damageDealt: 0,
    friendlyDamage: 0,
    damageTaken: { enemy: 0, friendly: 0, environment: 0 },
    shipsSunk: 0,
    planesShotDown: 0,
    damageBySource: Object.fromEntries(damageTypes.map(type => [type, { dealt: 0, friendly: 0, taken: 0 }])),
  }]));

  function damage(target:Pick<Ship,"id"|"team"|"hp">, hpBefore:number, contributions:Contribution[]|undefined, type:string) {
    const actual = hpBefore - target.hp;
    if (actual <= 0) return;
    const grouped = new Map<string|null,number>();
    for (const { sourceId, amount } of contributions || [{ sourceId: null, amount: actual }]) {
      if (amount > 0) grouped.set(sourceId, (grouped.get(sourceId) || 0) + amount);
    }
    const total = [...grouped.values()].reduce((sum, amount) => sum + amount, 0);
    if (!total) return;
    // Unknown types retain the existing totals without being mislabeled as a
    // known weapon or environment source. Every engine damage call names its type.
    const knownType = Object.hasOwn(stats[target.id].damageBySource, type);
    if (knownType) stats[target.id].damageBySource[type].taken += actual;

    // Main batteries retain the original combined HP deduction. Only its effective
    // damage is shared here, so overkill and the firing order cannot inflate totals.
    let winner:string|null = null, highest = -1;
    for (const [sourceId, amount] of grouped) {
      const source = sourceId === null ? undefined : byId.get(sourceId), share = actual * (amount / total);
      if (source) {
        const friendly = source.team === target.team;
        stats[sourceId!][friendly ? 'friendlyDamage' : 'damageDealt'] += share;
        stats[target.id].damageTaken[friendly ? 'friendly' : 'enemy'] += share;
        if (knownType) stats[sourceId!].damageBySource[type][friendly ? 'friendly' : 'dealt'] += share;
      } else {
        stats[target.id].damageTaken.environment += share;
      }
      if (amount > highest || amount === highest && String(sourceId) < String(winner)) {
        winner = sourceId;
        highest = amount;
      }
    }
    const source = winner === null ? undefined : byId.get(winner);
    if (target.hp === 0 && source && source.team !== target.team) stats[winner!].shipsSunk++;
  }

  return {
    stats,
    damage,
    shotDown(sourceId:string) { stats[sourceId!].planesShotDown++; },
  };
}
