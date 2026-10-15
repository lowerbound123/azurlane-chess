import {test,expect} from 'vitest';
import {createServer} from 'node:http';
import type {AddressInfo} from 'node:net';
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import manifest from '../assets/runtime/manifest.json';
test('Node CLI validates and syncs the real manifest, skips the second run, and exits nonzero on failures',async()=>{
 const objects=new Map<string,{body:Buffer;headers:Record<string,string>}>(),methods:string[]=[];let forbidden=false;
 const server=createServer(async(req,res)=>{methods.push(req.method!);if(forbidden){res.writeHead(403);res.end();return;}
  const key=new URL(req.url!,'http://localhost').pathname;
  if(req.method==='PUT'){const chunks:Buffer[]=[];for await(const chunk of req)chunks.push(Buffer.from(chunk));objects.set(key,{body:Buffer.concat(chunks),headers:{'content-type':String(req.headers['content-type']),'cache-control':String(req.headers['cache-control']),'x-amz-meta-sha256':String(req.headers['x-amz-meta-sha256'])}});res.writeHead(200);res.end();return;}
  const obj=objects.get(key);if(obj){res.writeHead(200,{...obj.headers,'content-length':obj.body.length});res.end();}else{res.writeHead(404);res.end();}
 });
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const root=await mkdtemp(path.join(tmpdir(),'asset-sync-cli-')),file=path.join(root,'config.json');
 await writeFile(file,JSON.stringify({provider:'s3',bucket:'test-bucket',region:'us-east-1',prefix:'release',endpoint:`http://127.0.0.1:${(server.address() as AddressInfo).port}`,forcePathStyle:true}));
 const run=(args:string[])=>new Promise<{code:number|null;output:string}>((resolve,reject)=>{const child=spawn(process.execPath,['scripts/sync-assets.ts',...args],{env:{...process.env,ASSET_STORAGE_CONFIG:file,ASSET_ACCESS_KEY_ID:'FAKE_KEY',ASSET_SECRET_ACCESS_KEY:'FAKE_SECRET'}});let output='';child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>output+=x);child.on('error',reject);child.on('close',code=>resolve({code,output}));});
 try{
  const dry=await run(['--dry-run']);expect(dry.code).toBe(0);expect(methods).toHaveLength(0);expect(dry.output).toContain('待同步');
  const first=await run([]);expect(first.code).toBe(0);const count=new Set(Object.values(manifest.files).map(r=>r.path)).size;expect(objects.size).toBe(count);expect(methods.filter(m=>m==='PUT')).toHaveLength(count);
  const second=await run([]);expect(second.code).toBe(0);expect(second.output).toContain(`上传 0，跳过 ${count}`);expect(methods.filter(m=>m==='PUT')).toHaveLength(count);
  forbidden=true;const failed=await run([]);expect(failed.code).toBe(1);expect(failed.output).toContain('HTTP 403');expect(methods.filter(m=>m==='PUT')).toHaveLength(count);
  for(const result of [dry,first,second,failed])expect(result.output).not.toMatch(/FAKE_SECRET|FAKE_KEY|X-Amz-Signature/);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await rm(root,{recursive:true,force:true});}
});
