# 独立历史战斗实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 实现五场可直接进入、独立保存、具有实际任务胜负和历史舰队的 PvE 战斗。

**Architecture:** 历史关卡、任务状态、AI 和存档放在独立 history 模块；复用引擎的 mission 终止策略与 Worker。独立 Pinia 战斗状态接入已有 BattlePage，沿用规划、状态图标和回放。

**Tech Stack:** TypeScript、Vue 3、Pinia、Three.js、Comlink、Vitest、Playwright。

**Spec:** docs/superpowers/specs/2026-10-15-independent-historical-battles-design.md

## Global Constraints

- 五场全部开放、每场独立存档和最佳成绩，不继承其他战斗资源；同场阶段保留伤害、弹药和位置。
- 直接使用规范中的舰队、候选数值、地图尺寸和回合上限；实际通关验证需要的布局或平衡调整记录理由。
- 不改变普通模式、教程、占点和状态系统一期的行为；不自动挂新 Buff/Debuff。
- 敌人规划只消费本方观察、历史接触和公开区域；不可读取隐藏实时位置或玩家计划。
- 使用当前 codex/online-v042 工作区和已安装依赖；保留已有未提交的 v0.6.6 成果，不提交、推送或部署。
- 当前用户已明确要求开始代码实现，连续完成实施与验证，不再为内部执行方式请求确认。
- 用 docs/superpowers/.task-state.md 追加本任务进度；本实施批次完成时 version:next 仅一次，当前预期 v0.6.7。

## Review Focus

- 同轮撤离与致命主炮：必须先计算伤害和观察，再判定撤离与任务。
- 全部可控驱逐沉没但航母尚有希望：萨马岛继续运行，不能套用普通歼灭结束。
- 已有存档、错误内容版本、Infinity 飞机整备：损坏记录不覆盖，五场不串档。
- AI 舰不可被手动下令，预览路径与实际运行一致，重载不能改变当轮 AI 方案。
- 从历史战斗切到普通对局、教程、另一历史战斗和刷新深链接：状态、Worker 与自动存档彼此隔离。

## Interfaces

- shared/history.ts: HistoricalId = 'river-plate'|'narvik'|'denmark-strait'|'midway'|'samar'。
- HistoricalDefinition: id, title, subtitle, date, description, history, sources:{title,url}[], difficulty, minutes, roundLimit, map:GameMap, units:HistoricalUnitDefinition[], regions:HistoricalRegion[], objectives:string[], bonusObjectives:string[]。
- HistoricalUnitDefinition: id, team:Team, template:ShipType, name, cfg:ShipConfig, pos:Hex, heading, controlled:boolean, hp?:number, airReady?:number[]。
- HistoricalRegion: id, label, kind:'exit'|'enemy-exit'|'control'|'intel', cells:Hex[]。
- HistoricalState: version:1, scenarioId:HistoricalId, status:'playing'|'won'|'lost', lastResolvedRound:number, stage:string, counters:Record<string,number>, events:string[], extracted:Record<string,{id:string;label:string;team:Team;hp:number;round:number}>, contacts:Record<string,{at:Hex;heading:number;round:number}>, convoyRoute:'central'|'east', convoyWait:boolean, convoyWaitLastRound:number, result?:{won:boolean;stars:number;round:number;reason:string;bonus:boolean[]}。
- HistoricalSave: {state:HistoricalState;game:Game;plans:Plans;selected:string}。
- src/history/index.ts exports HISTORICAL_BATTLES:HistoricalDefinition[], getHistoricalDefinition(id:string):HistoricalDefinition|undefined, createHistoricalBattle(id:HistoricalId):HistoricalSave, historicalFriendlyPlans(game:Game,state:HistoricalState):Plans, resolveHistoricalRound(game:Game,state:HistoricalState,plans:Plans):RoundResult & {historical:HistoricalState}, historicalObjectives(game:Game,state:HistoricalState):{id:string;label:string;current:number;target:number;complete:boolean}[]。
- src/history/storage.ts exports createHistoricalStorage(storage:Pick<Storage,'getItem'|'setItem'>) with read(id):{kind:'missing'}|{kind:'resume';save:HistoricalSave}|{kind:'error';message:string}, write(save):{ok:true}|{ok:false;message:string}, best(id):{stars:number;round:number}|null。
- 可添加模块内部字段，但上述公共接口保持一致；公共导出由对应任务所有者实现。

### Task 1: 历史战斗领域模块

**Files:** Create shared/history.ts, src/history/{index,content,maps,ai,runtime,storage}.ts and tests/historical-{content,runtime,ai,save,full-games}.test.ts. 不编辑其他已有产品文件。

**Interfaces:** 产出上方 Interfaces 全部领域接口。引擎调用 resolveRound(game, plans, {termination:'mission'})；历史结果是 RoundResult 的扩展，不修改普通引擎终止规则。

