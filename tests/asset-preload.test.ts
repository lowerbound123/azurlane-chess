import {afterEach,expect,it,vi} from 'vitest';
import {AssetClient} from '../src/assets/client.ts';
import type {RuntimeAssetManifest} from '../shared/assets.ts';
const hello='hello',sha256='2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';
const manifest:RuntimeAssetManifest={version:1,files:Object.fromEntries(['image','spine','audio'].map(id=>[id,{path:`assets/${id}`,sha256,bytes:5,contentType:'text/plain'}])),images:{},spine:{},spinePreviews:{},models:{aircraft:'image',mine:'spine',torpedo:'audio'},sources:{},spineFingerprints:{}};
const json=(data:unknown)=>new Response(JSON.stringify(data));
afterEach(()=>{vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});

it('retains complete verified bodies for DOM and fetch consumers without another network request',async()=>{
 const requested:string[]=[];
 const client=new AssetClient(manifest,{fetchImpl:async input=>{requested.push(String(input));return input==='/api/config'?json({}):new Response(hello);}});
 await Promise.all([client.preload('image'),client.preload('image'),client.preload('spine')]);
 const resolved=await client.resolve(['image','spine']);
 expect(resolved.image.url).toMatch(/^blob:/);
 expect(await fetch(resolved.image.url).then(r=>r.text())).toBe('hello');
 expect(await client.load(['spine'],urls=>fetch(urls.spine).then(r=>r.text()))).toBe('hello');
 expect(client.local('image').url).toBe(resolved.image.url);
 expect((await client.retry(['image'],resolved)).image.url).toBe(resolved.image.url);
 expect(requested).toEqual(['/api/config','/assets/image','/assets/spine']);
});

it('rejects truncated or same-size corrupt resources and allows retry without losing completed files',async()=>{
 let bad='shortened';const bodies:string[]=[];
 const client=new AssetClient(manifest,{fetchImpl:async input=>{if(input==='/api/config')return json({});bodies.push(String(input));return new Response(input==='/assets/audio'?bad:hello);}});
 await client.preload('image');
 await expect(client.preload('audio')).rejects.toThrow();
 expect((await client.resolve(['audio'])).audio.url).toBe('/assets/audio');
 bad='wrong';await expect(client.preload('audio')).rejects.toThrow();
 bad=hello;await Promise.all([client.preload('audio'),client.preload('image')]);
 expect(await fetch((await client.resolve(['audio'])).audio.url).then(r=>r.text())).toBe('hello');
 expect(bodies).toEqual(['/assets/image','/assets/audio','/assets/audio','/assets/audio']);
});

it('verifies remote bodies before accepting them and preserves same-release local fallback',async()=>{
 vi.spyOn(console,'warn').mockImplementation(()=>{});const bodies:string[]=[];let signature=0;
 const client=new AssetClient(manifest,{fetchImpl:async(input)=>{
  if(input==='/api/config')return json({assetStorage:{provider:'s3'}});
  if(input==='/api/assets/resolve')return json({assets:{audio:{source:'remote',url:`https://bucket/audio?sig=${++signature}`,expiresAt:Date.now()+60000}}});
  bodies.push(String(input));return new Response(String(input).startsWith('https:')?'wrong':hello);
 }});
 await client.preload('audio');
 expect(bodies).toEqual(['https://bucket/audio?sig=1','https://bucket/audio?sig=2','/assets/audio']);
 expect(await fetch((await client.resolve(['audio'])).audio.url).then(r=>r.text())).toBe('hello');
});

it('bounds a stalled full-body transfer even when the transport ignores abort',async()=>{
 vi.useFakeTimers();
 const client=new AssetClient(manifest,{preloadTimeoutMs:20,fetchImpl:async input=>input==='/api/config'?json({}):new Response(new ReadableStream({start(){}}))});
 const outcome=client.preload('audio').catch(error=>error);
 await vi.advanceTimersByTimeAsync(21);
 expect(await outcome).toBeInstanceOf(Error);
 expect((await client.resolve(['audio'])).audio.url).toBe('/assets/audio');
});

it('bypasses a corrupt HTTP cache entry on retry so a repaired resource can recover',async()=>{
 let attempt=0;
 const client=new AssetClient(manifest,{fetchImpl:async(input,init)=>{
  if(input==='/api/config')return json({});
  attempt++;return new Response(attempt>1&&init?.cache==='reload'?hello:'wrong');
 }});
 await expect(client.preload('audio')).rejects.toThrow();
 await client.preload('audio');
 expect(await fetch((await client.resolve(['audio'])).audio.url).then(r=>r.text())).toBe('hello');
});

it('also prepares complete assets on LAN HTTP where SubtleCrypto is unavailable',async()=>{
 vi.stubGlobal('crypto',{subtle:undefined});let body='bad';
 const client=new AssetClient(manifest,{fetchImpl:async input=>input==='/api/config'?json({}):new Response(body)});
 await expect(client.preload('audio')).rejects.toThrow();
 body=hello;await client.preload('audio');
 expect(await fetch((await client.resolve(['audio'])).audio.url).then(r=>r.text())).toBe('hello');
});
