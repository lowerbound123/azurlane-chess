<script setup lang="ts">
import AppIcon from './AppIcon.vue';
import {ref,watch} from 'vue';
const props=defineProps<{template:string;name:string;src?:string;error?:string}>();
const loaded=ref(false),failed=ref(false);
watch(()=>props.src,()=>{loaded.value=false;failed.value=false;},{flush:'sync'});
</script>
<template>
  <span class="spine-thumbnail" :data-spine-template="template" :data-spine-status="failed||error?'error':loaded?'ready':'loading'" :title="error">
    <img v-if="src&&!failed" :src="src" :alt="name+' · Spine 待机角色'" width="256" height="320" decoding="async" fetchpriority="high" @load="loaded=true" @error="failed=true"/>
    <span v-if="!loaded" class="spine-placeholder"><AppIcon name="ship"/><small>{{error||failed?'素材失败':'加载中'}}</small></span>
  </span>
</template>
<style scoped>
.spine-thumbnail{position:relative;display:block;width:100%;height:100%;overflow:hidden;pointer-events:none}
.spine-thumbnail img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:contain;object-position:center}
.spine-placeholder{display:flex;height:100%;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:#a1a1aa}
.spine-placeholder small{font-size:9px}
</style>
