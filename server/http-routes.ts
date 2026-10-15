import {PROTOCOL_VERSION} from '../shared/network.ts';
import type {FastifyInstance,FastifyRequest} from 'fastify';
import type {TypeBoxTypeProvider} from '@fastify/type-provider-typebox';
import type {ModelConfig} from './types.ts';
import type {RateGate} from './infrastructure.ts';
import Type from 'typebox';
import {publicModels} from './ai.ts';
import {ACCOUNT_COOKIE,authError} from './accounts.ts';
import {isRecord,errorMessage} from '../src/lib/errors.ts';
const SessionBody=Type.Object({nickname:Type.String({minLength:1,maxLength:20})},{additionalProperties:false});
export function registerHttpRoutes(instance:FastifyInstance,{models,rate,originCheck}:{models:ModelConfig[];rate:RateGate;originCheck:(request:FastifyRequest)=>void}){
 const app=instance.withTypeProvider<TypeBoxTypeProvider>();const {accounts,gameService}=app;
  app.get('/api/health',async()=>({ok:true,serverId:gameService.serverId,protocolVersion:PROTOCOL_VERSION}));
  app.get('/api/config',async(req,reply)=>{reply.header('Cache-Control','no-store');return {v:PROTOCOL_VERSION,protocolVersion:PROTOCOL_VERSION,serverId:gameService.serverId,models:publicModels(models),battleModes:['annihilation','domination'],roomLimits:[0,60,120,300],auth:{enabled:accounts.enabled},assetStorage:app.assetStorage.publicConfig};});
  app.post('/api/assets/resolve',{schema:{body:Type.Object({ids:Type.Array(Type.String({minLength:1,maxLength:1024}),{maxItems:128})},{additionalProperties:false})}},async(req,reply)=>{reply.header('Cache-Control','no-store');return app.assetStorage.resolve(req.body.ids);});
  app.post('/api/session',{schema:{body:SessionBody}},async(req,reply)=>{
    if(!await rate(req,`session:${req.ip}`,10,60000))return reply.code(429).send({code:'RATE_LIMIT',message:'创建访客过于频繁，请稍后再试'});
    reply.header('Cache-Control','no-store');
    try{
      const account=accounts.session(req.cookies[ACCOUNT_COOKIE]);
      if(accounts.enabled&&req.cookies[ACCOUNT_COOKIE]){
        originCheck(req);
        if(!account)throw authError('AUTH_SESSION_EXPIRED','登录已过期，请重新登录或退出账号后以访客连接',401);
      }
      return gameService.session(req.body.nickname,account);
    }catch(e){return reply.code(isRecord(e)&&typeof e.statusCode==='number'?e.statusCode:400).send({code:isRecord(e)&&e.code?e.code:'INVALID_REQUEST',message:isRecord(e)&&e.code?errorMessage(e):'身份创建失败'});}
  });
}
