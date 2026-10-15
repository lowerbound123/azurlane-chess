<script setup lang="ts">
import {ref,computed,onMounted,onBeforeUnmount} from 'vue';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {disposeTree} from '../scene/resources.ts';

const variants=[
 {id:'mk14',name:'常规潜射型',reference:'MK 14',number:'01',color:'#8fa8ac',length:3.60,notes:['圆钝雷首与渐缩尾段','环形接缝、检修盖与铭牌','十字尾舵、双组反向桨'],url:new URL('../../assets/models/torpedoes/mk14.glb',import.meta.url).href,source:'https://navalunderseamuseum.org/mk-14/'},
 {id:'type93',name:'细长重型',reference:'TYPE 93',number:'02',color:'#b9c7b4',length:5.17,notes:['最长的细长雷体','深色雷首与银灰壳段','分段紧固环、三叶双桨'],url:new URL('../../assets/models/torpedoes/type93.glb',import.meta.url).href,source:'https://www.history.navy.mil/our-collections/photography/numerical-list-of-images/nhhc-series/nh-series/NH-94000/NH-94125.html'},
 {id:'g7e',name:'电动潜射型',reference:'G7e / T3',number:'03',color:'#c9a17d',length:4.14,notes:['暖铜色雷首、钢色筒身','雷首触角外形与端帽','检修口、细长尾舵与双桨'],url:new URL('../../assets/models/torpedoes/g7e.glb',import.meta.url).href,source:'https://www.flickr.com/photos/zaruka/54463383260'},
 {id:'mk13',name:'航空投放型',reference:'MK 13',number:'04',color:'#c3b076',length:2.36,notes:['短粗雷体、环形尾部护罩','独立木质头套与箱形尾套','投放附件可隐藏，查看本体'],url:new URL('../../assets/models/torpedoes/mk13.glb',import.meta.url).href,source:'https://navalunderseamuseum.org/mk-13/'},
];
const selected=ref(0),active=computed(()=>variants[selected.value]),host=ref<HTMLElement|null>(null),ready=ref(false),error=ref(''),viewMode=ref('angle'),spinning=ref(false),attachments=ref(true),all=ref(false);
let renderer:THREE.WebGLRenderer|undefined,controls:OrbitControls|undefined,observer:ResizeObserver|undefined,environment:THREE.WebGLRenderTarget|undefined,dead=false;
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-3,3,2,-2,.01,100),models:THREE.Group[]=[];
let half=1.8;
function fit(){if(!renderer||!host.value)return;const {clientWidth:w,clientHeight:h}=host.value;if(!w||!h)return;renderer.setSize(w,h,false);camera.left=-half*w/h;camera.right=half*w/h;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();}
function setView(mode:string){
 viewMode.value=mode;if(!controls||!host.value)return;
 const length=active.value.length,aspect=host.value.clientWidth/host.value.clientHeight;
 let target=new THREE.Vector3();let offset=new THREE.Vector3(-3.2,2.3,5.5);
 half=Math.max(.70,length*.62/aspect);camera.zoom=1;
 if(all.value){half=Math.max(2.4,3.2/aspect);offset.set(-2,7,7);}
 else if(mode==='side')offset.set(0,.001,8);
 else if(mode==='tail'){target.set(-length/2+.16,0,0);offset.set(-3.2,1.6,3.5);half=Math.max(.34,.53/aspect);}
 else if(mode==='nose'){target.set(length/2-.15,0,0);offset.set(3.2,1.6,4.5);half=Math.max(.38,.59/aspect);}
 camera.position.copy(target).add(offset);controls.target.copy(target);camera.up.set(0,1,0);camera.lookAt(target);controls.update();fit();
}
function updateVisibility(){
 models.forEach((model,i)=>{model.visible=all.value||i===selected.value;model.position.set(0,0,all.value?(i-1.5)*1.2:0);model.traverse(o=>{if(o.userData.displayAttachment)o.visible=attachments.value;});});
}
function select(i:number){selected.value=i;all.value=false;updateVisibility();setView('angle');}
function compare(){all.value=!all.value;updateVisibility();setView('angle');}
function toggleAttachments(){attachments.value=!attachments.value;updateVisibility();}
onMounted(async()=>{
 try{
  const loader=new GLTFLoader();
  const loaded=await Promise.allSettled(variants.map(v=>loader.loadAsync(v.url)));
  const success=loaded.filter((r):r is PromiseFulfilledResult<Awaited<ReturnType<typeof loader.loadAsync>>>=>r.status==='fulfilled');
  if(dead||success.length!==variants.length){success.forEach(r=>disposeTree(r.value.scene));if(!dead)throw new Error('鱼雷模型加载失败，请刷新重试。');return;}
  models.push(...success.map(r=>r.value.scene));models.forEach(m=>scene.add(m));
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xffffff,0);
  renderer.domElement.setAttribute('aria-label','鱼雷外观三维模型，拖动旋转，滚轮缩放');renderer.domElement.setAttribute('role','img');host.value!.prepend(renderer.domElement);
  const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xe7f1fb,0x77715f,2));const sun=new THREE.DirectionalLight(0xffefd5,3);sun.position.set(2,5,4);scene.add(sun);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minZoom=.7;controls.maxZoom=4;controls.enablePan=true;
  observer=new ResizeObserver(()=>{fit();});observer.observe(host.value!);updateVisibility();setView('angle');let last=0;
  renderer.setAnimationLoop(time=>{
   const delta=last?Math.min((time-last)/1000,.1):0;last=time;controls!.update();
   if(spinning.value)for(const model of models)model.traverse(o=>{if(o.userData.torpedoPropeller)o.rotation.x+=delta*8*Number(o.userData.spinDirection);});
   renderer!.render(scene,camera);
  });
  ready.value=true;renderer.domElement.dataset.torpedoReady='true';
 }catch(e){error.value=e instanceof Error?e.message:String(e);}
});
onBeforeUnmount(()=>{dead=true;renderer?.setAnimationLoop(null);observer?.disconnect();controls?.dispose();disposeTree(scene);environment?.dispose();renderer?.dispose();});
</script>
<template>
 <main class="torpedo-study">
  <header><div><small class="eyebrow">AZURLANE CHESS / NAVAL ORDNANCE STUDIES</small><h1>鱼雷构型研究<span>04</span></h1><p>从真实轮廓出发，把细节留给近看。</p></div><span class="scope"><i/>独立美术模型 · 尚未接入游戏</span></header>
  <div class="workbench">
   <aside aria-label="选择鱼雷构型"><button v-for="(v,i) in variants" :key="v.id" :aria-pressed="!all&&selected===i" :style="{'--accent':v.color}" @click="select(i)"><span class="index">{{v.number}}</span><div><small>{{v.reference}}</small><strong>{{v.name}}</strong></div><span class="arrow">↗</span></button><div class="source-note"><span>REFERENCE-LED / ORIGINAL MESHES</span><p>参考馆藏与历史照片制作。分缝、紧固件和材质为便于观察做了艺术化处理。</p></div></aside>
   <section class="stage-shell">
    <div class="stage-heading"><div><small>{{all?'SAME-SCALE COMPARISON':active.reference+' / EXTERIOR STUDY'}}</small><h2>{{all?'四构型 · 同比例对照':active.name}}</h2></div><span class="stage-tag">{{all?'01—04':'0'+(selected+1)}}</span></div>
    <nav aria-label="观察角度"><button :aria-pressed="!all&&viewMode==='angle'" @click="all=false;updateVisibility();setView('angle')">斜视</button><button :aria-pressed="!all&&viewMode==='side'" @click="all=false;updateVisibility();setView('side')">侧视</button><button :aria-pressed="!all&&viewMode==='nose'" @click="all=false;updateVisibility();setView('nose')">雷首细节</button><button :aria-pressed="!all&&viewMode==='tail'" @click="all=false;updateVisibility();setView('tail')">尾部细节</button><button :aria-pressed="all" @click="compare">同尺度对照</button></nav>
    <div ref="host" class="model-stage"><span class="axis">TAIL ← &nbsp; LONGITUDINAL AXIS &nbsp; → NOSE</span><p v-if="!ready&&!error" class="notice" role="status">正在加载独立模型库…</p><p v-if="error" class="notice" role="alert">{{error}}</p><span class="view-hint">拖动旋转 · 滚轮缩放</span></div>
    <div class="stage-controls"><button :aria-pressed="spinning" @click="spinning=!spinning">{{spinning?'暂停双桨':'转动双桨'}}</button><button v-if="selected===3||all" :aria-pressed="attachments" @click="toggleAttachments">{{attachments?'拆下投放附件':'装回投放附件'}}</button><span>外观与展示动画，不含游戏行为</span></div>
   </section>
  </div>
  <section class="detail-strip"><div><small>FORM & DETAIL</small><h3>{{all?'四种用途，四种比例':active.reference+' · 外形要点'}}</h3></div><ul><li v-for="note in (all?['保留各型长径比例差异','尾部结构与雷首形态独立设计','航空型附件可拆下查看']:active.notes)" :key="note">{{note}}</li></ul><a :href="active.source" target="_blank" rel="noopener noreferrer">查看参考资料 ↗</a></section>
  <footer><span>EDITABLE BLENDER SOURCE + FOUR INDEPENDENT GLB MODELS</span><span>壳体分段 / 表面盖板 / 尾舵 / 反向双桨</span></footer>
 </main>
