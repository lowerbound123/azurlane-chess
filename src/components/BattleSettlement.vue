<script setup lang="ts">
import {computed,nextTick,onBeforeUnmount,onMounted,ref,watch} from 'vue';
import * as THREE from 'three';
import type {FrameShip} from '../../shared/game.ts';
import {CharacterLibrary,ShipCharacter} from '../characters/spine.ts';
import {profileFor} from '../characters/config.ts';
import {shipCharacterProfile} from '../ship-art.ts';
import {settlementAction,settlementFormation,type SettlementSlot} from '../scene/settlement-layout.ts';

const props=defineProps<{ships:FrameShip[];myTeam:number;winner:number|'draw'|null;scenarioId?:string}>();
const emit=defineEmits<{close:[]}>();
const dialog=ref<HTMLDialogElement>(),stage=ref<HTMLElement>(),closeButton=ref<HTMLButtonElement>();
const sceneFailed=ref(false),states=ref<Record<string,'loading'|'ready'|'failed'>>({});
const title=computed(()=>props.winner==='draw'?'双方平局':props.winner===null?'战斗结束':props.winner===props.myTeam?'作战胜利':'作战失利');
const teams=computed(()=>{
 const enemy=props.ships.find(ship=>ship.team!==props.myTeam)?.team??(props.myTeam===0?1:0);
 return [{team:props.myTeam,friendly:true,side:'friendly'},{team:enemy,friendly:false,side:'enemy'}].map(team=>{
  const slots=settlementFormation(props.ships,team.team,team.friendly),rows=slots[0]?.rows??2;
  const roles:('front'|'back')[]=team.friendly?['back','front']:['front','back'];
  const prefix=team.friendly?'我方':'敌方';
  return {...team,slots,rows,name:prefix+'舰队',result:props.winner==='draw'?'双方平局':props.winner===null?'战斗结束':prefix+(props.winner===team.team?'胜利':'战败'),
   rowLabels:Array.from({length:rows},(_,row)=>({row,role:slots.find(slot=>slot.row===row)?.role??roles[Math.min(row,1)]!}))};
 });
});
const notice=computed(()=>sceneFailed.value?'动画场景暂时无法显示，可继续查看战场。':Object.values(states.value).includes('loading')?'正在集结双方参战舰船…':Object.values(states.value).includes('failed')?'部分角色未能加载，可继续查看战场。':'本场完整参战编队，包含阵亡舰船。');

interface ActorView {actor:ShipCharacter;slot:SettlementSlot;bounds?:{x:number;y:number;width:number;height:number}}
const formations=new Map<number,HTMLElement>(),actors=new Map<string,ActorView>();
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(0,900,400,0,.1,100);
camera.position.z=20;
let renderer:THREE.WebGLRenderer|undefined,library:CharacterLibrary|undefined,observer:ResizeObserver|undefined;
let frame=0,lastTime=0,generation=0,closed=false,returnFocus:HTMLElement|null=null;

function setFormation(team:number,element:unknown){if(element instanceof HTMLElement)formations.set(team,element);else formations.delete(team);}
function releaseActors(){
 for(const {actor} of actors.values()){actor.dispose();actor.root.removeFromParent();}
 actors.clear();
}
function releaseScene(){
 generation++;if(frame)cancelAnimationFrame(frame);frame=0;
 observer?.disconnect();observer=undefined;
 window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);
 releaseActors();scene.clear();library?.dispose();library=undefined;
 if(renderer){
  renderer.domElement.removeEventListener('webglcontextlost',contextLost);
  renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();renderer=undefined;
 }
}
function failScene(){sceneFailed.value=true;releaseScene();}
function contextLost(event:Event){event.preventDefault();failScene();}
function close(){
 if(closed)return;closed=true;releaseScene();
 if(dialog.value?.open)dialog.value.close();
 if(returnFocus?.isConnected)returnFocus.focus();
 emit('close');
}

