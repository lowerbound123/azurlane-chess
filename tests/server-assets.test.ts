import {test,expect} from 'vitest';
import {mkdtemp,writeFile,mkdir,rm,symlink} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createApp} from '../server/app.ts';
import type {RuntimeAssetManifest} from '../shared/assets.ts';

const manifest:RuntimeAssetManifest={version:1,files:{'images/test':{path:'assets/runtime/test-0123456789abcdef.webp',sha256:'a'.repeat(64),bytes:12,contentType:'image/webp'}},images:{},spine:{},spinePreviews:{},models:{aircraft:'models/aircraft',mine:'models/mine',torpedo:'models/torpedo'},sources:{},spineFingerprints:{}};

test('local assets resolve without login using the deployed manifest and reject arbitrary object keys',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'chess-assets-'));
 await mkdir(path.join(dir,'assets'));
 await writeFile(path.join(dir,'assets/runtime-manifest.json'),JSON.stringify(manifest));
 const app=await createApp({requireBuild:false,staticRoot:dir,models:[],authEnabled:false});
 try{
  expect((await app.inject('/api/config')).json().assetStorage).toEqual({provider:'local'});
  const resolve=await app.inject({method:'POST',url:'/api/assets/resolve',payload:{ids:['images/test']}});
  expect(resolve.statusCode).toBe(200);
  expect(resolve.json()).toEqual({assets:{'images/test':{url:'assets/runtime/test-0123456789abcdef.webp',expiresAt:null,source:'local'}}});
  for(const payload of [{ids:['https://evil.test/file']},{ids:['__proto__']},{ids:Array(129).fill('images/test')},{ids:['images/test'],key:'secret'},{ids:[2]}]){
   expect((await app.inject({method:'POST',url:'/api/assets/resolve',payload})).statusCode).toBe(400);
  }
 }finally{await app.close();await rm(dir,{recursive:true,force:true});}
});

import {AssetStorage,loadAssetStorageConfig} from '../server/asset-storage.ts';
import {createAssetSigner} from '../server/asset-signers.ts';
import type {AssetStorageConfig} from '../server/asset-storage.ts';
const remote:AssetStorageConfig={provider:'s3',bucket:'test-bucket',region:'us-east-1',prefix:'release',urlTtlSeconds:3600,accessKeyId:'FAKE_ACCESS_KEY',secretAccessKey:'FAKE_SECRET_KEY'};

test('100 simultaneous players share one signature until exact expiration, then refresh once',async()=>{
 let now=1_800_000_000_999;
 const storage=new AssetStorage(remote,manifest,async(key,ttl,seconds)=>({url:`https://bucket.test/${key}?signed=${seconds}`,expiresAt:(seconds+ttl)*1000}),()=>now);
 const values=await Promise.all(Array.from({length:100},()=>storage.resolve(['images/test'])));
 expect(new Set(values.map(v=>v.assets['images/test']!.url)).size).toBe(1);
 expect(values[0]!.assets['images/test']!.url).toBe('https://bucket.test/release/assets/runtime/test-0123456789abcdef.webp?signed=1800000000');
 expect(storage.stats.signatures).toBe(1);
 expect(values[0]!.assets['images/test']!.expiresAt).toBe(1_800_003_600_000);
 now=1_800_003_599_999;
 expect(await storage.resolve(['images/test'])).toEqual(values[0]);
 expect(storage.stats.signatures).toBe(1);
 now++;
 const refreshed=await Promise.all(Array.from({length:100},()=>storage.resolve(['images/test'])));
 expect(storage.stats.signatures).toBe(2);
 expect(refreshed[0]!.assets['images/test']!.url).not.toBe(values[0]!.assets['images/test']!.url);
});

test('signing failures fall back locally without leaking SDK errors and recover on next request',async()=>{
 let fails=true;
 const events:unknown[]=[];
 const storage=new AssetStorage(remote,manifest,async()=>{if(fails)throw new Error('FAKE_SECRET_KEY https://private.test?signature=secret');return {url:'https://safe.test/file',expiresAt:Date.now()+3600000};},Date.now,e=>events.push(e));
 const fallback=await storage.resolve(['images/test']);
 expect(fallback.assets['images/test']!.source).toBe('local');
 expect(storage.stats.failures).toBe(1);
 expect(JSON.stringify(events)).not.toMatch(/FAKE_SECRET_KEY|signature=secret|private.test/);
 fails=false;
 expect((await storage.resolve(['images/test'])).assets['images/test']!.source).toBe('remote');
 expect(storage.stats.signatures).toBe(2);
});

test('storage configurations isolate cached signatures and only expose provider',async()=>{
 const one=new AssetStorage(remote,manifest,async()=>({url:'https://first.test/file',expiresAt:Date.now()+3600000}));
 const two=new AssetStorage({...remote,bucket:'other-bucket'},manifest,async()=>({url:'https://second.test/file',expiresAt:Date.now()+3600000}));
 expect((await one.resolve(['images/test'])).assets['images/test']!.url).not.toBe((await two.resolve(['images/test'])).assets['images/test']!.url);
 expect(one.publicConfig).toEqual({provider:'s3'});
});

