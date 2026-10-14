import {vi} from 'vitest';
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
test('rendered Vue fleet → deploy → plan controls → complete round → restart',async()=>{
 await click(button('新游戏'));await click(button('本地游玩'));assert.match(document.body.textContent,/出击编队/);assert.equal(document.querySelectorAll<HTMLElement>('[data-selected-ship]').length,5);
 await click(document.querySelector<HTMLElement>('[aria-label=移除克利夫兰]'));await click(document.querySelector<HTMLElement>('[data-ship-id=dd-3]'));assert.equal(document.querySelectorAll<HTMLElement>('[data-selected-ship]').length,4,'inspection does not add a ship');await click(button('确认添加'));assert.ok(document.querySelector<HTMLElement>('[data-selected-ship=dd-3]'));
 await click(button('进入部署'));assert.match(document.body.textContent,/舰队部署/);await vi.waitFor(()=>assert.ok(document.querySelector<HTMLElement>('[data-testid=semantic-map-adapter]'),'HappyDOM tests explicitly use a semantic adapter'));assert.equal(document.querySelectorAll<HTMLElement>('[data-map-cell]').length,285);assert.equal(document.querySelectorAll<HTMLElement>('[data-map-ship]').length,5,'hidden enemy ships omitted');
 await click(hex(1,12));assert.deepEqual(vm.game!.ships[0].pos,{q:-5,r:12});
 assert.equal(document.querySelector('.ship-row [role=progressbar]')?.getAttribute('aria-valuenow'),'100');
 assert.match(document.querySelector('.ship-row .health-value')!.textContent,/90 \/ 90/);
 assert.doesNotMatch(document.querySelector('.fleet-sidebar')!.textContent,/项指令|步/);

 await click(button('完成部署'));assert.match(document.body.textContent,/战术规划/);
 await click(button('右转60'));await click(button('原地转向'));assert.equal(document.querySelectorAll<HTMLElement>('.action-item').length,1);assert.match(document!.querySelector<HTMLElement>('.action-item')!.textContent,/右转/);
 await click(button('撤销末步'));assert.equal(document.querySelectorAll<HTMLElement>('.action-item').length,0);
 await click(button('鱼雷 T'));await click(hex(1,13));assert.equal(document.querySelectorAll<HTMLElement>('.action-item.torp').length,1);
 await click(document.querySelectorAll<HTMLElement>('.ship-row')[3]);await click(button('主炮 G'));const ownMarker=document.querySelectorAll<HTMLElement>('[data-map-ship]')[3];await click(ownMarker);await click(ownMarker);await click(ownMarker);assert.equal(document.querySelectorAll<HTMLElement>('.action-item.artillery').length,3,'marker receives repeated artillery selection');
 await click(button('清空'));assert.equal(document.querySelectorAll<HTMLElement>('.action-item.artillery').length,0);
 await click(document.querySelectorAll<HTMLElement>('.ship-row')[4]);await click(button('飞机 F'));await click(hex(9,7));await click(hex(10,7));assert.equal(document.querySelectorAll<HTMLElement>('.action-item.aviation').length,2);
 await click(button('执行回合'));await wait(900);await flush();assert.equal(errors.length,0,errors.join('\n'));assert.ok(button('跳过动画'));await click(button('跳过动画'));assert.match(document!.querySelector<HTMLElement>('.round')!.textContent,/02/);assert.equal(document.querySelectorAll<HTMLElement>('.action-item').length,0,'plans cleared after resolution');assert.equal(errors.length,0,errors.join('\n'));
 await click(document.querySelector<HTMLButtonElement>('button[aria-label="规则与操作"]'));assert.ok(document.querySelector<HTMLElement>('[role=dialog]'));await click(button('关闭'));await click(button('重新编队'));await click(button('本地游玩'));assert.match(document.body.textContent,/出击编队/);
 await click(button('进入部署'));if(button('确认新游戏'))await click(button('确认新游戏'));await click(button('完成部署'));await click(button('前进 W'));await click(button('右转60'));await click(button('重新编队'));await click(button('本地游玩'));await click(button('进入部署'));if(button('确认新游戏'))await click(button('确认新游戏'));await click(button('完成部署'));assert.ok(button('原地等待'),'new game clears pending turn');await click(button('鱼雷 T'));const windows=document.querySelector<HTMLElement>('[aria-label="发射窗口"]');assert.equal(windows?.dataset.value,'0','new game resets torpedo window');await click(hex(0,13));assert.equal(document.querySelectorAll<HTMLElement>('.action-item.torp').length,1,'new game initial window accepts torpedo');
});

afterAll(()=>wrapper.unmount());
