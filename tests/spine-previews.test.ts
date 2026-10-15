// @vitest-environment happy-dom
import {test,vi,beforeAll,afterAll} from 'vitest';
vi.mock('../src/characters/ships.generated.json',()=>({default:{profiles:{},catalog:{},historical:{},templates:{},identities:{}}}));
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseSkeleton} from '../src/vendor/parse.mjs';
import renderer from '../src/vendor/spine38/renderer.mjs';
import core from '../src/vendor/spine38/core.mjs';
import {SpinePreviews} from '../src/characters/previews.ts';
import {characterConfig,type CharacterProfile} from '../src/characters/config.ts';
import type {CharacterAsset} from '../src/characters/spine.ts';
// MeshBatcher reads standard GL constants even though geometry creation uses Three only.
beforeAll(()=>vi.stubGlobal('WebGLRenderingContext',{DYNAMIC_DRAW:0x88E8,STATIC_DRAW:0x88E4}));
afterAll(()=>vi.unstubAllGlobals());

function asset():CharacterAsset {
 const data=parseSkeleton(fs.readFileSync('public/characters/default/sailor.json'),fs.readFileSync('public/characters/default/sailor.atlas','utf8'),undefined,'json').data;
 class SkeletonMesh extends renderer.SkeletonMesh {constructor(options:any){super(options.skeletonData);this.skeleton.getBoundsRect=()=>{const offset=new core.Vector2(),size=new core.Vector2();this.skeleton.getBounds(offset,size,[]);return{x:offset.x,y:offset.y,width:size.x,height:size.y};};}}
 return {spine:{SkeletonMesh:SkeletonMesh as any},manager:{dispose(){}},data};
}
test('shared profile generates one complete Spine WebP, frees GPU and revokes URLs on exit',async()=>{
  const data=asset(),requests:CharacterProfile[]=[],create=vi.spyOn(URL,'createObjectURL').mockReturnValue('blob:spine-test'),revoke=vi.spyOn(URL,'revokeObjectURL').mockImplementation(()=>{});
  const canvas=document.createElement('canvas');canvas.toBlob=done=>done(new Blob(['spine'],{type:'image/webp'}));
  const render=vi.fn(),dispose=vi.fn(),loss=vi.fn(),close=vi.fn(),factory=vi.fn(()=>({domElement:canvas,setSize:vi.fn(),setClearColor:vi.fn(),render,dispose,forceContextLoss:loss}));
  const library=new SpinePreviews({load:async profile=>{requests.push(profile);return data;},dispose:close},factory);
  try {
    const urls=await Promise.all(['dd','cl','ca','bb','cv'].map(template=>library.load(template)));
    assert.deepEqual(urls,Array(5).fill('blob:spine-test'));assert.equal(requests.length,1);assert.equal(factory.mock.calls.length,1);assert.equal(render.mock.calls.length,1);assert.equal(create.mock.calls.length,1);
    const camera=render.mock.calls[0][1] as import('three').OrthographicCamera;
    assert.ok(camera.top>0&&camera.right>0);
    library.releaseGPU();assert.equal(dispose.mock.calls.length,1);assert.equal(loss.mock.calls.length,1);
    library.dispose();assert.equal(revoke.mock.calls.length,1);assert.equal(dispose.mock.calls.length,1);
    assert.equal(await library.load('dd'),null);
  }finally{library.dispose();create.mockRestore();revoke.mockRestore();}
});
test('distinct mapped Spine profiles receive distinct snapshots, not a reused default image',async()=>{
  const data=asset(),create=vi.spyOn(URL,'createObjectURL').mockReturnValueOnce('blob:default').mockReturnValueOnce('blob:custom'),revoke=vi.spyOn(URL,'revokeObjectURL').mockImplementation(()=>{});
  const custom={...characterConfig.profiles.sailor,skin:'default'};characterConfig.profiles.testPreview=custom;characterConfig.templates.cv='testPreview';
  const requests:CharacterProfile[]=[],canvas=document.createElement('canvas');canvas.toBlob=done=>done(new Blob(['spine']));
  const library=new SpinePreviews({load:async p=>{requests.push(p);return data;},dispose:()=>{}},()=>({domElement:canvas,setSize:()=>{},setClearColor:()=>{},render:()=>{},dispose:()=>{},forceContextLoss:()=>{}}));
  try {
    assert.deepEqual(await Promise.all([library.load('dd'),library.load('cv')]),['blob:default','blob:custom']);
    assert.deepEqual(requests,[characterConfig.profiles.sailor,custom]);
  }finally{library.dispose();delete characterConfig.templates.cv;delete characterConfig.profiles.testPreview;create.mockRestore();revoke.mockRestore();}
});
test('a late Spine asset does not create a renderer or object URL after leaving the page',async()=>{
  let complete!:(value:CharacterAsset)=>void;const pending=new Promise<CharacterAsset>(resolve=>{complete=resolve;});
  const factory=vi.fn(),create=vi.spyOn(URL,'createObjectURL');
  const library=new SpinePreviews({load:()=>pending,dispose:()=>{}},factory);
  try {
    const image=library.load('dd');await Promise.resolve();library.dispose();complete(asset());
    assert.equal(await image,null);assert.equal(factory.mock.calls.length,0);assert.equal(create.mock.calls.length,0);
  }finally{library.dispose();create.mockRestore();}
});

test('explicit exporter supports configured profiles that no ship template currently uses',async()=>{
 const profile={...characterConfig.profiles.sailor},data=asset(),requests:CharacterProfile[]=[];
 const canvas=document.createElement('canvas');canvas.toBlob=done=>done(new Blob(['fixed-profile']));
 const create=vi.spyOn(URL,'createObjectURL').mockReturnValue('blob:export-only'),revoke=vi.spyOn(URL,'revokeObjectURL').mockImplementation(()=>{});
 const library=new SpinePreviews({load:async p=>{requests.push(p);return data;},dispose:()=>{}},()=>({domElement:canvas,setSize:()=>{},setClearColor:()=>{},render:()=>{},dispose:()=>{},forceContextLoss:()=>{}}));
 try{assert.equal(await library.loadProfile(profile),'blob:export-only');assert.deepEqual(requests,[profile]);}
 finally{library.dispose();create.mockRestore();revoke.mockRestore();}
});
