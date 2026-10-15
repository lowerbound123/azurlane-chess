import {test,expect,vi} from 'vitest';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {buildSyncPlan,syncAssets,runAssetSync,CACHE_CONTROL} from '../scripts/sync-assets.ts';
import type {AssetUploader} from '../scripts/asset-uploaders.ts';
import type {RuntimeAssetManifest} from '../shared/assets.ts';
const body=Buffer.from('fixed artwork'),record={path:'assets/runtime/test-123.webp',sha256:createHash('sha256').update(body).digest('hex'),bytes:body.length,contentType:'image/webp'};
const manifest={files:{one:record,alias:record}} as unknown as RuntimeAssetManifest;
const config={provider:'s3' as const,prefix:'release',bucket:'bucket',region:'us-east-1',urlTtlSeconds:3600,accessKeyId:'FAKE',secretAccessKey:'SECRET'};
const uploader=():AssetUploader=>({head:vi.fn(async()=>null),put:vi.fn(async()=>{}),close:vi.fn()});
async function fixture(){const root=await mkdtemp(path.join(tmpdir(),'sync-assets-'));await mkdir(path.join(root,'assets/runtime/files/assets/runtime'),{recursive:true});await writeFile(path.join(root,'assets/runtime/files',record.path),body);return root;}
test('plans unique manifest paths with the exact reading prefix, rejecting conflicts and traversal',()=>{
 const plan=buildSyncPlan('/repo',manifest,'release');expect(plan).toHaveLength(1);expect(plan[0]).toMatchObject({key:'release/'+record.path,file:'/repo/assets/runtime/files/'+record.path});
 expect(buildSyncPlan('/repo',manifest,'')[0].key).toBe(record.path);
 expect(buildSyncPlan('/repo',manifest,'release//v1')[0].key).toBe('release//v1/'+record.path);
 for(const invalid of [{files:{bad:{...record,path:'assets/runtime/../private'}}},{files:{one:record,alias:{...record,sha256:'a'.repeat(64)}}}])expect(()=>buildSyncPlan('/repo',invalid as unknown as RuntimeAssetManifest,'')).toThrow();
});
test('uploads missing or different objects with metadata and skips exactly matching objects',async()=>{
 const root=await fixture(),remote=uploader(),events:unknown[]=[];try{const plan=buildSyncPlan(root,manifest,'release');
 expect(await syncAssets(plan,remote,{log:e=>events.push(e)})).toMatchObject({uploaded:1,skipped:0,failed:0});
 expect(remote.put).toHaveBeenCalledWith(plan[0].key,body,{sha256:record.sha256,bytes:body.length,contentType:'image/webp',cacheControl:CACHE_CONTROL});
 vi.mocked(remote.head).mockResolvedValue({sha256:record.sha256,bytes:body.length,contentType:'image/webp',cacheControl:CACHE_CONTROL});
 expect(await syncAssets(plan,remote)).toMatchObject({uploaded:0,skipped:1,failed:0});expect(remote.put).toHaveBeenCalledTimes(1);
 vi.mocked(remote.head).mockResolvedValue({sha256:record.sha256,bytes:body.length,contentType:'application/octet-stream',cacheControl:CACHE_CONTROL});
 expect((await syncAssets(plan,remote)).uploaded).toBe(1);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('dry run does not create a client or make network requests, and local mode is a no-op',async()=>{
 const root=await fixture(),createUploader=vi.fn(async()=>uploader()),validate=vi.fn(async()=>manifest),logs:unknown[]=[];
 try{expect(await runAssetSync({root,config,dryRun:true,validate,createUploader,log:e=>logs.push(e)})).toMatchObject({planned:1,uploaded:0});expect(createUploader).not.toHaveBeenCalled();
 expect(await runAssetSync({root,config:{...config,provider:'local'},validate,createUploader,log:e=>logs.push(e)})).toMatchObject({planned:0,uploaded:0});expect(createUploader).not.toHaveBeenCalled();
 expect(JSON.stringify(logs)).not.toContain('SECRET');
 }finally{await rm(root,{recursive:true,force:true});}
});
test('validates before any cloud access and rejects files changed after validation',async()=>{
 const createUploader=vi.fn(async()=>uploader());await expect(runAssetSync({config,validate:async()=>{throw new Error('stale assets');},createUploader})).rejects.toThrow('stale assets');expect(createUploader).not.toHaveBeenCalled();
 const root=await fixture(),remote=uploader();try{await writeFile(path.join(root,'assets/runtime/files',record.path),'changed');expect((await syncAssets(buildSyncPlan(root,manifest,''),remote)).failed).toBe(1);expect(remote.put).not.toHaveBeenCalled();}finally{await rm(root,{recursive:true,force:true});}
});
test('HEAD failures never become uploads, failures are sanitized and other objects continue',async()=>{
 const root=await fixture(),remote=uploader(),events:unknown[]=[];try{const plan=buildSyncPlan(root,manifest,'');plan.push({...plan[0],key:'other'});
 vi.mocked(remote.head).mockImplementation(async key=>{if(key==='other')return null;throw Object.assign(new Error('SECRET signed-url'),{statusCode:403});});
 expect(await syncAssets(plan,remote,{log:e=>events.push(e)})).toMatchObject({uploaded:1,failed:1});expect(remote.put).toHaveBeenCalledTimes(1);expect(JSON.stringify(events)).not.toMatch(/SECRET|signed-url/);expect(JSON.stringify(events)).toContain('403');
 }finally{await rm(root,{recursive:true,force:true});}
});
test('bounds concurrent uploads and closes the SDK client after synchronization',async()=>{
 const root=await fixture(),remote=uploader();let active=0,peak=0;try{vi.mocked(remote.put).mockImplementation(async()=>{active++;peak=Math.max(peak,active);await new Promise(r=>setTimeout(r,5));active--;});
 const plan=Array.from({length:10},(_,i)=>({...buildSyncPlan(root,manifest,'')[0],key:String(i)}));expect((await syncAssets(plan,remote,{concurrency:3})).uploaded).toBe(10);expect(peak).toBe(3);
 await runAssetSync({root,config,validate:async()=>manifest,createUploader:async()=>remote});expect(remote.close).toHaveBeenCalledOnce();
 }finally{await rm(root,{recursive:true,force:true});}
});
