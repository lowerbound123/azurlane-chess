import {test,expect} from 'vitest';
import {readFile,writeFile,copyFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import sharp from 'sharp';
import {runtimeFixture,previewFingerprint} from './helpers/runtime-assets.ts';
import {generateAssets} from '../scripts/generate-assets.mjs';
import {prepareAssets} from '../scripts/prepare-assets.mjs';
test('fixed WebP preserves alpha and atlas page aliases; explicit regeneration changes pixel hashes',async()=>{
 const root=await runtimeFixture();try{
  const input=await readFile(join(root,'public/portraits/test.png'));
  await copyFile(join(root,'public/portraits/test.png'),join(root,'public/characters/default/texture.png'));
  const atlas='texture.png\nsize: 300,400\nformat: RGBA8888\nfilter: Linear,Linear\nrepeat: none\n';
  await writeFile(join(root,'public/characters/default/sailor.atlas'),atlas);await previewFingerprint(root);
  const manifest=await generateAssets(root);await prepareAssets(root);const image=manifest.images['portraits/test.png'],texture=manifest.files[manifest.spine.sailor.pages['texture.png']];
  expect(texture.contentType).toBe('image/webp');expect(texture.path).toMatch(/\.webp$/);
  expect(await readFile(join(root,'assets/runtime/files',manifest.files[manifest.spine.sailor.atlas].path),'utf8')).toBe(atlas);
  const alpha=await sharp(join(root,'.generated/public',manifest.files[image.src].path)).ensureAlpha().extractChannel(3).raw().toBuffer();expect(alpha.every(v=>Math.abs(v-128)<=1)).toBe(true);
  expect(await readFile(join(root,'public/portraits/test.png'))).toEqual(input);
  await sharp({create:{width:300,height:400,channels:4,background:'#ff0000'}}).png().toFile(join(root,'public/portraits/test.png'));await expect(prepareAssets(root)).rejects.toThrow(/assets:generate/);
  const changed=await generateAssets(root);await prepareAssets(root);expect(changed.images['portraits/test.png'].src).not.toBe(image.src);
 }finally{await rm(root,{recursive:true,force:true});}
});
