import {TestSocket} from './helpers/socket.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import {OnlineClient,decodeOnline,IDENTITY_KEY} from '../src/online.ts';
class Socket extends TestSocket { static last:Socket;sent:{id:string;token?:string}={id:""};constructor(url:string|URL){super();this.url=String(url);this.readyState=1;Socket.last=this;queueMicrotask(()=>this.onopen());} send(raw: string){const message=JSON.parse(raw);this.sent=message;if(message.type==='auth')queueMicrotask(()=>this.onmessage({data:JSON.stringify({type:'ack',id:message.id,ok:true})}));} close(){this.onclose?.();} }
function client(options:ConstructorParameters<typeof OnlineClient>[0]={}){const data=new Map<string,string>();const storage={getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,v),removeItem:(k:string)=>data.delete(k)};return new OnlineClient({storage,WebSocketImpl:Socket,location:{protocol:'https:',host:'example.test'},fetchImpl:async url=>new Response(JSON.stringify(url==='/api/config'?{serverId:'one',protocolVersion:2,models:[]}:{token:'secret',playerId:'p',serverId:'one'})),...options});}
test('auth token stays outside URL and mutations wait for acknowledgement/errors',async()=>{const c=client();await c.connect('测试');assert.equal(Socket.last.url,'wss://example.test/ws');assert.equal(Socket.last.sent.token,'secret');const pending=c.send('room.create',{roster:['dd']});const {id}=Socket.last.sent;Socket.last.onmessage({data:JSON.stringify({type:'error',id,code:'BAD',message:'编队无效'})});await assert.rejects(pending,/编队无效/);c.close();});
test('wire decoding restores only airReady infinity',()=>assert.deepEqual(decodeOnline({airReady:[null,3],deadline:null,ships:[{airReady:[null]}]}),{airReady:[Infinity,3],deadline:null,ships:[{airReady:[Infinity]}]}));
test('server restart clears online identity alone and requires explicit reconnect',async()=>{const removed:string[]=[];const c=client({storage:{getItem:()=>JSON.stringify({serverId:'old',token:'x'}),setItem(){},removeItem:(key:string)=>removed.push(key)}});await assert.rejects(c.connect('测试'),/失效/);assert.deepEqual(removed,[IDENTITY_KEY]);});
test('disconnect rejects unacknowledged changes',async()=>{const c=client();await c.connect('测试');const pending=c.send('orders.submit',{});c.close();await assert.rejects(pending,/未确认/);});
test('request identity is unique across refreshes and takeover does not reconnect',async()=>{const messages:string[]=[];const first=client({onError:(error)=>messages.push(error.message)});await first.connect('测试');const firstId=Socket.last.sent.id;Socket.last.onclose({code:4001});assert.equal(first.stopped,true);assert.equal(first.retryTimer,undefined);assert.match(messages[0],/接管/);const second=client();await second.connect('测试');assert.notEqual(Socket.last.sent.id,firstId);second.close();});

test('public HTTP clients connect with distinct request IDs when randomUUID is unavailable', async () => {
  const previous = globalThis.crypto;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  Object.defineProperty(globalThis, 'crypto', {configurable:true, value:{getRandomValues:previous.getRandomValues.bind(previous)}});
  const clients = [];
  try {
    const ids = [];
    for (let i = 0; i < 2; i++) {
      const c = client({location:{protocol:'http:',host:'216.167.70.120:37228'}});
      clients.push(c);
      await c.connect('HTTP访客');
      assert.equal(Socket.last.url, 'ws://216.167.70.120:37228/ws');
      const id = Socket.last.sent.id;
      assert.ok(typeof id === 'string' && id.length > 0 && id.length <= 80);
      ids.push(id);
      c.close();
    }
    assert.notEqual(ids[0], ids[1]);
  } finally {
    for (const c of clients) c.close();
    Object.defineProperty(globalThis, 'crypto', descriptor!);
  }
});

test('default browser fetch keeps its global receiver', async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = function (this:typeof globalThis) { assert.equal(this, globalThis); return Promise.resolve(new Response(JSON.stringify({serverId:'new',protocolVersion:2}))); };
  try {
    const client = new OnlineClient({storage:{getItem:()=>JSON.stringify({serverId:'new',token:'token'}),setItem(){},removeItem(){}},location:{protocol:'http:',host:'localhost'}});
    client.open=async()=>{};
    await client.connect('test');
  } finally { globalThis.fetch=previous; }
});

test('invalid server state is reported without escaping the message handler or overwriting state',async()=>{
 const errors:Error[]=[];let changes=0;
 const c=client({onError:(error:Error)=>errors.push(error),onState:()=>changes++});await c.connect('测试');
 assert.doesNotThrow(()=>Socket.last.onmessage({data:JSON.stringify({type:'state',player:42})}));
 assert.equal(changes,0);assert.equal(errors.length,1);c.close();
});
test('blocked browser persistence keeps the active guest usable and reports the failure',async()=>{
 const errors:Error[]=[];
 const c=client({storage:{getItem(){throw new Error('blocked')},setItem(){throw new Error('blocked')},removeItem(){throw new Error('blocked')}},onError:(error:Error)=>errors.push(error)});
 await c.connect('测试');assert.equal(c.identity?.token,'secret');assert.equal(errors.length,1);
 assert.doesNotThrow(()=>c.invalidateIdentity());c.close();
});
