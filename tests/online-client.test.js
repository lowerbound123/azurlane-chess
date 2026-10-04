import test from 'node:test';
import assert from 'node:assert/strict';
import {OnlineClient,decodeOnline,IDENTITY_KEY} from '../src/online.js';
class Socket { constructor(url){this.url=url;this.readyState=1;Socket.last=this;queueMicrotask(()=>this.onopen());} send(raw){const message=JSON.parse(raw);this.sent=message;if(message.type==='auth')queueMicrotask(()=>this.onmessage({data:JSON.stringify({type:'ack',id:message.id,ok:true})}));} close(){this.onclose?.();} }
function client(options={}){const data=new Map();const storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};return new OnlineClient({storage,WebSocketImpl:Socket,location:{protocol:'https:',host:'example.test'},fetchImpl:async url=>({ok:true,json:async()=>url==='/api/config'?{serverId:'one',models:[]}:{token:'secret',playerId:'p',serverId:'one'}}),...options});}
test('auth token stays outside URL and mutations wait for acknowledgement/errors',async()=>{const c=client();await c.connect('测试');assert.equal(Socket.last.url,'wss://example.test/ws');assert.equal(Socket.last.sent.token,'secret');const pending=c.send('room.create',{roster:['dd']});const {id}=Socket.last.sent;Socket.last.onmessage({data:JSON.stringify({type:'error',id,code:'BAD',message:'编队无效'})});await assert.rejects(pending,/编队无效/);c.close();});
test('wire decoding restores only airReady infinity',()=>assert.deepEqual(decodeOnline({airReady:[null,3],deadline:null,ships:[{airReady:[null]}]}),{airReady:[Infinity,3],deadline:null,ships:[{airReady:[Infinity]}]}));
test('server restart clears online identity alone and requires explicit reconnect',async()=>{const removed=[];const c=client({storage:{getItem:()=>JSON.stringify({serverId:'old',token:'x'}),removeItem:key=>removed.push(key)}});await assert.rejects(c.connect('测试'),/失效/);assert.deepEqual(removed,[IDENTITY_KEY]);});
test('disconnect rejects unacknowledged changes',async()=>{const c=client();await c.connect('测试');const pending=c.send('orders.submit',{});c.close();await assert.rejects(pending,/未确认/);});
test('request identity is unique across refreshes and takeover does not reconnect',async()=>{const messages=[];const first=client({onError:error=>messages.push(error.message)});await first.connect('测试');const firstId=Socket.last.sent.id;Socket.last.onclose({code:4001});assert.equal(first.stopped,true);assert.equal(first.retryTimer,undefined);assert.match(messages[0],/接管/);const second=client();await second.connect('测试');assert.notEqual(Socket.last.sent.id,firstId);second.close();});

test('default browser fetch keeps its global receiver', async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = function () { assert.equal(this, globalThis); return Promise.resolve({ok:true,json:async()=>({serverId:'new'})}); };
  try {
    const client = new OnlineClient({storage:{getItem:()=>JSON.stringify({serverId:'new',token:'token'}),setItem(){},removeItem(){}},location:{protocol:'http:',host:'localhost'}});
    client.open=async()=>{};
    await client.connect('test');
  } finally { globalThis.fetch=previous; }
});