function resize(){
 if(!renderer||!stage.value||closed)return;
 try{
  const host=stage.value.getBoundingClientRect(),width=Math.max(1,host.width||stage.value.clientWidth||900),height=Math.max(1,host.height||stage.value.clientHeight||400);
  renderer.setSize(width,height,false);camera.right=width;camera.top=height;camera.updateProjectionMatrix();
  for(const view of actors.values()){
   const {actor,slot,bounds}=view,formation=formations.get(slot.ship.team);
   if(!formation||!bounds||!actor.mesh)continue;
   const area=formation.getBoundingClientRect(),rowHeight=area.height/slot.rows;
   if(!(area.width>0&&rowHeight>0))continue;
   const rowSize=teams.value.find(team=>team.team===slot.ship.team)?.slots.filter(other=>other.row===slot.row).length??3;
   const heightLimit=rowHeight*.62,widthLimit=area.width/Math.max(3,rowSize+1)*1.05;
   const scale=Math.min(heightLimit/bounds.height,widthLimit/bounds.width);
   actor.root.scale.setScalar(scale);
   actor.root.position.set(area.left-host.left+slot.x*area.width-bounds.x*scale,height-(area.top-host.top+slot.y*area.height-34)-bounds.y*scale,.01*(slot.rows-slot.row));
  }
  renderer.render(scene,camera);
 }catch{failScene();}
}
function animate(time:number){
 frame=0;if(closed||!renderer)return;
 try{
  const delta=lastTime?Math.min(.1,Math.max(0,(time-lastTime)/1000)):0;lastTime=time;
  for(const {actor} of actors.values())actor.tick(delta,camera);
  renderer.render(scene,camera);
  if(!document.hidden)frame=requestAnimationFrame(animate);
 }catch{failScene();}
}
function visibility(){
 if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}
 else if(renderer&&!closed&&!frame){lastTime=0;frame=requestAnimationFrame(animate);}
}
function applyActions(){for(const {actor,slot} of actors.values())actor.setAction(settlementAction(slot.ship.team,props.winner));}
function rebuild(){
 if(!library||!renderer||closed)return;
 const version=++generation;releaseActors();states.value={};
 for(const team of teams.value)for(const slot of team.slots){
  const identity=shipCharacterProfile(slot.ship,props.scenarioId),profile=profileFor(identity);
  const actor=new ShipCharacter(library,identity,team.friendly?0x70dfd5:0xf39179,profile),view:ActorView={actor,slot};
  actor.root.visible=false;actor.setAction(settlementAction(slot.ship.team,props.winner));
  states.value[slot.ship.id]='loading';actors.set(slot.ship.id,view);scene.add(actor.root);
  void actor.ready.then(()=>{
   if(version!==generation||closed)return;
   // A generic fallback would misidentify a historical ship, so show its name and a load notice instead.
   if(!actor.mesh||actor.profile!==profile){states.value[slot.ship.id]='failed';return;}
   const bounds=actor.mesh.skeleton.getBoundsRect(),scale=actor.mesh.scale;
   if(!(bounds.width>0&&bounds.height>0)){states.value[slot.ship.id]='failed';return;}
   view.bounds={x:actor.mesh.position.x+(bounds.x+bounds.width/2)*scale.x,y:actor.mesh.position.y+bounds.y*scale.y,width:bounds.width*scale.x,height:bounds.height*scale.y};
   actor.root.visible=true;states.value[slot.ship.id]='ready';resize();
  }).catch(()=>{if(version===generation&&!closed)states.value[slot.ship.id]='failed';});
 }
 void nextTick(resize);
}
watch(()=>[props.ships,props.myTeam,props.scenarioId],rebuild,{deep:true,flush:'post'});
watch(()=>props.winner,applyActions,{flush:'post'});
onMounted(()=>{
 returnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
 try{dialog.value?.showModal();}catch{dialog.value?.setAttribute('open','');}
 closeButton.value?.focus();
 try{
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setClearColor(0x000000,0);
  renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.addEventListener('webglcontextlost',contextLost);stage.value!.append(renderer.domElement);
  library=new CharacterLibrary();rebuild();resize();
  if(!renderer)return;
  if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(resize);observer.observe(stage.value!);}
  window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);
  if(!document.hidden)frame=requestAnimationFrame(animate);
 }catch{failScene();}
});
onBeforeUnmount(()=>{
 closed=true;releaseScene();if(dialog.value?.open)dialog.value.close();
 if(returnFocus?.isConnected)returnFocus.focus();formations.clear();
});
</script>
<template>
 <dialog ref="dialog" class="battle-settlement" role="dialog" aria-label="战后结算" aria-modal="true" aria-describedby="settlement-notice" @cancel.prevent="close" @close="close">
  <header class="settlement-heading"><div><p>战后结算</p><h2>{{title}}</h2></div><button type="button" class="settlement-dismiss" aria-label="关闭战后结算" @click="close">关闭</button></header>
  <p id="settlement-notice" class="settlement-notice" role="status" :class="{'has-error':sceneFailed||Object.values(states).includes('failed')}">{{notice}}</p>
  <div ref="stage" class="settlement-stage" :aria-busy="Object.values(states).includes('loading')&&!sceneFailed">
   <section v-for="team in teams" :key="team.team" class="settlement-team" :class="team.side" :data-settlement-team="team.side" :aria-label="team.name+' · '+team.result">
    <header><h3>{{team.name}}</h3><strong :class="{victory:winner===team.team}">{{team.result}}</strong><span>{{team.slots.length}} 艘参战</span></header>
    <div :ref="element=>setFormation(team.team,element)" class="settlement-formation" :style="{height:team.rows*160+'px'}">
     <span v-for="row in team.rowLabels" :key="row.row" class="settlement-row-label" :style="{top:(row.row/team.rows*100)+'%'}">{{row.role==='back'?'后排':'前排'}}</span>
     <div v-for="slot in team.slots" :key="slot.ship.id" class="settlement-ship" :data-settlement-ship="slot.ship.id" :data-formation="slot.role" :style="{left:slot.x*100+'%',top:slot.y*100+'%'}">
      <strong :title="slot.ship.label">{{slot.ship.label}}</strong><small :class="{fallen:slot.ship.hp<=0}">{{slot.ship.hp<=0?'阵亡':`HP ${slot.ship.hp}`}}<span v-if="states[slot.ship.id]==='loading'&&!sceneFailed"> · 加载中</span><span v-else-if="states[slot.ship.id]==='failed'"> · 素材未加载</span></small>
     </div>
     <p v-if="!team.slots.length" class="settlement-empty">暂无参战舰船</p>
    </div>
   </section>
  </div>
  <footer class="settlement-footer"><p>舰队已归港，战场记录仍可查看。</p><button ref="closeButton" type="button" data-settlement-close @click="close">继续查看战场</button></footer>
 </dialog>
