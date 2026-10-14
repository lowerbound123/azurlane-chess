import {playerView} from '../server/views.ts';
import type {ClientMatch} from '../shared/network.ts';
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

document.body.innerHTML='<div id="app"></div>';
const flush=async()=>{await settleGame();};
const button=(text:string)=>[...document.querySelectorAll<HTMLButtonElement>('button')].find(el=>el.textContent.trim()===text);
const click=async (el:HTMLElement|null|undefined)=>{assert.ok(el);el.click();await flush();};
const choose=async(value:string)=>chooseSelect('AI 模式',value);
class Socket extends TestSocket {
 static current:Socket;
 constructor(){super();this.readyState=1;Socket.current=this;queueMicrotask(()=>this.onopen?.());}
 send(text:string){const message=JSON.parse(text);Socket.commands.push(message);queueMicrotask(()=>this.onmessage?.({data:JSON.stringify({type:'ack',id:message.id,ok:true})}));}
 push(state:OnlineState){this.onmessage({data:JSON.stringify({type:'state',...state})});}
 close(){this.onclose?.();}
 static commands:{type:string;payload:{modelId:string;aiMode:string;roster:string[]}}[]=[];
}
vi.stubGlobal('WebSocket',Socket);
vi.stubGlobal('fetch',mockFetch(async url=>({ok:true,status:200,json:async()=>url==='/api/config'?{auth:{enabled:false},serverId:'test',protocolVersion:2,models:[{id:'test-model',name:'测试模型'}]}:url==='/api/auth/me'?{user:null}:{token:'guest-token',playerId:'guest',nickname:'访客',serverId:'test',identityType:'guest'}})));
const {session:vm,router,wrapper}=await mountGame();
await vm.connectOnline('测试');
afterAll(()=>wrapper.unmount());

test('AI mode defaults to standard and FULL choice follows route navigation into the start command',async()=>{
 await vm.router.push('/new/ai/test-model');await flush();
 assert.equal(document.querySelector<HTMLElement>('[aria-label="AI 模式"]')?.dataset.value,'standard');
 await choose('full');
 assert.match(document!.querySelector<HTMLElement>('.ai-mode-help')!.textContent,/全部已完成回合.*可见战况.*己方指令/);
 assert.match(document!.querySelector<HTMLElement>('.ai-mode-help')!.textContent,/请求用量/);
 await click(button('游戏模式'));assert.equal(window.location.pathname,'/new');
 await click(document.querySelector<HTMLButtonElement>('[data-mode="ai:test-model"]'));assert.equal(document.querySelector<HTMLElement>('[aria-label="AI 模式"]')?.dataset.value,'full');
 await click(button('完成编队 · 开始 AI 对战'));
 const requests=Socket.commands.filter(c=>c.type==='ai.start');assert.equal(requests.length,1);assert.equal(requests[0].payload.aiMode,'full');assert.equal(requests[0].payload.modelId,'test-model');assert.equal(requests[0].payload.roster.length,5);
});

