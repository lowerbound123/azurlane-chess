import {describe,it,expect,vi} from 'vitest';
import {AssetClient} from '../src/assets/client.ts';
import type {RuntimeAssetManifest} from '../shared/assets.ts';
const manifest:RuntimeAssetManifest={version:1,files:{a:{path:'assets/runtime/a-123.webp',sha256:'1',bytes:1,contentType:'image/webp'},b:{path:'assets/runtime/b-456.webp',sha256:'2',bytes:1,contentType:'image/webp'}},images:{},spine:{},spinePreviews:{},models:{aircraft:'a',mine:'b',torpedo:'b'},sources:{},spineFingerprints:{}};
const json=(value:unknown)=>new Response(JSON.stringify(value));
describe('shared asset client',()=>{
 it('uses manifest paths under the deployment base when config is old or unavailable',async()=>{
  for(const response of [()=>json({}),()=>Promise.reject(new Error('offline'))]){
   const fetchImpl=vi.fn(async()=>response());const client=new AssetClient(manifest,{baseUrl:'/game/',fetchImpl});
   expect((await client.resolve(['a'])).a).toEqual({url:'/game/assets/runtime/a-123.webp',expiresAt:null,source:'local'});
   await client.resolve(['b']);expect(fetchImpl).toHaveBeenCalledTimes(1);
   await expect(client.resolve(['unknown'])).rejects.toThrow('未知资源');
  }
 });
 it('coalesces concurrent ids, shares config, reuses signatures until their exact expiry',async()=>{
  let now=1000;const batches:string[][]=[];
  const fetchImpl=vi.fn(async(url:string|URL|Request,init?:RequestInit)=>{
   if(url==='/api/config')return json({assetStorage:{provider:'s3'}});
   const {ids}=JSON.parse(String(init?.body));batches.push(ids);
   return json({assets:Object.fromEntries(ids.map((id:string)=>[id,{url:`https://bucket/${id}?time=${now}`,expiresAt:now+1000,source:'remote'}]))});
  });
  const client=new AssetClient(manifest,{fetchImpl,now:()=>now});
  const result=await Promise.all(Array.from({length:100},(_,i)=>client.resolve(i%2?['a']:['a','b'])));
  expect(result[0].a.url).toBe('https://bucket/a?time=1000');expect(batches).toEqual([['a','b']]);
  now=1999;await client.resolve(['a']);expect(batches).toHaveLength(1);
  now=2000;expect((await client.resolve(['a'])).a.url).toBe('https://bucket/a?time=2000');expect(batches).toHaveLength(2);
  expect(fetchImpl.mock.calls.filter(([url])=>url==='/api/config')).toHaveLength(1);
 });
 it('bounds config waits and defaults to local even when fetch ignores abort',async()=>{
  vi.useFakeTimers();try{const client=new AssetClient(manifest,{fetchImpl:()=>new Promise(()=>{}),timeoutMs:20});
   const pending=client.resolve(['a']);await vi.advanceTimersByTimeAsync(21);expect((await pending).a.source).toBe('local');
  }finally{vi.useRealTimers();}
 });
 it('re-resolves failed remote downloads once, then loads the entire group locally when URLs do not change',async()=>{
  let resolves=0;const loaded:string[][]=[];
  const client=new AssetClient(manifest,{baseUrl:'/game/',fetchImpl:async(url)=>url==='/api/config'?json({assetStorage:{provider:'oss'}}):(resolves++,json({assets:{a:{url:'https://bucket/a',expiresAt:9000,source:'remote'},b:{url:'https://bucket/b',expiresAt:9000,source:'remote'}}})),now:()=>1000});
  const result=await client.load(['a','b'],async urls=>{loaded.push(Object.values(urls));if(urls.a.startsWith('https:'))throw new Error('403');return 'ready';});
  expect(result).toBe('ready');expect(resolves).toBe(2);expect(loaded).toEqual([['https://bucket/a','https://bucket/b'],['/game/assets/runtime/a-123.webp','/game/assets/runtime/b-456.webp']]);
 });
 it('tries a changed signature once and falls back after a second download failure',async()=>{
  let resolves=0;const loaded:string[]=[];
  const client=new AssetClient(manifest,{fetchImpl:async url=>url==='/api/config'?json({assetStorage:{provider:'cos'}}):json({assets:{a:{url:`https://bucket/a?${++resolves}`,expiresAt:9000,source:'remote'}}}),now:()=>1000});
  await client.load(['a'],async urls=>{loaded.push(urls.a);if(urls.a.startsWith('https:'))throw new Error('404');});
  expect(loaded).toEqual(['https://bucket/a?1','https://bucket/a?2','/assets/runtime/a-123.webp']);expect(resolves).toBe(2);
 });
 it('retries a failed resolve on the next request and never trusts a server local path',async()=>{
  let resolves=0;const client=new AssetClient(manifest,{fetchImpl:async url=>{if(url==='/api/config')return json({assetStorage:{provider:'s3'}});if(++resolves===1)throw new Error('network');return json({assets:{a:{url:'/wrong-release.webp',source:'local',expiresAt:null}}});}});
  expect((await client.resolve(['a'])).a.url).toBe('/assets/runtime/a-123.webp');expect((await client.resolve(['a'])).a.url).toBe('/assets/runtime/a-123.webp');expect(resolves).toBe(2);
 });
});
it('rejects prototype property names rather than treating them as manifest records',async()=>{
 const client=new AssetClient(manifest,{fetchImpl:async()=>json({})});
 for(const id of ['__proto__','constructor','toString'])expect(()=>client.local(id)).toThrow('未知资源');
});
it('loads a partially signed group entirely locally and emits only one sanitized diagnostic',async()=>{
 const warning=vi.spyOn(console,'warn').mockImplementation(()=>{}),loaded:string[][]=[];
 const client=new AssetClient(manifest,{fetchImpl:async url=>url==='/api/config'?json({assetStorage:{provider:'s3'}}):json({assets:{a:{url:'https://bucket/a?SECRET',expiresAt:9000,source:'remote'},b:{url:'/b',expiresAt:null,source:'local'}}}),now:()=>1000});
 try{
  for(let i=0;i<2;i++)await client.load(['a','b'],async urls=>{loaded.push(Object.values(urls));});
  expect(loaded).toEqual([['/assets/runtime/a-123.webp','/assets/runtime/b-456.webp'],['/assets/runtime/a-123.webp','/assets/runtime/b-456.webp']]);
  expect(warning).toHaveBeenCalledTimes(1);expect(JSON.stringify(warning.mock.calls)).not.toContain('SECRET');expect(JSON.stringify(warning.mock.calls)).toContain('a, b');
 }finally{warning.mockRestore();}
});
it('splits a large manifest request into permitted batches without losing any resolutions',async()=>{
 const ids=Array.from({length:257},(_,i)=>`image-${i}`),batches:number[]=[];
 const many={...manifest,files:Object.fromEntries(ids.map(id=>[id,{path:`assets/runtime/${id}.webp`,sha256:'abc',bytes:1,contentType:'image/webp'}]))};
 const client=new AssetClient(many,{fetchImpl:async(url,init)=>{if(url==='/api/config')return json({assetStorage:{provider:'s3'}});const batch=JSON.parse(String(init?.body)).ids as string[];batches.push(batch.length);return json({assets:Object.fromEntries(batch.map(id=>[id,{url:`https://bucket/${id}`,expiresAt:Date.now()+60000,source:'remote'}]))});}});
 const result=await client.resolve(ids);expect(batches).toEqual([128,128,1]);expect(Object.keys(result)).toHaveLength(257);expect(result['image-256'].url).toBe('https://bucket/image-256');
});
