import {test,expect} from 'vitest';
import {createApp} from '../server/app.ts';
import {GameService} from '../server/game-service.ts';
import {openWS} from './helpers/open-ws.ts';
const origin='http://localhost:3000';
async function setup(){return createApp({requireBuild:false,models:[],authEnabled:false,allowedOrigins:[origin],service:new GameService({autoTick:false,models:[],pool:{close:async()=>{},resolve:async()=>{throw new Error('unused');}}})});}
test('official CORS handles preflight and guest quotas only trust the loopback proxy',async()=>{
 const app=await setup();
 try{
  const preflight=await app.inject({method:'OPTIONS',url:'/api/session',headers:{origin,'access-control-request-method':'POST','access-control-request-headers':'content-type'}});
  expect(preflight.statusCode).toBe(204);expect(preflight.headers['access-control-allow-origin']).toBe(origin);
  expect((await app.inject({method:'OPTIONS',url:'/api/session',headers:{origin:'https://evil.test','access-control-request-method':'POST'}})).statusCode).toBe(403);
  const request=(remoteAddress:string,forwarded:string)=>app.inject({method:'POST',url:'/api/session',remoteAddress,headers:{'x-forwarded-for':forwarded},payload:{nickname:'fixture'}});
  for(let i=0;i<10;i++)expect((await request('203.0.113.9',`198.51.100.${i}`)).statusCode).toBe(200);
  const denied=await request('203.0.113.9','198.51.100.99');expect(denied.statusCode).toBe(429);expect(denied.json().code).toBe('RATE_LIMIT');
  for(let i=0;i<11;i++)expect((await request('127.0.0.1',`198.51.100.${i}`)).statusCode).toBe(200);
 }finally{await app.close();}
});
test('websocket commands are processed in order and the socket quota closes excessive traffic',async()=>{
 const app=await setup();const session=(await app.inject({method:'POST',url:'/api/session',payload:{nickname:'fixture'}})).json<{token:string}>();
 const socket=await openWS(app,'/ws');const replies:{type:string;id?:string;ok?:boolean;code?:string}[]=[];
 socket.on('message',raw=>replies.push(JSON.parse(raw.toString())));
 const send=(id:string,type:string,payload={})=>socket.send(JSON.stringify({v:2,id,type,payload}));
 try{
  socket.send(JSON.stringify({v:2,id:'auth',type:'auth',token:session.token}));send('create','room.create',{turnSeconds:0});send('leave','room.leave');
  await new Promise(resolve=>setTimeout(resolve,50));
  expect(replies.filter(message=>message.type==='ack').map(message=>message.id)).toEqual(['auth','create','leave']);
  expect(app.gameService.rooms.size).toBe(0);
  const closed=new Promise<number>(resolve=>socket.once('close',resolve));
  for(let i=0;i<121;i++)send(`flood-${i}`,'unsupported');
  expect(await closed).toBe(1008);expect(replies.some(message=>message.code==='RATE_LIMIT')).toBe(true);
 }finally{socket.terminate();await app.close();}
});
