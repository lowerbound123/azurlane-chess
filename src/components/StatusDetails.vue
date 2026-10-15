<script setup lang="ts">
import type {statusGroups} from '../status-presentation.ts';
defineProps<{group:ReturnType<typeof statusGroups>[number]}>();
const categories={buff:'增益',debuff:'减益',neutral:'中性'};
</script>
<template>
 <section class="status-details">
  <strong>{{group.name}} <small>{{categories[group.kind]}}</small></strong>
  <div v-if="group.maxStacks>1">生效层数 {{group.stacks}} / {{group.maxStacks}}</div>
  <div v-for="effect in group.effects" :key="effect" class="status-effect">{{effect}}</div>
  <div v-for="instance in group.instances" :key="instance.id" class="status-instance">
   <div v-if="instance.state==='pending'" class="status-note">等待生效</div>
   <div v-else-if="instance.state==='suppressed'" class="status-note">受更强同类状态覆盖，暂未生效</div>
   <div>{{instance.description}}</div>
   <div v-if="instance.state!=='active'">{{instance.effects.join(' · ')}}</div>
   <div>{{instance.timing}}</div>
   <div v-if="instance.name">来源：{{instance.name}}</div>
  </div>
 </section>
</template>
<style scoped>
.status-details{min-width:180px;max-width:300px;line-height:1.65;text-align:left}.status-details strong{display:block;color:#f3ead7;font-size:13px}.status-details small{font-weight:400;color:#a8bbc6;margin-left:6px}.status-effect{color:#b2eade}.status-instance{border-top:1px solid #ffffff20;margin-top:5px;padding-top:5px;color:#c5d2d8}.status-note{color:#edc78c}
</style>
