# 选船界面舰船能力演示计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task after user review. Steps use checkbox syntax for tracking. 本次用户明确要求先提交计划审核，不执行功能或素材制作。

**Goal:** 在选船立绘区域右上角增加“能力演示”开关，用十五段准确、简洁的动画帮助玩家理解当前舰船能力。

**Architecture:** 使用现有舰船配置与战斗解析器生成固定小场景，再复用现有 Three.js 战场资源按固定时间采帧，离线导出 WebM、MP4 和封面。正式选船页面只播放预渲染视频，通过现有固定资源清单和资源解析器加载，不启动另一场实战或额外战斗渲染器。

**Tech Stack:** Vue 3、TypeScript、现有战斗引擎与 Three.js 场景组件、Playwright 离线采帧、FFmpeg/ffprobe、现有 AssetClient 和固定资产管线。

**Spec:** 本文件第 1–6 节是本轮提交审核的交互、分镜与制作规格；第 7–9 节是对应实施任务与验收方法。需求由本轮“先做计划我审核一下”统一提交评审，不预先视为已批准。

## Global Constraints

- 覆盖当前选船目录全部 15 艘舰，以 dd-1 至 cv-3 的稳定 ID 关联素材，显示名称取当前目录。
- 本次只产生计划。正式功能、视频和实际浏览器效果在审核后制作。
- 演示遵循当前真实规则、射向、伤害、可见性和回合时点；不添加演示专用 Buff/Debuff。
- 源舰配置来自 src/ship-definitions.ts；结果来自 src/engine.ts，不手写另一套战斗计算。
- 首选 WebM/VP9，兼容版 MP4/H.264，WebP 封面；768×960、4:5、30 fps、无音轨。
- 默认进入选船页显示立绘；当前选船页内切船保留演示开关，离开该页后重置。
- 正常循环播放，保留暂停、重播和放大操作；减少动态效果偏好下先展示封面，允许手动播放。
- 关闭演示时不挂视频 src，不预取十五条视频；离屏和后台暂停，销毁时释放播放资源。
- 立绘蒙版、边缘虚化和原有素材信息继续用于立绘；视频区域不使用立绘虚化蒙版。
- 视频进入现有资产清单，使用本地文件或既有对象存储解析；普通 build 只校验和复制，不现场渲染或转码。
- 保留普通选船、联机选禁、确认和网络 revision 行为；演示操作不发送对局操作。
- 版本按 AGENTS.md 每批只推进一次，记录已执行的版本动作，修补和重试不重复递增；不因此变更存档键或访问配置。

## Review Focus

- 快速切换舰船、关闭开关或离开页面后，晚到的解析/播放请求不能显示旧舰视频；Task 4 验证。
- 签名过期、HTTP 200 坏视频、解码不支持和浏览器阻止自动播放需要分开处理；Task 3、4、5 验证。
- 显示帧、字幕与回合标签必须同源，烟幕、雷达和整备不能在剪辑中变成同轮效果；Task 1、2、5 验证。
- 缩小到手机半栏或套用立绘蒙版时，射程格、伤害数字和控制按钮可能不可读；Task 4、5 验证。
- 舰船数值、引擎规则或立绘模型变更后，旧动画不能静默继续发布；Task 3、5 验证指纹和缺失资源。

## 1. 交互方案

### 1.1 开关与布局

在现有 figure.ship-portrait 右上角放置带文字“能力演示”的小开关。开关处于立绘和视频的共同外层，始终可点，不放进 portrait-visual 蒙版内。

关闭时显示当前舰船原立绘。打开时，原位置切换为能力视频，先显示封面或加载状态，准备就绪后静音播放。切换到另一艘船时沿用开关状态，并从新船演示的开头播放。

播放器底部提供暂停/继续、重播和放大。放大使用应用内对话框，不依赖手机浏览器强制视频全屏；对话框与内嵌区域使用同一个播放器实例，不同时解码两份视频，关闭后保留当前进度。

详情文字、已有编队和确认按钮保持原位置与职责。等待对手操作、舰船已被禁用或阵容已满时仍可浏览演示；开关不会添加、移除、禁用或确认舰船。

### 1.2 播放状态

状态分为：立绘、加载中、可播放、播放中、暂停、回退说明。播放器实际播放与“用户希望播放”分开记录，避免滚回页面时擅自恢复用户手动暂停的视频。

