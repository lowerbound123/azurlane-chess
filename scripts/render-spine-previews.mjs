import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile,access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadAuthoringProfiles,safePath} from './runtime-assets.mjs';
import {spineFingerprint} from './spine-preview-manifest.mjs';

export async function previewExportPlan(root){
 const {profiles}=await loadAuthoringProfiles(root);
 let manifest={profiles:{}};
 try{manifest=JSON.parse(await readFile(path.join(root,'public/characters/previews/manifest.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
 const fingerprints={},pending=[];
 for(const [id,profile]of Object.entries(profiles)){
  if(!/^[a-z0-9_-]+$/i.test(id))throw new Error('角色 ID 必须适用于文件名');
  fingerprints[id]=await spineFingerprint(root,profile);
  const entry=manifest.profiles?.[id];let exists=false;
  if(entry&&safePath(entry.image)){try{await access(path.join(root,'public',entry.image));exists=true;}catch{}}
  if(!exists||entry.fingerprint!==fingerprints[id])pending.push(id);
 }
 return {profiles,manifest,fingerprints,pending};
}
export async function renderSpinePreviews(root=fileURLToPath(new URL('../',import.meta.url))){
 const plan=await previewExportPlan(root);
 if(!plan.pending.length){console.log('All Spine thumbnail profiles unchanged');return;}
 const address='http://127.0.0.1:4176';
 const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4176','--strictPort'],{cwd:root,stdio:'inherit'});
 let browser;
 try {
  for(let attempt=0;;attempt++) {
   try{const response=await fetch(address+'/tools/spine-previews.html');if(response.ok)break;}catch{}
   if(attempt===30||server.exitCode!==null)throw new Error('无法启动 Spine 缩略图导出服务');
   await new Promise(resolve=>setTimeout(resolve,100));
  }
  browser=await chromium.launch({headless:true,...(process.env.SPINE_BROWSER_EXECUTABLE?{executablePath:process.env.SPINE_BROWSER_EXECUTABLE}:{})});
  const page=await browser.newPage();await page.goto(address+'/tools/spine-previews.html?profiles='+encodeURIComponent(plan.pending.join(',')));
  const images=await page.evaluate(()=>window.spineSnapshots);
  if(Object.keys(images).length!==plan.pending.length||plan.pending.some(id=>!images[id]))throw new Error('Spine 缩略图导出结果不完整');
  const profiles=Object.fromEntries(Object.keys(plan.profiles).filter(id=>plan.manifest.profiles?.[id]).map(id=>[id,plan.manifest.profiles[id]]));
  await mkdir(path.join(root,'public/characters/previews'),{recursive:true});
  for(const id of plan.pending){
   const image=`characters/previews/${id}.webp`;
   await writeFile(path.join(root,'public',image),Buffer.from(images[id],'base64'));
   profiles[id]={image,fingerprint:plan.fingerprints[id]};
  }
  await writeFile(path.join(root,'public/characters/previews/manifest.json'),JSON.stringify({profiles},null,2)+'\n');
  console.log(`Exported ${plan.pending.length} changed Spine thumbnail profiles`);
 }finally{await browser?.close();server.kill('SIGTERM');}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await renderSpinePreviews();
