import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {ABILITY_DEMO_SHIP_IDS} from '../shared/ability-demo.ts';
import {isArtifactCurrent,digest} from './ability-demo-manifest.mjs';
export const hasDemoSources=root=>existsSync(path.join(root,'assets/ability-demos/manifest.json'));
export async function readAbilityDemoOutputs(root){
 let source;try{source=JSON.parse(await readFile(path.join(root,'assets/ability-demos/manifest.json'),'utf8'));}catch{throw new Error('能力演示清单缺失，请运行 npm run demos:render -- --all');}
 for(const id of ABILITY_DEMO_SHIP_IDS){
  const c=source.clips?.[id],bad=()=>{throw new Error(`能力演示 ${id} 缺失、损坏或规格不符，请检查现有产物`);};
  if(!c||!await isArtifactCurrent(path.join(root,'assets/ability-demos',id),c))bad();
  if(c.id!==id||!c.name||!c.ability||!Number.isFinite(c.duration)||c.duration<1||c.width!==768||c.height!==960||c.fps!==30||!Array.isArray(c.cues)||!c.cues.length)bad();
  let end=0;for(const cue of c.cues){if(cue.start!==end||cue.end<=cue.start||typeof cue.title!=='string'||typeof cue.detail!=='string'||!Number.isInteger(cue.round)||cue.round<1)bad();end=cue.end;}if(end!==c.duration)bad();
  for(const [format,codec]of [['webm','vp9'],['mp4','h264']]){const f=c.formats?.[format];if(!f||f.codec!==codec||f.width!==768||f.height!==960||f.frames!==c.duration*30||f.fps!=='30/1'||f.audio!==false||Math.abs(f.duration-c.duration)>.05||c.files[`demo.${format}`].bytes>4*1048576)bad();}
 }
 return source;
}
export async function validateAbilityDemoOutputs(root){return readAbilityDemoOutputs(root);}
export async function appendPublishedDemos(root,source,publish){
 const demos={};for(const id of ABILITY_DEMO_SHIP_IDS){const c=source.clips[id],entry={shipId:id,name:c.name,ability:c.ability,duration:c.duration,width:c.width,height:c.height,fps:c.fps,cues:c.cues};
  for(const [kind,file,type]of [['webm','demo.webm','video/webm'],['mp4','demo.mp4','video/mp4'],['poster','poster.webp','image/webp']])entry[kind]=publish(`ability-demo/${id}/${kind}`,`ability-${id}-${file}`,await readFile(path.join(root,'assets/ability-demos',id,file)),type);
  demos[id]=entry;
 }return demos;
}
export async function addAbilityDemos(root,manifest,publish){if(hasDemoSources(root))manifest.abilityDemos=await appendPublishedDemos(root,await validateAbilityDemoOutputs(root),publish);}
export async function validatePublishedAbilityDemos(root,manifest){
 if(!hasDemoSources(root)&&!manifest.abilityDemos)return;
 const source=await validateAbilityDemoOutputs(root),expected=await appendPublishedDemos(root,source,id=>id);
 if(JSON.stringify(manifest.abilityDemos)!==JSON.stringify(expected))throw new Error('能力演示发布清单已过期，请运行 npm run demos:render -- --all');
 for(const id of ABILITY_DEMO_SHIP_IDS)for(const [kind,file,type]of [['webm','demo.webm','video/webm'],['mp4','demo.mp4','video/mp4'],['poster','poster.webp','image/webp']]){
  const a=manifest.files[`ability-demo/${id}/${kind}`],s=source.clips[id].files[file];if(!a||a.contentType!==type||a.sha256!==s.sha256||a.bytes!==s.bytes)throw new Error(`能力演示发布文件不匹配：${id}/${kind}`);
 }
}
/** Explicit publishing only. Old content-hashed files remain valid for existing tabs. */
export async function registerAbilityDemos(root){
 const manifest=JSON.parse(await readFile(path.join(root,'assets/runtime/manifest.json'),'utf8')),blobs=new Map();
 for(const id of Object.keys(manifest.files))if(id.startsWith('ability-demo/'))delete manifest.files[id];
 await addAbilityDemos(root,manifest,(id,name,data,type)=>{const hash=digest(data),ext=path.extname(name),stem=path.basename(name,ext),target=`assets/runtime/${stem}-${hash.slice(0,16)}${ext}`;manifest.files[id]={path:target,sha256:hash,bytes:data.length,contentType:type};blobs.set(target,data);return id;});
 for(const [file,data]of blobs){const destination=path.join(root,'assets/runtime/files',file);await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,data);}
 const file=path.join(root,'assets/runtime/manifest.json'),next=`${file}.${randomUUID()}.tmp`;await writeFile(next,JSON.stringify(manifest,null,2)+'\n');await rename(next,file);return manifest;
}
