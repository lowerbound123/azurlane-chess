import {test,expect} from 'vitest';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createApp} from '../server/app.ts';
import {GameService} from '../server/game-service.ts';

test('published video files retain media MIME and support byte ranges without login',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'ability-demo-http-'));
 let app:Awaited<ReturnType<typeof createApp>>|undefined;
 try{
  await mkdir(path.join(root,'assets/runtime'),{recursive:true});
  await writeFile(path.join(root,'index.html'),'<!doctype html><title>media fixture</title>');
  await writeFile(path.join(root,'assets/runtime-manifest.json'),JSON.stringify({version:1,files:{},images:{},spine:{},spinePreviews:{},models:{},sources:{},spineFingerprints:{}}));
  const data=Buffer.from(Array.from({length:64},(_,i)=>i));
  for(const ext of ['webm','mp4'])await writeFile(path.join(root,`assets/runtime/ability-dd-1-demo-0123456789abcdef.${ext}`),data);
  const service=new GameService({autoTick:false,models:[],pool:{close:async()=>{},resolve:async()=>{throw new Error('unused calculation');}}});
  app=await createApp({service,models:[],staticRoot:root,authEnabled:false,allowedOrigins:['http://another-public-site.test']});
  for(const ext of ['webm','mp4']){
   const url=`/assets/runtime/ability-dd-1-demo-0123456789abcdef.${ext}`;
   const head=await app.inject({method:'HEAD',url});expect(head.statusCode).toBe(200);expect(head.headers['content-type']).toBe(`video/${ext}`);expect(head.headers['content-length']).toBe('64');expect(head.headers['cache-control']).toContain('immutable');
   const range=await app.inject({url,headers:{range:'bytes=16-31',origin:'http://another-public-site.test'}});expect(range.statusCode).toBe(206);expect(range.headers['content-type']).toBe(`video/${ext}`);expect(range.headers['content-range']).toBe('bytes 16-31/64');expect(range.rawPayload).toEqual(data.subarray(16,32));expect(range.headers['access-control-allow-origin']).toBe('*');expect(range.headers['access-control-allow-credentials']).toBeUndefined();
   expect((await app.inject({url,headers:{range:'bytes=100-110'}})).statusCode).toBe(416);
  }
 }finally{await app?.close();await rm(root,{recursive:true,force:true});}
});
