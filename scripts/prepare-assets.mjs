import sharp from 'sharp';
import {readdir, readFile, writeFile, mkdir, rm, copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {characterConfig} from '../src/characters/config.ts';
import {spineFingerprint} from './spine-preview-manifest.mjs';

// Keep artists' originals intact; only the generated public tree is shipped.
export async function prepareAssets(root=fileURLToPath(new URL('../',import.meta.url))) {
  const source=path.join(root,'public'), generated=path.join(root,'.generated');
  const output=path.join(generated,'public'), images={}, files=[];
  async function walk(dir) {
    for(const entry of await readdir(dir,{withFileTypes:true})) {
      const file=path.join(dir,entry.name);
      if(entry.isDirectory()) await walk(file); else files.push(file);
    }
  }
  await walk(source);
  await rm(output,{recursive:true,force:true});
  await mkdir(path.join(output,'assets/images'),{recursive:true});
  for(const file of files.filter(file=>/\.(png|jpe?g)$/i.test(file))) {
    const key=path.relative(source,file).split(path.sep).join('/');
    const variants=[];
    async function encode(width,quality,kind) {
      const pipeline=sharp(file).rotate();
      if(width) pipeline.resize({width,withoutEnlargement:true});
      const {data,info}=await pipeline.webp({quality,alphaQuality:100,effort:5}).toBuffer({resolveWithObject:true});
      const hash=createHash('sha256').update(data).digest('hex').slice(0,16);
      const name=`assets/images/${path.parse(file).name}-${kind}-${hash}.webp`;
      await writeFile(path.join(output,name),data);
      return {src:name,width:info.width,height:info.height,bytes:data.length};
    }
    const full=await encode(undefined,80,'full');
    const preview=await encode(24,30,'preview');
    for(const width of [128,256,512,960].filter(width=>width<full.width)) variants.push(await encode(width,80,String(width)));
    variants.push(full);
    images[key]={src:full.src,preview:preview.src,width:full.width,height:full.height,variants};
  }
  for(const file of files.filter(file=>! /\.(png|jpe?g)$/i.test(file))) {
    const key=path.relative(source,file), target=path.join(output,key);
    await mkdir(path.dirname(target),{recursive:true});
    if(file.endsWith('.atlas')) {
      const atlas=(await readFile(file,'utf8')).split('\n').map(line=>{
        const image=images[path.posix.normalize(path.posix.join(path.dirname(key).split(path.sep).join('/'),line.trim()))];
        return image ? path.relative(path.dirname(target),path.join(output,image.src)).split(path.sep).join('/') : line;
      }).join('\n');
      await writeFile(target,atlas);
    } else await copyFile(file,target);
  }
  await writeFile(path.join(generated,'image-assets.json'),JSON.stringify(images,null,2)+'\n');
  const previews={},manifestPath=path.join(source,'characters/previews/manifest.json');
  if(existsSync(manifestPath)) {
    const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
    for(const [id,entry] of Object.entries(manifest.profiles)) {
      const profile=characterConfig.profiles[id];
      if(!profile)continue;
      if(entry.fingerprint!==await spineFingerprint(root,profile)) {
        console.warn(`Spine thumbnail ${id} is stale; run npm run assets:spine to refresh it`);continue;
      }
      const data=await readFile(path.join(source,entry.image)),hash=createHash('sha256').update(data).digest('hex').slice(0,16);
      const name=`assets/images/spine-${id}-${hash}.webp`;
      await writeFile(path.join(output,name),data);previews[id]=name;
    }
  }
  await writeFile(path.join(generated,'spine-previews.json'),JSON.stringify(previews,null,2)+'\n');
  return images;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const images=await prepareAssets(process.argv[2]);
  console.log(`Prepared ${Object.keys(images).length} raster images as lossy WebP with previews and responsive sizes`);
}
