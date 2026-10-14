# 归航行动教学战役 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. 用户已明确要求根据计划开始执行，连续完成实施和验收，不再重复请求启动确认。

**Goal:** 新增13×72固定长图的十段连续教学，从一舰到五舰，覆盖15舰能力，独立保存与恢复。
**Architecture:** 通用引擎按地图尺寸运行；纯数据/函数的campaign模块定义检查点与基于真实结算的任务；现有教程会话扩展接入，复用BattlePage操作，独立存储。
**Tech Stack:** Vue3/Pinia/TypeScript/Three.js/Vitest/Playwright，保持现有依赖。
**Spec:** docs/superpowers/specs/2026-10-14-guided-campaign-design.md

## Global Constraints
- 正常地图19×15、旧确定性、联机规则和普通存档键不变。
- 基线v0.5.11，全部实施完成后version:next一次；不发布，不提交混有既有迁移的工作树。
- 在当前codex/online-v042工作区增量修改；新worktree不会包含用户已实现但未提交的15舰基线。
- 全部文字中文，真实模拟判定；不解析中文日志作为唯一判据。
- 每段提供参考指令（提示后由用户执行），重试恢复局部检查点；未来实体只在进入时出现。

## Review Focus
- 长地图边缘/不同地图切换后的视野缓存、点选与镜头。
- 保存Infinity飞机槽、损坏/过期存档、读取不能覆盖普通存档。
- 执行回放时退出/重试/刷新；过场跳过与重复点击不得重复推进。
- 不同合法路线、关键目标早死、弹药耗尽不得永久卡关。
- 目标必须依真实战斗结果通过；只点击下一步不得解锁，所有15舰实操覆盖。

### Task 1: 地图尺寸与任务结算基础
**Files:** engine.ts, planning.ts, shared/render.ts, scene board/ocean/islands相关, use-battle-map.ts, worker battle-api/worker, tests/campaign-map.test.ts。
**Interfaces:** inBounds(h,map?), allHexes(map?), deployment(team,map?) 以当前map尺寸工作，默认19×15；resolveRound(game,plans,options?:{termination?:'fleet'|'mission'})；LocalRoundRequest.resolution传递同一选项；MapModel可增加可选map尺寸/任务取景字段。不修改session-core/BattlePage，由root接入。
- [x] 写长图合法性、视野/航路/武器、任务无敌舰且超过30轮、正常终局不变测试并观察RED。
- [x] 更新全部引擎内部调用和planning；长图视野缓存包含尺寸。
- [x] 使地图点选与摄像机可适配长图，保留现有默认行为与map handle。
- [x] 定向GREEN及旧确定性/场景回归；报告确切接口。

### Task 2: 教学内容与真实机制检查点
**Files:** shared/campaign.ts, src/campaign/{map,content,runtime}.ts, tests/campaign.test.ts。
**Interfaces:** 稳定外部入口src/campaign/index.ts，类型从shared/campaign.ts导出。
CampaignState={version:number,chapter:number,checkpoint:number,status:'playing'|'checkpoint-complete'|'failed'|'complete',completed:string[],hintLevel:number,attempts:number,evidence:Record<string,number|boolean>};
CampaignFixture={game:Game,plans:Plans,selected:string};
CAMPAIGN_CHAPTERS: {id:string,title:string,description:string,minutes:number,rows:[number,number],checkpoints:{id:string,title:string,instruction:string,hints:string[],focus:Hex,unlocks:string[]}[]}[];
createCampaignState():CampaignState;
createCampaignFixture(state:CampaignState, fleet?:string[]):CampaignFixture;
campaignOrders(state,game):Plans;
evaluateCampaignRound(state,before,submitted,result):CampaignState;
advanceCampaign(state):CampaignState; 仅checkpoint-complete允许前进；
campaignReferencePlans(state,game):Plans; 输出可执行参考方案且不修改状态；
campaignCheckpoint(state)返回当前checkpoint定义；
campaignFocus(state):Hex；
CAMPAIGN_MAP={width:13,height:72}，地图静态。
- [x] 真实结算测试证明开局1友0敌、十章15舰覆盖、下一步门槛。
- [x] 按Spec十段实现细分检查点，航行/副炮/迷雾/双舰/鱼雷/扫布雷/三主炮/烟雷达/三重巡/四机型/终章。
- [x] 每检查点参考方案能够在有限回合内真实完成，不直接改HP伪造通过；参考方案允许多轮适应。
- [x] 测试遍历全流程与资源失败恢复，至少一个非参考路线可通过。
- [x] 输出GREEN证据与可复用接口；不修改UI/session/save/engine文件。

