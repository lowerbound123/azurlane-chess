<script setup lang="ts">
import {ref} from 'vue';
import StatusOverlay from './components/StatusOverlay.vue';
import type {MapModel, RenderShip} from '../shared/render.ts';
import type {Hex} from '../shared/game.ts';
import {useBattleMap} from './composables/use-battle-map.ts';
import {Button} from './components/ui/button';
const props=defineProps<{model:MapModel}>();
const emit=defineEmits<{zoom:[value:number];rotate:[value:boolean];hex:[value:{hex:Hex;event:PointerEvent;forceMove:boolean}];ship:[value:{ship:RenderShip;event:PointerEvent}];node:[value:{index:number;shipId:string}];hover:[value:Hex|null];home:[];undo:[]}>();
const host=ref<HTMLElement|null>(null);
const statusOverlay=ref<InstanceType<typeof StatusOverlay>|null>(null);
const {error,loading,initialize,reset,focus,zoomBy,toggleRotate}=useBattleMap(host,props,emit,anchors=>statusOverlay.value?.updatePositions(anchors));
defineExpose({reset,focus,zoomBy,toggleRotate});
</script>
<template><div ref="host" class="battle-map-3d map-scroll"><StatusOverlay v-if="!loading&&!error" ref="statusOverlay" :model="model"/><div v-if="loading" class="map-render-error" role="status"><strong>正在加载战场模型</strong><p>准备飞机与水雷资源…</p></div><div v-if="error" class="map-render-error" role="alert"><strong>三维战场暂时无法显示</strong><p>{{error}}</p><Button variant="outline" @click="initialize">重试加载</Button><Button variant="outline" @click="emit('home')">返回菜单</Button></div></div></template>
