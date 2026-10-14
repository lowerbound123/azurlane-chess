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
import { playerView } from '../server/views.ts';

document.body.innerHTML='<div id="app"></div>';
const models=[{id:'one',name:'测试模型一'},{id:'two',name:'测试模型二'}];
const empty=():OnlineState=>({type:'state',player:{id:'me',nickname:'指挥官'},room:null,queue:null,match:null});
class Socket extends TestSocket {
 static current:Socket;
  static commands:string[]=[]; static state:OnlineState=empty(); static fail:string|null=null;
  constructor(){super();this.readyState=1;Socket.current=this;queueMicrotask(()=>this.onopen());}
  send(raw:string){const m=JSON.parse(raw);Socket.commands.push(m.type);queueMicrotask(()=>{
    if(m.type===Socket.fail)return this.push({type:'error',id:m.id,code:'TEST_FAILURE',message:'测试拒绝退出'});
    if(m.type==='match.resign'&&Socket.state.match)Socket.state={...Socket.state,match:{...Socket.state.match,stage:'ended'}};
    if(m.type==='match.leave')Socket.state=empty();
    if(m.type==='room.leave')Socket.state={...Socket.state,room:null};
    if(m.type==='queue.leave')Socket.state={...Socket.state,queue:null};
    this.push(Socket.state);this.push({type:'ack',id:m.id,ok:true});
  });}
  push(message:unknown){this.onmessage({data:JSON.stringify(message)});}
  close(){this.readyState=3;this.onclose?.();}
}
vi.stubGlobal('WebSocket',Socket);
let configOverride:(()=>Promise<{ok:boolean;json?:()=>Promise<unknown>}>)|null=null;
vi.stubGlobal('fetch',mockFetch(async url=>configOverride&&url==='/api/config'?configOverride():({ok:true,json:async()=>url==='/api/config'?{protocolVersion:2,serverId:'test',models,roomLimits:[0,60]}:url==='/api/session'?{protocolVersion:2,serverId:'test',token:'test',playerId:'me'}:{enabled:false,user:null}})));
const errors:string[]=[];const previousError=console.error;console.error=(...args)=>errors.push(args.join(' '));
const {session:vm,router,wrapper}=await mountGame();
const flush=async()=>{await settleGame();await settleGame();await new Promise(r=>setTimeout(r,0));};
const navigate=async (path:string)=>{assert.ok(vm.router,'Vue Router is installed');await vm.router.push(path);await flush();};
const click=async (selector:string)=>{const el=document.querySelector<HTMLElement>(selector);assert.ok(el,selector);el.click();await flush();};
await vm.router?.isReady();await flush();
afterEach(async()=>{Socket.fail=null;Socket.state=empty();vm.connectionOpen=false;vm.disconnectOpen=false;if(Socket.current?.readyState===1)Socket.current.push(empty());vm.goHome();await flush();});
afterAll(()=>{wrapper.unmount();console.error=previousError;});

