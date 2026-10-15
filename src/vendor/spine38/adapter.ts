import core from './core.mjs';
import renderer from './renderer.mjs';
import {loadLegacySpine} from '../legacy-loader.ts';
export function loadSpine38(profile:{format:'json'|'binary';premultipliedAlpha?:boolean},skeletonURL:string,atlasURL:string,aliases:Record<string,string>={},isDisposed:()=>boolean=()=>false) {
  return loadLegacySpine(core,renderer,'3.8',profile,skeletonURL,atlasURL,aliases,isDisposed);
}
