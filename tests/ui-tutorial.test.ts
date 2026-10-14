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
const contextClick=async(c: number,r: number)=>{hex!(c,r)!.dispatchEvent(new window.MouseEvent('click',{bubbles:true,cancelable:true,button:0}));await flush();};
const coach=()=>document!.querySelector<HTMLElement>('.tutorial-coach')!.textContent;
const next=async()=>{assert.equal(button!('下一课')!.disabled,false,coach());await click(button('下一课'));};
test('action-gated tutorial controls teach real mechanics without touching normal saves',async()=>{
 await click(button('新游戏'));await click(button('本地游玩'));await click(button('进入部署'));await click(button('完成部署'));await click(button('前进 W'));await click(button('隐藏范围'));await click(button('主菜单'));await click(button('交互教学'));await click(document.querySelector<HTMLElement>('.lesson-card'));
 const auto=localStorage.getItem('azurlane-chess:v1:auto');assert.equal(button!('下一课')!.disabled,true);await click(document.querySelectorAll<HTMLElement>('.ship-row')[0]);assert.match(coach(),/调整部署/);await click(hex(1,12));await click(button('完成部署'));assert.match(coach(),/本课完成/);await next();
 await contextClick(7,10);await contextClick(8,10);assert.match(coach(),/本课完成/);await next();
 await click(button('左转60'));await click(button('前进 W'));await click(button('右转60'));await click(button('原地转向'));await click(button('直行 Z'));await click(button('前进 W'));assert.match(coach(),/本课完成/);await next();
 await click(button('撤销航点'));assert.match(coach(),/重做/);assert.equal(button!('重做修改')!.disabled,false,'segment undo enables redo');await click(button('重做修改'));assert.match(coach(),/从节点改道/);await click(document.querySelector<HTMLElement>('[data-map-plan="0-0"] [data-map-node][data-editable="true"]'));await click(button('重新规划'));assert.match(coach(),/本课完成/);
 await next();await click(document.querySelectorAll<HTMLElement>('.ship-row')[0]);await click(document.querySelectorAll<HTMLElement>('.ship-row')[1]);
 const executeLesson=async()=>{button!('执行回合')!.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));assert.equal(vm.busy,true);assert.equal(vm.finished,null,'skip waits for simulation result');await settleGame();const deadline=Date.now()+6000;while((!button('跳过动画')||button!('跳过动画')!.disabled)&&Date.now()<deadline){await wait(30);await flush();}assert.ok(button('跳过动画'),'real engine resolves practice round');await click(button('跳过动画'));};
 await executeLesson();assert.match(coach(),/本课完成/);assert.match(document.querySelectorAll<HTMLElement>('.ship-row')[0].textContent,/65/);await next();
 await click(button('显示范围'));assert.match(coach(),/靠近并侦察/);await contextClick(7,10);await executeLesson();assert.match(coach(),/检查新接触/);await click(hex(11,10));await contextClick(5,10);await executeLesson();assert.match(coach(),/确认没有敌舰幽灵/);await click(hex(11,10));assert.match(coach(),/本课完成/);await next();
 await click(button('主炮 G'));for(let i=0;i<3;i++)await click(hex(11,10));assert.match(coach(),/看回合末落弹/);await executeLesson();assert.match(coach(),/空过一轮/);await executeLesson();assert.match(coach(),/练习保存/);await click(button('练习保存'));assert.match(coach(),/本课完成/);await next();
 await click(button('鱼雷 T'));await chooseSelect('发射窗口',0);await flush();await click(hex(5,11));await chooseSelect('发射窗口',1);await flush();await click(hex(6,11));await executeLesson();assert.match(coach(),/本课完成/);await next();
 await click(button('飞机 F'));await click(hex(10,10));await executeLesson();assert.match(coach(),/本课完成/);await next();await click(button('排雷 M'));await click(hex(6,10));await executeLesson();assert.match(coach(),/本课完成/);
 assert.equal(localStorage.getItem('azurlane-chess:v1:auto'),auto,'tutorial does not mutate normal autosave');await click(button('退出教学'));await click(button('继续当前战局'));assert.equal(document.querySelectorAll<HTMLElement>('.action-item.movement').length,1,'normal battle restored');assert.ok(button('显示范围'),'existing normal session restores its own hidden-range preference');assert.equal(errors.length,0,errors.join('\n'));
});

afterAll(()=>wrapper.unmount());
