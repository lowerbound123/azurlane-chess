<script setup lang="ts">

import {abilityText} from './ship-descriptions.ts';
import {TEMPLATES} from './ship-definitions.ts';
import {ref, computed} from 'vue';
import {SHIPS, getShip, shipStats, fleetError} from './ship-catalog.ts';
import {currentDraftTurn, draftUnavailable, draftActionError} from './draft.ts';
import AppIcon from './components/AppIcon.vue';
import ProgressiveImage from './components/ProgressiveImage.vue';
import SpineThumbnail from './components/SpineThumbnail.vue';
import {useSpineThumbnails} from './composables/use-spine-thumbnails.ts';
import {Button} from './components/ui/button';
import {Input} from './components/ui/input';
import type {DraftState} from '../shared/draft.ts';

const props=withDefaults(defineProps<{selected?:string[];draft?:DraftState|null;team?:number;disabled?:boolean;seed?:number|string;completeLabel?:string}>(),{selected:()=>[],team:0,completeLabel:'完成编队 · 进入部署'});
const catalogShip=(id:string)=>getShip(id)??SHIPS[0];
const emit=defineEmits(['change', 'complete', 'seed', 'guess', 'action', 'confirm']);
const inspected=ref<string>(SHIPS[0].id);
const {sources:spineSources,errors:spineErrors}=useSpineThumbnails([...new Set(SHIPS.map(ship=>ship.template))]);
const catalog=computed(()=>{ return props.draft ? SHIPS.filter(s => props.draft!.pool.includes(s.id)) : SHIPS; });
const limits=computed(()=>{ return props.draft?.rules.fleetLimits || { front: 3, back: 2 }; });
const rulesText=computed(()=>{ return props.draft ? `${props.draft.rules.poolMode === 'shared' ? '共享' : '独立'}舰船池 · 禁用作用于${props.draft.rules.banTarget === 'opponent' ? '对方' : '己方'} · ${limits.value.front} 前排＋${limits.value.back} 后排 · 提交后不可撤回` : '选择 3 艘前排与 2 艘后排 · 每艘舰船拥有独立能力'; });
const groups=computed(()=>{ return [...new Set(catalog.value.map(s => s.template))].map(template => ({ template, name: TEMPLATES[template].name, ships: catalog.value.filter(s => s.template === template) })); });
const entry=computed(()=>{ return getShip(inspected.value)??SHIPS[0]; });
const stats=computed(()=>{ return shipStats(inspected.value); });
const turn=computed(()=>{ return props.draft ? currentDraftTurn(props.draft) : null; });
const ownFleet=computed(()=>{ return props.draft ? props.draft.picks[props.team] : props.selected; });
const enemyFleet=computed(()=>{ return props.draft?.picks[1 - props.team] || []; });
const targetTeam=computed(()=>{ return turn.value?.targetTeam ?? props.team; });
const unavailable=computed(()=>{ return props.draft ? draftUnavailable(props.draft, targetTeam.value) : new Set(props.selected); });
const ourTurn=computed(()=>{ return turn.value?.team === props.team; });
const frontCount=computed(()=>{ return ownFleet.value.filter(id => shipStats(id).role === 'front').length; });
const addReason=computed(()=>{
      if (props.disabled) return '等待连接或操作确认';
      if (props.draft && !ourTurn.value) return props.draft.status === 'complete' ? '选禁已完成' : '等待对方操作';
      if (props.draft) return draftActionError(props.draft, props.team, inspected.value)?.message || '';
      if (unavailable.value.has(inspected.value)) return '该舰船已被选择或禁用';
      if (!props.draft && ownFleet.value.filter(id => shipStats(id).role === stats.value.role).length >= (stats.value.role === 'front' ? 3 : 2)) return stats.value.role === 'front' ? '前排已满，请先移除一艘' : '后排已满，请先移除一艘';
      return '';
    });
const completeReason=computed(()=>{
      if (props.disabled) return '等待连接或操作确认';
      if (!props.draft) return fleetError(props.selected);
      if (props.draft.status !== 'complete') return '等待选禁流程完成';
      return props.draft.ready[props.team] ? '已确认，等待对方完成编队' : '';
    });
const turnText=computed(()=>{
      if (!props.draft) return `前排 ${frontCount.value} / 3 · 后排 ${ownFleet.value.length - frontCount.value} / 2`;
      if (props.draft.status === 'guess') return props.team === 0 ? '请选择硬币正反面猜先' : '等待对方猜先';
      if (!turn.value) return '选禁完成 · 双方确认后进入部署';
      return `${ourTurn.value ? '轮到你' : '等待对方'} · ${turn.value.action === 'ban' ? (props.draft.rules.banTarget === 'opponent' ? '禁用对方' : '禁用己方') : '选择己方'} ${turn.value.remaining} 艘`;
    });
