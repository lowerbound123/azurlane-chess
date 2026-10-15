<script setup lang="ts">
import {computed,ref} from 'vue';
import {useEventListener} from '@vueuse/core';
import {DOMINATION_RULES,dominationIncome,dominationTurnsToWin,type DominationState,type CapturePoint} from '../../shared/domination.ts';
const props=defineProps<{state:DominationState;myTeam:number}>();
const teams=computed(()=>[props.myTeam,1-props.myTeam]);
const pointPanel=ref<HTMLElement>(),openPoint=ref<string|null>(null);
const activePoint=computed(()=>props.state.points.find(point=>point.id===openPoint.value));
useEventListener(window,'pointerdown',event=>{if(openPoint.value&&pointPanel.value&&!event.composedPath().includes(pointPanel.value))openPoint.value=null;},{capture:true});
// Safari does not focus a button on pointer activation; Escape must also work
// when the detail was opened by touch/click and focus stayed outside the HUD.
useEventListener(window,'keydown',event=>{if(event.key==='Escape'&&openPoint.value){openPoint.value=null;event.stopPropagation();}},{capture:true});
const teamName=(team:number)=>team===props.myTeam?'我方':'敌方';
const ownerText=(point:CapturePoint)=>point.owner===null?'中立':teamName(point.owner)+'已占领';
const pointDescription=(point:CapturePoint)=>[
 ownerText(point),
 ...(point.contested?['争夺中 · 收益暂停']:[]),
 ...(point.progress?[`${teamName(point.progressTeam!)}占领 ${point.progress}%${point.contested?' · 进度暂停':''}`]:point.owner!==null&&point.capturedRound===props.state.lastRound?['新占领 · 下轮产分']:point.owner!==null&&!point.contested?[`每回合 +${DOMINATION_RULES.pointIncome}`]:!point.contested?['等待舰队进入']:[]),
].join(' · ');
const forecast=(team:number)=>{const turns=dominationTurnsToWin(props.state,team);return turns===null?'暂无产分据点':turns===0?'已达标':`${turns} 轮达标`;};
</script>
<template>
 <section class="domination-panel" aria-label="占领计分">
  <div class="domination-topline">
   <div class="domination-heading"><strong>三据点占领</strong><span>胜利目标 {{DOMINATION_RULES.target}} 分</span><small v-if="state.lastRound">已结算第 {{state.lastRound}} 回合</small></div>
   <div ref="pointPanel" class="domination-points" aria-label="据点占领状态" @keydown.stop @keydown.esc="openPoint=null">
    <button v-for="point in state.points" :key="point.id" type="button" class="capture-card" :class="{friendly:point.owner===myTeam,enemy:point.owner===1-myTeam,contested:point.contested}" :data-capture-point="point.id" :aria-label="point.id+' · '+pointDescription(point)" :aria-expanded="openPoint===point.id" :title="point.id+' · '+pointDescription(point)" @click="openPoint=openPoint===point.id?null:point.id"><b aria-hidden="true">{{point.id}}</b><span class="sr-only">{{pointDescription(point)}}</span></button>
    <p v-if="activePoint" class="capture-detail" data-capture-detail role="status"><strong>据点 {{activePoint.id}}</strong>{{pointDescription(activePoint)}}</p>
   </div>
  </div>
  <div class="domination-scores">
   <div v-for="team in teams" :key="team" class="score-team" :class="team===myTeam?'friendly':'enemy'">
    <div class="score-line"><span>{{teamName(team)}}</span><strong :data-team-score="team">{{state.scores[team]}}</strong><small>/ {{DOMINATION_RULES.target}}</small></div>
    <div class="score-track" role="progressbar" :aria-label="teamName(team)+'积分'" :aria-valuenow="state.scores[team]" :aria-valuemin="0" :aria-valuemax="DOMINATION_RULES.target"><i :style="{width:Math.min(100,state.scores[team]/DOMINATION_RULES.target*100)+'%'}" /></div>
    <p>当前每回合 <b>+{{dominationIncome(state,team)}}</b> 分 <span class="forecast">预测 · {{forecast(team)}}</span></p>
    <small v-if="state.lastGain.round" class="gain">第 {{state.lastGain.round}} 回合：据点 +{{state.lastGain.points[team]}} · 击沉 +{{state.lastGain.ships[team]}}</small>
   </div>
  </div>
  <p class="domination-note">占领本轮完成，下轮开始产分。预测按当前归属与争夺状态估算，不含未来击沉或换点。</p>
 </section>
</template>
<style scoped>
.domination-panel {border:1px solid var(--line-2);border-radius:var(--radius-lg);padding:10px 16px;margin:0 0 10px;background:linear-gradient(135deg,rgb(23 48 64 / .55),rgb(9 22 35 / .86));}
.domination-topline{display:flex;align-items:center;justify-content:space-between;gap:12px}
.domination-heading {display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;font-size:13px;color:var(--text-2);}
.domination-heading strong {color:var(--brass-hi);letter-spacing:.07em;}.domination-heading small {color:var(--text-3);font-size:10px}
.domination-scores {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin:6px 0;}
.score-line {display:flex;align-items:baseline;gap:7px;}.score-line strong {font-size:25px;line-height:1.2;font-variant-numeric:tabular-nums;}.score-line small {color:var(--text-3);}.friendly {color:#70dfd5;}.enemy {color:#f39179;}
.score-track {height:4px;background:rgb(255 255 255 / .07);margin:5px 0;border-radius:3px;overflow:hidden;}.score-track i {display:block;height:100%;background:currentColor;transition:width .2s;}
.score-team p {font-size:12px;color:var(--text-2);line-height:1.7;}.forecast {display:inline-block;margin-left:10px;color:var(--text-3);}.gain {display:block;color:var(--text-2);font-size:11px;line-height:1.8;}
.domination-points {position:relative;display:flex;flex:none;gap:10px;padding:3px;}.capture-card {position:relative;display:grid;place-items:center;width:34px;height:34px;border:2px solid currentColor;border-radius:50%;color:var(--text-3);background:rgb(3 15 24 / .5);cursor:help}.capture-card>b {font:600 16px/1 var(--font-code)}.capture-card.friendly{color:#70dfd5;background:rgb(112 223 213 / .18)}.capture-card.enemy{color:#f39179;background:rgb(243 145 121 / .18)}.capture-card.contested{outline:2px dashed var(--brass);outline-offset:2px}.capture-card:hover,.capture-card[aria-expanded=true]{box-shadow:0 0 0 3px rgb(150 190 222 / .15)}
.capture-detail{position:absolute;top:calc(100% + 7px);right:0;z-index:50;width:260px;max-width:calc(100vw - 40px);padding:12px 14px;border:1px solid var(--line-3);border-radius:8px;background:#102331;box-shadow:0 8px 24px #0009;color:var(--text-1);font-size:12px;line-height:1.8;overflow-wrap:anywhere}.capture-detail strong{display:block;color:var(--brass-hi);margin-bottom:3px}
.domination-note {margin:5px 0 0;font-size:10px;line-height:1.5;color:var(--text-3);}
@media(max-width:760px){.domination-panel{padding:8px 10px;}.domination-heading{font-size:11px;gap:4px 8px}.domination-heading small{display:none}.domination-scores{gap:14px;}.forecast {display:block;margin-left:0;}.domination-points{gap:7px;}.capture-card{width:28px;height:28px}.capture-card>b{font-size:14px}.domination-note{font-size:9px}.score-team p{font-size:10px}.score-line strong{font-size:21px}}
@media(prefers-reduced-motion:reduce){.score-track i{transition:none;}}
</style>
