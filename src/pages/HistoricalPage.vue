<script setup lang="ts">
import {computed,ref} from 'vue';
import type {HistoricalDefinition,HistoricalId} from '../../shared/history.ts';
import {useAppSession} from '../session-context.ts';
import * as E from '../engine.ts';
import {Button} from '../components/ui/button';
import {Dialog,DialogScrollContent,DialogTitle,DialogDescription} from '../components/ui/dialog';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription} from '../components/ui/alert-dialog';
import PageHead from '../components/shell/PageHead.vue';
import AppIcon from '../components/AppIcon.vue';
const {historicalRecords,historicalNotice,startHistorical,router}=useAppSession();
const briefing=ref<HistoricalId|null>(null),replaceId=ref<HistoricalId|null>(null);
const record=computed(()=>historicalRecords.value.find(r=>r.definition.id===briefing.value));
const start=(id:HistoricalId)=>{
 const existing=historicalRecords.value.find(r=>r.definition.id===id)?.saved;
 if(existing&&existing.kind!=='missing'){replaceId.value=id;return;}
 briefing.value=null;startHistorical(id,false);
};
const confirmRestart=()=>{const id=replaceId.value;replaceId.value=null;briefing.value=null;if(id)startHistorical(id,false);};
const chartBox=(d:HistoricalDefinition)=>`-2 -2 ${Math.sqrt(3)*d.map.width+3} ${d.map.height*1.5+3}`;
const point=(q:number,r:number)=>E.hexToXY({q,r});
const islandPolygon=(cell:string)=>{const [q,r]=cell.split(',').map(Number),p=point(q,r);return Array.from({length:6},(_,i)=>`${p.x+Math.cos(Math.PI/6+i*Math.PI/3)},${p.y+Math.sin(Math.PI/6+i*Math.PI/3)}`).join(' ');};
const progressText=(saved:typeof historicalRecords.value[number]['saved'])=>saved.kind==='resume'?saved.save.state.status==='playing'?`第 ${saved.save.game.round} 回合 · 可继续`:'已有本场战果':saved.kind==='error'?'记录读取失败':'随时开始';
</script>
<template>
<main class="historical-menu">
 <PageHead title="历史战斗" lede="五场独立海战，选择一支舰队，改变这一次的战果。">
  <template #actions><Button variant="outline" @click="router.push('/')"><AppIcon name="back"/> 主菜单</Button></template>
 </PageHead>
 <p class="history-mode-note">全部开放 · 固定历史舰队 · 每场独立保存 · 阶段间保留损伤与弹药</p>
 <p v-if="historicalNotice.includes('失败')" class="history-notice" role="alert">{{historicalNotice}}</p>
 <div class="history-grid">
  <article v-for="(item,index) in historicalRecords" :key="item.definition.id" class="history-card" :data-history-card="item.definition.id">
   <div class="history-chart" aria-hidden="true">
    <svg :viewBox="chartBox(item.definition)">
     <polygon v-for="cell in item.definition.map.islands" :key="cell" :points="islandPolygon(cell)" fill="#496b70"/>
     <g v-for="area in item.definition.regions" :key="area.id" :fill="area.kind==='exit'?'#72d8bd':area.kind==='enemy-exit'?'#d18f84':'#e1bd73'" :opacity="area.kind==='intel'?.14:.26">
      <circle v-for="(cell,i) in area.cells" :key="i" :cx="point(cell.q,cell.r).x" :cy="point(cell.q,cell.r).y" r=".72"/>
     </g>
     <path v-for="unit in item.definition.units.filter(u=>u.team===0)" :key="unit.id" :transform="`translate(${point(unit.pos.q,unit.pos.r).x},${point(unit.pos.q,unit.pos.r).y}) rotate(${unit.heading*60})`" d="M 1 0 L -.7 -.55 L -.4 0 L -.7 .55 Z" fill="#b6eee5"/>
    </svg>
    <span class="chart-number">{{String(index+1).padStart(2,'0')}}</span><span class="chart-size">{{item.definition.map.width}} × {{item.definition.map.height}}</span>
   </div>
   <div class="history-card-body">
    <div class="history-card-meta"><time>{{item.definition.date}}</time><span>{{item.definition.difficulty}}</span></div>
    <h2>{{item.definition.title}}</h2><p class="history-subtitle">{{item.definition.subtitle}}</p>
    <p class="history-description">{{item.definition.description}}</p>
    <div class="history-card-facts"><span>{{item.definition.units.filter(u=>u.controlled).length}} 艘指挥舰</span><span>{{item.definition.minutes}}</span><span>最多 {{item.definition.roundLimit}} 回合</span></div>
    <div class="history-record"><span>{{progressText(item.saved)}}</span><span v-if="item.best" :aria-label="'最佳 '+item.best.stars+' 星'">{{'★'.repeat(item.best.stars)}}{{'☆'.repeat(3-item.best.stars)}} · {{item.best.round}} 回合</span></div>
    <p v-if="item.saved.kind==='error'" class="history-notice" role="alert">{{item.saved.message}} 原记录保留，可确认后重新开始。</p>
    <div class="history-card-actions"><Button variant="outline" @click="briefing=item.definition.id">作战简报</Button><Button v-if="item.saved.kind==='resume'" @click="startHistorical(item.definition.id,true)">{{item.saved.save.state.status==='playing'?'继续战斗':'查看战果'}}</Button><Button v-else @click="briefing=item.definition.id">选择此战 <AppIcon name="next"/></Button></div>
   </div>
  </article>
 </div>
 <p class="history-footnote">历史背景与参战舰名有史料依据，地图、兵力规模和武器数值经过玩法改编。每次战斗的结果由你的指挥决定。</p>
 <Dialog :open="!!briefing" @update:open="!$event&&(briefing=null)"><DialogScrollContent class="history-briefing" v-if="record">
  <DialogTitle>{{record.definition.title}} · {{record.definition.subtitle}}</DialogTitle><DialogDescription>{{record.definition.date}} · {{record.definition.description}}</DialogDescription>
  <section><h3>主要任务</h3><ul><li v-for="goal in record.definition.objectives" :key="goal">{{goal}}</li></ul><h3>额外评价</h3><ul><li v-for="goal in record.definition.bonusObjectives" :key="goal">{{goal}}</li></ul><p>回合上限：{{record.definition.roundLimit}}。最后一轮完成目标仍然有效。</p></section>
  <section><h3>我方舰队</h3><div class="history-unit" v-for="unit in record.definition.units.filter(u=>u.team===0)" :key="unit.id"><strong>{{unit.name}} <small>{{unit.controlled?'玩家指挥':'友军 AI'}}</small></strong><p>{{unit.hp??unit.cfg.hp}} / {{unit.cfg.hp}} HP · 航速 {{unit.cfg.speed}} · 视野 {{unit.cfg.vision}}</p><p v-if="unit.cfg.main">主炮 {{unit.cfg.main.shots}}×{{unit.cfg.main.damage}} · 射程 {{unit.cfg.main.range}} · {{unit.cfg.main.reload?'间隔 '+unit.cfg.main.reload+' 轮':'每轮可用'}}</p><p v-if="unit.cfg.torpedo">鱼雷 {{unit.cfg.torpedo.reserve}} 枚 · 每枚 {{unit.cfg.torpedo.damage}} 伤害</p><p v-if="unit.cfg.carrier">{{unit.cfg.carrier.stock}} 批飞机 · 每轮最多出动 {{unit.cfg.carrier.launch}} 批</p><p v-if="unit.cfg.smoke">烟幕 {{unit.cfg.smoke.charges}} 次</p></div></section>
  <section><h3>历史背景</h3><p>{{record.definition.history}}</p><div class="history-sources"><a v-for="source in record.definition.sources" :key="source.url" :href="source.url" target="_blank" rel="noopener noreferrer">{{source.title}} ↗</a></div></section>
  <div class="history-card-actions"><Button variant="outline" @click="briefing=null">返回选择</Button><Button @click="start(record.definition.id)">{{record.saved.kind==='missing'?'开始战斗':'重新开始'}}</Button></div>
 </DialogScrollContent></Dialog>
 <AlertDialog :open="!!replaceId" @update:open="!$event&&(replaceId=null)"><AlertDialogContent><AlertDialogTitle>重新开始这场战斗？</AlertDialogTitle><AlertDialogDescription>只替换本场的进行中记录，保留最佳战果及其他战斗的存档。</AlertDialogDescription><div class="history-card-actions"><Button variant="outline" @click="replaceId=null">取消</Button><Button @click="confirmRestart">确认重新开始</Button></div></AlertDialogContent></AlertDialog>
