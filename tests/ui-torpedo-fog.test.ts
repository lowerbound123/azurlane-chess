import {torpedoFixture} from './helpers/game-fixtures.ts';
import {vi} from 'vitest';
import {mockFetch} from './helpers/fetch.ts';
import {TestSocket} from './helpers/socket.ts';
import type {OnlineState,User} from '../shared/network.ts';
import {flushPromises} from '@vue/test-utils';
// @vitest-environment happy-dom
import {mountGame,settleGame,chooseSelect} from './helpers/mount-game.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import * as E from '../src/engine.ts';

document.body.innerHTML = '<div id="app"></div>';
const errors:string[]=[], oldError = console.error;
console.error = (...values) => errors.push(values.join(' '));
const {session:vm,router,wrapper}=await mountGame();
const flush = async () => { await settleGame(); await new Promise(r=> setTimeout(r, 0)); };
const ids = () => vm.mapModel.torpedoes.map(p => p.id).sort();
const torpedo=torpedoFixture;

test('offline map hides both teams in double fog while retaining own torpedoes in explored fog', async () => {
  const game = E.createGame(); game.phase = 'plan'; game.map.islands = [];
  const visible = E.visibleCells(game, 0), seen = E.allHexes().find(h => visible.has(E.key(h)));
  const [known, unknown] = E.allHexes().filter(h => !visible.has(E.key(h)));
  game.explored[0] = [...visible, E.key(known)];
  game.torpedoes = [torpedo('own-unknown', 0, unknown!), torpedo('enemy-unknown', 1, unknown!), torpedo('own-known', 0, known), torpedo('enemy-known', 1, known), torpedo('own-seen', 0, seen!), torpedo('enemy-seen', 1, seen!)];
  vm.game = game; await flush();
  assert.deepEqual(ids(), ['enemy-seen', 'own-known', 'own-seen']);
  assert.equal(vm!.mapModel.cells.find((c)=> c.k === E.key(unknown!))!.known, false);
  vm.game.explored[0].push(E.key(unknown!)); await flush();
  assert.deepEqual(ids(), ['enemy-seen', 'own-known', 'own-seen', 'own-unknown'], 'exploration reveals own torpedo without revealing the enemy');
  assert.equal(errors.length, 0, errors.join('\n'));
});

test('playback map uses current frame exploration and removes torpedoes when they enter unknown cells', async () => {
  const a = E.fromCR(6, 7), b = E.fromCR(7, 7);
  const game = E.createGame(); game.phase = 'plan'; game.explored[0] = [E.key(a), E.key(b)]; vm.game = game;
  const frame = (pos: { q: number; r: number; }, explored: string[], visible:string[] = []) => ({ t: 0, ships: [], planes: [], torpedoes: [torpedo('own', 0, pos), torpedo('enemy', 1, pos)], mines: [], effects: [], explored, visible });
  vm.playFrame = frame(a, [E.key(a)]); await flush(); assert.deepEqual(ids(), ['own']);
  vm.playFrame = frame(b, [E.key(a)]); await flush(); assert.deepEqual(ids(), [], 'final game exploration cannot reveal future playback cells');
  vm.playFrame = frame(b, [E.key(a), E.key(b)]); await flush(); assert.deepEqual(ids(), ['own']);
  vm.playFrame = frame(b, [E.key(a), E.key(b)], [E.key(b)]); await flush(); assert.deepEqual(ids(), ['enemy', 'own']);
  assert.equal(errors.length, 0, errors.join('\n'));
});

afterAll(() => { wrapper.unmount(); console.error = oldError; });

afterAll(()=>wrapper.unmount());
