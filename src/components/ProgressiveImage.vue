<script setup lang="ts">
import {computed,ref,watch} from 'vue';
import assets from '../../.generated/image-assets.json';

const props=withDefaults(defineProps<{path:string;alt:string;size?:'avatar'|'portrait'}>(),{size:'portrait'});
interface ImageAsset {src:string;preview:string;width:number;height:number;variants:{src:string;width:number}[]}
const image=computed(()=>(assets as Record<string,ImageAsset>)[props.path]);
const url=(src:string)=>import.meta.env.BASE_URL+src;
const variants=computed(()=>props.size==='avatar'?image.value.variants.filter(v=>v.width<=256):image.value.variants);
const src=computed(()=>url(variants.value.at(-1)!.src));
const srcset=computed(()=>variants.value.map(v=>`${url(v.src)} ${v.width}w`).join(', '));
const loaded=ref(false),failed=ref(false);
watch(()=>[props.path,props.size],()=>{loaded.value=false;failed.value=false;},{flush:'sync'});
</script>
<template>
  <span class="progressive-image" :class="{'image-loaded':loaded,'image-failed':failed}" :style="{'aspect-ratio':image.width+'/'+image.height}">
    <img class="image-preview" :src="url(image.preview)" alt="" aria-hidden="true" :width="image.width" :height="image.height" decoding="async"/>
    <img :key="src" class="image-full" :src="src" :srcset="srcset" :sizes="size==='avatar'?'128px':'(max-width: 700px) 45vw, 600px'" :alt="alt" :width="image.width" :height="image.height" loading="lazy" decoding="async" @load="loaded=true" @error="failed=true"/>
    <span v-if="failed" class="image-error" role="status">图片加载失败</span>
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