test('AI controls lock during submission and running games display authoritative mode and history count',async()=>{
 vm.onlinePending=true;await flush();assert.equal(document!.querySelector<HTMLInputElement>('[aria-label="AI 模式"]')!.disabled,true);assert.equal(button!('完成编队 · 开始 AI 对战')!.disabled,true);vm.onlinePending=false;
 const game=E.createGame(E.DEFAULT_ROSTER,42);game.phase='plan';game.ships=game.ships.filter(ship=>ship.team===0);Reflect.set(game,'visible',game.ships.map(ship=>E.key(ship.pos)));game.explored=[(Reflect.get(game,'visible') as string[]),[]];
 const match:ClientMatch={id:'full-battle',kind:'ai',myTeam:0,stage:'plan',round:4,game:playerView(game,0),submitted:[false,false],disconnects:[],deadline:null,aiName:'测试模型',aiMode:'full',aiHistoryRounds:3};
 Socket.current.push({player:{id:'guest',nickname:'访客'},room:null,queue:null,match});await flush();
 assert.equal(window.location.pathname,'/battle/online/full-battle',JSON.stringify({error:vm.onlineError,status:vm.onlineStatus,route:vm.router.currentRoute.value.name,match:vm.onlineState?.match?.id}));assert.equal(document.querySelector<HTMLElement>('[aria-label="AI 模式"]'),null);
 assert.match(document!.querySelector<HTMLElement>('.online-battle-status .ai-mode-status')!.textContent,/FULL.*3.*回合/);
 Socket.current.push({player:{id:'guest',nickname:'测试'},room:null,queue:null,match:{...match,aiHistoryRounds:4}});await flush();assert.match(document!.querySelector<HTMLElement>('.online-battle-status .ai-mode-status')!.textContent,/4.*回合/);
 Socket.current.push({player:{id:'guest',nickname:'测试'},room:null,queue:null,match:{...match,aiMode:'standard'}});await flush();assert.match(document!.querySelector<HTMLElement>('.online-battle-status .ai-mode-status')!.textContent,/普通/);assert.doesNotMatch(document!.querySelector<HTMLElement>('.online-battle-status .ai-mode-status')!.textContent,/历史/);
});

test('AI thinking popup follows submitted orders and real server responses',async()=>{
 const match:ClientMatch={...vm.onlineState!.match!,kind:'ai',stage:'plan',submitted:[false,false],aiStatus:'thinking',aiName:'测试模型'};
 const push=async(patch:Partial<ClientMatch>)=>{Socket.current.push({player:{id:'guest',nickname:'访客'},room:null,queue:null,match:{...match,...patch}});await flush();};
 const popup=()=>document.querySelector<HTMLElement>('.ai-thinking-card');
 await push({});assert.equal(popup(),null,'AI prefetch while planning must not interrupt the player');
 const execute=[...document.querySelectorAll<HTMLButtonElement>('button')].find(el=>el.textContent.includes('执行回合'));
 await click(execute);assert.equal(popup(),null,'command acknowledgement is not an AI response or authoritative submission');
 await push({submitted:[true,false]});assert.ok(popup(),'submitted orders wait for the thinking AI');assert.match(popup()!.textContent,/测试模型正在思考/);assert.equal(popup()!.getAttribute('role'),'status');
 await push({submitted:[true,true],aiStatus:'ready',stage:'resolving'});assert.equal(popup(),null,'real AI response closes the popup before round playback');
 await push({submitted:[true,true],aiStatus:'ready'});assert.equal(popup(),null,'AI that answered before submission needs no waiting popup');
 await push({submitted:[true,false]});assert.ok(popup());await click(button('撤回命令'));await push({submitted:[false,false]});assert.equal(popup(),null);
 await push({submitted:[true,false],aiStatus:'error',aiError:'AI 请求超时'});assert.equal(popup(),null);assert.match(document.querySelector<HTMLElement>('.online-battle-status')!.textContent,/AI 请求超时/);await click(button('重试 AI'));
 await push({submitted:[true,false]});assert.ok(popup(),'retry returns to real thinking state');
 vm.onlineStatus='reconnecting';await flush();assert.equal(popup(),null,'disconnected state cannot claim the AI is still thinking');vm.onlineStatus='connected';await flush();assert.ok(popup());
 await vm.goHome();await flush();assert.equal(popup(),null);await vm.enterOnlineBattle();await flush();assert.ok(popup());
 await push({kind:'pvp',submitted:[true,false]});assert.equal(popup(),null,'waiting for a human opponent is not AI thinking');
 await push({submitted:[true,false],stage:'ended'});assert.equal(popup(),null,'ended matches close the thinking popup');
 await push({aiStatus:'ready',submitted:[false,true]});
});

test('an existing online match disables starting a second AI flow while home remains usable',async()=>{
 await vm.goHome();await flush();assert.equal(vm.onlineActive,false);assert.ok(button('继续在线流程'));
 await vm.router.push('/new');await flush();assert.ok(document.querySelector<HTMLElement>('.resume-bar'));assert.equal(document!.querySelector<HTMLButtonElement>('[data-mode="ai:test-model"]')!.disabled,true);
});
