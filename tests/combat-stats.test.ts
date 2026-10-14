import type {Game,Hex,Plan,Plane,RoundResult,Ship,ShipType} from '../shared/game.ts';

import assert from 'node:assert/strict';
import {test,afterAll,afterEach} from 'vitest';
import * as E from '../src/engine.ts';
import { createCombatStatsTracker } from '../src/combat-stats.ts';


const hex = (q: number, r = 5) => ({ q, r });
const ship = (type: ShipType, team: number, index: number, q: number, r = 5) => {
  const value = E.createShip(type, team, index, hex(q, r));
  delete value.cfg.secondary;
  delete value.cfg.aa;
  return value;
};
const game=(ships:Ship[],extra:Partial<Game>={}):Game=> ({
  seed: 1, round: 1, map: { width: E.W, height: E.H, islands: [], mines: [] },
  ships, torpedoes: [], planes: [], nextId: 0, log: [], winner: null, phase: 'plan', explored: [[],[]], ...extra,
});
const plan = (extra:Partial<Plan>={}) => ({ ...E.emptyPlan(), ...extra });
const forward = (count:number) => Array.from({ length: count }, () => ({ turn: 0, forward: true }));
const plane = (mother: Ship, pos: Hex, extra:Partial<Plane> = {}):Plane => ({
  id: 'p0', kind: 'plane', team: mother.team, mother: mother.id, slot: 0, hp: 2,
  cfg: { ...E.RULES.plane }, xy: E.hexToXY(pos), mode: 'point', target: pos,
  targetId: null, tracking: false, state: 'outbound', traveled: 0, waypoints: [], ...extra,
});
const stats = (result: RoundResult, id: string) => {
  assert.ok(result.combatStats, 'the round returns internal combat statistics');
  assert.ok(result.combatStats[id], 'every roster ship has a per-round entry');
  return result.combatStats[id];
};
const emptyStats = {
  damageDealt: 0, friendlyDamage: 0, damageTaken: { enemy: 0, friendly: 0, environment: 0 },
  shipsSunk: 0, planesShotDown: 0,
  damageBySource: {
    main: { dealt: 0, friendly: 0, taken: 0 },
    secondary: { dealt: 0, friendly: 0, taken: 0 },
    torpedo: { dealt: 0, friendly: 0, taken: 0 },
    air: { dealt: 0, friendly: 0, taken: 0 },
    collision: { dealt: 0, friendly: 0, taken: 0 },
    environment: { dealt: 0, friendly: 0, taken: 0 },
    grounding: { dealt: 0, friendly: 0, taken: 0 },
  },
};
const sourceTotals = (result: RoundResult, id: string, expected: { main?: { dealt: number; friendly: number; taken: number; }|{ dealt: number; friendly: number; taken: number; }|{ dealt: number; friendly: number; taken: number; }|{ dealt: number; friendly: number; taken: number; }|{ dealt: number; friendly: number; taken: number; }|{ dealt: number; friendly: number; taken: number; }|{ dealt: number; friendly: number; taken: number; }; environment?: { dealt: number; friendly: number; taken: number; }|{ dealt: number; friendly: number; taken: number; }; secondary?: { dealt: number; friendly: number; taken: number; }; torpedo?: { dealt: number; friendly: number; taken: number; }|{ dealt: number; friendly: number; taken: number; }; air?: { dealt: number; friendly: number; taken: number; }|{ dealt: number; friendly: number; taken: number; }; collision?: { dealt: number; friendly: number; taken: number; }|{ dealt: number; friendly: number; taken: number; }; grounding?: { dealt: number; friendly: number; taken: number; }; }) => assert.deepEqual(stats(result, id).damageBySource,
  { ...emptyStats.damageBySource, ...expected }, 'damage stays in its explicit source category');

