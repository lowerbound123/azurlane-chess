<script setup lang="ts">
import {historicalSettlementShips} from '../history/settlement.ts';
import HistoricalMission from '../components/HistoricalMission.vue';
import {effectiveSpeed,effectiveVision} from '../../shared/status.ts';
import DominationPanel from '../components/DominationPanel.vue';
import CampaignCoach from '../components/CampaignCoach.vue';
import TutorialCoach from '../components/TutorialCoach.vue';
import {AIR_ROLE_LABELS,planeForSlot} from '../ship-definitions.ts';
import {abilityNotes} from '../ship-descriptions.ts';
import {computed, ref,watch} from 'vue';
import {Progress} from '../components/ui/progress';
import {AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription} from '../components/ui/alert-dialog';

import ChoiceSelect from '../components/ChoiceSelect.vue';
import {defineAsyncComponent} from 'vue';
import {useAppSession} from '../session-context.ts';
import AppIcon from '../components/AppIcon.vue';
import ShipClassIcon from '../components/ShipClassIcon.vue';
import ShellActions from '../components/shell/ShellActions.vue';
import ConnectionGate from '../components/shell/ConnectionGate.vue';
import {Button} from '../components/ui/button';

const BattleMap3D=defineAsyncComponent(()=>import('../BattleMap3D.vue').then(module=>module.default));
const BattleSettlement=defineAsyncComponent(()=>import('../components/BattleSettlement.vue').then(module=>module.default));
const {historical,historicalDefinition,historicalControlled,historicalMenu,campaign,overviewCampaign,campaignTransit,campaignAllowed,campaignStep,nextCampaign,retryCampaign,connectionStatusLabel, aiMode, onlineState, onlineStatus, onlineError, onlinePending, onlineActive, onlineClock, onlineLocked, myTeam, openOnline, onlineCommand, mapExit, displayDomination, mapModel, mapHex, mapShip, mapNode, mapHover, cameraRotate, routeConflicts, lastMovement, mapView, mapZoom, ordersOpen, rangeToolsOpen, portraitHint, swapMode, locateShip, finished, tutorial, lesson, isControl, rangeChanged, toggleRanges, chooseTurn, showPlans, showRanges, rangeMode, replan, ranges, canUndo, canRedo, hoverHint, rangeHint, airborne, undoWaypoint, removeWaypoint, clearMovement, startReplan, historyChange, removeOrder, E, screen, seed, game, selected, mode, pendingTurn, torpWindow, planeMode, airRole, busy, playSpeed, progress, showLog, hover, point, role, ship, plan, nodes, own, ourHP, ourCount, visibleEnemies, phase, readyAircraft, safeLogs, coord, choose, toggleSmoke,toggleEscort,toggleMineStep,selectAirRole,toggleGuard, addMove, undo, setMode, begin, execute, complete, resetPlan, directionNames, mainCounts}=useAppSession();
const resignOpen=ref(false);
const settlementOpen=ref(false);
const settlementShips=computed(()=>historicalSettlementShips(game.value?.ships??[],historical.value,historicalDefinition.value));
const settlementAvailable=computed(()=>screen.value==='battle'&&!!game.value&&phase.value==='ended'&&!busy.value&&!tutorial.value);
watch([settlementAvailable,()=>game.value?.seed,()=>game.value?.round],([ended])=>{settlementOpen.value=ended;},{immediate:true});
const isCampaignFocus=(topic:string)=>!!(campaign.value?.status==='playing'&&!campaignTransit.value&&ship.value?.catalogId&&campaignStep.value?.emphasis[ship.value.catalogId]?.includes(topic));
const resign=async()=>{if(await onlineCommand('match.resign'))resignOpen.value=false;};
const aiThinking=computed(()=>{
  const match=onlineState.value?.match;
  return onlineActive.value&&onlineStatus.value==='connected'&&match?.kind==='ai'&&match.stage==='plan'&&match.submitted[match.myTeam]&&match.aiStatus==='thinking';
});
</script>
<template>
<BattleSettlement v-if="settlementOpen&&settlementAvailable&&game" :ships="settlementShips" :my-team="myTeam" :winner="game.winner" :scenario-id="historical?.scenarioId" @close="settlementOpen=false"/>
<Teleport to="body">
  <Transition name="ai-thinking">
    <div v-if="aiThinking" class="ai-thinking-card" role="status" aria-live="polite" aria-atomic="true">
      <p>{{onlineState?.match?.aiName || 'AI 对手'}}正在思考</p>
      <span class="ai-thinking-dots" aria-hidden="true"><i></i><i></i><i></i></span>
    </div>
  </Transition>
