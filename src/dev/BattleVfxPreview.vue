<script setup lang="ts">
import {ref,computed,onBeforeUnmount} from 'vue';
import * as E from '../engine.ts';
import {AIRCRAFT} from '../ship-definitions.ts';
import {sampleBattleVisuals} from '../battle-visuals.ts';
import {interpolateFrame} from '../playback.ts';
import BattleMap3D from '../BattleMap3D.vue';
import type {Game,Plane,Plans} from '../../shared/game.ts';
import type {MapModel} from '../../shared/render.ts';
const scenarios=[['support','烟幕 / 护航 / 雷达 / 侦察'],['heavy','七格重炮'],['main','三发主炮'],['torpedo','标准鱼雷命中'],['mine','移动触雷命中'],['bomb','飞机投弹'],['fighter','空中拦截'],['models','全部飞机模型']] as const;
const current=ref('support'),time=ref(.3),playing=ref(false),hidden=ref(false),speed=ref(1);
let raf=0,last=0;
const h=(q:number,r:number)=>({q,r});
function fixture(id:string){
 const g=E.createFleetGame();g.phase='plan';g.map={width:12,height:10,islands:[],mines:[]};g.zones=[];g.planes=[];g.torpedoes=[];
 const a=E.createCatalogShip(id==='heavy'?'bb-2':id==='main'?'bb-1':id==='mine'?'ca-2':'cv-2',0,0,h(2,5)),b=E.createShip('ca',1,0,h(6,5));b.hp=600;b.cfg.hp=600;g.ships=[a,b];const plans:Plans={};
 const plane=(role:string,team:number,xy:Plane['xy'],slot=0):Plane=>({id:`${role}-${team}-${slot}`,kind:'plane',team,mother:team===0?a.id:b.id,slot,hp:AIRCRAFT[role].hp,cfg:{...AIRCRAFT[role]},xy,mode:'point',target:h(9,5),targetId:null,tracking:false,state:'outbound',traveled:0,waypoints:[]});
 if(id==='support'){
  g.ships=[E.createCatalogShip('dd-3',0,0,h(2,4)),E.createCatalogShip('cl-3',0,1,h(4,3)),E.createCatalogShip('ca-2',0,2,h(4,6)),E.createCatalogShip('bb-1',0,3,h(5,6)),a,b];a.pos=h(2,7);a.xy=E.hexToXY(a.pos);a.id='mother';
  for(const s of g.ships){if(s.cfg.smoke)plans[s.id]={...E.emptyPlan(),smoke:true};if(s.cfg.radar)plans[s.id]={...E.emptyPlan(),radar:h(6,3)};if(s.cfg.escort)plans[s.id]={...E.emptyPlan(),escort:true};}
  const scout=plane('scout',0,E.hexToXY(h(6,3)));scout.mother=a.id;scout.cfg.speed=.01;g.planes=[scout];
 }else if(id==='heavy'||id==='main')plans[a.id]={...E.emptyPlan(),main:Array.from({length:a.cfg.main!.shots},()=>({...b.pos}))};
 else if(id==='mine'){g.map.mines=[{...a.pos},h(10,1)];plans[a.id]={...E.emptyPlan(),moves:[{turn:0,forward:true},{turn:0,forward:true}]};}
 else if(id==='torpedo')g.torpedoes=[{id:'mk14',kind:'torpedo',team:0,owner:a.id,xy:E.hexToXY(h(4,5)),heading:0,age:0,launched:1,birth:0,armed:true,cfg:{speed:4,damage:45,life:3,reserve:3,max:3}}];
 else if(id==='bomb')g.planes=[plane('heavy',0,E.hexToXY(h(5,5)))];
 else if(id==='fighter'){g.planes=[plane('fighter',0,E.hexToXY(h(4,4))),plane('bomber',1,E.hexToXY(h(5,4)))];g.planes.forEach(p=>{p.cfg.speed=.01;});}
 else g.planes=['bomber','heavy','fighter','scout'].map((role,i)=>{const p=plane(role,0,E.hexToXY(h(3+i*2,3)),i);p.cfg.speed=.01;return p;});
 for(const s of g.ships){delete s.cfg.secondary;delete s.cfg.aa;}
 return {game:g,result:E.resolveRound(g,plans)};
}
const data=ref(fixture('support'));
const duration=computed(()=>data.value.result.frames.at(-1)!.t);
const frame=computed(()=>{const frames=data.value.result.frames,index=Math.max(0,frames.findLastIndex(f=>f.t<=time.value)),next=frames[index+1],from=frames[index];return interpolateFrame(from,next,next?(time.value-from.t)/(next.t-from.t):0);});
const model=computed<MapModel>(()=>{const g=data.value.game,f=frame.value,cells=E.allHexes(g.map).map(p=>({...p,k:E.key(p),known:!hidden.value||p.q<4,visible:!hidden.value||p.q<4,island:false})),seen=new Set(cells.filter(c=>c.visible).map(E.key));return{map:g.map,cells,ships:f.ships.filter(s=>s.team===0||seen.has(E.key(s.pos))),planes:f.planes.filter(p=>p.team===0||seen.has(E.key(E.xyToHex(p.xy)))),torpedoes:f.torpedoes.filter(p=>seen.has(E.key(E.xyToHex(p.xy)))),mines:f.mines,zones:f.zones,round:g.round,visualTime:time.value,myTeam:0,selected:'',phase:'execute',mode:'move',previews:[],mainTargets:[],rays:[],showPlans:false,showRanges:false,overlayType:'',busy:true,airRange:null,visuals:sampleBattleVisuals(data.value.result.presentation,time.value,seen,0,[...f.ships,...f.planes].filter(u=>u.team===0||seen.has(E.key(E.xyToHex(u.xy)))))};});
function choose(id:string){playing.value=false;current.value=id;data.value=fixture(id);const event=data.value.result.presentation.find(e=>e.type==='effect'&&['main','main-blast','bomb','fighter','torpedo'].includes(e.kind));time.value=event?.type==='effect'?event.time+event.duration*.28:.3;}
function animate(now:number){if(playing.value){time.value+=Math.min((now-last)/1000,.05)*speed.value;if(time.value>=duration.value){time.value=duration.value;playing.value=false;}}last=now;raf=requestAnimationFrame(animate);}raf=requestAnimationFrame(animate);onBeforeUnmount(()=>cancelAnimationFrame(raf));
</script>
<template><main class="battle-vfx"><header><h1>战斗特效接入验证</h1><p>正式 3D 地图、实际回合事件、最新鱼雷与四种飞机模型。</p><nav><button v-for="s in scenarios" :key="s[0]" :data-scenario="s[0]" :aria-pressed="current===s[0]" @click="choose(s[0])">{{s[1]}}</button></nav></header><div class="controls"><button @click="playing=!playing">{{playing?'暂停':'播放'}}</button><button @click="time=0;playing=true">从头播放</button><label>慢放<select v-model.number="speed" aria-label="速度"><option :value="1">1×</option><option :value=".25">0.25×</option></select></label><label><input type="checkbox" v-model="hidden">隐藏右侧海域</label><input aria-label="回放时间" type="range" min="0" :max="duration" step=".001" v-model.number="time" @input="playing=false"><span>{{time.toFixed(3)}} s</span></div><BattleMap3D :model="model"/><footer>此页仅提供测试对局；特效和模型由正式战场渲染器加载。</footer></main></template>
<style scoped>.battle-vfx{background:#091b28;color:#d4e5e8;padding:20px;min-height:100vh}.battle-vfx h1{font-size:24px}.battle-vfx p,.battle-vfx footer{font-size:12px;color:#92b0bb}.battle-vfx nav,.controls{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.battle-vfx button,.battle-vfx select{padding:7px 10px;background:#193746;border:1px solid #416070;color:#c7dce1;border-radius:4px}.battle-vfx button[aria-pressed=true]{background:#3b696c}.controls{align-items:center;font-size:12px}.controls label{display:flex;align-items:center;gap:6px}.controls>input{flex:1;min-width:100px}.battle-vfx .battle-map-3d{height:68vh;min-height:360px}.battle-vfx footer{margin-top:12px}</style>
