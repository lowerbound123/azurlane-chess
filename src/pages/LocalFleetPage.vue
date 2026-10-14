<script setup lang="ts">
import {useAppSession} from '../session-context.ts';

import BattleModeSelect from '../components/BattleModeSelect.vue';
import FleetSelection from '../FleetSelection.vue';

const {battleMode, selectedFleet, setFleet, seed, selected, start, complete}=useAppSession();

</script>
<template>
<div class="page local-mode-head"><BattleModeSelect v-model="battleMode" /></div>
<FleetSelection :selected="selectedFleet" :seed="seed" @change="setFleet" @seed="seed=$event" @complete="start"/>
</template>

<style scoped>
.local-mode-head {padding-top:20px;padding-bottom:0;}
</style>