- [x] 写 RED：五种 fixture 舰队数为 4/10/4/7/10（含敌舰与 AI 舰），玩家舰数为 3/4/2/3/3；地图21×17/19×25/25×15/27×21/23×25，回合上限14/18/12/18/16，所有初始格与任务区域合法，HP 和武器符合规范。
- [x] 运行 npx vitest run tests/historical-content.test.ts，验证缺失功能导致失败。
- [x] 实现数据、地图、初始配置和公共类型；固定历史舰名、显式能力配置；不继承现役十五舰被动技能。
- [x] 写 RED：追踪需撤退后连续两轮、港口争夺清零、最后一轮可赢、旗舰同轮沉没失败、撤离与沉没区分、中途岛第三舰击沉不抢先结算、萨马两艘撤离后保留第三艘机会、重复结算幂等。
- [x] 实现纯结算和 AI；实际移除撤离船及其飞机，保存撤离 HP；输出最后回放帧与最终状态一致。shipId 可用0-0等稳定编号，跨场由 scenarioId 隔离。
- [x] 写 RED：隐藏位置变化不改变敌计划、NPC 预览与执行相同、Samar 无可控舰继续、Narvik 转向路径可达；实现有航向约束的路径规划和视野受限攻击、搜索、拦截、退却及航空计划。
- [x] 写 RED：五场存档隔离、在航Infinity恢复、错版/损坏不覆盖、伪造配置或越界拒绝、阶段与计数精确恢复；实现上方 storage API。存档必须有界且不信任 JSON 中的配置、引用或原型字段。
- [x] 为五场从真实初始 fixture 建立可复现胜利的参考指令/策略测试，使用真实引擎及正常伤害，不可在测试中直接改血量、移动敌舰或越过目标。此验证可以暴露需微调的布局，记录所有调整。
- [x] 运行所有 historical 领域测试与相关 engine/status/campaign 回归，输出报告 /private/tmp/historical-domain-report.md，列出实战回合、原型调整和剩余限制；不提交、不推进版本、不写共享任务记录。

### Task 2: 历史会话与已有战斗 UI 接入

**Files:** Create src/stores/historical.ts, src/composables/use-historical.ts, src/pages/HistoricalPage.vue, src/components/HistoricalMission.vue, tests/ui-historical.test.ts. Modify src/{router,app-session,HomeScreen}.ts/vue, src/pages/{HomePage,BattlePage}.vue, src/composables/{session-core,session-actions,use-replay,use-planning,use-saves}.ts, src/workers/{battle-api,battle.worker}.ts, shared/game.ts and generic map region rendering if required。

**Interfaces:** 消费 Task 1 接口；core.historicalStore、historical、historicalDefinition、historicalControlled(id)；actions.startHistorical(id,resume=true,navigate=true), exitHistorical(navigate=true), saveHistorical(), recordHistoricalRound(result), setHistoricalConvoy(route,wait), historicalMenu()。

- [x] 写 RED UI 回归：入口出现五张卡，直接深链接进入、两舰与三航母可用对应武器、友军 AI 只读；不同关卡存档保持、历史模式不覆盖普通自动存档。
- [x] 运行 npx vitest run tests/ui-historical.test.ts，确认缺少入口/行为失败。
- [x] 新增独立 store，activeBattle 优先选择历史会话；给普通保存、教程和路由退出增加准确隔离。用户编辑、地图选舰、快捷键都检查可控集合，友军计划仍可预览。
- [x] Worker 请求可带 historical:HistoricalState，由领域 resolveHistoricalRound 计算；返回结果携带 historical 状态，回放完成后才安装并保存最终任务进度。
- [x] 五卡选择页包括简报、阵容武器、史料、继续/重开确认、最佳成绩、读取失败反馈；战斗页任务条显示实际进度、可选条件、退出重试、友军航线选择；结束展示任务结果与历史经过。
- [x] 地图公开显示任务区域和情报区域且不泄露敌舰；保持状态图标/Tooltip与触屏控制；动态舰炮和飞机数量文案取配置。
- [x] UI 与 Worker 实际接口回归通过。修改仅与本模式有关，不大规模重构 BattlePage。

### Task 3: 独立审查与交付验证

**Files:** docs/validation/v0.6.7.md, README.md, docs/superpowers/.task-state.md, version script targets。

- [x] 对 Task 1 使用新审查者做规格与质量检查；对集成结果做整体审查，修复有证据的缺陷并补回归。
- [x] npx vue-tsc --noEmit / npm run typecheck、全部 npm test，确保既有确定性基线与状态系统不回归；本机监听权限不足时用合规执行环境完成网络测试。
- [x] 真实浏览器检查桌面/手机卡片、深链接、开局地图、规划、真实 Worker 回合、目标、存档继续、退出普通模式与结果展示，无控制台错误。
- [x] 一次 npm run version:next，从实际当前版本递增；npm run build 成功后记录唯一版本与证据，修补不再加版。
- [x] 更新 README 与验收文档，交付功能位置、验证结果、数值调校的实际范围。