</Teleport>
<AlertDialog :open="resignOpen" @update:open="!onlinePending&&(resignOpen=$event)"><AlertDialogContent @escape-key-down="onlinePending&&$event.preventDefault()"><AlertDialogTitle>确认认输</AlertDialogTitle><AlertDialogDescription>认输将结束当前在线对局。</AlertDialogDescription><p v-if="onlineError" role="alert">{{onlineError}}</p><div class="flex justify-end gap-2"><Button variant="outline" :disabled="onlinePending" @click="resignOpen=false">取消</Button><Button variant="destructive" :disabled="onlinePending" @click="resign">{{onlinePending?'正在确认':'确认认输'}}</Button></div></AlertDialogContent></AlertDialog>
<div v-if="game&&(onlineActive||!$route.meta.online)" class="battle-page" :class="{'historical-battle':historical,'campaign-battle':campaign,'tutorial-battle':tutorial,'domination-battle':game.battleMode==='domination'}">
<div v-if="onlineActive&&onlineState?.match&&screen==='battle'" class="online-battle-status" role="status"><span>联机 · {{onlineStatus}} · 我方 {{myTeam+1}} 队 · {{onlineState.match.stage}}</span><span v-if="onlineState.match.deadline">剩余 {{Math.max(0,Math.ceil((onlineState.match.deadline-onlineClock)/1000))}} 秒</span><span v-if="onlineState.match.paused">对局暂停，等待重连</span><span v-for="d in onlineState.match.disconnects" :key="d.team">{{d.team===myTeam?'我方':'对方'}}断线 · 剩余 {{Math.ceil(d.remainingMs/1000)}} 秒</span><span v-if="onlineState.match.result">{{onlineState.match.result.reason}}</span><span v-if="onlineState.match.recordStatus" class="account-record-status">{{onlineState.match.recordStatus==='saved'?'战绩已保存':'战绩暂未保存'}}</span><span v-if="onlineState.match.aiName">对手：{{onlineState.match.aiName}}</span><span v-if="onlineState.match.kind==='ai'" class="ai-mode-status">AI 模式：{{onlineState.match.aiMode==='full'?'FULL':'普通'}}<span v-if="onlineState.match.aiMode==='full'"> · 历史：{{onlineState.match.aiHistoryRounds??0}} 回合</span></span><span v-if="onlineState.match.aiStatus">AI：{{onlineState.match.aiStatus}}</span><span v-if="onlineState.match.aiError">{{onlineState.match.aiError}}</span><span v-if="onlineError" role="alert">{{onlineError}}</span><Button variant="outline" v-if="onlineState.match.aiStatus==='error'" :disabled="onlinePending" @click="onlineCommand('ai.retry')"><AppIcon name="next"/> 重试 AI</Button><Button variant="outline" v-if="onlineState.match.submitted?.[myTeam]&&phase==='plan'" :disabled="onlinePending" @click="onlineCommand('orders.withdraw')"><AppIcon name="next"/> 撤回命令</Button><span v-if="onlineState.match.submitted?.[myTeam]">已提交，等待对方</span><Button variant="outline" v-if="phase!=='ended'" :disabled="onlinePending" @click="resignOpen=true"><AppIcon name="flag"/> 认输</Button><Button variant="outline" v-else :disabled="onlinePending" @click="onlineCommand('match.leave')"><AppIcon name="back"/> 返回大厅</Button></div>
<main v-if="screen==='battle'" class="battle-screen">
<div v-if="portraitHint" class="portrait-hint"><span>横屏海图更宽，竖屏也可完整操作</span><Button variant="outline" aria-label="关闭横屏提示" @click="portraitHint=false"><AppIcon name="close"/> 关闭</Button></div>
 <HistoricalMission v-if="historical"/>
 <section class="battle-strip">
<div class="round">
<small>ROUND</small>
<strong>{{String(historical&&historical.status!=='playing'?historical.lastResolvedRound:game.round).padStart(2,'0')}}<span v-if="historicalDefinition">/ {{historicalDefinition.roundLimit}}</span><span v-else-if="!campaign||campaign.chapter===9">/ 30</span>
</strong>
</div>
<div class="phase-heading">
<h1>{{campaignTransit?'自动航行':phase==='deploy'?'舰队部署':phase==='execute'?'同步执行中':phase==='ended'?(game.winner==='draw'?'战局结束 · 平局':game.winner===myTeam?'战局结束 · 胜利':'战局结束 · 败北'):'战术规划'}}</h1>
</div>
<div class="fleet-metric">
<b>{{ourCount}} 艘</b>
<small>我方 / {{ourHP}} HP</small>
</div>
<div class="fleet-metric enemy">
<b>{{visibleEnemies}} 艘</b>
<small>当前可见敌舰</small>
</div>

<Button variant="outline" class="mobile-only orders-toggle" :aria-label="ordersOpen?'收起指令':'展开指令'" @click="ordersOpen=!ordersOpen" :aria-expanded="ordersOpen"><AppIcon name="next"/> 指令</Button>
<Button variant="outline" class="mobile-only" @click="showLog=!showLog"><AppIcon name="book"/> 战报</Button>
<ShellActions compact/>
<div class="execute-controls">
<Button v-if="settlementAvailable" variant="outline" @click="settlementOpen=true">查看结算</Button>
<template v-if="busy">
<ChoiceSelect v-model="playSpeed" label="执行速度" :items="[1,2,4].map(value=>({value,label:value+'× 速度'}))" />
<Button v-if="!campaignTransit" variant="outline" :disabled="!finished" @click="complete"><AppIcon name="skip"/> 跳过动画</Button>
</template>

<Button variant="default" v-else-if="phase==='deploy'" :disabled="onlineLocked" class="primary" @click="begin" :data-tutorial-highlight="isControl('begin')?'true':null"><AppIcon name="ship"/> 完成部署</Button>
<Button variant="default" v-else-if="campaign&&campaign.status==='failed'" @click="retryCampaign">重试检查点</Button>
<Button variant="default" v-else-if="campaign&&campaign.status!=='playing'" disabled>{{campaign.status==='complete'?'归航完成':'自动航行中'}}</Button>
<Button variant="default" v-else-if="historical&&phase==='ended'" @click="historicalMenu">选择其他历史战斗</Button>
<Button variant="default" v-else-if="phase==='ended'" class="primary" @click="onlineActive?onlineCommand('match.leave'):screen='fleet'"><AppIcon name="ship"/> 再战一局</Button>
<Button variant="default" v-else class="primary" :disabled="onlineLocked||campaignTransit" @click="execute" :data-tutorial-highlight="isControl('execute')?'true':null"><AppIcon name="play"/> 执行回合 <span class="key">Enter</span>
</Button>
</div>
</section>
 <DominationPanel v-if="displayDomination" :state="displayDomination" :my-team="myTeam" />
 <div class="battle-layout">
