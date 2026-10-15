import {test,expect} from 'vitest';
import {createServer} from 'node:http';
import type {AddressInfo} from 'node:net';
import {createHash} from 'node:crypto';
import {createAssetUploader} from '../scripts/asset-uploaders.ts';
import {CACHE_CONTROL} from '../scripts/sync-assets.ts';
for(const provider of ['s3','oss','cos'] as const)test(`${provider} official SDK uploads bytes and metadata, reads them back and rejects non-404 failures`,async()=>{
 const body=Buffer.from('fixed artwork bytes'),metadata={sha256:createHash('sha256').update(body).digest('hex'),bytes:body.length,contentType:'image/webp',cacheControl:CACHE_CONTROL};
 let object:{body:Buffer;headers:Record<string,string>}|undefined,status=0;const methods:string[]=[],paths:string[]=[];
 const server=createServer(async(req,res)=>{
  methods.push(req.method!);paths.push(new URL(req.url!,'http://localhost').pathname);if(status){res.writeHead(status);res.end();return;}
  if(req.method==='PUT'){
   const chunks:Buffer[]=[];for await(const chunk of req)chunks.push(Buffer.from(chunk));
   const headerPrefix=provider==='s3'?'x-amz-meta-':provider==='oss'?'x-oss-meta-':'x-cos-meta-';
   object={body:Buffer.concat(chunks),headers:{'content-type':String(req.headers['content-type']),'cache-control':String(req.headers['cache-control']),[headerPrefix+'sha256']:String(req.headers[headerPrefix+'sha256'])}};
   res.writeHead(200,{'ETag':'"'+createHash('md5').update(object.body).digest('hex')+'"'});res.end();return;
  }
  if(req.method==='HEAD'&&object){res.writeHead(200,{...object.headers,'content-length':object.body.length});res.end();return;}
  res.writeHead(404);res.end();
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const uploader=await createAssetUploader({provider,bucket:provider==='cos'?'test-bucket-1250000000':'test-bucket',region:provider==='s3'?'us-east-1':provider==='oss'?'oss-cn-hangzhou':'ap-guangzhou',endpoint:`http://127.0.0.1:${(server.address() as AddressInfo).port}`,forcePathStyle:true,cname:provider==='oss',prefix:'release',urlTtlSeconds:3600,accessKeyId:'FAKE',secretAccessKey:'FAKE_SECRET'});
 try{
  const key='release/assets/runtime/test image.webp';expect(await uploader.head(key)).toBeNull();await uploader.put(key,body,metadata);expect(object!.body).toEqual(body);expect(await uploader.head(key)).toEqual(metadata);
  expect(paths.every(p=>p.endsWith('/release/assets/runtime/test%20image.webp'))).toBe(true);expect(methods).toEqual(['HEAD','PUT','HEAD']);
  status=403;await expect(uploader.head(key)).rejects.toBeDefined();expect(methods.at(-1)).toBe('HEAD');
 }finally{uploader.close();server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
