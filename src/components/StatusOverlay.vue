<script setup lang="ts">
import {computed,type ComponentPublicInstance} from 'vue';
import type {MapModel} from '../../shared/render.ts';
import {projectStatuses} from '../../shared/status.ts';
import type {StatusAnchor} from '../scene/units.ts';
import {AIR_ROLE_LABELS} from '../ship-definitions.ts';
import UnitStatusStrip from './UnitStatusStrip.vue';
const props=defineProps<{model:MapModel}>();
const elements=new Map<string,HTMLElement>(),strips=new Map<string,InstanceType<typeof UnitStatusStrip>>();
const units=computed(()=>{
 const all=[...props.model.ships,...props.model.planes],known=new Set(all.map(u=>u.id));
 return all.filter(u=>u.hp>0&&u.statuses?.length).map(u=>({id:u.id,name:'label' in u?u.label:u.cfg.role?AIR_ROLE_LABELS[u.cfg.role]:'飞机',statuses:projectStatuses(u.statuses,known)}));
});
function bindElement(id:string,value:Element|ComponentPublicInstance|null){if(value instanceof HTMLElement)elements.set(id,value);else elements.delete(id);}
function bindStrip(id:string,value:Element|ComponentPublicInstance|null){if(value)strips.set(id,value as InstanceType<typeof UnitStatusStrip>);else strips.delete(id);}
function updatePositions(anchors:StatusAnchor[]){
 const visible=new Set<string>();
 for(const anchor of anchors){const node=elements.get(anchor.id);if(!node||!anchor.visible)continue;visible.add(anchor.id);node.style.transform=`translate(${anchor.x}px,${anchor.y-4}px) translate(-50%,-100%)`;node.style.visibility='visible';node.removeAttribute('aria-hidden');}
 for(const [id,node]of elements)if(!visible.has(id)){if(node.style.visibility!=='hidden')strips.get(id)?.close();node.style.visibility='hidden';node.setAttribute('aria-hidden','true');}
}
defineExpose({updatePositions});
</script>
<template><div class="status-overlay"><div v-for="unit in units" :key="unit.id" :ref="el=>bindElement(unit.id,el)" :data-status-unit="unit.id" class="status-anchor"><UnitStatusStrip :ref="el=>bindStrip(unit.id,el)" :unit-name="unit.name" :statuses="unit.statuses" :round="model.round??1"/></div></div></template>
<style scoped>
.status-overlay{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:3}.status-anchor{position:absolute;left:0;top:0;visibility:hidden;will-change:transform;pointer-events:none}
</style>
