import type {Game,GameMap,Observation} from '../shared/game.ts';
import {planeFixture} from './helpers/game-fixtures.ts';



import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import * as E from '../src/engine.ts';


function reference(game:Game, team: number) {
  const watchers = [...game.ships, ...game.planes].filter(s => s.team === team && s.hp > 0), cells = new Set();
  for (const watcher of watchers) {
    const pos = E.xyToHex(watcher.xy);
    for (const h of E.allHexes()) if (E.hexDist(pos, h) <= watcher.cfg.vision && E.hasLOS(game.map, pos, h)) cells.add(E.key(h));
  }
  return cells;
}
function fixture() {
  const game = E.createGame(); game.map.islands = [];
  game.ships = [E.createShip('dd', 0, 0, E.fromCR(4, 7)), E.createShip('dd', 1, 0, E.fromCR(15, 7))];
  game.planes = [planeFixture('plane',0,E.fromCR(12,7),{cfg:{...E.RULES.plane,vision:3}})];
  return game;
}
const check = (game:Game) => { for (const team of [0, 1]) assert.deepEqual(E.visibleCells(game, team), reference(game, team)); };
test('visibility follows watcher cell, vision, survival and roster changes', () => {
  const game = fixture(); check(game);
  game.ships[0].xy = E.hexToXY(E.fromCR(6, 7)); check(game);
  game.planes[0].xy = E.hexToXY(E.fromCR(14, 8)); check(game);
  game.ships[0].cfg.vision = 2; check(game); game.planes[0].hp = 0; check(game);
  game.ships[0].hp = 0; check(game); game.planes.push(planeFixture('new',0,E.fromCR(5,4),{cfg:{...E.RULES.plane,vision:4}})); check(game);
});
test('visibility reflects terrain mutation and independent games sharing a map', () => {
  const game = fixture(); check(game); game.map.islands.push(E.key(E.fromCR(5, 7))); check(game);
  game.map.islands.splice(0, 1, E.key(E.fromCR(13, 7))); check(game);
  const other = E.clone(game); other.map = game.map; other.ships[0].xy = E.hexToXY(E.fromCR(8, 7)); check(other); check(game);
});
test('callers can mutate returned visibility without changing later observations', () => {
  const game = fixture(), cells = E.visibleCells(game, 0); cells.clear(); cells.add('PRIVATE'); check(game);
});
test('unchanged observations avoid repeated terrain reads for every watcher-cell pair', () => {
  const game = fixture(), islands = game.map.islands; let reads = 0;
  Object.defineProperty(game.map, 'islands', { enumerable: true, get() { reads++; return islands; } });
  const expected = E.visibleCells(game, 0); reads = 0;
  for (let i = 0; i < 50; i++) assert.deepEqual(E.visibleCells(game, 0), expected);
  assert.ok(reads <= 100, `unchanged vision read terrain ${reads} times`);
});