<nav class="mobile-fleet" aria-label="选择舰船">
<Button variant="outline" v-for="s in own" :key="s.id" :class="['mobile-ship',{active:selected===s.id,sunk:s.hp<=0}]" :disabled="s.hp<=0||busy" @click="choose(s)" :aria-pressed="selected===s.id"><AppIcon name="ship"/> {{s.label}}</Button>
</nav>
<aside class="fleet-sidebar">
<div class="panel-title">
<h2>我方舰队</h2>
<span>{{historical?'独立历史舰队':'1–5 选择'}}</span>
</div>
<Button variant="outline" v-for="s in own" :key="s.id" :class="['ship-row',{active:selected===s.id,sunk:s.hp<=0}]" :disabled="s.hp<=0||busy" :aria-pressed="selected===s.id" @click="choose(s)">
<span class="ship-row-title"><ShipClassIcon :type="s.template"/><b>{{s.label}}</b><span v-if="historical&&!historicalControlled(s.id)">AI</span><span v-if="s.hp<=0">已沉没</span></span>
<span class="ship-health">
<Progress class="fleet-health" :model-value="s.hp/s.cfg.hp*100" :aria-label="s.label+'血量'" />
<span class="health-value">{{s.hp}} / {{s.cfg.hp}}</span>
</span>
</Button>
<div class="legend">
<span>
<i class="legend-dot cyan">
</i> 我方</span>
<span>
<i class="legend-dot red">
</i> 敌方</span>
<span><AppIcon name="diamond"/> 水雷在已探索区显示</span>
<span>黑色：未探索 · 灰暗：已探索</span>
</div>
<Button variant="outline" class="log-toggle" @click="showLog=!showLog"><AppIcon name="book"/> {{showLog?'收起':'查看'}}战报 <span>{{safeLogs.length}}</span>
</Button>
<div v-if="showLog" class="battle-log">
<p v-if="!safeLogs.length">尚未交战</p>
<p v-for="(l,i) in safeLogs" :key="i">
<small>R{{l.round}}</small>{{l.text}}</p>
</div>
<div class="seed-caption">海图 #{{game.seed}}</div>
</aside>
 <section class="ocean-panel" :class="{'tools-open':rangeToolsOpen}">
<div class="map-overlays"><div class="camera-tools">
<Button variant="outline" aria-label="放大海图" @click="mapView?.zoomBy(1.25)" :disabled="mapZoom>=3"><AppIcon name="plus"/></Button>
<Button variant="outline" aria-label="缩小海图" @click="mapView?.zoomBy(.8)" :disabled="mapZoom<=1"><AppIcon name="minus"/></Button>
<Button variant="outline" @click="campaign?overviewCampaign():mapView?.reset()"><AppIcon name="expand"/> 全图</Button>
<Button variant="outline" @click="locateShip"><AppIcon name="target"/> 定位当前舰</Button>
<Button variant="outline" @click="mapView?.toggleRotate()" :class="{active:cameraRotate}" :aria-pressed="cameraRotate"><AppIcon name="redo"/> {{cameraRotate?'触屏旋转中':'触屏旋转'}}</Button>
<Button variant="outline" v-if="phase==='plan'" class="mobile-only" @click="rangeToolsOpen=!rangeToolsOpen" :aria-expanded="rangeToolsOpen"><AppIcon name="eye"/> 图层</Button>
<span class="camera-help">左键下令／拖动 · 中键平移 · Shift＋中键旋转 · 右键撤销</span>
</div>
<div class="map-caption">
<span>{{phase==='deploy'?'在蓝色区域点击部署；点舰船切换选择':phase==='plan'?'PC 点友舰切换 · Shift 点友舰所在格 · 面板切换武器':'所有舰船、飞机与鱼雷共用时间轴'}}</span>
<span>{{hover?coord(hover):`${game.map.width} × ${game.map.height}`}}</span>
</div>
<div v-if="phase==='plan'" class="map-tools">
<Button variant="outline" :class="{active:showRanges}" @click="toggleRanges" :data-tutorial-highlight="isControl('ranges')?'true':null"><AppIcon name="eye"/> {{showRanges?'隐藏范围':'显示范围'}}</Button>
<ChoiceSelect v-model="rangeMode" label="范围提示类型" :items="[{value:'auto',label:'当前操作'},{value:'reach',label:'可达位置'}]" @change="rangeChanged" />
<Button variant="outline" :class="{active:showPlans}" @click="showPlans=!showPlans"><AppIcon name="eye"/> {{showPlans?'隐藏全部计划':'显示全部计划'}}</Button>
<span>{{showRanges?rangeHint:'范围提示已隐藏'}}</span>
</div>
</div>
<BattleMap3D ref="mapView" :model="mapModel" @zoom="mapZoom=$event" @rotate="cameraRotate=$event"
 @undo="historyChange('undo')" @hex="mapHex" @ship="mapShip" @node="mapNode" @hover="mapHover" @home="mapExit" />
