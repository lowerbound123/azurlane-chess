import {readFile,writeFile,mkdir,rename,rm,mkdtemp,realpath,unlink} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {activeIds,runPythonProvider} from './ship-assets-common.mjs';

const project=fileURLToPath(new URL('../',import.meta.url));
const directory='assets/battle-audio';
// Keep the existing BGM hash basis stable; per-kind output settings are hashed below.
const fingerprintBase={revision:2,codec:'aac',container:'m4a',voiceBitrate:96000,effectsBitrate:128000,musicBitrate:192000,
  decryption:'Nyagamon-HCADecoder/e26b4d3a:Perfare-816'};
const processing={revision:3,codec:'opus',container:'webm',voiceBitrate:32000,effectsBitrate:64000,musicBitrate:80000,
  sampleRate:48000,vbr:'on',application:'audio',compressionLevel:10,decryption:fingerprintBase.decryption};
const opusSettings=bitrate=>({revision:1,codec:'opus',container:'webm',bitrate,sampleRate:48000,
  vbr:'on',application:'audio',compressionLevel:10});
const voiceProcessing=opusSettings(processing.voiceBitrate),effectsProcessing=opusSettings(processing.effectsBitrate),
  musicProcessing=opusSettings(processing.musicBitrate);
const outputSettings={voice:voiceProcessing,effects:effectsProcessing,music:musicProcessing};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const encoded=value=>JSON.stringify(value,null,2)+'\n';
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const safe=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]+$/.test(value);
const musicId=value=>typeof value==='string'&&value.length<=48&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const musicBundle=value=>typeof value==='string'&&/^cue\/bgm-[a-z0-9_-]+\.b$/.test(value);
const description=(value,max)=>typeof value==='string'&&value.trim().length>0&&value.length<=max;
async function optionalJSON(file,fallback){try{return await json(file);}catch(error){if(error.code==='ENOENT')return fallback;throw error;}}
async function put(file,bytes){
  const data=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);
  try{if((await readFile(file)).equals(data))return false;}catch(error){if(error.code!=='ENOENT')throw error;}
  await mkdir(path.dirname(file),{recursive:true});await writeFile(file+'.partial',data);await rename(file+'.partial',file);return true;
}

export function planBattleAudio(config){
  if(config.audio===undefined)return [];
  if(!['EN','CN','JP','KR','TW'].includes(config.client)||!musicBundle(config.audio?.music)){
    throw Error('音频配置必须指定一个精确的 BGM 包');
  }
  const library=config.audio.musicLibrary===undefined?{}:config.audio.musicLibrary;
  if(!library||typeof library!=='object'||Array.isArray(library))throw Error('BGM 曲库必须是具名配置对象');
  const bundles=new Set([config.audio.music]);
  const music=Object.keys(library).sort().map(id=>{
    const track=library[id];
    if(!musicId(id)||!track||!musicBundle(track.bundle)||!description(track.name,120)||!description(track.usage,240)){
      throw Error(`BGM 曲库条目无效: ${id}`);
    }
    if(bundles.has(track.bundle))throw Error(`BGM 包重复: ${track.bundle}`);
    bundles.add(track.bundle);
    return {key:`music:${id}`,kind:'music',id,name:track.name,usage:track.usage,bundle:track.bundle};
  });
  const voices=activeIds(config).map(id=>{
    const ship=config.ships[id];
    if(!safe(id)||!/^\d{3,12}0$/.test(ship?.skinId??''))throw Error(`无法从基础皮肤编号确定战斗语音: ${id}`);
    const voiceId=ship.skinId.slice(0,-1);
    return {key:`ship:${id}`,kind:'voice',id,name:ship.name,voiceId,bundle:`cue/cv-${voiceId}-battle.b`};
  });
  return [...voices,{key:'effects',kind:'effects',bundle:'cue/se-battle.b'},
    {key:'music',kind:'music',bundle:config.audio.music},...music];
}

function fingerprint(config,item){return sha(encoded({client:config.client,bundle:item.bundle,voiceId:item.voiceId,
  processing:fingerprintBase,[item.kind]:outputSettings[item.kind]}));}
