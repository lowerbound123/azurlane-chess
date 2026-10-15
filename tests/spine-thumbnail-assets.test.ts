import {test,expect} from 'vitest';
import {readFile,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {runtimeFixture} from './helpers/runtime-assets.ts';
import {generateAssets} from '../scripts/generate-assets.mjs';
import {prepareAssets} from '../scripts/prepare-assets.mjs';
test('build copies a fixed Spine thumbnail and fails clearly for stale authoring input',async()=>{
 const root=await runtimeFixture();try{
  const manifest=await generateAssets(root);await prepareAssets(root);const path=manifest.files[manifest.spinePreviews.sailor].path;
  expect(path).toMatch(/^assets\/runtime\/spine-sailor-[a-f0-9]{16}\.webp$/);
  expect(await readFile(join(root,'.generated/public',path))).toEqual(await readFile(join(root,'public/characters/previews/sailor.webp')));
  const texture=join(root,'public/characters/default/sailor.webp');await writeFile(texture,Buffer.concat([await readFile(texture),Buffer.from('updated art')]));
  await expect(prepareAssets(root)).rejects.toThrow(/assets:spine/);
 }finally{await rm(root,{recursive:true,force:true});}
});
