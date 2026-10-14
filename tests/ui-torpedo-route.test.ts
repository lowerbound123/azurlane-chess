import * as E from '../src/engine.ts';
import {vi} from 'vitest';
import {mockFetch} from './helpers/fetch.ts';
import {TestSocket} from './helpers/socket.ts';
import type {OnlineState,User} from '../shared/network.ts';
import {flushPromises} from '@vue/test-utils';
// @vitest-environment happy-dom
import {mountGame,settleGame,chooseSelect} from './helpers/mount-game.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import {deserializeSave} from '../src/save.ts';

document.body.innerHTML = '<div id="app"></div>';
const errors:string[]=[];
console.error = (...args) => errors.push(...args);
const {session:vm,router,wrapper}=await mountGame();

const wait = (ms:number)=> new Promise(resolve => setTimeout(resolve, ms));
const button = (text:string)=> [...document.querySelectorAll<HTMLButtonElement>('button')].find(el => el.textContent.replace(/\s/g, '').includes(text.replace(/\s/g, '')));
const click = async (el:HTMLElement|null|undefined) => {
  assert.ok(el, 'control exists');
  el.dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await settleGame();await wait(0);
};
const hex = (c:number, r:number) => document.querySelector<HTMLElement>(`[data-map-cell="${c - Math.floor(r / 2)},${r}"]`);

test('torpedo before segmented movement remains saveable and executable after Vue edits', async () => {
  await click(button('新游戏'));await click(button('本地游玩'));
  await click(button('进入部署'));
  await click(button('完成部署'));vm.game!.ships[1].pos=E.fromCR(3,14);vm.game!.ships[1].xy=E.hexToXY(vm.game!.ships[1].pos);
  await click(button('鱼雷 T'));
  await click(hex(0, 13));
  await click(button('航线'));
  for (const c of [1, 2]) {
    hex!(c, 12)!.dispatchEvent(new window.MouseEvent('click', {bubbles: true, cancelable: true, button: 0}));
    await settleGame();await wait(0);
  }
  assert.equal(document.querySelectorAll<HTMLElement>('.action-item.torp').length, 1);
  assert.equal(document.querySelectorAll<HTMLElement>('.waypoint-item').length, 2);
  await click(button('撤销修改'));
  await click(button('重做修改'));
  const saved = deserializeSave(localStorage.getItem('azurlane-chess:v1:auto')!);
  assert.equal(saved.state.plans['0-0'].moves.length, 2);
  assert.deepEqual(saved.state.plans['0-0'].torps, [{window: 0, dir: 1}]);
  await click(button('执行回合'));
  const deadline = Date.now() + 15000;
  while (button('跳过动画')?.disabled && !errors.length && Date.now() < deadline) await wait(25);
  assert.equal(errors.length, 0, errors.map(error => error).join('\n'));
  assert.ok(button('跳过动画') && !button!('跳过动画')!.disabled, 'round resolved without a structuredClone failure');
  await click(button('跳过动画'));
  assert.match(document!.querySelector<HTMLElement>('.round')!.textContent, /02/);
  assert.equal(deserializeSave(localStorage.getItem('azurlane-chess:v1:auto')!).state.game.round, 2);
});

afterAll(()=>wrapper.unmount());