</template>
<style scoped>
.torpedo-study{min-height:100dvh;padding:30px clamp(14px,4vw,64px);background:#101e27;color:#e8e7dd;font-family:'Saira Variable',system-ui,sans-serif}.torpedo-study header{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:28px}.eyebrow,.scope,.source-note span,footer{font:10px/1.7 'JetBrains Mono Variable',monospace;letter-spacing:1px}.eyebrow{color:#9caeae}.torpedo-study h1{font-size:35px;letter-spacing:3px;font-weight:550;margin:7px 0}.torpedo-study h1 span{display:inline-block;color:#738b90;font:17px 'JetBrains Mono Variable';margin-left:17px;vertical-align:top;padding-top:6px}.torpedo-study header p{color:#9caaa9;font-size:13px;margin:0}.scope{border:1px solid #53645c;padding:8px 13px;color:#b7c7ab;white-space:nowrap}.scope i{display:inline-block;width:6px;height:6px;background:#b7c7ab;margin-right:8px;border-radius:50%}.workbench{display:grid;grid-template-columns:245px 1fr;gap:22px}.workbench aside{display:flex;flex-direction:column;gap:10px}.workbench aside button{display:flex;align-items:center;gap:14px;text-align:left;padding:22px 15px;background:#182d36;border:1px solid #334a51;border-radius:5px;cursor:pointer;color:#d9e1db}.workbench aside button[aria-pressed=true]{border-color:var(--accent);background:#263d43;box-shadow:inset 3px 0 var(--accent)}.index{font:12px 'JetBrains Mono Variable';color:var(--accent)}.workbench aside button small{display:block;color:var(--accent);font:10px 'JetBrains Mono Variable';letter-spacing:1.5px}.workbench aside button strong{display:block;font-size:17px;margin-top:6px;font-weight:500}.arrow{margin-left:auto;color:#829590}.source-note{padding:15px 5px}.source-note span{font-size:8px;color:#829a9a}.source-note p{font-size:12px;line-height:1.8;color:#9eaeac}.stage-shell{overflow:hidden;border:1px solid #526361;border-radius:6px;background:#c4ccc4;color:#263b3d}.stage-heading{display:flex;justify-content:space-between;padding:21px 26px 11px}.stage-heading small{font:9px 'JetBrains Mono Variable';letter-spacing:1.5px;color:#596f6b}.stage-heading h2{font-size:24px;margin:6px 0 0;font-weight:550}.stage-tag{font:38px 'JetBrains Mono Variable';color:#8b9d93}.stage-shell nav{display:flex;gap:5px;flex-wrap:wrap;padding:0 26px}.stage-shell button{font:inherit;font-size:11px;padding:7px 11px;border:1px solid #9daea4;border-radius:3px;cursor:pointer;color:#344d4d;background:#d5dcd3}.stage-shell button[aria-pressed=true]{background:#2a4748;color:#edf0df;border-color:#2a4748}.model-stage{height:460px;position:relative;background:radial-gradient(ellipse at 50% 42%,#e3e5d9 0%,transparent 68%),repeating-linear-gradient(0deg,transparent,transparent 39px,#687d7210 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#687d7210 40px)}.model-stage :deep(canvas){width:100%;height:100%;display:block;touch-action:none}.axis,.view-hint{position:absolute;pointer-events:none;left:26px;font:8px 'JetBrains Mono Variable';letter-spacing:1.2px;color:#6d8178}.axis{top:20px}.view-hint{bottom:14px}.notice{position:absolute;top:42%;left:20%;font-size:13px}.stage-controls{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:13px 26px;border-top:1px solid #a3b2a7}.stage-controls span{font-size:10px;color:#667a70;margin-left:auto}.detail-strip{display:flex;align-items:center;gap:40px;border-top:1px solid #365058;border-bottom:1px solid #365058;margin-top:22px;padding:21px 0}.detail-strip small{color:#9fbaac;font:9px 'JetBrains Mono Variable';letter-spacing:1.5px}.detail-strip h3{font-size:17px;font-weight:500;margin:5px 0}.detail-strip ul{list-style:none;display:flex;gap:25px;flex:1;font-size:12px;color:#b4c5be;padding:0;margin:0}.detail-strip li::before{content:'＋';color:#c9b67f;margin-right:7px}.detail-strip a{color:#c9b67f;font-size:11px;text-decoration:none;white-space:nowrap}footer{display:flex;justify-content:space-between;color:#7e9897;font-size:8px;margin-top:17px;gap:15px}@media(max-width:1000px){.workbench{grid-template-columns:195px 1fr;gap:15px}.detail-strip{gap:20px}.detail-strip ul{display:block;line-height:1.9}.scope{font-size:9px}.model-stage{height:420px}}@media(max-width:650px){.torpedo-study{padding:20px 12px}.torpedo-study header{display:block;margin-bottom:20px}.torpedo-study h1{font-size:29px}.eyebrow{font-size:8px}.scope{display:inline-block;margin-top:14px}.workbench{display:block}.workbench aside{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:15px}.workbench aside button{padding:12px 10px;gap:10px}.workbench aside button strong{font-size:15px}.workbench aside button small{font-size:8px}.source-note{display:none}.stage-heading{padding:16px 16px 10px}.stage-heading h2{font-size:21px}.stage-shell nav{padding:0 14px;gap:4px}.stage-shell button{padding:7px 8px;font-size:10px}.model-stage{height:340px}.stage-controls{padding:12px 14px}.stage-controls span{width:100%;margin:2px 0 0}.axis,.view-hint{left:16px;font-size:7px}.detail-strip{flex-wrap:wrap;gap:13px}.detail-strip ul{flex-basis:100%;order:3}.detail-strip a{margin-left:auto}.detail-strip h3{font-size:15px}footer{display:block;line-height:2}footer span{display:block}}
</style>