const ownBans=computed(()=>{ return props.draft?.bans[props.team] || []; });
const enemyBans=computed(()=>{ return props.draft?.bans[1 - props.team] || []; });
const expectedOwn=computed(()=>{ return expected(props.team); });
const expectedEnemy=computed(()=>{ return expected(1 - props.team); });
const actions=computed(()=>{ return props.draft?.rules.steps.map((s, i) => ({ ...s, index: i, text: `${s.actor === 'first' ? '先' : '后'}${s.action === 'pick' ? '选' : '禁'}${s.count}` })) || []; });
function composition(ids:string[]){ const front = ids.filter(id => shipStats(id).role === 'front').length; return `前排 ${front}/${limits.value.front} · 后排 ${ids.length-front}/${limits.value.back}`; }
function actionReason(id:string){ return props.draft && ourTurn.value ? draftActionError(props.draft, props.team, id)?.message || '' : ''; }
function expected(team:number){ if (!props.draft || props.draft.firstTeam === null) return limits.value.front + limits.value.back; return props.draft!.rules.steps.filter(s => s.action === 'pick' && (s.actor === 'first' ? props.draft!.firstTeam! : 1 - props.draft!.firstTeam!) === team).reduce((n, s) => n + s.count, 0); }
function status(id:string){
      if (!props.draft) return props.selected.includes(id) ? '已编入' : '待命';
      if (props.draft.bans[targetTeam.value].includes(id)) return '已禁用';
      if (props.draft.picks[targetTeam.value].includes(id)) return '已选择';
      return actionReason(id) ? '阵容限制' : '可选';
    }