<div class="map-footer">
<span>
<i class="legend-dot cyan">
</i> 共享视野 {{ship?effectiveVision(ship,game!.round):5}} 格 · 岛屿遮挡视线</span>
<span class="hover-hint">{{hoverHint||'水雷需先探索 · 黑色未探索 · 灰暗记忆地形'}}</span>
</div>
<Progress v-if="busy" class="execution-progress" :model-value="progress*100" aria-label="回合进度" />
</section>
 <aside class="orders-sidebar" v-if="ship" :class="{collapsed:!ordersOpen}" aria-label="舰船指令">

<div class="selected-heading">
<div>

<h2>{{ship.label}}</h2>
</div>
<span class="heading-label">{{directionNames[ship.heading]}}</span>
</div>
<details v-if="phase==='plan'" class="mobile-range-tools"><summary>范围与计划图层</summary>
<Button variant="outline" :class="{active:showRanges}" @click="toggleRanges" :data-tutorial-highlight="isControl('ranges')?'true':null"><AppIcon name="eye"/> {{showRanges?'隐藏范围':'显示范围'}}</Button>
<ChoiceSelect v-model="rangeMode" label="范围提示类型" :items="[{value:'auto',label:'当前操作'},{value:'reach',label:'可达位置'}]" @change="rangeChanged" />
<Button variant="outline" :class="{active:showPlans}" @click="showPlans=!showPlans"><AppIcon name="eye"/> {{showPlans?'隐藏全部计划':'显示全部计划'}}</Button>
<span>{{showRanges?rangeHint:'范围提示已隐藏'}}</span>
</details>
<div class="selected-stats">
<span :data-campaign-focus="isCampaignFocus('hp')?'hp':null">
<component :is="isCampaignFocus('hp')?'strong':'span'"><b>{{ship.hp}}</b> HP</component></span>
<span :data-campaign-focus="isCampaignFocus('speed')?'speed':null">
<component :is="isCampaignFocus('speed')?'strong':'span'">移速 <b>{{effectiveSpeed(ship,game!.round)}}</b> 步</component></span>
<span :data-campaign-focus="isCampaignFocus('torpedo')?'torpedo':null">
<component :is="isCampaignFocus('torpedo')?'strong':'span'"><b>{{ship.torps}}</b> 鱼雷</component></span>
</div>
 <div v-if="phase==='deploy'" class="deployment-help">
<Button variant="outline" :class="{active:swapMode}" @click="swapMode=!swapMode"><AppIcon name="close"/> {{swapMode?'取消交换':'交换位置'}}</Button>
<p v-if="swapMode">已选 {{ship.label}}，点击另一艘友舰交换。</p>
<h3>{{campaign?'部署到本段南侧蓝色海域':myTeam===1?'部署到右上角':'部署到左下角'}}</h3>
<p>点击我方舰船，再点击蓝色部署格。点“交换位置”后点另一艘友舰，可交换位置</p>
<p>{{campaign?'3 艘前排＋2 艘后排；点击蓝色空格调整位置，准备好后开始规划。':myTeam===1?'初始舰首朝西，敌方在左下角朝东':'初始舰首朝东，敌方在右上角朝西'}}</p>
<Button variant="default" class="primary full" :disabled="onlineLocked" @click="begin" :data-tutorial-highlight="isControl('begin')?'true':null"><AppIcon name="ship"/> 完成部署</Button>
</div>
 <p v-else-if="historical&&!historicalControlled(ship.id)" class="tool-hint" data-history-readonly>友军自动指挥 · 可以查看舰艇与预览航线，使用上方航母组指令调整航行。</p>
 <template v-else-if="phase==='plan'&&ship.hp>0&&(!campaign||campaign.status==='playing')">
<div class="mode-buttons">
<Button variant="outline" :class="{active:mode==='move'}" @click="setMode('move')" :data-tutorial-highlight="isControl('move-mode')?'true':null"><AppIcon name="ship"/> 航线</Button>
<Button variant="outline" v-if="ship.cfg.torpedo&&campaignAllowed('torp')" :class="{active:mode==='torp'}" @click="setMode('torp')" :data-tutorial-highlight="isControl('torp-mode')?'true':null"><AppIcon name="bomb"/> 鱼雷 <small>T</small>
</Button>
<Button variant="outline" v-if="ship.cfg.main&&campaignAllowed('main')" :class="{active:mode==='main'}" :disabled="ship.mainReady>game.round" @click="setMode('main')" :data-tutorial-highlight="isControl('main-mode')?'true':null"><AppIcon name="target"/> 主炮 <small>G</small>
</Button>
<Button variant="outline" v-if="ship.cfg.carrier&&campaignAllowed('plane')" :class="{active:mode==='plane'}" @click="setMode('plane')" :data-tutorial-highlight="isControl('plane-mode')?'true':null"><AppIcon name="plane"/> 飞机 <small>F</small>
</Button>
<Button variant="outline" v-if="ship.cfg.secondary&&campaignAllowed('mine')" :class="{active:mode==='mine'}" @click="setMode('mine')" :data-tutorial-highlight="isControl('mine-mode')?'true':null"><AppIcon name="diamond"/> 排雷 <small>M</small>
</Button>
</div>
 <section class="order-tool" v-if="ship.cfg.smoke||ship.cfg.escort||ship.cfg.radar||ship.cfg.minelayer">