普通模式下末尾至少保留 1.5 秒结果停留，然后循环。关闭开关、切船和卸载时停止旧视频并清理 src；页面后台或媒体区域离屏时暂停，重新可见时仅恢复原本正在播放的内容。

自动播放被浏览器拒绝时显示“点击播放”，不将其误判为素材损坏。当前视频确实无法加载时，在有限回退后显示封面、能力简述和重试按钮；开关始终可以关闭。

开关支持键盘与可访问名称，暂停/重播按钮有明确标签；手机触控区域至少 44×44 CSS 像素。减少动态效果时先显示封面，手动播放只播一遍，不自动循环。

### 1.3 小屏阅读

视频使用 object-fit:contain，不裁掉边缘射程格。沿用原立绘媒体区域的总体尺寸，手机内嵌区域主要预览动作，通过“放大”查看格线与数字，不要求在很窄的半栏里读完整分镜。

能力名称、阶段字幕和回合标签由 HTML 覆盖层显示，最小正文 12 CSS 像素；较长条件放在播放器下方简述，不全部烘焙成小字。视频内的受击数字保留清晰、大字号的实战表现。

## 2. 统一画面语言

使用现有海面、六角格、舰船角色、飞机和水雷资源。镜头为稳定的斜俯视，围绕 7–11 格宽的小战场构图；地图规模依镜头需要调整，规则尺度不变。

友方使用现有友军色，敌方使用现有敌军色，关键范围与路径用高对比轮廓辅助区分。保留血条、必要的数值和回合编号，隐藏与演示无关的完整战斗 HUD。

每条动画先说明局面，再展示行动和结果，最后停留总结。一般时长 10–14 秒，含多种效果的重巡或航母为 14–18 秒。固定时长是剪辑目标，不能通过省略生效轮次来硬凑时长。

规则上经过多轮的过程必须明确显示“第 1 回合”“第 2 回合”或“快进至再次就绪”。同一视频包含两次独立对比实验时使用“示例 A / 示例 B”切换，避免把场景重置误看成自动回血、回弹药。

伤害数字来自战斗解析结果。只有真的沉没或被击落才播放消失/沉没效果；一次 40 伤害的水雷命中不能表现成正常满血巡洋舰被直接消灭。

## 3. 十五艘舰船分镜

下面的伤害均指目标没有额外减伤、护航、状态和其他同期伤害时的对应事件伤害。制作时通过场景和日志隔离事件，而不是修改被演示舰的属性。

### 3.1 驱逐舰

| ID 与舰船 | 时长 | 分镜编排 | 必须讲清的规则 |
|---|---:|---|---|
| dd-1 Z35 | 12 秒 | 0–2 秒显示前进路线和 6 枚库存；2–5 秒完成两次前进，在各步起点留下两枚灰色水雷；5–6 秒切到下一轮，水雷武装；6–10 秒敌方巡洋舰踏入其中一格，受到 40 伤害；10–12 秒定格结果 | 每轮最多 2 枚，总库存 6；完成前进后布在身后；下一轮武装。踩雷对象必须没有接触排雷能力 |
| dd-2 岛风 | 10 秒 | 0–2 秒标出舰首、舰尾和四个合法侧向；2–5 秒在同一发射窗口向四个不同侧向各发一枚；5–8 秒鱼雷沿各自直线前进，命中目标显示 40；8–10 秒显示库存 8→4 | 同一窗口最多 4 个不同侧向，每轮最多 4 枚；不能演成四枚同向齐射或舰首发射 |
| dd-3 阿卡司塔 | 14 秒 | 0–3 秒烟幕覆盖自身与周围六格；3–6 秒标明“敌方视角”，原可见舰变为不可见；6–9 秒下一轮仍有烟幕，敌舰邻接后重新发现目标；9–12 秒第三轮烟幕消失；12–14 秒停留条件说明 | 2 次烟幕，持续本轮和下一轮；区内舰视野 1；同轮不能发射鱼雷；邻接或雷达仍可发现，坐标盲射仍可命中 |

Z35 使用敌方巡洋舰作为踩雷目标，因为现有驱逐具有接触排雷能力。库存、合法发射方向、武装回合和真实伤害必须由解析结果验证。

### 3.2 轻巡洋舰

