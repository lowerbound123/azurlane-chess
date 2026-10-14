import {onMounted,onUnmounted,shallowRef} from 'vue';
import type {SpinePreviews} from '../characters/previews.ts';
import {errorMessage} from '../lib/errors.ts';
import cached from '../../.generated/spine-previews.json';
import {profileIdFor} from '../characters/config.ts';

export function useSpineThumbnails(templates:string[]) {
  const manifest=cached as Record<string,string>;
  const initial=Object.fromEntries(templates.flatMap(template=>{const src=manifest[profileIdFor(template)];return src?[[template,import.meta.env.BASE_URL+src]]:[];}));
  const sources=shallowRef<Record<string,string>>(initial),errors=shallowRef<Record<string,string>>({});
  let previews:SpinePreviews|undefined,disposed=false;
  onMounted(async()=>{
    const missing=templates.filter(template=>!sources.value[template]);
    if(!missing.length)return;
    try {
      const module=await import('../characters/previews.ts');
      if(disposed)return;
      previews=new module.SpinePreviews();
      await Promise.all(missing.map(async template=>{
        try {
          const src=await previews!.load(template);
          if(!disposed&&src)sources.value={...sources.value,[template]:src};
        }catch(error){if(!disposed)errors.value={...errors.value,[template]:errorMessage(error)};}
      }));
    }catch(error){if(!disposed)errors.value=Object.fromEntries(templates.map(template=>[template,errorMessage(error)]));}
    finally{previews?.releaseGPU();}
  });
  onUnmounted(()=>{disposed=true;previews?.dispose();});
  return {sources,errors};
}
