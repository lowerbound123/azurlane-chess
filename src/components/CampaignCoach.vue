<script setup lang="ts">
import {computed,ref,watch} from 'vue';
import {useAppSession} from '../session-context.ts';
import {useCoachDock} from '../composables/use-coach-dock.ts';
import {CAMPAIGN_CHAPTERS,campaignEmphasis} from '../campaign/index.ts';
import AppIcon from './AppIcon.vue';
import {Button} from './ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from './ui/dialog';
import FleetSelection from '../FleetSelection.vue';
const {campaign,campaignChapter,campaignStep,campaignNotice,campaignTransit,campaignTransitNotice,campaignFleet,game,busy,campaignHint,campaignSuggest,retryCampaign,focusCampaign,overviewCampaign,exitCampaign,setCampaignFleet}=useAppSession();
const expanded=ref(true),routeOpen=ref(false),fleetOpen=ref(false),draft=ref<string[]>([]);
const {dockStyle}=useCoachDock();
const hint=computed(()=>campaignStep.value?.hints[Math.min((campaign.value?.hintLevel??0)-1,(campaignStep.value?.hints.length??1)-1)]);
const emphasis=computed(()=>campaign.value&&game.value&&!campaignTransit.value?campaignEmphasis(campaign.value,game.value):[]);
watch(()=>campaignStep.value?.id,()=>{expanded.value=true;fleetOpen.value=false;});
function openFleet(){draft.value=[...campaignFleet.value];fleetOpen.value=true;}
function chooseFleet(){setCampaignFleet(draft.value);fleetOpen.value=false;}
</script>
<template>
 <div class="campaign-coach-space coach-space" :class="{expanded}" aria-hidden="true"/>
 <Teleport to="body">
 <section v-if="campaign&&campaignChapter&&campaignStep" class="campaign-coach" :class="{expanded}" :style="dockStyle" aria-label="归航行动教学任务" :data-campaign-status="campaign.status" @keydown.stop>
  <header>
   <div class="campaign-number">{{String(campaign.chapter+1).padStart(2,'0')}}<small>/ 10</small></div>
   <div class="campaign-heading"><span class="eyebrow">归航行动 · {{campaignChapter.title}}</span><h2 :title="campaignTransit?'舰队自动航行中':campaignStep.title">{{campaignTransit?'舰队自动航行中':campaignStep.title}}</h2></div>
   <Button variant="ghost" class="campaign-collapse" :aria-expanded="expanded" @click="expanded=!expanded">{{expanded?'收起提示':'展开提示'}}</Button>
  </header>
  <p v-if="campaignTransit&&expanded" class="campaign-sailing" role="status"><AppIcon name="ship"/> {{campaignTransitNotice}}</p>
  <div v-else-if="expanded" class="campaign-details" tabindex="0" aria-label="本段教学说明">
   <p class="campaign-instruction">{{campaignStep.instruction}}</p>
   <div v-if="emphasis.length" class="campaign-key-info" aria-label="本段重点">
    <p v-for="item in emphasis" :key="item.catalogId+item.topic" :data-campaign-topic="item.topic"><strong>{{item.label}} · {{item.text}}</strong></p>
   </div>
   <p v-if="campaign.chapter===9&&game?.phase==='deploy'" class="campaign-hint">{{campaignChapter.description}}</p>
   <p v-if="campaign.feedback" class="campaign-feedback" role="status">{{campaign.feedback}}</p>
   <p v-if="campaign.status==='failed'" class="campaign-failure" role="alert">这次演练需要重试。恢复当前检查点即可，前面的进度已经保留。</p>
   <p v-if="campaign.status==='complete'" class="campaign-success" role="status">归航完成！你已体验五种舰种与十五艘舰船的核心能力。正式对局全灭对方获胜；第 30 回合结束时先比存活舰数，再比总 HP，相同则平局。</p>
   <p v-if="hint&&campaign.status==='playing'" class="campaign-hint">{{hint}}</p>
   <div class="campaign-actions">
    <Button v-if="campaign.status==='playing'" variant="outline" :disabled="busy||campaignTransit" @click="campaignHint"><AppIcon name="question"/> 给我提示</Button>
    <Button v-if="campaign.status==='playing'&&campaign.hintLevel>=2&&game?.phase==='plan'" variant="outline" :disabled="busy||campaignTransit" @click="campaignSuggest">填入参考指令</Button>
    <Button v-if="campaign.chapter===9&&game?.phase==='deploy'" variant="outline" :disabled="busy" @click="openFleet">调整终章编队</Button>
    <Button variant="ghost" :disabled="busy||campaignTransit" @click="retryCampaign">重试检查点</Button>
    <Button variant="ghost" @click="focusCampaign()">定位当前任务</Button>
    <Button variant="ghost" @click="routeOpen=!routeOpen">{{routeOpen?'收起航程':'查看航程'}}</Button>
    <Button variant="ghost" :disabled="busy" @click="exitCampaign()">保存并退出</Button>
   </div>
   <nav v-if="routeOpen" class="campaign-route" aria-label="教学航程">
    <button v-for="(chapter,index) in CAMPAIGN_CHAPTERS" :key="chapter.id" :disabled="index>campaign.chapter" :class="{current:index===campaign.chapter,done:index<campaign.chapter}" @click="focusCampaign(index)"><span>{{String(index+1).padStart(2,'0')}}</span>{{chapter.title}}</button>
    <Button variant="outline" @click="overviewCampaign">整条海图</Button>
   </nav>
   <footer><span>检查点 {{campaign.checkpoint+1}} / {{campaignChapter.checkpoints.length}} · 重试恢复整备，无倒计时</span><span :class="{'save-warning':campaignNotice.includes('失败')||campaignNotice.includes('未保存')}">{{campaignNotice}}</span></footer>
  </div>
 </section>
 </Teleport>
 <Dialog :open="fleetOpen" @update:open="fleetOpen=$event"><DialogContent class="campaign-fleet-dialog"><DialogTitle>最后的封锁线 · 选择出战舰队</DialogTitle><DialogDescription>选择 3 艘前排和 2 艘后排。准备好后回到海图调整部署。</DialogDescription><FleetSelection :selected="draft" complete-label="确认教学编队" @change="draft=$event" @complete="chooseFleet"/></DialogContent></Dialog>
