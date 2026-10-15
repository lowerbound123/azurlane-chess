<script setup lang="ts">
import type {ShipType} from '../../shared/game.ts';
import {SHIP_SYMBOLS} from '../ship-symbols.ts';
defineProps<{type:ShipType}>();
</script>
<template>
 <svg class="ship-class-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" role="img" :aria-label="SHIP_SYMBOLS[type].name"><title>{{SHIP_SYMBOLS[type].name}}</title><path :d="SHIP_SYMBOLS[type].path"/></svg>
</template>
<style scoped>
.ship-class-icon{display:inline-block;width:17px;height:20px;flex:none;vertical-align:middle}
</style>
