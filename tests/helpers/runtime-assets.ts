import {mkdtemp,mkdir,copyFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import sharp from 'sharp';
import {spineFingerprint} from '../../scripts/spine-preview-manifest.mjs';
import {loadAuthoringProfiles} from '../../scripts/runtime-assets.mjs';
export async function previewFingerprint(root:string){const {profiles}=await loadAuthoringProfiles(root);await writeFile(join(root,'public/characters/previews/manifest.json'),JSON.stringify({profiles:{sailor:{image:'characters/previews/sailor.webp',fingerprint:await spineFingerprint(root,profiles.sailor)}}}));}
export async function runtimeFixture(){const root=await mkdtemp(join(tmpdir(),'fixed-assets-'));
 for(const name of ['package.json','src/characters/default-profile.ts',...['spine38/core.mjs','spine38/renderer.mjs','spine38/adapter.ts','legacy-loader.ts'].map(p=>'src/vendor/'+p),'src/characters/config.ts','src/characters/previews.ts','src/characters/spine.ts','public/favicon.svg','public/characters/default/sailor.json','public/characters/default/sailor.atlas','public/characters/default/sailor.webp','public/characters/previews/sailor.webp','assets/models/aircraft.glb','assets/models/naval-mine.glb','assets/models/torpedoes/mk14.glb']){await mkdir(join(root,name,'..'),{recursive:true});await copyFile(name,join(root,name));}
 await previewFingerprint(root);await mkdir(join(root,'public/portraits'),{recursive:true});await sharp({create:{width:300,height:400,channels:4,background:{r:30,g:60,b:90,alpha:.5}}}).png().toFile(join(root,'public/portraits/test.png'));return root;
}
