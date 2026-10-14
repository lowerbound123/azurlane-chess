import {PROTOCOL_VERSION} from '../shared/network.ts';
import type {Identity,PublicConfig,User,OnlineState,RoundMessage,ConnectionStatus,CommandPayload} from '../shared/network.ts';
import {contracts,parseContract} from '../shared/contracts.ts';
import {isRecord} from './lib/errors.ts';
import type {StorageLike} from '../shared/save.ts';
interface OnlineOptions {fetchImpl?:typeof fetch;WebSocketImpl?:typeof WebSocket;storage?:StorageLike|null;location?:Pick<Location,'host'|'protocol'>;onState?:(state:OnlineState)=>void;onRound?:(message:RoundMessage)=>void;onStatus?:(status:ConnectionStatus)=>void;onError?:(error:Error)=>void;onAuthExpired?:()=>void}
function browserStorage():StorageLike|null {try{return globalThis.localStorage??null;}catch{return null;}}
export const IDENTITY_KEY = 'azurlane-online-guest-v1';
export function decodeOnline<T>(value:T):T {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(decodeOnline) as T;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, key === 'airReady' && Array.isArray(item) ? item.map(n => n === null ? Infinity : n) : decodeOnline(item)])) as T;
}
function createRequestPrefix() {
  if (typeof globalThis.crypto.randomUUID === 'function') return globalThis.crypto.randomUUID();
  // randomUUID requires a secure context; getRandomValues also works over HTTP.
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
export class OnlineClient {
 fetchImpl:typeof fetch;WebSocketImpl:typeof WebSocket;storage:StorageLike|null;location:Pick<Location,'host'|'protocol'>;onState:(state:OnlineState)=>void;onRound:(message:RoundMessage)=>void;onStatus:(status:ConnectionStatus)=>void;onError:(error:Error)=>void;onAuthExpired:()=>void;
 pending:Map<string,{resolve:(value:unknown)=>void;reject:(error:Error)=>void;timer:ReturnType<typeof setTimeout>}>;sequence:number;requestPrefix:string;stopped:boolean;generation:number;account:User|null;identity:Identity|null;config:PublicConfig={models:[]};socket:WebSocket|null=null;retrySince:number|null=null;attempt=0;rejectOpen:((error:Error)=>void)|null=null;retryTimer:ReturnType<typeof setTimeout>|undefined;

  constructor({fetchImpl = globalThis.fetch?.bind(globalThis), WebSocketImpl = globalThis.WebSocket, storage = browserStorage(), location = globalThis.location, onState = () => {}, onRound = () => {}, onStatus = () => {}, onError = () => {}, onAuthExpired = () => {}}:OnlineOptions = {}) {
    this.fetchImpl=fetchImpl;this.WebSocketImpl=WebSocketImpl;this.storage=storage;this.location=location;this.onState=onState;this.onRound=onRound;this.onStatus=onStatus;this.onError=onError;this.onAuthExpired=onAuthExpired; this.pending = new Map(); this.sequence = 0; this.requestPrefix = createRequestPrefix(); this.stopped = true; this.generation = 0; this.account = null;
    this.identity = this.readGuest();
  }
  readGuest() {
    try { const identity = parseContract(contracts.Identity,JSON.parse(this.storage?.getItem(IDENTITY_KEY)??'null')); return identity?.identityType === 'account' ? null : identity; } catch { return null; }
  }
  persistGuest(value:string|null) {
    try { if(!this.storage)throw new Error('unavailable');if(value===null)this.storage.removeItem(IDENTITY_KEY);else this.storage.setItem(IDENTITY_KEY,value); }
    catch { this.onError(new Error('浏览器无法保存访客身份；当前连接仍可使用，下次打开需要重新连接')); }
  }
  setAccount(user:User|null) {
    if (this.account?.id === user?.id) return;
    this.close(); this.account = user || null; this.identity = user ? null : this.readGuest();
  }
  invalidateIdentity() {
    this.identity = null;
    if (this.account) this.onAuthExpired();
    else this.persistGuest(null);
  }
  async connect(nickname:string='') {
    this.close();
    this.stopped = false;
    const generation = this.generation;
    const response = await this.fetchImpl('/api/config', {credentials:'same-origin',cache:'no-store'});
    if (!response.ok) throw new Error('联机服务不可用，请确认已启动服务器');
    const rawConfig:unknown=await response.json();
    const config=parseContract(contracts.PublicConfig,isRecord(rawConfig)&&!('models' in rawConfig)?{...rawConfig,models:[]}:rawConfig);
    if (generation !== this.generation) throw new Error('账号身份已变更，请重新连接');
    if(config.protocolVersion!==PROTOCOL_VERSION){this.stopped=true;throw new Error('客户端与服务器版本不匹配，请刷新页面后重新连接');}
    this.config = config;
    if (this.account && this.identity && this.identity.accountId !== this.account.id) {
      this.invalidateIdentity(); this.stopped = true;
      throw new Error('登录状态已变化，请重新连接');
    }
    if (this.account && this.identity?.serverId !== this.config.serverId) this.identity = null;
    if (this.identity && this.identity.serverId !== this.config.serverId) { this.persistGuest(null); this.identity = null; this.onError(new Error('服务器已重启，旧访客身份已失效，请重新连接')); throw new Error('访客身份已失效，请重新连接'); }
    if (!this.identity) {
      const response = await this.fetchImpl('/api/session', {method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({nickname:this.account?.username || nickname})});
      const value:unknown=await response.json();
      const body=isRecord(value)?value:{};
      if (generation !== this.generation) throw new Error('账号身份已变更，请重新连接');
      if (!response.ok) { if (response.status === 401) this.onAuthExpired(); throw new Error(typeof body.message==='string'?body.message:typeof body.error==='string'?body.error:'创建联机身份失败'); }
      if ((body.identityType === 'account') !== !!this.account || (this.account && body.accountId !== this.account.id)) {
        this.identity = null; this.stopped = true; this.onAuthExpired();
        throw new Error('登录状态已变化，请重新连接');
      }
      this.identity = parseContract(contracts.Identity,body);
      if (!this.account) this.persistGuest(JSON.stringify(body));
    }
    await this.open(); return this.config;
  }
  open() {
    this.onStatus('connecting');
    const generation = this.generation;
    return new Promise<void>((resolve, reject) => {
      this.rejectOpen = reject;
      const socket = this.socket = new this.WebSocketImpl(`${this.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${this.location.host}/ws`);
      const current = () => this.generation === generation && this.socket === socket;
      socket.onopen = async () => { if (!current()) return; try { await this.send('auth', {}, {token:this.identity!.token}); if (!current()) return; this.retrySince = null; this.attempt = 0; this.rejectOpen = null; this.onStatus('connected'); resolve(); } catch (error) { reject(error); } };
      socket.onmessage = event => {
        if (!current()) return;
        let message:Record<string,unknown>;try{const raw:unknown=JSON.parse(event.data);if(!isRecord(raw))return;message=raw;}catch{return;}
        if(message.code==='PROTOCOL_MISMATCH'||(message.v!==undefined&&message.v!==PROTOCOL_VERSION)){const error=new Error('客户端与服务器版本不匹配，请刷新页面');this.onError(error);this.close();return;}
        if (message.type === 'ack' || message.type === 'error') {
          const pending = this.pending.get(String(message.id)); if (pending) { clearTimeout(pending.timer); this.pending.delete(String(message.id)); }
          if (message.type === 'error' || message.ok === false) {
            const error = Object.assign(new Error(typeof message.message==='string'?message.message:'服务器拒绝操作'), {code:message.code});
            if (/SESSION|AUTH|TOKEN|SERVER_RESTART/.test(typeof message.code==='string'?message.code:'')) { this.invalidateIdentity(); this.stopped = true; socket.close(); }
            if (pending) pending.reject(error); else this.onError(error);
          } else pending?.resolve(message.data);
        } else {
          try {
            if (message.type === 'state') this.onState(decodeOnline(parseContract(contracts.OnlineState,message)));
            else if (message.type === 'round') this.onRound(decodeOnline(parseContract(contracts.RoundMessage,message)));
          } catch(error) {this.onError(error instanceof Error?error:new Error('服务器返回的数据格式无效'));}
        }
      };
      socket.onerror = () => { if (!current()) return; const error = new Error('无法连接联机服务'); this.onError(error); reject(error); };
      socket.onclose = event => {
        if (!current()) return;
        if (event?.code === 4001) { this.stopped = true; this.onError(new Error("另一个页面已接管联机身份，本页已停止重连")); }
        for (const pending of this.pending.values()) { clearTimeout(pending.timer); pending.reject(new Error('连接中断，操作未确认；重连后请检查状态')); } this.pending.clear();
        reject(new Error('联机连接已关闭'));
        this.onStatus(this.stopped ? 'disconnected' : 'reconnecting');
        if (this.stopped) return;
        this.retrySince ??= Date.now();
        if (Date.now() - this.retrySince > 90000) { this.stopped = true; this.onStatus('disconnected'); this.onError(new Error('重连超时，请重新连接')); return; }
        this.retryTimer = setTimeout(() => this.open().catch(error => this.onError(error instanceof Error?error:new Error(String(error)))), Math.min(5000, 500 * 2 ** (this.attempt++ || 0)));
      };
    });
  }
  send(type:string, payload:CommandPayload = {}, context:CommandPayload = {}) {
    if (this.socket?.readyState !== 1) return Promise.reject(new Error('尚未连接服务器'));
    const id = `${this.requestPrefix}:${++this.sequence}`;
    return new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('服务器确认超时，请检查最新状态后重试')); }, 15000);
      this.pending.set(id, {resolve,reject,timer}); this.socket!.send(JSON.stringify({v:PROTOCOL_VERSION,id,type,payload,...context}));
    });
  }
  close() {
    this.stopped = true; this.generation++; clearTimeout(this.retryTimer);
    const error = new Error('连接中断，操作未确认；重连后请检查状态');
    this.rejectOpen?.(error); this.rejectOpen = null;
    for (const pending of this.pending.values()) { clearTimeout(pending.timer); pending.reject(error); }
    this.pending.clear();
    const socket = this.socket; this.socket = null; socket?.close();
    this.onStatus('disconnected');
  }
}
