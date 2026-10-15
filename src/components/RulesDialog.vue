<script setup lang="ts">
import {displayCatalogText} from '../ship-catalog.ts';
import AppIcon from './AppIcon.vue';
import {Button} from './ui/button';
import {Dialog, DialogContent, DialogTitle, DialogDescription} from './ui/dialog';
import {APP_VERSION} from '../version.ts';
import type {IconName} from '../icons.ts';
import {SHIP_DEFINITIONS} from '../ship-definitions.ts';
import {abilityText} from '../ship-descriptions.ts';
defineProps<{open:boolean}>();
const emit=defineEmits<{'update:open':[value:boolean]}>();
const keys:[string,string][]=[['Q / E','左转 / 右转 60°'],['Z','保持航向'],['W','前进一格'],['Space','原地等待或转向'],['Backspace','撤销末步'],['1 – 5','选择舰船'],['T · G · F · M','鱼雷 · 主炮 · 飞机 · 排雷'],['Esc','返回航线模式'],['Enter','执行回合'],['⌘/Ctrl Z','撤销修改，加 Shift 重做']];
const sections:{icon:IconName;title:string;paragraphs:string[]}[]=[
  {icon:'eye',title:'迷雾与计划编辑',paragraphs:['黑色格未探索，灰暗格保留已发现地形，正常亮度为当前共享视野。敌舰离开视野即消失，没有残影；水雷只在已探索海域显示。绿色可达范围考虑舰首、剩余步骤和已知岛屿，未探索航路只是试探','所有己方计划默认可见，选中舰高亮；主炮叠点显示发数，飞机显示出击路线，鱼雷实线是本轮航程、虚线是寿命上限。可按需要隐藏范围或全部计划。航点可整段撤销，重新规划/清除航线保留其他武器指令；失效鱼雷窗口会取消并提示。Ctrl/⌘ Z 撤销，Shift Z 重做']},
  {icon:'clock',title:'同步与碰撞',paragraphs:['不同航速共享同一回合时间轴。舰船按圆形实体碰撞，友军同样受伤；碰撞后停在接触位置，未到达鱼雷节点取消','主炮命中之后，撞停舰沿实际经过的原路回退到合法格；无处回退则搁浅沉没。欧根开启海域封锁可截停邻接敌舰']},
  {icon:'target',title:'武器',paragraphs:['主炮：回合开始发射，回合末落地，可盲射。北卡 3×60、射程9、装填1轮；武藏单发覆盖中心与邻接六格，中心120、邻格60；黎塞留 2×40、射程7、无装填空窗','鱼雷：起始与每步末尾可侧向发射，速度4、寿命3回合、伤害40。岛风库存8、每轮最多4枚，可同窗向不同合法方向发射；阿卡司塔与轻巡库存6、每轮最多3枚、每窗1枚。Z35没有鱼雷','欧根亲王海域封锁：牺牲当回合全部移动力，邻接六格的敌舰不能移动，后来进入的敌舰停止剩余航线；自身鱼雷减伤60%、火炮减伤30%，回合结束失效。副炮、防空照常运行','副炮：可见且无遮挡的最近敌舰，基础配置每轮一次；克利夫兰双目标，旧金山移动后齐射。远程清雷消耗全部副炮，不影响主炮']},
  {icon:'plane',title:'飞机与防空',paragraphs:['各航母每轮最多放飞2架。普通轰炸机2HP、航速6、视野3、单程12、炸弹25、整备1轮；企业强袭机3HP、航速5、炸弹35、整备2轮。香格里拉侦察机视野5、单程16且不投弹；埃塞克斯战斗机用于拦截。返航追踪当前母舰，不消耗单程航程','定点模式沿直线六角航路，遇第一艘敌舰投弹；指定模式只炸目标，本轮丢失视野仍追踪，下轮向冻结的目标终点飞行，途中重获视野则恢复追踪，未找到目标而到达终点则返航。先防空，再空战、碰撞、投弹／鱼雷／水雷，最后普通副炮']},
  {icon:'trophy',title:'歼灭模式胜负',paragraphs:['全部舰船沉没或第 30 回合结束时结算。先比存活舰数，再比总 HP；完全相同为平局，双方全灭也为平局']},
];
const edges=['鱼雷离开发射舰所在格后启用碰撞，可误伤友军；主炮也可误伤。水雷 40 伤害，接触排雷优先于同刻触雷。岛屿阻挡视野、副炮与鱼雷，飞机可以越岛','同舰对每回合碰撞伤害只结算一次，第三艘后续撞入仍生效。舰船圆半径为六角内切圆半径减 0.001，避免相邻静止舰接触误判。成组接触同刻处理；回退优先队伍逐轮交替，同队按舰号排序。主炮和副炮同刻伤害按齐射处理','飞机到达定点、失去已沉没目标，或用尽单程航程即返航；母舰沉没时返航机销毁。格边界采用稳定的唯一归格。物理使用固定 240 子步与连续扫掠碰撞，确保相同种子、指令得到相同结果','AI 只使用当轮共享视野可见信息，进行航路、集火、鱼雷方向与友军避碰评分；飞机特殊跨视野追踪与玩家一致。所有单位能力均来自配置，编队标签不参与战斗判断'];
sections.push({icon:'target',title:'三据点占领',paragraphs:['新局可选择 21×17 的三据点占领。A、B、C 均为半径 2 格的公开占领区；据点状态公开，未知岛屿与隐蔽敌舰仍受迷雾保护。','回合伤害与碰撞回退全部完成后，圈内存活舰船参与占领；飞机、鱼雷、水雷不占点。单方在中立点获得 50% 进度，再次有效结算即完成占领。双方入圈时进度暂停，无舰时未完成进度清零，友舰可以轮换接续，受伤不掉进度。','已占点即使己方离开仍保留归属；双方入圈暂停收益，仅敌方入圈则中立化并开始敌方 50% 进度。占领本轮完成，下轮开始产分；每点每轮 5 分，每艘敌舰首次沉没 15 分（包括友伤、触雷等原因），本方沉没不扣分，飞机不计分。','目标 100 分，最多 30 回合。仅一方舰队全灭时另一方胜；双方同轮全灭比较积分。双方仍有舰且有人达到 100 分，或到达回合上限时，比较最终积分，再比较存活舰数、总 HP；全部相同为平局。所有本轮得分统一结算后判胜。']});
sections.push({icon:'ship',title:'15 艘独立舰船',paragraphs:Object.values(SHIP_DEFINITIONS).map(c=>c.name+'：'+(abilityText(c).join(' ')||`主炮 ${c.main?.shots}×${c.main?.damage}、射程${c.main?.range}、装填${c.main?.reload}轮`))});
sections.push({icon:'eye',title:'区域与航空',paragraphs:['烟幕只隐藏舰船，不遮挡地形或飞机。区内舰船视野降至1格，敌方须邻接观察或雷达发现，防空照常。雷达穿透岛屿及烟幕，副炮仍须无遮挡。区域覆盖施放当轮及下一轮，施放者沉没后仍持续。','布雷绑定前进步骤，完成后在起点布设，下一轮武装。等待、转向和未完成步骤不布雷，不扣库存。同格不叠雷，争用按逐轮交替队伍及舰号排序。未武装水雷也可排除。','战斗机沿途自动攻击，每轮最多一架敌机；到巡逻点后累计停留一轮再返航，返航不开火。侦察机只侦察，不投弹。所有机型整备完成回复1HP，飞机损失不补充。','旧存档和基础专项练习保留原配置；新局与归航行动使用15艘独立舰船。归航行动前九章采用独立任务目标与训练数值，终章恢复30回合限制；教学进度独立保存在本机。']});
for(const section of sections){section.title=displayCatalogText(section.title);section.paragraphs=section.paragraphs.map(displayCatalogText);}
</script>
<template>
  <Dialog :open="open" @update:open="emit('update:open',$event)">
    <DialogContent class="rules-modal max-h-[88dvh] overflow-y-auto p-0 sm:max-w-5xl" :show-close-button="false">
      <header class="rules-head">
        <div>
          <p class="eyebrow">FIELD MANUAL · {{APP_VERSION}}</p>
          <DialogTitle class="rules-title">作战手册</DialogTitle>
          <DialogDescription class="rules-lede">舰队规划、战斗结算与迷雾规则</DialogDescription>
        </div>
        <Button variant="outline" aria-label="关闭规则" @click="emit('update:open',false)"><AppIcon name="close"/> 关闭</Button>
      </header>
      <div class="rules-body">
        <section class="rules-card rules-controls">
          <h3><AppIcon name="keyboard"/> 操作</h3>
          <p>PC 在任何模式下左键点友舰都会切换选舰，Shift＋左键则对友舰所在格下令；其他海格按当前工具下令。右键撤销当前舰船上一次计划修改。左键或中键拖动平移，Shift＋中键拖动旋转，滚轮缩放。手机保留按当前工具点选的逻辑，可单指拖动、双指缩放，或用侧栏下令</p>
          <dl class="key-grid">
            <div v-for="[key,text] in keys" :key="key"><dt><span class="kbd">{{key}}</span></dt><dd>{{text}}</dd></div>
          </dl>
          <p class="faint">规划没有时间限制，Enter 执行回合</p>
        </section>
        <section v-for="section in sections" :key="section.title" class="rules-card">
          <h3><AppIcon :name="section.icon"/> {{section.title}}</h3>
          <p v-for="(text,i) in section.paragraphs" :key="i">{{text}}</p>
        </section>
        <details class="rules-card edge-rules">
          <summary><AppIcon name="scroll"/> 本原型采用的边界约定 <AppIcon name="chevronDown" class="chev"/></summary>
          <p v-for="(text,i) in edges" :key="i">{{text}}</p>
        </details>
      </div>
      <p class="rules-foot">这是可玩的机制原型，耐久、伤害、地图密度和 AI 强度仍需实战调平</p>
    </DialogContent>
  </Dialog>
