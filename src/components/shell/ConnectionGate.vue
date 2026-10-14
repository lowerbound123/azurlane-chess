<script setup lang="ts">
import AppIcon from '../AppIcon.vue';
import type {IconName} from '../../icons.ts';
withDefaults(defineProps<{title?:string;status?:string;error?:string;icon?:IconName;spin?:boolean}>(),{title:'连接服务器后继续',icon:'plug'});
</script>
<template>
  <section class="route-connection-gate panel frame reveal">
    <div class="gate-emblem" aria-hidden="true"><AppIcon :name="icon" :spin="spin"/></div>
    <h2>{{title}}</h2>
    <p v-if="status" class="gate-status">{{status}}</p>
    <p v-if="error" class="online-error notice is-error" role="alert"><AppIcon name="warning"/><span>{{error}}</span></p>
    <div class="gate-actions"><slot/></div>
  </section>
</template>
<style scoped>
.route-connection-gate {
  width: min(560px, calc(100% - 32px)); margin: 56px auto; padding: 40px 32px 32px;
  display: grid; justify-items: center; gap: 12px; text-align: center;
  --frame-opacity: .55;
}
.gate-emblem {
  display: grid; place-items: center; width: 64px; height: 72px; margin-bottom: 6px;
  clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
  background: linear-gradient(180deg, rgb(112 223 213 / .22), rgb(112 223 213 / .06));
  color: var(--signal); font-size: 22px;
}
.route-connection-gate h2 { font-size: 22px; }
.gate-status { color: var(--text-2); font-size: 13px; }
.online-error { text-align: left; width: 100%; }
.gate-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 10px; }
</style>
