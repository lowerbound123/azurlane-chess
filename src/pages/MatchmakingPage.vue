<script setup lang="ts">
import BattleModeSelect from '../components/BattleModeSelect.vue';
import PageHead from '../components/shell/PageHead.vue';
import ConnectionGate from '../components/shell/ConnectionGate.vue';
import ResumeBar from '../components/shell/ResumeBar.vue';
import {useAppSession} from '../session-context.ts';
import AppIcon from '../components/AppIcon.vue';

import {Button} from '../components/ui/button';

const {onlineDominationAvailable, onlineModeHelp, onlineBattleMode, connectionStatusLabel, onlineHasFlow, onlineResumeTitle, startMatchmaking, continueOnline, onlineState, onlineStatus, onlineError, onlinePending, openOnline, onlineCommand, role}=useAppSession();
const {router}=useAppSession();
</script>
<template>
<main class="online-panel page is-narrow"><PageHead title="快速匹配" lede="寻找另一位在线指挥官。"><template #actions><Button variant="outline" @click="router.push('/new')"><AppIcon name="back"/> 游戏模式</Button></template></PageHead><ConnectionGate v-if="onlineStatus!=='connected'" :status="connectionStatusLabel" :error="onlineError"><Button @click="openOnline"><AppIcon name="plug"/> 连接服务器</Button></ConnectionGate><template v-else><section v-if="onlineState?.queue" class="online-form panel"><p role="status"><AppIcon name="spinner" spin/> 正在寻找{{onlineState.queue.battleMode==='domination'?'占领':'歼灭'}}模式对手 · 队列位置 {{onlineState.queue.position}}</p><Button variant="outline" :disabled="onlinePending" @click="onlineCommand('queue.leave')">取消匹配</Button></section><template v-else><ResumeBar v-if="onlineHasFlow" :title="onlineResumeTitle" tone="online" action="继续在线流程" @resume="continueOnline"/><section v-if="!onlineHasFlow" class="online-form panel"><p>找到相同对战模式的对手后进入猜先和选禁。</p><BattleModeSelect v-model="onlineBattleMode" :disabled="onlinePending" :domination-available="onlineDominationAvailable" :unavailable-reason="onlineModeHelp" /><Button variant="default" class="primary" :disabled="onlinePending" @click="startMatchmaking"><AppIcon name="shuffle"/> 开始匹配</Button></section></template></template></main>
</template>
