<script setup lang="ts">
import {computed, ref} from 'vue';
import AppIcon from './components/AppIcon.vue';
import {Button} from './components/ui/button';
import {Input} from './components/ui/input';
import {Label} from './components/ui/label';
import {Badge} from './components/ui/badge';
import {Dialog, DialogContent, DialogTitle, DialogDescription} from './components/ui/dialog';
import {AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription} from './components/ui/alert-dialog';
import type {ConnectionStatus, User} from '../shared/network.ts';
const props=defineProps<{status:ConnectionStatus;error:string;pending:boolean;account:User|null;nickname:string;server:string;disconnect:boolean;hasMatch:boolean;hasRoom:boolean;hasQueue:boolean}>();
const emit=defineEmits<{close:[];connect:[nickname:string];disconnect:[]}>();
const guestName=ref(props.nickname||'指挥官');
const label=computed(()=>({connected:'已连接',connecting:'连接中',reconnecting:'断线重连中',disconnected:'未连接'})[props.status]);
const close=()=>{if(!props.pending)emit('close');};
const preventWhilePending=(event:Event)=>{if(props.pending)event.preventDefault();};
</script>
<template>
<AlertDialog v-if="disconnect" :open="true" @update:open="close">
<AlertDialogContent class="connection-card" aria-label="断开服务器连接" @escape-key-down="preventWhilePending">
<AlertDialogTitle><AppIcon name="disconnected"/> 断开服务器连接</AlertDialogTitle>
<AlertDialogDescription>{{hasMatch?'断开连接将先认输并退出当前对局，此操作会结束本次对战。':hasRoom?'断开连接将先离开当前房间。':hasQueue?'断开连接将先取消快速匹配。':'断开后在线入口暂时不可用，可以随时重新连接。'}}</AlertDialogDescription>
<p class="server-address">{{server}}</p><Badge>{{label}}</Badge>
<p v-if="error" class="online-error" role="alert">{{error}}</p>
<p v-if="status!=='connected'&&(hasMatch||hasRoom||hasQueue)">请等待连接恢复后再确认退出。</p>
<div class="connection-actions"><Button variant="outline" :disabled="pending" @click="close">取消</Button><Button variant="destructive" class="danger" :disabled="pending||(status!=='connected'&&(hasMatch||hasRoom||hasQueue))" @click="emit('disconnect')"><AppIcon v-if="pending" name="spinner" spin/> {{hasMatch?'确认认输并断开':'确认断开'}}</Button></div>
</AlertDialogContent></AlertDialog>
<Dialog v-else :open="true" @update:open="close">
<DialogContent class="connection-card" aria-label="连接服务器" :show-close-button="!pending" @escape-key-down="preventWhilePending" @interact-outside="preventWhilePending">
<DialogTitle><AppIcon name="plug"/> 连接服务器</DialogTitle><DialogDescription>连接当前网页所在服务器，使用在线 AI、房间和快速匹配。</DialogDescription>
<p class="server-address">{{server}}</p><Badge class="connection-card-status" role="status"><AppIcon :name="status==='connected'?'check':status==='disconnected'?'disconnected':'spinner'" :spin="status==='connecting'||status==='reconnecting'"/> {{label}}</Badge>
<p v-if="error" class="online-error" role="alert">{{error}}</p>
<p v-if="account">以 {{account.username}} 的账号身份连接</p><div v-else class="connection-nickname"><Label for="connection-nickname">访客昵称</Label><Input id="connection-nickname" v-model="guestName" maxlength="20" aria-label="访客昵称" :disabled="pending"/></div>
<div class="connection-actions"><Button variant="outline" :disabled="pending" @click="close">关闭</Button><Button variant="default" v-if="status!=='connected'" :disabled="pending||status==='connecting'||status==='reconnecting'||!guestName.trim()" @click="emit('connect',guestName.trim())"><AppIcon :name="pending?'spinner':'plug'" :spin="pending"/> {{pending?'正在连接':'连接服务器'}}</Button></div>
</DialogContent></Dialog>
</template>
