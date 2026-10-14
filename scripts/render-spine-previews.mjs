import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {characterConfig} from '../src/characters/config.ts';
import {spineFingerprint} from './spine-preview-manifest.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),address='http://127.0.0.1:4176';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4176','--strictPort'],{cwd:root,stdio:'inherit'});
let browser;
try {
  for(let attempt=0;;attempt++) {
    try{const response=await fetch(address+'/tools/spine-previews.html');if(response.ok)break;}catch{}
    if(attempt===30||server.exitCode!==null)throw new Error('无法启动 Spine 缩略图导出服务');
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  browser=await chromium.launch({headless:true,...(process.env.SPINE_BROWSER_EXECUTABLE?{executablePath:process.env.SPINE_BROWSER_EXECUTABLE}:{})});
  const page=await browser.newPage();await page.goto(address+'/tools/spine-previews.html');
  const images=await page.evaluate(()=>window.spineSnapshots),profiles={};
  await mkdir(new URL('../public/characters/previews/',import.meta.url),{recursive:true});
  for(const [id,base64] of Object.entries(images)) {
    if(!/^[a-z0-9_-]+$/i.test(id))throw new Error('角色 ID 必须适用于文件名');
    const image=`characters/previews/${id}.webp`;
    await writeFile(new URL('../public/'+image,import.meta.url),Buffer.from(base64,'base64'));
    profiles[id]={image,fingerprint:await spineFingerprint(root,characterConfig.profiles[id])};
  }
  await writeFile(new URL('../public/characters/previews/manifest.json',import.meta.url),JSON.stringify({profiles},null,2)+'\n');
  console.log(`Exported ${Object.keys(profiles).length} Spine thumbnail profiles`);
}finally{await browser?.close();server.kill('SIGTERM');}
