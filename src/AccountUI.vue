<script setup lang="ts">
import {ref, watch, onBeforeUnmount, nextTick} from 'vue';
import {useTimeoutFn} from '@vueuse/core';
import {Dialog, DialogContent, DialogTitle, DialogDescription} from './components/ui/dialog';
import {errorMessage} from './lib/errors.ts';
import {getShip} from './ship-catalog.ts';
import AppIcon from './components/AppIcon.vue';
import {Button} from './components/ui/button';
import {Input} from './components/ui/input';

import type {AccountState, MatchRecord} from '../shared/network.ts';

import type {AccountClient} from './account-client.ts';

const noticeTimeout=useTimeoutFn(()=>clearNotice(),5000,{immediate:false});
const props=withDefaults(defineProps<{client:AccountClient;state:AccountState;locked:boolean;compact?:boolean}>(),{});
const emit=defineEmits(['modal']);
const view=ref<'login'|'register'|'records'|null>(null);
const username=ref('');
const password=ref('');
const confirmPassword=ref('');
const reveal=ref(false);
const pending=ref(false);
const error=ref('');
const notice=ref('');
const items=ref<MatchRecord[]>([]);
const nextCursor=ref<string|null>(null);
const cursors=ref<(string|null)[]>([null]);
const page=ref(0);
const requestedPage=ref(0);
const listPending=ref(false);
const listError=ref('');
const details=ref<Record<string,{loading?:boolean;data?:MatchRecord;error?:string}>>({});
const expanded=ref<string|null>(null);
const damageExpanded=ref<Record<string,Record<string,boolean>>>({});
const requestRevision=ref(0);
function focusUsername(event:Event){if(view.value!=='records'){event.preventDefault();nextTick(()=>document.querySelector<HTMLInputElement>('.account-dialog [name=username]')?.focus());}}
function clearNotice(){ noticeTimeout.stop(); notice.value = ''; }
function showNotice(message:string){
      clearNotice(); notice.value = message;
      noticeTimeout.start();
    }
async function open(nextView:'login'|'register'|'records'){
      if (!props.state.enabled) return;
      if (nextView !== 'records' && props.locked) { showNotice('请先退出联机房间、匹配队列或对局，再切换账号'); return; }
      
      clearNotice(); view.value = nextView; error.value = ''; password.value = ''; confirmPassword.value = ''; reveal.value = false;
      emit('modal', true);
  
      if (nextView === 'records') { cursors.value = [null]; page.value = 0; details.value = {}; await loadPage(0); }
    }
function close(force = false){
      if (pending.value && force !== true) return;
      view.value = null; password.value = ''; confirmPassword.value = ''; error.value = '';
      items.value = []; details.value = {}; expanded.value = null; damageExpanded.value = {}; requestRevision.value++;
      emit('modal', false);
    }
async function switchForm(){
      view.value = view.value === 'login' ? 'register' : 'login';
      error.value = ''; password.value = ''; confirmPassword.value = ''; reveal.value = false;
      
    }
async function submit(){
      if (pending.value) return;
      error.value = '';
      if (props.locked) { error.value = '请先退出当前联机流程，再切换账号'; return; }
      if (!username.value.trim() || password.value.length === 0) { error.value = '请输入用户名和密码'; return; }
      if (view.value === 'register' && password.value !== confirmPassword.value) { error.value = '两次密码输入不一致'; return; }
      pending.value = true;
      try {
        const values = {username:username.value, password:password.value};
        if (view.value === 'register') await props.client.register({...values, confirmPassword:confirmPassword.value});
        else await props.client.login(values);
        close(true);
      } catch (cause) { error.value = errorMessage(cause); }
      finally { pending.value = false; }
    }
async function logout(){
      if (props.locked) { showNotice('请先退出联机房间、匹配队列或对局，再退出登录'); return; }
      pending.value = true; clearNotice();
      try { await props.client.logout(); } catch (error) { showNotice(errorMessage(error)); }
      finally { pending.value = false; }
    }
