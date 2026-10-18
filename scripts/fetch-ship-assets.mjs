import {readFile,writeFile,mkdir,rm,mkdtemp,rename} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import sharp from 'sharp';
import {parseAtlas} from '../src/vendor/parse.mjs';
import {parseSkeleton} from '../src/vendor/parse.mjs';
import {stampPortrait,WATERMARK_TEXT,WATERMARK_FINGERPRINT} from './portrait-watermark.mjs';
import {activeIds,runPythonProvider} from './ship-assets-common.mjs';
import {planBattleAudio,syncBattleAudio,checkBattleAudio} from './fetch-battle-audio.mjs';
export {activeIds};
const project=fileURLToPath(new URL('../',import.meta.url));
const sha=data=>createHash('sha256').update(data).digest('hex');
const safe=name=>typeof name==='string'&&/^[a-zA-Z0-9_-]+$/.test(name);
const json=async file=>JSON.parse(await readFile(file,'utf8'));
async function maybeJSON(file,fallback){try{return await json(file);}catch(e){if(e.code==='ENOENT')return fallback;throw e;}}
async function put(file,bytes){await mkdir(path.dirname(file),{recursive:true});let current;try{current=await readFile(file);}catch(e){if(e.code!=='ENOENT')throw e;}const data=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);if(current?.equals(data))return false;const temporary=file+'.partial';await writeFile(temporary,data);await rename(temporary,file);return true;}
const encoded=data=>JSON.stringify(data,null,2)+'\n';
function validatePortraitCrop(crop){if(crop===undefined)return;if(!crop||typeof crop!=='object'||!['left','top','width','height'].every(k=>Number.isFinite(crop[k]))||crop.left<0||crop.top<0||crop.width<=0||crop.height<=0||crop.left+crop.width>1||crop.top+crop.height>1)throw Error('立绘裁剪必须是原图范围内的归一化矩形');}
export function validateConfig(cfg){
 if(cfg.version!==1||!['EN','CN','JP','KR','TW'].includes(cfg.client))throw Error('无效资源配置版本或客户端');
 if(!cfg.ships||!cfg.catalog||!cfg.historical||!cfg.templates)throw Error('缺少舰娘映射配置');
 if(new Set(Object.values(cfg.catalog)).size!==Object.keys(cfg.catalog).length)throw Error('普通选船槽位不能重复使用同一舰娘身份');
 for(const [id,ship]of Object.entries(cfg.ships)){if(!safe(id)||!safe(ship.assetName)||!['dd','cl','ca','bb','cv'].includes(ship.type)||typeof ship.name!=='string')throw Error(`无效舰娘配置: ${id}`);if(ship.paintingLayers&&(!Array.isArray(ship.paintingLayers)||ship.paintingLayers.some(name=>!safe(name))))throw Error(`无效基础立绘图层: ${id}`);for(const candidate of ship.fallbacks??[]){if(!cfg.ships[candidate]||cfg.ships[candidate].type!==ship.type)throw Error(`替补舰种不匹配: ${id}/${candidate}`);}}
 for(const id of activeIds(cfg))if(!cfg.ships[id])throw Error(`映射引用未知舰娘: ${id}`);
 for(const ship of Object.values(cfg.ships)){validatePortraitCrop(ship.portraitCrop);if(ship.characterOffset!==undefined&&(!Array.isArray(ship.characterOffset)||ship.characterOffset.length!==2||ship.characterOffset.some(v=>!Number.isFinite(v)||Math.abs(v)>2)))throw Error('角色配准偏移必须为两个有限坐标');}
 if(!Number.isInteger(cfg.portraits?.maxEdge)||cfg.portraits.maxEdge<128||cfg.portraits.maxEdge>1600||!Number.isInteger(cfg.portraits.avatar)||cfg.portraits.avatar<32||cfg.portraits.avatar>256||cfg.portraits.quality<1||cfg.portraits.quality>100)throw Error('无效WebP设置');
 if(cfg.portraits.watermark&&cfg.portraits.watermark.text!==WATERMARK_TEXT)throw Error('立绘水印文字必须为：'+WATERMARK_TEXT);
 if(cfg.audio!==undefined)planBattleAudio(cfg);
 return cfg;
}
export function componentFingerprint(cfg,id,kind){const {assetName,skinId,fallbackSources,paintingLayers,portraitCrop}=cfg.ships[id];return sha(encoded({assetName,skinId,client:cfg.client,source:fallbackSources?.[kind==='chibi'?'spine':'painting'],...(kind==='painting'?{portraits:cfg.portraits,watermark:WATERMARK_FINGERPRINT,paintingLayers,portraitCrop}:{runtimeVersion:'3.8'})}));}
export function processingFingerprint(cfg,id){return sha(encoded({painting:componentFingerprint(cfg,id,'painting'),chibi:componentFingerprint(cfg,id,'chibi')}));}
async function requiredComponents(root,cfg,entry,id){const damaged=await inspectFiles(root,entry,id);return ['painting','chibi'].filter(kind=>damaged.includes(kind)||entry?.componentHashes?.[kind]!==componentFingerprint(cfg,id,kind));}
async function inspectFiles(root,entry,id){const bad=[];if(!entry?.files||!entry.profile)return ['painting','chibi'];
 if(![entry.profile.skeleton,entry.profile.atlas].every(p=>typeof p==='string'&&p.startsWith(`characters/${id}/`)&&!p.includes('..')&&!p.includes('\\')))throw Error('锁定清单角色路径不合法');
 const expected={[`public/portraits/${id}.webp`]:'painting',[`public/portraits/${id}-avatar.webp`]:'painting',[`public/${entry.profile.skeleton}`]:'chibi',[`public/${entry.profile.atlas}`]:'chibi'};
 try{for(const page of readAtlasPages(await readFile(path.join(root,'public',entry.profile.atlas),'utf8')))expected[`public/${path.posix.join(path.posix.dirname(entry.profile.atlas),page)}`]='chibi';}catch{bad.push('chibi');}
 for(const [name,kind]of Object.entries(expected))if(!entry.files[name]||entry.files[name].kind!==kind)bad.push(kind);
for(const [name,f]of Object.entries(entry.files)){if(!name.startsWith('public/')||name.includes('..')||name.includes('\\'))throw Error('锁定清单包含非法路径');try{const data=await readFile(path.join(root,name));if(data.length!==f.bytes||sha(data)!==f.sha256)bad.push(f.kind);}catch(e){if(e.code!=='ENOENT')throw e;bad.push(f.kind);}}if(!Object.values(entry.files).some(f=>f.kind==='painting'))bad.push('painting');if(!Object.values(entry.files).some(f=>f.kind==='chibi'))bad.push('chibi');return ['painting','chibi'].filter(k=>bad.includes(k));}
export async function checkShipAssets(root=project){
 const cfg=validateConfig(await json(path.join(root,'config/ship-assets.json'))),lock=await maybeJSON(path.join(root,'assets/ship-assets.lock.json'),{version:1,ships:{}}),problems=[];
 for(const id of activeIds(cfg)){const e=lock.ships[id];if(e?.configHash!==processingFingerprint(cfg,id)||['painting','chibi'].some(kind=>e?.componentHashes?.[kind]!==componentFingerprint(cfg,id,kind)))problems.push(`${id}:配置或处理参数变化`);for(const kind of await inspectFiles(root,e,id))problems.push(`${id}:${kind}缺失或损坏`);}
 const generated=await maybeJSON(path.join(root,'src/characters/ships.generated.json'),null);
 if(!generated||JSON.stringify(generated)!==JSON.stringify(buildManifest(cfg,lock)))problems.push('舰娘映射清单缺失或过期');
 const audio=await checkBattleAudio(root,cfg);problems.push(...audio.problems);
 return {problems,ships:activeIds(cfg).length,lock,audio};
}
function buildManifest(cfg,lock){
 const profiles={},identities={};
 for(const id of activeIds(cfg)){const e=lock.ships[id];if(!e?.profile)continue;const adjustment=cfg.ships[id].characterOffset;profiles[id]=adjustment?{...e.profile,offset:(e.profile.offset??[0,0]).map((v,i)=>Number((v+adjustment[i]).toFixed(6)))}:e.profile;identities[id]={name:cfg.ships[id].name,avatar:`portraits/${id}-avatar.webp`,portrait:`portraits/${id}.webp`};}
 return {profiles,catalog:cfg.catalog,historical:cfg.historical,templates:cfg.templates,identities};
}
function readAtlasPages(atlasText){let atlas;try{atlas=parseAtlas(atlasText);}catch(e){throw Error('无效atlas图集: '+e.message);}const pages=atlas.pages.map(p=>p.name);if(!pages.length||pages.some(p=>path.posix.basename(p)!==p||p.includes('\\')||p==='.'||p==='..'))throw Error('atlas图集路径不合法');return pages;}
export async function prepareChibi(id,files,assetName=id){
 const names=Object.keys(files),skeletons=names.filter(n=>/\.(skel|json)$/.test(n));
 const matched=skeletons.filter(n=>n.replace(/\.(skel|json)$/,'').toLowerCase()===assetName.toLowerCase());
 const skeleton=matched.find(n=>n.endsWith('.skel'))||matched[0]||(skeletons.length===1?skeletons[0]:undefined);
 const atlases=names.filter(n=>n.endsWith('.atlas')),stem=skeleton?.replace(/\.(skel|json)$/,'').toLowerCase();
 const atlasName=atlases.find(n=>n.slice(0,-6).toLowerCase()===stem)||(atlases.length===1?atlases[0]:undefined);
 if(!skeleton||!atlasName)throw Error(`${id}:缺少骨骼或atlas图集`);
 const atlasText=Buffer.from(files[atlasName]).toString('utf8'),pages=readAtlasPages(atlasText),dimensions={},output={},renames={};
 for(const [index,page]of pages.entries()){if(!files[page])throw Error(`${id}:缺少atlas图集页 ${page}`);const {data,info}=await sharp(files[page]).webp({lossless:true,effort:5}).toBuffer({resolveWithObject:true});renames[page]=`page-${index}.webp`;dimensions[page]={width:info.width,height:info.height};output[`public/characters/${id}/${renames[page]}`]=data;}
 const raw=Buffer.from(files[skeleton]);
 const {data,core,runtimeVersion}=parseSkeleton(raw,atlasText,dimensions,skeleton.endsWith('.json')?'json':'binary');
 const actor=new core.Skeleton(data),state=new core.AnimationState(new core.AnimationStateData(data));
 const idleName=['normal','idle','Idle','stand'].find(name=>data.findAnimation(name));if(!idleName)throw Error(`${id}:缺少可用待机动画`);
 state.setAnimation(0,idleName,true);state.update(.15);state.apply(actor);actor.updateWorldTransform();const origin=new core.Vector2(),size=new core.Vector2();actor.getBounds(origin,size,[]);const bounds={x:origin.x,y:origin.y,width:size.x,height:size.y};
 const animations=data.animations.map(a=>a.name),find=(list)=>list.find(n=>animations.includes(n));const idle=find(['normal','idle','Idle','stand']);if(!idle||!Number.isFinite(bounds.height)||bounds.height<=0)throw Error(`${id}:无法播放待机或角色边界无效`);
 const scale=Number((1.55/Math.max(bounds.height,bounds.width*.8)).toPrecision(7)),offset=[Number((-(bounds.x+bounds.width/2)*scale).toFixed(6)),Number((-bounds.y*scale).toFixed(6))];
 const ext=skeleton.endsWith('.json')?'json':'skel';output[`public/characters/${id}/${id}.${ext}`]=raw;
 output[`public/characters/${id}/${id}.atlas`]=Buffer.from(atlasText.split(/\r?\n/).map(line=>renames[line.trim()]||line).join('\n'));
 const pick=list=>find(list)||idle;
 const profile={runtimeVersion,skeleton:`characters/${id}/${id}.${ext}`,atlas:`characters/${id}/${id}.atlas`,format:ext==='json'?'json':'binary',scale,offset,labelHeight:1.95,animations:{idle,move:pick(['move','walk','run']),fire:pick(['attack','attack1','Attack_Gun']),torpedo:pick(['attack','attack1','Attack_Torpedo']),hit:pick(['damage','hit','Damage']),aircraft:pick(['attack','skill','Launch']),sweep:pick(['attack','attack1'])}};
 return {output,profile,animations,version:data.version};
}
export async function preparePainting(id,bytes,settings,crop){
 validatePortraitCrop(crop);let painting=sharp(bytes).rotate();
 if(crop){const oriented=await painting.png().toBuffer({resolveWithObject:true}),{width,height}=oriented.info;const left=Math.floor(crop.left*width),top=Math.floor(crop.top*height),right=Math.min(width,Math.round((crop.left+crop.width)*width)),bottom=Math.min(height,Math.round((crop.top+crop.height)*height));painting=sharp(oriented.data).extract({left,top,width:Math.max(1,right-left),height:Math.max(1,bottom-top)});}
 const base=await painting.resize({width:settings.maxEdge,height:settings.maxEdge,fit:'inside',withoutEnlargement:true}).png().toBuffer();
 // Crop the unmarked source so watermark pixels never affect the avatar framing.
 const avatarBase=await sharp(base).trim({threshold:5}).resize({width:settings.avatar,height:settings.avatar,fit:'inside',withoutEnlargement:true}).png().toBuffer();
 const [portrait,avatar]=await Promise.all([stampPortrait(base,settings.quality),stampPortrait(avatarBase,settings.quality)]);
 return {[`public/portraits/${id}.webp`]:portrait,[`public/portraits/${id}-avatar.webp`]:avatar};
}
async function run(command,args,options={}){return new Promise((resolve,reject)=>{const child=spawn(command,args,{cwd:project,...options});let stdout='';child.stdout?.on('data',b=>{stdout+=b;});child.stderr?.on('data',b=>process.stderr.write(b));child.on('error',reject);child.on('close',code=>code===0?resolve(stdout):reject(Error(`${command} 退出码 ${code}`)));});}
async function officialResults(root,requests,temp){
 const reportOverride=process.env.SHIP_ASSETS_PROVIDER_REPORT;
 if(reportOverride){return json(reportOverride);}
 return runPythonProvider({root,script:'cdn.py',request:{client:requests.client,ships:requests.ships},output:path.join(temp,'official')});
}
async function remote(url){for(let attempt=0;;attempt++){try{const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(response.status===404)return null;if(!response.ok)throw Error(`HTTP ${response.status}: ${url}`);return Buffer.from(await response.arrayBuffer());}catch(e){if(attempt===2)throw e;}}}
async function fallbackComponent(ship,kind){const source=ship.fallbackSources?.[kind==='chibi'?'spine':'painting'];if(!source)return null;if(!/^[a-f0-9]{40}$/.test(source.revision)||!/^[-\w]+\/[-\w.]+$/.test(source.repository))throw Error('公开仓库源必须固定完整提交');const base=`https://raw.githubusercontent.com/${source.repository}/${source.revision}/`;
 if(kind==='painting'){const painting=await remote(base+source.path);return painting?{files:{painting},source:{provider:'github',...source}}:null;}
 const stem=ship.assetName.toLowerCase(),skeleton=await remote(base+source.directory+'/'+stem+'.skel');if(!skeleton)return null;const atlas=await remote(base+source.directory+'/'+stem+'.atlas');if(!atlas)return null;const files={[stem+'.skel']:skeleton,[stem+'.atlas']:atlas};for(const page of readAtlasPages(atlas.toString('utf8'))){const bytes=await remote(base+source.directory+'/'+page);if(!bytes)return null;files[page]=bytes;}return {files:{chibi:files},source:{provider:'github',...source}};
}
async function providerResult(ship,needs,result,report){const files={},sources={},errors=[];
 if(result){if(result.files?.painting&&needs.includes('painting')){files.painting=await readFile(result.files.painting);sources.painting={provider:'official-cdn',...report.source,assets:result.assets,...(result.composition?{composition:result.composition}:{})};}if(result.files?.chibi&&needs.includes('chibi')){files.chibi=Object.fromEntries(await Promise.all(result.files.chibi.map(async f=>[f.name,await readFile(f.path)])));sources.chibi={provider:'official-cdn',...report.source,assets:result.assets};}if(result.status==='error')errors.push(result.reason||JSON.stringify(result.assets||report.errors));}
 if(errors.length)return {status:'error',reason:errors.join(';'),files,source:sources};
 for(const kind of needs)if(!files[kind]){const backup=await fallbackComponent(ship,kind);if(backup){files[kind]=backup.files[kind];sources[kind]=backup.source;}}
 if(needs.every(k=>files[k]))return {status:'available',files,source:sources};
 return {status:errors.length?'error':'missing',reason:errors.join(';')||'官方及公开仓库均缺少基础资源',files,source:sources};
}
export async function syncShipAssets({root=project,resolveSource,resolveAudioSource,dryRun=false,regenerate=true}={}){
 const cfg=validateConfig(await json(path.join(root,'config/ship-assets.json'))),lock=await maybeJSON(path.join(root,'assets/ship-assets.lock.json'),{version:1,ships:{}}),needed=[];
 for(const id of activeIds(cfg)){const needs=await requiredComponents(root,cfg,lock.ships[id],id);if(needs.length)needed.push({id,assetName:cfg.ships[id].assetName,needs});}
 const planned=needed.map(s=>({id:s.id,needs:s.needs}));
 if(dryRun)return {planned,changed:false,...(cfg.audio?{audio:await syncBattleAudio({root,config:cfg,dryRun:true})}:{})};
 await mkdir(path.join(root,'.generated'),{recursive:true});const temp=await mkdtemp(path.join(root,'.generated/ship-assets-stage-'));
 let changed=false;
 try{
  const report=resolveSource?null:(needed.length?await officialResults(root,{client:cfg.client,ships:needed},temp):null);
  const get=resolveSource||(async(ship,needs)=>{let sourceReport=report,entry=report.ships.find(s=>s.id===ship.id);if(!entry){sourceReport=await officialResults(root,{client:cfg.client,ships:[{id:ship.id,assetName:ship.assetName,needs}]},temp);entry=sourceReport.ships.find(s=>s.id===ship.id);}return providerResult(ship,needs,entry,sourceReport);});
  for(const request of needed){if(!activeIds(cfg).includes(request.id))continue;let id=request.id,ship={id,...cfg.ships[id]};if(!(await requiredComponents(root,cfg,lock.ships[id],id)).length)continue;let result=await get(ship,request.needs);
   if(result.status==='error')throw Error(`${id}: ${result.reason||'下载失败'}`);
   if(result.status==='missing'){
    let selected;
    const catalogIdentity=Object.values(cfg.catalog).includes(id),reserved=new Set(Object.values(cfg.catalog).filter(v=>v!==id));
    for(const candidate of ship.fallbacks??[]){if(catalogIdentity&&reserved.has(candidate))continue;const other={id:candidate,...cfg.ships[candidate]};if(!(await requiredComponents(root,cfg,lock.ships[candidate],candidate)).length){selected={other,existing:true};break;}const attempt=await get(other,['painting','chibi']);if(attempt.status==='error')throw Error(`${id}替补 ${candidate}: ${attempt.reason}`);if(attempt.status==='available'){selected={other,attempt};break;}}
    if(!selected)throw Error(`${id}: 无完整可用基础资源或同舰种替补`);
    for(const group of [cfg.catalog,...Object.values(cfg.historical),cfg.templates])for(const key of Object.keys(group))if(group[key]===id)group[key]=selected.other.id;
    cfg.replacements??={};cfg.replacements[id]={ship:selected.other.id,reason:result.reason||'missing'};if(selected.existing)continue;id=selected.other.id;ship=selected.other;result=selected.attempt;request.needs=['painting','chibi'];
   }
   const previous=lock.ships[id]||{files:{},sources:{}},output={};let profile=previous.profile,animations=previous.animations,version=previous.version;
   if(request.needs.includes('painting'))Object.assign(output,await preparePainting(id,result.files.painting,cfg.portraits,ship.portraitCrop));
   if(request.needs.includes('chibi')){const chibi=await prepareChibi(id,result.files.chibi,ship.assetName);Object.assign(output,chibi.output);({profile,animations,version}=chibi);}
   // Validate every output before any file of this identity is replaced.
   for(const [name,bytes]of Object.entries(output))await put(path.join(temp,name),bytes);
   const files=Object.fromEntries(Object.entries(previous.files).filter(([,f])=>!request.needs.includes(f.kind)));
   for(const [name,bytes]of Object.entries(output)){changed=await put(path.join(root,name),bytes)||changed;files[name]={kind:name.startsWith('public/portraits/')?'painting':'chibi',sha256:sha(bytes),bytes:bytes.length};}
   const sources={...previous.sources};for(const kind of request.needs)sources[kind]=result.source?.[kind]??result.source;
   lock.ships[id]={configHash:processingFingerprint(cfg,id),componentHashes:{painting:componentFingerprint(cfg,id,'painting'),chibi:componentFingerprint(cfg,id,'chibi')},name:ship.name,assetName:ship.assetName,profile,animations,version,sources,files};
   changed=await put(path.join(root,'assets/ship-assets.lock.json'),encoded(lock))||changed;
   console.log(`${id}: ${request.needs.join('+')} 已验证`);
  }
  for(const id of activeIds(cfg))if(lock.ships[id]){lock.ships[id].name=cfg.ships[id].name;if(!(await requiredComponents(root,cfg,lock.ships[id],id)).length)lock.ships[id].configHash=processingFingerprint(cfg,id);}
  const wanted=new Set(activeIds(cfg));lock.ships=Object.fromEntries(Object.entries(lock.ships).filter(([id])=>wanted.has(id)).sort(([a],[b])=>a.localeCompare(b)));
  changed=await put(path.join(root,'config/ship-assets.json'),encoded(cfg))||changed;
  changed=await put(path.join(root,'assets/ship-assets.lock.json'),encoded(lock))||changed;
  changed=await put(path.join(root,'src/characters/ships.generated.json'),encoded(buildManifest(cfg,lock)))||changed;
  const audio=cfg.audio?await syncBattleAudio({root,config:cfg,resolveSource:resolveAudioSource}):null;
  changed=audio?.changed||changed;
  const checked=await checkShipAssets(root);if(checked.problems.length)throw Error(checked.problems.join('\n'));
  if(regenerate){let valid=false;try{const {validateRuntime}=await import('./runtime-assets.mjs');await validateRuntime(root);valid=true;}catch{}if(!valid){await run(process.execPath,[path.join(root,'scripts/render-spine-previews.mjs')],{stdio:'inherit'});await run(process.execPath,[path.join(root,'scripts/generate-assets.mjs')],{stdio:'inherit'});}}
  return {planned,changed,ships:checked.ships,...(audio?{audio}:{})};
 }finally{await rm(temp,{recursive:true,force:true});}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const audioOnly=process.argv.includes('--audio-only');if(process.argv.includes('--check')){const result=audioOnly?await checkBattleAudio():await checkShipAssets();if(result.problems.length)throw Error(result.problems.join('\n'));console.log(audioOnly?`全部 ${result.entries} 组战斗音频通过离线校验`:`全部 ${result.ships} 套舰娘资源、${result.audio.entries} 组战斗音频通过离线校验`);}else{const options={dryRun:process.argv.includes('--dry-run'),regenerate:!process.argv.includes('--no-generate')};const result=audioOnly?await syncBattleAudio(options):await syncShipAssets(options);console.log(encoded(result));}}catch(e){console.error(e.stack||e.message);process.exitCode=1;}
}
