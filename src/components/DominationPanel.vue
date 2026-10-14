<script setup lang="ts">
import {computed} from 'vue';
import {DOMINATION_RULES,dominationIncome,dominationTurnsToWin,type DominationState,type CapturePoint} from '../../shared/domination.ts';
const props=defineProps<{state:DominationState;myTeam:number}>();
const teams=computed(()=>[props.myTeam,1-props.myTeam]);
const teamName=(team:number)=>team===props.myTeam?'我方':'敌方';
const ownerText=(point:CapturePoint)=>point.owner===null?'中立':teamName(point.owner)+'已占领';
const forecast=(team:number)=>{const turns=dominationTurnsToWin(props.state,team);return turns===null?'暂无产分据点':turns===0?'已达标':`${turns} 轮达标`;};
</script>
<template>
 <section class="domination-panel" aria-label="占领计分">
  <div class="domination-heading"><strong>三据点占领</strong><span>胜利目标 {{DOMINATION_RULES.target}} 分</span><small v-if="state.lastRound">已结算第 {{state.lastRound}} 回合</small></div>
  <div class="domination-scores">
   <div v-for="team in teams" :key="team" class="score-team" :class="team===myTeam?'friendly':'enemy'">
    <div class="score-line"><span>{{teamName(team)}}</span><strong :data-team-score="team">{{state.scores[team]}}</strong><small>/ {{DOMINATION_RULES.target}}</small></div>
    <div class="score-track" role="progressbar" :aria-label="teamName(team)+'积分'" :aria-valuenow="state.scores[team]" :aria-valuemin="0" :aria-valuemax="DOMINATION_RULES.target"><i :style="{width:Math.min(100,state.scores[team]/DOMINATION_RULES.target*100)+'%'}" /></div>
    <p>当前每回合 <b>+{{dominationIncome(state,team)}}</b> 分 <span class="forecast">预测 · {{forecast(team)}}</span></p>
    <small v-if="state.lastGain.round" class="gain">第 {{state.lastGain.round}} 回合：据点 +{{state.lastGain.points[team]}} · 击沉 +{{state.lastGain.ships[team]}}</small>
   </div>
  </div>
  <div class="domination-points">
   <div v-for="point in state.points" :key="point.id" class="capture-card" :class="{friendly:point.owner===myTeam,enemy:point.owner===1-myTeam,contested:point.contested}" :data-capture-point="point.id">
    <b>{{point.id}}</b><div><strong>{{ownerText(point)}}</strong><span v-if="point.contested">争夺中 · 收益暂停</span><span v-if="point.progress">{{teamName(point.progressTeam!)}}占领 {{point.progress}}%{{point.contested?' · 进度暂停':''}}</span><span v-else-if="point.owner!==null&&point.capturedRound===state.lastRound">新占领 · 下轮产分</span><span v-else-if="point.owner!==null&&!point.contested">每回合 +{{DOMINATION_RULES.pointIncome}}</span><span v-else-if="!point.contested">等待舰队进入</span></div>
   </div>
  </div>
  <p class="domination-note">占领本轮完成，下轮开始产分。预测按当前归属与争夺状态估算，不含未来击沉或换点。</p>
 </section>
</template>
<style scoped>
.domination-panel {border:1px solid var(--line-2);border-radius:var(--radius-lg);padding:14px 18px;margin:0 0 14px;background:linear-gradient(135deg,rgb(23 48 64 / .55),rgb(9 22 35 / .86));}
.domination-heading {display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;font-size:13px;color:var(--text-2);}
.domination-heading strong {color:var(--brass-hi);letter-spacing:.07em;}.domination-heading small {margin-left:auto;}
.domination-scores {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin:12px 0;}
.score-line {display:flex;align-items:baseline;gap:7px;}.score-line strong {font-size:25px;line-height:1.2;font-variant-numeric:tabular-nums;}.score-line small {color:var(--text-3);}.friendly {color:#70dfd5;}.enemy {color:#f39179;}
.score-track {height:4px;background:rgb(255 255 255 / .07);margin:8px 0;border-radius:3px;overflow:hidden;}.score-track i {display:block;height:100%;background:currentColor;transition:width .2s;}
.score-team p {font-size:12px;color:var(--text-2);line-height:1.7;}.forecast {display:inline-block;margin-left:10px;color:var(--text-3);}.gain {display:block;color:var(--text-2);font-size:11px;line-height:1.8;}
.domination-points {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;}.capture-card {display:flex;align-items:center;gap:12px;padding:9px 12px;border:1px solid var(--line-1);border-radius:8px;min-width:0;background:rgb(3 15 24 / .35);}.capture-card>b {font-size:24px;}.capture-card div {display:flex;flex-direction:column;gap:3px;font-size:12px;}.capture-card span {color:var(--text-2);font-size:11px;}.capture-card.contested {border-color:rgb(237 194 116 / .6);}.capture-card.contested span {color:var(--brass-hi);}
.domination-note {margin:10px 0 0;font-size:11px;line-height:1.6;color:var(--text-3);}
@media(max-width:760px){.domination-panel{padding:12px;}.domination-scores{gap:14px;}.forecast {display:block;margin-left:0;}.domination-points{gap:6px;}.capture-card{gap:6px;padding:8px 7px;align-items:flex-start;}.capture-card>b{font-size:18px;}.capture-card div{font-size:11px;}.capture-card span{font-size:10px;}.domination-heading small{margin-left:0;}}
@media(prefers-reduced-motion:reduce){.score-track i{transition:none;}}
</style>
