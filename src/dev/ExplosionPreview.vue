<script setup lang="ts">
import {ref,onMounted,onBeforeUnmount} from 'vue';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {ExplosionStudy,EXPLOSION_STUDIES,type ExplosionKind} from '../scene/vfx/explosions.ts';
import {oceanMaterial} from '../scene/ocean.ts';
import {disposeTree} from '../scene/resources.ts';

const kinds:ExplosionKind[]=['artillery','torpedo','bomb'];
const host=ref<HTMLElement|null>(null),playing=ref(true),peakMode=ref(false),time=ref(0),speed=ref(1),loop=ref(true),error=ref(''),ready=ref(false),top=ref(false);
const end=4.0;let elapsed=0,renderer:THREE.WebGLRenderer|undefined,controls:OrbitControls|undefined,observer:ResizeObserver|undefined;
const camera=new THREE.OrthographicCamera(-4,4,3.4,-3.4,.01,80),effects:ExplosionStudy[]=[],scenes:THREE.Scene[]=[],waterClocks:{value:number}[]=[];
function restart(){peakMode.value=false;elapsed=0;time.value=0;playing.value=true;}
function togglePlay(){if(peakMode.value||elapsed>=end){restart();return;}playing.value=!playing.value;}
function peaks(){peakMode.value=true;playing.value=false;}
function scrub(event:Event){playing.value=false;peakMode.value=false;elapsed=Number((event.target as HTMLInputElement).value);time.value=elapsed;}
function resetCamera(isTop=false){top.value=isTop;camera.zoom=1;camera.position.set(isTop?0:5.5,isTop?11:6,isTop?.01:8);camera.up.set(0,1,0);controls?.target.set(0,1.1,0);camera.lookAt(0,1.1,0);controls?.update();camera.updateProjectionMatrix();}
function phase(kind:ExplosionKind){const t=peakMode.value?EXPLOSION_STUDIES[kind].peak:time.value;if(t>=EXPLOSION_STUDIES[kind].duration)return '已消散';if(t<.12)return '起爆';if(t<(kind==='torpedo'?.85:.65))return kind==='torpedo'?'水柱与喷溅':'冲击与扩张';return kind==='torpedo'?'落水与泡沫':'烟尘与余烬';}
function resize(){if(!host.value||!renderer)return;const w=host.value.clientWidth,h=host.value.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);const mobile=w<700;controls!.enableRotate=!mobile;renderer.domElement.style.touchAction=mobile?'pan-y':'none';const aspect=mobile?w/(h/3):(w/3)/h;camera.left=-3.4*aspect;camera.right=3.4*aspect;camera.top=3.4;camera.bottom=-3.4;camera.updateProjectionMatrix();}
onMounted(()=>{
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x102631);renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','火炮、鱼雷、飞机轰炸三套爆炸特效');host.value!.prepend(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.minZoom=.8;controls.maxZoom=1.6;controls.minPolarAngle=.05;controls.maxPolarAngle=1.3;controls.enableDamping=true;resetCamera();
  for(const kind of kinds){
   const scene=new THREE.Scene(),fx=new ExplosionStudy(kind,kind==='bomb'?37:kind==='torpedo'?19:11),clock={value:0};
   scene.add(fx.root);effects.push(fx);scenes.push(scene);waterClocks.push(clock);
   const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),oceanMaterial(clock,0x205e79,.9));floor.rotation.x=-Math.PI/2;floor.position.y=-.02;scene.add(floor);
   const marker=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.18,0,0),new THREE.Vector3(.18,0,0),new THREE.Vector3(0,0,-.18),new THREE.Vector3(0,0,.18)]),new THREE.LineBasicMaterial({color:0x729795,transparent:true,opacity:.4}));scene.add(marker);
  }
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){playing.value=false;peakMode.value=true;}
  observer=new ResizeObserver(resize);observer.observe(host.value!);resize();let previous=0,published=0;
  renderer.setAnimationLoop(now=>{
   const delta=previous?Math.min((now-previous)/1000,.06):0;previous=now;
   if(playing.value){elapsed+=delta*speed.value;if(elapsed>=end){if(loop.value)elapsed%=end;else{elapsed=end;playing.value=false;}}}
   if(now-published>45){time.value=elapsed;published=now;}
   controls!.update();const w=host.value!.clientWidth,h=host.value!.clientHeight,mobile=w<700;if(!w||!h)return;
   renderer!.setScissorTest(true);
   effects.forEach((fx,i)=>{
    const t=peakMode.value?EXPLOSION_STUDIES[kinds[i]].peak:elapsed;fx.seek(t);waterClocks[i].value=t;
    const vw=mobile?w:w/3,vh=mobile?h/3:h,x=mobile?0:i*vw,y=mobile?(2-i)*vh:0;
    renderer!.setViewport(x,y,vw,vh);renderer!.setScissor(x,y,vw,vh);renderer!.render(scenes[i],camera);
   });
  });
  ready.value=true;renderer.domElement.dataset.explosionReady='true';
 }catch(e){error.value=e instanceof Error?e.message:String(e);}
});
onBeforeUnmount(()=>{renderer?.setAnimationLoop(null);observer?.disconnect();controls?.dispose();effects.forEach(fx=>fx.dispose());scenes.forEach(disposeTree);renderer?.dispose();});
</script>
<template>
 <main class="explosion-lab">
  <header><div><small>AZURLANE CHESS / EFFECT STUDIES</small><h1>三种冲击，各有声势。</h1><p>火炮的短促、鱼雷的水势、轰炸的余威。</p></div><a class="scope" href="./ability-preview.html">查看舰船能力特效 ↗</a></header>
  <section class="transport" aria-label="播放控制">
   <button class="primary" @click="togglePlay">{{playing?'暂停':'播放'}}</button><button @click="restart">重新播放</button><button :aria-pressed="peakMode" @click="peaks">峰值对照</button>
   <label>速度 <select v-model.number="speed" aria-label="播放速度"><option :value=".25">0.25×</option><option :value=".5">0.5×</option><option :value="1">1×</option></select></label>
   <label class="check"><input type="checkbox" v-model="loop">循环</label><button :aria-pressed="top" @click="resetCamera(!top)">{{top?'恢复斜视':'俯视观察'}}</button><span class="state">{{peakMode?'各自峰值':playing?'正在播放':'已暂停'}}</span>
  </section>
  <div class="timeline"><span>{{peakMode?'PEAK':time.toFixed(2)+' s'}}</span><input type="range" min="0" :max="end" step=".01" :value="time" aria-label="特效时间轴" @input="scrub"><span>4.00 s</span></div>
  <section ref="host" class="stages" :data-ready="ready">
   <p v-if="error" class="notice" role="alert">{{error}}</p><p v-else-if="!ready" class="notice" role="status">正在准备三套特效…</p>
   <div class="stage-labels"><article v-for="(kind,i) in kinds" :key="kind" :style="{'--accent':EXPLOSION_STUDIES[kind].accent}"><div class="stage-title"><small>0{{i+1}} / {{EXPLOSION_STUDIES[kind].english}}</small><h2>{{EXPLOSION_STUDIES[kind].name}}</h2></div><div class="stage-foot"><span>{{phase(kind)}}</span><span>{{EXPLOSION_STUDIES[kind].duration.toFixed(1)}} s</span></div></article></div>
  </section>
  <section class="effect-notes"><article v-for="kind in kinds" :key="kind"><span :style="{background:EXPLOSION_STUDIES[kind].accent}"/><p>{{EXPLOSION_STUDIES[kind].description}}</p></article></section>
  <footer><span>拖动时间轴逐帧观察；桌面可拖动镜头、滚轮缩放。</span><span>已接入实际武器命中；此页用于独立观察。</span></footer>
 </main>
