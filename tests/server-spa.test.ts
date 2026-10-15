import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../server/app.ts';
import { GameService } from '../server/game-service.ts';

test('HTML history routes refresh while API and missing assets keep their errors',async()=>{
  const root=await mkdtemp(join(tmpdir(),'azurlane-spa-'));
  await writeFile(join(root,'index.html'),'<!doctype html><title>SPA history fixture</title><div id="app"></div>');
  await mkdir(join(root,'assets/images'),{recursive:true});
  for(const name of ['assets/app-A1b2_c3-.js','assets/styles-ZX012345.css','assets/images/portrait-full-0123456789abcdef.webp','plain.js']) await writeFile(join(root,name),'static fixture');
  await writeFile(join(root,'assets/runtime-manifest.json'),JSON.stringify({version:1,files:{},images:{},spine:{},spinePreviews:{},models:{},sources:{},spineFingerprints:{}}));
  const service=new GameService({autoTick:false,models:[],pool:{close:async()=>{},resolve:async()=>{throw new Error('unused calculation');}}});
  const app=await createApp({service,models:[],staticRoot:root,authEnabled:false,allowedOrigins:['http://frontend.test']});
  try{
    for(const url of ['/new','/new/ai/model','/rooms/ABC','/battle/online/m','/tutorial/movement','/saves','/history','/history/midway']){
      const response=await app.inject({url,headers:{accept:'text/html'}});
      assert.equal(response.statusCode,200,url);assert.match(response.body,/SPA history fixture/);
    }
    for(const url of ['/api/unknown','/ws/unknown','/assets/missing.js','/characters/missing.png','/missing.css','/new/missing.js','/rooms/missing.css']){
      const response=await app.inject({url,headers:{accept:'text/html'}});assert.equal(response.statusCode,404,url);assert.doesNotMatch(response.body,/SPA history fixture/);
    }
    assert.equal((await app.inject({method:'POST',url:'/new',payload:{}})).statusCode,404);
    assert.equal((await app.inject({url:'/new',headers:{accept:'application/json'}})).statusCode,404);
    assert.equal((await app.inject({url:'/api/config'})).statusCode,200);
    const origin='http://frontend.test';
    assert.equal((await app.inject({url:'/api/config',headers:{origin}})).headers['access-control-allow-origin'],origin);
    assert.equal((await app.inject({url:'/api/config',headers:{origin:'http://denied.test'}})).statusCode,403);
    for(const url of ['/assets/app-A1b2_c3-.js','/assets/styles-ZX012345.css','/assets/images/portrait-full-0123456789abcdef.webp']) {
      const response=await app.inject({url});
      assert.equal(response.headers['cache-control'],'public, max-age=31536000, immutable');
      assert.equal(response.headers['access-control-allow-origin'],'*');
      assert.equal(response.headers['access-control-allow-credentials'],undefined);
      assert.ok(!String(response.headers.vary).toLowerCase().split(',').map(v=>v.trim()).includes('origin'));
      const fromModule=await app.inject({url,headers:{origin}});
      assert.equal(fromModule.headers['access-control-allow-origin'],'*');assert.equal(fromModule.headers.vary,response.headers.vary);
      assert.equal(fromModule.headers.etag,response.headers.etag);assert.equal(fromModule.body,response.body);
      const unchanged=await app.inject({url,headers:{'if-none-match':String(response.headers.etag)}});
      assert.equal(unchanged.statusCode,304);assert.equal(unchanged.headers['cache-control'],response.headers['cache-control']);
    }
    for(const url of ['/','/new','/plain.js']) assert.equal((await app.inject({url,headers:{accept:'text/html'}})).headers['cache-control'],'no-cache');
    assert.ok(!String((await app.inject({url:'/assets/missing-abcdefgh.js'})).headers['cache-control']).includes('immutable'));
  }finally{await app.close();await rm(root,{recursive:true,force:true});}
});
