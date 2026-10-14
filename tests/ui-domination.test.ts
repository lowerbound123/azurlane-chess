// @vitest-environment happy-dom
import {afterAll,test,vi} from 'vitest';
import assert from 'node:assert/strict';
import {mountGame,settleGame,chooseSelect} from './helpers/mount-game.ts';
import {BattleMap3D} from './helpers/battle-map-test-adapter.ts';
import {TestSocket} from './helpers/socket.ts';
import {mockFetch} from './helpers/fetch.ts';
import * as E from '../src/engine.ts';
import {createDominationState} from '../shared/domination.ts';
import type {OnlineState} from '../shared/network.ts';
import {toRaw} from 'vue';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {Board} from '../src/scene/board.ts';
import {TacticalModels} from '../src/scene/tactical-models.ts';
import ChoiceSelect from '../src/components/ChoiceSelect.vue';

class Socket extends TestSocket {
 static current:Socket;static commands:{type:string;payload:Record<string,unknown>}[]=[];
 constructor(){super();Socket.current=this;queueMicrotask(()=>this.onopen());}
 send(data:string){const message=JSON.parse(data);Socket.commands.push(message);queueMicrotask(()=>this.onmessage({data:JSON.stringify({type:'ack',id:message.id,ok:true})}));}
 push(state:OnlineState){this.onmessage({data:JSON.stringify({type:'state',...state})});}
}
vi.stubGlobal('WebSocket',Socket);
vi.stubGlobal('fetch',mockFetch(async url=>({ok:true,status:200,json:async()=>url==='/api/config'?{auth:{enabled:false},protocolVersion:2,serverId:'test',battleModes:['annihilation','domination'],models:[{id:'model',name:'测试 AI'}]}:url==='/api/auth/me'?{user:null}:{token:'token',playerId:'guest',nickname:'访客',serverId:'test',identityType:'guest'}})));
document.body.innerHTML='<div id="app"></div>';
const {session:vm,router,wrapper}=await mountGame();
const flush=()=>settleGame();
const panel=()=>document.querySelector<HTMLElement>('[aria-label="占领计分"]');
afterAll(()=>wrapper.unmount());

test('local battle mode choice creates 357 cells and keeps public objectives when plans are hidden',async()=>{
 await router.push('/new/local');await flush();
 assert.equal(document.querySelector<HTMLElement>('[aria-label="对战模式"]')?.dataset.value,'annihilation');
 await chooseSelect('对战模式','domination');vm.start(true);await flush();
 assert.equal(vm.game!.battleMode,'domination');assert.equal(document.querySelectorAll('[data-map-cell]').length,357);
 assert.ok(panel());assert.match(panel()!.textContent!,/目标.*100/);
 vm.showPlans=false;await flush();
 const model=wrapper.findComponent(BattleMap3D).props('model');
 assert.equal(model.domination!.points.length,3);assert.equal(model.showPlans,false);
 assert.ok(model.cells.filter((cell: {known:boolean})=>!cell.known).length>0);
 assert.ok(model.cells.every((cell:{known:boolean;island:boolean})=>cell.known||!cell.island),'objectives do not reveal unknown islands');
});

test('scoreboard reports public progress, contested income, gain sources and predictions',async()=>{
 vm.seed=42;vm.game=E.createFleetGame(undefined,42,undefined,'domination');await router.push('/battle/local');
 const state=createDominationState();state.scores=[35,15];state.lastRound=3;state.lastGain={round:3,points:[5,0],ships:[15,15]};
 Object.assign(state.points[0],{owner:0,capturedRound:2});Object.assign(state.points[1],{progressTeam:0,progress:50,contested:true});Object.assign(state.points[2],{owner:1,capturedRound:2,contested:true});
 vm.game!.domination=state;await flush();
 assert.equal(panel()!.querySelector('[data-team-score="0"]')!.textContent,'35');
 assert.match(panel()!.textContent!,/每回合.*5.*0/);assert.match(panel()!.textContent!,/预测.*13.*轮/);
 assert.match(panel()!.textContent!,/据点.*\+5.*击沉.*\+15/);assert.match(panel()!.textContent!,/50%/);assert.match(panel()!.textContent!,/争夺中/);
 assert.match(panel()!.textContent!,/占领本轮完成，下轮开始产分/);
});

test('replay scoreboard and map use frame score without leaking final resolved score',async()=>{
 const frame=E.clone(toRaw(vm.game!.domination!));frame.scores=[40,15];
 vm.game!.domination!.scores=[90,70];
 const result=E.resolveRound(E.clone(toRaw(vm.game!)),{});result.game.domination!.scores=[100,85];vm.finished=result;vm.busy=true;
 vm.playFrame={...result.frames[0],domination:frame};await flush();
 assert.equal(panel()!.querySelector('[data-team-score="0"]')!.textContent,'40');
 assert.equal(wrapper.findComponent(BattleMap3D).props('model').domination!.scores[0],40);
 vm.busy=false;vm.finished=null;vm.playFrame=null;
});

