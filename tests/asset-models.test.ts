import {test,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {AssetClient} from '../src/assets/client.ts';
import type {RuntimeAssetManifest} from '../shared/assets.ts';
const state=vi.hoisted(()=>({client:null as unknown as AssetClient,manifest:null as unknown as RuntimeAssetManifest}));
vi.mock('../src/assets/runtime.ts',()=>({get assetClient(){return state.client;},get runtimeAssets(){return state.manifest;}}));
test.each(['http-error','invalid-glb','wrong-model'] as const)('models recover from %s and cache only usable bytes across scene visits',async failure=>{
 vi.resetModules();
 const {TacticalModels}=await import('../src/scene/tactical-models.ts');
 state.manifest={version:1,files:{torpedo:{path:'assets/runtime/torpedo-abc.glb',sha256:'abc',bytes:1,contentType:'model/gltf-binary'},aircraft:{path:'assets/runtime/aircraft-abc.glb',sha256:'abc',bytes:1,contentType:'model/gltf-binary'},mine:{path:'assets/runtime/mine-def.glb',sha256:'def',bytes:1,contentType:'model/gltf-binary'}},models:{aircraft:'aircraft',mine:'mine',torpedo:'torpedo'},images:{},spine:{},spinePreviews:{},sources:{},spineFingerprints:{}};
 state.client=new AssetClient(state.manifest,{baseUrl:'/game/',fetchImpl:async(url,init)=>{if(url==='/api/config')return new Response(JSON.stringify({assetStorage:{provider:'s3'}}));const {ids}=JSON.parse(String(init?.body));return new Response(JSON.stringify({assets:Object.fromEntries(ids.map((id:string)=>[id,{url:`https://bucket/${id}?signed=yes`,expiresAt:Date.now()+60000,source:'remote'}]))}));}});
 const requests:string[]=[];vi.stubGlobal('fetch',async(url:string)=>{requests.push(url);if(url.startsWith('https:')&&url.includes('aircraft'))return failure==='http-error'?new Response('',{status:403}):failure==='wrong-model'?new Response(readFileSync('assets/models/naval-mine.glb')):new Response('HTTP 200 but invalid GLB bytes',{status:200});return new Response(readFileSync(url.includes('aircraft')?'assets/models/aircraft.glb':url.includes('torpedo')?'assets/models/torpedoes/mk14.glb':'assets/models/naval-mine.glb'));});
 try{
  const first=await TacticalModels.load();const firstAircraft=first.create('aircraft');first.dispose();
  const second=await TacticalModels.load();const secondAircraft=second.create('aircraft');
  expect(firstAircraft.getObjectByName('Propeller')).toBeDefined();expect(secondAircraft.getObjectByName('Propeller')).toBeDefined();
  const firstMesh=firstAircraft.getObjectByProperty('type','Mesh') as import('three').Mesh,secondMesh=secondAircraft.getObjectByProperty('type','Mesh') as import('three').Mesh;
  expect(firstMesh.geometry).not.toBe(secondMesh.geometry);expect(firstMesh.material).not.toBe(secondMesh.material);
  const {disposeTree}=await import('../src/scene/resources.ts');disposeTree(firstAircraft);disposeTree(secondAircraft);second.dispose();
  expect(requests.sort()).toEqual(['/game/assets/runtime/aircraft-abc.glb','https://bucket/aircraft?signed=yes','https://bucket/mine?signed=yes','https://bucket/torpedo?signed=yes']);
 }finally{vi.unstubAllGlobals();}
});
