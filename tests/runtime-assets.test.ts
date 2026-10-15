import {test,expect} from 'vitest';
import {mkdtemp,mkdir,copyFile,readFile,writeFile,rm,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {generateAssets} from '../scripts/generate-assets.mjs';
import {authoringState} from '../scripts/runtime-assets.mjs';
import {prepareAssets} from '../scripts/prepare-assets.mjs';
import {spineFingerprint} from '../scripts/spine-preview-manifest.mjs';
import {characterConfig} from '../src/characters/config.ts';
import type {RuntimeAssetManifest} from '../shared/assets.ts';
import {runtimeFixture as fixture} from './helpers/runtime-assets.ts';
const sha=(data:Buffer)=>createHash('sha256').update(data).digest('hex');
async function digest(root:string){const out:Record<string,string>={};for(const file of await readdir(join(root,'assets/runtime'),{recursive:true,withFileTypes:true})){if(file.isFile()){const path=join(file.parentPath,file.name);out[path]=sha(await readFile(path));}}return out;}
test('explicit generation persists hashed art and prepare only verifies and copies it',async()=>{const root=await fixture();try{
 await generateAssets(root);const manifest=JSON.parse(await readFile(join(root,'assets/runtime/manifest.json'),'utf8')) as RuntimeAssetManifest;
 const before=await digest(root);await prepareAssets(root);await prepareAssets(root);expect(await digest(root)).toEqual(before);
 const image=manifest.images['portraits/test.png'];expect(image.width).toBe(300);expect(image.height).toBe(400);
 expect((await sharp(join(root,'assets/runtime/files',manifest.files[image.preview].path)).metadata()).width).toBe(24);
 expect((await sharp(join(root,'assets/runtime/files',manifest.files[image.src].path)).metadata()).hasAlpha).toBe(true);
 for(const asset of Object.values(manifest.files)){expect(asset.path).toMatch(/-[a-f0-9]{16}\./);expect(sha(await readFile(join(root,'.generated/public',asset.path)))).toBe(asset.sha256);}
 expect(manifest.spine.sailor.pages['sailor.webp']).toBe('characters/default/sailor.webp');expect(manifest.files[manifest.models.aircraft].contentType).toBe('model/gltf-binary');
 expect(JSON.parse(await readFile(join(root,'.generated/public/assets/runtime-manifest.json'),'utf8'))).toEqual(manifest);
 await generateAssets(root);expect(await digest(root)).toEqual(before);
 }finally{await rm(root,{recursive:true,force:true});}});
test('prepare rejects stale sources, missing artifacts, corrupt bytes and new ungenerated images',async()=>{const root=await fixture();try{
 await generateAssets(root);const path=join(root,'public/portraits/test.png'),original=await readFile(path);
 await writeFile(path,Buffer.concat([original,Buffer.from('changed')]));await expect(prepareAssets(root)).rejects.toThrow(/assets:generate/);await writeFile(path,original);
 const manifest=JSON.parse(await readFile(join(root,'assets/runtime/manifest.json'),'utf8')) as RuntimeAssetManifest,a=manifest.files[manifest.models.aircraft],asset=join(root,'assets/runtime/files',a.path),bytes=await readFile(asset);
 await writeFile(asset,'bad');await expect(prepareAssets(root)).rejects.toThrow(/assets:generate/);await rm(asset);await expect(prepareAssets(root)).rejects.toThrow(/assets:generate/);await writeFile(asset,bytes);
 await copyFile(path,join(root,'public/portraits/new.png'));await expect(prepareAssets(root)).rejects.toThrow(/assets:generate/);
 }finally{await rm(root,{recursive:true,force:true});}});
test('stale Spine preview asks for explicit export instead of creating runtime thumbnails',async()=>{const root=await fixture();try{
 await generateAssets(root);await writeFile(join(root,'public/characters/default/sailor.webp'),Buffer.concat([await readFile(join(root,'public/characters/default/sailor.webp')),Buffer.from('changed')]));
 await expect(generateAssets(root)).rejects.toThrow(/assets:spine/);await expect(prepareAssets(root)).rejects.toThrow(/assets:spine/);
 }finally{await rm(root,{recursive:true,force:true});}});

test('prepare rejects incomplete sections and missing per-profile or per-image entries',async()=>{const root=await fixture();try{
 const good=await generateAssets(root),file=join(root,'assets/runtime/manifest.json');
 for(const mutate of [(m:Record<string,any>)=>{delete m.models;},(m:Record<string,any>)=>{delete m.images;},(m:Record<string,any>)=>{delete m.spine;},(m:Record<string,any>)=>{delete m.spinePreviews;},(m:Record<string,any>)=>{delete m.models.aircraft;},(m:Record<string,any>)=>{delete m.images['portraits/test.png'];},(m:Record<string,any>)=>{delete m.spine.sailor;},(m:Record<string,any>)=>{delete m.spinePreviews.sailor;},(m:Record<string,any>)=>{m.spine.sailor.pages={};},(m:Record<string,any>)=>{m.images['portraits/test.png'].variants=[];}]){
  const broken=structuredClone(good);mutate(broken);await writeFile(file,JSON.stringify(broken));await expect(prepareAssets(root)).rejects.toThrow(/assets:generate/);
 }
 }finally{await rm(root,{recursive:true,force:true});}});

test('WebP portraits preserve original full bytes and fixtures isolate generated profiles',async()=>{const root=await fixture();try{
 const original=await sharp({create:{width:320,height:480,channels:4,background:'#246a8a'}}).webp({quality:77}).toBuffer();
 await writeFile(join(root,'public/portraits/already.webp'),original);
 const m=await generateAssets(root);
 expect(Object.keys(m.spine)).toEqual(['sailor']);
 const image=m.images['portraits/already.webp'];expect(image).toBeDefined();
 expect(await readFile(join(root,'assets/runtime/files',m.files[image.src].path))).toEqual(original);
 expect(image.variants.map((v:{width:number})=>v.width)).toEqual([128,256,320]);
 }finally{await rm(root,{recursive:true,force:true});}});

test('local generated profiles and identity changes participate in authoring validation',async()=>{const root=await fixture();try{
 const generated={profiles:{second:characterConfig.profiles.sailor},identities:{second:{avatar:'portraits/test.png',portrait:'portraits/test.png',name:'测试'}},catalog:{'dd-1':'second'},templates:{},historical:{}};
 await writeFile(join(root,'src/characters/ships.generated.json'),JSON.stringify(generated));
 const preview=JSON.parse(await readFile(join(root,'public/characters/previews/manifest.json'),'utf8'));preview.profiles.second=preview.profiles.sailor;await writeFile(join(root,'public/characters/previews/manifest.json'),JSON.stringify(preview));
 const m=await generateAssets(root);expect(Object.keys(m.spine).sort()).toEqual(['sailor','second']);expect(m.sources['src/characters/ships.generated.json']).toBeDefined();
 generated.identities.second.name='更新身份';await writeFile(join(root,'src/characters/ships.generated.json'),JSON.stringify(generated));await expect(prepareAssets(root)).rejects.toThrow(/assets:generate/);
 }finally{await rm(root,{recursive:true,force:true});}});

test('portrait WebP is scanned without recompressing Spine preview or atlas WebP',async()=>{const root=await fixture();try{
 const data=await sharp({create:{width:40,height:60,channels:4,background:'#123456'}}).webp().toBuffer();
 await writeFile(join(root,'public/characters/default/atlas.webp'),data);
 await writeFile(join(root,'public/characters/previews/unrelated.webp'),data);
 const m=await generateAssets(root);expect(m.images['characters/default/atlas.webp']).toBeUndefined();expect(m.images['characters/previews/unrelated.webp']).toBeUndefined();
 }finally{await rm(root,{recursive:true,force:true});}});


test('generated identities exclude orphan WebP portraits without deleting authoring files',async()=>{const root=await fixture();try{
 const image=await sharp({create:{width:64,height:96,channels:4,background:'#123456'}}).webp().toBuffer();
 await writeFile(join(root,'public/portraits/orphan.webp'),image);await writeFile(join(root,'public/portraits/used.webp'),image);
 await writeFile(join(root,'src/characters/ships.generated.json'),JSON.stringify({profiles:{},identities:{used:{name:'Used',avatar:'portraits/used.webp',portrait:'portraits/used.webp'}}}));
 const m=await generateAssets(root);expect(m.images['portraits/used.webp']).toBeDefined();expect(m.images['portraits/orphan.webp']).toBeUndefined();
 expect(await readFile(join(root,'public/portraits/orphan.webp'))).toEqual(image);
 }finally{await rm(root,{recursive:true,force:true});}});

test('generated identity catalogs retain the default WebP fallback and baseline profile fingerprint source',async()=>{
 const root=await fixture();try{
  await writeFile(join(root,'src/characters/ships.generated.json'),JSON.stringify({profiles:{},identities:{}}));
  await sharp({create:{width:16,height:16,channels:4,background:{r:10,g:20,b:30,alpha:1}}}).webp().toFile(join(root,'public/portraits/default-ship.webp'));
  const state=await authoringState(root);expect(state.raster).toContain('portraits/default-ship.webp');
  expect(state.sources).toHaveProperty('src/characters/default-profile.ts');
 }finally{await rm(root,{recursive:true,force:true});}
});
