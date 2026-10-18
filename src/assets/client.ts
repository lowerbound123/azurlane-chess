import type {AssetProvider,AssetResolution,AssetResolveResponse,RuntimeAssetManifest} from '../../shared/assets.ts';

type Options={baseUrl?:string;fetchImpl?:typeof fetch;now?:()=>number;timeoutMs?:number;preloadTimeoutMs?:number};
type Pending={promise:Promise<AssetResolution>;resolve:(value:AssetResolution)=>void};
/** One instance per application: configuration, signatures and pending batches are shared. */
export class AssetClient {
 private readonly baseUrl:string;
 private readonly fetchImpl:typeof fetch;
 private readonly now:()=>number;
 private readonly timeoutMs:number;
 private readonly preloadTimeoutMs:number;
 // Compressed files live for the document's lifetime; consumers share these URLs,
 // including native images/audio/video which cannot read a custom response cache.
 private prepared=new Map<string,AssetResolution>();
 private preparing=new Map<string,Promise<void>>();
 private failedPreloads=new Set<string>();
 private configuration?:Promise<AssetProvider>;
 private cache=new Map<string,AssetResolution>();
 private pending=new Map<string,Pending>();
 private queued=new Set<string>();
 private scheduled=false;
 private reportedFallbacks=new Set<string>();
 constructor(readonly manifest:RuntimeAssetManifest,options:Options={}){
  this.baseUrl=(options.baseUrl??'/').replace(/\/?$/,'/');this.fetchImpl=options.fetchImpl??((...args)=>fetch(...args));
  this.now=options.now??Date.now;this.timeoutMs=options.timeoutMs??5000;
  this.preloadTimeoutMs=options.preloadTimeoutMs??60000;
 }
 local(id:string):AssetResolution {
  const record=this.manifest.files[id];if(!Object.hasOwn(this.manifest.files,id))throw new Error(`未知资源：${id}`);
  return this.prepared.get(id)??{url:this.baseUrl+record.path,expiresAt:null,source:'local'};
 }
 /** Log each fallback group once, without remote URLs or underlying SDK errors. */
 fallback(ids:string[]):Record<string,AssetResolution>{
  const result=Object.fromEntries(ids.map(id=>[id,this.local(id)]));
  const key=[...new Set(ids)].sort().join(', ');
  if(!this.reportedFallbacks.has(key)){this.reportedFallbacks.add(key);console.warn('远程素材不可用，使用本地资源：',key);}
  return result;
 }
 private async request(path:string,init:RequestInit={}) {
  const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
  try{return await Promise.race([this.fetchImpl(path,{...init,credentials:'same-origin',signal:controller.signal}).then(async response=>{if(!response.ok)throw new Error('资源服务不可用');return response.json();}),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('资源服务超时'));},this.timeoutMs);})]);}
  finally{clearTimeout(timer);}
 }
 private provider(){
  return this.configuration??=this.request('/api/config').then(config=>{
   const provider=config?.assetStorage?.provider;return (['s3','oss','cos'].includes(provider)?provider:'local') as AssetProvider;
  }).catch(()=>'local' as const);
 }
 async resolve(ids:string[]):Promise<Record<string,AssetResolution>> {
  const unique=[...new Set(ids)];for(const id of unique)this.local(id);
  if(!unique.length)return {};
  if(unique.every(id=>this.prepared.has(id)))return Object.fromEntries(unique.map(id=>[id,this.local(id)]));
  if(await this.provider()==='local')return Object.fromEntries(unique.map(id=>[id,this.local(id)]));
  return Object.fromEntries(await Promise.all(unique.map(async id=>[id,this.prepared.get(id)??await this.resolveOne(id)])));
 }
 private resolveOne(id:string):Promise<AssetResolution> {
  const cached=this.cache.get(id);if(cached&&cached.expiresAt!==null&&cached.expiresAt>this.now())return Promise.resolve(cached);
  const existing=this.pending.get(id);if(existing)return existing.promise;
  let resolve!:(value:AssetResolution)=>void;
  const promise=new Promise<AssetResolution>(done=>{resolve=done;});this.pending.set(id,{promise,resolve});this.queued.add(id);
  if(!this.scheduled){this.scheduled=true;queueMicrotask(()=>{this.scheduled=false;const ids=[...this.queued];this.queued.clear();for(let i=0;i<ids.length;i+=128)void this.flush(ids.slice(i,i+128));});}
  return promise;
 }
 private async flush(ids:string[]) {
  let assets:AssetResolveResponse['assets']={};
  try{assets=(await this.request('/api/assets/resolve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids})})).assets??{};}catch{/* Same-release local assets remain available without the API. */}
  for(const id of ids){
   const candidate=assets[id];const value=candidate?.source==='remote'&&typeof candidate.url==='string'&&/^https?:\/\//.test(candidate.url)&&typeof candidate.expiresAt==='number'&&candidate.expiresAt>this.now()?candidate:this.local(id);
   if(value.source==='remote')this.cache.set(id,value);
   this.pending.get(id)?.resolve(value);this.pending.delete(id);
  }
 }
 /** Invalidate browser signatures only; the server still reuses every valid signature. */
 async retry(ids:string[],previous:Record<string,AssetResolution>){
  for(const id of ids)if(this.cache.get(id)?.url===previous[id]?.url)this.cache.delete(id);
  return this.resolve(ids);
 }
 /** Read and verify the entire file before making it available to any consumer. */
 async preload(id:string):Promise<void>{
  this.local(id);
  if(this.prepared.has(id))return;
  const pending=this.preparing.get(id);if(pending)return pending;
  const prepare=this.load([id],async urls=>{
   const record=this.manifest.files[id],controller=new AbortController();
   let timer:ReturnType<typeof setTimeout>|undefined;
   try{
    const bytes=await Promise.race([
     this.fetchImpl(urls[id],{cache:this.failedPreloads.has(id)?'reload':'force-cache',signal:controller.signal}).then(async response=>{
      if(!response.ok)throw new Error(`资源加载失败：${id}`);
      return response.arrayBuffer();
     }),
     new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error(`资源加载超时：${id}`));},this.preloadTimeoutMs);}),
    ]);
    if(bytes.byteLength!==record.bytes)throw new Error(`资源大小不符：${id}`);
    // SubtleCrypto is unavailable on supported LAN HTTP origins. Complete-body
    // and size checks still apply there; secure origins additionally verify SHA.
    if(globalThis.crypto?.subtle){
     const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
     if(hash!==record.sha256)throw new Error(`资源校验失败：${id}`);
    }
    this.prepared.set(id,{url:URL.createObjectURL(new Blob([bytes],{type:record.contentType})),source:'local',expiresAt:null});
    this.failedPreloads.delete(id);
   }catch(error){this.failedPreloads.add(id);throw error;}
   finally{clearTimeout(timer);}
  }).finally(()=>{this.preparing.delete(id);});
  this.preparing.set(id,prepare);return prepare;
 }
 async load<T>(ids:string[],loader:(urls:Record<string,string>)=>Promise<T>):Promise<T>{
  const urls=(assets:Record<string,AssetResolution>)=>Object.fromEntries(Object.entries(assets).map(([id,value])=>[id,value.url]));
  const hasRemote=(assets:Record<string,AssetResolution>)=>Object.values(assets).some(value=>value.source==='remote');
  const mixed=(assets:Record<string,AssetResolution>)=>hasRemote(assets)&&Object.values(assets).some(value=>value.source==='local');
  const first=await this.resolve(ids);
  if(mixed(first))return loader(urls(this.fallback(ids)));
  try{return await loader(urls(first));}catch(error){if(!hasRemote(first))throw error;}
  const second=await this.retry(ids,first);
  if(mixed(second)||!hasRemote(second))return loader(urls(this.fallback(ids)));
  if(ids.some(id=>first[id].url!==second[id].url)){
   try{return await loader(urls(second));}catch{/* One changed signature attempt is enough. */}
  }
  return loader(urls(this.fallback(ids)));
 }
}