function add(){ if (addReason.value) return; if (props.draft) emit('action', { shipId: inspected.value, revision: props.draft.revision }); else emit('change', [...props.selected, inspected.value]); }
function remove(id:string){ if (!props.draft && !props.disabled) emit('change', props.selected.filter(value => value !== id)); }
function complete(){ if (completeReason.value) return; if (props.draft) emit('confirm', { revision: props.draft.revision }); else emit('complete'); }
</script>
<template>
<section class="fleet-workbench" :class="{'is-pvp':!!draft}" aria-label="舰船编队选择">
    <header class="selection-header"><div><p class="eyebrow">FLEET ASSEMBLY / {{draft ? 'PVP DRAFT' : 'VS AI'}}</p><h1>{{draft ? '对战选船' : '出击编队'}}</h1><p>{{rulesText}}</p></div><span class="flag">{{draft ? '玩家对战' : '对手：战术 AI'}}</span></header>
    <div v-if="draft" class="draft-progress"><div class="draft-status" role="status"><strong>{{turnText}}</strong><span v-if="draft.coin">硬币：{{draft.coin.face===0?'正面':'反面'}} · 你是{{draft.firstTeam===team?'先手':'后手'}}</span></div><ol aria-label="选禁顺序"><li v-for="step in actions" :key="step.index" :class="{current:draft.status==='draft'&&step.index===draft.stepIndex,done:step.index<draft.stepIndex}">{{step.text}}</li></ol></div>
    <div class="selection-layout">
      <aside class="ship-library" aria-label="舰船列表"><div class="library-heading"><h2>舰船档案</h2><span>{{catalog.length}} 艘</span></div><p v-if="draft" class="library-target">{{turn?.action==='ban' ? ('当前禁用对象：'+(targetTeam===team?'我方':'对方')+'舰船池') : '浏览舰船，查看详细信息'}}</p>
        <section v-for="group in groups" :key="group.template" class="ship-class"><header><h3>{{group.name}}</h3><span>{{['dd','cl','ca'].includes(group.template)?'前排':'后排'}} · {{group.ships.length}} 艘</span></header><div class="ship-class-cards"><Button variant="outline" v-for="item in group.ships" :key="item.id" :data-ship-id="item.id" :aria-label="'查看'+item.name" :aria-pressed="inspected===item.id" :title="actionReason(item.id)" :class="['ship-card',{inspected:inspected===item.id,unavailable:unavailable.has(item.id)||!!actionReason(item.id)}]" @click="inspected=item.id"><span class="ship-avatar"><SpineThumbnail :template="item.template" :name="item.name" :src="spineSources[item.template]" :error="spineErrors[item.template]"/></span><strong>{{item.name}}</strong><small>{{status(item.id)}}</small></Button></div></section>
      </aside>
      <div class="selection-main"><div class="fleet-previews" :class="{paired:!!draft}">
        <section class="fleet-preview" aria-label="我方已选舰船"><header><h2>我方编队</h2><span>{{ownFleet.length}} / {{expectedOwn}}</span></header><div class="preview-cards"><article v-for="id in ownFleet" :key="id" class="preview-ship" :data-selected-ship="id"><Button variant="outline" class="preview-inspect" :aria-label="'查看已选'+catalogShip(id).name" @click="inspected=id"><span class="preview-avatar"><SpineThumbnail :template="catalogShip(id).template" :name="catalogShip(id).name" :src="spineSources[catalogShip(id).template]" :error="spineErrors[catalogShip(id).template]"/></span><strong>{{catalogShip(id).name}}</strong></Button><Button variant="outline" v-if="!draft" class="remove-ship" :aria-label="'移除'+catalogShip(id).name" :disabled="disabled" @click="remove(id)"><AppIcon name="close"/></Button><span v-else class="locked-ship" aria-label="已锁定">◆</span></article><span v-for="i in Math.max(0,expectedOwn-ownFleet.length)" :key="'empty'+i" class="preview-empty">＋</span></div><p class="fleet-composition">{{composition(ownFleet)}}</p><p v-if="draft" class="banned-ships">我方被禁：{{ownBans.map(id=>catalogShip(id).name).join('、')||'暂无'}}</p></section>
        <section v-if="draft" class="fleet-preview opponent-preview" aria-label="对方已选舰船"><header><h2>对方编队</h2><span>{{enemyFleet.length}} / {{expectedEnemy}}</span></header><div class="preview-cards"><article v-for="id in enemyFleet" :key="id" class="preview-ship"><Button variant="outline" class="preview-inspect" :aria-label="'查看对方'+catalogShip(id).name" @click="inspected=id"><span class="preview-avatar"><SpineThumbnail :template="catalogShip(id).template" :name="catalogShip(id).name" :src="spineSources[catalogShip(id).template]" :error="spineErrors[catalogShip(id).template]"/></span><strong>{{catalogShip(id).name}}</strong></Button><span class="locked-ship" aria-label="已锁定">◆</span></article><span v-for="i in Math.max(0,expectedEnemy-enemyFleet.length)" :key="'enemy-empty'+i" class="preview-empty">＋</span></div><p class="fleet-composition">{{composition(enemyFleet)}}</p><p class="banned-ships">对方被禁：{{enemyBans.map(id=>catalogShip(id).name).join('、')||'暂无'}}</p></section>
      </div>
      <section class="ship-detail" aria-label="舰船详细信息"><div class="ship-facts"><p class="eyebrow">{{entry.template.toUpperCase()}} / SHIP PROFILE</p><h2>{{entry.name}}</h2><span class="class-tag">{{TEMPLATES[entry.template].name}} · {{stats.role==='front'?'前排':'后排'}}</span><dl class="ship-vitals"><div><dt>耐久</dt><dd>{{stats.hp}} <small>HP</small></dd></div><div><dt>航速</dt><dd>{{stats.speed}} <small>格 / 回合</small></dd></div><div><dt>视野</dt><dd>{{stats.vision}} <small>格</small></dd></div><div><dt>碰撞伤害</dt><dd>{{stats.collision}}</dd></div></dl><p v-for="text in abilityText(stats)" :key="text">{{text}}</p><dl class="ship-armament"><div v-if="stats.secondary"><dt>副炮</dt><dd>{{stats.secondary.damage}} 伤害 / {{stats.secondary.range}} 格{{stats.secondary.multi?' · 多目标':''}}</dd></div><div v-if="stats.torpedo"><dt>鱼雷</dt><dd>{{stats.torpedo.reserve}} 枚 · 齐射 {{stats.torpedo.max}} 枚<br>{{stats.torpedo.damage}} 伤害 · 航速 {{stats.torpedo.speed}} 格<br>持续 {{stats.torpedo.life}} 回合</dd></div><div v-if="stats.main"><dt>主炮</dt><dd>{{stats.main.shots}} 发 × {{stats.main.damage}} 伤害<br>射程 {{stats.main.range}} 格 · 装填 {{stats.main.reload}} 回合</dd></div><div v-if="stats.aa"><dt>防空</dt><dd>{{stats.aa.damage}} 伤害 / {{stats.aa.range}} 格</dd></div><div v-if="stats.carrier"><dt>舰载机</dt><dd>{{stats.carrier.stock}} 架 · 每回合放飞 {{stats.carrier.launch}} 架<br>{{stats.carrier.plane.hp}} HP · {{stats.carrier.plane.damage}} 伤害<br>航速 {{stats.carrier.plane.speed}} 格 · 航程 {{stats.carrier.plane.range}} 格<br>视野 {{stats.carrier.plane.vision}} 格 · 整备 {{stats.carrier.rearm}} 回合<br>整备回复 {{stats.carrier.heal ?? 1}} HP</dd></div><div v-if="stats.guard"><dt>海域封锁</dt><dd>牺牲当回合全部移动力<br>周围六格敌舰禁止移动、进入后强制停止<br>自身鱼雷伤害减少 60% · 当回合生效</dd></div><div v-if="stats.contactSweep"><dt>特殊能力</dt><dd>接触排雷</dd></div></dl></div><figure class="ship-portrait"><ProgressiveImage :path="entry.portrait" :alt="entry.name+' · 带 AI 水印的默认人物立绘'"/><figcaption>AI 生成 · 默认立绘</figcaption></figure></section>
      <footer class="selection-actions"><div class="selection-hint" role="status"><strong>{{turnText}}</strong><small v-if="addReason" class="action-reason">{{addReason}}</small><small>{{draft ? (completeReason || '确认后等待双方进入部署') : (completeReason || '编队已就绪，可进入部署')}}</small></div><label v-if="!draft&&seed!==undefined" class="selection-seed">地图种子<Input type="number" :value="seed" aria-label="地图种子" @input="$emit('seed',$event.target.value)" /></label><div v-if="draft?.status==='guess'" class="action-buttons"><Button variant="outline" :disabled="disabled||team!==0" @click="$emit('guess',{guess:0,revision:draft.revision})"><AppIcon name="check"/> 猜正面</Button><Button variant="outline" :disabled="disabled||team!==0" @click="$emit('guess',{guess:1,revision:draft.revision})"><AppIcon name="check"/> 猜反面</Button></div><div v-else class="action-buttons"><Button variant="outline" class="add-ship" :class="{ban:turn?.action==='ban'}" :disabled="!!addReason" :title="addReason" @click="add"><AppIcon name="check"/> {{turn?.action==='ban'?'确认禁用该舰船':'确认添加该舰船'}}</Button><Button variant="default" class="primary complete-fleet" :disabled="!!completeReason" :title="completeReason" @click="complete"><AppIcon name="ship"/> {{draft ? (draft.ready[team]?'已完成编队':'完成编队') : completeLabel}}</Button></div></footer>
      </div>
    </div>
  </section>
