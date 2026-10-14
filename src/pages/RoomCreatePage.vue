<script setup lang="ts">
import BattleModeSelect from '../components/BattleModeSelect.vue';
import PageHead from '../components/shell/PageHead.vue';
import ConnectionGate from '../components/shell/ConnectionGate.vue';
import ResumeBar from '../components/shell/ResumeBar.vue';
import ChoiceSelect from '../components/ChoiceSelect.vue';
import {useAppSession} from '../session-context.ts';
import AppIcon from '../components/AppIcon.vue';

import {Button} from '../components/ui/button';

const {onlineDominationAvailable, onlineModeHelp, onlineBattleMode, connectionStatusLabel, onlineHasFlow, onlineResumeTitle, roomSeconds, createRoom, continueOnline, onlineStatus, onlineError, onlineConfig, onlinePending, openOnline, role}=useAppSession();
const {router}=useAppSession();
</script>
<template>
<main class="online-panel page is-narrow"><PageHead eyebrow="PRIVATE ROOM" title="创建房间" lede="邀请好友，一起进入战术海域。"><template #actions><Button variant="outline" @click="router.push('/new')"><AppIcon name="back"/> 游戏模式</Button></template></PageHead><ConnectionGate v-if="onlineStatus!=='connected'" :status="connectionStatusLabel" :error="onlineError"><Button @click="openOnline"><AppIcon name="plug"/> 连接服务器</Button></ConnectionGate><template v-else><ResumeBar v-if="onlineHasFlow" :title="onlineResumeTitle" tone="online" action="继续在线流程" @resume="continueOnline"/><section v-if="!onlineHasFlow" class="online-form panel"><p>双方准备后进入猜先与选禁，最终各选 3 艘前排和 2 艘后排。</p><BattleModeSelect v-model="onlineBattleMode" :disabled="onlinePending" :domination-available="onlineDominationAvailable" :unavailable-reason="onlineModeHelp" /><label>回合限时 <ChoiceSelect v-model="roomSeconds" label="回合限时" :items="(onlineConfig.roomLimits||[0,60,120,300]).map(value=>({value,label:value?value+' 秒':'不限时'}))" /></label><Button variant="default" class="primary" :disabled="onlinePending" @click="createRoom"><AppIcon name="plus"/> 创建房间</Button></section></template></main>
</template>
