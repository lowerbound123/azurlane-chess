import {TestSocket} from './helpers/socket.ts';
import type {OnlineState,User} from '../shared/network.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import { AccountClient } from '../src/account-client.ts';
import { IDENTITY_KEY, OnlineClient } from '../src/online.ts';

const response = (body:unknown,status=200):Response=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
test('missing or unavailable auth configuration remains disabled without preventing guest play', async () => {
  for (const fetchImpl of [async()=>response({}), async()=>{throw new Error('offline')}, async()=>response({},503)]) {
    const client = new AccountClient({fetchImpl});
    await client.initialize();
    assert.equal(client.state.enabled, false);
    assert.equal(client.state.user, null);
    await assert.rejects(client.login({username:'A',password:'x'}), /暂未开放/);
  }
});
test('account requests preserve unrestricted passwords and refresh identity on expired sessions', async () => {
  const requests: { body?: BodyInit|null; cache?: RequestCache; credentials?: RequestCredentials; headers?: HeadersInit; integrity?: string; keepalive?: boolean; method?: string; mode?: RequestMode; priority?: RequestPriority; redirect?: RequestRedirect; referrer?: string; referrerPolicy?: ReferrerPolicy; signal?: AbortSignal|null; window?: null; url: RequestInfo|URL; }[]=[];
  const client = new AccountClient({fetchImpl:async(url, options={})=>{
    requests.push({url,...options});
    if(url==='/api/config')return response({auth:{enabled:true}});
    if(url==='/api/auth/me')return response({user:null});
    if(url==='/api/auth/register')return response({user:{id:'u1',username:'指挥官'}});
    if(url==='/api/me/matches')return response({code:'AUTH_REQUIRED',message:'请先登录'},401);
    return response({user:null});
  }});
  await client.initialize();
  await client.register({username:'指挥官',password:' ',confirmPassword:' '});
  assert.equal(client!.state.user!.username,'指挥官');
  const posted = requests.find(r=>r.url==='/api/auth/register');
  assert.equal(JSON.parse(String(posted!.body)).password,' ');
  assert.equal(posted!.credentials,'same-origin');
  await assert.rejects(client.matches(), /请先登录/);
  assert.equal(client.state.user,null);
});
test('a stale me response cannot overwrite a completed login', async () => {
  let resolveMe:()=>void=()=>{}, delayed=false;
  const client = new AccountClient({fetchImpl:async url=>{
    if(url==='/api/config')return response({auth:{enabled:true}});
    if(url==='/api/auth/me')return delayed?new Promise(resolve=>resolveMe=()=>resolve(response({user:null}))):response({user:null});
    return response({user:{id:'u1',username:'A'}});
  }});
  await client.initialize();delayed=true;
  const starting=client.refresh();
  await new Promise(resolve=>setImmediate(resolve));
  await client.login({username:'A',password:'1'});
  resolveMe!();await starting;
  assert.equal(client!.state.user!.id,'u1');
});
test('identity reads started during login cannot erase its completed identity', async () => {
  let resolveMe:()=>void=()=>{}, resolveLogin:()=>void=()=>{};
  const client=new AccountClient({fetchImpl:async url=>{
    if(url==='/api/auth/me')return new Promise(resolve=>resolveMe=()=>resolve(response({user:null})));
    return new Promise(resolve=>resolveLogin=()=>resolve(response({user:{id:'u1',username:'A'}})));
  }});
  client.update({enabled:true});
  const login=client.login({username:'A',password:'x'}), refresh=client.refresh();
  resolveLogin!();await login;resolveMe!();await refresh;
  assert.equal(client.state.user?.id,'u1');
});
test('late unauthorized record responses cannot log out a newly authenticated user', async () => {
  let finishRecords:()=>void=()=>{};
  const client=new AccountClient({fetchImpl:async url=>url==='/api/me/matches'?new Promise(resolve=>finishRecords=()=>resolve(response({message:'expired'},401))):response({user:{id:'new-user',username:'新账号'}})});
  client.update({enabled:true,user:{id:'old-user',username:'旧账号'}});
  const records=client.matches();await client.login({username:'新账号',password:'x'});
  finishRecords!();await assert.rejects(records,/expired/);
  assert.equal(client.state.user?.id,'new-user');
});

