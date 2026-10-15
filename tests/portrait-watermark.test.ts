import {expect,test} from 'vitest';
import {readFile,writeFile,mkdtemp,mkdir,rm,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {preparePainting,syncShipAssets,componentFingerprint} from '../scripts/fetch-ship-assets.mjs';
import {watermarkSvg,WATERMARK_TEXT} from '../scripts/portrait-watermark.mjs';

test('fixed Chinese outlines make the exact support notice independent of installed fonts',async()=>{
 expect(WATERMARK_TEXT).toBe('请支持官方碧蓝航线喵～');
 const svg=watermarkSvg(800,1000).toString();
 expect(svg).toContain(WATERMARK_TEXT);expect(svg).toContain('<path');expect(svg).not.toContain('<text');
 const {data,info}=await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let visible=0,transparent=0;for(let i=3;i<data.length;i+=info.channels){if(data[i]>0)visible++;else transparent++;}
 expect(visible).toBeGreaterThan(1000);expect(transparent).toBeGreaterThan(visible);
});

test('portrait and avatar are stamped separately, bounded, transparent and reproducible',async()=>{
 const input=await sharp({create:{width:1800,height:2100,channels:4,background:{r:110,g:80,b:120,alpha:0}}})
 .composite([{input:Buffer.from('<svg width="1800" height="2100"><rect x="300" y="200" width="1200" height="1700" fill="#8ca6ba"/></svg>')}]).png().toBuffer();
 const settings={maxEdge:1600,quality:80,avatar:256};
 const outputs=await preparePainting('sample',input,settings);
 for(const [name,bytes]of Object.entries(outputs)){
  const metadata=await sharp(bytes).metadata();expect(metadata.format).toBe('webp');expect(metadata.hasAlpha).toBe(true);
  expect(Math.max(metadata.width!,metadata.height!)).toBe(name.includes('avatar')?256:1600);
  const stats=await sharp(bytes).stats();expect(stats.channels[3]!.min).toBeLessThan(255);expect(stats.channels[3]!.max).toBeGreaterThan(0);
 }
 const unmarked=await sharp(input).resize({width:1600,height:1600,fit:'inside'}).webp({quality:80}).toBuffer();
 expect(outputs['public/portraits/sample.webp']).not.toEqual(unmarked);
 expect(await preparePainting('sample',input,settings)).toEqual(outputs);
});

test('changing watermark parameters refreshes only painting and a no-op never stamps again',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'watermark-sync-'));
 try{
  const configFile=path.join(root,'config/ship-assets.json');await mkdir(path.dirname(configFile),{recursive:true});
  const cfg={version:1,client:'EN',portraits:{maxEdge:1600,quality:80,avatar:256,watermark:{text:WATERMARK_TEXT,revision:1}},ships:{test:{name:'测试',type:'dd',assetName:'test'}},catalog:{'dd-1':'test'},templates:{dd:'test'},historical:{}};
  await writeFile(configFile,JSON.stringify(cfg));
  const image=await sharp({create:{width:500,height:700,channels:4,background:'#567688'}}).png().toBuffer();
  const source=async()=>({status:'available',source:{provider:'fixture'},files:{painting:image,chibi:Object.fromEntries(await Promise.all(['sailor.json','sailor.atlas','sailor.webp'].map(async n=>[n,await readFile('public/characters/default/'+n)])))}});
  await syncShipAssets({root,resolveSource:source,regenerate:false});
  const skeleton=path.join(root,'public/characters/test/test.json'),portrait=path.join(root,'public/portraits/test.webp');
  const skeletonBefore=await stat(skeleton),portraitBefore=await readFile(portrait),portraitStat=await stat(portrait);
  await syncShipAssets({root,resolveSource:async()=>{throw Error('unexpected remote');},regenerate:false});
  expect(await readFile(portrait)).toEqual(portraitBefore);expect((await stat(portrait)).mtimeMs).toBe(portraitStat.mtimeMs);
  cfg.portraits.watermark.revision=2;await writeFile(configFile,JSON.stringify(cfg));
  const needs:string[][]=[];await syncShipAssets({root,resolveSource:async(_ship:any,n:string[])=>{needs.push(n);return source();},regenerate:false});
  expect(needs).toEqual([['painting']]);expect((await stat(skeleton)).mtimeMs).toBe(skeletonBefore.mtimeMs);
 }finally{await rm(root,{recursive:true,force:true});}
});


test('required base portrait layers invalidate only painting while missing metadata preserves the existing fingerprint',()=>{
 const cfg:any={client:'EN',portraits:{maxEdge:1600,quality:80,avatar:256},ships:{test:{assetName:'test',skinId:'1'}}};
 const painting=componentFingerprint(cfg,'test','painting'),chibi=componentFingerprint(cfg,'test','chibi');
 cfg.ships.test.paintingLayers=['test','test_rw'];
 expect(componentFingerprint(cfg,'test','painting')).not.toBe(painting);
 expect(componentFingerprint(cfg,'test','chibi')).toBe(chibi);
 delete cfg.ships.test.paintingLayers;expect(componentFingerprint(cfg,'test','painting')).toBe(painting);
});

test('subject crop is applied before resizing and watermarking, and only invalidates painting',async()=>{
 const input=await sharp({create:{width:1000,height:800,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:Buffer.from('<svg width="1000" height="800"><rect x="400" y="200" width="200" height="500" fill="#c8321e"/></svg>')}]).png().toBuffer();
 const crop={left:.3,top:.2,width:.4,height:.75},settings={maxEdge:1600,quality:80,avatar:256};
 const result=await preparePainting('crop',input,settings,crop),meta=await sharp(result['public/portraits/crop.webp']).metadata();
 expect([meta.width,meta.height]).toEqual([400,600]);expect(meta.hasAlpha).toBe(true);
 const point=await sharp(result['public/portraits/crop.webp']).extract({left:150,top:100,width:1,height:1}).raw().toBuffer();expect(point[0]).toBeGreaterThan(180);expect(point[3]).toBe(255);
 const cfg:any={client:'EN',portraits:settings,ships:{test:{assetName:'test'}}},painting=componentFingerprint(cfg,'test','painting'),chibi=componentFingerprint(cfg,'test','chibi');
 cfg.ships.test.portraitCrop=crop;expect(componentFingerprint(cfg,'test','painting')).not.toBe(painting);expect(componentFingerprint(cfg,'test','chibi')).toBe(chibi);
 await expect(preparePainting('bad',input,settings,{...crop,left:.9})).rejects.toThrow(/裁剪/);
});
