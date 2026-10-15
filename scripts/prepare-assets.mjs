import {mkdir,rm,copyFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {validateRuntime} from './runtime-assets.mjs';
/** Normal startup/build only checks and copies tracked, pre-generated art. */
export async function prepareAssets(root=fileURLToPath(new URL('../',import.meta.url)),options={}){
 const manifest=await validateRuntime(root,options),generated=path.join(root,'.generated'),output=path.join(generated,'public');
 await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
 for(const file of new Set(Object.entries(manifest.files).filter(([id])=>options.abilityDemos!==false||!id.startsWith('ability-demo/')).map(([,a])=>a.path))){const dest=path.join(output,file);await mkdir(path.dirname(dest),{recursive:true});await copyFile(path.join(root,'assets/runtime/files',file),dest);}
 for(const file of ['favicon.svg','characters/SPINE-RUNTIMES-LICENSE.txt'])if(existsSync(path.join(root,'public',file))){const dest=path.join(output,file);await mkdir(path.dirname(dest),{recursive:true});await copyFile(path.join(root,'public',file),dest);}
 await writeFile(path.join(output,'assets/runtime-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 // Kept for tooling compatibility; product code reads the tracked manifest.
 await writeFile(path.join(generated,'image-assets.json'),JSON.stringify(manifest.images,null,2)+'\n');
 await writeFile(path.join(generated,'spine-previews.json'),JSON.stringify(Object.fromEntries(Object.entries(manifest.spinePreviews).map(([id,asset])=>[id,manifest.files[asset].path])),null,2)+'\n');
 return manifest.images;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const images=await prepareAssets(process.argv[2]);console.log(`Verified fixed runtime assets (${Object.keys(images).length} image groups); copied to build staging.`);}