</main>
</template>
<style scoped>
.historical-menu{max-width:1320px;margin:auto;padding:20px 28px 64px}.history-mode-note{color:var(--text-2);font-size:13px;margin:8px 0 24px}.history-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}.history-card{overflow:hidden;border:1px solid var(--line-2);border-radius:var(--radius-lg);background:var(--ink-1)}.history-chart{position:relative;height:170px;background:radial-gradient(ellipse at 60% 40%,#183b4d,#0a1a29);border-bottom:1px solid var(--line-2)}.history-chart svg{height:100%;width:100%;padding:12px;opacity:.8}.chart-number{position:absolute;left:20px;top:12px;font:40px var(--font-code);color:rgb(188 209 218 / .18)}.chart-size{position:absolute;bottom:12px;right:16px;font:11px var(--font-code);color:var(--text-3)}.history-card-body{padding:22px}.history-card-meta,.history-card-facts,.history-record,.history-card-actions{display:flex;align-items:center;flex-wrap:wrap;gap:10px 18px}.history-card-meta{justify-content:space-between;color:var(--text-3);font-size:12px}.history-card h2{font-size:25px;letter-spacing:.05em;margin:10px 0 4px}.history-subtitle{color:var(--brass-hi);font-size:14px}.history-description{color:var(--text-2);font-size:13px;line-height:1.8;margin:14px 0;min-height:46px}.history-card-facts{font-size:12px;color:var(--text-2);padding:12px 0;border-block:1px solid var(--line-1)}.history-record{justify-content:space-between;font-size:12px;color:var(--brass);padding:14px 0}.history-card-actions{justify-content:flex-end}.history-card-actions button{min-height:42px}.history-notice{color:var(--danger,#eb9a8e);font-size:12px;line-height:1.6}.history-footnote{color:var(--text-3);font-size:12px;line-height:1.8;margin-top:24px}.history-briefing{max-width:720px}.history-briefing section{margin:10px 0}.history-briefing h3{font-size:15px;color:var(--brass-hi);margin:10px 0}.history-briefing p,.history-briefing li{font-size:13px;line-height:1.8;color:var(--text-2)}.history-briefing ul{padding-left:20px;list-style:disc}.history-unit{padding:12px 0;border-bottom:1px solid var(--line-1)}.history-unit strong{font-size:14px}.history-unit small{font-size:11px;color:var(--text-3);margin-left:8px}.history-unit p{margin:0}.history-sources{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:12px;color:var(--signal)}
@media(max-width:700px){.historical-menu{padding:18px 16px 48px}.history-grid{grid-template-columns:1fr;gap:16px}.history-chart{height:140px}.history-card-body{padding:18px}.history-card h2{font-size:22px}.history-description{min-height:0}}
</style>