</template>
<style scoped>
.campaign-coach,.campaign-coach-space{--coach-height:64px;--coach-gap:max(12px,env(safe-area-inset-bottom))}
.campaign-coach.expanded,.campaign-coach-space.expanded{--coach-height:min(220px,48dvh)}
.campaign-coach-space{height:calc(var(--coach-height) + var(--coach-gap) + 12px);flex:none;pointer-events:none}
.campaign-coach{position:fixed;z-index:45;inset:auto auto var(--coach-gap) 18px;width:calc(100% - 36px);height:var(--coach-height);display:flex;flex-direction:column;overflow:hidden;margin:0;border:1px solid var(--line-2);border-left:3px solid var(--brass);border-radius:12px;background:linear-gradient(115deg,#102e3d,#0b1e2f);padding:8px 16px;box-shadow:0 12px 34px #0006}
header{display:flex;align-items:center;gap:15px}.campaign-number{font:600 29px/1 var(--font-code);color:var(--brass-hi)}.campaign-number small{display:block;font-size:10px;color:var(--text-3);margin-top:6px}.campaign-heading{flex:1;min-width:0}.campaign-heading h2{font-size:17px;margin-top:5px;color:var(--text-1)}.campaign-heading .eyebrow{font-size:10px}.campaign-collapse{font-size:12px}
.campaign-details{padding-top:8px;flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable;overflow-wrap:anywhere}.campaign-details:focus-visible{outline:2px solid var(--brass);outline-offset:-2px}.campaign-coach>header{flex:none;min-height:46px}.campaign-heading h2{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.campaign-instruction{font-size:14px;line-height:1.8;color:var(--text-1);max-width:100ch}.campaign-feedback,.campaign-hint{font-size:13px;line-height:1.7;padding:9px 12px;margin-top:8px;border-radius:6px;background:#ffffff06;color:var(--text-2)}.campaign-success{color:#89dfbb;font-size:13px;padding-top:9px}.campaign-failure,.save-warning{color:#f0a49a}.campaign-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}.campaign-actions button{font-size:12px;min-height:34px}.campaign-route{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.campaign-route>button{border:1px solid var(--line-2);padding:7px 10px;border-radius:6px;color:var(--text-2);font-size:11px}.campaign-route>button span{margin-right:6px;font-family:var(--font-code)}.campaign-route>button:disabled{opacity:.35;cursor:default}.campaign-route .current{border-color:var(--brass);color:var(--brass-hi)}.campaign-route .done{color:#89dfbb}footer{display:flex;justify-content:space-between;flex-wrap:wrap;gap:5px;margin-top:10px;font-size:10px;color:var(--text-3)}
.campaign-sailing{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--signal);padding-top:12px;line-height:1.7}.campaign-fleet-dialog{max-width:min(1100px,96vw);max-height:90dvh;overflow:auto}
.campaign-key-info{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:9px}.campaign-key-info p{font-size:12px;line-height:1.8;color:var(--brass-hi);padding:4px 9px;border-left:2px solid var(--brass);background:var(--brass-wash);border-radius:0 4px 4px 0}.campaign-key-info strong{font-weight:800}
@media(max-width:760px){.campaign-coach{padding:8px 12px}.campaign-number{font-size:22px}.campaign-heading h2{font-size:14px}.campaign-instruction{font-size:12px}.campaign-actions{gap:4px}.campaign-actions button{padding:0 9px;font-size:11px}footer{font-size:9px}}
@media(max-width:640px){.campaign-coach.expanded,.campaign-coach-space.expanded{--coach-height:min(320px,50dvh)}}
</style>
