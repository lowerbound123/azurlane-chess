import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import type {AssetProvider,AssetResolution,AssetResolveResponse,RuntimeAssetManifest} from '../shared/assets.ts';
import {projectRoot} from './paths.ts';
export {loadAssetStorageConfig} from './asset-storage-config.ts';
export type {AssetStorageConfig} from './asset-storage-config.ts';
import type {AssetStorageConfig} from './asset-storage-config.ts';
export function loadRuntimeManifest(staticRoot:string,allowSource:boolean):RuntimeAssetManifest {
 const deployed=path.join(staticRoot,'assets/runtime-manifest.json');
 const file=existsSync(deployed)?deployed:allowSource?path.join(projectRoot,'assets/runtime/manifest.json'):deployed;
 let manifest:RuntimeAssetManifest;
 try{manifest=JSON.parse(readFileSync(file,'utf8'));}catch{throw new Error('缺少或无法读取运行资源清单，请先准备并构建资源');}
 if(manifest?.version!==1||!manifest.files||typeof manifest.files!=='object')throw new Error('运行资源清单格式无效');
 for(const record of Object.values(manifest.files))if(!record||typeof record.path!=='string'||!record.path.startsWith('assets/runtime/')||record.path.includes('..')||/[\\?#\x00-\x1f]/.test(record.path)||!/^([a-f0-9]{64})$/.test(record.sha256))throw new Error('运行资源清单文件记录无效');
 return manifest;
}
export type AssetSigner=(key:string,ttlSeconds:number,nowSeconds:number)=>Promise<{url:string;expiresAt:number}>;
export class AssetStorage {
 readonly stats={signatures:0,hits:0,coalesced:0,failures:0};
 readonly publicConfig:{provider:AssetProvider};
 private cache=new Map<string,AssetResolution>();
 private pending=new Map<string,Promise<AssetResolution>>();
 constructor(private config:AssetStorageConfig,private manifest:RuntimeAssetManifest,private signer:AssetSigner,private now:()=>number=Date.now,private warn?:(event:{provider:AssetProvider;assetId:string;failures:number})=>void){this.config={...config};this.publicConfig=Object.freeze({provider:config.provider});}
 async resolve(ids:string[]):Promise<AssetResolveResponse>{
  if(!Array.isArray(ids)||ids.length>128||ids.some(id=>typeof id!=='string'||!Object.hasOwn(this.manifest.files,id)))throw Object.assign(new Error('资源 ID 无效'),{statusCode:400});
  return {assets:Object.fromEntries(await Promise.all([...new Set(ids)].map(async id=>[id,await this.resolveOne(id)])))};
 }
 private async resolveOne(id:string):Promise<AssetResolution>{
  const record=this.manifest.files[id]!;
  const local:AssetResolution={url:record.path,expiresAt:null,source:'local'};
  if(this.config.provider==='local')return local;
  const key=[this.config.prefix,record.path].filter(Boolean).join('/');
  // Each instance owns one immutable configuration, isolating credentials/providers.
  const cacheKey=JSON.stringify([key,record.sha256]);
  const cached=this.cache.get(cacheKey);
  if(cached&&cached.expiresAt!>this.now()){this.stats.hits++;return cached;}
  const pending=this.pending.get(cacheKey);
  if(pending){this.stats.coalesced++;return pending;}
  const result=Promise.resolve().then(async()=>{
   try{const seconds=Math.floor(this.now()/1000);this.stats.signatures++;
    const signed=await this.signer(key,this.config.urlTtlSeconds,seconds);
    if(!Number.isFinite(signed.expiresAt)||signed.expiresAt<=this.now())throw new Error('签名时间无效');
    const value:AssetResolution={...signed,source:'remote'};
    this.cache.set(cacheKey,value);return value;
   }catch{this.stats.failures++;this.warn?.({provider:this.config.provider,assetId:id,failures:this.stats.failures});return local;}
   finally{this.pending.delete(cacheKey);}
  });
  this.pending.set(cacheKey,result);return result;
 }
}
