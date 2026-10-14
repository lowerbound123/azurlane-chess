import type {AccountState,User,MatchList,MatchRecord} from '../shared/network.ts';
import {contracts,parseContract} from '../shared/contracts.ts';
import {isRecord} from './lib/errors.ts';
interface Credentials {username:string;password:string;confirmPassword?:string}
// Account secrets live only in the server's HttpOnly cookie. This client never
// writes account data or online credentials to browser storage.
export class AccountClient {
 fetchImpl:typeof fetch;onChange:(state:AccountState)=>void;state:AccountState;configEnabled:boolean|null;revision:number;
  constructor({fetchImpl = globalThis.fetch?.bind(globalThis), onChange = () => {}}: {fetchImpl?:typeof fetch;onChange?:(state:AccountState)=>void} = {}) {
    this.fetchImpl = fetchImpl;
    this.onChange = onChange;
    this.state = {enabled:false, loaded:false, user:null};
    // null means configuration is still unknown, not that the server disabled it.
    this.configEnabled = null;
    this.revision = 0;
  }
  update(patch:Partial<AccountState>) {
    this.state = {...this.state, ...patch};
    this.onChange(this.state);
  }
  async request(path:string, body?:unknown) {
    const revision = this.revision;
    let response;
    try {
      response = await this.fetchImpl(path, {credentials:'same-origin', cache:'no-store', ...(body === undefined ? {} : {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)})});
    } catch { throw new Error('无法连接账号服务，请稍后重试'); }
    let result:unknown;
    try { result = await response.json(); } catch { throw new Error('账号服务暂时不可用，请稍后重试'); }
    if(!isRecord(result))throw new Error('账号服务返回的数据格式无效');
    if (!response.ok) {
      if (revision === this.revision && response.status === 401) { this.revision++; this.update({user:null}); }
      if (revision === this.revision && (result.code === 'AUTH_DISABLED' || result.error === 'AUTH_DISABLED')) { this.configEnabled = false; this.update({enabled:false, user:null}); }
      throw Object.assign(new Error(typeof result.message==='string'?result.message : '请求未成功，请稍后重试'), {code:result.code || result.error, status:response.status});
    }
    return result;
  }
  async initialize() {
    let config;
    try {
      config = await this.request('/api/config');
    } catch { this.update({enabled:false, loaded:true, user:null}); return this.state; }
    this.configEnabled = isRecord(config.auth)&&config.auth.enabled === true;
    if (!this.configEnabled) this.update({enabled:false, loaded:true, user:null});
    else {
      this.update({loaded:true});
      // Keep initial controls closed until identity is verified, but remember
      // the confirmed flag so the next connection can retry a transient outage.
      try { await this.refresh(); } catch { /* Retain the last verified identity. */ }
    }
    return this.state;
  }
  async refresh() {
    if (this.configEnabled === null && this.state.loaded) { await this.initialize(); return this.state.user; }
    if (!this.configEnabled && !this.state.enabled) return this.state.user;
    const revision = this.revision;
    const result = await this.request('/api/auth/me');
    if (revision === this.revision) this.update({enabled:true, user:result.user?parseContract(contracts.User,result.user):null});
    return this.state.user;
  }
  requireEnabled() {
    if (!this.state.enabled) throw new Error('账号功能暂未开放');
  }
  async authenticate(action:'login'|'register', values:Credentials) {
    this.requireEnabled();
    this.revision++;
    const result = await this.request(`/api/auth/${action}`, values);
    this.revision++;
    this.update({user:parseContract(contracts.User,result.user)});
    return parseContract(contracts.User,result.user);
  }
  login(values:Credentials) { return this.authenticate('login', values); }
  register(values:Credentials) { return this.authenticate('register', values); }
  async logout() {
    this.revision++;
    await this.request('/api/auth/logout', {});
    this.revision++;
    this.update({user:null});
  }
  matches(cursor?:string|null) {
    this.requireEnabled();
    return this.request('/api/me/matches' + (cursor ? `?cursor=${encodeURIComponent(cursor)}` : '')).then(value=>parseContract(contracts.MatchList,value));
  }
  match(id:string) { this.requireEnabled(); return this.request(`/api/me/matches/${encodeURIComponent(id)}`).then(value=>parseContract(contracts.MatchRecord,value)); }
}