test('loaded games restore mode selector and legacy games keep annihilation defaults',async()=>{
 const save=vm.snapshot()!;vm.battleMode='annihilation';vm.applySavedState(save,false);await router.push('/new/local');await flush();
 assert.equal(document.querySelector<HTMLElement>('[aria-label="对战模式"]')?.dataset.value,'domination');
 save.game=E.createFleetGame();vm.applySavedState(save,false);await flush();
 assert.equal(document.querySelector<HTMLElement>('[aria-label="对战模式"]')?.dataset.value,'annihilation');
 vm.start(true);await flush();assert.equal(document.querySelectorAll('[data-map-cell]').length,285);assert.equal(panel(),null);
});

test('AI, room creation and matchmaking commands carry selected mode and room guests see host choice',async()=>{
 await vm.connectOnline();
 for(const [route,type,action] of [['/new/ai/model','ai.start',()=>vm.startAIMatch()],['/rooms/create','room.create',()=>vm.createRoom()],['/matchmaking','queue.join',()=>vm.startMatchmaking()]] as const){
  await router.push(route);await flush();await chooseSelect('对战模式','domination');await action();
  assert.equal(Socket.commands.filter(c=>c.type===type).at(-1)!.payload.battleMode,'domination');
 }
 Socket.current.push({player:{id:'guest',nickname:'访客'},room:{code:'TEST',hostId:'host',turnSeconds:0,battleMode:'domination',players:[{id:'host',nickname:'房主',ready:false},{id:'guest',nickname:'访客',ready:false}]},queue:null,match:null});
 await router.push('/rooms/TEST');await flush();
 const select=document.querySelector<HTMLElement>('[aria-label="对战模式"]');assert.equal(select?.dataset.value,'domination');assert.equal(select?.getAttribute('disabled'),'');
});

test('round completion exposes actual 50 percent capture from final ship position',async()=>{
 Socket.current.push({player:{id:'guest',nickname:'访客'},room:null,queue:null,match:null});await flush();
 vm.seed=42;vm.game=E.createFleetGame(undefined,42,undefined,'domination');vm.game.phase='plan';
 const ship=vm.game.ships[0];ship.pos={...vm.game.domination!.points[0].center};ship.xy=E.hexToXY(ship.pos);
 await router.push('/battle/local');await flush();await vm.execute();vm.complete();await flush();
 assert.ok(panel(),JSON.stringify({route:router.currentRoute.value.fullPath,domination:vm.game?.domination,frame:vm.playFrame?.domination,busy:vm.busy,game:vm.game?.battleMode,phase:vm.phase,finished:!!vm.finished,toast:vm.toast}));
 assert.match(panel()!.querySelector('[data-capture-point="A"]')!.textContent!,/我方占领 50%/);
});

test('three objective boundaries render through fog during deploy, execution and hidden plans',async()=>{
 const context={fillRect(){},strokeRect(){},fillText(){}};
 const canvas=vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
 const bytes=(name:string)=>{const data=readFileSync(new URL('../assets/models/'+name,import.meta.url));return data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength) as ArrayBuffer;};
 const library=await TacticalModels.fromBytes(bytes('aircraft.glb'),bytes('naval-mine.glb'));
 const board=new Board(new THREE.Scene(),library);
 const state=createDominationState();
 const cells=E.allHexes({width:21,height:17}).map(h=>({...h,k:E.key(h),known:false,visible:false,island:false}));
 const model={...toRaw(vm.mapModel),cells,mines:[],ships:[],previews:[],domination:state,showPlans:false,showRanges:false};
 for(const phase of ['deploy','execute','plan']){
  board.update({...model,phase});
  const boundaries:THREE.Object3D[]=[];board.root.traverse(object=>{if(object.userData.capturePoint)boundaries.push(object);});
  assert.deepEqual(boundaries.map(object=>object.userData.capturePoint).sort(),['A','B','C']);
  assert.equal(board.islands.children.length,0,'public circle boundary cannot expose unknown terrain');
 }
 board.dispose();library.dispose();canvas.mockRestore();
});

test('old online servers disable unsupported domination and reject stale selection without blocking annihilation',async()=>{
 vm.onlineConfig={models:[{id:'model',name:'测试 AI'}]};vm.configStale=false;vm.configLoading=false;
 await router.push('/rooms/create');await flush();
 const selectors=wrapper.findAllComponents(ChoiceSelect).map(c=>c.props() as {label?:string;items:{value:string;disabled?:boolean}[]});
 const selector=selectors.find(c=>c.label==='对战模式')!;
 assert.equal(selector.items.find(item=>item.value==='domination')!.disabled,true);
 assert.match(document.querySelector('.battle-mode-select')!.textContent!,/服务器.*不支持.*占领/);
 vm.onlineBattleMode='domination';const before=Socket.commands.length;
 assert.equal(await vm.createRoom(),false);assert.equal(Socket.commands.length,before);assert.match(vm.onlineError,/服务器.*不支持.*占领/);
 vm.onlineBattleMode='annihilation';assert.equal(await vm.createRoom(),true);assert.equal(Socket.commands.at(-1)!.payload.battleMode,'annihilation');
 vm.configLoading=true;await flush();assert.match(document.querySelector('.battle-mode-select')!.textContent!,/读取服务器/);
 vm.configLoading=false;vm.configStale=true;await flush();assert.match(document.querySelector('.battle-mode-select')!.textContent!,/配置暂不可用/);
});
