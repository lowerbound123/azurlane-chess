import {PROTOCOL_VERSION} from '../shared/network.ts';
import type {FastifyInstance,FastifyRequest} from 'fastify';
import type {Player} from './types.ts';
import type {RateGate} from './infrastructure.ts';
import Type from 'typebox';
import Value from 'typebox/value';
import {ACCOUNT_COOKIE} from './accounts.ts';
import {isRecord,errorMessage} from '../src/lib/errors.ts';
const AuthMessage=Type.Object({v:Type.Literal(PROTOCOL_VERSION),id:Type.String({maxLength:80}),type:Type.Literal('auth'),token:Type.String({maxLength:100})});
export function registerWebSocketRoutes(app:FastifyInstance,{rate,originCheck}:{rate:RateGate;originCheck:(request:FastifyRequest)=>void}){
 const {accounts,gameService}=app;
  app.get('/ws',{websocket:true},(socket,request)=>{
    let player:Player|null=null,authenticated=false,closed=false;let processing=Promise.resolve();
    const send=(data:Record<string,unknown>)=>{if(socket.readyState===1)socket.send(JSON.stringify(data));};
    const authTimer=setTimeout(()=>socket.close(1008,'认证超时'),5000);
    let alive=true;
    const heartbeat=setInterval(()=>{if(!alive){socket.terminate();return;}alive=false;socket.ping();},15000);heartbeat.unref();
    socket.on('pong',()=>alive=true);
    socket.on('message',bytes=>{processing=processing.then(async()=>{
      if(closed)return;
      if(!await rate(request,`socket:${player?.id||request.ip}`,120,10000)){send({v:PROTOCOL_VERSION,type:'error',code:'RATE_LIMIT',message:'操作过于频繁'});socket.close(1008,'操作过于频繁');return;}
      let msg:unknown;
      try{
        msg=JSON.parse(bytes.toString());if(!isRecord(msg)||msg.v!==PROTOCOL_VERSION)throw Object.assign(new Error('客户端与服务器版本不匹配，请刷新页面'),{code:'PROTOCOL_MISMATCH'});
        if(!authenticated){
          if(!Value.Check(AuthMessage,msg))throw Object.assign(new Error('请先完成身份认证'),{code:'AUTH_REQUIRED'});
          const account=accounts.session(request.cookies[ACCOUNT_COOKIE]);
          if(account)originCheck(request);
          player=gameService.connect(msg.token,send,(code=4001,reason='新连接已接管')=>socket.close(code,reason),account);authenticated=true;clearTimeout(authTimer);send({v:PROTOCOL_VERSION,type:'ack',id:msg.id,ok:true});return;
        }
        if(!player||player.send!==send){socket.close(4001,'连接已接管');return;}
        gameService.command(player,msg);
      }catch(e){send({v:PROTOCOL_VERSION,type:'error',...(isRecord(msg)&&typeof msg.id==='string'&&msg.id.length<=80?{id:msg.id}:{}),code:isRecord(e)&&e.code?e.code:'BAD_MESSAGE',message:isRecord(e)&&e.code?errorMessage(e):'消息格式无效'});if(!authenticated)socket.close(1008,'认证失败');}
    }).catch(()=>{if(!closed)socket.close(1011,'消息处理失败');});});
    socket.on('close',()=>{closed=true;clearTimeout(authTimer);clearInterval(heartbeat);if(player)gameService.disconnect(player,send);});
    socket.on('error',()=>socket.close());
  });
}
