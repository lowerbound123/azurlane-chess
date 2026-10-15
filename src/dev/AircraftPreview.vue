<script setup lang="ts">
import {ref,computed,onMounted,onBeforeUnmount} from 'vue';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {TacticalModels} from '../scene/tactical-models.ts';
import {disposeTree} from '../scene/resources.ts';
import {AIRCRAFT} from '../ship-definitions.ts';
import {allHexes,hexToXY} from '../engine.ts';
import type {AirRole} from '../../shared/game.ts';
import type {MapModel,RenderPlane} from '../../shared/render.ts';
import BattleMap3D from '../BattleMap3D.vue';

const variants:{role:AirRole;code:string;title:string;detail:string;color:string}[]=[
 {role:'fighter',code:'01 / INTERCEPTOR',title:'战斗机',detail:'紧凑机身 · 收尖机翼 · 朱红机首',color:'#ed876b'},
 {role:'bomber',code:'02 / DIVE BOMBER',title:'轰炸机',detail:'宽阔机翼 · 串列座舱 · 腹部挂弹',color:'#e4ba6c'},
 {role:'scout',code:'03 / RECONNAISSANCE',title:'侦察机',detail:'修长机翼 · 双浮筒 · 观察座舱',color:'#91d6c5'},
 {role:'heavy',code:'04 / HEAVY STRIKE',title:'强袭机',detail:'四台发动机 · 双垂尾 · 成对挂弹',color:'#b8c48c'},
];
const roleNames=variants.map(v=>v.title).join(' / ');
const host=ref<HTMLElement|null>(null),battle=ref(false),monochrome=ref(false),top=ref(false),paused=ref(false),error=ref(''),ready=ref(false),enemy=ref(false);
const map=ref<InstanceType<typeof BattleMap3D>|null>(null);
const dims={width:10,height:9};
const planes=computed<RenderPlane[]>(()=>variants.map(({role},i)=>({id:role,kind:'plane',team:enemy.value?1:0,mother:'preview',slot:i,hp:AIRCRAFT[role].hp,cfg:{...AIRCRAFT[role]},xy:hexToXY({q:3+i%2*3,r:3+Math.floor(i/2)*3}),mode:'point',target:{q:9,r:4},targetId:null,tracking:false,state:'outbound',traveled:0,waypoints:[],angle:0})));
const model=computed<MapModel>(()=>({map:dims,cells:allHexes(dims).map(h=>({...h,k:`${h.q},${h.r}`,known:true,visible:true,island:false})),ships:[],planes:planes.value,torpedoes:[],mines:[],myTeam:0,selected:'',phase:'plan',mode:'plane',previews:[],mainTargets:[],rays:[],showPlans:false,showRanges:false,overlayType:'',busy:false,airRange:null,visuals:{}}));
let renderer:THREE.WebGLRenderer|undefined,controls:OrbitControls|undefined,library:TacticalModels|undefined,observer:ResizeObserver|undefined,dead=false;
const camera=new THREE.OrthographicCamera(-1.55,1.55,1.25,-1.25,.01,40),scenes:THREE.Scene[]=[],props:THREE.Object3D[]=[];
const silhouette=new THREE.MeshBasicMaterial({color:0x101c29});
const originals=new Map<THREE.Mesh,THREE.Material|THREE.Material[]>();
function view(isTop:boolean){top.value=isTop;camera.position.set(isTop?0:2.5,isTop?8:4.5,isTop?.001:5.5);camera.up.set(0,1,0);camera.lookAt(0,0,0);controls?.target.set(0,0,0);controls?.update();}
function toggleSilhouette(){monochrome.value=!monochrome.value;for(const [mesh,mat]of originals)mesh.material=monochrome.value?silhouette:mat;}
function resize(){if(!renderer||!host.value)return;renderer.setSize(host.value.clientWidth,host.value.clientHeight,false);}
onMounted(async()=>{
 try{
  library=await TacticalModels.load();if(dead){library.dispose();return;}
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x172b39,0);
  renderer.domElement.setAttribute('aria-label','四种飞机的可旋转三维模型');renderer.domElement.setAttribute('role','img');renderer.domElement.dataset.aircraftReady='true';host.value!.prepend(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.minZoom=.8;controls.maxZoom=2;controls.enableDamping=true;
  variants.forEach(({role})=>{
   const scene=new THREE.Scene(),aircraft=library!.create('aircraft',role);scene.add(aircraft);
   aircraft.traverse(o=>{if(o instanceof THREE.Mesh)originals.set(o,o.material);if(o.userData.animatedPropeller)props.push(o);});
   scene.add(new THREE.HemisphereLight(0xeaf6ff,0x485565,2.5));const sun=new THREE.DirectionalLight(0xffe4bf,3.2);sun.position.set(2,5,3);scene.add(sun);scenes.push(scene);
  });
  view(false);observer=new ResizeObserver(resize);observer.observe(host.value!);resize();let previous=0;
  renderer.setAnimationLoop(time=>{
   const delta=previous?Math.min((time-previous)/1000,.1):0;previous=time;if(battle.value)return;
   controls!.update();if(!paused.value)props.forEach(p=>p.rotation.x+=delta*35);
   const width=host.value!.clientWidth,height=host.value!.clientHeight,w=width/2,h=height/2;
   camera.left=-1.35*w/h;camera.right=1.35*w/h;camera.top=1.35;camera.bottom=-1.35;camera.updateProjectionMatrix();
   renderer!.setScissorTest(true);
   scenes.forEach((scene,i)=>{const x=i%2*w,y=i<2?h:0;renderer!.setViewport(x,y,w,h);renderer!.setScissor(x,y,w,h);renderer!.render(scene,camera);});
  });
  ready.value=true;
 }catch(e){error.value=e instanceof Error?e.message:String(e);}
});
onBeforeUnmount(()=>{dead=true;renderer?.setAnimationLoop(null);observer?.disconnect();controls?.dispose();for(const [mesh,mat]of originals)mesh.material=mat;scenes.forEach(disposeTree);silhouette.dispose();library?.dispose();renderer?.dispose();});
</script>
<template>
 <main class="aircraft-review">
  <header><div><span class="eyebrow">AZURLANE CHESS / AIRCRAFT COLLECTION</span><h1>各有其形，各司其职。</h1><p>四种舰载机，以翼形、机身与发动机布局区分。</p></div><span class="edition">BLENDER → GLTF<br>MODEL STUDY · 04</span></header>
  <nav aria-label="模型预览操作">
   <button :aria-pressed="!battle" @click="battle=false">模型图鉴</button><button :aria-pressed="battle" @click="battle=true">真实战场</button>
   <template v-if="!battle"><span class="nav-divider"/><button :aria-pressed="!top" @click="view(false)">斜视</button><button :aria-pressed="top" @click="view(true)">俯视</button><button :aria-pressed="monochrome" @click="toggleSilhouette">纯色轮廓</button><button :aria-pressed="paused" @click="paused=!paused">{{paused?'启动螺旋桨':'暂停螺旋桨'}}</button></template>
   <template v-else><span class="nav-divider"/><button @click="map?.zoomBy(1.4)">放大</button><button @click="map?.toggleRotate()">旋转镜头</button><button @click="map?.reset()">复位</button><button @click="enemy=!enemy">{{enemy?'切为友方':'切为敌方'}}</button></template>
  </nav>
  <p v-if="error" role="alert">{{error}}</p>
  <section v-show="!battle" ref="host" class="gallery" :class="{silhouette:monochrome}">
   <p v-if="!ready&&!error" class="loading" role="status">正在加载四机型模型…</p>
   <div class="captions"><article v-for="v in variants" :key="v.role" :style="{'--accent':v.color}"><small>{{v.code}}</small><h2>{{v.title}}</h2><p>{{v.detail}}</p></article></div>
  </section>
  <BattleMap3D v-if="battle" ref="map" :model="model" class="battle-preview"/>
  <footer><span>{{battle?'正式地图渲染 · 当前展示 '+(enemy?'敌方':'友方')+'阵营':'拖动旋转 · 滚轮缩放 · 四款使用相同展示比例'}}</span><span>{{roleNames}}</span></footer>
 </main>
