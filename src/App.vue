<script setup lang="ts">
import {provide, inject} from 'vue';
import {useRouter, RouterView} from 'vue-router';
import {createAppSession} from './app-session.ts';
import {SESSION_KEY} from './session-context.ts';
import AppHeader from './components/shell/AppHeader.vue';
import RulesDialog from './components/RulesDialog.vue';
import ConnectionCard from './ConnectionCard.vue';
import SaveManager from './SaveManager.vue';
import {Dialog, DialogContent, DialogTitle, DialogDescription} from './components/ui/dialog';
import {Sheet, SheetContent, SheetTitle, SheetDescription} from './components/ui/sheet';
import {Toaster} from './components/ui/sonner';
const router=useRouter();
const session=inject(SESSION_KEY,null)??createAppSession(router);provide(SESSION_KEY,session);
const {game, serverAddress, connectionOpen, disconnectOpen, connectionBusy, disconnectBusy, connectionNickname, closeConnectionCard, confirmDisconnect, accountState, onlineState, onlineStatus, onlineError, onlinePending, onlineActive, connectOnline, ordersOpen, saveOpen, saveRecords, saveNotice, pendingSave, canSave, closeSaves, writeSave, loadSave, confirmSaveAction, importSave, exportSave, screen, showRules, toast, showLog, safeLogs}=session;
</script>
<template>

<div class="shell" :class="{'battle-active':screen==='battle','orders-closed':!ordersOpen}">
<AppHeader v-if="screen!=='battle'||!game||($route.meta.online&&!onlineActive)"/>
<Sheet :open="showLog&&screen==='battle'" @update:open="showLog=$event"><SheetContent side="right" class="overflow-y-auto"><SheetTitle>战报</SheetTitle><SheetDescription>当前可见的战斗事件</SheetDescription><p v-if="!safeLogs.length">尚未交战</p><p v-for="(l,i) in safeLogs" :key="i">R{{l.round}} · {{l.text}}</p></SheetContent></Sheet>
<RouterView :key="router.currentRoute.value.path"/>
<ConnectionCard v-if="connectionOpen||disconnectOpen" :status="onlineStatus" :error="onlineError" :pending="connectionBusy||onlinePending||disconnectBusy" :account="accountState.user" :nickname="connectionNickname" :server="serverAddress" :disconnect="disconnectOpen" :has-match="onlineState?.match?.stage!=='ended'&&!!onlineState?.match" :has-room="!!onlineState?.room" :has-queue="!!onlineState?.queue" @close="closeConnectionCard" @connect="connectOnline" @disconnect="confirmDisconnect"/>
<Dialog :open="saveOpen" @update:open="saveOpen=$event"><DialogContent class="save-dialog sm:max-w-4xl max-h-[85dvh] overflow-y-auto" :show-close-button="false"><DialogTitle class="sr-only">保存与读取</DialogTitle><DialogDescription class="sr-only">本地存档与 JSON 备份</DialogDescription><SaveManager v-if="saveOpen" standalone :records="saveRecords" :can-save="canSave" :notice="saveNotice" :pending="pendingSave" :in-battle="screen==='battle'" @close="closeSaves" @write="writeSave" @load="loadSave" @export="exportSave" @import="importSave" @confirm="confirmSaveAction" @cancel="pendingSave=null"/></DialogContent></Dialog>
<div v-if="toast" class="toast" role="status">{{toast}}</div>
<RulesDialog v-model:open="showRules"/>
<Toaster/>
</div>
</template>
