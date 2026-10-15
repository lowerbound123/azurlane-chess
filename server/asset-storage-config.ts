import {readFileSync,existsSync,realpathSync} from 'node:fs';
import path from 'node:path';
import type {AssetProvider} from '../shared/assets.ts';
import {projectRoot} from './paths.ts';
export interface AssetStorageConfig {provider:AssetProvider;bucket?:string;region?:string;endpoint?:string;prefix:string;urlTtlSeconds:number;accessKeyId?:string;secretAccessKey?:string;forcePathStyle?:boolean;cname?:boolean}
export function loadAssetStorageConfig({env=process.env,root=projectRoot,staticRoot}:{env?:NodeJS.ProcessEnv;root?:string;staticRoot?:string}={}):AssetStorageConfig {
 const configured=env.ASSET_STORAGE_CONFIG;
 const file=configured?path.resolve(root,configured):path.join(root,'config/asset-storage.json');
 if(!existsSync(file)&&!configured)return {provider:'local',prefix:'',urlTtlSeconds:3600};
 if(existsSync(file)){
  const actual=realpathSync(file);
  for(const directory of [staticRoot,path.join(root,'public'),path.join(root,'.generated/public')]){
   if(!directory||!existsSync(directory))continue;
   for(const [base,target] of [[path.resolve(directory),path.resolve(file)],[realpathSync(directory),actual]] as const){
    const relative=path.relative(base,target);
    if(!relative||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative)))throw new Error('资源存储私有配置不得位于公开目录');
   }
  }
 }
 let raw:Record<string,unknown>;
 try {raw=JSON.parse(readFileSync(file,'utf8'));}catch{throw new Error('资源存储配置无法读取或 JSON 格式无效');}
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('资源存储配置必须是对象');
 const provider=raw.provider;
 if(typeof provider!=='string'||!['local','s3','oss','cos'].includes(provider))throw new Error('资源存储 provider 无效');
 const ttl=raw.urlTtlSeconds??3600;
 if(typeof ttl!=='number'||!Number.isInteger(ttl)||ttl<1||ttl>604800)throw new Error('资源存储 urlTtlSeconds 必须为 1 至 604800 的整数');
 const prefix=raw.prefix??'';
 if(typeof prefix!=='string'||prefix.includes('..')||/[\\?#\x00-\x1f]/.test(prefix))throw new Error('资源存储 prefix 无效');
 for(const key of ['bucket','region','endpoint','accessKeyId','secretAccessKey'])if(raw[key]!==undefined&&typeof raw[key]!=='string')throw new Error(`资源存储 ${key} 类型无效`);
 for(const key of ['forcePathStyle','cname'])if(raw[key]!==undefined&&typeof raw[key]!=='boolean')throw new Error(`资源存储 ${key} 类型无效`);
 const config:AssetStorageConfig={provider:provider as AssetProvider,prefix:prefix.replace(/^\/+|\/+$/g,''),urlTtlSeconds:ttl,bucket:raw.bucket as string|undefined,region:raw.region as string|undefined,endpoint:raw.endpoint as string|undefined,accessKeyId:env.ASSET_ACCESS_KEY_ID??raw.accessKeyId as string|undefined,secretAccessKey:env.ASSET_SECRET_ACCESS_KEY??raw.secretAccessKey as string|undefined,forcePathStyle:raw.forcePathStyle as boolean|undefined,cname:raw.cname as boolean|undefined};
 if(config.provider!=='local')for(const key of ['bucket','region','accessKeyId','secretAccessKey'] as const)if(!config[key]?.trim())throw new Error(`资源存储缺少 ${key}`);
 if(config.endpoint){try{const url=new URL(config.endpoint);if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error();}catch{throw new Error('资源存储 endpoint 必须为不含认证、路径和查询参数的 HTTP(S) 地址');}}
 if(config.cname&&(!config.endpoint||config.provider!=='oss'))throw new Error('资源存储 cname 仅适用于配置 endpoint 的 OSS');
 return config;
}