<Button v-if="ship.cfg.smoke&&campaignAllowed('smoke')" variant="outline" :aria-pressed="!!plan.smoke" :disabled="onlineLocked||(!plan.smoke&&!ship.smokeLeft)" @click="toggleSmoke" :data-tutorial-highlight="isControl('smoke')?'true':null">{{plan.smoke?'取消烟幕':'释放烟幕'}} · {{ship.smokeLeft}} 次</Button>
<Button v-if="ship.cfg.escort&&campaignAllowed('escort')" variant="outline" :aria-pressed="!!plan.escort" :disabled="onlineLocked" @click="toggleEscort" :data-tutorial-highlight="isControl('escort')?'true':null">{{plan.escort?'取消护航':'邻接护航'}} · 最多一步</Button>
<Button v-if="ship.cfg.radar&&campaignAllowed('radar')" variant="outline" :disabled="onlineLocked||!ship.radarLeft" @click="setMode('radar')" :data-tutorial-highlight="isControl('radar')?'true':null">雷达扫描 · {{ship.radarLeft}} 次</Button>
<template v-if="ship.cfg.minelayer&&campaignAllowed('minelayer')"><p>水雷库存 {{ship.minesLeft}} · 每轮至多 {{ship.cfg.minelayer.max}} 枚</p><Button v-for="(node,i) in nodes.slice(1)" :key="i" variant="outline" :disabled="onlineLocked||E.same(node.pos,nodes[i].pos)" :aria-pressed="plan.mineSteps?.includes(i+1)??false" @click="toggleMineStep(i+1)" :data-tutorial-highlight="isControl('minelayer')?'true':null">{{plan.mineSteps?.includes(i+1)?'取消':'选择'}}第 {{i+1}} 步布雷</Button><p class="tool-hint">完整前进后，在步骤起点布雷；下一回合武装。</p></template>
<p v-if="mode==='radar'" class="tool-hint">点击回合初位置 {{ship.cfg.radar?.range}} 格内的扫描中心；占用本轮副炮。</p>
</section>
 <section v-if="ship.cfg.guard&&campaignAllowed('guard')" class="guard-tool order-tool">
<Button variant="outline" :class="{active:plan.guard}" :aria-pressed="!!plan.guard" :disabled="onlineLocked" @click="toggleGuard" :data-tutorial-highlight="isControl('guard')?'true':null"><AppIcon name="shield"/> {{plan.guard?'取消海域封锁':'海域封锁'}}</Button>
<p class="tool-hint">牺牲本回合全部移动力。周围六格敌舰不能移动，进入范围后停止剩余航线；自身鱼雷伤害降低 60%。仅当回合生效，副炮和防空照常。</p>
</section>
 <section v-if="mode==='move'" class="order-tool">
<div class="tool-title">追加移动步骤 <span>{{plan.moves.length}} / {{effectiveSpeed(ship,game!.round)}}</span>
</div>
<div class="turn-buttons">
<Button variant="outline" :class="{active:pendingTurn===-1}" :disabled="!!plan.guard" @click="chooseTurn(-1)" :data-tutorial-highlight="isControl('turn-left')?'true':null"><AppIcon name="undo"/> 左转 60° <small>Q</small>
</Button>
<Button variant="outline" :class="{active:pendingTurn===0}" :disabled="!!plan.guard" @click="chooseTurn(0)" :data-tutorial-highlight="isControl('turn-straight')?'true':null"><AppIcon name="next"/> 直行 <small>Z</small>
</Button>
<Button variant="outline" :class="{active:pendingTurn===1}" :disabled="!!plan.guard" @click="chooseTurn(1)" :data-tutorial-highlight="isControl('turn-right')?'true':null"><AppIcon name="redo"/> 右转 60° <small>E</small>
</Button>
</div>
<div class="move-buttons">
<Button variant="outline" :disabled="!!plan.guard" @click="addMove(pendingTurn,true)" :data-tutorial-highlight="isControl('forward')?'true':null"><AppIcon name="next"/> 前进 <small>W</small>
</Button>
<Button variant="outline" :disabled="!!plan.guard" @click="addMove(pendingTurn,false)" :data-tutorial-highlight="isControl('wait')?'true':null"><AppIcon name="clock"/> {{pendingTurn?'原地转向':'原地等待'}} <small>Space</small>
</Button>
</div>
<p v-if="plan.guard" class="tool-hint">海域封锁已规划，移动力已全部投入技能。取消技能后可规划航线。</p>
<p v-else class="tool-hint">{{replan?'重新规划中：点击新航点':'左键点击可达格追加航段，右键撤销上次修改'}}。先选转向，再点前进或原地确认一步</p>
</section>
 <section v-if="mode==='torp'" class="order-tool">
<label>发射窗口 <ChoiceSelect v-model="torpWindow" label="发射窗口" :items="nodes.map((node,value)=>({value,label:String(value)}))" />
</label>
<p class="tool-hint">点击侧面四个方向之一；每窗口 {{ship.cfg.torpedo?.perWindow??1}} 枚，每回合至多 {{ship.cfg.torpedo?.max}} 枚。青蓝虚线为可选方向，琥珀实线为已规划发射</p>
</section>
 <section v-if="mode==='main'&&ship.cfg.main" class="order-tool">
<div class="tool-title">主炮落点 <span>{{plan.main.length}} / {{ship.cfg.main.shots}}</span>
</div>
<p class="tool-hint">点击 {{ship.cfg.main.range}} 格内任意位置，可重复点同一格。{{ship.cfg.main.blast?'中心 120、周围六格各 60':'每发 '+ship.cfg.main.damage+' 伤害'}}，回合末命中；{{ship.cfg.main.reload?'下一回合装填':'下一回合可再次开火'}}</p>
</section>
 <section v-if="mode==='plane'" class="order-tool">
