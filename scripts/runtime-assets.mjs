import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {parseAtlas} from '../src/vendor/parse.mjs';
import {DEFAULT_CHARACTER_PROFILE} from '../src/characters/default-profile.ts';
import {spineFingerprint} from './spine-preview-manifest.mjs';
import {audioSourceState,validateRuntimeAudio} from './battle-audio-assets.mjs';
export const digest=data=>createHash('sha256').update(data).digest('hex');
export const safePath=name=>typeof name==='string'&&name.length>0&&!name.includes('\\')&&!name.startsWith('/')&&!name.split('/').some(s=>s==='..'||s==='.'||s==='')&&!/[\u0000-\u001f]/.test(name);
export async function walk(dir){const result=[];for(const entry of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const file=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await walk(file));else if(entry.isFile())result.push(file);}return result;}
/** Authoring roots (including temporary fixtures) own their generated ship catalog. */
export async function loadAuthoringProfiles(root){
 let generated;
 try{generated=JSON.parse(await readFile(path.join(root,'src/characters/ships.generated.json'),'utf8'));}
 catch(error){if(error.code!=='ENOENT')throw error;}
 const sailor=DEFAULT_CHARACTER_PROFILE;
 return {profiles:{sailor,...generated?.profiles},generated};
}
export async function authoringState(root){
 const {profiles,generated}=await loadAuthoringProfiles(root);
 const identityImages=new Set(Object.values(generated?.identities??{}).flatMap(i=>[i.avatar,i.portrait]));
 const raster=(await walk(path.join(root,'public'))).map(p=>path.relative(path.join(root,'public'),p).split(path.sep).join('/')).filter(p=>/\.(png|jpe?g)$/i.test(p)||(/\.webp$/i.test(p)&&(generated?(p==='portraits/default-ship.webp'||identityImages.has(p)):p.startsWith('portraits/'))));
 const sources=new Set(['src/characters/default-profile.ts','src/characters/config.ts','src/characters/previews.ts','public/characters/previews/manifest.json','assets/models/aircraft.glb','assets/models/naval-mine.glb','assets/models/torpedoes/mk14.glb',...raster.map(p=>'public/'+p)]);
 if(generated)sources.add('src/characters/ships.generated.json');
 const audio=await audioSourceState(root);for(const source of audio?.sources??[])sources.add(source);
 const previews=JSON.parse(await readFile(path.join(root,'public/characters/previews/manifest.json'),'utf8')),spine={},fingerprints={};
 for(const [id,profile]of Object.entries(profiles)){
  const fingerprint=await spineFingerprint(root,profile),preview=previews.profiles?.[id];
  if(!preview||preview.fingerprint!==fingerprint)throw new Error(`Spine 缩略图 ${id} 缺失或过期，请执行 npm run assets:spine`);
  if(!safePath(preview.image))throw new Error('Invalid Spine thumbnail path');
  const atlas=await readFile(path.join(root,'public',profile.atlas),'utf8'),pages={};
  for(const page of parseAtlas(atlas).pages){const relative=path.posix.normalize(path.posix.join(path.posix.dirname(profile.atlas),page.name));if(!safePath(relative))throw new Error('Invalid Spine texture path');pages[page.name]=relative;sources.add('public/'+relative);}
  sources.add('public/'+profile.skeleton);sources.add('public/'+profile.atlas);sources.add('public/'+preview.image);spine[id]={profile,pages,preview:preview.image};fingerprints[id]=fingerprint;
 }
 const hashes={};for(const file of [...sources].sort())hashes[file]=digest(await readFile(path.join(root,file)));
 return {raster,sources:hashes,spine,fingerprints,audio};
}
export async function validateRuntime(root,options={}){
 const regenerate='请执行 npm run assets:generate（Spine 素材变更先执行 npm run assets:spine）';
 let manifest;try{manifest=JSON.parse(await readFile(path.join(root,'assets/runtime/manifest.json'),'utf8'));}catch{throw new Error(`固定美术清单缺失或损坏，${regenerate}`);}
 const current=await authoringState(root);
 if(manifest.version!==1||JSON.stringify(manifest.sources)!==JSON.stringify(current.sources)||JSON.stringify(manifest.spineFingerprints)!==JSON.stringify(current.fingerprints))throw new Error(`固定美术素材已过期，${regenerate}`);
 const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
 const bad=()=>{throw new Error(`固定美术清单结构或依赖不完整，${regenerate}`);};
 for(const section of ['files','images','spine','spinePreviews','models'])if(!object(manifest[section]))bad();
 if(!Object.keys(manifest.files).length)bad();
 const has=id=>typeof id==='string'&&Object.hasOwn(manifest.files,id);
 if(manifest.models.torpedo!=='models/torpedo'||!has(manifest.models.torpedo)||manifest.models.aircraft!=='models/aircraft'||manifest.models.mine!=='models/mine'||!has(manifest.models.aircraft)||!has(manifest.models.mine)||!has('placeholder/ship'))bad();
 const sameKeys=(a,b)=>JSON.stringify(Object.keys(a).sort())===JSON.stringify(Object.keys(b).sort());
 if(!sameKeys(manifest.images,Object.fromEntries(current.raster.map(p=>[p,true])))||!sameKeys(manifest.spine,current.spine)||!sameKeys(manifest.spinePreviews,current.spine))bad();
 for(const [id,expected]of Object.entries(current.spine)){
  const entry=manifest.spine[id];if(!object(entry)||entry.skeleton!==expected.profile.skeleton||entry.atlas!==expected.profile.atlas||!object(entry.pages)||!sameKeys(entry.pages,expected.pages)||Object.entries(expected.pages).some(([name,asset])=>entry.pages[name]!==asset)||!has(manifest.spinePreviews[id]))bad();
 }
 for(const image of Object.values(manifest.images)){
  if(!object(image)||!Number.isInteger(image.width)||image.width<1||!Number.isInteger(image.height)||image.height<1||!has(image.src)||!has(image.preview)||!Array.isArray(image.variants)||!image.variants.length)bad();
  if(!image.variants.some(v=>v.src===image.src)||image.variants.some(v=>!object(v)||!has(v.src)||!Number.isInteger(v.width)||v.width<1||!Number.isInteger(v.height)||v.height<1||v.bytes!==manifest.files[v.src].bytes))bad();
 }

 for(const [id,asset]of Object.entries(manifest.files)){
  if(options.abilityDemos===false&&id.startsWith('ability-demo/'))continue;
  if(!safePath(asset.path)||!asset.path.startsWith('assets/runtime/'))throw new Error(`非法发布资源路径，${regenerate}`);
  let data;try{data=await readFile(path.join(root,'assets/runtime/files',asset.path));}catch{throw new Error(`固定美术文件缺失：${asset.path}，${regenerate}`);}
  if(digest(data)!==asset.sha256||data.length!==asset.bytes)throw new Error(`固定美术文件校验失败：${asset.path}，${regenerate}`);
 }
 const required=[...Object.values(manifest.models??{}),...Object.values(manifest.spinePreviews??{}),...Object.values(manifest.images??{}).flatMap(i=>[i.src,i.preview,...i.variants.map(v=>v.src)]),...Object.values(manifest.spine??{}).flatMap(s=>[s.skeleton,s.atlas,...Object.values(s.pages)])];
 if(required.some(id=>!manifest.files[id]))throw new Error(`固定美术依赖不完整，${regenerate}`);
 if(options.abilityDemos!==false){const {validatePublishedAbilityDemos}=await import('./ability-demo-assets.mjs');await validatePublishedAbilityDemos(root,manifest);}
 validateRuntimeAudio(manifest,current.audio);
 return manifest;
}
