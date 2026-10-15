<script setup lang="ts">
import {ref} from 'vue';
import type {BattleMode} from '../../shared/domination.ts';
const props=defineProps<{modelValue:BattleMode}>();
const emit=defineEmits<{'update:modelValue':[value:BattleMode]}>();
const host=ref<HTMLElement|null>(null);
const modes=[{value:'annihilation',label:'舰队歼灭',map:'19 × 15'},{value:'domination',label:'据点占领',map:'21 × 17'}] as const;
function move(event:KeyboardEvent){if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const value=event.key==='Home'?'annihilation':event.key==='End'?'domination':props.modelValue==='annihilation'?'domination':'annihilation';emit('update:modelValue',value);host.value?.querySelector<HTMLButtonElement>(`[data-mode-value="${value}"]`)?.focus();}
</script>
<template><div ref="host" class="battle-mode-toggle" :class="{domination:modelValue==='domination'}" role="radiogroup" aria-label="对战模式" @keydown="move"><span class="mode-thumb" aria-hidden="true"/><button v-for="mode in modes" :key="mode.value" type="button" role="radio" :aria-checked="modelValue===mode.value" :tabindex="modelValue===mode.value?0:-1" :data-mode-value="mode.value" @click="emit('update:modelValue',mode.value)"><strong>{{mode.label}}</strong><small>{{mode.map}}</small></button></div></template>
<style scoped>
.battle-mode-toggle{position:relative;display:grid;grid-template-columns:1fr 1fr;width:288px;max-width:100%;padding:4px;border:1px solid var(--line-2);border-radius:9px;background:var(--ink-0);isolation:isolate}.mode-thumb{position:absolute;inset:4px auto 4px 4px;width:calc(50% - 4px);background:var(--signal-wash);border:1px solid rgb(112 223 213 / .4);border-radius:5px;transition:transform .22s ease;z-index:-1}.domination .mode-thumb{transform:translateX(100%)}button{display:flex;align-items:center;justify-content:center;gap:9px;min-height:39px;padding:5px 10px;color:var(--text-3);background:none;border:0;border-radius:4px;cursor:pointer}strong{font-size:13px;font-weight:500;white-space:nowrap}small{font:9px var(--font-code);white-space:nowrap}button[aria-checked=true]{color:var(--signal)}button:focus-visible{outline:2px solid var(--brass-hi);outline-offset:1px}@media(max-width:600px){.battle-mode-toggle{width:218px}button{gap:4px;flex-direction:column;min-height:40px;padding:3px 6px}strong{font-size:11px}small{font-size:8px}}@media(prefers-reduced-motion:reduce){.mode-thumb{transition:none}}
</style>