</template>
<style scoped>
.rules-head {
  position: sticky; top: 0; z-index: 2;
  display: flex; align-items: flex-end; justify-content: space-between; gap: 16px;
  padding: 26px 28px 18px; border-bottom: 1px solid var(--line-1);
  background: linear-gradient(180deg, rgb(12 28 44 / .98), rgb(10 24 38 / .94));
}
.rules-title { margin-top: 10px; font-size: 26px; font-weight: 700; letter-spacing: .06em; }
.rules-lede { margin-top: 4px; color: var(--text-2); font-size: 13px; }
.rules-body { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; padding: 22px 28px 8px; }
.rules-card { padding: 18px 20px; border: 1px solid var(--line-1); border-radius: var(--radius-lg); background: rgb(14 32 50 / .45); }
.rules-card h3 { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 15px; color: var(--brass-hi); }
.rules-card h3 .app-icon { color: var(--brass); font-size: 13px; }
.rules-card p { color: var(--text-2); font-size: 13px; line-height: 1.85; }
.rules-card p + p { margin-top: 8px; }
.rules-controls { grid-row: span 2; }
.key-grid { display: grid; gap: 6px; margin: 14px 0; }
.key-grid > div { display: grid; grid-template-columns: 116px 1fr; align-items: center; gap: 12px; padding: 4px 0; border-bottom: 1px dashed var(--line-1); }
.key-grid dt .kbd { white-space: nowrap; font-size: 11px; height: 22px; padding: 0 7px; color: var(--text-1); }
.key-grid dd { margin: 0; font-size: 13px; color: var(--text-2); }
.edge-rules { grid-column: 1 / -1; }
.edge-rules summary { display: flex; align-items: center; gap: 10px; cursor: pointer; list-style: none; font-weight: 600; color: var(--text-1); }
.edge-rules summary::-webkit-details-marker { display: none; }
.edge-rules summary .app-icon { color: var(--brass); }
.edge-rules .chev { margin-left: auto; color: var(--text-3) !important; transition: transform .2s; }
.edge-rules[open] .chev { transform: rotate(180deg); }
.edge-rules[open] summary { margin-bottom: 10px; }
.rules-foot { padding: 12px 28px 24px; color: var(--text-3); font-size: 12px; }
@media (max-width: 760px) {
  .rules-head { padding: 20px 18px 14px; }
  .rules-body { grid-template-columns: 1fr; padding: 16px 18px 4px; }
  .rules-controls { grid-row: auto; }
  .key-grid > div { grid-template-columns: 100px 1fr; }
  .rules-foot { padding: 10px 18px 20px; }
}
</style>
