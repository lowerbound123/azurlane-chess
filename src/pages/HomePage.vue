<script setup lang="ts">
import {onMounted,onUnmounted} from 'vue';
import {scheduleSpinePreload} from '../characters/preload.ts';
import {useAppSession} from '../session-context.ts';

import HomeScreen from '../HomeScreen.vue';

const {onlineResumeTitle, continueOnline, resumeLocal, onlineState, saveRecords, tutorial, newGame, lessonMenu, game}=useAppSession();
const {router}=useAppSession();
let cancelPreload:(()=>void)|undefined;
onMounted(()=>{if(import.meta.env.PROD)cancelPreload=scheduleSpinePreload();});
onUnmounted(()=>cancelPreload?.());
</script>
<template>
<HomeScreen :can-resume="!!game" :save-count="saveRecords.filter(r=>r.save).length" :online-resume="!!(onlineState?.match||onlineState?.room||onlineState?.queue)" :online-title="onlineResumeTitle" @new="newGame" @load="router.push('/saves')" @book="router.push('/guide')" @tutorial="lessonMenu" @historical="router.push('/history')" @resume="resumeLocal" @online="continueOnline"/>
</template>
