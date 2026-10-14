<script setup lang="ts">
import {useAppSession} from '../session-context.ts';

import TutorialMenu from '../TutorialMenu.vue';

const {goHome, startLesson, campaignHasSave, campaignNotice, startCampaign}=useAppSession();
const {T}=useAppSession();
</script>
<template>
<TutorialMenu :lessons="T.TUTORIAL_LESSONS" :has-campaign="campaignHasSave" :campaign-notice="campaignNotice" @campaign="startCampaign($event)" @home="goHome" @start="startLesson"/>
</template>
