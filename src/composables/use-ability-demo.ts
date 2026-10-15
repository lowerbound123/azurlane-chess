import {computed,onScopeDispose,ref,shallowRef,toValue,watch,type MaybeRefOrGetter} from 'vue';
import {assetClient} from '../assets/runtime.ts';
import {abilityDemoFor} from '../ability-demos/catalog.ts';
interface Source {id:string;url:string;local:string;remote:boolean;format:'webm'|'mp4'}
/** Resolve only the current playable format. Every URL is attempted at most once. */
export function useAbilityDemo(shipId:MaybeRefOrGetter<string>){
 const entry=computed(()=>abilityDemoFor(toValue(shipId))),source=shallowRef<Source|null>(null),poster=ref(''),loading=ref(false),failed=ref(false);
 let generation=0,formats:('webm'|'mp4')[]=[],index=0,tried=new Set<string>(),recovering=false;
 function chooseFormats(){const probe=document.createElement('video');return (['webm','mp4'] as const).filter(f=>probe.canPlayType(f==='webm'?'video/webm; codecs="vp9"':'video/mp4; codecs="avc1.42E01E"'));}
 function activate(candidate:Source){if(tried.has(candidate.url))return false;tried.add(candidate.url);source.value=candidate;loading.value=true;return true;}
 async function loadFormat(token:number){
  while(token===generation&&index<formats.length){
   const media=entry.value,format=formats[index];if(!media)break;
   try{
    const resolved=await assetClient.resolve([media[format],media.poster]);if(token!==generation)return;
    const id=media[format],value=resolved[id],local=assetClient.local(id).url;
    poster.value=resolved[media.poster]?.url??assetClient.local(media.poster).url;
    if(value&&activate({id,url:value.url,local,remote:value.source==='remote',format}))return;
    if(activate({id,url:local,local,remote:false,format}))return;
   }catch{if(token!==generation)return;}
   index++;
  }
  if(token===generation){source.value=null;loading.value=false;failed.value=true;}
 }
 async function retry(){const token=++generation;index=0;tried=new Set();recovering=false;failed.value=false;source.value=null;poster.value='';loading.value=true;formats=chooseFormats();if(!entry.value||!formats.length){failed.value=true;loading.value=false;return;}await loadFormat(token);}
 async function recover(){
  if(recovering||failed.value||!source.value)return;recovering=true;const current=source.value,token=generation;
  try{source.value=null;if(current.remote&&activate({...current,url:current.local,remote:false}))return;index++;await loadFormat(token);}
  finally{if(token===generation)recovering=false;}
 }
 function posterError(){const media=entry.value;if(!media)return;const local=assetClient.local(media.poster).url;poster.value=poster.value===local?'':local;}
 watch(()=>toValue(shipId),retry,{immediate:true,flush:'sync'});onScopeDispose(()=>{generation++;source.value=null;});
 return {entry,source,poster,loading,failed,retry,recover,posterError};
}
