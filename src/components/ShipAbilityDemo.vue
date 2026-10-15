<script setup lang="ts">
import {computed,onBeforeUnmount,onMounted,ref,watch} from 'vue';
import {useAbilityDemo} from '../composables/use-ability-demo.ts';
const props=defineProps<{shipId:string}>();
const {entry,source,poster,loading,failed,retry,recover,posterError}=useAbilityDemo(()=>props.shipId);
const host=ref<HTMLElement>(),video=ref<HTMLVideoElement|null>(null);
const inView=ref(typeof IntersectionObserver==='undefined'),hidden=ref(typeof document!=='undefined'&&document.hidden),playing=ref(false),ready=ref(false),played=ref(false),blocked=ref(false),time=ref(0);
let observer:IntersectionObserver|undefined,pending=false,resumeAfterPending=false;
const available=computed(()=>!hidden.value&&inView.value);
const cue=computed(()=>entry.value?.cues.find(c=>time.value>=c.start&&time.value<c.end)??entry.value?.cues[0]);
function pause(){video.value?.pause();playing.value=false;}
function release(element:HTMLVideoElement|null){if(!element)return;element.pause();element.removeAttribute('src');element.load();}
function setVideo(element:unknown){const next=element as HTMLVideoElement|null;if(video.value&&video.value!==next)release(video.value);video.value=next;}
async function start(){
 const element=video.value,url=source.value?.url;if(!element||!url||blocked.value||!available.value)return;if(pending){resumeAfterPending=true;return;}pending=true;element.muted=true;
 try{await element.play();if(video.value!==element||source.value?.url!==url)return;if(!available.value){pause();return;}playing.value=true;played.value=true;blocked.value=false;}
 catch(error){if(video.value!==element||source.value?.url!==url||!available.value)return;const name=error instanceof Error?error.name:'';if(name==='NotAllowedError')blocked.value=true;else if(name!=='AbortError')await recover();}
 // A quick background/foreground switch can request resume before pause() rejects the old play().
 finally{if(video.value===element&&source.value?.url===url){pending=false;if(resumeAfterPending){resumeAfterPending=false;if(!playing.value)void start();}}}
}
function onPlaying(event:Event){if(current(event)){if(!available.value){pause();return;}playing.value=true;played.value=true;}}
function onPaused(event:Event){if(current(event))playing.value=false;}
function updateTime(event:Event){if(current(event))time.value=(event.currentTarget as HTMLVideoElement).currentTime;}
function current(event:Event){return event.currentTarget===video.value;}
function loaded(event:Event){if(!current(event))return;ready.value=true;loading.value=false;if(!playing.value)void start();}
function playbackError(event:Event){if(current(event)){pause();void recover();}}
function resume(){blocked.value=false;void start();}
function visibility(){hidden.value=document.hidden;}
watch(()=>[props.shipId,source.value?.url],()=>{release(video.value);pending=false;resumeAfterPending=false;ready.value=false;playing.value=false;played.value=false;blocked.value=false;time.value=0;},{flush:'sync'});
// Metadata-only preload may never emit loadeddata until play() is requested.
watch(video,element=>{if(element&&available.value)void start();},{flush:'post'});
watch(available,visible=>{if(!visible)pause();else void start();});
onMounted(()=>{
 document.addEventListener('visibilitychange',visibility);
 if(typeof IntersectionObserver!=='undefined'&&host.value){observer=new IntersectionObserver(entries=>{inView.value=entries.some(e=>e.isIntersecting);},{threshold:.1});observer.observe(host.value);}
});
onBeforeUnmount(()=>{release(video.value);observer?.disconnect();document.removeEventListener('visibilitychange',visibility);});
</script>
<template>
 <div ref="host" class="ability-demo-host">
   <section class="ability-player" :aria-label="(entry?.name??shipId)+'能力演示'">
    <header class="ability-heading">
     <h3 class="ability-title">{{entry?.name??shipId}} · {{entry?.ability??'能力演示'}}</h3>
     <div v-if="cue" class="ability-caption"><span>{{cue.experiment?cue.experiment+' · ':''}}第 {{cue.round}} 回合</span><strong>{{cue.title}}</strong><p>{{cue.detail}}</p></div>
    </header>
    <div class="ability-film">
     <video v-if="source&&!failed" :key="shipId+source.url" :ref="setVideo" :src="source.url" :poster="poster||undefined" muted playsinline loop preload="metadata" :aria-label="(entry?.name??shipId)+'能力演示视频'" @loadeddata="loaded" @error="playbackError" @playing="onPlaying" @pause="onPaused" @timeupdate="updateTime"/>
     <img v-if="poster&&!played&&!failed" class="ability-poster" :src="poster" alt="能力演示封面" @error="posterError"/>
     <div v-if="failed" class="ability-fallback"><slot name="fallback"/><div class="ability-message" role="status"><strong>演示暂时无法加载</strong><p>{{entry?.ability??'当前舰船能力演示'}}</p><button type="button" aria-label="重试能力演示" @click="retry">重试</button></div></div>
     <span v-else-if="loading&&!ready" class="ability-loading" role="status">正在加载演示…</span>
     <button v-if="blocked&&!failed" type="button" class="ability-start" aria-label="播放能力演示" @click="resume">点击播放</button>
    </div>
   </section>
 </div>
</template>
<style scoped>
.ability-demo-host{width:100%;min-width:0}.ability-player{width:100%;color:var(--text-1);background:var(--ink-0,#071724);border:1px solid var(--line-2,#31505e);border-radius:10px;overflow:hidden}.ability-heading{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px;padding:12px 14px 13px;border-bottom:1px solid var(--line-2,#31505e)}.ability-title{flex:none;margin:0;font-size:15px;line-height:1.5}.ability-film{position:relative;aspect-ratio:768/676;isolation:isolate;overflow:hidden;background:#071724}.ability-film video,.ability-poster,.ability-fallback{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.ability-film video,.ability-poster{inset:auto 0 auto;width:100%;height:142.011834%;top:-22.189349%;object-fit:fill}.ability-poster{pointer-events:none}.ability-loading{position:absolute;left:12px;bottom:14px;padding:7px 10px;border-radius:6px;background:#071724de;font-size:12px}.ability-start,.ability-message button{min-height:44px;min-width:44px;padding:7px 13px;background:var(--ink-2,#18333f);border:1px solid var(--line-2,#31505e);border-radius:6px;color:inherit;font:inherit;font-size:12px;cursor:pointer}.ability-start{position:absolute;left:50%;bottom:14px;transform:translateX(-50%)}.ability-start:focus-visible,.ability-message button:focus-visible{outline:2px solid var(--signal,#70dfd5);outline-offset:2px}.ability-caption{display:contents;font-size:12px;line-height:1.65}.ability-caption>span{color:var(--text-3,#a6c3cc);font-size:12px}.ability-caption strong{color:var(--brass-hi,#f0d194);font-size:14px}.ability-caption p{margin:0;color:var(--text-2,#bccfd6)}.ability-message{position:absolute;inset:auto 10px 12px;padding:14px;background:#071724e8;border-radius:7px;text-align:center}.ability-message p{font-size:12px}
</style>
