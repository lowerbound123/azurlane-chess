<script setup lang="ts" generic="T extends string|number">
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from './ui/select';
import type {AcceptableValue} from 'reka-ui';
const props=defineProps<{modelValue:T|undefined;items:readonly {value:T;label:string;disabled?:boolean}[];disabled?:boolean;label?:string}>();
const emit=defineEmits<{'update:modelValue':[value:T];change:[value:T]}>();
function update(value:AcceptableValue){const item=props.items.find(item=>String(item.value)===String(value));if(item){emit('update:modelValue',item.value);emit('change',item.value);}}
</script>
<template><Select :model-value="modelValue==null?undefined:String(modelValue)" :disabled="disabled" @update:model-value="update"><SelectTrigger :aria-label="label" :data-value="modelValue"><SelectValue/></SelectTrigger><SelectContent><SelectItem v-for="item in items" :key="String(item.value)" :value="String(item.value)" :disabled="item.disabled">{{item.label}}</SelectItem></SelectContent></Select></template>
