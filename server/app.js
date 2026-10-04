import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import staticFiles from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { GameService } from './game-service.js';
import { BattlePool } from './pool.js';
import { AIService, loadModels, publicModels } from './ai.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function createApp({service,models,allowedOrigins,staticRoot=path.join(root,'dist'),logger=false,requireBuild=true,...serviceOptions}={}) {
  if(requireBuild&&!existsSync(path.join(staticRoot,'index.html')))throw new Error('缺少网页构建产物，请先执行 npm run build');
  models??=loadModels();
  const app=Fastify({logger,bodyLimit:65536,requestTimeout:10000});
  const origins=new Set(allowedOrigins||String(process.env.ALLOWED_ORIGINS||`http://127.0.0.1:${process.env.PORT||3000},http://localhost:${process.env.PORT||3000}`).split(',').map(s=>s.trim()).filter(Boolean));
  const visits=new Map();
  app.addHook('onRequest',async(req,reply)=>{
    if(req.headers.origin&&!origins.has(req.headers.origin))return reply.code(403).send({code:'ORIGIN_DENIED',message:'此网页来源未获准连接服务器'});
    if(req.headers.origin){reply.header('Access-Control-Allow-Origin',req.headers.origin);reply.header('Vary','Origin');}
    if(req.method==='OPTIONS'){reply.header('Access-Control-Allow-Methods','GET,POST,OPTIONS');reply.header('Access-Control-Allow-Headers','Content-Type');return reply.code(204).send();}
  });
  service??=new GameService({pool:new BattlePool(),ai:new AIService({models,logger:app.log}),models,logger:app.log,...serviceOptions});
  app.decorate('gameService',service);
  const rate=(key,limit,ms)=>{const now=Date.now();let v=visits.get(key);if(!v||now-v.start>=ms){v={start:now,count:0};visits.set(key,v);}return ++v.count<=limit;};
  const clean=setInterval(()=>{const now=Date.now();for(const[k,v]of visits)if(now-v.start>60000)visits.delete(k);},60000);clean.unref();
  app.addHook('preClose',async()=>{clearInterval(clean);await service.close();});
  await app.register(websocket,{options:{maxPayload:65536}});
  app.get('/api/health',async()=>({ok:true,serverId:service.serverId,protocolVersion:1}));
  app.get('/api/config',async()=>({v:1,serverId:service.serverId,models:publicModels(models),roomLimits:[0,60,120,300]}));
  app.post('/api/session',{schema:{body:{type:'object',required:['nickname'],additionalProperties:false,properties:{nickname:{type:'string',minLength:1,maxLength:20}}}}},async(req,reply)=>{
    if(!rate(`session:${req.ip}`,10,60000))return reply.code(429).send({code:'RATE_LIMIT',message:'创建访客过于频繁，请稍后再试'});
    try{return service.session(req.body.nickname);}catch(e){return reply.code(400).send({code:e.code||'INVALID_REQUEST',message:e.message});}
  });
  app.get('/ws',{websocket:true},(socket,request)=>{
    let player=null,authenticated=false,closed=false;
    const send=data=>{if(socket.readyState===1)socket.send(JSON.stringify(data));};
    const authTimer=setTimeout(()=>socket.close(1008,'认证超时'),5000);
    let alive=true;
    const heartbeat=setInterval(()=>{if(!alive){socket.terminate();return;}alive=false;socket.ping();},15000);heartbeat.unref();
    socket.on('pong',()=>alive=true);
    socket.on('message',bytes=>{
      if(closed)return;
      if(!rate(`socket:${player?.id||request.ip}`,120,10000)){send({v:1,type:'error',code:'RATE_LIMIT',message:'操作过于频繁'});socket.close(1008,'操作过于频繁');return;}
      let msg;
      try{
        msg=JSON.parse(bytes.toString());
        if(!authenticated){
          if(msg?.type!=='auth'||msg.v!==1||typeof msg.id!=='string'||msg.id.length>80||typeof msg.token!=='string'||msg.token.length>100)throw Object.assign(new Error('请先完成身份认证'),{code:'AUTH_REQUIRED'});
          player=service.connect(msg.token,send,(code=4001,reason='新连接已接管')=>socket.close(code,reason));authenticated=true;clearTimeout(authTimer);send({v:1,type:'ack',id:msg.id,ok:true});return;
        }
        if(player.send!==send){socket.close(4001,'连接已接管');return;}
        service.command(player,msg);
      }catch(e){send({v:1,type:'error',...(typeof msg?.id==='string'&&msg.id.length<=80?{id:msg.id}:{}),code:e.code||'BAD_MESSAGE',message:e.code?e.message:'消息格式无效'});if(!authenticated)socket.close(1008,'认证失败');}
    });
    socket.on('close',()=>{closed=true;clearTimeout(authTimer);clearInterval(heartbeat);if(player)service.disconnect(player,send);});
    socket.on('error',()=>socket.close());
  });
  if(existsSync(path.join(staticRoot,'index.html'))){await app.register(staticFiles,{root:staticRoot,cacheControl:true,maxAge:0});}
  app.setErrorHandler((error,req,reply)=>{reply.code(error.statusCode||500).send({code:error.validation?'BAD_MESSAGE':'SERVER_ERROR',message:error.validation?'请求格式无效':'服务暂时不可用'});});
  return app;
}
