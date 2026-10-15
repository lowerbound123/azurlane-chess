<script setup lang="ts">
import {ref,computed,onBeforeUnmount,toRaw} from 'vue';
import * as E from '../engine.ts';
import type {BattleFrame,Game} from '../../shared/game.ts';
import type {MapModel} from '../../shared/render.ts';
import {applyStatus,clearStatuses,effectiveSpeed} from '../../shared/status.ts';
import BattleMap3D from '../BattleMap3D.vue';
import {playFrames} from '../playback.ts';
const game=ref<Game>(fixture()),frame=ref<BattleFrame|null>(null),hidden=ref(false),busy=ref(false),commands=ref(0),map=ref<InstanceType<typeof BattleMap3D>|null>(null);
let stop:(()=>void)|undefined;
function fixture(){
 const g=E.createFleetGame();g.phase='plan';g.round=5;g.map.islands=[];g.map.mines=[];
 g.ships=[E.createCatalogShip('dd-2',0,0,{q:3,r:7}),E.createCatalogShip('cv-1',0,1,{q:6,r:5}),E.createCatalogShip('bb-1',1,0,{q:9,r:8})];
 g.ships.forEach(s=>{delete s.cfg.secondary;delete s.cfg.aa;});
 const definitions=[
  {id:'boost',name:'引擎强化 · 示例',kind:'buff' as const,icon:'up',effects:[{kind:'speed' as const,value:1}]},
  {id:'repair',name:'持续修复 · 示例',kind:'buff' as const,icon:'plus',effects:[{kind:'periodicHeal' as const,value:3}]},
  {id:'vision',name:'强化观察 · 示例',kind:'buff' as const,icon:'eye',effects:[{kind:'vision' as const,value:1}]},
  {id:'attack',name:'火力强化 · 示例',kind:'buff' as const,icon:'target',effects:[{kind:'outgoingDamage' as const,value:.2}]},
  {id:'damage',name:'持续受损 · 示例',kind:'debuff' as const,icon:'warning',effects:[{kind:'periodicDamage' as const,value:2}]},
  {id:'defense',name:'临时防护 · 示例',kind:'buff' as const,icon:'shield',effects:[{kind:'incomingDamage' as const,value:-.2}]},
 ];
 definitions.forEach((d,i)=>applyStatus(g.ships[0],{...d,description:'只用于状态系统验收，不绑定正式舰船技能。',priority:10-i,maxStacks:d.id==='repair'?3:1},{round:5,duration:2,source:{unitId:g.ships[1].id,name:g.ships[1].label}}));
 applyStatus(g.ships[0],{...definitions[1],description:'叠层示例',maxStacks:3,priority:9},{round:5,duration:3,source:{unitId:g.ships[0].id,name:g.ships[0].label}});
 applyStatus(g.ships[2],{...definitions[4],description:'来源不可见时不显示来源身份。'},{round:5,duration:2,source:{unitId:'hidden-source',name:'不可见来源'}});
 const mother=g.ships[1];mother.airReady[0]=Infinity;g.planes=[{id:'preview-plane',kind:'plane',team:0,mother:mother.id,slot:0,hp:3,cfg:{...mother.cfg.carrier!.plane},xy:E.hexToXY({q:6,r:8}),mode:'point',target:{q:12,r:8},targetId:null,tracking:false,state:'outbound',traveled:0,waypoints:[]}];
 applyStatus(g.planes[0],{...definitions[2],description:'飞机的独立状态。'},{round:5,duration:2});
 applyStatus(mother,{...definitions[5],description:'下回合才生效的示例。'},{round:5,phase:'execute',duration:1});
 return g;
}
const model=computed<MapModel>(()=>({map:game.value.map,cells:E.allHexes(game.value.map).map(h=>({...h,k:E.key(h),known:true,visible:true,island:false})),ships:(frame.value?.ships??game.value.ships).filter(s=>s.hp>0&&(!hidden.value||s.team===0)),planes:frame.value?.planes??game.value.planes,torpedoes:frame.value?.torpedoes??game.value.torpedoes,mines:[],round:frame.value?.round??game.value.round,myTeam:0,selected:'0-0',phase:busy.value?'execute':'plan',mode:'move',previews:[],mainTargets:[],rays:[],showPlans:false,showRanges:false,overlayType:'',busy:busy.value,airRange:null,visuals:{}}));
function reset(){stop?.();frame.value=null;busy.value=false;game.value=fixture();commands.value=0;hidden.value=false;}
function clear(){for(const u of [...game.value.ships,...game.value.planes])clearStatuses(u);}
function play(){if(busy.value)return;busy.value=true;const g=E.clone(toRaw(game.value)),ship=g.ships[0],result=E.resolveRound(g,{[ship.id]:{...E.emptyPlan(),moves:Array.from({length:Math.min(2,effectiveSpeed(ship,g.round))},()=>({turn:0,forward:true}))}});stop=playFrames(result.frames,{speed:()=>1,render:f=>frame.value=f,complete:()=>{game.value=result.game;frame.value=null;busy.value=false;}});}
onBeforeUnmount(()=>stop?.());
</script>
<template><main class="status-preview"><header><div><small>DEVELOPMENT PREVIEW</small><h1>单位状态系统</h1><p>第 {{game.round}} 回合 · {{busy?'正在播放':'悬浮图标查看详情'}} · 地图指令 {{commands}}</p></div><nav><button @click="reset">重置演示</button><button :disabled="busy" @click="play">播放回合</button><button @click="hidden=!hidden">{{hidden?'显示敌方':'隐藏敌方'}}</button><button :disabled="busy" @click="clear">清除状态</button><button @click="map?.zoomBy(1.3)">放大</button><button @click="map?.reset()">复位镜头</button></nav></header><BattleMap3D ref="map" :model="model" @hex="commands++" @ship="commands++" @undo="commands++"/><footer>舰船与飞机使用正式地图渲染及状态组件。示例状态只在此开发页面创建。</footer></main></template>
<style scoped>
.status-preview{padding:20px;min-height:100vh;background:#071724;color:#d8e4eb}.status-preview header{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:16px}.status-preview h1{font-size:25px;margin:5px 0}.status-preview small{color:#80bcad;letter-spacing:2px}.status-preview p,.status-preview footer{font-size:12px;color:#a7bcc8}.status-preview nav{display:flex;flex-wrap:wrap;gap:6px;max-width:480px}.status-preview button{padding:8px 12px;border:1px solid #4a6c80;background:#143044;border-radius:6px;color:#d9e6ee;cursor:pointer}.status-preview button:disabled{opacity:.4}.status-preview .battle-map-3d{height:calc(100dvh - 180px);min-height:380px}.status-preview footer{padding-top:12px}@media(max-width:600px){.status-preview{padding:10px}.status-preview header{display:block}.status-preview nav{margin-top:10px}.status-preview .battle-map-3d{height:65dvh;min-height:320px}}
</style>