<div v-if="ship.cfg.carrier?.slots" class="turn-buttons"><Button v-for="role in [...new Set(ship.cfg.carrier.slots.map(p=>p.role!))]" :key="role" variant="outline" :aria-pressed="airRole===role" @click="selectAirRole(role)" :data-tutorial-highlight="isControl(role)?'true':null">{{AIR_ROLE_LABELS[role]}}</Button></div>
<p v-if="ship.cfg.carrier?.slots" class="tool-hint">{{airRole==='fighter'?'选择巡逻点，停留一回合，自动拦截敌机':airRole==='scout'?'选择侦察终点，侦察机不投弹':'选择定点或可见敌舰'}}；优先使用所选机型中 HP 最高的就绪槽。</p>
<div class="turn-buttons">
<Button variant="outline" :class="{active:planeMode==='point'}" @click="planeMode='point'"><AppIcon name="ship"/> 定点航线</Button>
<Button v-if="airRole!=='fighter'&&airRole!=='scout'" variant="outline" :class="{active:planeMode==='target'}" @click="planeMode='target'"><AppIcon name="target"/> 指定敌舰</Button>
</div>
<p class="tool-hint">{{airRole==='fighter'?'点击巡逻点':airRole==='scout'?'点击侦察终点':planeMode==='point'?'点击终点，遇敌舰投弹':'点击可见敌舰，追踪并轰炸该目标'}}。每回合最多 {{ship.cfg.carrier?.launch}} 批</p>
</section>
 <section v-if="mode==='mine'" class="order-tool">
<p class="tool-hint">点击副炮 {{ship.cfg.secondary?.range}} 格内可直视的水雷，回合开始移除。本回合全部副炮机会取消，主炮不受影响</p>
</section>
 <section class="route-edit-tools">
<div class="edit-buttons">
<Button variant="outline" @click="historyChange('undo')" :disabled="!canUndo"><AppIcon name="undo"/> 撤销修改</Button>
<Button variant="outline" @click="historyChange('redo')" :data-tutorial-highlight="isControl('redo')?'true':null" :disabled="!canRedo"><AppIcon name="redo"/> 重做修改</Button>
</div>
<div class="edit-buttons">
<Button variant="outline" @click="undoWaypoint" :data-tutorial-highlight="isControl('undo-segment')?'true':null" :disabled="!plan.moves.length"><AppIcon name="undo"/> 撤销航点</Button>
<Button variant="outline" :disabled="!!plan.guard" @click="startReplan" :data-tutorial-highlight="isControl('redraw-movement')?'true':null"><AppIcon name="next"/> 重新规划</Button>
<Button variant="outline" @click="clearMovement" :disabled="!plan.moves.length"><AppIcon name="close"/> 清除航线</Button>
</div>
<p>仅编辑本舰 · Ctrl/⌘ Z 撤销 · Shift Z 重做</p>
<div class="waypoint-item" v-for="(segment,i) in (plan.segments||[])" :key="i">
<span>航点 {{i+1}} · {{coord(segment.target)}} · 累计 {{segment.end}} 步</span>
<Button variant="outline" @click="removeWaypoint(i)" :aria-label="'删除航点'+(i+1)+'及后续路线'"><AppIcon name="close"/></Button>
</div>
</section>
 <p v-if="routeConflicts.length" class="route-warning" role="status">当前计划可能与 {{routeConflicts.join('、')}} 碰撞，移动会截停并可能退回起点。可调整航路或先移开友舰。</p>
<p v-if="lastMovement[selected]" class="movement-receipt" role="status">上回合：{{lastMovement[selected].steps}} 步指令已接收 · {{lastMovement[selected].reason}}</p>
 <section class="action-list">