</template>
<style scoped>
.battle-settlement{width:min(1080px,calc(100vw - 40px));max-width:none;max-height:calc(100dvh - 40px);margin:auto;padding:24px;border:1px solid var(--line-2,#31505e);border-radius:14px;background:var(--ink-0,#071724);color:var(--text-1,#e9f5f6);overflow:auto;box-sizing:border-box;box-shadow:0 24px 100px #0008}.battle-settlement::backdrop{background:#020b13db;backdrop-filter:blur(8px)}
.settlement-heading{display:flex;align-items:center;justify-content:space-between;gap:16px}.settlement-heading p{margin:0 0 4px;color:var(--text-3,#a6c3cc);font-size:12px}.settlement-heading h2{margin:0;color:var(--brass-hi,#f0d194);font-size:clamp(26px,4vw,36px);line-height:1.2;letter-spacing:.05em}.settlement-dismiss{align-self:flex-start;background:transparent;color:var(--text-2,#bccfd6);border:1px solid var(--line-2,#31505e);border-radius:6px;min-height:44px;padding:8px 14px;font:inherit;font-size:12px;cursor:pointer}.settlement-notice{min-height:20px;margin:12px 0 16px;font-size:12px;line-height:1.6;color:var(--text-2,#bccfd6)}.settlement-notice.has-error{color:var(--brass-hi,#f0d194)}
.settlement-stage{position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;isolation:isolate}.settlement-stage :deep(canvas){position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}.settlement-team{min-width:0;border:1px solid rgb(112 223 213 / .25);border-radius:10px;background:linear-gradient(180deg,rgb(112 223 213 / .055),transparent 80%),var(--ink-1,#0c202d);overflow:hidden}.settlement-team.enemy{border-color:rgb(243 145 121 / .25);background:linear-gradient(180deg,rgb(243 145 121 / .045),transparent 80%),var(--ink-1,#0c202d)}.settlement-team>header{position:relative;z-index:2;display:flex;align-items:center;gap:10px;min-height:49px;padding:10px 16px;border-bottom:1px solid var(--line-1,#203d48);box-sizing:border-box}.settlement-team h3{margin:0;font-size:14px;color:var(--signal,#70dfd5)}.settlement-team.enemy h3{color:var(--hostile,#f39179)}.settlement-team>header strong{font-size:11px;font-weight:500;color:var(--text-2,#bccfd6)}.settlement-team>header strong.victory{color:var(--brass-hi,#f0d194)}.settlement-team>header>span{margin-left:auto;white-space:nowrap;font-size:11px;color:var(--text-3,#a6c3cc)}.settlement-formation{position:relative;min-height:320px;margin:10px 4px 0}.settlement-row-label{position:absolute;left:10px;z-index:2;padding:6px 0;color:var(--text-3,#a6c3cc);font-size:10px;letter-spacing:.1em}.settlement-row-label::after{content:"";display:block;width:18px;height:1px;margin-top:5px;background:var(--line-2,#31505e)}.settlement-ship{position:absolute;z-index:2;transform:translate(-50%,-100%);width:29%;text-align:center;line-height:1.4;pointer-events:none}.settlement-ship strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:500;text-shadow:0 1px 4px #071724}.settlement-ship small{display:block;margin-top:3px;font-size:10px;color:var(--text-3,#a6c3cc);white-space:nowrap}.settlement-ship small.fallen{color:var(--hostile,#f39179)}.settlement-empty{position:absolute;inset:42% 0 auto;text-align:center;font-size:12px;color:var(--text-3,#a6c3cc)}
.settlement-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:20px}.settlement-footer p{margin:0;color:var(--text-3,#a6c3cc);font-size:12px;line-height:1.6}.settlement-footer button{min-height:44px;padding:10px 20px;border:1px solid var(--signal,#70dfd5);border-radius:7px;background:var(--signal,#70dfd5);color:var(--ink-0,#071724);font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}.battle-settlement button:focus-visible{outline:2px solid var(--brass-hi,#f0d194);outline-offset:3px}
@media(max-width:700px){.battle-settlement{width:calc(100vw - 20px);max-height:calc(100dvh - 20px);padding:16px;border-radius:10px}.settlement-stage{grid-template-columns:minmax(0,1fr);gap:12px}.settlement-heading h2{font-size:28px}.settlement-notice{margin-bottom:12px}.settlement-team>header{padding:10px 12px}.settlement-footer{position:sticky;z-index:3;bottom:-16px;gap:12px;margin:14px -16px -16px;padding:12px 16px;background:var(--ink-0,#071724);border-top:1px solid var(--line-1,#203d48)}.settlement-footer p{font-size:11px;max-width:48%}.settlement-footer button{padding:10px 14px}}
</style>
