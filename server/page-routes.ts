import type {FastifyInstance} from 'fastify';
import staticFiles from '@fastify/static';
import path from 'node:path';
import {existsSync} from 'node:fs';
export async function registerPageRoutes(app:FastifyInstance,staticRoot:string){
  if(existsSync(path.join(staticRoot,'index.html'))){await app.register(staticFiles,{root:staticRoot,cacheControl:false,setHeaders(res,file){
    // Public files have identical bytes for every origin. API CORS stays separate.
    res.header('Access-Control-Allow-Origin','*');res.removeHeader('Access-Control-Allow-Credentials');
    const vary=String(res.getHeader('Vary')??'').split(',').map(value=>value.trim()).filter(value=>value&&value.toLowerCase()!=='origin');
    if(vary.length)res.header('Vary',vary.join(', '));else res.removeHeader('Vary');
    const relative=path.relative(staticRoot,file).split(path.sep).join('/');
    // Only content-addressed build assets are safe to keep across deployments.
    const hashed=/^assets\/(?:.*\/)?[^/]+-(?:[A-Za-z0-9_-]{8}|[a-f0-9]{16})\.[a-z0-9]+$/i.test(relative);
    res.header('Cache-Control',hashed?'public, max-age=31536000, immutable':'no-cache');
  }});}
  app.setNotFoundHandler((req,reply)=>{
    const pathname=new URL(req.url,'http://localhost').pathname;
    const reserved=/^\/(?:api|ws|assets|characters|portraits)(?:\/|$)/.test(pathname);
    const page=/^\/(?:new|rooms|matches|battle|matchmaking|saves|guide|tutorial)(?:\/|$)/.test(pathname);
    const file=/\.[^/]+$/.test(pathname);
    const asset=/\.(?:[cm]?js|css|map|json|html?|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|otf|wasm|glb|gltf|mp4|webm)$/i.test(pathname);
    if((req.method==='GET'||req.method==='HEAD')&&String(req.headers.accept||'').includes('text/html')&&!reserved&&!asset&&(!file||page)&&existsSync(path.join(staticRoot,'index.html')))
      return reply.code(200).header('Cache-Control','no-cache').type('text/html').sendFile('index.html');
    return reply.code(404).send({code:'NOT_FOUND',message:'请求地址不存在'});
  });
}
