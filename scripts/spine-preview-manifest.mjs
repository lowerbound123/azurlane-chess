import {parseAtlas} from '../src/vendor/parse.mjs';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

export async function spineFingerprint(root,profile) {
  const atlas=parseAtlas(await readFile(path.join(root,'public',profile.atlas),'utf8'));
  const paths=[profile.skeleton,profile.atlas,...atlas.pages.map(page=>path.posix.join(path.posix.dirname(profile.atlas),page.name))].sort();
  const files={};
  for(const name of paths)files[name]=createHash('sha256').update(await readFile(path.join(root,'public',name))).digest('hex');
  const renderer=createHash('sha256');for(const file of ['previews.ts','config.ts','spine.ts'])renderer.update(await readFile(path.join(root,'src/characters',file)));const rendererHash=renderer.digest('hex');
  const sources=['spine38/core.mjs','spine38/renderer.mjs','spine38/adapter.ts','legacy-loader.ts'];
  const runtime={version:'3.8',sources:await Promise.all(sources.map(async name=>createHash('sha256').update(await readFile(path.join(root,'src/vendor',name))).digest('hex')))};
  return createHash('sha256').update(JSON.stringify({profile,runtime,renderer:rendererHash,files})).digest('hex');
}
