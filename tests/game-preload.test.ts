import {expect,it} from 'vitest';
import {AssetClient} from '../src/assets/client.ts';
import {preloadRuntimeAssets,type PreloadProgress} from '../src/assets/preload.ts';
import type {RuntimeAssetManifest} from '../shared/assets.ts';
const sha256='2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';
const manifest:RuntimeAssetManifest={version:1,files:Object.fromEntries(['portrait','spine','model','voice','bgm','effect','video'].map(id=>[id,{path:`assets/${id}`,sha256,bytes:5,contentType:'text/plain'}])),images:{},spine:{},spinePreviews:{},models:{aircraft:'model',mine:'model',torpedo:'model'},sources:{},spineFingerprints:{}};

it('covers the whole published manifest with bounded transfers and reports complete verified bytes',async()=>{
 let active=0,peak=0;const requested:string[]=[],progress:PreloadProgress[]=[];
 const client=new AssetClient(manifest,{fetchImpl:async input=>{
  if(input==='/api/config')return new Response('{}');
  requested.push(String(input));active++;peak=Math.max(active,peak);
  await new Promise(done=>setTimeout(done,1));active--;return new Response('hello');
 }});
 await preloadRuntimeAssets(client,value=>progress.push({...value}),2);
 expect(requested.sort()).toEqual(['/assets/bgm','/assets/effect','/assets/model','/assets/portrait','/assets/spine','/assets/video','/assets/voice']);
 expect(peak).toBe(2);
 expect(progress[0]).toEqual({loaded:0,total:7,loadedBytes:0,totalBytes:35,failed:0});
 expect(progress.at(-1)).toEqual({loaded:7,total:7,loadedBytes:35,totalBytes:35,failed:0});
});

it('does not allow partial readiness, drains in-flight work, and reuses completed bodies on retry',async()=>{
 let offline=true;const requested:string[]=[],progress:PreloadProgress[]=[];
 const client=new AssetClient(manifest,{fetchImpl:async input=>{
  if(input==='/api/config')return new Response('{}');
  requested.push(String(input));return new Response('hello',{status:offline&&input==='/assets/voice'?503:200});
 }});
 await expect(preloadRuntimeAssets(client,value=>progress.push({...value}),2)).rejects.toThrow();
 expect(progress.at(-1)).toEqual({loaded:6,total:7,loadedBytes:30,totalBytes:35,failed:1});
 offline=false;await preloadRuntimeAssets(client,value=>progress.push({...value}),2);
 expect(requested.slice(7)).toEqual(['/assets/voice']);
 expect(progress.at(-1)).toEqual({loaded:7,total:7,loadedBytes:35,totalBytes:35,failed:0});
});