| ID 与舰船 | 时长 | 分镜编排 | 必须讲清的规则 |
|---|---:|---|---|
| cl-1 圣地亚哥 | 10 秒 | 0–2 秒亮起 3 格外圈和 1 格内圈；2–5 秒一架 2 HP 敌机进入外圈扣 1；5–8 秒进入内圈再扣 1，在投弹前被击落；8–10 秒定格双层防空 | 外圈 1、内圈额外 1；每层对每架飞机每轮各一次，不是站在圈内持续扣血 |
| cl-2 克利夫兰 | 10 秒 | 0–2 秒两艘敌舰位于 3 格射程内；2–6 秒副炮分别向两舰开火，各扣 12；6–10 秒突出两个独立命中结果 | 每轮最多两个不同目标，每目标 12；不能对同一目标重复打两次来冒充双目标能力 |
| cl-3 海伦娜 | 14 秒 | 0–3 秒选定 6 格内的扫描中心，标出七格区域；3–6 秒揭示岛后烟幕中的敌舰；6–10 秒下一轮扫描仍在，友军可利用已获得的情报下令攻击；10–12 秒第三轮扫描结束；12–14 秒显示次数 3→2 | 扫描的是目标周围七格，不是半径 6 的整片海域；穿透烟幕与岛屿；占用本轮全部副炮，持续两轮 |

阿卡司塔和海伦娜的可见性镜头使用真实队伍观察结果；不能在战斗规则没有揭示目标时，靠字幕或淡化剪影泄露其仍被看见。

### 3.3 重巡洋舰

| ID 与舰船 | 时长 | 分镜编排 | 必须讲清的规则 |
|---|---:|---|---|
| ca-1 欧根亲王 | 16 秒 | 0–6 秒展示驻守：自己保持位置和舰首，敌舰进入邻接海域后停下；6–7 秒切换到减伤示例；7–13 秒展示普通 45 伤害鱼雷命中仅扣 18、60 伤害主炮命中仅扣 42；13–16 秒定格范围和两种减伤 | 放弃移动及转向；拦停邻接敌舰；自身鱼雷减伤 60%，主炮与副炮减伤 30% |
| ca-2 巴尔的摩 | 14 秒 | 0–3 秒护航移动一步，邻接友舰亮起保护轮廓；3–8 秒同一类 60 伤害炮击命中友舰扣 42、命中自己扣 60；8–12 秒另一段展示友舰承受 25 伤害炸弹实际扣 18；12–14 秒停留说明 | 护航时最多一步；保护邻接的其他友舰；只减主炮和航空炸弹伤害 30%，不保护自己，也不叠加 |
| ca-3 旧金山 | 12 秒 | 0–6 秒示例 A 实际完成两次前进，移动结束后向同一目标打出 2×16；6–10 秒示例 B 只有一次前进并原地调整，结算只打 1×16；10–12 秒并列结果 32 / 16 | 看实际完成的前进次数；转向、等待和未完成的计划步数不算；副炮在移动结束后结算 |

欧根与巴尔的摩要使用独立对照场景，排除另一个减伤来源。护航下 25 点炸弹得到 18 是当前引擎逐事件四舍五入的结果，字幕不能写成 17 或 17.5。

### 3.4 战列舰

| ID 与舰船 | 时长 | 分镜编排 | 必须讲清的规则 |
|---|---:|---|---|
| bb-1 北卡罗来纳 | 12 秒 | 0–2 秒展示 9 格射程与三发弹药指示；2–6 秒三发主炮落在静止靶舰所在格，分别为 60、合计 180；6–10 秒第 2 回合装填，第 3 回合再次就绪；10–12 秒停留 | 3×60，射程 9，额外装填 1 回合；全部命中是该静止靶场的结果，不代表对移动目标必定命中 |
| bb-2 武藏 | 12 秒 | 0–2 秒标出中心和六个相邻格；2–5 秒发射一枚炮弹；5–9 秒中心敌舰扣 120、邻格敌舰扣 60，同时一艘邻格友舰也扣 60；9–12 秒定格七格范围 | 一发覆盖七格，中心双倍；保留友伤；射程 9、额外装填 1 回合 |
| bb-3 黎塞留 | 10 秒 | 0–2 秒显示 7 格射程与两发指示；2–5 秒第 1 回合发射 2×40；5–8 秒第 2 回合再次发射 2×40；8–10 秒停留连续开火结果 | 射程 7，额外装填 0，连续两轮都能开火；不能剪成一个回合打出四发 |

