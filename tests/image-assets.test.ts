import {test} from 'vitest';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {mkdtemp,mkdir,writeFile,readFile,rm,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';

test('publish tree contains WebP only, preserves alpha and atlas dimensions, and changes hashes when pixels change',async()=>{
  const root=await mkdtemp(join(tmpdir(),'azurlane-images-'));
  try {
    const source=join(root,'public/sprites');await mkdir(source,{recursive:true});
    const input=await sharp({create:{width:300,height:400,channels:4,background:{r:20,g:100,b:180,alpha:.5}}}).png().toBuffer();
    await writeFile(join(source,'ship.png'),input);
    await writeFile(join(source,'photo.JPG'),await sharp(input).jpeg().toBuffer());
    await writeFile(join(source,'ship.atlas'),'ship.png\nsize: 300,400\n');
    const run=()=>execFileSync(process.execPath,['scripts/prepare-assets.mjs',root],{stdio:'pipe'});
    run();
    const manifest=JSON.parse(await readFile(join(root,'.generated/image-assets.json'),'utf8'));
    const image=manifest['sprites/ship.png'];
    assert.deepEqual([image.width,image.height],[300,400]);
    assert.equal((await sharp(join(root,'.generated/public',image.src)).metadata()).hasAlpha,true);
    const alpha=await sharp(join(root,'.generated/public',image.src)).ensureAlpha().extractChannel(3).raw().toBuffer();
    assert.ok(alpha.every(value=>Math.abs(value-128)<=1));
    assert.deepEqual(await readFile(join(source,'ship.png')),input,'original artwork is retained');
    const published=await readdir(join(root,'.generated/public'),{recursive:true});
    assert.ok(published.every(file=>! /\.(png|jpe?g)$/i.test(file)));
    assert.ok(Object.keys(manifest).includes('sprites/photo.JPG'));
    assert.match(await readFile(join(root,'.generated/public/sprites/ship.atlas'),'utf8'),/\.\.\/assets\/images\/ship-full-[a-f0-9]{16}\.webp\nsize: 300,400/);
    assert.equal((await sharp(join(root,'.generated/public',image.preview)).metadata()).width,24);
    await writeFile(join(source,'ship.png'),await sharp({create:{width:300,height:400,channels:4,background:'#ff0000'}}).png().toBuffer());
    run();
    const changed=JSON.parse(await readFile(join(root,'.generated/image-assets.json'),'utf8'));
    assert.notEqual(changed['sprites/ship.png'].src,image.src);
    assert.ok(!(await readdir(join(root,'.generated/public/assets/images'))).includes(image.src.split('/').at(-1)),'stale output removed');
  } finally {await rm(root,{recursive:true,force:true});}
});
