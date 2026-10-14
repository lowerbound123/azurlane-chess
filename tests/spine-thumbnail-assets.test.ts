import {test} from 'vitest';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,copyFile,writeFile,readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';

test('build serves a hashed Spine WebP and invalidates it when source artwork changes',async()=>{
  const root=await mkdtemp(join(tmpdir(),'azurlane-spine-cache-'));
  try {
    for(const name of ['package.json','src/characters/previews.ts','public/characters/default/sailor.json','public/characters/default/sailor.atlas','public/characters/default/sailor.svg','public/characters/previews/sailor.webp']) {
      await mkdir(join(root,name,'..'),{recursive:true});await copyFile(name,join(root,name));
    }
    const fingerprint=execFileSync(process.execPath,['--input-type=module','-e',"import {spineFingerprint} from './scripts/spine-preview-manifest.mjs';import {characterConfig} from './src/characters/config.ts';console.log(await spineFingerprint(process.argv[1],characterConfig.profiles.sailor));",root],{encoding:'utf8'}).trim();
    await writeFile(join(root,'public/characters/previews/manifest.json'),JSON.stringify({profiles:{sailor:{image:'characters/previews/sailor.webp',fingerprint}}}));
    const run=()=>execFileSync(process.execPath,['scripts/prepare-assets.mjs',root],{encoding:'utf8'});
    run();
    const cached=JSON.parse(await readFile(join(root,'.generated/spine-previews.json'),'utf8'));
    assert.match(cached.sailor,/^assets\/images\/spine-sailor-[a-f0-9]{16}\.webp$/);
    assert.deepEqual(await readFile(join(root,'.generated/public',cached.sailor)),await readFile(join(root,'public/characters/previews/sailor.webp')));
    const svg=join(root,'public/characters/default/sailor.svg');await writeFile(svg,(await readFile(svg,'utf8'))+'\n<!-- updated art -->');
    run();assert.deepEqual(JSON.parse(await readFile(join(root,'.generated/spine-previews.json'),'utf8')),{});
  }finally{await rm(root,{recursive:true,force:true});}
});
