<script setup lang="ts">
import {useAppSession} from '../session-context.ts';

import FleetSelection from '../FleetSelection.vue';

const {battleMode, selectedFleet, setFleet, seed, selected, start, complete}=useAppSession();

</script>
<template>
<FleetSelection :selected="selectedFleet" :seed="seed" @change="setFleet" @seed="seed=$event" @complete="start"/>
</template>

<style scoped>
.local-mode-head {padding-top:20px;padding-bottom:0;}
</style>
