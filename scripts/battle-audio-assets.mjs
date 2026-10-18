import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

const sourceManifest='assets/battle-audio/manifest.json';
const actions={skill:/^skill(?:_|$)/,lose:/^lose(?:_|$)/,victory:/^mvp(?:_|$)/};
const safe=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]+$/.test(value);
/** Publish the voices used by gameplay; optional for isolated art fixtures. */
export async function audioSourceState(root){
 let manifest;try{manifest=JSON.parse(await readFile(path.join(root,sourceManifest),'utf8'));}
 catch(error){if(error.code==='ENOENT')return null;throw error;}
 if(manifest.version!==1||!manifest.entries)throw Error('音频素材清单无效，请执行 npm run assets:fetch -- --audio-only');
 const catalog={music:Object.create(null),voices:Object.create(null),effects:Object.create(null)},files=[],sources=[sourceManifest];
 function add(id,name,clip){
  if(!clip||clip.codec!=='opus'||clip.sampleRate!==48000||!clip.path?.startsWith('assets/battle-audio/')
    ||clip.path.includes('\\')||clip.path.split('/').some(part=>part==='..'||part==='.'||!part)
    ||!clip.path.endsWith('.webm')||!Number.isInteger(clip.bytes)||clip.bytes<32||!/^[a-f0-9]{64}$/.test(clip.sha256))throw Error(`音频素材记录无效: ${id}`);
  files.push({id,name,source:clip.path,bytes:clip.bytes,sha256:clip.sha256});sources.push(clip.path);return id;
 }
 for(const [key,entry] of Object.entries(manifest.entries)){
  if(entry.kind==='voice'){
   if(!safe(entry.id)||key!==`ship:${entry.id}`)throw Error('音频身份无效');
   const voice={};
   for(const [action,pattern] of Object.entries(actions)){
    voice[action]=Object.keys(entry.clips).filter(cue=>pattern.test(cue)).sort().map(cue=>{
     if(!safe(cue))throw Error('音频 Cue 名无效');
     return add(`audio/voice/${entry.id}/${cue}`,`voice-${entry.id}-${cue}.webm`,entry.clips[cue]);
    });
    if(!voice[action].length)throw Error(`舰娘语音缺少 ${action}: ${entry.id}`);
   }
   catalog.voices[entry.id]=voice;
  }else if(entry.kind==='effects'){
   for(const cue of Object.keys(entry.clips).sort()){
    if(!safe(cue))throw Error('音效 Cue 名无效');
    catalog.effects[cue]=add(`audio/effect/${cue}`,`${cue}.webm`,entry.clips[cue]);
   }
  }else if(entry.kind==='music'){
   const id=key==='music'?'combat':entry.id;
   if(!safe(id)||Object.keys(entry.clips).length!==1)throw Error('BGM 条目无效');
   catalog.music[id]=add(`audio/music/${id}`,`bgm-${id}.webm`,Object.values(entry.clips)[0]);
  }
 }
 return {catalog,files,sources:[...new Set(sources)].sort()};
}
export async function publishAudio(root,state,publish){
 if(!state)return;
 for(const file of state.files){
  const data=await readFile(path.join(root,file.source));
  if(data.length!==file.bytes||createHash('sha256').update(data).digest('hex')!==file.sha256)throw Error(`音频素材缺失或损坏: ${file.source}`);
  publish(file.id,file.name,data,'audio/webm; codecs="opus"');
 }
}
export function validateRuntimeAudio(manifest,state){
 if(!state){if(manifest.audio)throw Error('已发布音频缺少源清单，请执行 npm run assets:generate');return;}
 if(JSON.stringify(manifest.audio)!==JSON.stringify(state.catalog)
   ||state.files.some(file=>manifest.files[file.id]?.sha256!==file.sha256||manifest.files[file.id]?.bytes!==file.bytes
     ||manifest.files[file.id]?.contentType!=='audio/webm; codecs="opus"'))throw Error('已发布音频清单不完整，请执行 npm run assets:generate');
}