</template>
<style scoped>
/* Explicit layout wins over generic Button height/inline-flex utilities. */
.fleet-workbench .ship-card{display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:68px auto auto;height:auto;min-height:110px;padding:6px;gap:4px;white-space:normal;text-align:center}
.fleet-workbench .ship-avatar{width:100%;height:68px;margin:0;background:none;aspect-ratio:auto}
.fleet-workbench .ship-card strong,.fleet-workbench .ship-card small{margin:0;line-height:1.3}
.fleet-workbench .preview-cards{align-items:start;flex-wrap:wrap}
.fleet-workbench .preview-ship,.fleet-workbench .preview-empty{flex:0 1 84px;height:132px}
.fleet-workbench .preview-ship{display:grid;grid-template-rows:minmax(0,1fr) 26px;overflow:hidden}
.fleet-workbench .preview-inspect{display:flex;flex-direction:column;width:100%;height:100%;min-height:0;padding:4px;gap:2px}
.fleet-workbench .preview-avatar{width:100%;height:76px;flex-shrink:0}
.fleet-workbench .preview-inspect strong{width:100%;padding:0;line-height:1.4;text-align:center}
.fleet-workbench .remove-ship{position:static;width:100%;height:26px;min-width:0;min-height:0;margin:0;border:0;border-top:1px solid var(--line-2);border-radius:0;padding:0;background:var(--ink-1)}
.fleet-workbench .locked-ship{position:static;display:grid;place-items:center;border-top:1px solid var(--line-2)}
@media(max-width:700px){
  .fleet-workbench .ship-card{grid-template-columns:44px minmax(0,1fr);grid-template-rows:1fr 1fr;min-height:72px;padding:4px;gap:2px 4px;text-align:left}
  .fleet-workbench .ship-avatar{grid-row:1/3;width:44px;height:62px}
  .fleet-workbench .ship-card strong{align-self:end;font-size:10px}
  .fleet-workbench .ship-card small{align-self:start}
  .fleet-workbench .preview-ship,.fleet-workbench .preview-empty{height:112px;flex-basis:64px}
  .fleet-workbench .preview-avatar{height:59px}
  .fleet-workbench .paired .preview-ship,.fleet-workbench .paired .preview-empty{flex-basis:calc(33.333% - 4px)}
}
</style>
