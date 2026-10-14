<script setup lang="ts">
import BrandMark from '../BrandMark.vue';
import ShellActions from './ShellActions.vue';
import {APP_VERSION} from '../../version.ts';
</script>
<template>
  <header class="app-header">
    <div class="brand">
      <BrandMark/>
      <div class="brand-text"><strong>碧蓝推演棋</strong><span>AZUR LANE · TACTICAL CHESS</span></div>
      <span class="release-tag">{{APP_VERSION}}</span>
    </div>
    <ShellActions/>
  </header>
</template>
<style scoped>
.app-header {
  position: sticky; top: 0; z-index: 40;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  height: var(--header-h); padding: 0 max(20px, env(safe-area-inset-right)) 0 max(20px, env(safe-area-inset-left));
  background: linear-gradient(180deg, rgb(4 11 18 / .92), rgb(4 11 18 / .72));
  border-bottom: 1px solid var(--line-1);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}
.brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
.brand :deep(.brand-mark) { width: 30px; height: 30px; flex: none; }
.brand-text { display: grid; line-height: 1.1; }
.brand-text strong { font-size: 16px; font-weight: 700; letter-spacing: .14em; }
.brand-text span { margin-top: 3px; font: 600 9px/1 var(--font-display); font-stretch: 112%; letter-spacing: .3em; color: var(--text-3); }
.release-tag { padding: 3px 7px; border: 1px solid var(--line-2); border-radius: 4px; font: 500 10.5px/1 var(--font-code); color: var(--text-3); }
@media (max-width: 760px) {
  .brand-text span, .release-tag { display: none; }
  .brand-text strong { font-size: 15px; letter-spacing: .1em; }
}
@media (max-width: 420px) { .brand-text { display: none; } }
</style>
