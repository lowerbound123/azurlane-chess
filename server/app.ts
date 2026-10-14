import {registerHttpRoutes} from './http-routes.ts';
import {registerWebSocketRoutes} from './websocket-routes.ts';
import {registerPageRoutes} from './page-routes.ts';
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import {registerInfrastructure} from './infrastructure.ts';
import {projectRoot as root} from './paths.ts';
import {isRecord,errorMessage} from '../src/lib/errors.ts';
import type {ServiceOptions,ModelConfig,Player} from './types.ts';
import type {FastifyInstance,FastifyServerOptions} from 'fastify';
import type {TypeBoxTypeProvider} from '@fastify/type-provider-typebox';
interface AppOptions extends Omit<ServiceOptions,'logger'|'models'> {service?:GameService;models?:ModelConfig[];allowedOrigins?:string[];staticRoot?:string;logger?:boolean;requireBuild?:boolean;authEnabled?:boolean;authDbPath?:string;authCookieSecure?:boolean;authNow?:()=>number}
declare module 'fastify' {interface FastifyInstance {accounts:Accounts;gameService:GameService}}
import path from 'node:path';
import { existsSync } from 'node:fs';
import { GameService } from './game-service.ts';
import { BattlePool } from './pool.ts';
import { AIService, loadModels, publicModels } from './ai.ts';
import { Accounts, ACCOUNT_COOKIE, authError } from './accounts.ts';
import { registerAccountRoutes } from './account-routes.ts';

export async function createApp({service,models,allowedOrigins,staticRoot=path.join(root,'dist'),logger=false,requireBuild=true,
  authEnabled=process.env.AUTH_ENABLED==='true',authDbPath=process.env.AUTH_DB_PATH||path.join(root,'data/accounts.sqlite'),
  authCookieSecure=process.env.AUTH_COOKIE_SECURE!=='false',authNow=Date.now,...serviceOptions}:Omit<AppOptions,'logger'>&{logger?:boolean}={}) {
  if(requireBuild&&!existsSync(path.join(staticRoot,'index.html')))throw new Error('缺少网页构建产物，请先执行 npm run build');
  models??=loadModels();
  const app=Fastify({logger:logger===true?{redact:['req.headers.cookie','res.headers["set-cookie"]','req.body.password','req.body.confirmPassword']}:logger,
    trustProxy:['127.0.0.1','::1'],ajv:{customOptions:{removeAdditional:false,coerceTypes:false}},bodyLimit:65536,requestTimeout:10000}).withTypeProvider<TypeBoxTypeProvider>();
  const accounts=new Accounts({enabled:authEnabled,filename:authDbPath,staticRoot,secure:authCookieSecure,now:authNow});
  app.decorate('accounts',accounts);
  const origins=new Set(allowedOrigins||String(process.env.ALLOWED_ORIGINS||`http://127.0.0.1:${process.env.PORT||3000},http://localhost:${process.env.PORT||3000}`).split(',').map(s=>s.trim()).filter(Boolean));
  const rate=await registerInfrastructure(app,origins);
  service??=new GameService({pool:new BattlePool(),ai:new AIService({models,logger:app.log}),models,logger:app.log,...serviceOptions});
  service.recordStore=accounts.store;
  service.resolveAccount=hash=>accounts.sessionByHash(hash);
  app.decorate('gameService',service);
  const gameService=service;
  app.addHook('preClose',async()=>{try{await gameService.close();}finally{accounts.close();}});
  await app.register(websocket,{options:{maxPayload:65536}});
  const {originCheck}=registerAccountRoutes(app,{accounts,origins,rate,service});
  await app.register(async child=>registerHttpRoutes(child,{models,rate,originCheck}));
  await app.register(async child=>registerWebSocketRoutes(child,{rate,originCheck}));
  await registerPageRoutes(app,staticRoot);
  app.setErrorHandler((error,req,reply)=>{const e=isRecord(error)?error:{};const origin=e.code==='ORIGIN_DENIED';reply.code(typeof e.statusCode==='number'?e.statusCode:500).send({code:origin?'ORIGIN_DENIED':e.validation?'BAD_MESSAGE':'SERVER_ERROR',message:origin?errorMessage(error):e.validation?'请求格式无效':'服务暂时不可用'});});
  return app;
}
