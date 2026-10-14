<script setup lang="ts">
import {computed,ref,watch} from 'vue';
import {useAppSession} from '../session-context.ts';
import {CAMPAIGN_CHAPTERS} from '../campaign/index.ts';
import AppIcon from './AppIcon.vue';
import {Button} from './ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from './ui/dialog';
import FleetSelection from '../FleetSelection.vue';
const {campaign,campaignChapter,campaignStep,campaignNotice,campaignTransit,campaignFleet,game,busy,campaignHint,campaignSuggest,nextCampaign,retryCampaign,finishCampaignTransit,focusCampaign,overviewCampaign,exitCampaign,setCampaignFleet}=useAppSession();
const expanded=ref(true),routeOpen=ref(false),fleetOpen=ref(false),draft=ref<string[]>([]);
const hint=computed(()=>campaignStep.value?.hints[Math.min((campaign.value?.hintLevel??0)-1,(campaignStep.value?.hints.length??1)-1)]);
watch(()=>campaignStep.value?.id,()=>{expanded.value=true;fleetOpen.value=false;});
function openFleet(){draft.value=[...campaignFleet.value];fleetOpen.value=true;}
function chooseFleet(){setCampaignFleet(draft.value);fleetOpen.value=false;}
</script>
<template>
 <section v-if="campaign&&campaignChapter&&campaignStep" class="campaign-coach" aria-label="归航行动教学任务" :data-campaign-status="campaign.status">
  <header>
   <div class="campaign-number">{{String(campaign.chapter+1).padStart(2,'0')}}<small>/ 10</small></div>
   <div class="campaign-heading"><span class="eyebrow">归航行动 · {{campaignChapter.title}}</span><h2>{{campaignStep.title}}</h2></div>
   <Button variant="ghost" class="campaign-collapse" :aria-expanded="expanded" @click="expanded=!expanded">{{expanded?'收起提示':'展开提示'}}</Button>
  </header>
  <div v-if="expanded" class="campaign-details">
   <p class="campaign-instruction">{{campaignStep.instruction}}</p>
   <p v-if="campaign.chapter===9&&game?.phase==='deploy'" class="campaign-hint">{{campaignChapter.description}}</p>
   <p v-if="campaign.feedback" class="campaign-feedback" role="status">{{campaign.feedback}}</p>
   <p v-if="campaign.status==='checkpoint-complete'" class="campaign-success" role="status"><AppIcon name="check"/> 本段任务完成。整备后继续航行。</p>
   <p v-if="campaign.status==='failed'" class="campaign-failure" role="alert">这次演练需要重试。恢复当前检查点即可，前面的进度已经保留。</p>
   <p v-if="campaign.status==='complete'" class="campaign-success" role="status">归航完成！你已体验五种舰种与十五艘舰船的核心能力。正式对局全灭对方获胜；第 30 回合结束时先比存活舰数，再比总 HP，相同则平局。</p>
   <p v-if="hint&&campaign.status==='playing'" class="campaign-hint">{{hint}}</p>
   <div class="campaign-actions">
    <Button variant="default" :disabled="busy||campaignTransit||campaign.status!=='checkpoint-complete'" @click="nextCampaign"><AppIcon name="next"/> 继续航行</Button>
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
 <Teleport to="body"><div v-if="campaignTransit" class="campaign-transit" role="status"><div><span class="eyebrow">补给完成 · 舰队会合</span><h2>沿航道继续北上</h2><p>当前演练已结束，恢复耐久与弹药，下一支训练队伍即将入场。</p><Button variant="outline" @click="finishCampaignTransit">跳过航渡</Button></div></div></Teleport>
 <Dialog :open="fleetOpen" @update:open="fleetOpen=$event"><DialogContent class="campaign-fleet-dialog"><DialogTitle>最后的封锁线 · 选择出战舰队</DialogTitle><DialogDescription>选择 3 艘前排和 2 艘后排。准备好后回到海图调整部署。</DialogDescription><FleetSelection :selected="draft" complete-label="确认教学编队" @change="draft=$event" @complete="chooseFleet"/></DialogContent></Dialog>
</template>
<style scoped>
.campaign-coach{margin:0 0 12px;border:1px solid var(--line-2);border-left:3px solid var(--brass);border-radius:12px;background:linear-gradient(115deg,#102e3d,#0b1e2f);padding:14px 18px;box-shadow:0 12px 34px #0002}
header{display:flex;align-items:center;gap:15px}.campaign-number{font:600 29px/1 var(--font-code);color:var(--brass-hi)}.campaign-number small{display:block;font-size:10px;color:var(--text-3);margin-top:6px}.campaign-heading{flex:1;min-width:0}.campaign-heading h2{font-size:17px;margin-top:5px;color:var(--text-1)}.campaign-heading .eyebrow{font-size:10px}.campaign-collapse{font-size:12px}
.campaign-details{padding-top:12px}.campaign-instruction{font-size:14px;line-height:1.8;color:var(--text-1);max-width:100ch}.campaign-feedback,.campaign-hint{font-size:13px;line-height:1.7;padding:9px 12px;margin-top:8px;border-radius:6px;background:#ffffff06;color:var(--text-2)}.campaign-success{color:#89dfbb;font-size:13px;padding-top:9px}.campaign-failure,.save-warning{color:#f0a49a}.campaign-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}.campaign-actions button{font-size:12px;min-height:34px}.campaign-route{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.campaign-route>button{border:1px solid var(--line-2);padding:7px 10px;border-radius:6px;color:var(--text-2);font-size:11px}.campaign-route>button span{margin-right:6px;font-family:var(--font-code)}.campaign-route>button:disabled{opacity:.35;cursor:default}.campaign-route .current{border-color:var(--brass);color:var(--brass-hi)}.campaign-route .done{color:#89dfbb}footer{display:flex;justify-content:space-between;flex-wrap:wrap;gap:5px;margin-top:10px;font-size:10px;color:var(--text-3)}
.campaign-transit{position:fixed;inset:0;z-index:75;display:grid;place-items:center;padding:24px;background:#061321dd;backdrop-filter:blur(8px)}.campaign-transit>div{max-width:460px;text-align:center}.campaign-transit h2{font-size:26px;margin:16px 0}.campaign-transit p{color:var(--text-2);line-height:1.8;margin:0 0 20px}.campaign-fleet-dialog{max-width:min(1100px,96vw);max-height:90dvh;overflow:auto}
@media(max-width:760px){.campaign-coach{padding:10px 12px;margin:0 0 7px}.campaign-number{font-size:22px}.campaign-heading h2{font-size:14px}.campaign-instruction{font-size:12px}.campaign-details{max-height:36dvh;overflow:auto}.campaign-actions{gap:4px}.campaign-actions button{padding:0 9px;font-size:11px}footer{font-size:9px}}
</style>