test('round statistics contain capped effective damage, restart each round, and never mutate the game', () => {
  const a = ship('bb', 0, 0, 0), b = ship('cv', 1, 0, 5);
  const input = game([a, b]), copy = E.clone(input);
  const result = E.resolveRound(input, { [a.id]: plan({ main: [b.pos] }) });
  assert.equal(stats(result, a.id).damageDealt, 60);
  assert.deepEqual(stats(result, b.id).damageTaken, { enemy: 60, friendly: 0, environment: 0 });
  assert.deepEqual(input, copy);
  assert.equal(Object.hasOwn(result.game, 'combatStats'), false);
  assert.deepEqual(stats(E.resolveRound(result.game), a.id), emptyStats);
});

test('merged main battery damage is allocated by raw contribution and grouped by firing ship', () => {
  const a = ship('bb', 0, 0, 0), b = ship('bb', 0, 1, 1, 8), target = ship('cv', 1, 0, 5);
  target.hp = 90;
  const result = E.resolveRound(game([a, b, target]), {
    [a.id]: plan({ main: [target.pos, target.pos] }), [b.id]: plan({ main: [target.pos] }),
  });
  assert.equal(stats(result, a.id).damageDealt, 60);
  assert.equal(stats(result, b.id).damageDealt, 30);
  assert.equal(stats(result, target.id).damageTaken.enemy, 90);
  sourceTotals(result, a.id, { main: { dealt: 60, friendly: 0, taken: 0 } });
  sourceTotals(result, b.id, { main: { dealt: 30, friendly: 0, taken: 0 } });
  sourceTotals(result, target.id, { main: { dealt: 0, friendly: 0, taken: 90 } });
  assert.equal(stats(result, a.id).shipsSunk, 1);
  assert.equal(stats(result, b.id).shipsSunk, 0);
  assert.equal(result.events.filter(event => event.text.includes('遭主炮命中')).length, 1);
});

test('equal main battery contributions award sinking credit by stable ship id', () => {
  const a = ship('bb', 0, 0, 0), b = ship('bb', 0, 1, 1, 8), target = ship('cv', 1, 0, 5);
  target.hp = 45;
  const result = E.resolveRound(game([b, a, target]), {
    [a.id]: plan({ main: [target.pos] }), [b.id]: plan({ main: [target.pos] }),
  });
  assert.equal(stats(result, a.id).damageDealt, 22.5);
  assert.equal(stats(result, b.id).damageDealt, 22.5);
  assert.equal(stats(result, a.id).shipsSunk, 1);
  assert.equal(stats(result, b.id).shipsSunk, 0);
});

test('mixed friendly and enemy main battery contributions stay separate without friendly sinking credit', () => {
  const enemy = ship('bb', 0, 0, 0), friend = ship('bb', 1, 1, 1, 8), target = ship('cv', 1, 0, 5);
  target.hp = 90;
  const result = E.resolveRound(game([enemy, friend, target]), {
    [enemy.id]: plan({ main: [target.pos] }), [friend.id]: plan({ main: [target.pos, target.pos] }),
  });
  assert.equal(stats(result, enemy.id).damageDealt, 30);
  assert.equal(stats(result, friend.id).friendlyDamage, 60);
  assert.equal(stats(result, friend.id).damageDealt, 0);
  assert.deepEqual(stats(result, target.id).damageTaken, { enemy: 30, friendly: 60, environment: 0 });
  sourceTotals(result, enemy.id, { main: { dealt: 30, friendly: 0, taken: 0 } });
  sourceTotals(result, friend.id, { main: { dealt: 0, friendly: 60, taken: 0 } });
  sourceTotals(result, target.id, { main: { dealt: 0, friendly: 0, taken: 90 } });
  assert.equal(stats(result, enemy.id).shipsSunk, 0);
  assert.equal(stats(result, friend.id).shipsSunk, 0);
});

