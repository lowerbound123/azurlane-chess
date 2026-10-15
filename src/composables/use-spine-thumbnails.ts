import {shipArt} from '../ship-art.ts';
import {computed} from 'vue';
import {characterConfig,profileIdFor} from '../characters/config.ts';
import {runtimeAssets} from '../assets/runtime.ts';
import {useAssetUrls} from './use-asset-urls.ts';

/** Runtime thumbnails are immutable published files, never temporary GPU renders. */
export function useSpineThumbnails(templates:string[]) {
 const profiles=new Map<string,ReturnType<typeof useAssetUrls>&{id:string|undefined;missing:boolean}>();
 const entries=Object.fromEntries([...new Set(templates)].map(template=>{
  const profileId=shipArt.catalog[template]??profileIdFor(template),missing=!runtimeAssets.spinePreviews[profileId];
  const id=runtimeAssets.spinePreviews[profileId]??runtimeAssets.spinePreviews[characterConfig.defaultProfile]??(runtimeAssets.files['placeholder/ship']?'placeholder/ship':undefined);
  if(!profiles.has(profileId))profiles.set(profileId,{id,missing,...useAssetUrls(id?[id]:[])});
  return [template,profiles.get(profileId)!];
 }));
 const sources=computed(()=>Object.fromEntries(Object.entries(entries).flatMap(([template,entry])=>entry.id&&entry.urls.value[entry.id]?[[template,entry.urls.value[entry.id]]]:[])));
 const errors=computed(()=>Object.fromEntries(Object.entries(entries).flatMap(([template,entry])=>entry.failed.value?[[template,'素材加载失败']]:entry.missing?[[template,'缺少固定缩略图，使用默认素材']]:[])));
 return {sources,errors,onError:(template:string)=>entries[template]?.onError()};
}
