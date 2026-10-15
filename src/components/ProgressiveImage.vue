<script setup lang="ts">
import {computed,onMounted,onUnmounted,ref,watch} from 'vue';
import {runtimeAssets} from '../assets/runtime.ts';
import {useAssetUrls} from '../composables/use-asset-urls.ts';
const props=withDefaults(defineProps<{path:string;alt:string;size?:'avatar'|'portrait'}>(),{size:'portrait'});
const image=computed(()=>runtimeAssets.images[props.path]);
const variants=computed(()=>image.value?(props.size==='avatar'?image.value.variants.filter(v=>v.width<=256):image.value.variants):[]);
const fullId=computed(()=>variants.value.at(-1)?.src??image.value?.src);
const ids=computed(()=>image.value?[...new Set([image.value.preview,...variants.value.map(v=>v.src),fullId.value!])]:[]);
const root=ref<HTMLElement>(),visible=ref(false),loaded=ref(false);
const {urls,failed,onError}=useAssetUrls(ids,visible);
const src=computed(()=>fullId.value?urls.value[fullId.value]:undefined);
const srcset=computed(()=>variants.value.map(v=>urls.value[v.src]?`${urls.value[v.src]} ${v.width}w`:'').filter(Boolean).join(', '));
let observer:IntersectionObserver|undefined;
onMounted(()=>{if(typeof IntersectionObserver==='undefined'){visible.value=true;return;}observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){visible.value=true;observer?.disconnect();}},{rootMargin:'200px'});if(root.value)observer.observe(root.value);});
onUnmounted(()=>observer?.disconnect());
watch(()=>[props.path,props.size,src.value],()=>{loaded.value=false;},{flush:'sync'});
</script>
<template>
  <span ref="root" class="progressive-image" :class="{'image-loaded':loaded,'image-failed':failed||!image}" :style="{'aspect-ratio':image?image.width+'/'+image.height:undefined}">
    <img v-if="image&&urls[image.preview]" class="image-preview" :src="urls[image.preview]" alt="" aria-hidden="true" :width="image.width" :height="image.height" decoding="async" @error="onError"/>
    <img v-if="image&&src" :key="src" class="image-full" :src="src" :srcset="srcset" :sizes="size==='avatar'?'128px':'(max-width: 700px) 45vw, 600px'" :alt="alt" :width="image.width" :height="image.height" loading="lazy" decoding="async" @load="loaded=true" @error="onError"/>
    <span v-if="failed||!image" class="image-error" role="status">图片加载失败</span>
  </span>
</template>
<style scoped>
.progressive-image{position:relative;display:block;overflow:hidden;flex-shrink:0}
.progressive-image img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:inherit;object-position:inherit}
.image-preview{filter:blur(5px);opacity:1;transition:opacity .25s ease}
.image-full{opacity:0;transition:opacity .25s ease}
.image-loaded .image-full{opacity:1}.image-loaded .image-preview{opacity:0}
.image-error{position:absolute;bottom:0;left:0;right:0;background:#18181bcc;font-size:10px;text-align:center}
@media(prefers-reduced-motion:reduce){.image-preview,.image-full{transition:none}}
</style>
