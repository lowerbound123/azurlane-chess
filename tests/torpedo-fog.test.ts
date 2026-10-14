import type {Hex,Torpedo} from '../shared/game.ts';
import {torpedoFixture} from './helpers/game-fixtures.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import * as E from '../src/engine.ts';
import { playerView, playerResult } from '../server/views.ts';
import { interpolateFrame } from '../src/playback.ts';


const torpedo=torpedoFixture;
const ids = (list:{id:string}[]) => list.map((unit) => unit.id).sort();
function replayFrame(t: number, team: number, visible: string[], explored: string[], torpedoes:Torpedo[]) {
  const visibleByTeam:string[][] = [[], []], exploredByTeam:string[][] = [[], []];
  visibleByTeam[team] = visible; exploredByTeam[team] = explored;
  return {t,visible:visibleByTeam[team],explored:exploredByTeam[team],visibleByTeam, exploredByTeam, ships: [], planes: [], torpedoes, mines: [], effects: [] };
}

for (const team of [0, 1]) {
  test(`team ${team} observations and wire state hide all unexplored torpedoes`, () => {
    const game = E.createGame(); game.map.islands = [];
    const visible = E.visibleCells(game, team);
    const seen = E.allHexes().find(h => visible.has(E.key(h)));
    const [known, unknown] = E.allHexes().filter(h => !visible.has(E.key(h)));
    assert.ok(seen && known && unknown);
    game.explored[team] = [...visible, E.key(known)];
    game.torpedoes = [
      torpedo('own-seen', team, seen!), torpedo('own-known', team, known!), torpedo('own-unknown', team, unknown!),
      torpedo('enemy-seen', 1 - team, seen!), torpedo('enemy-known', 1 - team, known!), torpedo('enemy-unknown', 1 - team, unknown!),
    ];
    const before = E.clone(game.torpedoes), expected = ['enemy-seen', 'own-known', 'own-seen'];
    assert.deepEqual(ids(E.observe(game, team).torpedoes), expected, 'rule AI observation obeys both fog layers');
    assert.deepEqual(ids(playerView(game, team).torpedoes), expected, 'wire state conceals unknown positions');
    assert.deepEqual(game.torpedoes, before, 'hidden torpedoes remain in the simulation');
  });

  test(`team ${team} replay hides unknown torpedoes until that frame explores their cell`, () => {
    const game = E.createGame(), a = E.fromCR(6, 7), b = E.fromCR(7, 7);
    const frames = [
      replayFrame(0, team, [], [E.key(a)], [torpedo('own', team, a), torpedo('enemy', 1 - team, a)]),
      replayFrame(1, team, [], [E.key(a)], [torpedo('own', team, b), torpedo('enemy', 1 - team, b)]),
      replayFrame(2, team, [E.key(b)], [E.key(a), E.key(b)], [torpedo('own', team, b), torpedo('enemy', 1 - team, b)]),
    ];
    game.explored[team] = [E.key(a), E.key(b)];
    const result = { game, frames, events:[],presentation:[],counts:[],combatStats:{} }, before = E.clone(frames);
    const projected = playerResult(game, result, team);
    assert.deepEqual(projected.frames.map(f => ids(f.torpedoes)), [['own'], [], ['enemy', 'own']]);
    assert.deepEqual(frames, before, 'projection leaves authoritative frames intact');
    const midway = interpolateFrame(projected.frames[1], projected.frames[2], .5);
    assert.deepEqual(midway.torpedoes, [], 'later exploration is not revealed early');
  });

  test(`team ${team} replay cannot interpolate own torpedoes across an unexplored gap`, () => {
    const game = E.createGame(), a = E.fromCR(6, 7), b = E.fromCR(10, 7), explored = [E.key(a), E.key(b)];
    const frames = [replayFrame(0, team, [], explored, [torpedo('own', team, a)]), replayFrame(1, team, [], explored, [torpedo('own', team, b)])];
    const projected = playerResult(game, { game, frames, events:[],presentation:[],counts:[],combatStats:{} }, team);
    assert.equal(projected.frames[1].torpedoes.length, 1, 'own torpedoes remain visible in explored fog');
    for (let fraction = 0; fraction < 1; fraction += .05) {
      const frame = interpolateFrame(projected.frames[0], projected.frames[1], fraction);
      assert.ok(frame.torpedoes.every(p => explored.includes(E.key(E.xyToHex(p.xy)))), `no unexplored marker at ${fraction}`);
    }
  });
}