武藏只需要在中心、敌方邻格和友方邻格放置三艘靶舰，另外四格用范围高亮表达，避免七艘船和数字挤满画面。总覆盖范围仍须由六角几何验证为七格。

### 3.5 航空母舰

| ID 与舰船 | 时长 | 分镜编排 | 必须讲清的规则 |
|---|---:|---|---|
| cv-1 企业 | 18 秒 | 0–3 秒显示 4 架强袭机库存并放飞 2 架；3–8 秒聚焦其中一架，以 3 HP 在同一轮内穿过两层各 1 点的防空后仍存活并投下 35 伤害炸弹；8–13 秒返航回收；13–16 秒带回合标签快进整备 2 轮至可再次出动；16–18 秒停留 | 强袭机 3 HP、航速 5、视野 3、出航航程 12、伤害 35；每轮最多放飞 2 架；返航与整备是不同过程 |
| cv-2 埃塞克斯 | 18 秒 | 0–3 秒显示 4 架战斗机＋2 架轰炸机，先放飞一战斗一轰炸；3–7 秒战斗机巡逻拦截敌机，造成 2 点空战伤害；7–12 秒轰炸机命中舰艇造成 25；12–16 秒返航和整备提示；16–18 秒分工总结 | 战斗机用于巡逻空战，不炸船；轰炸机承担对舰输出；每轮放飞上限是全舰合计 2 架 |
| cv-3 香格里拉 | 16 秒 | 0–3 秒显示 2 架侦察机＋4 架轰炸机并先放飞侦察机；3–7 秒侦察机深入远处，揭开 5 格视野；7–8 秒明确切入下一轮；8–13 秒轰炸机获得目标后出击，命中造成 25；13–16 秒总结侦察与攻击分工 | 侦察机 1 HP、航速 8、出航航程 16、视野 5、无炸弹；发现目标后才能在后续规划中新增锁定攻击指令 |

每个机位必须引用 planeForSlot 的实际配置。舰载机不凭空增殖，空战伤害只在真实相遇和射程内触发；整备、机库修复和再次放飞按已有回合结算。不能只看 carrier.plane 的第一种飞机来给混合机队配数值。

## 4. 输出格式与资源管理

| 方案 | 优点与成本 | 本次选择 |
|---|---|---|
| 预渲染 WebM＋MP4 | 选船时只解码视频，镜头稳定，能暂停；规则或素材变更时需要重新导出 | 推荐 |
| 实时运行小战场 | 数值直接跟随规则，后续可以增加操作；选船页需要加载和维护另一套战场渲染与生命周期 | 本期不选 |
| GIF | 作为图片展示直接；同等战术细节下压缩与播放控制不如视频方案方便 | 如后续需要分享动图再导出 |

