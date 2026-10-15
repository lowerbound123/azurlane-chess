import {createRequire} from 'node:module';
import {S3Client,HeadObjectCommand,PutObjectCommand} from '@aws-sdk/client-s3';
import type OSS from 'ali-oss';
import type COS from 'cos-nodejs-sdk-v5';
import type {AssetStorageConfig} from '../server/asset-storage-config.ts';
const require=createRequire(import.meta.url);
export interface ObjectMetadata {sha256?:string;bytes?:number;contentType?:string;cacheControl?:string}
export interface UploadMetadata extends ObjectMetadata {sha256:string;bytes:number;contentType:string;cacheControl:string}
export interface AssetUploader {
 head(key:string):Promise<ObjectMetadata|null>;
 put(key:string,body:Buffer,metadata:UploadMetadata):Promise<void>;
 close():void;
}
/** Never emit raw SDK messages: they may include credentials or signed request URLs. */
export function storageStatus(error:unknown):number|undefined {
 if(!error||typeof error!=='object')return;
 const e=error as {status?:unknown;statusCode?:unknown;$metadata?:{httpStatusCode?:unknown}};
 const status=e.$metadata?.httpStatusCode??e.statusCode??e.status;
 return typeof status==='number'&&Number.isInteger(status)&&status>=100&&status<=599?status:undefined;
}
async function missingOrThrow<T>(operation:()=>Promise<T>):Promise<T|null>{
 try{return await operation();}catch(error){if(storageStatus(error)===404)return null;throw error;}
}
function headersMetadata(headers:object|undefined,prefix:string):ObjectMetadata {
 const normalized=Object.fromEntries(Object.entries(headers??{}).map(([key,value])=>[key.toLowerCase(),value]));
 const string=(name:string)=>typeof normalized[name]==='string'?normalized[name] as string:undefined;
 return {sha256:string(prefix+'sha256'),bytes:Number(normalized['content-length']),contentType:string('content-type'),cacheControl:string('cache-control')};
}
/** Uses the same endpoint, domain and addressing rules as the read-side signer. */
export async function createAssetUploader(config:AssetStorageConfig):Promise<AssetUploader>{
 if(config.provider==='local')throw new Error('本地模式无需上传');
 if(config.provider==='s3'){
  const client=new S3Client({region:config.region,endpoint:config.endpoint,forcePathStyle:config.forcePathStyle,credentials:{accessKeyId:config.accessKeyId!,secretAccessKey:config.secretAccessKey!},maxAttempts:3,requestHandler:{connectionTimeout:5000,requestTimeout:20000}});
  return {
   head:key=>missingOrThrow(async()=>{const result=await client.send(new HeadObjectCommand({Bucket:config.bucket!,Key:key}));return {sha256:result.Metadata?.sha256,bytes:result.ContentLength,contentType:result.ContentType,cacheControl:result.CacheControl};}),
   put:async(key,body,meta)=>{await client.send(new PutObjectCommand({Bucket:config.bucket!,Key:key,Body:body,ContentLength:meta.bytes,ContentType:meta.contentType,CacheControl:meta.cacheControl,Metadata:{sha256:meta.sha256}}));},
   close:()=>client.destroy(),
  };
 }
 if(config.provider==='oss'){
  const Oss=require('ali-oss') as typeof OSS;
  const client=new Oss({bucket:config.bucket,region:config.region,endpoint:config.endpoint,cname:config.cname,secure:config.endpoint?new URL(config.endpoint).protocol==='https:':true,authorizationV4:true,accessKeyId:config.accessKeyId!,accessKeySecret:config.secretAccessKey!,timeout:20000});
  return {
   head:key=>missingOrThrow(async()=>headersMetadata((await client.head(key)).res.headers,'x-oss-meta-')),
   put:async(key,body,meta)=>{await client.put(key,body,{mime:meta.contentType,headers:{'Cache-Control':meta.cacheControl,'x-oss-meta-sha256':meta.sha256}});},
   close:()=>{},
  };
 }
 const Cos=require('cos-nodejs-sdk-v5') as typeof COS,endpoint=config.endpoint?new URL(config.endpoint):undefined;
 const client=new Cos({SecretId:config.accessKeyId!,SecretKey:config.secretAccessKey!,Domain:endpoint?.host,Protocol:endpoint?.protocol==='http:'?'http:':'https:',ForceSignHost:true,Timeout:20000});
 const location={Bucket:config.bucket!,Region:config.region!};
 return {
  head:key=>missingOrThrow(async()=>headersMetadata((await client.headObject({...location,Key:key})).headers,'x-cos-meta-')),
  put:async(key,body,meta)=>{await client.putObject({...location,Key:key,Body:body,ContentLength:meta.bytes,ContentType:meta.contentType,CacheControl:meta.cacheControl,'x-cos-meta-sha256':meta.sha256});},
  close:()=>{},
 };
}