### Task 3: 会话、独立持久化与玩家界面
**Files:** src/campaign/storage.ts, stores/tutorial.ts, use-tutorial/use-replay/session-core/session-actions/app-session/router, CampaignCoach.vue, TutorialMenu/TutorialPage/BattlePage, tests/ui-campaign.test.ts, tests/campaign-save.test.ts。
**Interfaces:** tutorialStore.campaign:CampaignState|null；campaign活动时仍使用tutorialStore战斗状态；旧tutorial隔离。startCampaign(resume?:boolean), retryCampaign(), nextCampaign(), campaignHint(), campaignSuggest(), focusCampaign()。
- [x] RED：从教程主页开始只有一舰，任务门槛、重试、存续、普通存档不变。
- [x] 添加独立带版本存储，保留Infinity和验证地图/坐标/状态；读取失败保留原存档，向用户说明。
- [x] 绑定路由/tutorial/campaign，复用战斗输入与worker；将before/plans/result交给真实任务判定。
- [x] 任务卡、分级提示/参考方案、局部重试、进度导航、阶段整备/可跳过航渡、终章编队与部署。
- [x] 入门隐藏未学武器，后续开放；镜头随任务聚焦，能浏览长图与回任务。
- [x] 校正旧说明的过期舰种参数，保留专项练习。
- [x] 定向GREEN和真实浏览器桌面/手机流程。

### Task 4: 整体验收与交付
**Files:** tests relevant, README.md, docs/TODO.md, version metadata.
- [x] 由独立审查者审查本批更改；修复重要问题并验证。
- [x] npm test、npm run typecheck、npm run build；检查普通对局、旧教程、联机回归。
- [x] 浏览器确认入口、长图非空、任务操作/推进、恢复、移动端、console/page errors。
- [x] npm run version:next一次至v0.5.12，必要时重建验证版本。
- [x] 保存验证证据与task-state，报告实际覆盖和25–35分钟仍需真人试玩的限制。



## v0.5.12 最终验收
- 版本仅推进一次：v0.5.11 → v0.5.12，不再重复增加。
- npm test 77文件438项通过（67.50s，exit0）；typecheck与生产build均exit0。
- 独立审查发现清雷穿越P2已修复；北卡单发门槛已补，无遗留P1/P2。
- 桌面Chrome1440×1000通过真实UI+Worker完整完成10章28检查点，54次结算，终章11回合获胜；console/page errors=[]，无框架错误覆盖层。
- 手机390×844真实tap前进、执行、完成、推进、整图/旋转、定位、保存退出通过；无横向溢出，canvas高333px。生产打包版4174同样通过。
- 刷新续玩、损坏保存、计算中刷新恢复、终章换编队与胜局保存有回归；普通对局、旧教程、联机均在全量通过范围。
- 25–35分钟是首次学习目标，尚需新手真人试玩；已记录docs/TODO.md。
- 证据：/private/tmp/campaign-final-tests.log、campaign-final-types.log、campaign-final-build.log、campaign-full-browser.log、campaign-mobile-input.log、campaign-production-browser.log；截图campaign-finished.png、campaign-stage-9.png、campaign-mobile-final.png。
- 未提交/推送/部署，保留当前工作区。开发4173和生产预览4174可试玩。
