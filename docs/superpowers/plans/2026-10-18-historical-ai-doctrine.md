# Historical AI Doctrine Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement inline, with one independent review after implementation. Track evidence in docs/superpowers/.task-state.md.

**Goal:** 五场历史战斗的敌军与萨马岛友军在现有规则下表现出不同战术。

**Architecture:** 观察投影 → 逐关意图与短期情报 → 有限候选航路/威胁评分 → 协调武器和航空调度 → validPlan。导航导出兼容旧调用，战术意图不进入存档。

**Tech Stack:** TypeScript、现有战斗引擎、Vitest；不增加依赖。

**Spec:** docs/superpowers/specs/2026-10-18-historical-ai-doctrine.md

## Global Constraints

- 不读隐藏真值、玩家待执行指令、敌方飞机隐藏目标；不改舰船配置/地图/胜负/存档。
- 保留用户工作区；只推进一次补丁版本；不重录视频。

## Review Focus

- 相同观察但隐藏位置、血量或萨马岛路线不同，敌军决定一致。
- 飞机返航、损失、整备竞争和失联目标不会产生非法/浪费的出击。
- 舰船/鱼雷在连续时间交会，末端不重叠并不足以判断安全。
- 旧存档恢复、重复预览不会改变状态或决策。
- 更改 AI 后五关仍有不同可行解，测试不能借用敌方计划。

## Task 1: 战术行为回归

**Files:** Create tests/historical-tactics.test.ts; preserve tests/historical-ai.test.ts.
**Interfaces:** 通过 historicalEnemyPlans(Game,HistoricalState):Plans 和 historicalFriendlyPlans 观察实际指令；通过 resolveRound 检查伤害/碰撞。

- [x] 写出目标一致、港口防御、编队截击、航母巡航、防空优先、过期接触、烟幕和鱼雷交会测试。
- [x] 跑 vitest，记录既有 AI 下各缺失行为的 RED；已满足的公平性/兼容性断言作为不变量保留。

## Task 2: 意图与执行

**Files:** Modify src/history/ai.ts; create src/history/doctrine.ts, src/history/tactics.ts, src/history/weapons.ts.
**Interfaces:** HistoricalIntent {role,goal?,range,targetId?,hold?}; contacts 仅含本方四轮内观测。历史入口签名不变；navigateHistorical 从 tactics 重导出。

- [x] 实现逐关意图和接触搜索，统一任务目标。
- [x] 保留朝向 BFS，加入少量备选航路、友军连续冲突、可见雷迹与水雷代价。
- [x] 实现炮击预测、真实射线雷击、防空/侦察/攻击优先级和烟幕去重。
- [x] 定向测试 GREEN；如遇实际失败，先定位最小局面，再修改。

## Task 3: 全局验证与交付

**Files:** tests/historical-full-games.test.ts (only if new movement requires a better fair reference skipper); README.md; version script outputs.

- [x] 真实引擎验证历史全部测试和五场双策略通关、存档恢复；补充发现的必要回归。
- [x] 完成独立审查，修复重要问题，记录证据。
- [x] 更新 README 并运行 npm run version:next 一次。
- [x] 运行 npm run typecheck、npm test、npm run build；只校验/复用现有视频。
- [x] 更新任务记录并交付，不提交、推送或部署。
