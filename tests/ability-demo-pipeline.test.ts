import {it,expect} from 'vitest';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {artifactRecord,isArtifactCurrent} from '../scripts/ability-demo-manifest.mjs';
it('复用视频只检查产物完整性，忽略旧源指纹，损坏或缺失仍拒绝复用',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'demo-test-'));
 try{
  for(const name of ['demo.webm','demo.mp4','poster.webp','contact.webp','evidence.json'])await writeFile(join(dir,name),name);
  const record=await artifactRecord(dir);
  expect(record).not.toHaveProperty('fingerprint');
  expect(await isArtifactCurrent(dir,record)).toBe(true);
  expect(await isArtifactCurrent(dir,{...record,fingerprint:'old-source'})).toBe(true);
  expect(await isArtifactCurrent(dir,undefined)).toBe(false);
  await writeFile(join(dir,'demo.mp4'),'broken');
  expect(await isArtifactCurrent(dir,record)).toBe(false);
  await writeFile(join(dir,'demo.mp4'),'demo.mp4');
  await rm(join(dir,'poster.webp'));
  expect(await isArtifactCurrent(dir,record)).toBe(false);
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