<div class="tool-title">本舰指令 <Button variant="outline" class="text-button" @click="resetPlan"><AppIcon name="close"/> 清空全部</Button>
</div>
<p v-if="!mainCounts(ship)" class="empty-state">尚无指令，执行时将原地待命<br>副炮与防空仍自动运行</p>
<div v-if="plan.smoke" class="action-item"><span>烟幕 · 本轮及下一轮</span><Button variant="outline" @click="toggleSmoke" :data-tutorial-highlight="isControl('smoke')?'true':null">取消烟幕</Button></div>
<div v-if="plan.escort" class="action-item"><span>护航 · 邻接友舰主炮／炸弹减伤30%</span><Button variant="outline" @click="toggleEscort" :data-tutorial-highlight="isControl('escort')?'true':null">取消护航</Button></div>
<div v-if="plan.radar" class="action-item"><span>雷达 {{coord(plan.radar)}}</span><Button variant="outline" @click="removeOrder('radar')">取消雷达</Button></div>
<div v-for="k in plan.mineSteps??[]" :key="'mine'+k" class="action-item"><span>第 {{k}} 步起点布雷</span><Button variant="outline" @click="toggleMineStep(k)">取消布雷</Button></div>
<div v-if="plan.guard" class="action-item guard"><AppIcon name="shield"/><span>海域封锁 · 当回合<br><small>移动力全部投入 · 鱼雷减伤 60%</small></span><Button variant="outline" @click="toggleGuard" aria-label="取消海域封锁"><AppIcon name="close"/></Button></div>
<div v-for="(m,i) in plan.moves" :key="'mv'+i" class="action-item movement">
<span class="action-number">{{i+1}}</span>
<span>{{m.turn===-1?'左转':m.turn===1?'右转':'保持'}} · {{m.forward?'前进':'原地'}}<small>{{coord(nodes[i+1].pos)}}</small>
</span>
<Button variant="outline" @click="undo(i)" :aria-label="'删除第'+(i+1)+'步及后续航段'"><AppIcon name="close"/></Button>
</div>
<div v-for="(t,i) in plan.torps" :key="'to'+i" class="action-item torp">
<span>鱼雷</span>
<span>节点 {{t.window}} · {{directionNames[t.dir]}}</span>
<Button variant="outline" @click="removeOrder('torps',i)" aria-label="删除鱼雷指令"><AppIcon name="close"/></Button>
</div>
<div v-for="(h,i) in plan.main" :key="'ma'+i" class="action-item artillery">
<span>主炮</span>
<span>{{coord(h)}} · {{ship.cfg.main?.blast?'120 / 60 范围':ship.cfg.main?.damage}} 伤害</span>
<Button variant="outline" @click="removeOrder('main',i)" aria-label="删除主炮落点"><AppIcon name="close"/></Button>
</div>
<div v-for="(p,i) in plan.planes" :key="'pl'+i" class="action-item aviation">
<span>{{p.slot!==undefined?AIR_ROLE_LABELS[planeForSlot(ship.cfg,p.slot).role??'bomber']:'飞机'}} {{p.slot!==undefined?'#'+(p.slot+1):''}}</span>
<span>{{p.mode!=='target'?coord(p.target):'追踪指定敌舰'}}</span>
<Button variant="outline" @click="removeOrder('planes',i)" aria-label="删除飞机指令"><AppIcon name="close"/></Button>
</div>
<div v-if="plan.sweep" class="action-item torp">
<span>清雷</span>
<span>{{coord(plan.sweep)}} · 消耗副炮</span>
<Button variant="outline" @click="removeOrder('sweep')" aria-label="取消清雷"><AppIcon name="close"/></Button>
</div>
<Button variant="outline" v-if="plan.moves.length" class="undo-button" @click="undo()"><AppIcon name="undo"/> 撤销末步 <small>Backspace</small>
</Button>
</section>
</template>
 <div v-if="ship.cfg.main" class="weapon-status" :data-campaign-focus="isCampaignFocus('reload')?'reload':isCampaignFocus('main')?'main':null">
<span>主炮</span>
<b>{{ship.mainReady>game.round?'装弹中 · 下一轮可用':'已装填'}}</b>
</div>
<div v-if="ship.cfg.carrier" class="weapon-status">
<span>机库</span>
<b>{{readyAircraft}} 可用 / {{ship.destroyedPlanes}} 损失</b>
</div>
<div v-if="ship.cfg.carrier?.slots" class="airborne-status"><p v-for="(cfg,i) in ship.cfg.carrier.slots" :key="i">#{{i+1}} {{AIR_ROLE_LABELS[cfg.role!]}} · {{ship.airHP[i]}} / {{cfg.hp}} HP · {{ship.airReady[i]===Infinity?'出动／损失':ship.airReady[i]>game.round?'第 '+ship.airReady[i]+' 回合就绪':'就绪'}}</p></div>
<div v-if="airborne.length" class="airborne-status">
<p v-for="p in airborne" :key="p.id">飞机 {{p.state==='return'?'返航中':'剩余单程 '+Math.max(0,p.cfg.range-p.traveled).toFixed(1)+' 格'}}</p>
</div>
<div class="capability-note"><p v-for="note in abilityNotes(ship.cfg)" :key="note.text" :data-campaign-focus="isCampaignFocus(note.topic)?note.topic:null"><component :is="isCampaignFocus(note.topic)?'strong':'span'">{{note.text}}</component></p>
<p v-if="ship.cfg.secondary" :data-campaign-focus="isCampaignFocus('secondary')?'secondary':null"><component :is="isCampaignFocus('secondary')?'strong':'span'">副炮 {{ship.cfg.secondary.damage}} 伤害 / {{ship.cfg.secondary.range}} 格 · {{ship.cfg.secondary.advanceSalvo?'移动后齐射':ship.cfg.secondary.targets?'最多两个不同目标':ship.cfg.secondary.multi?'每敌舰一次':'全回合一次'}}</component></p>
<p v-if="ship.cfg.aa" :data-campaign-focus="isCampaignFocus('aa')?'aa':null"><component :is="isCampaignFocus('aa')?'strong':'span'">防空 {{ship.cfg.aa.range}} 格 / 每敌机每回合 1 伤害</component></p>
<p v-if="ship.cfg.guard&&campaignAllowed('guard')" :data-campaign-focus="isCampaignFocus('guard')?'guard':null"><component :is="isCampaignFocus('guard')?'strong':'span'">海域封锁：牺牲全部移动力 · 邻接六格拦停敌舰 · 自身鱼雷减伤 60%</component></p>
<p v-if="ship.cfg.contactSweep" :data-campaign-focus="isCampaignFocus('contact-sweep')?'contact-sweep':null"><component :is="isCampaignFocus('contact-sweep')?'strong':'span'">接触水雷自动清除</component></p>
<p v-if="ship.cfg.carrier&&!ship.cfg.carrier.slots">飞机 {{ship.cfg.carrier.plane.hp}} HP · {{ship.cfg.carrier.plane.speed}} 格 / 回合 · 单程 {{ship.cfg.carrier.plane.range}} 格 · 炸弹 {{ship.cfg.carrier.plane.damage}} · 整备回血 {{ship.cfg.carrier.heal ?? 1}}</p>
</div>
</aside>
</div>
 <section v-if="phase==='ended'&&!historical" class="result-panel">
