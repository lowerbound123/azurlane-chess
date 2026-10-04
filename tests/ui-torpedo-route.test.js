import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {rewriteUiSource} from './helpers/load-ui-source.js';
import {Window} from 'happy-dom';
import {deserializeSave} from '../src/save.js';

const window = new Window({url: 'http://localhost/'});
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'SVGElement', 'Node', 'Event', 'MouseEvent', 'KeyboardEvent', 'MutationObserver', 'getComputedStyle', 'localStorage']) {
  Object.defineProperty(globalThis, key, {value: key === 'window' ? window : key === 'getComputedStyle' ? window[key].bind(window) : window[key], configurable: true});
}
document.body.innerHTML = '<div id="app"></div>';
const errors = [];
console.error = (...args) => errors.push(...args);
let source = await fs.readFile(new URL('../src/main.js', import.meta.url), 'utf8');
source = rewriteUiSource(source);
await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const button = text => [...document.querySelectorAll('button')].find(el => el.textContent.replace(/\s/g, '').includes(text.replace(/\s/g, '')));
const click = async el => {
  assert.ok(el, 'control exists');
  el.dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  await wait(0);
};
const hex = (c, r) => document.querySelector(`[data-map-cell="${c - Math.floor(r / 2)},${r}"]`);

test('torpedo before segmented movement remains saveable and executable after Vue edits', async () => {
  await click(button('新游戏'));
  await click(button('进入部署'));
  await click(button('完成部署'));
  await click(button('鱼雷 T'));
  await click(hex(0, 13));
  for (const c of [1, 2]) {
    hex(c, 12).dispatchEvent(new window.MouseEvent('contextmenu', {bubbles: true, cancelable: true, button: 2}));
    await wait(0);
  }
  assert.equal(document.querySelectorAll('.action-item.torp').length, 1);
  assert.equal(document.querySelectorAll('.waypoint-item').length, 2);
  await click(button('撤销修改'));
  await click(button('重做修改'));
  const saved = deserializeSave(localStorage.getItem('azurlane-chess:v1:auto'));
  assert.equal(saved.state.plans['0-0'].moves.length, 2);
  assert.deepEqual(saved.state.plans['0-0'].torps, [{window: 0, dir: 1}]);
  await click(button('执行回合'));
  const deadline = Date.now() + 15000;
  while (button('跳过动画')?.disabled && !errors.length && Date.now() < deadline) await wait(25);
  assert.equal(errors.length, 0, errors.map(error => error.stack || error).join('\n'));
  assert.ok(button('跳过动画') && !button('跳过动画').disabled, 'round resolved without a structuredClone failure');
  await click(button('跳过动画'));
  assert.match(document.querySelector('.round').textContent, /02/);
  assert.equal(deserializeSave(localStorage.getItem('azurlane-chess:v1:auto')).state.game.round, 2);
});
