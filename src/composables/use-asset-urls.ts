import {computed,onScopeDispose,ref,shallowRef,toValue,watch,type MaybeRefOrGetter} from 'vue';
import type {AssetResolution} from '../../shared/assets.ts';
import {assetClient} from '../assets/runtime.ts';
/** Bounded recovery for DOM image loaders, which signal failures through events. */
export function useAssetUrls(ids:MaybeRefOrGetter<string[]>,active:MaybeRefOrGetter<boolean>=true){
 const assets=shallowRef<Record<string,AssetResolution>>({}),failed=ref(false);
 let generation=0,stage=0,recovering=false;
 watch(()=>[...toValue(ids),toValue(active)],async()=>{
  const token=++generation;stage=0;recovering=false;failed.value=false;assets.value={};
  if(!toValue(active))return;
  try{const result=await assetClient.resolve(toValue(ids));if(token===generation)assets.value=result;}
  catch{if(token===generation)failed.value=true;}
 },{immediate:true});
 onScopeDispose(()=>{generation++;});
 const urls=computed(()=>Object.fromEntries(Object.entries(assets.value).map(([id,value])=>[id,value.url])));
 async function onError(){
  if(recovering||failed.value)return;
  const current=assets.value,keys=toValue(ids),token=generation;
  if(!Object.values(current).some(value=>value.source==='remote')){failed.value=true;return;}
  recovering=true;
  try{
   if(stage===0){
    stage=1;const result=await assetClient.retry(keys,current);if(token!==generation)return;
    if(keys.some(id=>result[id]?.url!==current[id]?.url)){assets.value=Object.values(result).every(value=>value.source==='local')?assetClient.fallback(keys):result;return;}
   }
   stage=2;assets.value=assetClient.fallback(keys);
  }catch{if(token===generation)failed.value=true;}
  finally{if(token===generation)recovering=false;}
 }
 return {urls,failed,onError};
}
