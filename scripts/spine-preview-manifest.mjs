import {TextureAtlas} from '@esotericsoftware/spine-core';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

export async function spineFingerprint(root,profile) {
  const atlas=new TextureAtlas(await readFile(path.join(root,'public',profile.atlas),'utf8'));
  const paths=[profile.skeleton,profile.atlas,...atlas.pages.map(page=>path.posix.join(path.posix.dirname(profile.atlas),page.name))].sort();
  const files={};
  for(const name of paths)files[name]=createHash('sha256').update(await readFile(path.join(root,'public',name))).digest('hex');
  const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
  const renderer=createHash('sha256').update(await readFile(path.join(root,'src/characters/previews.ts'))).digest('hex');
  return createHash('sha256').update(JSON.stringify({profile,runtime:pkg.dependencies['@esotericsoftware/spine-threejs'],renderer,files})).digest('hex');
}
