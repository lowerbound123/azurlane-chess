# v0.8.0 战斗动作与界面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Independent UI work uses superpowers:dispatching-parallel-agents. Steps use checkbox syntax.

**Goal:** 实现用户指定的动作、死亡消散、战后编队动画和更紧凑的选人/教程界面。
**Architecture:** 沿用现有事件→时间采样→Spine渲染链。死亡在展示层锁定位置并保留短暂角色，最后姿态转换为带纹理的点粒子；结算使用单独共享场景展示所有参战舰。UI各子系统独立修改。
**Tech Stack:** Vue 3、Three.js、Spine 3.8、Vitest、Playwright。
**Spec:** 用户2026-10-16当前请求及截图，动作与布局文字优先。

## Global Constraints
- 明确设置0.8.0一次，不再追加patch；不修改存档结构、localStorage键、网址或访问设置。
- 保留现有未提交内容；不创建缺失这些内容的新工作树，不提交/推送/发布。
- idle→stand；secondary/fire→attack；bb main→attack_left；hit→yun；death→dead且不回idle；carrier launch→attack。
- 结算我方上2后排下3前排；敌方上3前排下2后排；胜dance败yun循环，平局双方yun。
- 移除页面标题上橙色眉题并缩短所有页面顶部空白；教程浮动固定底部，展开内容高度不随步骤变化，可收起。

## Review Focus
- 同次伤害致死不可先yun；死亡后不能被移动插值、后续命令或状态伤害移动。
- 播放结束/跳过/重新载入不能遗留幽灵角色、粒子或WebGL资源。
- 在线雾区中不可凭死亡效果泄露敌人；结算后才展示完整阵容。
- 演示源指纹变化须验证并重录，不能让assets:prepare和构建失效。
- 390px视口、内容长的教程步骤、结算双方不满5艘时都应布局稳定。

### Task 1: 战斗动作与死亡
Files: src/characters/config.ts, spine.ts, src/scene/units.ts, 新death-particles模块, src/playback.ts, src/battle-visuals.ts, src/engine.ts以及对应测试。
- [x] 编写致死/非致死、主副炮、死亡停位与终帧的回归；运行RED。
- [x] 实现绑定和事件区分，按骨骼真实时长保持dead并进入粒子飘散；运行GREEN。

### Task 2: 战后结算
Files: 新BattleSettlement.vue和场景/布局模块, src/pages/BattlePage.vue，测试。
- [x] 覆盖阵型坐标、胜负/平局、完整参战阵容和结束时机。
- [x] 实现可关闭/重开的结算，保留现有再战入口，销毁GPU资源。

### Task 3: 选人能力展示（并行）
Files: src/components/ShipAbilityDemo.vue以及相关UI测试。
- [x] 删除暂停/重播/放大，正常自动循环；保留必要的加载失败重试与浏览器自动播放受限的一次启动。
- [x] 动态能力说明搬到视频上方，名字·能力及说明同一标题区域。
- [x] 运行对应回归验证媒体释放、回退、循环和新UI。

### Task 4: 全局标题和教程（并行）
Files: PageHead/FleetSelection等标题模板、navigation/style CSS、BattlePage教程提示或独立组件、UI测试。
- [x] 删除页面顶部橙色眉题，统一收紧标题上空白。
- [x] 固定教程提示到页面底部，固定展开/收起高度，长内容内部滚动，保留收起。
- [x] 桌面和移动视口验证。

### Task 5: 集成与交付
- [x] 设置版本0.8.0一次；更新资产/演示指纹和必要录制。
- [x] 类型检查、针对性测试、全量测试、生产构建。
- [x] 浏览器检查死亡粒子、双方结算、选人循环、标题和教程固定位置，保存截图。
- [x] 更新忽略的.task-state.md并报告验证结论。
