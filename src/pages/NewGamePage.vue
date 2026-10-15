<script setup lang="ts">
import BattleModeToggle from '../components/BattleModeToggle.vue';
import type {BattleMode} from '../../shared/domination.ts';
import PageHead from '../components/shell/PageHead.vue';
import ConnectionGate from '../components/shell/ConnectionGate.vue';
import ResumeBar from '../components/shell/ResumeBar.vue';
import {useAppSession} from '../session-context.ts';
import AppIcon from '../components/AppIcon.vue';

import {Button} from '../components/ui/button';

const {configLoading, configStale, onlineHasFlow, onlineUnavailable, onlineResumeTitle, refreshOnlineConfig, continueOnline, onlineStatus, onlineConfig, openOnline, screen, mode, ship}=useAppSession();
const {router,battleMode,onlineBattleMode}=useAppSession();
function selectMode(value:BattleMode){battleMode.value=value;onlineBattleMode.value=value;}
</script>
<template>
<main class="mode-screen page"><PageHead title="新游戏" lede="选择游玩方式，编队后进入同一片战术海域。"><template #actions><BattleModeToggle :model-value="battleMode" @update:model-value="selectMode" /></template></PageHead><p class="mode-rule" aria-live="polite">{{battleMode==='domination'?'争夺 A / B / C 三个据点，每点每轮 5 分、击沉敌舰 15 分，目标 100 分。':'歼灭敌方舰队；第 30 回合按存活舰数和总耐久结算。'}}</p><ResumeBar v-if="onlineHasFlow" :title="onlineResumeTitle" tone="online" action="继续在线流程" @resume="continueOnline"/><p v-if="onlineUnavailable" class="mode-connection-note"><AppIcon name="plug"/> {{onlineUnavailable}} <Button variant="outline" class="quiet" @click="configStale&&onlineStatus==='connected'?refreshOnlineConfig():openOnline()">{{configStale&&onlineStatus==='connected'?'重试模型列表':'连接设置'}}</Button></p><div class="mode-row" aria-label="游戏模式">
  <Button variant="outline" class="h-auto whitespace-normal mode-card local-mode" data-mode="local" @click="router.push('/new/local')"><AppIcon name="ship"/><strong>本地游玩</strong><p>与本地战术 AI 对战</p><small>无需连接服务器</small><AppIcon name="next"/></Button>
  <Button variant="outline" v-for="model in onlineConfig?.models||[]" :key="model.id" class="h-auto whitespace-normal mode-card" :data-mode="'ai:'+model.id" data-online-mode :disabled="!!onlineUnavailable" @click="router.push({name:'ai-fleet',params:{modelId:model.id}})"><AppIcon name="robot"/><strong>与 {{model.name}} 对战</strong><p>选择舰队与 AI 上下文模式</p><small>{{onlineUnavailable||'在线 AI 对战'}}</small><AppIcon name="next"/></Button>
  <Button variant="outline" v-if="!onlineConfig?.models?.length" class="h-auto whitespace-normal mode-card" data-online-mode disabled><AppIcon name="robot"/><strong>AI 对战</strong><p>{{configLoading?'正在读取模型列表':'服务器暂未提供模型列表'}}</p><small>连接后查看可用模型</small></Button>
  <Button variant="outline" class="h-auto whitespace-normal mode-card" data-mode="create" data-online-mode :disabled="!!onlineUnavailable" @click="router.push('/rooms/create')"><AppIcon name="plus"/><strong>创建房间</strong><p>邀请好友进入专属房间</p><small>{{onlineUnavailable||'设置回合限时'}}</small><AppIcon name="next"/></Button>
  <Button variant="outline" class="h-auto whitespace-normal mode-card" data-mode="join" data-online-mode :disabled="!!onlineUnavailable" @click="router.push('/rooms/join')"><AppIcon name="join"/><strong>加入房间</strong><p>输入好友分享的房间码</p><small>{{onlineUnavailable||'双人猜先与选禁'}}</small><AppIcon name="next"/></Button>
  <Button variant="outline" class="h-auto whitespace-normal mode-card" data-mode="matchmaking" data-online-mode :disabled="!!onlineUnavailable" @click="router.push('/matchmaking')"><AppIcon name="shuffle"/><strong>快速匹配</strong><p>寻找另一位在线指挥官</p><small>{{onlineUnavailable||'随机玩家对战'}}</small><AppIcon name="next"/></Button>
</div></main>
</template>

<style scoped>
.mode-rule{margin:-15px 0 28px;font-size:12px;line-height:1.7;color:var(--text-2)}
.mode-screen :deep(.page-head){flex-wrap:nowrap;align-items:flex-start}.mode-screen :deep(.page-head .actions){margin-top:28px;flex-shrink:0}@media(max-width:600px){.mode-screen :deep(.page-head){gap:12px}.mode-screen :deep(.page-head .actions){margin-top:23px}.mode-screen :deep(.page-head-text .lede){max-width:19em;font-size:11px}.mode-screen :deep(.page-head-text){min-width:0}.mode-screen :deep(.page-head h1){white-space:nowrap}}
</style>
