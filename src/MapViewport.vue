<script setup lang="ts">
import {ref, onBeforeUnmount} from 'vue';
import {useResizeObserver} from '@vueuse/core';
import {createViewportGesture} from './composables/viewport-gesture.ts';
const emit=defineEmits<{zoom:[value:number]}>();
const host=ref<HTMLElement|null>(null);
const gesture=createViewportGesture({setPointerCapture:id=>host.value?.setPointerCapture(id),bounds:()=>host.value?.querySelector('svg')?.getBoundingClientRect()??{left:0,top:0,width:900,height:615},render:(box,zoom)=>{host.value?.querySelector('svg')?.setAttribute('viewBox',box);emit('zoom',zoom);}});
useResizeObserver(host,()=>{gesture.cancel();gesture.renderCamera();});
onBeforeUnmount(()=>gesture.cancel());
</script>
<template><div ref="host" class="map-scroll" @pointerdown="gesture.down" @pointermove="gesture.move" @pointerup="gesture.up" @pointercancel="gesture.up" @lostpointercapture="gesture.up" @click.capture="gesture.captureClick" @contextmenu.capture="gesture.captureClick"><slot/></div></template>
