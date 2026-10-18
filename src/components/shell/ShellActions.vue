<script setup lang="ts">
import {computed} from 'vue';
import {useAppSession} from '../../session-context.ts';
import AppIcon from '../AppIcon.vue';
import AccountUI from '../../AccountUI.vue';
import {Button} from '../ui/button';

// `compact` is the battle HUD variant: labels stay readable to assistive
// technology but collapse to icons until the viewport is wide enough.
defineProps<{compact?:boolean}>();
const {screen, busy, onlineActive, tutorial, campaign, onlineStatus, serverHost, connectionStatusLabel, connectionOpen, connectionWanted, disconnectBusy, accountClient, accountState, accountLocked, accountModal, showRules, goHome, openSaves, newGame, openOnline, requestDisconnect, isControl}=useAppSession();
const connected=computed(()=>onlineStatus.value==='connected');
const pending=computed(()=>onlineStatus.value==='connecting'||onlineStatus.value==='reconnecting');
const {audio}=useAppSession();
const {bgmMuted,voiceMuted,toggleBgm,toggleVoice}=audio;
</script>
<template>
  <div class="top-actions" :class="{compact}">
    <nav v-if="screen!=='home'" class="shell-nav" aria-label="游戏导航">
      <Button variant="ghost" class="shell-btn" :disabled="busy&&!onlineActive" title="主菜单" @click="goHome"><AppIcon name="home"/><span class="btn-label">主菜单</span></Button>
      <template v-if="screen==='battle'&&!onlineActive">
        <Button variant="ghost" class="shell-btn" :disabled="busy" :title="campaign?'保存教学':tutorial?'练习保存':'保存/读取'" :data-tutorial-highlight="isControl('save')?'true':null" @click="openSaves"><AppIcon name="save"/><span class="btn-label">{{campaign?'保存教学':tutorial?'练习保存':'保存/读取'}}</span></Button>
        <Button v-if="!tutorial&&!campaign" variant="ghost" class="shell-btn" :disabled="busy" title="重新编队" @click="newGame"><AppIcon name="anchor"/><span class="btn-label">重新编队</span></Button>
      </template>
    </nav>
    <span v-if="screen!=='home'" class="shell-sep" aria-hidden="true"/>
    <div class="audio-toggles" role="group" aria-label="声音设置">
      <Button variant="ghost" class="shell-btn audio-toggle" :class="{'is-muted':bgmMuted}" :aria-label="bgmMuted?'开启背景音乐':'静音背景音乐'" :title="bgmMuted?'开启背景音乐':'静音背景音乐'" :aria-pressed="bgmMuted" @click="toggleBgm"><span class="audio-glyph"><AppIcon name="music"/></span><span class="btn-label">BGM</span></Button>
      <Button variant="ghost" class="shell-btn audio-toggle" :class="{'is-muted':voiceMuted}" :aria-label="voiceMuted?'开启角色语音':'静音角色语音'" :title="voiceMuted?'开启角色语音':'静音角色语音'" :aria-pressed="voiceMuted" @click="toggleVoice"><span class="audio-glyph"><AppIcon name="voice"/></span><span class="btn-label">语音</span></Button>
    </div>
    <Button variant="outline" class="server-connect" :class="{'is-connected':connected}" aria-label="服务器连接设置" :aria-expanded="connectionOpen" :title="connected?serverHost:connectionStatusLabel" @click="openOnline">
      <span class="dot" :class="connected?'is-ok':pending?'is-busy':'is-off'" aria-hidden="true"/>
      <span class="server-label">{{connected?'已连接服务器':'连接服务器'}}</span>
      <small>{{connected?serverHost:connectionStatusLabel}}</small>
    </Button>
    <Button v-if="onlineStatus!=='disconnected'||connectionWanted" variant="ghost" class="shell-btn server-disconnect" aria-label="断开连接" title="断开连接" :disabled="disconnectBusy" @click="requestDisconnect"><AppIcon name="disconnected"/><span class="btn-label">断开连接</span></Button>
    <AccountUI :client="accountClient" :state="accountState" :locked="accountLocked" :compact="compact" @modal="accountModal=$event"/>
    <Button variant="ghost" size="icon" class="help-button" aria-label="规则与操作" title="规则与操作" @click="showRules=true"><AppIcon name="question"/></Button>
  </div>
</template>
<style scoped>
.top-actions { display: flex; align-items: center; gap: 4px; min-width: 0; }
.shell-nav { display: flex; align-items: center; gap: 2px; }
.shell-sep { width: 1px; height: 20px; margin: 0 6px; background: var(--line-2); }
.shell-btn { height: 34px; padding: 0 10px; color: var(--text-2); }
.shell-btn:hover { color: var(--text-1); }
.audio-toggles {display:flex;align-items:center;gap:2px;flex:none;}
.audio-glyph {position:relative;display:inline-flex;align-items:center;justify-content:center;}
.audio-toggle.is-muted {color:var(--text-3);}
.audio-toggle.is-muted .audio-glyph::after {content:'';position:absolute;width:20px;height:1.5px;background:currentColor;transform:rotate(-45deg);box-shadow:0 0 0 1px var(--ink-0);}
.help-button { width: 34px; height: 34px; color: var(--text-2); border-radius: 50%; border: 1px solid var(--line-2); }
.help-button:hover { color: var(--brass-hi); border-color: rgb(230 185 101 / .5); }

.server-connect { height: 34px; gap: 8px; padding: 0 12px 0 10px; border-radius: 999px; background: rgb(10 24 38 / .7); }
.server-connect.is-connected { border-color: rgb(134 220 176 / .35); }
.server-connect small { max-width: 14em; overflow: hidden; text-overflow: ellipsis; color: var(--text-3); font: 500 11px/1 var(--font-code); }
.server-connect[aria-expanded=true] { border-color: rgb(230 185 101 / .6); }
.server-label { font-size: 12.5px; }

.compact .btn-label, .compact .server-connect small { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.compact .shell-btn { width: 34px; padding: 0; }
@media (min-width: 1680px) {
  .compact .btn-label { position: static; width: auto; height: auto; overflow: visible; clip-path: none; }
  .compact .shell-btn { width: auto; padding: 0 10px; }
}
@media (max-width: 1100px) {
  .btn-label, .server-connect small { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .shell-btn { width: 34px; padding: 0; }
}
@media (max-width: 640px) {
  .server-label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .server-connect { width: 34px; padding: 0; justify-content: center; }
  .shell-sep { display: none; }
}
</style>