async function loadPage(nextPage:number){
      const revision = ++requestRevision.value;
      requestedPage.value = nextPage;
      listPending.value = true; listError.value = ''; expanded.value = null;
      try {
        const result = await props.client.matches(cursors.value[nextPage]);
        if (revision !== requestRevision.value || view.value !== 'records') return;
        items.value = result.items; nextCursor.value = result.nextCursor; page.value = nextPage;
        if (result.nextCursor) cursors.value[nextPage + 1] = result.nextCursor;
      } catch (error) { if (revision === requestRevision.value) listError.value = errorMessage(error); }
      finally { if (revision === requestRevision.value) listPending.value = false; }
    }
async function expand(id:string){
      if (expanded.value === id && !details.value[id]?.error) { expanded.value = null; return; }
      expanded.value = id;
      if (details.value[id]?.data) return;
      const revision = requestRevision.value;
      details.value[id] = {loading:true};
      try {
        const data = await props.client.match(id);
        if (revision === requestRevision.value) details.value[id] = {data};
      } catch (error) { if (revision === requestRevision.value) details.value[id] = {error:errorMessage(error)}; }
    }
function result(match:MatchRecord){ return match.winner === 'draw' ? '平局' : match.winner == null ? '已中止' : match.winner === match.myTeam ? '胜利' : '失败'; }
function modeLabel(mode:string){ return ({random:'随机 PvP', friend:'好友房', ai:'在线 AI'} as Record<string,string>)[mode] || '联机对局'; }
function stageLabel(stage:string){ return ({draft:'选禁', deploy:'部署', plan:'作战', resolving:'结算', playback:'战斗', ended:'结束'} as Record<string,string>)[stage] || stage; }
function date(value:number){ return new Date(value).toLocaleString('zh-CN', {hour12:false}); }
function duration(value:number){ const seconds = Math.max(0, Math.floor((value || 0) / 1000)); return `${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`; }
function fleet(roster:string[]){ return roster?.length ? roster.map(id=>getShip(id)?.name || id).join('、') : '未选择舰船'; }
function number(value:number|undefined){ return Number(value || 0).toLocaleString('zh-CN', {maximumFractionDigits:1}); }
function toggleDamage(matchId:string,shipId:string){
      damageExpanded.value[matchId] ||= {};
      damageExpanded.value[matchId][shipId] = !damageExpanded.value[matchId][shipId];
    }
function damageSources(ship:import('../shared/network.ts').RecordShip){
      const labels = {main:'主炮', secondary:'副炮', torpedo:'鱼雷', air:'航空攻击', collision:'碰撞', environment:'环境', grounding:'搁浅', status:'状态伤害'};
      return Object.entries(labels).flatMap(([key, label]) => {
        const damage = ship.damageBySource?.[key];
        return damage && [damage.dealt, damage.friendly, damage.taken].some(value => value > 0) ? [{label, ...damage}] : [];
      });
    }