test('configuration defaults local, honors env credentials, and rejects invalid explicit config without secrets',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'chess-storage-config-'));
 const file=path.join(dir,'storage.json');
 try{
  expect(loadAssetStorageConfig({root:dir,env:{}}).provider).toBe('local');
  expect(()=>loadAssetStorageConfig({root:dir,env:{ASSET_STORAGE_CONFIG:'missing.json'}})).toThrow();
  await writeFile(file,JSON.stringify(remote));
  expect(loadAssetStorageConfig({root:dir,env:{ASSET_STORAGE_CONFIG:file,ASSET_ACCESS_KEY_ID:'ENV_ID',ASSET_SECRET_ACCESS_KEY:'ENV_SECRET'}}).accessKeyId).toBe('ENV_ID');
  expect(loadAssetStorageConfig({root:dir,env:{ASSET_STORAGE_CONFIG:file,ASSET_SECRET_ACCESS_KEY:'ENV_SECRET'}}).secretAccessKey).toBe('ENV_SECRET');
  for(const invalid of [null,[],{provider:'wat'},{...remote,provider:['s3']},{...remote,region:''},{...remote,urlTtlSeconds:0},{...remote,urlTtlSeconds:604801},{...remote,endpoint:'https://user:FAKE_SECRET_KEY@bucket.test'},{...remote,endpoint:'https://bucket.test/prefix'},{...remote,prefix:'../secret'}]){
   await writeFile(file,JSON.stringify(invalid));
   let message='';try{loadAssetStorageConfig({root:dir,env:{ASSET_STORAGE_CONFIG:file}});}catch(e){message=String(e);}
   expect(message).not.toBe('');expect(message).not.toContain('FAKE_SECRET_KEY');
  }
 }finally{await rm(dir,{recursive:true,force:true});}
});

for(const provider of ['s3','oss','cos'] as const){
 test(`${provider} official SDK generates GET signatures using fake credentials and native custom endpoint`,async()=>{
  const config={...remote,provider,bucket:provider==='cos'?'test-bucket-1250000000':'test-bucket',region:provider==='s3'?'us-east-1':provider==='oss'?'oss-cn-hangzhou':'ap-guangzhou',endpoint:'https://assets.example.test',forcePathStyle:provider==='s3',cname:provider==='oss'};
  const signer=await createAssetSigner(config);
  const signed=await signer('release/assets/runtime/a b.webp',3600,Math.floor(Date.now()/1000));
  const url=new URL(signed.url);
  expect(url.host).toBe('assets.example.test');expect(url.pathname).toContain('a%20b.webp');
  expect(signed.expiresAt).toBeGreaterThan(Date.now()+3598000);
  expect(signed.expiresAt).toBeLessThan(Date.now()+3602000);
  expect(signed.url).not.toContain('FAKE_SECRET_KEY');
  if(provider==='s3'){expect(url.searchParams.get('X-Amz-Algorithm')).toBe('AWS4-HMAC-SHA256');expect(url.searchParams.get('X-Amz-Expires')).toBe('3600');expect(url.pathname).toBe('/test-bucket/release/assets/runtime/a%20b.webp');}
  if(provider==='oss'){expect(url.searchParams.get('x-oss-signature-version')).toBe('OSS4-HMAC-SHA256');expect(url.searchParams.get('x-oss-expires')).toBe('3600');}
  if(provider==='cos'){expect(url.searchParams.get('q-sign-algorithm')).toBe('sha1');expect(url.searchParams.get('q-header-list')).toContain('host');}
 });
}

test('deployed service reuses signatures across unauthenticated requests and publishes no private configuration',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'chess-assets-remote-'));
 const web=path.join(dir,'dist');
 await mkdir(path.join(web,'assets'),{recursive:true});
 await writeFile(path.join(web,'index.html'),'<!doctype html><title>test</title>');
 await writeFile(path.join(web,'assets/runtime-manifest.json'),JSON.stringify(manifest));
 const configFile=path.join(dir,'private.json');
 await writeFile(configFile,JSON.stringify({...remote,endpoint:'https://s3.example.test',forcePathStyle:true}));
 const previous=process.env.ASSET_STORAGE_CONFIG;
 process.env.ASSET_STORAGE_CONFIG=configFile;
 let app:Awaited<ReturnType<typeof createApp>>|undefined;
 try{
  app=await createApp({staticRoot:web,models:[],authEnabled:false});
  const publicConfig=(await app.inject('/api/config')).json();
  expect(publicConfig.assetStorage).toEqual({provider:'s3'});
  expect(JSON.stringify(publicConfig)).not.toMatch(/FAKE_|test-bucket|s3.example/);
  const values=await Promise.all(Array.from({length:100},()=>app!.inject({method:'POST',url:'/api/assets/resolve',payload:{ids:['images/test']}})));
  expect(values.every(value=>value.statusCode===200)).toBe(true);
  expect(new Set(values.map(value=>value.json().assets['images/test'].url)).size).toBe(1);
  expect(app.assetStorage.stats.signatures).toBe(1);
  expect((await app.inject('/private.json')).statusCode).toBe(404);
  expect((await app.inject('/config/asset-storage.json')).statusCode).toBe(404);
 }finally{
  if(app)await app.close();
  if(previous===undefined)delete process.env.ASSET_STORAGE_CONFIG;else process.env.ASSET_STORAGE_CONFIG=previous;
  await rm(dir,{recursive:true,force:true});
 }
});

test('a private configuration inside the served directory is rejected before startup',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'chess-assets-private-'));
 const file=path.join(dir,'storage.json');
 try{
  await writeFile(file,JSON.stringify(remote));
  expect(()=>loadAssetStorageConfig({root:dir,staticRoot:dir,env:{ASSET_STORAGE_CONFIG:file}})).toThrow(/公开目录/);
 }finally{await rm(dir,{recursive:true,force:true});}
});


test('a public symlink to the private configuration is also rejected',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'chess-assets-link-'));
 const web=path.join(dir,'dist');
 await mkdir(web);
 const file=path.join(dir,'private.json');
 const link=path.join(web,'storage.json');
 try{
  await writeFile(file,JSON.stringify(remote));await symlink(file,link);
  expect(()=>loadAssetStorageConfig({root:dir,staticRoot:web,env:{ASSET_STORAGE_CONFIG:link}})).toThrow(/公开目录/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