采用 WebM/VP9 主版本、MP4/H.264 兼容版本和 WebP 封面。视频比 GIF 更适合这里的暂停、重播和体积控制；多媒体格式支持和回退以实际浏览器验证为准。[视频替代 GIF 的依据](https://web.dev/articles/replace-gifs-with-videos)，[HTML video 的来源、封面及内嵌播放能力](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video)

首版统一 768×960、30 fps、无音轨、深色不透明海面背景。MP4 使用 yuv420p 和 faststart，WebM 使用 VP9。WebM 每条目标不超过 2 MiB，MP4 每条目标不超过 3 MiB；单条任一格式超过 4 MiB 时必须重新优化镜头噪声或编码，不能通过压糊格线和数字达标。

制作源放在 assets/ability-demos/<shipId>/，每舰包含 demo.webm、demo.mp4、poster.webp 和证据记录；统一 manifest.json 记录时长、尺寸、字幕时间线和指纹。发布时注册到现有 assets/runtime 管线，用带内容哈希的路径缓存。

运行清单增加 abilityDemos 元数据，媒体仍使用现有 files 索引与 AssetClient。视频 MIME 分别为 video/webm 和 video/mp4，封面为 image/webp；沿用已有本地和对象存储访问方式。

格式与网络回退顺序：支持的首选格式远端 → 同格式本地 → 支持的兼容格式远端 → 同格式本地 → 封面与说明。相同地址不重复重试；本地模式跳过远端。已知不支持的编码直接跳过，播放许可被拒绝则进入等待点击状态，不触发格式或网络回退。

正常选船只加载当前打开的那条演示；不会同时下载 WebM 和 MP4，也不因扫过舰船列表而加载全部视频。签名在播放中失效或返回坏数据时同样允许切到同版本本地文件。

## 5. 制作流程与一致性

制作流程为：真实配置 → 固定场景和指令 → 战斗解析与断言 → 真实回放帧 → 固定镜头采帧 → 双格式编码 → 媒体与关键帧校验 → 固定资源登记。

场景使用现有 createCatalogShip、validPlan、resolveRound 和 mission 结束策略，不接真实存档、联机房间或 AI 服务。允许安排靶舰、设置初始机位与初始场景，但被演示舰使用完整真实配置，不通过更改伤害、射程、冷却或额外挂状态来得到想要的画面。

复用 Board、Units、Effects、TacticalModels、现有角色资源和 sampleBattleVisuals。通过离线渲染入口驱动，不让选船页面加载这一套作者工具。

离线采帧以 frameIndex / 30 计算时间；海面时钟、角色动作、弹道、帧插值和字幕统一由显式时间驱动。资源加载完成后才开始采帧，不用“录制若干秒屏幕”的墙钟方案决定视频内容。字体、角色和战术模型加载失败时导出失败，不能把加载占位符烘焙进最终视频。

先制作武藏、阿卡司塔、埃塞克斯三个样片，分别校准范围效果、迷雾视角和航空动作。按同一规范完成其余十二条，这个内部样片步骤不新增一轮用户批准要求。

指纹包含该分镜使用的舰艇与飞机配置、规则依赖、场景/时间线版本、渲染依赖及相关美术内容哈希。依赖包括作为靶舰或对照单位的配置。应用版本号和普通文档改动不进入指纹。

规则或数值变更后重新跑证据检查和受影响视频导出；相关渲染/美术变更后重新导出对应视频。普通启动和构建只校验已有输出。过期或缺失输出应给出需要重生成的舰船 ID 并使发布校验失败。

新资源清单尚未生成时，不能出现“必须先有演示视频才能启动用于生成演示的离线页面”的循环依赖。作者工具使用仓库已有的固定基础资产并固定从本地加载，直接启动 Vite 作者入口，不运行包含发布校验的 npm run dev；演示制作完成后再发布扩展清单。尚无演示来源清单的作者夹具可以按既有方式生成基础资产。

## 6. 文件职责与接口

| 文件 | 职责 |
|---|---|
| shared/ability-demo.ts | 演示元数据、字幕、案例与编译结果类型 |
| src/ability-demos/authoring/{dd,cl,ca,bb,cv}.ts | 五组真实场景与固定指令，每组覆盖三个舰船 ID |
| src/ability-demos/authoring/index.ts | buildAbilityDemo(shipId: string): AbilityDemoSpec，验证 ID 并汇总分镜 |
| src/ability-demos/authoring/compile.ts | compileAbilityDemo(spec: AbilityDemoSpec): CompiledAbilityDemo，运行真实回合与语义断言 |
| src/ability-demos/authoring/render.ts | createAbilityDemoRenderer(host: HTMLElement)，复用场景组件，提供 load、seekFrame、dispose |
| tools/ship-ability-demos.html、tools/ship-ability-demos.ts | 仅开发环境加载的离线渲染入口 |
| scripts/render-ability-demos.mjs | 显式启动本地作者页、采帧、转码、原子写入输出 |
| scripts/ability-demo-manifest.mjs | calculateAbilityDemoFingerprints(root)、validateAbilityDemoOutputs(root)，支持生成前计划和输出校验 |
| assets/ability-demos/manifest.json 与各舰目录 | 预渲染作者输出与语义证据 |
| shared/assets.ts、scripts/runtime-assets.mjs、scripts/generate-assets.mjs | 扩展清单、登记媒体类型与相关指纹，校验并发布固定输出 |
| src/ability-demos/catalog.ts | getAbilityDemo(shipId: string): AbilityDemoMedia\|null，仅读取已发布清单 |
| src/composables/use-ability-demo.ts | useAbilityDemo(shipId: Ref<string>, enabled: Ref<boolean>)，管理源选择、播放意图和有限回退 |
| src/components/ShipAbilityDemo.vue | video、封面、字幕、控制按钮与放大视图 |
| src/FleetSelection.vue、src/fleet-selection.css | 右上角开关、原位置切换、立绘/视频分支布局 |
| tests/ability-demo-*.test.ts、tests/ui-ability-demo.test.ts | 规则证据、资产一致性、播放器及选船回归 |
| docs/art/SHIP-ABILITY-DEMOS.md | 审核通过后建立的重生成与验收操作说明 |

约定类型：AbilityDemoCue 包含 startMs、endMs、text、可选 roundLabel；AbilityDemoCase 包含 id、initialGame、plansByRound、每轮在视频中的起止时间及 viewerTeam（队伍编号或明确标识的总览）；AbilityDemoSpec 包含 shipId、revision、durationMs、width、height、fps、cases、cues。

CompiledAbilityDemo 保留原 spec、每个案例的 RoundResult 数组及基于结果生成的 evidence。evidence.values 为 Record<string, number | boolean | string | number[] | string[]>，按稳定的语义键记录对应结果。AbilityDemoMedia 包含 shipId、fingerprint、durationMs、width、height、fps、posterAssetId、webmAssetId、mp4AssetId、cues。

createAbilityDemoRenderer 返回 load(demo: CompiledAbilityDemo): Promise<void>、seekFrame(index: number): Promise<void>、dispose(): void；seekFrame 完成后该帧所有异步资源已就绪，便于精确截图。

useAbilityDemo 返回 media、source、phase、playing、canPlay、loadError 和 play、pause、restart、onMediaError、setVisible、dispose；内部采用请求世代标识丢弃切船前的异步结果。组件只把这些方法接到媒体事件和交互，不自行重做资源回退。

## 7. 实施任务

### Task 1 生成十五套真实战斗案例和时间线

**Files:** 新增 shared/ability-demo.ts、src/ability-demos/authoring 五组案例、index.ts、compile.ts；新增 tests/ability-demo-scenarios.test.ts。

**Interfaces:** 消费现有舰船配置、validPlan 和 resolveRound；产出 buildAbilityDemo、compileAbilityDemo、CompiledAbilityDemo，供 Task 2 使用。

- [ ] 先编写覆盖全部目录 ID 的案例测试，断言案例不写真实存档、不添加状态、不修改被演示舰的真实配置。
- [ ] 为每条演示添加结果断言：Z35 下一轮武装与 40 伤害；岛风四个不同合法侧向；烟幕显隐与到期；防空 1＋1；双目标各 12；雷达七格与副炮互斥；驻守 45→18、60→42；护航 60→42、25→18、自己不减伤；突击副炮 32/16；三种主炮；三种航母的机位与对应结果。
- [ ] 增加反例：驱逐接触排雷不受上述 40 伤害、护航不减鱼雷、不允许四枚同向雷、原地转向不增加突击副炮前进次数、侦察机不造成炸弹伤害。
- [ ] 执行 npx vitest run tests/ability-demo-scenarios.test.ts，确认缺少案例/编译器时失败，再实现并使其通过。
- [ ] 检查每段跨回合效果都有明确时间线，每个独立重置都有案例切换标签；编译同一场景两次，证据和回放结果一致。

关键断言示意（后续任务读取同一 evidence.values，不重算伤害）：

    const guard = compileAbilityDemo(buildAbilityDemo('ca-1')).evidence.values;
    const escort = compileAbilityDemo(buildAbilityDemo('ca-2')).evidence.values;
    const sf = compileAbilityDemo(buildAbilityDemo('ca-3')).evidence.values;
    assert.equal(guard.torpedoDamage, 18);
    assert.equal(escort.bombDamage, 18);
    assert.equal(sf.fullAdvanceDamage, 32);
    assert.equal(sf.partialAdvanceDamage, 16);

### Task 2 离线渲染与三条样片

**Files:** 新增 authoring/render.ts、tools/ship-ability-demos.html、tools/ship-ability-demos.ts、scripts/render-ability-demos.mjs；按需要为 Units/Effects 的显式时钟和资源就绪增加窄接口；新增 tests/ability-demo-render.test.ts。

**Interfaces:** 消费 Task 1 的 CompiledAbilityDemo；产出 createAbilityDemoRenderer 以及 WebM、MP4、WebP 文件。作者页暴露 window.abilityDemoAuthoring.load(shipId)、seekFrame(index)、describe()、dispose()，供导出脚本调用。

- [ ] 为固定时间采样、首尾帧、缺失资源和 dispose 编写测试，先确认失败，再实现作者渲染入口。
- [ ] 固定海面与角色动画时间，关闭自由相机控制，复用现有弹道采样；不改变正式战斗的默认动画时钟。
- [ ] 实现显式导出命令 npm run demos:render -- --ship bb-2，以及 --all；命令创建自己拥有的临时服务与浏览器，结束时仅关闭自己创建的进程。
- [ ] 先生成武藏、阿卡司塔、埃塞克斯样片。以 ffprobe 检查编码、尺寸、30 fps、时长误差不超过 1 帧、没有音轨。
- [ ] 抽取开始、施放、命中、生效变化、结果五类关键帧检查；整条播放检查镜头、读数、真实可见性和回合衔接。
- [ ] 导出写入临时目录，全部成功后替换该舰输出；中断或转码失败不得破坏旧的可用素材。

### Task 3 固定资产、规则指纹与剩余十二条

**Files:** 新增 scripts/ability-demo-manifest.mjs、assets/ability-demos；修改 shared/assets.ts、scripts/runtime-assets.mjs、scripts/generate-assets.mjs、package.json；新增 tests/ability-demo-assets.test.ts，扩展现有 runtime-assets 和资产同步相关测试。

**Interfaces:** 消费样片输出和 Task 1 证据；产出 AbilityDemoMedia 清单及已有 AssetClient 可解析的资产 ID。资产 ID 统一为 ability-demo/<shipId>/webm、/mp4、/poster。

- [ ] 编写缺失文件、错误 MIME、配置变更、靶舰配置变更、渲染资源变更和无关版本号变更的指纹测试；前五类正确要求重生成，无关版本号变更保持有效。
- [ ] 实现 calculateAbilityDemoFingerprints、validateAbilityDemoOutputs 和 npm run demos:check；仅校验，不隐式安装浏览器、转码或渲染。
- [ ] 将 demo 媒体登记入 files 与 abilityDemos；旧作者夹具没有演示来源时仍可生成基础资产，有演示来源的正式发布必须覆盖当前十五舰。
- [ ] 按同一规则完成其余十二条并进行语义和关键帧检查，输出全部十五条证据记录。
- [ ] 运行 npm run assets:generate 与 npm run demos:check；验证正常 assets:prepare 只检查和复制，重复执行不改写源视频。
- [ ] 检查本地静态服务和本机对象存储模拟服务的 Content-Type、Range/206 与签名 URL 回退；保留既有 assets:sync 手动发布流程。

### Task 4 接入选船界面与播放器

**Files:** 新增 src/ability-demos/catalog.ts、src/composables/use-ability-demo.ts、src/components/ShipAbilityDemo.vue；修改 src/FleetSelection.vue、src/fleet-selection.css；新增 tests/ui-ability-demo.test.ts，扩展 tests/ui-fleet-selection.test.ts 和归因布局相关测试。

**Interfaces:** 消费 Task 3 的 AbilityDemoMedia 和现有 assetClient；产出右上角开关、视频面板与有限回退。只使用本地组件状态，不向 FleetSelection 新增网络提交事件。

- [ ] 先测试默认只有立绘、没有 video src 和视频解析请求；打开后只请求当前舰首选格式；切船保持开启并从头播放；关闭后清理旧媒体。
- [ ] 测试切船请求乱序、等待对手/已禁用仍能浏览，以及播放操作没有触发 change/action/confirm/complete。
- [ ] 测试远端 403、200 坏媒体、编码不支持、备用格式失败和 play() 的 NotAllowedError；验证有限回退与“点击播放”是不同状态。
- [ ] 测试手动暂停、离屏暂停、后台恢复、减少动态效果、放大/缩回共用一个播放器；卸载后无待播放任务和遗留监听。
- [ ] 接入 figure.ship-portrait 共同外层开关；视频与 portrait-visual 作为互斥分支，保留当前立绘比例、边缘效果和已有素材信息。
- [ ] 运行 npx vitest run tests/ui-ability-demo.test.ts tests/ui-fleet-selection.test.ts tests/fleet-portrait-attribution.test.ts，确认全部通过。

### Task 5 完整验收与制作文档

**Files:** 新增 docs/art/SHIP-ABILITY-DEMOS.md；按实际实现更新 docs/ASSET-STORAGE.md 和本计划的执行记录；版本记录使用既有脚本与忽略任务状态文件。

**Interfaces:** 消费前四个任务的成品，不新增另一套播放器或分镜规则。

- [ ] 跑十五场语义测试及相关资产、UI 回归，再运行 npm run typecheck 与 npm run build；构建不执行视频生成。
- [ ] 在桌面 Chromium、Firefox 和 Safari 验证实际播放与格式选择；iOS Safari 条件允许时实机验证，桌面 WebKit 或触屏模拟不能冒充 iOS 实机结论。
- [ ] 检查桌面宽屏与 390px 小屏，连续切换十五艘并操作暂停/放大；观察无横向溢出、无立绘虚化裁切视频、无旧舰视频闪现。
- [ ] 检查首次进入选船零视频下载、一次只播放当前视频、关闭/后台后停止播放、无无界资源重试。
- [ ] 真实网络抽样覆盖根路径与现有子路径部署，远端失败回退到同版本地文件，视频 Range 请求与 seek/replay 可用。
- [ ] 审阅十五条完整视频和关键帧联系图，逐项对照第 3 节；记录因镜头可读性作出的时长调整，伤害与时点不能随剪辑调整。
- [ ] 记录当前批次是否已推进版本，按 AGENTS.md 只执行本批的一次版本动作；不因重复编码或验证再次加版本。没有另行授权时不执行服务器发布。

## 8. 当前只读核查结果

选船共用 FleetSelection.vue，覆盖本地与在线流程。当前立绘在 portrait-visual 内使用比例适配和边缘虚化，开关与视频需要放在该蒙版外层。

已核对十五舰配置、能力文案、实际驻守/护航取整、武装时点、双层防空、突击副炮和机位配置。现有能力文字可复用，但固定视频仍需要结果证据，不能只把文字数值贴在独立制作的效果上。

项目已有 Playwright、Three.js、固定资产作者/生成流程；本机检测到 ffmpeg、ffprobe，以及 libvpx-vp9、libx264 编码器。尚未渲染样片，因此体积目标、最终可读性和浏览器播放兼容性属于实施验收。

## 9. 审核重点

本轮主要确认三个决定：右上角开关在立绘与演示之间切换；采用静音循环的真实战术小场景；十五舰按第 3 节分镜突出各自能力，并显示必要的限制条件。

审核通过后依次执行真实场景验证、三条样片、其余十二条、资源接入与选船 UI 验收。本次不制作视频、不新增产品组件、不启动部署。

## 10. 全量实施（用户已在三支样片后批准，2026-10-15）

当前已有三支样片及通用录制器；本轮补齐其余十二艘并完成原方案的资源与选船接入。按现有工作区最新资源实现，保留其他任务的未提交修改。本批版本基线 v0.7.10，完成时仅递增一次。

1. 扩展十五舰真实场景与语义验证，增加明确标识的独立对比案例、行动前快照；补上鱼雷、水雷和岛屿的实际渲染。
2. 将十五组 WebM/MP4/封面登记到现有 AssetClient 的 files/abilityDemos；生成/校验管线支持作者模式，避免预渲染与发布校验循环；指纹排除自身生成的视频。
3. 增加独立媒体组件，右上角开关默认关闭；单舰按需解析，切舰保持开关并从头播放，有限格式/本地回退，暂停/重播/放大，后台与离屏暂停，减少动态效果时手动播放。保持选船与网络事件不变。
4. 一次生成全部十五条，更新固定资产，验证正式构建与本地/子路径服务的媒体MIME/Range，桌面与390px实测所有切舰和媒体生命周期。
5. 以专项测试、全量测试、类型检查、构建、真实视频/关键帧和一次独立只读审查完成验收。不进行服务器发布。

实施适配：为避免移动端立绘容器的层叠上下文被详情文字遮挡，开关放在 ship-detail 的共同父级内，以绝对定位保持媒体右上角的位置。放大仍使用同一播放器和原生 dialog。欧根、巴尔的摩按真实事件顺序连续演示本轮效果，旧金山使用明确标记的独立对照；Z35 的踩雷靶为没有接触排雷能力的航母。
