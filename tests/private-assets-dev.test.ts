import {test,expect} from 'vitest';
import {createServer} from 'vite';
import {mkdtemp,mkdir,writeFile,rm,symlink} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
test('Vite never exposes default or custom private configuration through raw/import/fs/symlinks',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'asset-private-dev-')),old=process.env.ASSET_STORAGE_CONFIG;
 let server:Awaited<ReturnType<typeof createServer>>|undefined;
 try{
  await mkdir(path.join(root,'config'));await mkdir(path.join(root,'private'));await writeFile(path.join(root,'index.html'),'<!doctype html><p>asset dev</p>');
  const custom=path.join(root,'private/custom.json');process.env.ASSET_STORAGE_CONFIG=custom;
  for(const file of ['config/asset-storage.json','config/ai-models.json','private/custom.json'])await writeFile(path.join(root,file),'{"secretAccessKey":"TEST_PRIVATE_STORAGE_VALUE"}');
  await symlink(custom,path.join(root,'alias.json'));await writeFile(path.join(root,'config/asset-storage.example.json'),'{"provider":"local"}');
  server=await createServer({root,configFile:path.resolve('vite.config.ts'),logLevel:'silent',server:{host:'127.0.0.1',port:0}});await server.listen();
  const address=server.httpServer!.address();if(typeof address!=='object'||!address)throw Error('missing port');const base=`http://127.0.0.1:${address.port}`;
  for(const file of ['/config/asset-storage.json','/config/asset-storage.json?raw','/config/asset-storage.json?import','/config/ai-models.json','/private/custom.json','/private/custom.json?raw','/@fs/'+custom,'/@fs/'+custom+'?raw','/alias.json','/alias.json?raw','/config%2Fasset-storage.json']){
   const response=await fetch(base+file),body=await response.text();expect(response.status,file).toBe(403);expect(body).not.toContain('TEST_PRIVATE_STORAGE_VALUE');
  }
  expect((await fetch(base+'/')).status).toBe(200);
 }finally{await server?.close();if(old===undefined)delete process.env.ASSET_STORAGE_CONFIG;else process.env.ASSET_STORAGE_CONFIG=old;await rm(root,{recursive:true,force:true});}
});
