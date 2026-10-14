<script setup lang="ts">
defineProps<{eyebrow:string;title:string;lede?:string}>();
</script>
<template>
  <header class="page-head reveal">
    <div class="page-head-text">
      <p class="eyebrow">{{eyebrow}}</p>
      <h1>{{title}}</h1>
      <p v-if="lede" class="lede">{{lede}}</p>
      <slot name="meta"/>
    </div>
    <div v-if="$slots.actions" class="actions"><slot name="actions"/></div>
  </header>
</template>
