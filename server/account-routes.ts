import type {FastifyInstance,FastifyRequest,FastifyReply} from 'fastify';
import type {Accounts,Credentials} from './accounts.ts';
import type {GameService} from './game-service.ts';
import type {RateGate} from './infrastructure.ts';
import {isRecord} from '../src/lib/errors.ts';
import Type from 'typebox';
import Value from 'typebox/value';
const loginSchema=Type.Object({username:Type.String(),password:Type.String()},{additionalProperties:false});
const registerSchema=Type.Object({username:Type.String(),password:Type.String(),confirmPassword:Type.String()},{additionalProperties:false});
import { ACCOUNT_COOKIE, authError, normalizeUsername, publicUser } from './accounts.ts';

export function registerAccountRoutes(app:FastifyInstance, { accounts, origins, rate, service }:{accounts:Accounts;origins:Set<string>;rate:RateGate;service:GameService}) {
  const originCheck = (req:FastifyRequest) => {
    if (!req.headers.origin || !origins.has(req.headers.origin)) throw authError('ORIGIN_DENIED', '此网页来源未获准访问账号服务', 403);
  };
  const requireUser = (req:FastifyRequest) => {
    accounts.requireEnabled();
    const user = accounts.session(req.cookies[ACCOUNT_COOKIE]);
    if (!user) throw authError('AUTH_REQUIRED', '请先登录账号', 401);
    return user;
  };
  const route = (handler:(req:FastifyRequest,reply:FastifyReply)=>unknown) => async (req:FastifyRequest, reply:FastifyReply) => {
    reply.header('Cache-Control', 'no-store');
    try { return await handler(req, reply); }
    catch (error) {
      if (!isRecord(error)||typeof error.statusCode!=='number'||typeof error.code!=='string') throw error;
      return reply.code(error.statusCode).send({ code: error.code, message: error.message });
    }
  };
  const idle = (req:FastifyRequest) => {
    const user = accounts.session(req.cookies[ACCOUNT_COOKIE]);
    if (user && service.accountBusy(user.id)) throw authError('ACCOUNT_BUSY', '请先退出当前房间、匹配队列或对局', 409);
  };
  for (const action of ['register', 'login']) app.post(`/api/auth/${action}`, route(async (req, reply) => {
    accounts.requireEnabled(); originCheck(req); idle(req);
    const body=req.body;
    if(!Value.Check(action==='register'?registerSchema:loginSchema,body))throw authError('INVALID_REQUEST','请填写有效的账号信息');
    const { key } = normalizeUsername(body.username);
    if (!await rate(req,`account:${action}:ip:${req.ip}`, action === 'register' ? 20 : 30, 60000) || !await rate(req,`account:${action}:user:${key}`, 10, 60000)) throw authError('RATE_LIMIT', '尝试过于频繁，请稍后再试', 429);
    const result = action==='register'?await accounts.register(body):await accounts.login(body);
    accounts.logout(req.cookies[ACCOUNT_COOKIE]);
    reply.setCookie(ACCOUNT_COOKIE, result.token, accounts.cookieOptions());
    return reply.code(action === 'register' ? 201 : 200).send({ user: result.user });
  }));
  app.post('/api/auth/logout', route(async (req, reply) => {
    originCheck(req); idle(req);
    accounts.logout(req.cookies[ACCOUNT_COOKIE]);
    reply.clearCookie(ACCOUNT_COOKIE, accounts.cookieOptions());
    return { user: null };
  }));
  app.get('/api/auth/me', route(async (req, reply) => {
    const token = req.cookies[ACCOUNT_COOKIE], user = accounts.session(token);
    if (token && !user) reply.clearCookie(ACCOUNT_COOKIE, accounts.cookieOptions());
    return { user: publicUser(user) };
  }));
  app.get('/api/me/matches', route(async req => {
    const user = requireUser(req);
    let cursor:[number,string]|null = null;const query=isRecord(req.query)?req.query:{};
    if (query.cursor !== undefined) {
      try {
        if (typeof query.cursor !== 'string' || query.cursor.length > 200) throw new Error();
        const value:unknown = JSON.parse(Buffer.from(query.cursor, 'base64url').toString());
        if (!Array.isArray(value) || value.length !== 2 || typeof value[0]!=='number'||!Number.isSafeInteger(value[0]) || typeof value[1] !== 'string' || value[1].length > 80) throw new Error();cursor=[value[0],value[1]];
      } catch { throw authError('INVALID_CURSOR', '战绩分页参数无效'); }
    }
    return accounts.getStore().listMatches(user.id, cursor);
  }));
  app.get('/api/me/matches/:id', route(async req => {
    const user = requireUser(req), match = accounts.getStore().getMatch(user.id, isRecord(req.params)&&typeof req.params.id==='string'?req.params.id:'');
    if (!match) throw authError('MATCH_NOT_FOUND', '战绩不存在或无权查看', 404);
    return match;
  }));
  return { originCheck };
}
