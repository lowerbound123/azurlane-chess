import type {AssetClient} from './client.ts';
export interface PreloadProgress {loaded:number;total:number;loadedBytes:number;totalBytes:number;failed:number}
export class AssetPreloadError extends Error {
 constructor(failed:number){super(`有 ${failed} 项资源未能加载，请检查网络后重试。`);this.name='AssetPreloadError';}
}
export async function preloadRuntimeAssets(client:AssetClient,report:(value:PreloadProgress)=>void,concurrency=6):Promise<void>{
 const ids=Object.keys(client.manifest.files);
 const progress:PreloadProgress={loaded:0,total:ids.length,loadedBytes:0,totalBytes:ids.reduce((sum,id)=>sum+client.manifest.files[id].bytes,0),failed:0};
 report({...progress});let cursor=0;
 await Promise.all(Array.from({length:Math.min(ids.length,Math.max(1,Math.floor(concurrency)))},async()=>{
  while(cursor<ids.length){
   const id=ids[cursor++];
   try{await client.preload(id);progress.loaded++;progress.loadedBytes+=client.manifest.files[id].bytes;}
   catch{progress.failed++;}
   report({...progress});
  }
 }));
 if(progress.failed)throw new AssetPreloadError(progress.failed);
}
