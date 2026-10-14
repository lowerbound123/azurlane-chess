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
let user:User|null=null, failList=true, failNext=true, posted: { password: unknown; }, registerCalls=0, releaseRegistration:()=>void;
const summary={id:'m1',mode:'friend',createdAt:0,endedAt:60000,durationMs:60000,rounds:2,endStage:'plan',enteredBattle:true,winner:0,reason:'对方认输',participants:[{team:0,nickname:'海风',roster:['ayanami']},{team:1,nickname:'访客',roster:[]}],myTeam:0};
const requests:string[]=[];
vi.stubGlobal('fetch',mockFetch(async(url,options={})=>{
 requests.push(url);let body;
 if(url==='/api/config')body={auth:{enabled:true},serverId:'srv',protocolVersion:2,models:[]};
 else if(url==='/api/auth/me')body={user};
 else if(url==='/api/auth/register'){registerCalls++;posted=JSON.parse(String(options.body));await new Promise<void>(resolve=>releaseRegistration=resolve);user={id:'u1',username:'海风'};body={user};}
 else if(url==='/api/auth/login'){if(JSON.parse(String(options.body)).password==='wrong')return {ok:false,status:401,json:async()=>({message:'用户名或密码错误'})};user={id:'u1',username:'海风'};body={user};}
 else if(url==='/api/auth/logout'){user=null;body={user:null};}
 else if(url==='/api/me/matches'){if(failList){failList=false;return {ok:false,status:503,json:async()=>({message:'战绩读取失败'})};}body={items:[summary],nextCursor:'page2'};}
 else if(url==='/api/me/matches?cursor=page2'){if(failNext){failNext=false;return {ok:false,status:503,json:async()=>({message:'下一页读取失败'})};}body={items:[],nextCursor:null};}
 else if(url==='/api/me/matches/m1')body={...summary,participants:summary.participants.map((p,i)=>({...p,ships:i?[{id:'1-0',catalogId:'dd-2',name:'轻装舰',template:'dd',damageDealt:0,friendlyDamage:0,damageTaken:{enemy:0,friendly:0,environment:0},shipsSunk:0,planesShotDown:0,hp:20,maxHp:20,alive:true,damageBySource:{}}]:[{id:'0-0',catalogId:'ayanami',name:'绫波',template:'DD',damageDealt:12.25,friendlyDamage:1,damageTaken:{enemy:2,friendly:0,environment:1},shipsSunk:1,planesShotDown:2,hp:17,maxHp:20,alive:true,damageBySource:{main:{dealt:10,friendly:0,taken:2},air:{dealt:2.25,friendly:1,taken:0},secondary:{dealt:0,friendly:0,taken:0},grounding:{dealt:0,friendly:0,taken:1}}}]}))};
 else if(url==='/api/session')body={identityType:'account',accountId:'u1',playerId:'a1',nickname:'海风',token:'token',serverId:'srv'};
 else throw new Error('unexpected '+url);
 return {ok:true,status:200,json:async()=>body};
}));
class Socket extends TestSocket {
 static current:Socket;constructor(){super();this.readyState=1;Socket.current=this;queueMicrotask(()=>this.onopen?.());}send(text:string){const m=JSON.parse(text);queueMicrotask(()=>this.onmessage?.({data:JSON.stringify({type:'ack',id:m.id,ok:true})}));}close(){this.onclose?.();}push(state:OnlineState){this.onmessage({data:JSON.stringify({type:'state',...state})});}}
