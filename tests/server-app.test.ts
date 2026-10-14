import type {ShipType} from '../shared/game.ts';
import {openWS} from './helpers/open-ws.ts';
import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../server/app.ts';
import { BattlePool } from '../server/pool.ts';
import * as E from '../src/engine.ts';

const settle=()=>new Promise(r=>setTimeout(r,20));
async function guest(app: Awaited<ReturnType<typeof createApp>>,name: string){const r=await app.inject({method:'POST',url:'/api/session',payload:{nickname:name}});assert.equal(r.statusCode,200);return r.json();}
async function client(app: Awaited<ReturnType<typeof createApp>>,session: { token: string; }){const ws=await openWS(app,'/ws'),messages:Record<string,unknown>[]=[];ws.on('message',x=>messages.push(JSON.parse(x.toString())));ws.send(JSON.stringify({v:2,id:'auth',type:'auth',token:session.token}));await settle();assert.ok(messages.some(x=>x.type==='state'));return {ws,messages,send(msg: { id: string; type: string; payload: { roster: ShipType[]; turnSeconds: number; }|{ plans: {}; }; matchId?: string; round?: number; }){ws.send(JSON.stringify({v:2,...msg}));}};}
test('HTTP configuration excludes secrets, validates sessions and rejects foreign origins',async()=>{
 const app=await createApp({requireBuild:false,models:[{id:'private',name:'模型',model:'fixture',protocol:'chat',apiKey:'secret',baseURL:'https://secret.internal'}],allowedOrigins:['http://localhost:3000']});
 try{
  const config=await app.inject('/api/config');assert.equal(config.statusCode,200);assert.deepEqual(config.json().models,[{id:'private',name:'模型'}]);assert.ok(!config.body.includes('secret'));
  assert.equal((await app.inject({url:'/api/config',headers:{origin:'https://evil.test'}})).statusCode,403);
  assert.equal((await app.inject({method:'POST',url:'/api/session',payload:{nickname:'',token:'x'}})).statusCode,400);
  const s=await guest(app,'玩家');assert.ok(s.token.length>30);
  assert.equal((await app.inject('/.env')).statusCode,404);
 }finally{await app.close();}
});
test('WebSocket auth errors are correlated, session takeover closes old socket, and requests are idempotent',async()=>{
 const app=await createApp({requireBuild:false});await app.ready();
 try{
  const bad=await openWS(app,'/ws'),message=once(bad,'message');bad.send(JSON.stringify({v:2,id:'bad-auth',type:'auth',token:'invalid'}));const [raw]=await message;assert.equal(JSON.parse(raw.toString()).id,'bad-auth');bad.terminate();
  const s=await guest(app,'A'),a=await client(app,s);const create={id:'create',type:'room.create',payload:{roster:E.DEFAULT_ROSTER,turnSeconds:0}};
  a.send(create);await settle();const room=app!.gameService.players.get(s.playerId)!.room;a.send(create);await settle();assert.equal(app.gameService.rooms.size,1);assert.equal(app!.gameService.players.get(s.playerId)!.room,room);
  const oldClosed=once(a.ws,'close');const b=await client(app,s);await oldClosed;assert.equal(app!.gameService.players.get(s.playerId)!.connected,true);
  b.send({id:'new-invalid',type:'orders.submit',matchId:'wrong',round:1,payload:{plans:{}}});await settle();assert.ok(b.messages.some(x=>x.id==='new-invalid'&&x.type==='error'));
  b.ws.terminate();
 }finally{await app.close();}
});
test('start reports missing web build clearly',async()=>{await assert.rejects(createApp({staticRoot:'/tmp/azurlane-no-such-web-build'}),/npm run build/);});
test('real worker matches deterministic engine result and can close',async()=>{
 const pool=new BattlePool(1),g=E.createGame();g.phase='plan';
 try{const actual=await pool.resolve(g,{}),expected=E.resolveRound(g,{});assert.deepEqual(actual,expected);}finally{await pool.close();}
 await assert.rejects(pool.resolve(g,{}),/关闭/);
});
