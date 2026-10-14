import type {FastifyInstance,FastifyRequest} from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import {authError} from './accounts.ts';
export type RateGate=(request:FastifyRequest,key:string,max:number,window:number)=>Promise<boolean>;
declare module 'fastify' {interface FastifyRequest {foundationRateKey:string|null}}
export async function registerInfrastructure(app:FastifyInstance,origins:Set<string>):Promise<RateGate>{
  await app.register(cookie);
  await app.register(cors,{origin:(origin,done)=>{if(!origin||origins.has(origin))done(null,true);else done(authError('ORIGIN_DENIED','此网页来源未获准连接服务器',403),false);},credentials:true,methods:['GET','POST','OPTIONS'],allowedHeaders:['Content-Type'],strictPreflight:false});
  await app.register(rateLimit,{global:false,max:120,timeWindow:10000,cache:10000,keyGenerator:req=>req.foundationRateKey??req.ip});
  app.decorateRequest('foundationRateKey',null);
  const policies=new Map<string,ReturnType<FastifyInstance['createRateLimit']>>();
  return async(request,key,max,timeWindow)=>{
    const policy=`${max}:${timeWindow}`;let limiter=policies.get(policy);
    if(!limiter){limiter=app.createRateLimit({max,timeWindow});policies.set(policy,limiter);}
    request.foundationRateKey=key;
    const result=await limiter(request);
    return result.isAllowed||!result.isExceeded;
  };
}