test('connection opens a card without changing the current URL or page',async()=>{
  await click('.top-actions button.server-connect');
  assert.equal(window.location.pathname,'/');assert.ok(document.querySelector<HTMLElement>('[aria-label="连接服务器"]'));
  assert.ok(document.querySelector<HTMLElement>('.home-screen'));
  document.querySelector<HTMLElement>('[aria-label="访客昵称"]')?.focus();
  document.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await flush();
  assert.equal(document.querySelector<HTMLElement>('[aria-label="连接服务器"]'),null);
});
test('new game uses a real route with independently disabled online choices',async()=>{
  vm.newGame();await flush();assert.equal(window.location.pathname,'/new');
  assert.ok(document.querySelector<HTMLButtonElement>('[data-mode="local"]'));assert.equal(document!.querySelector<HTMLButtonElement>('[data-mode="local"]')!.disabled,false);
  assert.equal(document.querySelectorAll<HTMLButtonElement>('[data-mode^="ai:"]').length,2);
  for(const el of document.querySelectorAll<HTMLButtonElement>('[data-online-mode]'))assert.equal(el.disabled,true);
});
test('navigation and back preserve the local session without starting another game',async()=>{
  vm.game=E.createGame();vm.game.phase='plan';vm.plans={'0-0':{...E.emptyPlan(),moves:[{turn:1,forward:false}]}};
  await navigate('/battle/local');await navigate('/guide');assert.ok(document.querySelector<HTMLElement>('.tutorial-book'));
  await navigate('/battle/local');assert.equal(vm.plans['0-0'].moves[0].turn,1);
  await navigate('/not-a-page');assert.ok(document.querySelector<HTMLElement>('[data-page="not-found"]'));
});
test('connected mode choices follow public models and route visits do not create games',async()=>{
  await vm.connectOnline('测试');await navigate('/new');
  assert.equal(document!.querySelector<HTMLButtonElement>('[data-mode="ai:one"]')!.disabled,false);
  const before=Socket.commands.length;
  for(const path of ['/rooms/create','/rooms/join','/matchmaking','/new/ai/one'])await navigate(path);
  assert.equal(Socket.commands.length,before,'visiting or refreshing an entry must not create a room, queue or AI match');
  await navigate('/new/ai/unknown');assert.equal(vm.router.currentRoute.value.path,'/new');
});
test('explicit disconnect resigns then leaves before closing and clears connection intent',async()=>{
  await vm.connectOnline('测试');
  const game=E.createGame();game.phase='plan';Socket.state={...empty(),match:{id:'m',kind:'ai',myTeam:0,stage:'plan',round:1,game:playerView(game,0),submitted:[false,false],disconnects:[]}};
  Socket.current.push(Socket.state);await navigate('/battle/online/m');
  assert.equal(typeof vm.confirmDisconnect,'function');
  const before=Socket.commands.length;await vm.confirmDisconnect();await flush();
  assert.deepEqual(Socket.commands.slice(before),['match.resign','match.leave']);
  assert.equal(vm.onlineStatus,'disconnected');assert.equal(vm.router.currentRoute.value.path,'/');
  assert.equal(vm.connectionWanted,false);
});
test('a rejected leave does not close the connection or report success',async()=>{
  await vm.connectOnline('测试');Socket.state={...empty(),room:{code:'ABC',players:[{id:'me',nickname:'指挥官',ready:false}],hostId:'me',turnSeconds:0}};Socket.current.push(Socket.state);
  Socket.fail='room.leave';assert.equal(typeof vm.confirmDisconnect,'function');await vm.confirmDisconnect();await flush();
  assert.equal(vm.onlineStatus,'connected');assert.ok(vm!.onlineState!.room);assert.equal(vm.connectionWanted,true);assert.match(vm.onlineError,/拒绝退出/);
});
test('cancel disconnect preserves the match, and rejected resignation never leaves or closes',async()=>{
  await vm.connectOnline('测试');const game=E.createGame();game.phase='plan';Socket.state={...empty(),match:{id:'cancel',kind:'ai',myTeam:0,stage:'plan',round:1,game:playerView(game,0),submitted:[false,false],disconnects:[]}};
  Socket.current.push(Socket.state);await navigate('/battle/online/cancel');
  const before=Socket.commands.length;vm.requestDisconnect();await flush();assert.ok(document.querySelector<HTMLElement>('.connection-card'));vm.closeConnectionCard();await flush();
  assert.equal(vm.onlineStatus,'connected');assert.equal(vm!.onlineState!.match!.id,'cancel');assert.equal(Socket.commands.length,before);
  Socket.fail='match.resign';vm.requestDisconnect();await vm.confirmDisconnect();await flush();assert.deepEqual(Socket.commands.slice(before),['match.resign']);assert.equal(vm.onlineStatus,'connected');assert.equal(vm!.onlineState!.match!.stage,'plan');assert.match(vm.onlineError,/拒绝退出/);
});
test('connection card traps focus, restores its trigger and suppresses battle shortcuts',async()=>{
  vm.game=E.createGame();vm.game.phase='plan';vm.plans={};await navigate('/battle/local');
  const trigger=document.querySelector<HTMLButtonElement>('.server-connect');trigger!.focus();trigger!.click();await flush();
  const controls=[...document.querySelectorAll<HTMLButtonElement>('.connection-card button:not(:disabled),.connection-card input:not(:disabled)')];controls!.at(-1)!.focus();
  controls!.at(-1)!.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));assert.equal(document.activeElement,controls[0]);
  window.dispatchEvent(new window.KeyboardEvent('keydown',{key:'w',bubbles:true}));assert.deepEqual(vm.plans,{});
  window.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await flush();assert.equal(document.activeElement,trigger);
});
test('a dropped connection retains the flow and cannot falsely confirm a server exit',async()=>{
  await vm.connectOnline('测试');Socket.state={...empty(),queue:{position:1}};Socket.current.push(Socket.state);vm.onlineStatus='reconnecting';
  const before=Socket.commands.length;vm.requestDisconnect();await flush();assert.equal(document!.querySelector<HTMLButtonElement>('.connection-card .danger')!.disabled,true);
  assert.equal(await vm.confirmDisconnect(),false);assert.ok(vm!.onlineState!.queue);assert.equal(Socket.commands.length,before);assert.equal(vm.connectionWanted,true);
  vm.onlineStatus='connected';assert.equal(await vm.confirmDisconnect(),true);assert.deepEqual(Socket.commands.slice(before),['queue.leave']);assert.equal(vm.onlineStatus,'disconnected');
});
test('foreign room links prefill joining, and invalid match or lesson links recover without creating anything',async()=>{
  await vm.connectOnline('测试');const before=Socket.commands.length;
  await navigate('/rooms/INVITE');assert.equal(vm.router.currentRoute.value.path,'/rooms/join');assert.equal(vm.roomCode,'INVITE');
  await navigate('/battle/online/expired');assert.equal(vm.router.currentRoute.value.path,'/new');assert.match(vm.toast,/失效/);
  await navigate('/tutorial/unknown');assert.equal(vm.router.currentRoute.value.path,'/tutorial');assert.equal(Socket.commands.length,before);
});
test('help is an accessible icon and has no visible rules label',async()=>{
  const help=document.querySelector<HTMLButtonElement>('button[aria-label="规则与操作"]');assert.ok(help);assert.ok(help.querySelector('svg'));assert.equal(help.textContent.trim(),'');
  assert.equal(errors.length,0,errors.join('\n'));
});
test('home save management is a routed page rather than a modal',async()=>{
  await navigate('/saves');assert.ok(document.querySelector<HTMLElement>('.save-page'));assert.equal(document.querySelector<HTMLElement>('.save-backdrop'),null);
  assert.equal(document!.querySelector<HTMLElement>('.save-manager')!.getAttribute('role'),'region');
});
test('disconnecting an ended match leaves directly without asking to resign',async()=>{
  await vm.connectOnline('测试');Socket.state={...empty(),match:{id:'ended',kind:'ai',stage:'ended',round:2,myTeam:0,game:null,submitted:[false,false],disconnects:[]}};Socket.current.push(Socket.state);
  const before=Socket.commands.length;await vm.requestDisconnect();await flush();assert.deepEqual(Socket.commands.slice(before),['match.leave']);assert.equal(vm.disconnectOpen,false);assert.equal(vm.onlineStatus,'disconnected');
});
test('automatic reconnect validates an invite visited while offline',async()=>{
  await vm.connectOnline('测试');Socket.current.readyState=3;Socket.current.onclose({code:1006});await navigate('/rooms/REJOIN');
  assert.equal(vm.onlineStatus,'reconnecting');await new Promise(resolve=>setTimeout(resolve,650));await flush();
  assert.equal(vm.onlineStatus,'connected');assert.equal(vm.router.currentRoute.value.path,'/rooms/join');assert.equal(vm.roomCode,'REJOIN');
});
test('an older failed config request cannot overwrite a successful connection',async()=>{
  await vm.confirmDisconnect();let rejectConfig;configOverride=()=>new Promise((resolve,reject)=>rejectConfig=reject);
  const pending=vm.refreshOnlineConfig();await flush();configOverride=null;await vm.connectOnline('测试');rejectConfig!(new Error('old request failed'));await pending;
  await navigate('/new');assert.equal(vm.onlineUnavailable,'');assert.equal(document!.querySelector<HTMLButtonElement>('[data-mode="ai:one"]')!.disabled,false);
});
test('fresh public models stay in memory when persisting them fails',async()=>{
  const original=[...models],setItem=localStorage.setItem;Object.defineProperty(localStorage,'setItem',{configurable:true,value:()=>{throw new Error('QuotaExceededError');}});
  try{models.splice(0,models.length,{id:'quota',name:'可用新模型'});await vm.refreshOnlineConfig();assert.deepEqual(vm.onlineConfig.models,[{id:'quota',name:'可用新模型'}]);await navigate('/new/ai/quota');assert.equal(vm.router.currentRoute.value.path,'/new/ai/quota');}
  finally{models.splice(0,models.length,...original);Object.defineProperty(localStorage,'setItem',{configurable:true,value:setItem});await vm.refreshOnlineConfig();}
});
test('an offline online-battle deep link shows a connection gate',async()=>{
  await vm.confirmDisconnect();await navigate('/battle/online/recover');assert.ok(document.querySelector<HTMLElement>('.route-connection-gate'));assert.match(document!.querySelector<HTMLElement>('.route-connection-gate')!.textContent,/连接服务器/);
});
test('a connected user can retry a failed model refresh without disconnecting',async()=>{
  await vm.connectOnline('测试');configOverride=async()=>({ok:false});await vm.refreshOnlineConfig();configOverride=null;await navigate('/new');
  const retry=[...document.querySelectorAll<HTMLButtonElement>('.mode-connection-note button')].find(el=>el.textContent==='重试模型列表');assert.ok(retry);retry.click();await flush();assert.equal(vm.onlineUnavailable,'');assert.equal(vm.onlineStatus,'connected');
});

afterAll(()=>wrapper.unmount());
