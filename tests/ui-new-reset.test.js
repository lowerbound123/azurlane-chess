import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {rewriteUiSource} from './helpers/load-ui-source.js';
import {Window} from 'happy-dom';
const window=new Window({url:'http://localhost/'});
for(const k of ['window','document','navigator','HTMLElement','Element','SVGElement','Node','Event','MouseEvent','KeyboardEvent','MutationObserver','getComputedStyle','localStorage'])Object.defineProperty(globalThis,k,{value:k==='window'?window:typeof window[k]==='function'&&k==='getComputedStyle'?window[k].bind(window):window[k],configurable:true});
window.document.body.innerHTML='<div id="app"></div>';
const errors=[];const oldError=console.error;console.error=(...x)=>errors.push(x.join(' '));
let source=await fs.readFile(new URL('../src/main.js',import.meta.url),'utf8');
source = rewriteUiSource(source);
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const wait=ms=>new Promise(r=>setTimeout(r,ms));const flush=async()=>{await Promise.resolve();await wait(0)};
const buttons=()=>[...document.querySelectorAll('button')];const button=(text)=>buttons().find(b=>b.textContent.replace(/\s/g,'').includes(text.replace(/\s/g,'')));const click=async el=>{assert.ok(el,'control exists');el.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));await flush()};const hex=(c,r)=>document.querySelector(`[data-map-cell="${c-Math.floor(r/2)},${r}"]`);
test('fresh tutorial exit cannot hide new normal game range defaults',async()=>{
 await click(button('交互教学'));await click(document.querySelectorAll('.lesson-card')[4]);assert.ok(button('显示范围'),'practice starts with range hidden');await click(button('退出教学'));await click(button('新游戏'));await click(button('进入部署'));await click(button('完成部署'));assert.ok(button('隐藏范围'),'normal game resets useful range layer visible');assert.ok(button('隐藏全部计划'),'normal game resets all friendly plans visible');assert.equal(errors.length,0,errors.join('\n'));
});

test('renderer error exit cancels pending simulation and finishes resolved playback safely', async () => {
  await click(button('前进 W'));
  const originalRound = document.querySelector('.round').textContent;
  const originalMoves = document.querySelectorAll('.action-item.movement').length;
  button('执行回合').dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(button('跳过动画').disabled, true, 'simulation is still pending');
  await click(document.querySelector('[data-map-error-exit]'));
  assert.ok(button('继续当前战局'), 'error exit reaches home during pending simulation');
  await wait(80);
  await click(button('继续当前战局'));
  assert.equal(button('跳过动画'), undefined, 'cancelled simulation did not start in background');
  assert.equal(document.querySelector('.round').textContent, originalRound);
  assert.equal(document.querySelectorAll('.action-item.movement').length, originalMoves, 'pending exit preserves orders');

  await click(button('执行回合'));
  const deadline = Date.now() + 6000;
  while ((!button('跳过动画') || button('跳过动画').disabled) && Date.now() < deadline) await wait(20);
  assert.ok(button('跳过动画') && !button('跳过动画').disabled, 'simulation resolved and playback is active');
  await click(document.querySelector('[data-map-error-exit]'));
  assert.ok(button('继续当前战局'), 'error exit reaches home during active playback');
  await click(button('继续当前战局'));
  assert.equal(button('跳过动画'), undefined);
  assert.match(document.querySelector('.round').textContent, /02/, 'resolved outcome is committed exactly once');
  assert.equal(document.querySelectorAll('.action-item.movement').length, 0);
  await wait(150);
  assert.equal(button('跳过动画'), undefined, 'playback stays cancelled after returning');
  assert.match(document.querySelector('.round').textContent, /02/);
  assert.equal(errors.length, 0, errors.join('\n'));
});
