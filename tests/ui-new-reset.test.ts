import {vi} from 'vitest';
import {resolveRound} from '../src/engine.ts';
import {mockFetch} from './helpers/fetch.ts';
import {TestSocket} from './helpers/socket.ts';
import type {OnlineState,User} from '../shared/network.ts';
import {flushPromises} from '@vue/test-utils';
// @vitest-environment happy-dom
import {mountGame,settleGame,chooseSelect} from './helpers/mount-game.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
window.document.body.innerHTML='<div id="app"></div>';
const errors:string[]=[];const oldError=console.error;console.error=(...x)=>errors.push(x.join(' '));
const {session:vm,router,wrapper}=await mountGame();
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));const flush=async()=>{await settleGame();await settleGame();await wait(0)};
const buttons=()=>[...document.querySelectorAll<HTMLButtonElement>('button')];const button=(text: string)=>buttons().find(b=>b.textContent.replace(/\s/g,'').includes(text.replace(/\s/g,'')));const click=async (el:HTMLElement|null|undefined)=>{assert.ok(el,'control exists');el.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));await flush()};const hex=(c:number,r:number)=>document.querySelector<HTMLElement>(`[data-map-cell="${c-Math.floor(r/2)},${r}"]`);
test('fresh tutorial exit cannot hide new normal game range defaults',async()=>{
 await click(button('交互教学'));await click(document.querySelectorAll<HTMLElement>('.lesson-card')[4]);assert.ok(button('显示范围'),'practice starts with range hidden');await click(button('退出教学'));await click(button('新游戏'));await click(button('本地游玩'));await click(button('进入部署'));await click(button('完成部署'));assert.ok(button('隐藏范围'),'normal game resets useful range layer visible');assert.ok(button('隐藏全部计划'),'normal game resets all friendly plans visible');assert.equal(errors.length,0,errors.join('\n'));
});

test('renderer error exit cancels pending simulation and finishes resolved playback safely', async () => {
  await click(button('前进 W'));
  const originalRound = document!.querySelector<HTMLElement>('.round')!.textContent;
  const originalMoves = document.querySelectorAll<HTMLElement>('.action-item.movement').length;
  let finishLate!:()=>void;
  vi.spyOn(vm.computer,'resolve').mockImplementationOnce(request=>new Promise(resolve=>{finishLate=()=>resolve(resolveRound(request.game,request.plans));}));
  button!('执行回合')!.dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await settleGame();
  await settleGame();
  assert.equal(button!('跳过动画')!.disabled, true, 'simulation is still pending');
  await click(document.querySelector<HTMLElement>('[data-map-error-exit]'));
  assert.ok(button('继续当前战局'), 'error exit reaches home during pending simulation');
  finishLate();await settleGame();
  await click(button('继续当前战局'));
  assert.equal(button('跳过动画'), undefined, 'cancelled simulation did not start in background');
  assert.equal(document!.querySelector<HTMLElement>('.round')!.textContent, originalRound);
  assert.equal(document.querySelectorAll<HTMLElement>('.action-item.movement').length, originalMoves, 'pending exit preserves orders');

  await click(button('执行回合'));
  const deadline = Date.now() + 6000;
  while ((!button('跳过动画') || button!('跳过动画')!.disabled) && Date.now() < deadline) await wait(20);
  assert.ok(button('跳过动画') && !button!('跳过动画')!.disabled, 'simulation resolved and playback is active');
  await click(document.querySelector<HTMLElement>('[data-map-error-exit]'));
  assert.ok(button('继续当前战局'), 'error exit reaches home during active playback');
  await click(button('继续当前战局'));
  assert.equal(button('跳过动画'), undefined);
  assert.match(document!.querySelector<HTMLElement>('.round')!.textContent, /02/, 'resolved outcome is committed exactly once');
  assert.equal(document.querySelectorAll<HTMLElement>('.action-item.movement').length, 0);
  await wait(150);
  assert.equal(button('跳过动画'), undefined, 'playback stays cancelled after returning');
  assert.match(document!.querySelector<HTMLElement>('.round')!.textContent, /02/);
  assert.equal(errors.length, 0, errors.join('\n'));
});

afterAll(()=>wrapper.unmount());
