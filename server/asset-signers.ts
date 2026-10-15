import {createRequire} from 'node:module';
import {S3Client,GetObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import type OSS from 'ali-oss';
import type COS from 'cos-nodejs-sdk-v5';
import type {AssetSigner,AssetStorageConfig} from './asset-storage.ts';
const require=createRequire(import.meta.url);
/** CommonJS SDKs use require explicitly so their exports remain stable under Node 25 ESM. */
export async function createAssetSigner(config:AssetStorageConfig):Promise<AssetSigner>{
 if(config.provider==='local')return async()=>{throw new Error('local does not sign');};
 try{
  if(config.provider==='s3'){
   const client=new S3Client({region:config.region,endpoint:config.endpoint,forcePathStyle:config.forcePathStyle,credentials:{accessKeyId:config.accessKeyId!,secretAccessKey:config.secretAccessKey!}});
   return async(key,ttl,seconds)=>({url:await getSignedUrl(client,new GetObjectCommand({Bucket:config.bucket!,Key:key}),{expiresIn:ttl,signingDate:new Date(seconds*1000)}),expiresAt:(seconds+ttl)*1000});
  }
  if(config.provider==='oss'){
   const Oss=require('ali-oss') as typeof OSS;
   const client=new Oss({bucket:config.bucket,region:config.region,endpoint:config.endpoint,cname:config.cname,secure:config.endpoint?new URL(config.endpoint).protocol==='https:':true,authorizationV4:true,accessKeyId:config.accessKeyId!,accessKeySecret:config.secretAccessKey!});
   return async(key,ttl)=>{
    const url=await client.signatureUrlV4('GET',ttl,undefined,key);
    const date=new URL(url).searchParams.get('x-oss-date')!;
    const signedAt=Date.parse(date.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,'$1-$2-$3T$4:$5:$6Z'));
    return {url,expiresAt:signedAt+ttl*1000};
   };
  }
  const Cos=require('cos-nodejs-sdk-v5') as typeof COS;
  const endpoint=config.endpoint?new URL(config.endpoint):undefined;
  const client=new Cos({SecretId:config.accessKeyId!,SecretKey:config.secretAccessKey!,Domain:endpoint?.host,Protocol:endpoint?.protocol==='http:'?'http:':'https:',ForceSignHost:true});
  return (key,ttl)=>new Promise((resolve,reject)=>client.getObjectUrl({Bucket:config.bucket!,Region:config.region!,Key:key,Method:'GET',Sign:true,Expires:ttl},(error,data)=>{
   if(error){reject(error);return;}
   const url=data.Url;
   const end=new URL(url).searchParams.get('q-sign-time')?.split(';')[1];
   resolve({url,expiresAt:Number(end)*1000});
  }));
 }catch{throw new Error('资源存储 SDK 初始化失败，请检查供应商配置');}
}
