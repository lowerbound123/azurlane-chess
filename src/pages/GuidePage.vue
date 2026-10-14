<script setup lang="ts">
import {useAppSession} from '../session-context.ts';

import TutorialBook from '../TutorialBook.vue';

const {goHome, lessonMenu}=useAppSession();
const {T}=useAppSession();
</script>
<template>
<TutorialBook :chapters="T.TEXT_TUTORIAL" :figures="T.SVG_FIGURES" @home="goHome" @practice="lessonMenu"/>
</template>
