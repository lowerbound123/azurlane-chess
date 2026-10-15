import {it,expect} from 'vitest';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {artifactRecord,isArtifactCurrent} from '../scripts/ability-demo-manifest.mjs';
it('跳过生成前检查指纹和所有产物内容，损坏或缺失视频必须重录',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'demo-test-'));
 try{
  for(const name of ['demo.webm','demo.mp4','poster.webp','contact.webp','evidence.json'])await writeFile(join(dir,name),name);
  const record=await artifactRecord(dir,'abc');
  expect(await isArtifactCurrent(dir,record,'abc')).toBe(true);
  expect(await isArtifactCurrent(dir,record,'changed-effect')).toBe(false);
  await writeFile(join(dir,'demo.mp4'),'broken');
  expect(await isArtifactCurrent(dir,record,'abc')).toBe(false);
  await rm(join(dir,'poster.webp'));
  expect(await isArtifactCurrent(dir,record,'abc')).toBe(false);
 }finally{await rm(dir,{recursive:true,force:true});}
});

import {installArtifact,createCancellation} from '../scripts/ability-demo-io.mjs';
import {mkdir,readFile,stat} from 'node:fs/promises';
it('manifest 替换失败时回滚新目录，保留旧视频',async()=>{
 const root=await mkdtemp(join(tmpdir(),'demo-transaction-'));
 try{
  const old=join(root,'bb-2'),staging=join(root,'.staging'),manifest=join(root,'manifest.json');
  await mkdir(old);await writeFile(join(old,'demo.mp4'),'old-video');await mkdir(staging);await writeFile(join(staging,'demo.mp4'),'new-video');
  // Real rename error after the new clip directory is installed.
  await mkdir(manifest);
  await expect(installArtifact(staging,old,manifest,{clips:{}})).rejects.toThrow();
  expect(await readFile(join(old,'demo.mp4'),'utf8')).toBe('old-video');
  expect((await stat(manifest)).isDirectory()).toBe(true);
 }finally{await rm(root,{recursive:true,force:true});}
});
it('取消在编码任务为空时也阻止后续步骤',()=>{
 const cancellation=createCancellation();cancellation.cancel();expect(()=>cancellation.check()).toThrow('录制已取消');
});

import {sourceFingerprint} from '../scripts/ability-demo-manifest.mjs';
it('只追踪实际录制依赖：特效和资源变化失效，无关界面和应用版本不失效',async()=>{
 const root=await mkdtemp(join(tmpdir(),'demo-dependencies-'));
 const files:Record<string,string>={
  'src/ability-demos/render.ts':"import '../scene/fx.ts';",
  'src/scene/fx.ts':'export const color=1;',
  'shared/game.ts':'export interface Game {}',
  'src/FleetSelection.vue':'first UI',
  'src/version.ts':"export const VERSION='0.7.9';",
  'tools/ship-ability-demos.ts':"import '../src/ability-demos/render.ts';",
  'tools/ship-ability-demos.html':'<div>workbench</div>',
  'scripts/render-ability-demos.mjs':'renderer',
  'scripts/ability-demo-manifest.mjs':'fingerprint',
  'scripts/ability-demo-io.mjs':'transaction',
  'vite.config.ts':'export default {};',
  'assets/runtime/manifest.json':'{"sources":{}}',
  'package-lock.json':JSON.stringify({version:'0.7.9',packages:{'':{version:'0.7.9'},'node_modules/three':{version:'1'}}}),
 };
 try{
  for(const[file,content]of Object.entries(files)){await mkdir(join(root,file,'..'),{recursive:true});await writeFile(join(root,file),content);}
  const initial=await sourceFingerprint(root);
  await writeFile(join(root,'src/FleetSelection.vue'),'changed UI');await writeFile(join(root,'src/version.ts'),"export const VERSION='0.7.10';");
  await writeFile(join(root,'package-lock.json'),JSON.stringify({version:'0.7.10',packages:{'':{version:'0.7.10'},'node_modules/three':{version:'1'}}}));
  expect(await sourceFingerprint(root)).toBe(initial);
  await writeFile(join(root,'src/scene/fx.ts'),'export const color=2;');expect(await sourceFingerprint(root)).not.toBe(initial);
  await writeFile(join(root,'src/scene/fx.ts'),files['src/scene/fx.ts']);
  await writeFile(join(root,'assets/runtime/manifest.json'),'{"sources":{},"texture":1}');expect(await sourceFingerprint(root)).not.toBe(initial);
 }finally{await rm(root,{recursive:true,force:true});}
});