watch(()=>props.state.user,(user,previous)=>{ if (user?.id !== previous?.id) close(true); });
watch(()=>props.state.enabled,(enabled)=>{ if (!enabled) close(true); });
watch(()=>props.locked,(locked)=>{ if (!locked) clearNotice(); });
onBeforeUnmount(()=>{ clearNotice(); });
</script>
<template>
<div class="account-actions" :class="{compact}" aria-label="账号">
    <template v-if="state.user"><span class="account-name" :title="state.user.username">{{state.user.username}}</span><Button variant="outline" class="quiet" aria-label="我的战绩" title="我的战绩" @click="open('records')"><AppIcon name="book"/><span class="account-action-label">我的战绩</span></Button><Button variant="outline" class="quiet" aria-label="退出登录" title="退出登录" :disabled="pending" :aria-disabled="locked?'true':null" @click="logout"><AppIcon name="logout"/><span class="account-action-label">退出登录</span></Button></template>
    <template v-else><Button variant="outline" class="quiet" aria-label="登录" title="登录" :disabled="!state.enabled" :aria-disabled="locked?'true':null" @click="open('login')"><AppIcon name="user"/><span class="account-action-label">登录</span></Button><Button variant="outline" class="quiet account-register" :disabled="!state.enabled" :aria-disabled="locked?'true':null" @click="open('register')"><AppIcon name="user"/> 注册</Button><span v-if="!state.enabled" class="account-unavailable">暂未开放</span></template>
    <div v-if="notice" class="account-notice" role="status"><span>{{notice}}</span><Button variant="outline" type="button" class="quiet" @click="clearNotice"><AppIcon name="close"/> 关闭提示</Button></div>
    <Dialog :open="!!view" @update:open="open=>{if(!open)close();}">
      <DialogContent v-if="view" class="account-dialog" @open-auto-focus="focusUsername" :class="{'account-records':view==='records'}" :show-close-button="false" @escape-key-down="event=>{if(pending)event.preventDefault();}" @interact-outside="event=>{if(pending)event.preventDefault();}">
        <div class="account-heading"><div><span class="account-eyebrow">指挥官档案</span><DialogTitle>{{view==='records'?'我的战绩':view==='register'?'注册账号':'登录账号'}}</DialogTitle><DialogDescription class="sr-only">账号登录、注册及个人对战记录</DialogDescription></div><Button variant="outline"  type="button" class="quiet" :disabled="pending" aria-label="关闭账号窗口" @click="close()"><AppIcon name="close"/> 关闭</Button></div>
        <template v-if="view!=='records'">
          <p class="account-intro">{{view==='register'?'创建账号，记录联机对局与舰队表现。':'欢迎归航，继续你的舰队记录。'}}所有游戏模式均可使用访客游玩。</p>
          <form @submit.prevent="submit" novalidate>
            <label>用户名<Input  name="username" v-model="username" maxlength="20" autocomplete="username" :disabled="pending" required /></label>
            <label>密码<div class="account-password"><Input name="password" v-model="password" :type="reveal?'text':'password'" :autocomplete="view==='register'?'new-password':'current-password'" :disabled="pending" required /><Button variant="outline" type="button" class="quiet" :disabled="pending" :aria-pressed="reveal" @click="reveal=!reveal"><AppIcon name="eye"/> {{reveal?'隐藏密码':'显示密码'}}</Button></div></label>
            <label v-if="view==='register'">确认密码<Input name="confirmPassword" v-model="confirmPassword" :type="reveal?'text':'password'" autocomplete="new-password" :disabled="pending" required /></label>
            <p v-if="view==='register'" class="account-hint">密码无格式要求，请牢记密码。本系统不提供密码找回。</p>
            <p v-if="error" class="account-error" role="alert">{{error}}</p>
            <Button variant="default" class="primary account-submit" type="submit" :disabled="pending"><AppIcon name="user"/> {{pending?'正在提交…':view==='register'?'创建账号':'登录'}}</Button>
            <Button variant="outline" type="button" class="quiet account-switch" :disabled="pending" @click="switchForm"><AppIcon name="user"/> {{view==='register'?'已有账号？前往登录':'还没有账号？前往注册'}}</Button>
          </form>
        </template>
        <template v-else>
          <p class="account-intro">仅记录登录后参与的随机 PvP、好友房和在线 AI 对局。</p>
          <p v-if="listPending" role="status" class="account-empty">正在读取战绩…</p>
          <div v-else-if="listError" class="account-empty"><p class="account-error" role="alert">{{listError}}</p><Button variant="outline" @click="loadPage(requestedPage)"><AppIcon name="next"/> 重试</Button></div>
          <template v-else><p v-if="!items.length" class="account-empty">暂无战绩，下一次出航从这里开始。</p>
            <article v-for="match in items" :key="match.id" class="account-match">
              <div class="account-match-top"><strong :class="{'account-win':result(match)==='胜利'}">{{result(match)}}</strong><span>{{modeLabel(match.mode)}}</span><time>{{date(match.endedAt)}}</time></div>
              <p class="account-opponents">{{match.participants.map(p=>p.nickname).join(' vs ')}}</p>
              <p class="account-match-meta">{{match.enteredBattle?match.rounds+' 回合':'未进入战斗'}} · {{duration(match.durationMs)}} · {{match.reason}}</p>
              <Button variant="outline" class="quiet" :aria-expanded="expanded===match.id" @click="expand(match.id)"><AppIcon name="book"/> {{expanded===match.id?'收起详情':'查看详情'}}</Button>
              <div v-if="expanded===match.id" class="account-match-detail">
                <p v-if="details[match.id]?.loading" role="status">正在读取详情…</p><template v-else-if="details[match.id]?.error"><p class="account-error" role="alert">{{details[match.id].error}}</p><Button variant="outline" @click="expand(match.id)"><AppIcon name="book"/> 重试详情</Button></template>
                <template v-else-if="details[match.id]?.data"><p class="account-match-meta">开始 {{date(match.createdAt)}} · 结束 {{date(match.endedAt)}} · 结束阶段：{{stageLabel(match.endStage)}}<span v-if="match.modelId"> · AI：{{match.modelId}}</span></p>
                  <section v-for="participant in details[match.id]?.data?.participants" :key="participant.team" class="account-team"><h3>{{participant.nickname}} <small>{{participant.team===match.myTeam?'我方':'对方'}}</small></h3><p class="account-fleet">编队：{{fleet(participant.roster)}}</p>
                    <p v-if="!match.enteredBattle" class="account-hint">未进入战斗，无出战舰船统计。</p>
                    <div v-else class="account-table-scroll" tabindex="0" :aria-label="participant.nickname+'逐舰统计'"><table class="account-stats"><caption>逐舰统计 · 有效伤害以实际扣除 HP 为准</caption><thead><tr><th>舰船</th><th>对敌伤害</th><th>友伤</th><th>承伤（敌／友／环境）</th><th>击沉</th><th>击落</th><th>状态 / HP</th></tr></thead><tbody><template v-for="ship in participant.ships" :key="ship.id"><tr><th>{{ship.name}}<small>{{ship.template}}</small><Button variant="outline" class="quiet account-damage-toggle" :aria-expanded="!!damageExpanded[match.id]?.[ship.id]" @click="toggleDamage(match.id,ship.id)"><AppIcon name="next"/> 伤害来源</Button></th><td>{{number(ship.damageDealt)}}</td><td>{{number(ship.friendlyDamage)}}</td><td>{{number(ship.damageTaken.enemy)}} / {{number(ship.damageTaken.friendly)}} / {{number(ship.damageTaken.environment)}}</td><td>{{ship.shipsSunk}}</td><td>{{ship.planesShotDown}}</td><td>{{ship.alive?'存活':'沉没'}} · {{number(ship.hp)}} / {{number(ship.maxHp)}}</td></tr><tr v-if="damageExpanded[match.id]?.[ship.id]"><td colspan="7"><div class="account-damage-breakdown"><p v-if="!damageSources(ship).length">暂无伤害</p><p v-for="source in damageSources(ship)" :key="source.label"><strong>{{source.label}}</strong><span>对敌 {{number(source.dealt)}}</span><span>友伤 {{number(source.friendly)}}</span><span>承伤 {{number(source.taken)}}</span></p></div></td></tr></template></tbody></table></div>
                  </section>
                </template>
              </div>
            </article>
          </template>
          <nav class="account-pagination" aria-label="战绩分页"><Button variant="outline" :disabled="listPending||page===0" @click="loadPage(page-1)"><AppIcon name="back"/> 上一页</Button><span>第 {{page+1}} 页 · 每页 20 条</span><Button variant="outline" :disabled="listPending||!nextCursor" @click="loadPage(page+1)"><AppIcon name="next"/> 下一页</Button></nav>
        </template>
      </DialogContent>
    </Dialog>
  </div>
</template>
