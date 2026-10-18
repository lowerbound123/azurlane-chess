import {it,expect} from 'vitest';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';import {tmpdir} from 'node:os';
import {ABILITY_DEMO_SHIP_IDS} from '../shared/ability-demo.ts';
import {artifactRecord} from '../scripts/ability-demo-manifest.mjs';
import {readAbilityDemoOutputs,validateAbilityDemoOutputs,appendPublishedDemos} from '../scripts/ability-demo-assets.mjs';
it('发布完整十五舰时忽略代码源指纹，保留MIME和内容hash校验，损坏视频仍拒绝发布',async()=>{
 const root=await mkdtemp(join(tmpdir(),'ability-publish-'));const clips:Record<string,any>={};
 try{
  for(const id of ABILITY_DEMO_SHIP_IDS){const dir=join(root,'assets/ability-demos',id);await mkdir(dir,{recursive:true});for(const file of ['demo.webm','demo.mp4','poster.webp','contact.webp','evidence.json'])await writeFile(join(dir,file),`${id}/${file}`);
   clips[id]={id,name:id,ability:'演示',duration:10,width:768,height:960,fps:30,cues:[{start:0,end:10,round:1,title:'能力',detail:'结果'}],...await artifactRecord(dir),fingerprint:`legacy-source-${id}`,formats:{webm:{codec:'vp9',width:768,height:960,frames:300,fps:'30/1',duration:10,audio:false},mp4:{codec:'h264',width:768,height:960,frames:300,fps:'30/1',duration:10,audio:false}}};
  }
  await writeFile(join(root,'assets/ability-demos/manifest.json'),JSON.stringify({schema:1,clips}));
  const source=await readAbilityDemoOutputs(root),files:Record<string,any>={},published:Buffer[]=[];
  const demos=await appendPublishedDemos(root,source,(id:string,name:string,data:Buffer,type:string)=>{files[id]={name,type};published.push(data);return id;});
  expect(Object.keys(demos)).toHaveLength(15);expect(published).toHaveLength(45);expect(files['ability-demo/dd-1/webm'].type).toBe('video/webm');expect(files['ability-demo/cv-3/mp4'].type).toBe('video/mp4');expect(files['ability-demo/bb-1/poster'].type).toBe('image/webp');expect(demos['bb-2'].cues[0].title).toBe('能力');
  // No game source tree exists here. Valid recorded media must still validate.
  await expect(validateAbilityDemoOutputs(root)).resolves.toMatchObject({clips:{'dd-1':{id:'dd-1'}}});
  await expect(readAbilityDemoOutputs(root)).resolves.toMatchObject({clips:{'cv-3':{id:'cv-3'}}});
  clips['cv-3'].formats.mp4.codec='vp9';await writeFile(join(root,'assets/ability-demos/manifest.json'),JSON.stringify({schema:1,clips}));
  await expect(validateAbilityDemoOutputs(root)).rejects.toThrow('cv-3');
  clips['cv-3'].formats.mp4.codec='h264';await writeFile(join(root,'assets/ability-demos/manifest.json'),JSON.stringify({schema:1,clips}));
  await writeFile(join(root,'assets/ability-demos/dd-1/demo.webm'),'corrupt');await expect(readAbilityDemoOutputs(root)).rejects.toThrow('dd-1');
 }finally{await rm(root,{recursive:true,force:true});}
});
