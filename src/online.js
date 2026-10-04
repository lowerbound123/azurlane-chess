export const IDENTITY_KEY = 'azurlane-online-guest-v1';
export function decodeOnline(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(decodeOnline);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, key === 'airReady' && Array.isArray(item) ? item.map(n => n === null ? Infinity : n) : decodeOnline(item)]));
}
export class OnlineClient {
  constructor({fetchImpl = globalThis.fetch?.bind(globalThis), WebSocketImpl = globalThis.WebSocket, storage = globalThis.localStorage, location = globalThis.location, onState = () => {}, onRound = () => {}, onStatus = () => {}, onError = () => {}} = {}) {
    Object.assign(this, {fetchImpl, WebSocketImpl, storage, location, onState, onRound, onStatus, onError}); this.pending = new Map(); this.sequence = 0; this.requestPrefix = globalThis.crypto.randomUUID(); this.stopped = true;
    try { this.identity = JSON.parse(storage.getItem(IDENTITY_KEY)); } catch { this.identity = null; }
  }
  async connect(nickname) {
    this.stopped = false;
    const response = await this.fetchImpl('/api/config');
    if (!response.ok) throw new Error('联机服务不可用，请确认已启动服务器');
    this.config = await response.json();
    if (this.identity && this.identity.serverId !== this.config.serverId) { this.storage.removeItem(IDENTITY_KEY); this.identity = null; this.onError(new Error('服务器已重启，旧访客身份已失效，请重新连接')); throw new Error('访客身份已失效，请重新连接'); }
    if (!this.identity) {
      const response = await this.fetchImpl('/api/session', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nickname})});
      const body = await response.json(); if (!response.ok) throw new Error(body.message || body.error || '创建访客身份失败');
      this.identity = body; this.storage.setItem(IDENTITY_KEY, JSON.stringify(body));
    }
    await this.open(); return this.config;
  }
  open() {
    this.onStatus('connecting');
    return new Promise((resolve, reject) => {
      const socket = this.socket = new this.WebSocketImpl(`${this.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${this.location.host}/ws`);
      socket.onopen = async () => { try { await this.send('auth', {}, {token:this.identity.token}); this.retrySince = null; this.attempt = 0; this.onStatus('connected'); resolve(); } catch (error) { reject(error); } };
      socket.onmessage = event => {
        let message; try { message = decodeOnline(JSON.parse(event.data)); } catch { return; }
        if (message.type === 'ack' || message.type === 'error') {
          const pending = this.pending.get(message.id); if (pending) { clearTimeout(pending.timer); this.pending.delete(message.id); }
          if (message.type === 'error' || message.ok === false) {
            const error = Object.assign(new Error(message.message || '服务器拒绝操作'), {code:message.code});
            if (/SESSION|AUTH|TOKEN|SERVER_RESTART/.test(message.code || '')) { this.identity = null; this.storage.removeItem(IDENTITY_KEY); this.stopped = true; socket.close(); }
            if (pending) pending.reject(error); else this.onError(error);
          } else pending?.resolve(message.data);
        } else if (message.type === 'state') this.onState(message);
        else if (message.type === 'round') this.onRound(message);
      };
      socket.onerror = () => { const error = new Error('无法连接联机服务'); this.onError(error); reject(error); };
      socket.onclose = event => {
        if (event?.code === 4001) { this.stopped = true; this.onError(new Error("另一个页面已接管联机身份，本页已停止重连")); }
        for (const pending of this.pending.values()) { clearTimeout(pending.timer); pending.reject(new Error('连接中断，操作未确认；重连后请检查状态')); } this.pending.clear();
        reject(new Error('联机连接已关闭'));
        this.onStatus(this.stopped ? 'disconnected' : 'reconnecting');
        if (this.stopped) return;
        this.retrySince ??= Date.now();
        if (Date.now() - this.retrySince > 90000) { this.stopped = true; this.onStatus('disconnected'); this.onError(new Error('重连超时，请重新连接')); return; }
        this.retryTimer = setTimeout(() => this.open().catch(error => this.onError(error)), Math.min(5000, 500 * 2 ** (this.attempt++ || 0)));
      };
    });
  }
  send(type, payload = {}, context = {}) {
    if (this.socket?.readyState !== 1) return Promise.reject(new Error('尚未连接服务器'));
    const id = `${this.requestPrefix}:${++this.sequence}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('服务器确认超时，请检查最新状态后重试')); }, 15000);
      this.pending.set(id, {resolve,reject,timer}); this.socket.send(JSON.stringify({v:1,id,type,payload,...context}));
    });
  }
  close() { this.stopped = true; clearTimeout(this.retryTimer); this.socket?.close(); }
}