test('committed main battery shots retain credit after their firing ship sinks', () => {
  const a = ship('bb', 0, 0, 0), b = ship('cv', 1, 0, 5);
  a.hp = 1; b.hp = 40;
  const input = game([a, b]); input.map.mines = [a.pos];
  const result = E.resolveRound(input, { [a.id]: plan({ main: [b.pos] }) });
  assert.equal(result!.game.ships.find(value => value.id === a.id)!.hp, 0);
  assert.equal(stats(result, a.id).damageDealt, 40);
  assert.equal(stats(result, a.id).shipsSunk, 1);
  assert.equal(stats(result, a.id).damageTaken.environment, 1);
  sourceTotals(result, a.id, {
    main: { dealt: 40, friendly: 0, taken: 0 }, environment: { dealt: 0, friendly: 0, taken: 1 },
  });
});

test('simultaneous secondary battery shots retain both sources during mutual sinking', () => {
  const a = ship('dd', 0, 0, 3), b = ship('dd', 1, 0, 5);
  a.cfg.secondary = { damage: 8, range: 2, multi: false }; b.cfg.secondary = { damage: 8, range: 2, multi: false };
  a.hp = 4; b.hp = 4;
  const result = E.resolveRound(game([a, b]));
  for (const source of [a, b]) {
    assert.equal(stats(result, source.id).damageDealt, 4);
    assert.equal(stats(result, source.id).damageTaken.enemy, 4);
    assert.equal(stats(result, source.id).shipsSunk, 1);
    sourceTotals(result, source.id, { secondary: { dealt: 4, friendly: 0, taken: 4 } });
  }
});

for (const team of [0, 1]) {
  test(`torpedo owner retains capped ${team === 0 ? 'friendly' : 'enemy'} damage credit after sinking`, () => {
    const a = ship('dd', 0, 0, 0), target = ship('cv', team, 1, 5);
    a.hp = 0; target.hp = 20;
    const input = game([a, target]);
    input.torpedoes = [{ id: 't0', kind: 'torpedo', team: 0, owner: a.id, xy: E.hexToXY(target.pos),
      heading: 0, age: 0, launched: 0, birth: 0, armed: true, cfg: { ...E.RULES.torpedo, reserve:1,max:1 } }];
    const result = E.resolveRound(input), sourceStats = stats(result, a.id);
    assert.equal(sourceStats.damageDealt, team === 1 ? 20 : 0);
    assert.equal(sourceStats.friendlyDamage, team === 0 ? 20 : 0);
    assert.equal(sourceStats.shipsSunk, team === 1 ? 1 : 0);
    assert.deepEqual(stats(result, target.id).damageTaken,
      { enemy: team === 1 ? 20 : 0, friendly: team === 0 ? 20 : 0, environment: 0 });
    sourceTotals(result, a.id, { torpedo: { dealt: team === 1 ? 20 : 0, friendly: team === 0 ? 20 : 0, taken: 0 } });
    sourceTotals(result, target.id, { torpedo: { dealt: 0, friendly: 0, taken: 20 } });
  });
}

test('outbound aircraft credit their mother even after she sinks', () => {
  const mother = ship('cv', 0, 0, 0), target = ship('cv', 1, 0, 5);
  mother.hp = 0; target.hp = 20;
  const input = game([mother, target], { planes: [plane(mother, target.pos)] });
  const result = E.resolveRound(input);
  assert.equal(stats(result, mother.id).damageDealt, 20);
  assert.equal(stats(result, mother.id).shipsSunk, 1);
  assert.equal(stats(result, target.id).damageTaken.enemy, 20);
  assert.equal(stats(result, target.id).planesShotDown, 0);
  sourceTotals(result, mother.id, { air: { dealt: 20, friendly: 0, taken: 0 } });
  sourceTotals(result, target.id, { air: { dealt: 0, friendly: 0, taken: 20 } });
});

