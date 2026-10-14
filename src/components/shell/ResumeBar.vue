<script setup lang="ts">
import AppIcon from '../AppIcon.vue';
import {Button} from '../ui/button';
withDefaults(defineProps<{title:string;hint?:string;action?:string;tone?:'local'|'online'}>(),{action:'继续',tone:'local'});
defineEmits<{resume:[]}>();
</script>
<template>
  <div class="resume-bar" :class="'is-'+tone" role="group" :aria-label="title">
    <span class="resume-glyph" aria-hidden="true"><AppIcon :name="tone==='online'?'online':'compass'"/></span>
    <div class="resume-text"><strong>{{title}}</strong><small v-if="hint">{{hint}}</small></div>
    <Button @click="$emit('resume')"><AppIcon name="play"/> {{action}}</Button>
  </div>
</template>
<style scoped>
.resume-bar {
  display: flex; align-items: center; gap: 14px; padding: 12px 12px 12px 14px;
  border: 1px solid rgb(230 185 101 / .32); border-radius: var(--radius-lg);
  background: linear-gradient(90deg, rgb(230 185 101 / .1), rgb(230 185 101 / .02) 70%), var(--ink-1);
}
.resume-bar.is-online { border-color: rgb(112 223 213 / .3); background: linear-gradient(90deg, rgb(112 223 213 / .09), transparent 70%), var(--ink-1); }
.resume-glyph { display: grid; place-items: center; width: 36px; height: 36px; flex: none; border-radius: 50%; background: var(--brass-wash); color: var(--brass); }
.is-online .resume-glyph { background: var(--signal-wash); color: var(--signal); }
.resume-text { display: grid; flex: 1; min-width: 0; gap: 2px; }
.resume-text strong { font-size: 14px; font-weight: 600; }
.resume-text small { color: var(--text-2); font-size: 12px; }
@media (max-width: 520px) {
  .resume-bar { flex-wrap: wrap; }
  .resume-bar > :last-child { width: 100%; }
}
</style>
