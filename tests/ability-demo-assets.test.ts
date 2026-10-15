import {it,expect} from 'vitest';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';import {tmpdir} from 'node:os';
import {ABILITY_DEMO_SHIP_IDS} from '../shared/ability-demo.ts';
import {artifactRecord} from '../scripts/ability-demo-manifest.mjs';
import {readAbilityDemoOutputs,appendPublishedDemos} from '../scripts/ability-demo-assets.mjs';
it('只发布全十五舰的同指纹完整产物，登记真实MIME与hash路径；损坏视频拒绝发布',async()=>{
 const root=await mkdtemp(join(tmpdir(),'ability-publish-'));const clips:Record<string,any>={};
 try{
  for(const id of ABILITY_DEMO_SHIP_IDS){const dir=join(root,'assets/ability-demos',id);await mkdir(dir,{recursive:true});for(const file of ['demo.webm','demo.mp4','poster.webp','contact.webp','evidence.json'])await writeFile(join(dir,file),`${id}/${file}`);
   clips[id]={id,name:id,ability:'演示',duration:10,width:768,height:960,fps:30,cues:[{start:0,end:10,round:1,title:'能力',detail:'结果'}],...await artifactRecord(dir,'current'),formats:{webm:{codec:'vp9',width:768,height:960,frames:300,fps:'30/1',duration:10,audio:false},mp4:{codec:'h264',width:768,height:960,frames:300,fps:'30/1',duration:10,audio:false}}};
  }
  await writeFile(join(root,'assets/ability-demos/manifest.json'),JSON.stringify({schema:1,clips}));
  const source=await readAbilityDemoOutputs(root,'current'),files:Record<string,any>={},published:Buffer[]=[];
  const demos=await appendPublishedDemos(root,source,(id:string,name:string,data:Buffer,type:string)=>{files[id]={name,type};published.push(data);return id;});
  expect(Object.keys(demos)).toHaveLength(15);expect(published).toHaveLength(45);expect(files['ability-demo/dd-1/webm'].type).toBe('video/webm');expect(files['ability-demo/cv-3/mp4'].type).toBe('video/mp4');expect(files['ability-demo/bb-1/poster'].type).toBe('image/webp');expect(demos['bb-2'].cues[0].title).toBe('能力');
  await expect(readAbilityDemoOutputs(root,'changed-rule')).rejects.toThrow('重生成');
  await writeFile(join(root,'assets/ability-demos/dd-1/demo.webm'),'corrupt');await expect(readAbilityDemoOutputs(root,'current')).rejects.toThrow('dd-1');
 }finally{await rm(root,{recursive:true,force:true});}
});
