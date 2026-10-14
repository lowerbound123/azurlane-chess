<script setup lang="ts">
import ChoiceSelect from './ChoiceSelect.vue';
import {computed} from 'vue';
import type {BattleMode} from '../../shared/domination.ts';
const props=withDefaults(defineProps<{modelValue:BattleMode;disabled?:boolean;dominationAvailable?:boolean;unavailableReason?:string}>(),{dominationAvailable:true});
const emit=defineEmits<{'update:modelValue':[value:BattleMode]}>();
const items=computed(()=>[{value:'annihilation',label:'舰队歼灭 · 19 × 15'},{value:'domination',label:'三据点占领 · 21 × 17',disabled:!props.dominationAvailable}]);
</script>
<template>
 <div class="battle-mode-select">
  <label class="battle-mode-field">对战模式 <ChoiceSelect :model-value="modelValue" label="对战模式" :disabled="disabled" :items="items" @update:model-value="emit('update:modelValue',$event as BattleMode)" /></label>
  <p>{{modelValue==='domination'?'争夺 A / B / C 三个据点，每点每轮 5 分、击沉敌舰 15 分，目标 100 分。':'歼灭敌方舰队；第 30 回合按存活舰数和总耐久结算。'}}</p>
  <p v-if="!dominationAvailable" class="mode-unavailable">{{unavailableReason || '当前服务器不支持三据点占领，请选择舰队歼灭。'}}</p>
 </div>
</template>
<style scoped>
.battle-mode-select {min-width:0;}
.battle-mode-field {display:flex;align-items:center;flex-wrap:wrap;gap:10px;color:var(--text-1);font-size:13px;}
.battle-mode-field :deep(button) {min-width:220px;}
.battle-mode-select p {margin:9px 0 0;color:var(--text-2);font-size:12px;line-height:1.7;}
.battle-mode-select .mode-unavailable {color:var(--brass-hi);}
@media(max-width:600px){.battle-mode-field {align-items:stretch;flex-direction:column;gap:6px;}.battle-mode-field :deep(button){width:100%;min-width:0;}}
</style>