vi.stubGlobal('WebSocket',Socket);
const {session:vm,router,wrapper}=await mountGame();
const flush=async()=>{await settleGame();};
const button=(text: string,root:ParentNode|null=document)=>[...root!.querySelectorAll('button')].find(el=>el.textContent.trim()===text);
const click=async (el:HTMLElement|null|undefined)=>{assert.ok(el);el.click();await flush();};
const fill=async(name: string,value: string)=>{const el=document.querySelector<HTMLInputElement>(`[name="${name}"]`);assert.ok(el);el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));await flush();};
test('enabled account journey validates confirmation, accepts spaces, traps focus, lists records, locks changes and logs out',async()=>{
 
 await flush();await click(button('注册',document.querySelector<HTMLElement>('.account-actions')));
 const dialog=document.querySelector<HTMLElement>('.account-dialog');assert.ok(dialog);assert.equal(dialog.getAttribute('role'),'dialog');
 assert.equal((document.activeElement as HTMLInputElement).name,'username');
 const focusable=[...dialog.querySelectorAll<HTMLInputElement|HTMLButtonElement>('button,input')].filter(el=>!el.disabled);
 focusable!.at(-1)!.focus();focusable!.at(-1)!.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));assert.equal(document.activeElement,focusable[0]);
 
 await fill('username','海风');await fill('password',' ');await fill('confirmPassword','x');
 
 await click(button('创建账号',dialog));assert.equal(registerCalls,0);assert.match(dialog.textContent,/两次密码/);
 
 await fill('confirmPassword',' ');await click(button('显示密码',dialog));assert.equal(document!.querySelector<HTMLInputElement>('[name="password"]')!.type,'text');
 
 await click(button('创建账号',dialog));assert.ok(dialog!.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled);
 releaseRegistration();await flush();await flush();assert.equal(posted.password,' ');assert.equal(document.querySelector<HTMLElement>('.account-dialog'),null);assert.match(document!.querySelector<HTMLElement>('.account-actions')!.textContent,/海风/);assert.ok(Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)!).every(key=>key.startsWith('azurlane-server-ui-v1:')),'only public server preferences are persisted');
 
 await click(button('我的战绩'));assert.match(document!.querySelector<HTMLElement>('.account-dialog')!.textContent,/战绩读取失败/);
 
 await click(button('重试'));await click(button('查看详情'));assert.match(document!.querySelector<HTMLElement>('.account-dialog')!.textContent,/绫波/);assert.match(document!.querySelector<HTMLElement>('.account-dialog')!.textContent,/12\.3/);assert.match(document!.querySelector<HTMLElement>('.account-dialog')!.textContent,/对方认输/);
 const sourceButtons=[...document.querySelectorAll<HTMLButtonElement>('.account-dialog button')].filter(el=>el.textContent.trim()==='伤害来源');assert.equal(sourceButtons.length,2);
 
 await click(sourceButtons[0]);const breakdown=document.querySelector<HTMLElement>('.account-damage-breakdown');assert.match(breakdown!.textContent,/主炮/);assert.match(breakdown!.textContent,/航空攻击/);assert.match(breakdown!.textContent,/搁浅/);assert.doesNotMatch(breakdown!.textContent,/副炮/);assert.match(breakdown!.textContent,/2\.3/);assert.match(breakdown!.textContent,/对敌/);assert.match(breakdown!.textContent,/承伤/);
 
 await click(sourceButtons[1]);assert.match(document.querySelectorAll<HTMLElement>('.account-damage-breakdown')[1].textContent,/暂无伤害/);
 
 await click(button('下一页'));assert.match(document!.querySelector<HTMLElement>('.account-dialog')!.textContent,/下一页读取失败/);await click(button('重试'));assert.match(document!.querySelector<HTMLElement>('.account-dialog')!.textContent,/暂无战绩/);await click(button('上一页'));assert.match(document!.querySelector<HTMLElement>('.account-dialog')!.textContent,/海风/);
 document!.querySelector<HTMLElement>('.account-dialog')!.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await flush();assert.equal(document.querySelector<HTMLElement>('.account-dialog'),null);
 
 await click(document.querySelector<HTMLButtonElement>('.server-connect'));assert.equal(document.querySelector<HTMLElement>('[aria-label="访客昵称"]'),null);assert.match(document!.querySelector<HTMLElement>('.connection-card')!.textContent,/海风/);await click(button('连接服务器'));
 Socket.current.push({player:{id:'a1',nickname:'海风'},room:{hostId:'a1',code:'ABC',turnSeconds:0,players:[{id:'a1',nickname:'海风',ready:false}]},queue:null,match:null});await flush();
 
 await click(button('退出登录'));assert.equal(user!.id,'u1');assert.match(document!.querySelector<HTMLElement>('.account-actions')!.textContent,/先退出/);
 
 await click(button('关闭提示'));assert.equal(document.querySelector<HTMLElement>('.account-notice'),null);await click(button('退出登录'));
 Socket.current.push({player:{id:'a1',nickname:'海风'},room:null,queue:null,match:null});await flush();assert.equal(document.querySelector<HTMLElement>('.account-notice'),null);await click(button('退出登录'));assert.equal(user,null);assert.ok(Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)!).every(key=>key.startsWith('azurlane-server-ui-v1:')),'only public server preferences are persisted');
 assert.ok(requests.includes('/api/me/matches?cursor=page2'));
});
test('login form switches cleanly, surfaces invalid credentials, and syncs logout from another tab on focus',async()=>{
 
 await click(button('登录',document.querySelector<HTMLElement>('.account-actions')));
 
 await click(button('还没有账号？前往注册'));assert.ok(document.querySelector<HTMLInputElement>('[name="confirmPassword"]'));
 
 await fill('password','discard');await click(button('已有账号？前往登录'));assert.equal(document.querySelector<HTMLInputElement>('[name="confirmPassword"]'),null);assert.equal(document!.querySelector<HTMLInputElement>('[name="password"]')!.value,'');
 
 await fill('username','海风');await fill('password','wrong');await click(button('登录',document.querySelector<HTMLElement>('.account-dialog')));assert.match(document!.querySelector<HTMLElement>('[role="alert"]')!.textContent,/用户名或密码错误/);
 
 await fill('password','1');document!.querySelector<HTMLElement>('.account-dialog form')!.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await flush();assert.equal(document.querySelector<HTMLElement>('.account-dialog'),null);assert.match(document!.querySelector<HTMLElement>('.account-actions')!.textContent,/海风/);
 user=null;window.dispatchEvent(new Event('focus'));await flush();assert.equal(button('退出登录'),undefined);await click(document.querySelector<HTMLButtonElement>('.server-connect'));assert.ok(document.querySelector<HTMLElement>('[aria-label="访客昵称"]'));await click(document.querySelector<HTMLElement>('.connection-card [data-slot=dialog-close]'));assert.ok(Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)!).every(key=>key.startsWith('azurlane-server-ui-v1:')),'only public server preferences are persisted');
});
test('account dialog blocks battle shortcut keys and restores the focused trigger',async()=>{
 
 await click([...document.querySelectorAll<HTMLButtonElement>('button')].find(el=>el.textContent.includes('新游戏')));
 
 await click(document.querySelector<HTMLButtonElement>('[data-mode="local"]'));await click([...document.querySelectorAll<HTMLButtonElement>('button')].find(el=>el.textContent.includes('进入部署')));await click(button('完成部署'));
 const trigger=button('登录',document.querySelector<HTMLElement>('.account-actions'));trigger!.focus();await click(trigger);
 const actions=document.querySelectorAll<HTMLElement>('.action-item').length;
 window.dispatchEvent(new KeyboardEvent('keydown',{key:'w',bubbles:true}));await flush();assert.equal(document.querySelectorAll<HTMLElement>('.action-item').length,actions);
 document!.querySelector<HTMLElement>('[aria-label="关闭账号窗口"]')!.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await flush();assert.equal(document.activeElement,trigger);assert.equal(document!.querySelector<HTMLElement>('.shell')!.inert,false);
});

afterAll(()=>wrapper.unmount());