import battleWorkerUrl from '../workers/battle.worker.ts?worker&url';
import {assetClient} from './runtime.ts';
import {preloadRuntimeAssets,type PreloadProgress} from './preload.ts';

// Importing evaluates the modules and loads their CSS once, so route changes and
// the first battle do not wait for another code download after the loading gate.
const modules=import.meta.glob(['../pages/*.vue','../BattleMap3D.vue','../components/BattleSettlement.vue','../vendor/spine38/adapter.ts','../vendor/parse.mjs']);
let code:Promise<void>|undefined;
function preloadCode(){
 return code??=Promise.all([
  ...Object.values(modules).map(load=>load()),
  fetch(battleWorkerUrl,{cache:'force-cache',signal:AbortSignal.timeout(60000)}).then(async response=>{if(!response.ok)throw Error('战斗程序加载失败，请重试。');await response.arrayBuffer();}),
 ]).then(async()=>{
  // Ask for every bundled Unicode subset explicitly. WebKit may omit font
  // faces from its set until a matching family/character has been requested.
  await document.fonts.ready;
  await Promise.all(['Saira Variable','JetBrains Mono Variable'].map(family=>document.fonts.load(`16px "${family}"`,'AČấЖѠα')));
  await Promise.all(Array.from(document.fonts,face=>face.load()));
 }).catch(error=>{code=undefined;throw error;});
}
export async function preloadGameAssets(report:(value:PreloadProgress)=>void){
 await preloadRuntimeAssets(assetClient,report);
 await preloadCode();
}
