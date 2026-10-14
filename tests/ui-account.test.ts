import {vi} from 'vitest';
import {mockFetch} from './helpers/fetch.ts';
import {TestSocket} from './helpers/socket.ts';
import type {OnlineState,User} from '../shared/network.ts';
import {flushPromises} from '@vue/test-utils';
// @vitest-environment happy-dom
import {mountGame,settleGame,chooseSelect} from './helpers/mount-game.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
document.body.innerHTML='<div id="app"></div>';
vi.stubGlobal('fetch',mockFetch(async()=>({ok:true,status:200,json:async()=>({auth:{enabled:false},protocolVersion:2,models:[]})})));
const {session:vm,router,wrapper}=await mountGame();
const flush=async()=>{await settleGame();};
test('default disabled account controls cannot open forms and all visitor entry points remain',async()=>{
  await flush();
  const controls=[...document.querySelectorAll<HTMLButtonElement>('.account-actions button')];
  assert.equal(controls.length,2);
  assert.ok(controls.every(button=>button.disabled));
  assert.match(document!.querySelector<HTMLElement>('.account-actions')!.textContent,/暂未开放/);
  controls[0].click();await flush();assert.equal(document.querySelector<HTMLElement>('.account-dialog'),null);
  assert.match(document.body.textContent,/连接服务器/);assert.match(document.body.textContent,/新游戏/);assert.match(document.body.textContent,/交互教学/);
});

afterAll(()=>wrapper.unmount());
