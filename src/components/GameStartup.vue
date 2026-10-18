<script setup lang="ts">
import {computed,onMounted,ref} from 'vue';
import {AssetPreloadError,type PreloadProgress} from '../assets/preload.ts';
const props=defineProps<{prepare?:(report:(value:PreloadProgress)=>void)=>Promise<void>}>();
const ready=ref(false),busy=ref(false),error=ref(''),reloadRequired=ref(false);
const progress=ref<PreloadProgress>({loaded:0,total:0,loadedBytes:0,totalBytes:0,failed:0});
const percent=computed(()=>progress.value.totalBytes?Math.min(99,Math.floor(progress.value.loadedBytes/progress.value.totalBytes*100)):0);
const mb=(bytes:number)=>(bytes/1024/1024).toFixed(1);
async function start(){
 if(busy.value)return;busy.value=true;error.value='';
 try{
  const prepare=props.prepare??(await import('../assets/preload-game.ts')).preloadGameAssets;
  await prepare(value=>{progress.value=value;});ready.value=true;
 }catch(cause){
  reloadRequired.value=!(cause instanceof AssetPreloadError);
  error.value=reloadRequired.value?'游戏画面加载失败，请刷新页面重试。':(cause as AssetPreloadError).message;
 }
 finally{busy.value=false;}
}
onMounted(start);
function retry(){if(reloadRequired.value)window.location.reload();else void start();}
</script>
<template>
 <slot v-if="ready"/>
 <main v-else class="game-startup" :aria-busy="busy">
  <section class="startup-content" aria-labelledby="startup-title">
   <span class="startup-mark" aria-hidden="true">✦</span>
   <p class="startup-brand">碧蓝推演棋</p>
   <h1 id="startup-title">{{error?'资源尚未就绪':'正在准备游戏'}}</h1>
   <p class="startup-description">提前加载舰船、战斗画面与声音，完成后即可开始。</p>
   <div class="startup-meter" role="progressbar" aria-label="游戏资源加载进度" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100"><span :style="{width:percent+'%'}"/></div>
   <div class="startup-progress"><span>{{progress.loaded}} / {{progress.total}} 项<span v-if="progress.totalBytes"> · {{mb(progress.loadedBytes)}} / {{mb(progress.totalBytes)}} MB</span></span><strong>{{percent}}%</strong></div>
   <p v-if="error" class="startup-error" role="alert">{{error}}</p>
   <p v-else class="startup-status" role="status">{{progress.total&&progress.loaded===progress.total?'正在准备游戏画面…':'首次加载需要一点时间，已完成的资源会自动保留。'}}</p>
   <button v-if="error" type="button" @click="retry">{{reloadRequired?'刷新重试':'重试加载'}}</button>
  </section>
 </main>
</template>
<style scoped>
.game-startup{min-height:100dvh;display:grid;place-items:center;padding:32px 24px;background:var(--ink-0,#07131c);color:var(--text-1,#d8e4eb)}
.startup-content{width:min(100%,480px)}.startup-mark{display:block;font-size:44px;line-height:1;color:var(--signal,#66ded2);margin-bottom:28px}.startup-brand{font-size:14px;letter-spacing:.16em;color:var(--text-2,#93b0be);margin:0 0 12px}.startup-content h1{font-size:clamp(26px,5vw,34px);font-weight:600;margin:0 0 14px}.startup-description,.startup-status,.startup-error{font-size:13px;line-height:1.8;color:var(--text-2,#93b0be);margin:0}.startup-meter{height:4px;margin-top:36px;overflow:hidden;background:var(--line-2,#233d4e)}.startup-meter>span{display:block;height:100%;background:var(--signal,#66ded2);transition:width .15s ease}.startup-progress{display:flex;justify-content:space-between;gap:16px;align-items:baseline;margin:12px 0 20px;font:12px var(--font-code,monospace);color:var(--text-2,#93b0be);font-variant-numeric:tabular-nums}.startup-progress strong{font-size:18px;font-weight:500;color:var(--signal,#66ded2)}.startup-error{color:var(--hostile,#f28d8d)}.startup-content button{margin-top:20px;min-height:44px;padding:0 24px}@media(prefers-reduced-motion:reduce){.startup-meter>span{transition:none}}
</style>
