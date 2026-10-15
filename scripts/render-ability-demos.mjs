#!/usr/bin/env node
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {existsSync} from 'node:fs';
import {mkdir,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {installArtifact,createCancellation} from './ability-demo-io.mjs';
import {digest} from './ability-demo-manifest.mjs';
import {artifactRecord,isArtifactCurrent,sourceFingerprint} from './ability-demo-manifest.mjs';
import {ABILITY_DEMO_SHIP_IDS} from '../shared/ability-demo.ts';
import {registerAbilityDemos,validateAbilityDemoOutputs,validatePublishedAbilityDemos} from './ability-demo-assets.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),output=path.join(root,'assets/ability-demos'),ids=[...ABILITY_DEMO_SHIP_IDS];
const args=process.argv.slice(2);let selected=ids,force=false,check=false,verifyOnly=false;
function usage(){console.log('npm run demos:render -- [--all | --ship 舰船ID] [--force] [--check | --verify-only]\n默认生成十五舰演示。--check 仅校验源指纹与产物完整性，不启动浏览器。\n依赖：FFmpeg (libvpx-vp9 / libx264)、ffprobe、Chrome 或 Playwright Chromium。\n可用环境变量：DEMO_BROWSER_EXECUTABLE、FFMPEG、FFPROBE。');}
for(let i=0;i<args.length;i++){const arg=args[i];if(arg==='--ship'){const id=args[++i];if(!ids.includes(id))throw new Error(`无效舰船 ${id}；可选 ${ids.join(', ')}`);selected=[id];}else if(arg==='--force')force=true;else if(arg==='--check')check=true;else if(arg==='--verify-only')verifyOnly=true;else if(arg==='--all')selected=ids;else if(arg==='--help'||arg==='-h'){usage();process.exit(0);}else throw new Error(`未知参数：${arg}`);}
async function deadline(promise,label,ms=30000){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(`${label} 超过 ${ms/1000} 秒`)),ms);})]);}finally{clearTimeout(timer);}}
const ffmpeg=process.env.FFMPEG??'ffmpeg',ffprobe=process.env.FFPROBE??'ffprobe';
function processJob(binary,argv,stdio=['ignore','pipe','pipe']){
 const child=spawn(binary,argv,{cwd:root,stdio});let log='';child.stdout?.on('data',v=>{log=(log+v).slice(-24000);});child.stderr?.on('data',v=>{log=(log+v).slice(-24000);});
 const done=new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',code=>code===0?resolve(log):reject(new Error(`${binary} 退出 ${code}\n${log}`)));});done.catch(()=>{});return {child,done};
}
async function probe(file){const data=JSON.parse(await processJob(ffprobe,['-v','error','-count_frames','-show_streams','-show_format','-of','json',file]).done);const v=data.streams.find(s=>s.codec_type==='video');return {codec:v?.codec_name,width:v?.width,height:v?.height,fps:v?.avg_frame_rate,frames:Number(v?.nb_read_frames),duration:Number(data.format.duration),audio:data.streams.some(s=>s.codec_type==='audio'),bytes:Number(data.format.size)};}
async function verifySampling(page,id,info){
 const target=id==='dd-3'?240:id==='cv-2'?120:170,later=target+60;
 const capture=async index=>{await page.evaluate(index=>window.abilityDemo.seekFrame(index),index);const png=await page.screenshot({clip:{x:0,y:150,width:info.width,height:676},animations:'allow'});return {png,hash:digest(png)};};
 await page.evaluate(id=>window.abilityDemo.load(id),id);const direct=await capture(target);await capture(later);const backwards=await capture(target),repeat=await capture(target);
 if(direct.hash!==backwards.hash||direct.hash!==repeat.hash){for(const [name,image]of Object.entries({direct,backwards,repeat}))await writeFile(path.join(tmpdir(),`ability-demo-${id}-${name}.png`),image.png);throw new Error(`${id} 同帧采样不一致：直接跳转 / 回退 / 重复采样（诊断帧已写入系统临时目录）`);}
 await page.evaluate(id=>window.abilityDemo.load(id),id);for(let i=0;i<target;i++)await page.evaluate(i=>window.abilityDemo.seekFrame(i),i);const sequential=await capture(target);
 if(direct.hash!==sequential.hash)throw new Error(`${id} 同帧采样不一致：直接跳转 / 顺序播放`);
 console.log(`采样一致 ${id}：直接 / 回退 / 重复 / 顺序`);await page.evaluate(id=>window.abilityDemo.load(id),id);
}
async function main(){
 let manifest;try{manifest=JSON.parse(await readFile(path.join(output,'manifest.json'),'utf8'));}catch{manifest={schema:1,clips:{}};}
 const fingerprint=await sourceFingerprint(root),pending=[];
 for(const id of selected){const valid=await isArtifactCurrent(path.join(output,id),manifest.clips[id],fingerprint);if(check){console.log(`${valid?'OK':'STALE'} ${id}`);if(!valid)process.exitCode=1;}else if(valid&&!force&&!verifyOnly)console.log(`跳过 ${id}：源文件和产物均未变化`);else pending.push(id);}
 if(check){if(!process.exitCode&&selected.length===ids.length){await validateAbilityDemoOutputs(root);await validatePublishedAbilityDemos(root,JSON.parse(await readFile(path.join(root,'assets/runtime/manifest.json'),'utf8')));}return;}if(!pending.length){if(ids.every(id=>manifest.clips[id]?.fingerprint===fingerprint)){await registerAbilityDemos(root);await (await import('./prepare-assets.mjs')).prepareAssets(root);}return;}
 const encoders=await processJob(ffmpeg,['-hide_banner','-encoders']).done;if(!encoders.includes('libvpx-vp9')||!encoders.includes('libx264'))throw new Error('FFmpeg 需要 libvpx-vp9 和 libx264 编码器');await processJob(ffprobe,['-version']).done;
 const {chromium}=await import('playwright');const executable=process.env.DEMO_BROWSER_EXECUTABLE??[chromium.executablePath(),'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p=>existsSync(p));if(!executable)throw new Error('未找到 Chrome/Chromium；请设置 DEMO_BROWSER_EXECUTABLE');
 const {prepareAssets}=await import('./prepare-assets.mjs');await prepareAssets(root,{abilityDemos:false});
 const {createServer}=await import('vite'),sharp=(await import('sharp')).default;
 await mkdir(output,{recursive:true});
 let server,browser;const temp=await mkdtemp(path.join(output,'.render-'));const jobs=new Set();
 const cancellation=createCancellation();
 const stop=()=>{for(const job of jobs)job.child.kill('SIGTERM');};
 const abort=()=>{cancellation.cancel();stop();void browser?.close().catch(()=>{});};process.once('SIGINT',abort);process.once('SIGTERM',abort);
 try{
  const signalHandlers=new Set(process.listeners('SIGTERM')),stdinHandlers=new Set(process.stdin.listeners('end'));
  server=await createServer({root,cacheDir:path.join(temp,'vite-cache'),optimizeDeps:{entries:['tools/ship-ability-demos.html']},server:{host:'127.0.0.1',port:4189,strictPort:true,watch:null},logLevel:'warn'});for(const listener of process.listeners('SIGTERM'))if(!signalHandlers.has(listener))process.removeListener('SIGTERM',listener);
  for(const listener of process.stdin.listeners('end'))if(!stdinHandlers.has(listener))process.stdin.removeListener('end',listener);
  await server.listen();const address=server.httpServer.address();
  browser=await chromium.launch({headless:true,handleSIGINT:false,handleSIGTERM:false,handleSIGHUP:false,executablePath:executable,args:[...(process.env.DEMO_SOFTWARE_RENDERING==='1'?['--use-angle=swiftshader']:[]),'--enable-webgl','--disable-background-timer-throttling']});
  cancellation.check();
  const page=await browser.newPage({viewport:{width:1100,height:1000},deviceScaleFactor:1});let failures=[];
  page.on('pageerror',e=>failures.push(e.message));page.on('console',message=>{if(message.type()==='error')failures.push(message.text());});page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${new URL(r.url()).pathname}`);});
  await page.route('**/api/config',route=>route.fulfill({json:{assetStorage:{provider:'local'}}}));
  await page.goto(`http://127.0.0.1:${address.port}/tools/ship-ability-demos.html?ship=${pending[0]}`);await page.waitForFunction(()=>document.documentElement.dataset.ready==='true'||document.documentElement.dataset.error,{timeout:90000});
  const error=await page.evaluate(()=>document.documentElement.dataset.error);if(error)throw new Error(error);if(failures.length)throw new Error(failures.join('\n'));
  if(!page.url().includes('/tools/ship-ability-demos.html')||!await page.title())throw new Error('录制工作台页面身份不符');
  for(const id of pending){
   cancellation.check();failures=[];const info=await page.evaluate(id=>window.abilityDemo.load(id),id),frames=info.duration*info.fps,dir=path.join(temp,id);await mkdir(dir);
   await verifySampling(page,id,info);cancellation.check();if(verifyOnly)continue;
   const webm=path.join(dir,'demo.webm'),mp4=path.join(dir,'demo.mp4');
   const job=processJob(ffmpeg,['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate',String(info.fps),'-vcodec','png','-i','pipe:0','-map','0:v','-an','-c:v','libvpx-vp9','-crf','36','-b:v','0','-row-mt','1','-deadline','good','-cpu-used','4','-pix_fmt','yuv420p',webm,'-map','0:v','-an','-c:v','libx264','-preset','medium','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',mp4],['pipe','pipe','pipe']);jobs.add(job);
   job.child.stdin.on('error',()=>{});const keyframes=[0,Math.round(info.posterTime*info.fps),Math.round(frames*.72),frames-1],images=[];
   console.log(`录制 ${id} ${info.width}×${info.height} ${info.fps}fps / ${frames} 帧`);
   for(let i=0;i<frames;i++){
    cancellation.check();await deadline(page.evaluate(index=>window.abilityDemo.seekFrame(index),i),`${id} 帧 ${i} 渲染`);
    const png=await page.screenshot({clip:{x:0,y:0,width:info.width,height:info.height},animations:'allow',timeout:30000});
    if(keyframes.includes(i))images.push({index:i,png});
    if(job.child.exitCode!==null)await job.done;
    if(!job.child.stdin.write(png))await deadline(Promise.race([once(job.child.stdin,'drain'),job.done.then(()=>{throw new Error('编码器提前结束');})]),`${id} 帧 ${i} 编码输入`);
    if((i+1)%90===0||i===frames-1)console.log(`  ${id} ${i+1}/${frames}`);
   }
   job.child.stdin.end();await deadline(job.done,`${id} 编码收尾`,60000);jobs.delete(job);
   if(failures.length)throw new Error(`浏览器加载或渲染错误：${failures.join('\n')}`);
   const poster=images.find(x=>x.index===keyframes[1]);await sharp(poster.png).webp({quality:88}).toFile(path.join(dir,'poster.webp'));
   const tiles=await Promise.all(keyframes.map(async(index,i)=>({input:await sharp(images.find(x=>x.index===index).png).resize(384,480).png().toBuffer(),left:(i%2)*384,top:Math.floor(i/2)*480})));
   await sharp({create:{width:768,height:960,channels:3,background:'#071724'}}).composite(tiles).webp({quality:88}).toFile(path.join(dir,'contact.webp'));
   const formats={webm:await probe(webm),mp4:await probe(mp4)};
   for(const [format,p]of Object.entries(formats))if(p.width!==768||p.height!==960||p.frames!==frames||p.fps!=='30/1'||p.audio||Math.abs(p.duration-info.duration)>.05||p.codec!==(format==='webm'?'vp9':'h264'))throw new Error(`视频规格不符：${id} ${format} ${JSON.stringify(p)}`);
   const evidence=await page.evaluate(()=>window.abilityDemo.evidence());await writeFile(path.join(dir,'evidence.json'),JSON.stringify({...evidence,export:{fingerprint,formats,keyframes:keyframes.map(index=>({frame:index,time:index/info.fps}))}},null,2)+'\n');
   const record=await artifactRecord(dir,fingerprint);await mkdir(output,{recursive:true});cancellation.check();const nextManifest={...manifest,clips:{...manifest.clips,[id]:{...info,...record,formats}}};
   await installArtifact(dir,path.join(output,id),path.join(output,'manifest.json'),nextManifest);manifest=nextManifest;
   console.log(`完成 ${id}：WebM ${(formats.webm.bytes/1048576).toFixed(2)} MiB / MP4 ${(formats.mp4.bytes/1048576).toFixed(2)} MiB`);
  }
  if(await sourceFingerprint(root)!==fingerprint)throw new Error('录制期间源文件发生变化；产物已保留，请重新运行以更新指纹');
  if(!verifyOnly&&ids.every(id=>manifest.clips[id]?.fingerprint===fingerprint)){await registerAbilityDemos(root);await prepareAssets(root);console.log('十五舰演示已登记至固定资产清单');}
 }finally{stop();process.removeListener('SIGINT',abort);process.removeListener('SIGTERM',abort);await Promise.allSettled([...jobs].map(job=>job.done));await browser?.close();await server?.close();await rm(temp,{recursive:true,force:true});}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
