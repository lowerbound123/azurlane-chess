<script setup lang="ts">
import {useAppSession} from '../session-context.ts';
import AppIcon from '../components/AppIcon.vue';

import {Button} from '../components/ui/button';

const {goHome}=useAppSession();

</script>
<template>
<main class="not-found-page" data-page="not-found"><p class="eyebrow">404</p><h1>未找到页面</h1><p>这个地址没有对应的游戏页面。</p><Button variant="default" class="primary" @click="goHome"><AppIcon name="home"/> 返回主菜单</Button></main>
</template>