function entryMetadata(item){
  return item.kind==='voice'?{id:item.id,name:item.name,voiceId:item.voiceId}
    :item.id?{id:item.id,name:item.name,usage:item.usage}:{};
}
function clipPath(item,cue){
  const name=safe(cue)&&cue.length<=100?cue:`cue-${sha(cue).slice(0,16)}`;
  const folder=item.kind==='voice'?`voices/${item.id}`:item.kind==='effects'?'effects':item.id?`music/${item.id}`:'music';
  return `${directory}/${folder}/${name}.webm`;
}
function validMetadata(clip){
  return Number.isFinite(clip.duration)&&clip.duration>0&&Number.isInteger(clip.sampleRate)&&clip.sampleRate>=8000&&clip.sampleRate<=192000
    &&Number.isInteger(clip.channels)&&clip.channels>=1&&clip.channels<=8&&Number.isInteger(clip.numSamples)&&clip.numSamples>0
    &&Math.abs(clip.duration-clip.numSamples/clip.sampleRate)<=.05;
}
function assertAudio(data,clip){
  const validContainer=data.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]))&&data.subarray(0,128).includes(Buffer.from('webm'));
  if(data.length<32||!validContainer||!validMetadata(clip)||clip.sampleRate!==processing.sampleRate)throw Error('无效 Opus/WebM 音频或元数据');
}
function validSource(source,item){
  return source?.bundle?.path===item.bundle&&/^[a-f0-9]{32}$/.test(source.bundle.md5hash)
    &&Number.isInteger(source.bundle.size)&&source.bundle.size>0&&/^https?:\/\//.test(source.cdn??'')
    &&Array.isArray(source.versions)&&source.versions.every(version=>typeof version==='string');
}

async function inspectEntry(root,config,item,entry){
  const issues=[];
  if(!entry||entry.kind!==item.kind||entry.processingHash!==fingerprint(config,item)||!validSource(entry.source,item))return [`${item.key}:音频记录缺失或处理配置变化`];
  const names=entry.cueNames;
  if(!Array.isArray(names)||!names.length||names.some(name=>typeof name!=='string'||!name)||new Set(names).size!==names.length
    ||JSON.stringify([...names].sort())!==JSON.stringify(Object.keys(entry.clips??{}).sort()))return [`${item.key}:Cue 清单不完整`];
  for(const cue of names){
    const clip=entry.clips[cue],expected=clipPath(item,cue);
    if(!clip||typeof clip!=='object'||Array.isArray(clip)){issues.push(`${item.key}:${cue}:音频记录无效`);continue;}
    if(clip.path!==expected){issues.push(`${item.key}:${cue}:音频路径不合法`);continue;}
    try{
      const data=await readFile(path.join(root,expected));assertAudio(data,clip);
      if(clip.codec!=='opus'||data.length!==clip.bytes||sha(data)!==clip.sha256)issues.push(`${item.key}:${cue}:音频缺失或损坏`);
    }catch(error){if(error.code!=='ENOENT'&&error.code)throw error;issues.push(`${item.key}:${cue}:音频缺失或损坏 (${error.message})`);}
  }
  return issues;
}

export async function checkBattleAudio(root=project,config){
  config??=await json(path.join(root,'config/ship-assets.json'));
  const desired=planBattleAudio(config),problems=[];
  if(!desired.length)return {problems,entries:0,voices:0,clips:0};
  const manifest=await optionalJSON(path.join(root,directory,'manifest.json'),null);
  if(manifest?.version!==1||manifest.client!==config.client)problems.push('战斗音频清单缺失或客户端不匹配');
  if(!Object.entries(processing).every(([key,value])=>manifest?.processing?.[key]===value))problems.push('战斗音频处理元数据过期');
  if(!Object.entries(voiceProcessing).every(([key,value])=>manifest?.voiceProcessing?.[key]===value))problems.push('语音处理元数据过期');
  if(!Object.entries(effectsProcessing).every(([key,value])=>manifest?.effectsProcessing?.[key]===value))problems.push('音效处理元数据过期');
  if(!Object.entries(musicProcessing).every(([key,value])=>manifest?.musicProcessing?.[key]===value))problems.push('BGM 处理元数据过期');
  for(const item of desired)problems.push(...await inspectEntry(root,config,item,manifest?.entries?.[item.key]));
  return {problems,entries:desired.length,voices:desired.filter(item=>item.kind==='voice').length,
    clips:desired.reduce((total,item)=>total+Object.keys(manifest?.entries?.[item.key]?.clips??{}).length,0)};
}