for (const team of [0, 1]) {
  test(`${team === 0 ? 'friendly' : 'enemy'} collision credits both sources even when both sink`, () => {
    const a = ship('dd', 0, 0, 3), b = ship('cl', team, 1, 5);
    a.hp = 20; b.hp = 15; b.heading = 3;
    const result = E.resolveRound(game([a, b]), {
      [a.id]: plan({ moves: forward(2) }), [b.id]: plan({ moves: forward(2) }),
    });
    assert.equal(stats(result, a.id)[team === 1 ? 'damageDealt' : 'friendlyDamage'], 15);
    assert.equal(stats(result, b.id)[team === 1 ? 'damageDealt' : 'friendlyDamage'], 20);
    sourceTotals(result, a.id, { collision: { dealt: team === 1 ? 15 : 0, friendly: team === 0 ? 15 : 0, taken: 20 } });
    sourceTotals(result, b.id, { collision: { dealt: team === 1 ? 20 : 0, friendly: team === 0 ? 20 : 0, taken: 15 } });
    for (const source of [a, b]) assert.equal(stats(result, source.id).shipsSunk, team === 1 ? 1 : 0);
  });
}

test('mines and collision grounding count as environment damage without sinking credit', () => {
  const mineVictim = ship('cv', 0, 0, 0), a = ship('cv', 0, 1, 5), b = ship('cv', 0, 2, 5);
  const enemy = ship('cv', 1, 0, 13, 10);
  mineVictim.hp = 10; a.cfg.collision = 0; b.cfg.collision = 0; b.hp = 12;
  const input = game([mineVictim, a, b, enemy]); input.map.mines = [mineVictim.pos];
  const result = E.resolveRound(input);
  assert.equal(stats(result, mineVictim.id).damageTaken.environment, 10);
  assert.equal(stats(result, b.id).damageTaken.environment, 12);
  sourceTotals(result, mineVictim.id, { environment: { dealt: 0, friendly: 0, taken: 10 } });
  sourceTotals(result, b.id, { grounding: { dealt: 0, friendly: 0, taken: 12 } });
  assert.ok(result.events.some(event => event.text.includes('碰撞搁浅')));
  for (const value of Object.values(result.combatStats)) assert.equal(value.shipsSunk, 0);
});

test('overlapping AA volleys credit only the first alive-to-destroyed transition', () => {
  const mother = ship('cv', 0, 0, 0), a = ship('dd', 1, 0, 5), b = ship('dd', 1, 1, 5, 7);
  a.cfg.aa = { range: 3, damage: 2 }; b.cfg.aa = { range: 3, damage: 2 };
  const input = game([mother, a, b], { planes: [plane(mother, hex(4, 6))] });
  const result = E.resolveRound(input);
  assert.equal(stats(result, a.id).planesShotDown, 1);
  assert.equal(stats(result, b.id).planesShotDown, 0);
  assert.equal(stats(result, mother.id).damageTaken.enemy, 0);
  assert.equal(result!.game.ships.find(value => value.id === mother.id)!.destroyedPlanes, 1);
  for (const source of [mother, a, b]) sourceTotals(result, source.id, {});
});

test('unrecognized damage categories do not contaminate any known category', () => {
  const a = ship('dd', 0, 0, 0), target = ship('cv', 1, 0, 5);
  const tracker = createCombatStatsTracker([a, target]), hpBefore = target.hp;
  target.hp -= 7;
  tracker.damage(target, hpBefore, [{ sourceId: a.id, amount: 7 }], 'unrecognized');
  assert.equal(tracker.stats[a.id].damageDealt, 7);
  assert.equal(tracker.stats[target.id].damageTaken.enemy, 7);
  assert.deepEqual(tracker.stats[a.id].damageBySource, emptyStats.damageBySource);
  assert.deepEqual(tracker.stats[target.id].damageBySource, emptyStats.damageBySource);
});

test('aircraft recovery and missing mothers do not award any AA credit', () => {
  for (const motherAlive of [true, false]) {
    const mother = ship('cv', 0, 0, 0), enemy = ship('cv', 1, 0, 13);
    if (!motherAlive) mother.hp = 0;
    const input = game([mother, enemy], { planes: [plane(mother, hex(1), { state: 'return' })] });
    const result = E.resolveRound(input);
    assert.equal(result.game.planes.length, 0);
    assert.deepEqual(stats(result, mother.id), emptyStats);
    assert.deepEqual(stats(result, enemy.id), emptyStats);
  }
});
