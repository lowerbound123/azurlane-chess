import {test,expect} from 'vitest';
import {readFile,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {runtimeFixture} from './helpers/runtime-assets.ts';
import {previewExportPlan,renderSpinePreviews} from '../scripts/render-spine-previews.mjs';
test('unchanged preview export does not rewrite manifest or launch a browser',async()=>{
 const root=await runtimeFixture();try{
 const file=join(root,'public/characters/previews/manifest.json'),before=await readFile(file);
 expect((await previewExportPlan(root)).pending).toEqual([]);
 await renderSpinePreviews(root);expect(await readFile(file)).toEqual(before);
 await rm(join(root,'public/characters/previews/sailor.webp'));expect((await previewExportPlan(root)).pending).toEqual(['sailor']);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('changed profile input requires export and no fallback thumbnail is accepted',async()=>{
 const root=await runtimeFixture();try{
 const file=join(root,'public/characters/default/sailor.webp');await writeFile(file,Buffer.concat([await readFile(file),Buffer.from('modified')]));
 expect((await previewExportPlan(root)).pending).toEqual(['sailor']);
 await rm(file);await expect(previewExportPlan(root)).rejects.toThrow();
 }finally{await rm(root,{recursive:true,force:true});}
});