class Socket extends TestSocket {
 last:{token?:string;id:string}={id:""};
  static instances:Socket[]=[];
  constructor(){super();this.readyState=1;Socket.instances.push(this);queueMicrotask(()=>this.onopen?.());}
  send(text: string){this.last=JSON.parse(text);queueMicrotask(()=>this.onmessage?.({data:JSON.stringify({type:'ack',id:this.last.id,ok:true})}));}
  close(){this.readyState=3;this.onclose?.({code:1000});}
}
function memoryStorage(initial: { token: string; playerId?: string; nickname?: string; serverId: string; }|undefined=undefined){const data=new Map(initial?[[IDENTITY_KEY,JSON.stringify(initial)]]:[]);return {getItem:(k:string)=>data.get(k)??null,setItem:(k: string,v: string)=>data.set(k,v),removeItem:(k:string)=>data.delete(k)};}
test('account online credentials stay in memory and guest identity survives login and logout', async () => {
  const guest={token:'guest-secret',playerId:'g1',nickname:'访客',serverId:'srv'};
  const storage=memoryStorage(guest);let sessionCalls=0;
  const client=new OnlineClient({storage,WebSocketImpl:Socket,location:{protocol:'http:',host:'localhost'},fetchImpl:async url=>url==='/api/config'?response({serverId:'srv',protocolVersion:2}):(++sessionCalls,response({token:'account-secret',playerId:'a1',nickname:'账号',serverId:'srv',identityType:'account',accountId:'u1'}))});
  client.setAccount({id:'u1',username:'账号'});
  await client.connect('ignored');
  assert.equal(Socket!.instances.at(-1)!.last.token,'account-secret');
  assert.equal(JSON.parse(storage.getItem(IDENTITY_KEY)!).token,'guest-secret');
  const old=Socket.instances.at(-1), states:OnlineState[]=[];client.onState=s=>states.push(s);
  client.setAccount(null);
  old!.onmessage({data:JSON.stringify({type:'state',player:{id:'a1'}})});
  await client.connect('访客');
  assert.equal(Socket!.instances.at(-1)!.last.token,'guest-secret');
  assert.equal(sessionCalls,1);assert.equal(states.length,0);
  client.close();
});
test('account auth failure never deletes the saved guest identity', async () => {
  const storage=memoryStorage({token:'guest',serverId:'srv'});let expired=0;
  const client=new OnlineClient({storage,WebSocketImpl:Socket,location:{protocol:'http:',host:'localhost'},onAuthExpired:()=>expired++,fetchImpl:async url=>response(url==='/api/config'?{protocolVersion:2,serverId:'srv'}:{token:'account',serverId:'srv',identityType:'account',accountId:'a'})});
  client.setAccount({id:'a',username:'A'});await client.connect('');
  Socket!.instances.at(-1)!.onmessage({data:JSON.stringify({type:'error',code:'AUTH_REQUIRED',message:'登录已失效'})});
  assert.equal(expired,1);assert.equal(JSON.parse(storage.getItem(IDENTITY_KEY)!).token,'guest');
  client.close();
});
test('a superseded connection cannot overwrite the latest server configuration', async () => {
  const configurations:((value:Response)=>void)[]=[];
  const client=new OnlineClient({storage:memoryStorage({token:'guest',serverId:'srv'}),WebSocketImpl:Socket,location:{protocol:'http:',host:'localhost'},fetchImpl:async()=>new Promise(resolve=>configurations.push(resolve))});
  const first=client.connect('guest');const rejected=assert.rejects(first,/身份已变更/);
  const second=client.connect('guest');
  configurations[1](response({serverId:'srv',protocolVersion:2,models:[{id:'latest',name:'Latest'}]}));await second;
  configurations[0](response({serverId:'srv',protocolVersion:2,models:[{id:'stale',name:'Stale'}]}));await rejected;
  assert.equal(client.config.models[0].id,'latest');client.close();
});
test('a cross-tab cookie account change between me and session cannot connect under the old displayed account', async () => {
  const accountsById:Record<string,User>={A:{id:'A',username:'账号 A'},B:{id:'B',username:'账号 B'}};
  let cookieAccount='A', switchCookie=false, online: OnlineClient, refresh;
  const fetchImpl:typeof fetch=async (url)=>{
    if(url==='/api/auth/me')return response({user:accountsById[cookieAccount]});
    if(url==='/api/config'){
      if(switchCookie){cookieAccount='B';switchCookie=false;}
      return response({serverId:'srv',protocolVersion:2,auth:{enabled:true}});
    }
    assert.equal(url,'/api/session');
    return response({identityType:'account',accountId:cookieAccount,playerId:'player-'+cookieAccount,nickname:accountsById[cookieAccount].username,token:'token-'+cookieAccount,serverId:'srv'});
  };
  const accountClient=new AccountClient({fetchImpl,onChange:state=>online?.setAccount(state.user)});
  const storage=memoryStorage({token:'guest-secret',serverId:'srv'});
  online=new OnlineClient({storage,fetchImpl,WebSocketImpl:Socket,location:{protocol:'http:',host:'localhost'},onAuthExpired:()=>{refresh=accountClient.refresh();}});
  await accountClient.initialize();
  assert.equal(accountClient!.state.user!.id,'A');
  const socketCount=Socket.instances.length;
  switchCookie=true;
  try {
    await assert.rejects(online.connect(''),/登录状态已变化/);
    await refresh;
    assert.equal(Socket.instances.length,socketCount,'mismatched account never opens a socket');
    assert.equal(online.identity,null);
    assert.equal(accountClient!.state.user!.id,'B','the visible account refreshes before retry');
    assert.equal(JSON.parse(storage.getItem(IDENTITY_KEY)!).token,'guest-secret');
    await online.connect('');
    assert.equal(Socket!.instances.at(-1)!.last.token,'token-B');
    assert.equal(online!.identity!.accountId,'B');
  } finally { online.close(); }
});
test('a transient startup identity failure recovers on the next connection without exposing unverified account controls', async () => {
  for (const user of [{id:'u1',username:'现有账号'}, null]) {
    let meAttempts=0, online: OnlineClient;
    const fetchImpl:typeof fetch=async (url)=>{
      if(url==='/api/config')return response({serverId:'srv',protocolVersion:2,auth:{enabled:true}});
      if(url==='/api/auth/me')return ++meAttempts===1?response({message:'temporarily unavailable'},503):response({user});
      assert.equal(url,'/api/session');
      return response(user?{accountId:'u1',identityType:'account',token:'account-token',serverId:'srv'}:{identityType:'guest',token:'guest-token',serverId:'srv'});
    };
    const accounts=new AccountClient({fetchImpl,onChange:state=>online?.setAccount(state.user)});
    const storage=memoryStorage();
    online=new OnlineClient({fetchImpl,storage,WebSocketImpl:Socket,location:{protocol:'http:',host:'localhost'}});
    await accounts.initialize();
    assert.equal(accounts.state.enabled,false,'identity outage keeps initial controls closed');
    assert.equal(accounts.state.user,null);
    try {
      // Same sequence as main.connectOnline after the initial load completes.
      await accounts.refresh();
      online.setAccount(accounts.state.user);
      await online.connect('访客');
      assert.equal(accounts.state.enabled,true);
      assert.equal((accounts.state.user as User|null)?.id,(user as User|null)?.id);
      assert.equal(Socket!.instances.at(-1)!.last.token,user?'account-token':'guest-token');
      assert.equal(storage.getItem(IDENTITY_KEY) === null, !!user);
    } finally { online.close(); }
  }
});
test('unknown initial auth configuration can be retried, while confirmed disabled configuration stays closed',async()=>{
  let recovered=false;
  const client=new AccountClient({fetchImpl:async url=>{
    if(url==='/api/config')return recovered?response({auth:{enabled:true}}):response({},503);
    return response({user:{id:'u1',username:'A'}});
  }});
  await client.initialize();assert.equal(client.state.enabled,false);
  recovered=true;await client.refresh();assert.equal(client.state.enabled,true);assert.equal(client!.state.user!.id,'u1');
  const disabled=new AccountClient({fetchImpl:async url=>{assert.equal(url,'/api/config');return response({auth:{enabled:false}});}});
  await disabled.initialize();await disabled.refresh();assert.equal(disabled.state.enabled,false);
});