async function prepareEntry(config,item,result,stage){
  if(!validSource(result.source,item)||!Array.isArray(result.clips)||!result.clips.length)throw Error(`${item.key}:不完整的音频来源`);
  const clips=Object.create(null),outputs=[];
  const base=await realpath(stage);
  for(const source of result.clips){
    const cue=source.cue;
    if(typeof cue!=='string'||!cue||Object.hasOwn(clips,cue))throw Error(`${item.key}:Cue 名称为空或重复`);
    const actual=await realpath(source.file),relative=path.relative(base,actual);
    if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))throw Error('音频来源路径越过临时目录');
    const data=await readFile(actual);assertAudio(data,source);
    const target=clipPath(item,cue);
    if(outputs.some(output=>output.path===target))throw Error('音频输出文件名冲突');
    outputs.push({path:target,data});
    clips[cue]={path:target,codec:'opus',bytes:data.length,sha256:sha(data),duration:source.duration,
      sampleRate:source.sampleRate,channels:source.channels,numSamples:source.numSamples,
      ...(source.sourceSampleRate!==undefined?{sourceSampleRate:source.sourceSampleRate,sourceNumSamples:source.sourceNumSamples}:{}),
      ...(source.waveformId!==undefined?{waveformId:source.waveformId}:{}),
      ...(source.cueDurationMs!==undefined?{cueDurationMs:source.cueDurationMs}:{})};
  }
  const names=Object.keys(clips).sort();
  return {outputs,entry:{kind:item.kind,...entryMetadata(item),
    processingHash:fingerprint(config,item),source:result.source,cueNames:names,
    clips:Object.fromEntries(names.map(name=>[name,clips[name]]))}};
}

export async function syncBattleAudio({root=project,config,resolveSource,dryRun=false}={}){
  config??=await json(path.join(root,'config/ship-assets.json'));
  const desired=planBattleAudio(config),manifestFile=path.join(root,directory,'manifest.json');
  if(!desired.length)return {planned:[],changed:false,entries:0,clips:0};
  let manifest=await optionalJSON(manifestFile,null);
  if(manifest?.version!==1||manifest.client!==config.client||!manifest.entries||typeof manifest.entries!=='object'||Array.isArray(manifest.entries))manifest={version:1,client:config.client,processing,entries:{}};
  const needed=[];
  for(const item of desired)if((await inspectEntry(root,config,item,manifest.entries?.[item.key])).length)needed.push(item);
  const planned=needed.map(({key,bundle})=>({key,bundle}));
  if(dryRun)return {planned,changed:false};
  let changed=false,stage;
  const errors=[];
  try{
    if(needed.length){
      await mkdir(path.join(root,'.generated'),{recursive:true});stage=await mkdtemp(path.join(root,'.generated/battle-audio-stage-'));
      const result=resolveSource?await resolveSource(needed,stage):await runPythonProvider({root,script:'audio.py',
        request:{client:config.client,entries:needed,cache:path.join(root,'.generated/battle-audio-cache')},output:path.join(stage,'official')});
      for(const item of needed){
        const source=result.entries?.find(entry=>entry.key===item.key);
        if(source?.status!=='available'){errors.push(`${item.key}: ${source?.reason??'音频来源缺失'}`);continue;}
        try{
          const prepared=await prepareEntry(config,item,source,stage);
          // Check every clip of this package before replacing any published clip.
          for(const file of prepared.outputs)changed=await put(path.join(root,file.path),file.data)||changed;
          manifest.entries[item.key]=prepared.entry;
          changed=await put(manifestFile,encoded(manifest))||changed;
        }catch(error){errors.push(`${item.key}: ${error.message}`);}
      }
    }
    for(const item of desired)if(manifest.entries[item.key])Object.assign(manifest.entries[item.key],entryMetadata(item));
    manifest.entries=Object.fromEntries(desired.filter(item=>manifest.entries[item.key]).map(item=>[item.key,manifest.entries[item.key]]));
    manifest.processing=processing;
    manifest.voiceProcessing=voiceProcessing;
    manifest.effectsProcessing=effectsProcessing;
    manifest.musicProcessing=musicProcessing;
    changed=await put(manifestFile,encoded(manifest))||changed;
    if(errors.length)throw Error(errors.join('\n'));
    const checked=await checkBattleAudio(root,config);
    if(checked.problems.length)throw Error(checked.problems.join('\n'));
    // Retire only the known AAC predecessor after the WebM and manifest pass validation.
    for(const item of desired)for(const cue of manifest.entries[item.key].cueNames){
      try{await unlink(path.join(root,clipPath(item,cue).replace(/\.webm$/,'.m4a')));changed=true;}
      catch(error){if(error.code!=='ENOENT')throw error;}
    }
    return {planned,changed,entries:checked.entries,voices:checked.voices,clips:checked.clips};
  }finally{if(stage)await rm(stage,{recursive:true,force:true});}
}
