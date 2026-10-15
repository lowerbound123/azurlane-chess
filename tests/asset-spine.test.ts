// @vitest-environment happy-dom
import {test,expect,vi,afterEach} from 'vitest';
import {readFileSync} from 'node:fs';
import {AssetClient} from '../src/assets/client.ts';
import type {RuntimeAssetManifest} from '../shared/assets.ts';
const state=vi.hoisted(()=>({client:null as unknown as AssetClient,manifest:null as unknown as RuntimeAssetManifest}));
vi.mock('../src/assets/runtime.ts',()=>({get assetClient(){return state.client;},get runtimeAssets(){return state.manifest;}}));
import {CharacterLibrary} from '../src/characters/spine.ts';
import {characterConfig} from '../src/characters/config.ts';
const atlas=readFileSync('public/characters/default/sailor.atlas','utf8'),skeleton=readFileSync('public/characters/default/sailor.json','utf8');
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();});
function setup(failRemote:boolean){
 state.manifest={version:1,files:{skeleton:{path:'assets/runtime/skeleton-abc.json',sha256:'abc',bytes:1,contentType:'application/json'},atlas:{path:'assets/runtime/atlas-def.atlas',sha256:'def',bytes:1,contentType:'text/plain'},page:{path:'assets/runtime/page-ghi.webp',sha256:'ghi',bytes:1,contentType:'image/webp'}},spine:{sailor:{skeleton:'skeleton',atlas:'atlas',pages:{'sailor.webp':'page'}}},spinePreviews:{},images:{},models:{aircraft:'',mine:'',torpedo:''},sources:{},spineFingerprints:{}};
 let resolves=0;const requests:string[]=[];
 state.client=new AssetClient(state.manifest,{baseUrl:'/game/',fetchImpl:async(url,init)=>{if(url==='/api/config')return new Response(JSON.stringify({assetStorage:{provider:'s3'}}));resolves++;const {ids}=JSON.parse(String(init?.body));return new Response(JSON.stringify({assets:Object.fromEntries(ids.map((id:string)=>[id,{url:`https://bucket/${id}?signed=${id}`,expiresAt:Date.now()+60000,source:'remote'}]))}));}});
 vi.stubGlobal('fetch',async(url:string)=>{requests.push(url);if(failRemote&&url.startsWith('https:')&&url.includes('page'))throw new Error('page unavailable');return new Response(url.includes('atlas')?atlas:url.includes('skeleton')||url.endsWith('.json')?skeleton:new Uint8Array([1]));});
 class Image {width=256;height=256;onload=()=>{};set src(_url:string){queueMicrotask(()=>this.onload());}}
 vi.stubGlobal('Image',Image);vi.spyOn(URL,'createObjectURL').mockReturnValue('blob:page');vi.spyOn(URL,'revokeObjectURL').mockImplementation(()=>{});

 return {requests,resolves:()=>resolves};
}
test('Spine signs skeleton, atlas and original page names independently and disposes scene textures',async()=>{
 const io=setup(false),library=new CharacterLibrary();
 const asset=await library.load(characterConfig.profiles.sailor);
 expect(io.requests.sort()).toEqual(['https://bucket/atlas?signed=atlas','https://bucket/page?signed=page','https://bucket/skeleton?signed=skeleton']);
 expect(asset.data.version).toMatch(/^3\.8/);let disposals=0;
 const mesh=new asset.spine.SkeletonMesh({skeletonData:asset.data});mesh.update(0);const textures=new Set<any>();mesh.traverse((o:any)=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m?.uniforms?.map?.value)textures.add(m.uniforms.map.value);});expect(textures.size).toBe(1);for(const texture of textures)texture.addEventListener('dispose',()=>disposals++);
 library.dispose();await Promise.resolve();expect(disposals).toBe(1);
});
test('a failed signed page reloads the complete Spine group from same-release local paths',async()=>{
 const io=setup(true),library=new CharacterLibrary();try{
  const asset=await library.load(characterConfig.profiles.sailor);expect(asset.data.version).toMatch(/^3\.8/);
  expect(io.requests).toEqual(expect.arrayContaining(['/game/assets/runtime/skeleton-abc.json','/game/assets/runtime/atlas-def.atlas','/game/assets/runtime/page-ghi.webp']));
  expect(io.requests.filter(url=>url.startsWith('https:'))).toHaveLength(3);expect(io.resolves()).toBe(2);
 }finally{library.dispose();}
});
test('explicit authoring mode loads original atlas-relative pages without resolving runtime assets',async()=>{
 const io=setup(false);state.manifest.spine={};
 const library=new CharacterLibrary({source:true});try{
  const asset=await library.load(characterConfig.profiles.sailor);expect(asset.data.version).toMatch(/^3\.8/);
  expect(io.requests.map(url=>new URL(url,location.href).pathname).sort()).toEqual(['/public/characters/default/sailor.atlas','/public/characters/default/sailor.json','/public/characters/default/sailor.webp']);expect(io.resolves()).toBe(0);
 }finally{library.dispose();}
});
test('one library caches a shared profile and disposal blocks a later scene request',async()=>{
 const io=setup(false),library=new CharacterLibrary(),profile=characterConfig.profiles.sailor;
 const first=library.load(profile),second=library.load(profile);expect(second).toBe(first);
 const asset=await first;expect(io.requests).toHaveLength(3);library.dispose();
 await expect(library.load(profile)).rejects.toThrow(/disposed/);
 asset.manager.dispose();
});
