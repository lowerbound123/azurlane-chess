import type {Game,Plan,Ship,ShipType} from '../shared/game.ts';
import assert from 'node:assert/strict';
import {test,afterAll,afterEach} from 'vitest';
import * as E from '../src/engine.ts';
import { playerResult, playerView, validateOrders } from '../server/views.ts';
import { AIRoundMemory, createAIRoundMemory } from '../server/ai-history.ts';


const ship = (type: ShipType, team: number, index: number, q: number, r = 5) => {
  const value = E.createShip(type, team, index, { q, r });
  delete value.cfg.secondary;
  delete value.cfg.aa;
  return value;
};
const game = (ships:Ship[]):Game => {
  const value:Game = { seed: 1, round: 1, phase: 'plan', winner: null, nextId: 0,
    map: { width: E.W, height: E.H, islands: [], mines: [] },
    ships, planes: [], torpedoes: [], log: [], explored:[[],[]] };
  E.updateExploration(value);
  return value;
};
const plan = (extra:Partial<Plan>={}) => ({ ...E.emptyPlan(), ...extra });
const memoryFor = (before: Game, ownOrders = {}, otherOrders = {}, team = 0) => {
  const validated = validateOrders(before, team, ownOrders);
  const result = E.resolveRound(before, { ...otherOrders, ...validated });
  const projected = playerResult(before, result, team);
  return { result, projected, memory: createAIRoundMemory(before, projected, team, validated) };
};
const observedUnits = (memory:AIRoundMemory) => memory.observations.flatMap((frame) => [...(frame.appeared || []), ...(frame.changed || [])]);

test('round memory keeps executed own orders and visible damage and heading changes', () => {
  const a = ship('bb', 0, 0, 0), b = ship('cv', 1, 0, 4);
  const before = game([a, b]);
  const ownOrders = { [a.id]: plan({ main: [{ q: 4, r: 5 }], moves: [{ turn: 1, forward: false }] }) };
  const { memory } = memoryFor(before, ownOrders);
  assert.equal(memory.round, 1);
  assert.deepEqual(memory.orders[a.id].main, [{ q: 4, r: 5 }]);
  assert.deepEqual(memory.orders[a.id].moves, [{ turn: 1, forward: false }]);
  assert.equal(memory.orders[b.id], undefined);
  assert.equal(memory!.start.ships.find(value => value.id === b.id)!.hp, 210);
  assert.equal(memory!.end.ships.find(value => value.id === b.id)!.hp, 150);
  assert(observedUnits(memory).some((value) => value.id === b.id && value.hp === 150));
  assert(observedUnits(memory).some((value) => value.id === a.id && value.heading === 1));
  assert.equal(memory!.end.ships.find(value => value.id === a.id)!.mainReady, 3);
});

test('round memory retains an enemy that enters and leaves vision within the same real round', () => {
  const a = ship('bb', 0, 0, 3), b = ship('dd', 1, 0, 4, 2);
  a.cfg.vision = 1;
  b.heading = 1;
  const before = game([a, b]);
  const enemyOrders = { [b.id]: plan({ moves: Array.from({ length: 4 }, () => ({ turn: 0, forward: true })) }) };
  const { memory, projected, result } = memoryFor(before, {}, enemyOrders);
  assert.equal(playerView(before, 0).ships.some(value => value.id === b.id), false);
  assert.equal(projected.game.ships.some(value => value.id === b.id), false);
  assert(projected.frames.some(frame => frame.ships.some(value => value.id === b.id)), 'fixture crosses visible water');
  const appearance = memory.observations.find(frame => frame.appeared?.some(value => value.id === b.id));
  const loss = memory.observations.find(frame => frame.lost?.some(value => value.id === b.id));
  assert(appearance, 'a contact seen only mid-round must not be discarded');
  assert(loss && loss.t > appearance.t, 'losing sight is retained after the contact');
  assert.equal(memory.observations.some(frame => frame.removed?.some(value => value.id === b.id)), false);
  assert.equal(result!.game.ships.find(value => value.id === b.id)!.hp, 100, 'contact loss does not imply sinking');
  assert(observedUnits(memory).filter((value) => value.id === b.id).every((value) => !Object.hasOwn(value, 'cfg')));
});

