<script setup lang="ts">
defineProps<{title:string;lede?:string}>();
</script>
<template>
  <header class="page-head reveal">
    <div class="page-head-text">
      <h1>{{title}}</h1>
      <p v-if="lede" class="lede">{{lede}}</p>
      <slot name="meta"/>
    </div>
    <div v-if="$slots.actions" class="actions"><slot name="actions"/></div>
  </header>
</template>
