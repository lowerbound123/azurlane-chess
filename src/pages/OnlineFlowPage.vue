<script setup lang="ts">
import ConnectionGate from '../components/shell/ConnectionGate.vue';
import {useAppSession} from '../session-context.ts';
import AppIcon from '../components/AppIcon.vue';

import OnlinePanel from '../OnlinePanel.vue';
import {Button} from '../components/ui/button';

const {onlineDominationAvailable, onlineModeHelp, connectionStatusLabel, onlineState, onlineStatus, onlineError, onlineConfig, onlinePending, onlineClock, openOnline, enterOnlineBattle, onlineCommand, goHome, role}=useAppSession();

</script>
<template>
<ConnectionGate v-if="onlineStatus!=='connected'" :status="connectionStatusLabel" :error="onlineError"><Button @click="openOnline"><AppIcon name="plug"/> 连接服务器</Button></ConnectionGate><OnlinePanel v-else :state="onlineState" :status="onlineStatus" :error="onlineError" :config="onlineConfig" :domination-available="onlineDominationAvailable" :mode-help="onlineModeHelp" :clock="onlineClock" :pending="onlinePending" @command="onlineCommand" @battle="enterOnlineBattle" @home="goHome"/>
</template>
