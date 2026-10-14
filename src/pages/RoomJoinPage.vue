<script setup lang="ts">
import PageHead from '../components/shell/PageHead.vue';
import ConnectionGate from '../components/shell/ConnectionGate.vue';
import ResumeBar from '../components/shell/ResumeBar.vue';
import {useAppSession} from '../session-context.ts';
import AppIcon from '../components/AppIcon.vue';

import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
const {connectionStatusLabel, onlineHasFlow, onlineResumeTitle, roomCode, joinRoom, continueOnline, onlineStatus, onlineError, onlinePending, openOnline, role}=useAppSession();
const {router}=useAppSession();
</script>
<template>
<main class="online-panel page is-narrow"><PageHead eyebrow="JOIN A FLEET" title="加入房间" lede="输入好友分享的房间码，准备并肩推演。"><template #actions><Button variant="outline" @click="router.push('/new')"><AppIcon name="back"/> 游戏模式</Button></template></PageHead><ConnectionGate v-if="onlineStatus!=='connected'" :status="connectionStatusLabel" :error="onlineError"><Button @click="openOnline"><AppIcon name="plug"/> 连接服务器</Button></ConnectionGate><template v-else><ResumeBar v-if="onlineHasFlow" :title="onlineResumeTitle" tone="online" action="继续在线流程" @resume="continueOnline"/><form v-if="!onlineHasFlow" class="online-form panel" @submit.prevent="joinRoom"><label>房间码 <Input v-model="roomCode" maxlength="20" aria-label="房间码" /></label><Button variant="default" class="primary" :disabled="onlinePending||!roomCode.trim()"><AppIcon name="join"/> 加入房间</Button></form></template></main>
</template>