test('round memory excludes unseen enemies, enemy orders, private resources and omniscient output', () => {
  const a = ship('bb', 0, 0, 0), b = ship('dd', 1, 0, 3), hidden = ship('cv', 1, 1, 11, 12);
  b.torps = 871;
  b!.cfg.torpedo!.reserve = 872;
  Reflect.set(b,'humanOrder','enemy-private-order');
  hidden.label = 'unseen-fleet-secret';
  const before = game([a, b, hidden]);
  Reflect.set(before,'humanOrders',{secret:'hidden-orders-secret'});
  before.log = [{round:1,at:null,team:null,text:'omniscient-log-secret'}];
  const { memory } = memoryFor(before);
  const encoded = JSON.stringify(memory);
  for (const secret of ['unseen-fleet-secret', 'hidden-orders-secret', 'enemy-private-order', 'omniscient-log-secret', 'combatStats', 'humanOrders', '"xy"', '"visuals"', '可见区域发生战斗事件']) {
    assert.equal(encoded.includes(secret), false, secret);
  }
  assert.equal(memory.start.ships.some(value => value.id === hidden.id), false);
  assert.equal(memory.end.ships.some(value => value.id === hidden.id), false);
  assert.equal(memory!.start.ships.find(value => value.id === b.id)!.torps, undefined);
  assert.equal(memory!.start.ships.find(value => value.id === b.id)!.cfg!.torpedo!.reserve, undefined);
  assert.equal(memory!.start.ships.find(value => value.id === a.id)!.cfg!.main!.damage, 60);
  assert.throws(() => createAIRoundMemory(before, playerResult(before, E.resolveRound(before), 0), 0, { [b.id]: plan() }), { code: 'INVALID_ORDERS' });
});

test('round memories are independent immutable snapshots of all nested inputs', () => {
  const a = ship('bb', 0, 0, 0), b = ship('cv', 1, 0, 4);
  const before = game([a, b]), own = { [a.id]: plan({ main: [{ q: 4, r: 5 }] }) };
  const projected = playerResult(before, E.resolveRound(before, own), 0);
  const memory = createAIRoundMemory(before, projected, 0, own);
  const copy = structuredClone(memory);
  before.map.mines.push({ q: 1, r: 1 });
  before.ships[0].cfg.main!.damage = 999;
  own[a.id].main[0].q = 9;
  projected.game.ships[0].hp = 0;
  projected.frames[0].ships[0].heading = 5;
  assert.deepEqual(memory, copy);
  assert.throws(() => { memory.start.ships[0].cfg!.main!.damage = 123; }, TypeError);
  assert.throws(() => { memory.orders[a.id].main[0].q = 8; }, TypeError);
  assert.throws(() => { memory.observations.push({ t: 99 }); }, TypeError);
});

test('unchanged replay frames and generic events are compressed without dropping real HP changes', () => {
  const a = ship('bb', 0, 0, 0), b = ship('cv', 1, 0, 4);
  const before = game([a, b]);
  const still = memoryFor(before);
  assert(still.projected.frames.length > 20);
  assert.deepEqual(still.memory.observations, []);
  const firing = memoryFor(before, { [a.id]: plan({ main: [b.pos] }) });
  assert.equal(firing.memory.observations.length, 1);
  assert.equal(firing!.memory.observations[0].changed!.find(value => value.id === b.id)!.hp, 150);
  assert.equal(firing.memory.observations[0].t, 1.1);
});

test('own units disappearing from frames use removed and preserve confirmed end HP separately', () => {
  const a = ship('cv', 0, 0, 0), b = ship('bb', 1, 0, 4);
  a.hp = 40;
  const before = game([a, b]);
  const { memory } = memoryFor(before, {}, { [b.id]: plan({ main: [a.pos] }) });
  assert(memory.observations.some(frame => frame.removed?.some(value => value.id === a.id && value.kind === 'ship')));
  assert.equal(memory!.end.ships.find(value => value.id === a.id)!.hp, 0);
  assert.equal(memory.end.winner, 1);
});

test('mid-round aircraft observations preserve own mother and state without treating recovery as a kill', () => {
  const carrier = ship('cv', 0, 0, 0), enemy = ship('bb', 1, 0, 9);
  const before = game([carrier, enemy]);
  const { memory } = memoryFor(before, { [carrier.id]: plan({ planes: [{ mode: 'point', target: { q: 2, r: 5 } }] }) });
  const planes = observedUnits(memory).filter((unit) => unit.kind === 'plane');
  assert(planes.some((unit) => unit.state === 'outbound'));
  assert(planes.some((unit) => unit.state === 'return'));
  assert(planes.every((unit) => unit.mother === carrier.id && unit.slot === 0));
  assert(memory.observations.some(frame => frame.removed?.some(unit => unit.kind === 'plane')));
  assert.equal(memory.observations.some(frame => frame.lost?.some(unit => unit.kind === 'plane')), false);
  assert.deepEqual(memory.end.planes, []);
  assert.equal(memory!.end.ships.find(unit => unit.id === carrier.id)!.destroyedPlanes, 0);
  assert.equal(memory!.end.ships.find(unit => unit.id === carrier.id)!.airReady![0], 3);
});