</template>
<style scoped>
.explosion-lab{min-height:100dvh;padding:30px clamp(14px,4vw,64px);background:#0e1b25;color:#e9e6da;font-family:'Saira Variable',system-ui,sans-serif}.explosion-lab header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:25px}.explosion-lab header small{font:9px 'JetBrains Mono Variable',monospace;letter-spacing:2px;color:#829da6}.explosion-lab h1{font-size:34px;font-weight:550;letter-spacing:2px;margin:9px 0}.explosion-lab header p{font-size:13px;color:#9bb0b5;margin:0}.scope{font-size:10px;color:#bdd0bf;border:1px solid #48615d;padding:9px 13px;white-space:nowrap}.transport{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.transport button,.transport select{background:#1a303d;color:#b7cbd0;border:1px solid #3d5662;border-radius:4px;font:inherit;font-size:12px;padding:8px 13px;cursor:pointer}.transport .primary,.transport button[aria-pressed=true]{color:#132b32;background:#d9c086;border-color:#d9c086}.transport label{font-size:11px;display:flex;align-items:center;gap:7px;color:#9db6ba;margin-left:8px}.transport select{padding:7px 9px}.transport .check{gap:5px;margin-right:8px}.check input{accent-color:#d9c086}.state{font:10px 'JetBrains Mono Variable';color:#a7bfb7;margin-left:auto}.timeline{display:flex;align-items:center;gap:15px;margin:19px 0 17px;color:#91adb5;font:10px 'JetBrains Mono Variable'}.timeline span{width:49px}.timeline input{flex:1;min-width:0;accent-color:#d9c086;height:4px}.stages{position:relative;border:1px solid #34515e;border-radius:7px;overflow:hidden;height:540px;background:#102631}.stages :deep(canvas){display:block;width:100%;height:100%}.stage-labels{pointer-events:none;position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr)}.stage-labels article{position:relative;border-right:1px solid #678d9a30}.stage-labels article:last-child{border:none}.stage-title{padding:24px 23px;background:linear-gradient(#102631dc,transparent)}.stage-title small{font:8px 'JetBrains Mono Variable';letter-spacing:1.4px;color:var(--accent)}.stage-title h2{font-size:23px;font-weight:500;margin:7px 0}.stage-foot{display:flex;justify-content:space-between;position:absolute;bottom:0;left:0;right:0;padding:18px 23px;font:10px 'JetBrains Mono Variable';color:#a9c5ca;background:linear-gradient(transparent,#0d2633c9)}.stage-foot span:first-child{color:var(--accent)}.notice{position:absolute;left:25px;top:40%;z-index:1}.effect-notes{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:18px}.effect-notes article{display:flex;align-items:center;gap:10px}.effect-notes span{width:4px;height:25px;border-radius:2px;flex:none}.effect-notes p{font-size:12px;color:#adc0c4;margin:0}footer{display:flex;justify-content:space-between;gap:15px;margin-top:23px;padding-top:15px;border-top:1px solid #2c424d;font-size:10px;color:#7f9ba4}@media(max-width:700px){.explosion-lab{padding:20px 12px}.explosion-lab header{display:block;margin-bottom:18px}.explosion-lab h1{font-size:27px}.scope{display:inline-block;margin-top:15px}.explosion-lab header small{font-size:8px;letter-spacing:1px}.transport{gap:6px}.transport button{padding:8px 10px;font-size:11px}.transport label{margin-left:0}.state{margin-left:0;flex:1;text-align:right;font-size:9px}.stages{height:1050px}.stage-labels{grid-template-columns:1fr;grid-template-rows:repeat(3,1fr)}.stage-labels article{border-right:none;border-bottom:1px solid #678d9a40}.stage-title{padding:17px 17px}.stage-title h2{font-size:21px;margin:5px 0}.stage-foot{padding:14px 17px}.effect-notes{grid-template-columns:1fr;gap:10px}.effect-notes p{font-size:11px}footer{display:block;line-height:1.9}footer span{display:block}}
</style>
