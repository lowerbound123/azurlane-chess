<script setup lang="ts">
import BattleModeSelect from '../components/BattleModeSelect.vue';
import PageHead from '../components/shell/PageHead.vue';
import ConnectionGate from '../components/shell/ConnectionGate.vue';
import ResumeBar from '../components/shell/ResumeBar.vue';
import ChoiceSelect from '../components/ChoiceSelect.vue';
import {useAppSession} from '../session-context.ts';
import AppIcon from '../components/AppIcon.vue';

import FleetSelection from '../FleetSelection.vue';

import {Button} from '../components/ui/button';

const {onlineDominationAvailable, onlineModeHelp, onlineBattleMode, connectionStatusLabel, onlineHasFlow, onlineResumeTitle, currentAIModel, aiFleet, aiMode, startAIMatch, continueOnline, onlineStatus, onlineError, onlinePending, openOnline, game, selected, mode, role, complete}=useAppSession();
const {router}=useAppSession();
</script>
<template>
<main class="ai-game-page"><ConnectionGate v-if="onlineStatus!=='connected'" :status="connectionStatusLabel" :error="onlineError"><Button @click="openOnline"><AppIcon name="plug"/> 连接服务器</Button></ConnectionGate><template v-else><div class="page ai-selection-head"><PageHead :title="'与 '+(currentAIModel?.name||'AI')+' 对战'"><template #actions><Button variant="outline" @click="router.push('/new')"><AppIcon name="back"/> 游戏模式</Button></template><template #meta><label class="field">AI 模式 <ChoiceSelect v-model="aiMode" :disabled="onlinePending" label="AI 模式" :items="[{value:'standard',label:'普通（仅当前回合）'},{value:'full',label:'FULL（全部历史回合）'}]" /></label></template></PageHead></div><div v-if="!onlineHasFlow" class="page"><BattleModeSelect v-model="onlineBattleMode" :disabled="onlinePending" :domination-available="onlineDominationAvailable" :unavailable-reason="onlineModeHelp" /></div><p class="ai-mode-help">{{aiMode==='full'?'本局全部已完成回合的可见战况与己方指令会发给 AI，历史累积会增加请求用量。':'AI 仅接收当前回合的可见战况。'}}</p><ResumeBar v-if="onlineHasFlow" :title="onlineResumeTitle" tone="online" action="继续在线流程" @resume="continueOnline"/><FleetSelection v-if="currentAIModel&&!onlineHasFlow" :selected="aiFleet" :disabled="onlinePending" complete-label="完成编队 · 开始 AI 对战" @change="aiFleet=$event" @complete="startAIMatch"/></template></main>
</template>