<strong>{{game.winner==='draw'?'双方势均力敌':game.winner===myTeam?(game.battleMode==='domination'?'占领作战胜利':'舰队作战胜利'):'舰队作战结束'}}</strong>
<p v-if="game.domination">最终积分：我方 {{game.domination.scores[myTeam]}} · 敌方 {{game.domination.scores[1-myTeam]}}</p>
<p>我方 {{ourCount}} 艘 / {{ourHP}} HP · 敌方 {{game.ships.filter(s=>s.team!==myTeam&&s.hp>0).length}} 艘 / {{game.ships.filter(s=>s.team!==myTeam).reduce((n,s)=>n+s.hp,0)}} HP</p>
<span v-if="game.battleMode==='domination'">仅一方全灭时，另一方获胜；双方同轮全灭按积分比较。达到 100 分或第 30 回合时，先比较积分，再比较存活舰数和总耐久。</span><span v-else>先比较存活舰船数，数量相同再比较总耐久</span>
</section>
<CampaignCoach v-if="campaign"/>
<TutorialCoach v-if="tutorial&&lesson"/>
</main>
</div><ConnectionGate v-else title="正在恢复战场" icon="spinner" spin :status="connectionStatusLabel" :error="onlineError"><Button variant="outline" @click="openOnline"><AppIcon name="next"/> 连接服务器</Button></ConnectionGate>
</template>
<style scoped>
@media (min-width: 1025px) {
 .historical-battle :deep(.battle-map-3d) {height:clamp(400px,calc(100dvh - 410px),780px);}
}
@media (max-width: 1024px) {
 .historical-battle {overflow-y:auto;display:block;overscroll-behavior:contain;}
 .historical-battle .battle-screen {display:block;min-height:100%;padding-bottom:24px;}
 .historical-battle .battle-layout {flex:none;grid-template-rows:42px minmax(424px,60dvh);}
 .historical-battle .battle-strip {position:sticky;top:0;z-index:8;background:var(--ink-0);}
 .historical-battle :deep(.battle-map-3d) {min-height:360px;}
}
@media (max-width: 640px) {
 .historical-battle .battle-layout {display:flex;flex-direction:column;}
 .historical-battle .mobile-fleet {flex:none;}
 .historical-battle .ocean-panel {height:max(424px,55dvh);flex:none;}
 .historical-battle .orders-sidebar {flex:none;max-height:none;overflow:visible;}
 .historical-battle .orders-sidebar .selected-heading,.historical-battle .mode-buttons {position:static;}
}

/* Public score adds a full row; reserve a usable chart instead of shrinking it
   inside the compact phone battle shell. Other battle layouts stay independent. */
@media (min-width: 1025px) {
  .domination-battle :deep(.battle-map-3d) { height: clamp(360px, calc(100dvh - 430px), 760px); }
}
@media (max-width: 1024px) {
  .domination-battle { overflow-y: auto; display: block; overscroll-behavior: contain; }
  .domination-battle .battle-screen { display: block; min-height: 100%; padding-bottom: 24px; }
  .domination-battle .battle-layout { flex: none; grid-template-rows: 42px minmax(424px, 60dvh); }
  .domination-battle .battle-strip { position: sticky; top: 0; z-index: 8; background: var(--ink-0); }
  .domination-battle :deep(.battle-map-3d) { min-height: 360px; }
}
@media (max-width: 640px) {
  .domination-battle .battle-layout { display: flex; flex-direction: column; }
  .domination-battle .mobile-fleet { flex: none; }
  .domination-battle .ocean-panel { height: max(424px, 55dvh); flex: none; }
  .domination-battle .orders-sidebar { flex: none; max-height: none; overflow: visible; }
  .domination-battle .orders-sidebar .selected-heading, .domination-battle .mode-buttons { position: static; }
}
.ai-thinking-card {
  position: fixed;
  z-index: 40;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  width: min(320px, calc(100vw - 40px));
  padding: 24px;
  border: 1px solid var(--line-2);
  border-top-color: var(--brass);
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, rgb(20 42 64 / .7), rgb(9 22 35 / .98)), var(--ink-1);
  box-shadow: 0 1px 0 rgb(255 255 255 / .05) inset, 0 20px 60px rgb(0 0 0 / .55);
  text-align: center;
  pointer-events: none;
}
.ai-thinking-card p { margin: 0; color: var(--text-1); font-size: 15px; font-weight: 600; overflow-wrap: anywhere; }
.ai-thinking-dots { display: flex; justify-content: center; gap: 7px; height: 16px; margin-top: 16px; align-items: center; }
.ai-thinking-dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--brass); animation: ai-thinking-bounce 1s ease-in-out infinite; }
.ai-thinking-dots i:nth-child(2) { animation-delay: .15s; }
.ai-thinking-dots i:nth-child(3) { animation-delay: .3s; }
@keyframes ai-thinking-bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
.ai-thinking-enter-active, .ai-thinking-leave-active { transition: opacity .15s ease, transform .15s ease; }
.ai-thinking-enter-from, .ai-thinking-leave-to { opacity: 0; transform: translateY(6px); }
@media (prefers-reduced-motion: reduce) {
  .ai-thinking-dots i { animation: none; }
  .ai-thinking-enter-active, .ai-thinking-leave-active { transition: none; }
}
</style>
