<script setup lang="ts">
import {computed,ref,watch} from 'vue';
import type {StatusInstance} from '../../shared/status.ts';
import {statusGroups} from '../status-presentation.ts';
import {icons,type IconName} from '../icons.ts';
import AppIcon from './AppIcon.vue';
import StatusDetails from './StatusDetails.vue';
import {Tooltip,TooltipContent,TooltipProvider,TooltipTrigger} from './ui/tooltip';
const props=defineProps<{statuses?:StatusInstance[];round:number;unitName:string}>();
const groups=computed(()=>statusGroups(props.statuses,props.round)),openId=ref<string|null>(null);
const icon=(name:string):IconName=>Object.hasOwn(icons,name)?name as IconName:'question';
const toggle=(id:string)=>{openId.value=openId.value===id?null:id;};
watch(()=>groups.value.map(g=>g.id).join('|'),()=>{openId.value=null;});
function close(){openId.value=null;}
function focus(event:FocusEvent,id:string){if((event.target as HTMLElement).matches(':focus-visible'))openId.value=id;}
defineExpose({close});
</script>
<template>
  <div v-if="groups.length" class="unit-status-strip" :aria-label="`${unitName}的状态`" @pointerdown.stop @pointerup.stop @click.stop @dblclick.stop @contextmenu.stop.prevent @keydown.stop @keydown.esc="close">
   <TooltipProvider v-for="group in groups.slice(0,4)" :key="group.id" :delay-duration="150"><Tooltip :disable-closing-trigger="true" :open="openId===group.id" @update:open="value=>{if(value)openId=group.id;else if(openId===group.id)close()}">
    <TooltipTrigger as-child><button type="button" class="unit-status-icon" :class="[group.kind,{pending:group.pending}]" :aria-label="`${unitName}：${group.name}`" @focus="focus($event,group.id)" @click="toggle(group.id)"><AppIcon :name="icon(group.icon)"/><small v-if="group.maxStacks>1">{{group.stacks}}</small><span v-if="group.pending" class="status-wait">◷</span></button></TooltipTrigger>
    <TooltipContent class="unit-status-tip" :collision-padding="8" :side-offset="6" @pointerdown.stop @pointerup.stop @click.stop @keydown.stop @pointerdown-outside="close" @escape-key-down="close"><StatusDetails :group="group"/></TooltipContent>
   </Tooltip></TooltipProvider>
   <TooltipProvider v-if="groups.length>4" :delay-duration="150"><Tooltip :disable-closing-trigger="true" :open="openId==='overflow'" @update:open="value=>{if(value)openId='overflow';else if(openId==='overflow')close()}">
    <TooltipTrigger as-child><button type="button" class="unit-status-icon overflow" :aria-label="`${unitName}：其余 ${groups.length-4} 个状态`" @focus="focus($event,'overflow')" @click="toggle('overflow')">+{{groups.length-4}}</button></TooltipTrigger>
    <TooltipContent class="unit-status-tip" :collision-padding="8" @pointerdown.stop @pointerup.stop @click.stop @keydown.stop @pointerdown-outside="close" @escape-key-down="close"><StatusDetails v-for="group in groups.slice(4)" :key="group.id" :group="group"/></TooltipContent>
   </Tooltip></TooltipProvider>
  </div>
</template>
<style>
.unit-status-strip{transform:scale(calc(1 / 3));transform-origin:50% 100%;display:flex;justify-content:center;gap:2px;pointer-events:auto;width:max-content;touch-action:manipulation}.unit-status-icon{position:relative;display:flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:2px;border:1px solid #7f9bab;border-radius:5px;background:#0c1c29ed;color:#acc1d0;box-shadow:0 2px 5px #0008;cursor:help}.unit-status-icon .app-icon{width:18px;height:18px}.unit-status-icon.buff{border-color:#59b9a5;color:#8ce5cd}.unit-status-icon.debuff{border-color:#d37c66;color:#ffb099}.unit-status-icon.pending{opacity:.6}.unit-status-icon:focus-visible{outline:2px solid #f4d08a;outline-offset:2px}.unit-status-icon small{position:absolute;right:-3px;bottom:-4px;background:#0c1825;border-radius:4px;padding:0 3px;font:10px monospace;color:#fff}.unit-status-icon.overflow{font:11px monospace}.status-wait{position:absolute;right:-2px;top:-6px;color:#fff;font-size:11px}.unit-status-tip{animation:none!important;z-index:80!important;max-width:min(320px,calc(100vw - 16px));max-height:60vh;overflow:auto;background:#102331!important;color:#d9e3e9!important;border:1px solid #608092;box-shadow:0 6px 22px #0009;text-wrap:wrap!important;pointer-events:auto}.unit-status-tip .status-details+.status-details{border-top:1px solid #607c8b;margin-top:10px;padding-top:8px}
</style>
