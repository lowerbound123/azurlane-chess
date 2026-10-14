import { randomBytes, randomUUID, createHash, scrypt, timingSafeEqual } from 'node:crypto';
import type {User} from '../shared/network.ts';
import type {SessionUser} from './types.ts';
import { AccountStore } from './account-store.ts';

const derive=(password:string,salt:string)=>new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,64,{N:32768,r:8,p:3,maxmem:64*1024*1024},(error,key)=>error?reject(error):resolve(key)));
export const ACCOUNT_COOKIE = 'azurlane_session';
const SESSION_MS = 30 * 86400000;
export const authError = (code:string, message:string, statusCode = 400) => Object.assign(new Error(message), { code, statusCode });
const tokenHash = (token:string) => createHash('sha256').update(token).digest('hex');
export const publicUser = (user:User|null):User|null => user ? { id: user.id, username: user.username } : null;

export function normalizeUsername(value:unknown) {
  if (typeof value !== 'string') throw authError('INVALID_USERNAME', '用户名需为1至20个字符');
  const username = value.normalize('NFC').trim();
  if (!username.length || username.length > 20 || /[\x00-\x1f\x7f-\x9f]/.test(value)) throw authError('INVALID_USERNAME', '用户名需为1至20个字符，不能包含控制字符');
  return { username, key: username.toLowerCase() };
}

export interface AccountOptions {enabled?:boolean;filename?:string;staticRoot?:string;secure?:boolean;now?:()=>number}
export interface Credentials {username:unknown;password:unknown;confirmPassword?:unknown}
export class Accounts {
  readonly enabled:boolean;readonly secure:boolean;readonly now:()=>number;readonly store:AccountStore|null;private computing:number;private dummySalt:string;private dummyHash:Buffer;
  constructor({ enabled = false, filename, staticRoot, secure = true, now = Date.now }:AccountOptions = {}) {
    this.enabled=enabled;this.secure=secure;this.now=now;
    this.store = enabled ? new AccountStore(filename??':memory:', { staticRoot }) : null;
    this.computing = 0;
    this.dummySalt = randomBytes(16).toString('hex');
    this.dummyHash = randomBytes(64);
  }
  requireEnabled() { if (!this.enabled) throw authError('AUTH_DISABLED', '账号功能暂未开放', 403); }
  async hash(password:string, salt:string) {
    if (this.computing >= 2) throw authError('RATE_LIMIT', '账号服务繁忙，请稍后再试', 429);
    this.computing++;
    try { return await derive(password, salt); }
    finally { this.computing--; }
  }
  async register({ username: input, password, confirmPassword }:Credentials) {
    this.requireEnabled();
    const { username, key } = normalizeUsername(input);
    if (typeof password !== 'string' || !password.length || typeof confirmPassword !== 'string' || password !== confirmPassword) throw authError('INVALID_PASSWORD', '请输入非空密码，并确保两次输入一致');
    if (this.getStore().findUser(key)) throw authError('USERNAME_TAKEN', '该用户名已被使用', 409);
    const salt = randomBytes(16).toString('hex'), hash = (await this.hash(password, salt)).toString('hex');
    const user = { id: randomUUID(), username, key, hash, salt, createdAt: this.now() };
    try { this.getStore().createUser(user); }
    catch (error) {
      if (this.getStore().findUser(key)) throw authError('USERNAME_TAKEN', '该用户名已被使用', 409);
      throw error;
    }
    return this.issue(user);
  }
  async login({ username, password }:Credentials) {
    this.requireEnabled();
    const { key } = normalizeUsername(username);
    if (typeof password !== 'string' || !password.length) throw authError('INVALID_PASSWORD', '请输入密码');
    const user = this.getStore().findUser(key);
    const actual = await this.hash(password, user?.salt || this.dummySalt);
    const valid = timingSafeEqual(actual, user ? Buffer.from(user.password_hash, 'hex') : this.dummyHash);
    if (!user || !valid) throw authError('INVALID_CREDENTIALS', '用户名或密码错误', 401);
    return this.issue(user);
  }
  issue(user:User) {
    const token = randomBytes(32).toString('base64url');
    this.getStore().createSession(tokenHash(token), user.id, this.now() + SESSION_MS, this.now());
    return { token, user: publicUser(user) };
  }
  session(token:unknown) { return this.enabled && typeof token === 'string' && /^[\w-]{43}$/.test(token) ? this.sessionByHash(tokenHash(token)) : null; }
  sessionByHash(hash:string|null|undefined) { return this.enabled && hash ? this.getStore().session(hash, this.now()) : null; }
  logout(token:unknown) { if (this.store && typeof token === 'string') this.store.revokeSession(tokenHash(token)); }
  cookieOptions() { return { path: '/', httpOnly: true, sameSite: 'lax' as const, secure: this.secure, maxAge: SESSION_MS / 1000 }; }
  getStore():AccountStore {this.requireEnabled();if(!this.store)throw authError('AUTH_DISABLED','账号功能暂未开放',403);return this.store;}
  close() { this.store?.close(); }
}
