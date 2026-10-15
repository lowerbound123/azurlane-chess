<script setup lang="ts">
import {ref} from 'vue';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription} from './components/ui/alert-dialog';
import PageHead from './components/shell/PageHead.vue';
import {Card} from './components/ui/card';

import AppIcon from './components/AppIcon.vue';
import {Button} from './components/ui/button';

import {TUTORIAL_LESSONS} from './tutorial-content.ts';
const props=withDefaults(defineProps<{lessons:typeof TUTORIAL_LESSONS;hasCampaign?:boolean;campaignNotice?:string}>(),{});
const emit=defineEmits(["home", "start", "campaign"]);
const restart=ref(false);
function startCampaign(){if(props.hasCampaign)restart.value=true;else emit('campaign',false);}
</script>
<template>
<main class="tutorial-menu page">
<PageHead title="交互教学" lede="每一步要真的完成操作。演练与普通战局、存档相互独立。"><template #actions><Button variant="outline" @click="$emit('home')"><AppIcon name="back"/> 返回主菜单</Button></template></PageHead>
<section class="campaign-entrance" aria-label="归航行动">
 <div><p class="eyebrow">HOMEWARD · 连续教学战役</p><h2>从一艘驱逐，到一支舰队。</h2><p>沿固定海图北上，穿过雷区、迷雾与封锁线。十段实操，逐步体验十五艘舰船的特色。</p><div class="campaign-tags"><span>约 25–35 分钟</span><span>随时保存继续</span><span>无需连接服务器</span></div><div class="campaign-start"><Button v-if="hasCampaign" variant="default" @click="emit('campaign',true)">继续归航行动</Button><Button :variant="hasCampaign?'outline':'default'" @click="startCampaign">{{hasCampaign?'重新开始教学':'开始归航行动'}}</Button></div><small v-if="campaignNotice" role="status">{{campaignNotice}}</small></div>
 <div class="campaign-route-art" aria-hidden="true"><span>启航</span><i></i><b>01</b><i></i><b>05</b><i></i><b>10</b><span>归航</span></div>
</section>
<h2 class="practice-heading">专项练习 <small>需要复习某个操作时，可直接进入。</small></h2>
<AlertDialog :open="restart" @update:open="restart=$event"><AlertDialogContent><AlertDialogTitle>重新开始归航行动？</AlertDialogTitle><AlertDialogDescription>这会替换本机已有的教学进度，普通对局存档不受影响。</AlertDialogDescription><div class="flex justify-end gap-2"><Button variant="outline" @click="restart=false">取消</Button><Button variant="default" @click="restart=false;emit('campaign',false)">确认重新开始</Button></div></AlertDialogContent></AlertDialog>
<div class="lesson-grid">
<Card v-for="(lesson,i) in lessons" :key="lesson.id" class="lesson-card" tabindex="0" role="button" @keydown.enter="emit('start',lesson.id)" @keydown.space.prevent="emit('start',lesson.id)" @click="$emit('start',lesson.id)"><AppIcon name="next"/> 
<span>{{String(i+1).padStart(2,'0')}} / {{lesson.section==='advanced'?'进阶':'基础'}}</span>
<strong>{{lesson.title}}</strong>
<p>{{lesson.goal}}</p>
<small>{{lesson.duration}} · {{lesson.steps.length}} 个实操步骤 <AppIcon name="next"/></small>
</Card>
</div>
</main>
</template>

<style scoped>
.campaign-entrance{display:grid;grid-template-columns:1fr 150px;gap:32px;margin:24px 0 34px;padding:32px;border:1px solid var(--line-2);border-radius:16px;background:radial-gradient(ellipse at 90% 10%,#24566d55,transparent 65%),#0d2638}.campaign-entrance h2{font-size:clamp(24px,3vw,36px);font-weight:600;margin:14px 0}.campaign-entrance p:not(.eyebrow){max-width:620px;color:var(--text-2);line-height:1.9;font-size:14px}.campaign-tags,.campaign-start{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}.campaign-tags span{font-size:11px;border:1px solid var(--line-2);padding:5px 9px;border-radius:99px;color:var(--text-2)}.campaign-entrance small{display:block;color:var(--text-3);font-size:11px;margin-top:12px}.campaign-route-art{display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--brass-hi);font:500 13px var(--font-code)}.campaign-route-art b{display:grid;place-items:center;width:34px;height:34px;border:1px solid #86d5c080;border-radius:50%;color:#a2e1d0}.campaign-route-art i{height:25px;width:1px;background:#86d5c060}.campaign-route-art span{font-size:10px;color:var(--text-3);margin:6px}.practice-heading{font-size:18px;margin-bottom:18px}.practice-heading small{font-size:12px;color:var(--text-3);margin-left:12px}@media(max-width:650px){.campaign-entrance{grid-template-columns:1fr;padding:22px;gap:16px}.campaign-route-art{flex-direction:row}.campaign-route-art i{height:1px;width:28px}.practice-heading small{display:block;margin:8px 0 0}}
</style>
