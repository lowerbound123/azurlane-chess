import sharp from 'sharp';
import {readFile,writeFile,mkdir,rm,rename} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {addAbilityDemos} from './ability-demo-assets.mjs';
import {authoringState,digest} from './runtime-assets.mjs';
import {publishAudio} from './battle-audio-assets.mjs';
const types={'.json':'application/json','.atlas':'text/plain','.skel':'application/octet-stream','.svg':'image/svg+xml','.webp':'image/webp','.glb':'model/gltf-binary'};
export async function generateAssets(root=fileURLToPath(new URL('../',import.meta.url)),options={}){
 const state=await authoringState(root),files={},images={},spine={},spinePreviews={},blobs=new Map();
 function publish(id,name,data,type){const hash=digest(data),ext=path.extname(name).toLowerCase(),stem=path.basename(name,ext).replace(/[^a-zA-Z0-9_-]/g,'-')||'asset',target=`assets/runtime/${stem}-${hash.slice(0,16)}${ext}`;
  files[id]={path:target,sha256:hash,bytes:data.length,contentType:type??types[ext]??'application/octet-stream'};blobs.set(target,data);return id;}
 for(const source of state.raster){
  const input=path.join(root,'public',source);async function encode(width,quality,kind){let pipeline=sharp(input).rotate();if(width)pipeline=pipeline.resize({width,withoutEnlargement:true});const {data,info}=await pipeline.webp({quality,alphaQuality:100,effort:5}).toBuffer({resolveWithObject:true});const name=`${path.parse(source).name}-${kind}.webp`,id=`assets/runtime/${path.basename(name,'.webp')}-${digest(data).slice(0,16)}.webp`;publish(id,name,data,'image/webp');return {src:id,width:info.width,height:info.height,bytes:data.length};}
  let full;
  if(/\.webp$/i.test(source)){const data=await readFile(input),info=await sharp(data).metadata();const name=`${path.parse(source).name}-full.webp`,id=`assets/runtime/${path.basename(name,'.webp')}-${digest(data).slice(0,16)}.webp`;publish(id,name,data,'image/webp');full={src:id,width:info.width,height:info.height,bytes:data.length};}
  else full=await encode(undefined,80,'full');
  const preview=await encode(24,30,'preview'),variants=[];for(const width of [128,256,512,960].filter(w=>w<full.width))variants.push(await encode(width,80,String(width)));variants.push(full);
  images[source]={src:full.src,preview:preview.src,width:full.width,height:full.height,variants};
 }
 for(const [id,{profile,pages,preview}]of Object.entries(state.spine)){
  for(const source of [profile.skeleton,profile.atlas,...Object.values(pages)]){
   if(files[source])continue;
   if(images[source])files[source]={...files[images[source].src]};else publish(source,source,await readFile(path.join(root,'public',source)));
  }
  spine[id]={skeleton:profile.skeleton,atlas:profile.atlas,pages};spinePreviews[id]=publish(`spine-preview/${id}`,`spine-${id}.webp`,await readFile(path.join(root,'public',preview)));
 }
 const models={torpedo:publish('models/torpedo','torpedo-mk14.glb',await readFile(path.join(root,'assets/models/torpedoes/mk14.glb'))),aircraft:publish('models/aircraft','aircraft.glb',await readFile(path.join(root,'assets/models/aircraft.glb'))),mine:publish('models/mine','naval-mine.glb',await readFile(path.join(root,'assets/models/naval-mine.glb')))};
 publish('placeholder/ship','ship-placeholder.svg',Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="256" height="320" viewBox="0 0 256 320"><rect width="256" height="320" rx="16" fill="#102633"/><path d="M48 190h160l-28 38H76zM104 106h48v84h-48zM128 68v38" fill="#66ded2" stroke="#66ded2" stroke-width="8"/></svg>'));
 const manifest={version:1,files,images,spinePreviews,spine,models,sources:state.sources,spineFingerprints:state.fingerprints},out=path.join(root,'assets/runtime'),stage=path.join(root,'assets/.runtime-stage');
 if(state.audio){await publishAudio(root,state.audio,publish);manifest.audio=state.audio.catalog;}
 if(options.abilityDemos!==false)await addAbilityDemos(root,manifest,publish);
 await rm(stage,{recursive:true,force:true});await mkdir(stage,{recursive:true});
 try{for(const [file,data]of blobs){const dest=path.join(stage,'files',file);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,data);}await writeFile(path.join(stage,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');await rm(out,{recursive:true,force:true});await rename(stage,out);}finally{await rm(stage,{recursive:true,force:true});}
 return manifest;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const m=await generateAssets(process.argv[2]==='--base-only'?undefined:process.argv[2],{abilityDemos:!process.argv.includes('--base-only')});console.log(`Generated ${Object.keys(m.files).length} fixed runtime assets; commit assets/runtime with source changes.`);}
