import {playerView,validateOrders} from '../server/views.ts';
import type {Plans} from '../shared/game.ts';
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
window.document.body.innerHTML='<div id="app"></div>';
const errors:string[]=[];console.error=(...args)=>errors.push(args.join(' '));
class Socket extends TestSocket {
 static current:Socket;last!:{type:string;matchId:string;payload:{ready:boolean;positions:{id:string}[];plans:Plans}};constructor(){super();this.readyState=1;Socket.current=this;queueMicrotask(()=>this.onopen());}send(text:string){const message=JSON.parse(text);this.last=message;queueMicrotask(()=>this.onmessage({data:JSON.stringify({type:'ack',id:message.id,ok:true})}));}push(message:unknown){this.onmessage({data:JSON.stringify(message)});}close(){this.onclose?.();}}
vi.stubGlobal('WebSocket',Socket);
vi.stubGlobal('fetch',mockFetch(async url=>({ok:true,json:async()=>url==='/api/config'?{serverId:'test',protocolVersion:2,models:[],roomLimits:[0,60]}:{token:'secret',playerId:'me',nickname:'指挥官',serverId:'test'}})));
const {session:vm,router,wrapper}=await mountGame();
const flush=async()=>{await settleGame();};
const button=(text:string)=>[...document.querySelectorAll<HTMLButtonElement>('button')].find(el=>el.textContent.includes(text));
const click=async (el:HTMLElement|null|undefined)=>{assert.ok(el);el.click();await flush();};
test('online entry and team-one authoritative battle submission preserve offline storage',async()=>{
 await click(document.querySelector<HTMLButtonElement>('.server-connect'));assert.ok(document.querySelector<HTMLElement>('.connection-card'));await click([...document.querySelectorAll<HTMLButtonElement>('.connection-card button')].find(el=>el.textContent.includes('连接服务器')));assert.equal(window.location.pathname,'/');
 const game=E.createGame(E.DEFAULT_ROSTER,42);game.ships=game.ships.filter(s=>s.team===1);const visible=game.ships.map(s=>E.key(s.pos));game.explored=[[],visible];game.phase='plan';
 const match={id:'m',kind:'pvp',myTeam:1,stage:'plan',round:1,game:playerView(game,1),submitted:[false,false],disconnects:[],deadline:null};
 Socket.current.push({type:'state',player:{id:'me',nickname:'指挥官'},room:null,queue:null,match:{...match,stage:'deploy'}});await flush();
 await vm.enterOnlineBattle();await flush();
 assert.match(document!.querySelector<HTMLElement>('.deployment-help')!.textContent,/部署到右上角/);
 await vi.waitFor(()=>assert.ok(document.querySelector('[data-map-cells]')));
 const free=E.deployment(1).find(h=>!game.ships.some(s=>E.same(s.pos,h)));await click(document.querySelector<HTMLElement>(`[data-map-cell="${E.key(free!)}"]`));assert.equal(Socket.current.last.type,'deploy.update');assert.equal(Socket.current.last.payload.ready,false);assert.ok(Socket.current.last.payload.positions.every((s)=>s.id.startsWith('1-')));
 await click(button('完成部署'));assert.equal(Socket.current.last.payload.ready,true);
 Socket.current.push({type:'state',player:{id:'me',nickname:'指挥官'},room:null,queue:null,match});await flush();
 assert.equal(document.querySelectorAll<HTMLElement>('.ship-row').length,5);assert.match(document!.querySelector<HTMLElement>('.online-battle-status')!.textContent,/我方 2 队/);
 await click(button('前进 W'));await click(button('执行回合'));assert.equal(Socket.current.last.type,'orders.submit');assert.equal(Socket.current.last.matchId,'m');assert.ok(Object.keys(Socket.current.last.payload.plans).every(id=>id.startsWith('1-')));assert.equal(game.round,1);
 Socket.current.push({type:'state',player:{id:'me',nickname:'测试'},room:null,queue:null,match:{...match,submitted:[false,true]}});await flush();assert.ok(button!('执行回合')!.disabled);await click(button('撤回命令'));assert.equal(Socket.current.last.type,'orders.withdraw');
 assert.equal(localStorage.getItem('azurlane-chess:v1:auto'),null,'online match never overwrites local autosave');assert.equal(errors.length,0,errors.join('\n'));
});

async function cooldownFixture(){
 await vm.goHome();await flush();
 const game=E.createGame();game.phase='plan';game.round=4;game.map.islands=[];E.updateExploration(game);
 const bb=game.ships.find(s=>s.team===0&&s.template==='bb')!;
 const state:OnlineState={type:'state',player:{id:'me',nickname:'指挥官'},room:null,queue:null,match:{id:'cooldown',kind:'pvp',myTeam:0,stage:'plan',round:4,game:playerView(game,0),submitted:[false,false],disconnects:[],deadline:null}};
 Socket.current.push(state);await flush();await vm.enterOnlineBattle();await flush();vm.choose(bb);vm.setMode('main');assert.equal(vm.mode,'main');
 return {game,bb,state};
}
test('new online round resets the previous artillery operation before accepting map clicks',async()=>{
 const {game,bb,state}=await cooldownFixture();
 game.round=5;bb.mainReady=6;state.match={...state.match!,round:5,game:playerView(game,0)};Socket.current.push(state);await flush();
 assert.equal(vm.mode,'move','new round must leave the previous main-gun operation');
});
test('a map click cannot queue artillery while loading even if the operation was already selected',async()=>{
 const {game,bb,state}=await cooldownFixture();bb.mainReady=6;state.match={...state.match!,game:playerView(game,0)};Socket.current.push(state);await flush();
 const target=E.add(bb.pos,0);vm.clickHex(target,undefined);await flush();
 assert.equal(vm.plans[bb.id]?.main.length??0,0,'cooldown must be checked at the command creation boundary');
 assert.doesNotThrow(()=>validateOrders(game,0,JSON.parse(JSON.stringify(vm.plans))));
});
test('online replay completion resets weapon mode and movement input for the next round',async()=>{
 await cooldownFixture();vm.pendingTurn=1;vm.torpWindow=2;vm.replan=true;vm.complete();await flush();
 assert.equal(vm.mode,'move');assert.equal(vm.pendingTurn,0);assert.equal(vm.torpWindow,0);assert.equal(vm.replan,false);
});
afterAll(()=>wrapper.unmount());