</template>
<style scoped>
.aircraft-review{min-height:100dvh;padding:30px clamp(16px,4vw,64px);background:#0e1c27;color:#e9e7df;font-family:'Saira Variable',system-ui,sans-serif}.aircraft-review header{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:26px}.eyebrow,.edition{font:10px/1.8 'JetBrains Mono Variable',monospace;letter-spacing:1.8px;color:#8fa7b5}.edition{text-align:right;color:#d4b77b}.aircraft-review h1{font-size:clamp(25px,3vw,38px);font-weight:600;letter-spacing:2px;margin:8px 0}.aircraft-review header p{font-size:13px;color:#9aadb8;margin:0}.aircraft-review nav{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:18px}.aircraft-review button{border:1px solid #38505f;color:#bbcad2;background:#172b39;padding:8px 14px;border-radius:4px;font:inherit;font-size:12px;cursor:pointer}.aircraft-review button[aria-pressed=true]{background:#d9bd80;color:#17202a;border-color:#d9bd80}.nav-divider{width:1px;height:24px;background:#38505f;margin:0 10px}.gallery{position:relative;height:min(68vh,760px);min-height:470px;border:1px solid #38505f;border-radius:8px;overflow:hidden;background:radial-gradient(ellipse at 28% 20%,#294350,transparent 45%),radial-gradient(ellipse at 78% 85%,#233a3b,transparent 48%),#172b39}.gallery.silhouette{background:#c7d2cf}.gallery :deep(canvas){width:100%;height:100%;display:block}.captions{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;pointer-events:none}.captions article{padding:20px 24px;position:relative;border-bottom:1px solid #68818b30}.captions article:nth-child(odd){border-right:1px solid #68818b30}.captions small{font:9px 'JetBrains Mono Variable',monospace;letter-spacing:1.5px;color:var(--accent)}.captions h2{font-size:21px;line-height:1.4;margin:5px 0;font-weight:500}.captions p{position:absolute;bottom:15px;margin:0;font-size:11px;color:#a7bac5}.silhouette .captions h2,.silhouette .captions small,.silhouette .captions p{color:#293e4b}.loading{position:absolute;top:45%;left:25%;z-index:1}.battle-preview{height:min(68vh,760px);min-height:470px}.aircraft-review footer{display:flex;justify-content:space-between;gap:12px;font-size:10px;color:#8fa7b5;padding-top:14px}@media(max-width:600px){.aircraft-review{padding:20px 12px}.edition{display:none}.aircraft-review header{margin-bottom:18px}.aircraft-review h1{font-size:25px}.aircraft-review nav{gap:5px}.aircraft-review button{padding:7px 9px;font-size:11px}.nav-divider{margin:0 3px}.gallery{height:520px;min-height:0}.captions article{padding:13px 12px}.captions small{font-size:7px;letter-spacing:.3px}.captions h2{font-size:18px}.captions p{font-size:9px;bottom:12px;max-width:150px}.aircraft-review footer{display:block;line-height:1.9}.aircraft-review footer span{display:block}.battle-preview{height:520px;min-height:0}}
</style>
