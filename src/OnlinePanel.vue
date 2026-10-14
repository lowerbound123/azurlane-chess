<script setup lang="ts">
import BattleModeSelect from './components/BattleModeSelect.vue';
import PageHead from './components/shell/PageHead.vue';
import ChoiceSelect from './components/ChoiceSelect.vue';
import {computed} from 'vue';
import FleetSelection from './FleetSelection.vue';
import AppIcon from './components/AppIcon.vue';
import {Button} from './components/ui/button';

import type {OnlineState, ConnectionStatus, PublicConfig} from '../shared/network.ts';

const props=withDefaults(defineProps<{state:OnlineState|null;status:ConnectionStatus;error:string;config:PublicConfig;dominationAvailable?:boolean;modeHelp?:string;pending:boolean;clock:number}>(),{});
const emit=defineEmits(['command','battle','home']);
const room=computed(()=>{return props.state?.room;});
const match=computed(()=>{return props.state?.match;});
const host=computed(()=>{return room.value?.hostId===props.state?.player?.id;});
const ready=computed(()=>{return room.value?.players.find(p=>p.id===props.state?.player?.id)?.ready;});
const draftSeconds=computed(()=>{if(match.value?.stage!=='draft'||match.value.deadline==null)return null;const now=match.value.paused?(match.value.pausedAt??props.clock??Date.now()):(props.clock??Date.now());return Math.max(0,Math.min(120,Math.ceil((match.value.deadline-now)/1000)));});
function roomLimitChange(event:Event){if(event.target instanceof HTMLSelectElement)command('room.update',{turnSeconds:Number(event.target.value)});}
function command(type:string,payload:Record<string,unknown>={}){emit('command',type,payload);}
</script>
<template>
<main class="online-panel"><PageHead eyebrow="FLEET NETWORK" :title="room?'房间 '+room.code:match?.draft?'猜先与选禁':'在线对局'"><template #actions><Button variant="outline" @click="$emit('home')"><AppIcon name="home"/> 主菜单</Button></template></PageHead>
  <p v-if="error" role="alert" class="online-error">{{error}}</p><p v-if="match?.recordStatus" class="account-record-status" role="status">{{match.recordStatus==='saved'?'战绩已保存':'战绩暂未保存'}}</p>
  <section v-if="match?.draft&&!match.game" class="draft-session"><p>对战模式：{{match.battleMode==='domination'?'三据点占领 · 21 × 17':'舰队歼灭 · 19 × 15'}}</p><div class="draft-lobby-controls"><p v-if="draftSeconds!==null" class="draft-clock"><AppIcon name="clock"/> 选禁剩余 <strong>{{draftSeconds}} 秒</strong>{{match.paused?' · 已暂停':''}} · 每次操作限时 120 秒，超时未操作者判负；双方均未确认则中止。</p><p v-if="match.paused">对局暂停，等待重连</p><p v-if="match.result">{{match.result.reason}}</p><Button variant="outline" v-if="match.stage==='ended'" :disabled="pending||status!=='connected'" @click="command('match.leave')"><AppIcon name="back"/> 返回游戏模式</Button><Button variant="outline" v-else :disabled="pending||status!=='connected'" @click="command('match.resign')"><AppIcon name="flag"/> 退出选禁并认输</Button></div><FleetSelection :draft="match.draft" :team="match.myTeam" :disabled="pending||status!=='connected'||match.paused||match.stage==='ended'" @guess="command('draft.guess',$event)" @action="command('draft.action',$event)" @confirm="command('draft.confirm',$event)"/></section>
  <section v-else-if="match"><p>对战模式：{{match.battleMode==='domination'?'三据点占领':'舰队歼灭'}}</p><h2>{{match.kind==='ai'?'AI 对战':'玩家对战'}}</h2><p>第 {{match.round}} 回合 · {{match.stage}} · 我方 {{match.myTeam+1}} 队</p><p v-if="match.kind==='ai'">AI 模式：{{match.aiMode==='full'?'FULL':'普通'}}</p><Button variant="outline" @click="$emit('battle')"><AppIcon name="play"/> 进入战场</Button><Button variant="outline" v-if="match.stage==='ended'" :disabled="pending" @click="command('match.leave')">返回游戏模式</Button></section>
  <section v-else-if="room"><p v-for="player in room.players" :key="player.id"><AppIcon name="user"/> {{player.nickname}} · {{player.ready?'已准备':'未准备'}} {{player.id===room.hostId?'（房主）':''}}</p><p>双方准备后进入猜先与轮流选禁，最终各 5 艘，均为 3 前排＋2 后排。</p><BattleModeSelect :domination-available="dominationAvailable ?? config.battleModes?.includes('domination') === true" :unavailable-reason="modeHelp" :model-value="room.battleMode ?? 'annihilation'" :disabled="!host||pending||status!=='connected'" @update:model-value="command('room.update',{battleMode:$event})" /><label>回合限时 <ChoiceSelect :model-value="room.turnSeconds" :disabled="!host||pending" label="回合限时" :items="(config.roomLimits||[0,60,120,300]).map(value=>({value,label:value?value+' 秒':'不限时'}))" @update:model-value="command('room.update',{turnSeconds:$event})" /></label><div class="room-actions"><Button variant="outline" :disabled="pending" @click="command('room.ready',{ready:!ready})"><AppIcon name="check"/> {{ready?'取消准备':'准备'}}</Button><Button variant="outline" v-if="host" :disabled="pending||room.players.length!==2||!room.players.every(p=>p.ready)" @click="command('room.start')"><AppIcon name="play"/> 开始选船</Button><Button variant="outline" :disabled="pending" @click="command('room.leave')"><AppIcon name="logout"/> 离开房间</Button></div></section>
  <section v-else><p>当前没有在线房间或对局。</p><Button variant="outline" @click="$emit('home')">返回主菜单</Button></section></main>
</template>
