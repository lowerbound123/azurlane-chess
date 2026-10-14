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
window.document.body.innerHTML='<div id="app"></div>';
const errors:string[]=[];const oldError=console.error;console.error=(...x)=>errors.push(x.join(' '));
const {session:vm,router,wrapper}=await mountGame();
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));const flush=async()=>{await settleGame();await settleGame();await wait(0)};
const buttons=()=>[...document.querySelectorAll<HTMLButtonElement>('button')];const button=(text: string)=>buttons().find(b=>b.textContent.replace(/\s/g,'').includes(text.replace(/\s/g,'')));const click=async (el:HTMLElement|null|undefined)=>{assert.ok(el,'control exists');el.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));await flush()};const hex=(c:number,r:number)=>document.querySelector<HTMLElement>(`[data-map-cell="${c-Math.floor(r/2)},${r}"]`);
test('double fog overlays and segmented per-ship route edits',async()=>{
 await click(button('新游戏'));await click(button('本地游玩'));await click(button('进入部署'));await click(button('完成部署'));vm.game!.ships[1].pos=E.fromCR(3,14);vm.game!.ships[1].xy=E.hexToXY(vm.game!.ships[1].pos);
 assert(document.querySelectorAll<HTMLElement>('[data-map-cell][data-known="false"]').length>0,'unknown fog layer renders');assert.equal(document.querySelectorAll<HTMLElement>('[data-map-cell][data-known="false"][data-island="true"]').length,0,'unknown island geometry is hidden');assert.equal(document.querySelectorAll<HTMLElement>('[data-map-ship]').length,5,'enemy markers are absent');assert.equal(document.querySelectorAll<HTMLElement>('[data-map-mine]').length,8,'mines remain public');assert(document.querySelectorAll<HTMLElement>('[data-map-cell][data-overlay="reach"]').length>0,'known movement cells are highlighted');
 const context=async(c: number,r: number)=>{await click(button('航线')); hex!(c,r)!.dispatchEvent(new window.MouseEvent('click',{bubbles:true,cancelable:true,button:0}));await flush();};
 await context(1,12);await context(2,12);assert.equal(document.querySelectorAll<HTMLElement>('.waypoint-item').length,2);assert.equal(document.querySelectorAll<HTMLElement>('.action-item.movement').length,2);
 await click(button('撤销航点'));assert.equal(document.querySelectorAll<HTMLElement>('.waypoint-item').length,1);assert.equal(document.querySelectorAll<HTMLElement>('.action-item.movement').length,1);
 await click(button('重做修改'));assert.equal(document.querySelectorAll<HTMLElement>('.waypoint-item').length,2);await click(button('撤销修改'));assert.equal(document.querySelectorAll<HTMLElement>('.waypoint-item').length,1);
 await click(button('鱼雷 T'));await chooseSelect('发射窗口',1);await flush();await click(hex(1,13));assert.equal(document.querySelectorAll<HTMLElement>('.action-item.torp').length,1);
 await click(button('清除航线'));assert.equal(document.querySelectorAll<HTMLElement>('.action-item.movement').length,0);assert.equal(document.querySelectorAll<HTMLElement>('.action-item.torp').length,0);assert.match(document!.querySelector<HTMLElement>('.toast')!.textContent,/失效鱼雷/);
 await click(document.querySelectorAll<HTMLElement>('.ship-row')[3]);await click(button('主炮 G'));await click(document.querySelectorAll<HTMLElement>('[data-map-ship]')[3]);assert.equal(document.querySelectorAll<HTMLElement>('.action-item.artillery').length,1);assert(document.querySelectorAll<HTMLElement>('[data-map-cell][data-overlay="main"]').length>0);await context(1,14);await click(button('重新规划'));assert.equal(document.querySelectorAll<HTMLElement>('.action-item.movement').length,0);assert.equal(document.querySelectorAll<HTMLElement>('.action-item.artillery').length,1,'movement-only redraw preserves main order');
 await click(document.querySelectorAll<HTMLElement>('.ship-row')[0]);assert.equal(document.querySelectorAll<HTMLElement>('.action-item.artillery').length,0,'selected ship is isolated');await click(document.querySelectorAll<HTMLElement>('.ship-row')[3]);assert.equal(document.querySelectorAll<HTMLElement>('.action-item.artillery').length,1);
 await click(button('主炮 G'));await click(button('隐藏范围'));assert.equal(document.querySelectorAll<HTMLElement>('[data-map-cell][data-overlay="main"]').length,0);await click(button('显示范围'));assert(document.querySelectorAll<HTMLElement>('[data-map-cell][data-overlay="main"]').length>0);
 assert.equal(errors.length,0,errors.join('\n'));
});

afterAll(()=>wrapper.unmount());
