# 碧蓝推演棋 / azurlane chess v0.8.3

Vue 3 单文件组件 + TypeScript + Pinia + Vite + Three.js 3D 战棋网页游戏，支持离线游玩和 Node.js 25 联机服务。 A playable PvAI prototype with home menu, fleet selection, deployment, untimed planning, simultaneous resolution, two-layer RTS fog, contextual ranges, all-friendly plan visibility, local persistence, and illustrated/action-gated tutorials.

联机服务：`npm ci && npm run build && npm start`，访问 http://127.0.0.1:3000。好友房、随机 1v1 匹配及 OpenAI 兼容 API AI 配置见 [部署说明](docs/ONLINE.md)。

在线 AI 支持普通模式与 **FULL 模式**：从新游戏页的模型卡片进入编队后选择，普通模式只发送当前局面；FULL 每回合额外发送本局全部已完成回合中 AI 当时可见的战况和本方指令，供对应模型参考。历史按原有视野过滤，开局后模式固定，重试与重连保留本局历史；FULL 可能增加请求用量。游客可直接使用。执行回合后若 AI 尚未回答，会显示“模型名称正在思考”与三个跳动点的小弹窗，收到有效回答后自动关闭。

账号功能默认停用，顶部登录、注册入口置灰并显示“暂未开放”，所有游戏模式仍支持游客。部署者设置 `AUTH_ENABLED=true` 并重启服务即可启用，无需重新构建；HTTPS 保持默认 `AUTH_COOKIE_SECURE=true`，本地 HTTP 验收显式设为 `false`。注册只需用户名、密码和确认密码，密码仅要求非空且确认一致，不设格式要求，也不提供密码找回；注册成功后自动登录，会话 Cookie 有效期为 30 天。

登录玩家可查看随机 PvP、好友房和在线 AI 的个人战绩与双方逐舰统计。账号归属在创建对局时固定；身处房间、匹配队列或对局时，需先退出当前流程再切换账号。单机战绩不上传，不提供排名。账号、会话和已结束战绩存于私有 SQLite 文件，默认位置为 `data/accounts.sqlite`（可用 `AUTH_DB_PATH` 配置，默认停用时不创建）。进行中的战局仍只在内存中。启用、接口、统计和停服备份说明见 [账号与个人战绩](docs/ONLINE.md#可选账号与个人战绩)。

海面与岛屿模型库、数字样式及 Blender 导出说明见 [美术说明](docs/art/SEA-ISLANDS.md)。

战斗机、轰炸机、侦察机和强袭机采用四套独立 Blender 模型，通过翼形、浮筒、发动机数量和尾翼区分。模型源文件、导出流程及开发预览见 [飞机与水雷模型](docs/art/TACTICAL-MODELS.md)。

页面采用 Vue Router 的 History 地址：`/new` 选择本地、服务器 AI、好友房或快速匹配；`/battle/local` 与 `/battle/online/:matchId` 分别恢复本地自动存档和服务器中的对局，`/saves` 管理本机存档，`/guide`、`/tutorial` 提供教程。顶部“连接服务器”打开连接卡片，保留当前页面；连接意愿按网站来源记忆，主动断开时先退出实际在线流程。界面图标由本地打包的 Font Awesome Free 提供。

界面采用“海图室”视觉：深海墨蓝、黄铜主操作和青色／珊瑚红战术信号。首页提供立绘与竖排菜单，战斗采用单行指挥栏、桌面三栏和手机底部指令抽屉；字体 Saira 与 JetBrains Mono 随应用本地打包。通用交互采用 shadcn-vue / Reka UI；本地 AI 和回合结算通过 Comlink Worker 执行，服务器结算使用复用线程的 Piscina。前端由 Vite 构建，Node 服务单独编译至 `dist-server/`，生产环境不依赖 TypeScript 源码执行。

## 美术资源存储

默认从本地发布包加载美术；可在后端私有配置中选择 OSS、S3／S3 兼容服务或 COS。临时 URL 在单服务进程内跨玩家复用，首次与过期访问并发合并；远端失败自动回退本地。小图、预览、Spine 缩略图及模型均保存为受版本管理的固定资源，日常构建仅校验和复制。舰娘名单由 `config/ship-assets.json` 配置；运行 `npm run assets:fetch` 仅补齐缺失资源，`npm run assets:check` 可离线校验，详见 [舰娘资源说明](docs/art/SHIP-ASSETS.md)。

全部 41 套 CDN 小人与原创默认水手统一使用原生 Spine 3.8.99，仅保留 Spine 3.8 运行时；不兼容版本会被拒绝。全部 41 张舰娘立绘、41 张头像及默认立绘均烘焙“请支持官方碧蓝航线喵～”水印，立绘最长边 1600px、WebP 质量 80、头像最大 256px；水印在 `portraits.watermark` 配置。立绘与小人使用独立增量指纹，修改水印不会重新下载 Spine。

使用 `npm run assets:sync` 将当前清单同步到桶，已一致的文件会跳过；加 `-- --dry-run` 可离线预览。配置、制作与上传流程见 [资源存储说明](docs/ASSET-STORAGE.md)。

## 三据点占领

新建本地、在线 AI、好友房或快速匹配时可选择「三据点占领」。默认仍为「舰队歼灭」；旧对局和旧存档保持原模式。好友房由房主设置，变更模式会清除双方准备状态；快速匹配只配对相同模式。

- 独立 21×17 六角地图，A/B/C 三圈半径均为 2 格，初始中立。生成目标为 34 格岛屿、8 枚公共水雷，保护部署区与开局航路，据点内保留可航海面。
- 存活舰体在回合最终位置独占圈内，两次有效结算完成占领。双方在圈内会暂停进度；空中立点清零；友舰轮换可接续，多舰不加速。伤害不清进度，烟幕内舰船照常参与。
- 已占点无人驻守也保留；双方争夺时暂停产分，敌方独占则中立化并获得 50% 进度。新占领点从下轮末开始每轮 +5 分。任何原因沉没一艘敌舰获得 +15 分，击落飞机不加分。
- 目标 100 分、上限 30 回合。全部伤害和碰撞回退结束后统一计分。仅一方全灭时另一方胜；双方同轮全灭按最终积分判胜。达标或回合耗尽时，依次比较积分、存活舰数、总耐久，全部相同则平局。
- 计分板显示比分、收益来源、公开占领状态与达标预测；回放跟随当前画面展示。预测假设当前据点状态保持，不包含未来击沉或换点。
- 本地存档保存完整模式与据点状态；联机重连恢复服务器状态。在线模式需要服务器通过 `/api/config.battleModes` 声明支持。

占点规则在 `shared/domination.ts`，地图生成在 `src/domination-map.ts`；详细设计见 [占领模式设计](docs/superpowers/specs/2026-10-14-domination-design.md)。首版数值仍需真人对局校准。

## 归航行动 · 连续教学战役

从主菜单进入「交互教学」，选择「开始归航行动」；独立入口为 `/tutorial/campaign`。

- 固定 13×72 海图，南向北十章、28 个检查点，从岛风单舰逐步增加到五舰；舰队歼灭使用 19×15 地图，占领模式使用 21×17 地图。
- 依次学习航行、迷雾、副炮、同步行动、鱼雷、排布雷、三种主炮、烟幕与雷达、三种重巡能力、四机型及防空，覆盖全部15艘舰的特色。
- 任务须以真实结算完成。分级提示可填入参考指令，由玩家检查和执行；完成后自动沿海图航渡至下一段，无需点击继续。存续舰船沿合法航路移位，新友舰先进入已有视野，再共享视野；靶舰从雾外驶入。每段以加粗高亮提示相关能力和数值，结束时解除；重试恢复本检查点，航渡整备恢复耐久与弹药。
- 前九章采用任务目标与训练敌舰，不受普通全灭判定和30回合限制；终章可自选3前排＋2后排并部署，敌舰使用60%初始耐久，恢复30回合限制，要求实际歼灭封锁舰队。
- 稳定规划与结算结果自动保存到独立本机记录，刷新或退出后可继续。计算/播放中刷新恢复最近稳定状态；不会覆盖普通对局存档。损坏记录保留并显示错误，重新开始须在教学页确认。
- 「全图」查看整条航道，「定位当前任务」回到任务区域。手机教学采用可滚动页面，保持海图可操作面积。
- 原有10个专项练习保留标准训练配置；当前15舰数值在舰船详情及作战手册查看。

首次学习时长目标为25–35分钟，仍需真人试玩校准。实现入口 `src/campaign/`，相关回归在 `tests/campaign*.test.ts` 与 `tests/ui-campaign.test.ts`。

## 独立历史战斗 · PvE

从主菜单进入「历史战斗」（`/history`），五场全部开放，可直接开始或继续；每场拥有独立进度和最佳星级，不要求按顺序游玩。

| 战斗 | 玩家舰队 | 核心任务 | 回合上限 |
| --- | --- | --- | --- |
| 拉普拉塔河口 | 3 艘英军巡洋舰 | 击沉斯佩，或迫使其撤退后连续两轮保持目视 | 14 |
| 第二次纳尔维克 | 厌战与 3 艘驱逐舰 | 保住厌战，击沉至少 4 艘敌舰并连续两轮独占港口 | 18 |
| 丹麦海峡 | 俾斯麦与欧根亲王 | 保住俾斯麦并突围撤离，或击沉全部拦截舰 | 12 |
| 中途岛 | 3 艘美军航母 | 击沉 3 艘日军航母并撤出至少 1 艘美舰，或击沉全部 4 艘日舰且有美舰存活或已撤离 | 18 |
| 萨马岛 | 3 艘驱逐舰，掩护 3 艘 AI 航母 | 至少 2 艘航母撤离，继续争取救出第三艘 | 16 |

- 使用固定特制地图、历史舰名与场景专用能力参数。简报展示舰队、目标、额外星级条件和史料；玩家决策可以改变结果。
- 海图始终标明公开撤离区、任务区和情报区。敌军依据自身视野与最近接触规划，不读取玩家指令。
- 萨马岛航母由 AI 操作，可选择中央航线、东侧绕行或等待一轮；航路可预览，不能连续两轮等待。
- 所有伤害与碰撞先结算，再判定撤离和任务。撤离的舰艇记录当时耐久；任务完成后显示星级、存活/撤离情况和历史经过。
- 规划及回合播放完成后自动保存。刷新恢复最近稳定状态，普通对局和教程存档独立保留；损坏记录显示错误并保留，确认重开后才替换。
- 深链接为 `/history/river-plate`、`/history/narvik`、`/history/denmark-strait`、`/history/midway`、`/history/samar`。历史战斗在本机计算，不需要连接服务器。

实现位于 `src/history/`，设计见 [五场历史战斗规范](docs/superpowers/specs/2026-10-15-independent-historical-battles-design.md)。已用真实引擎验证每场两条通关策略；难度和实际游玩时长仍需真人试玩校准。

## Local development

- `npm ci`
- `npm run dev`
- `npm run typecheck`
- `npm test`
- `npm run build`

The pure deterministic engine is `src/engine.ts`. Unit templates expose capabilities and numerical configuration. `role` is only used by the roster UI; battle rules never branch on ship template names. Ships, planes and torpedoes all have unit identifiers, positions and capability configuration. Seed and order sequence fully determine resolution.

## Controls

On PC, left click on a friendly ship selects it in every mode. Shift + left click targets its occupied cell with the current tool instead. Clicking other cells issues the selected movement or weapon order. Touch keeps its existing mode-based selection and targeting. Right click on the map undoes the selected ship’s latest plan edit. Left or middle drag pans; Shift + middle drag rotates; the wheel zooms. Dragging never issues an order, and right click never moves the camera. Sidebar supports all actions and touch. Q/E select a ±60° turn, Z selects straight; W appends forward movement, Space appends a wait/rotation. Backspace removes the last movement step. T/G/F/M choose torpedo/artillery/aircraft/minesweeping. 1–5 select ships, Enter resolves, Escape restores route mode.

## Mobile play

Landscape places the 3D sea beside a collapsible orders panel; portrait uses an expandable bottom panel. Tap to select or issue orders, drag to pan, and pinch or use the mouse wheel to zoom. On touch devices, toggle “触屏旋转” to orbit the camera; “全图” restores the default view and “定位当前舰” centers the selected ship. Ship name standees always face the camera, while their base arrows show world heading. Gestures never issue orders. Camera state is not part of saves.

## Explicit prototype edge conventions

- Plane HP is **2**; carrier hull HP is **210**.
- Annihilation map: 19×15 odd-row hexes, mirrored fixed island clusters, 8 public neutral mines, two guaranteed open rows and connected water. Deployment regions are bottom-left/top-right 3×3.
- Fixed 240 simulation substeps plus continuous swept-circle ship collision detection. Each unit stores its own circle radius; initial circles use the hex inradius minus 0.001 clearance so adjacent resting ships are legal. Simultaneous groups freeze each ship once at the shared contact instant. Unique hex ownership uses a stable cube-rounding epsilon.
- Start: simultaneous remote sweep, artillery/aircraft launches, then initial torpedoes. At each physics instant AA precedes damage and bombing; automatic secondary shots queue simultaneous damage.
- Each ship pair collides once per round; different later collision partners can inflict further damage. Rollback visits only completed cells on the actual traversed route. Priority alternates teams by round, then stable unit ID.
- Torpedo flight speed/damage/lifetime come from the firing unit capability data. Torpedoes arm after leaving the firing ship's occupied hex, can hit any ship including friendly units, stop at first hit/island, and expire after 3 accumulated flight rounds.
- Artillery can inflict friendly fire. All committed shells land even when the firing ship was sunk earlier in the round.
- Contact minesweeping takes priority over a same-cell mine trigger. Remote minesweeping costs all secondary shots, not artillery.
- Point-target planes fly the actual straight geometric segment, with occupied hexes determining contact, and return after reaching the endpoint, bombing, or using their cumulative outbound range. Ship-target planes ignore intermediate enemies, keep current-round lock across fog, fly toward the last frozen endpoint next round unless reacquired, return on reaching that endpoint without reacquisition, and return if their designated target sinks. Return follows the mother's current position, is outside the 12-hex outbound budget, and requires one full rearm round. A returning plane without a living mother is lost immediately, including artillery or grounding at round end.
- Both teams use the same visibility function. AI gets a filtered observation, public mines, discovered islands and its own units; it never receives unseen opposing ship positions. Its routing uses orientation-aware discovered-terrain BFS and local collision/weapon heuristics.
- Endgame: fleet count, then total hull HP; equality and simultaneous annihilation are draws. Aircraft are excluded from fleet count.

## Verification

`tests/engine.test.ts`: 21 mechanics/visibility/map invariants.
`tests/capabilities.test.ts`: seven per-unit torpedo/radius, resting adjacency, frozen-target return, carrier death cleanup, simultaneous-circle grouping, and straight-flight regressions.
`tests/regressions.test.ts`: normalized broadside validation and AA-before-collision regressions.
`tests/full-games.test.ts`: three full AI-vs-AI games, checking legal nonoverlapping end positions, finite values and correct round transitions through a terminal result.
`tests/ui.test.ts`: actual Vue component mounted in Happy DOM; selection duplicates, deployment, 285 map cells, hidden enemy filtering, movement/undo, torpedo planning, repeated main-gun targeting via ship marker, aircraft planning, full round execution and restart, including stale turn/window reset.

Numbers and AI behavior are an initial balance baseline, not a calibrated competitive ruleset.


## Planning, fog and persistence update

- New games initialize separate team exploration memory. Visibility is accumulated on every simulation substep and copied into each animation frame. Unknown cells hide terrain; remembered cells keep terrain without enemy ghosts. Public mines remain visible everywhere.
- `src/planning.ts` separates player-known terrain, heading-aware BFS, known-route preference, ranges and route/history edits. Main and aircraft ranges use round-start origins; secondary/AA guides use the planned endpoint. Plane budget uses the same Euclidean/√3 flight metric as simulation. Torpedo rays show fractional current-round travel from the selected node and full lifetime limits.
- All friendly routes, numbered steps/endpoints, torpedo windows/rays, stacked main target counts, aircraft routes and mine-sweep orders stay visible across ship selection. Opposing plans are never rendered. Range and plan layers can be hidden.
- Click a route node to keep it and remove later steps. Segment undo, current-ship undo/redo, movement-only redraw and full reset are distinct. Changed routes prune unreachable or illegal torpedo windows with feedback.
- Home menu opens new game, local load, illustrated guide, or 10 independent interactive lessons. The 8-section guide embeds 6 original SVG illustrations. All 32 teaching steps are gated by actual board actions; real simulation drives collisions, automatic secondary fire, fog retreat, artillery/reload, torpedoes, aircraft AA and mines.
- Autosave captures stable deployment/planning/round-result transitions, with three confirmed-overwrite manual slots. JSON export/import supports explicit cross-device backup. Snapshots preserve aircraft Infinity readiness, exploration and plan segments. Storage failures are surfaced, malformed imports do not overwrite slots or active battle, and legacy standalone tutorial saves are memory-only; the guided campaign uses its own persistent local record. Loading resets transient playback/history/targeting state. Local saves have no automatic cloud synchronization; optional server accounts record completed online matches separately.
- Save overlays block battle shortcuts, and animation skip is disabled until simulation results exist.

Verification additions: `fog-planning.test.ts` (12), `save.test.ts` (14), `tutorial.test.ts` (10 controlled fixtures), plus mounted Vue fog/edit, home/save/import, and all-lesson tutorial flows. The expanded aggregate is 73 tests, including three complete AI-vs-AI matches.
## 版本维护

使用 `vx.y.z`。每批完成的更改自动推进 z；x、y 由用户明确指定。
运行 `npm run version:next` 同步应用版本及页面标记，一批改动只运行一次；构建和发布重试不会重复递增。指定版本使用 `node scripts/bump-version.mjs --set x.y.z`。

## GitHub Pages

- 源码仓库：https://github.com/lowerbound123/azurlane-chess
- 游戏地址：https://lowerbound123.github.io/azurlane-chess/
- `main` 保存源码，`gh-pages` 保存静态构建产物；Pages 从 `gh-pages` 的根目录发布。
- 构建使用 `npm ci` 和 `npm run build:pages`，为资源设置 `/azurlane-chess/` 前缀。更新网站需将新 `dist/` 内容提交并推送到 `gh-pages`。
- 原站点存档可先导出 JSON，再在新站点导入；浏览器本地存档不会跨域自动共享。
- `SOURCE_MANIFEST.json` 是初始 v0.1.0 导出记录，当前版本以 package.json 与 Git 提交为准。


## v0.8.3 3D 海战场景

海战地图由 Three.js 渲染，包含立体岛屿、水雷、带姓名与血条的朝向镜头立牌、四机型独立飞机与鱼雷模型，以及主炮抛物线、副炮和防空轨迹。Vue 保留指令、菜单与存档界面。飞机和水雷使用本项目通过 Blender 制作并导出的固定 GLB 资产。

3D 高度只用于显示，六角坐标、碰撞、伤害与存档规则沿用原有引擎。未知地形和视野外敌方单位不进入场景；弹道按当前视野裁切。若设备不能建立 WebGL 画布，页面会显示重试与返回主菜单入口。

测试分为引擎/弹道/场景数学与 Vue 语义交互测试，以及真实浏览器中的 WebGL 点选、镜头与动画验证。Happy DOM 使用显式测试适配器，不承担 GPU 渲染验证。

选船界面按舰种展示每类 3 艘独立舰船，点击查看属性与立绘，再确认添加；人机与 PVP 均使用 3 前排＋2 后排。PVP 在匹配或房间准备后猜先，使用双方独立舰船池，禁用只影响对方，选定后不可撤回；双方完成选禁并确认后进入部署。选船与战场使用各舰娘的基础版立绘和 Spine 小人；原创默认水手作为资源失败回退。

### 独立舰船规则

新局采用15艘独立角色与能力，支持布雷、烟幕、雷达、护航、范围炮和混合机库。完整数值和边界见 [舰船规则](docs/FLEET-V1.md)。旧局保存原配置，新局使用存档格式2；联机协议2要求客户端刷新。

### 舰船能力演示

选船立绘区域右上角的“能力演示”开关可播放当前舰船的能力，覆盖全部十五舰，支持暂停、重播和放大。默认关闭，切舰保留开关，离开页面后重置；关闭时不加载视频。

运行 `npm run demos:render` 可复用现有战斗引擎、角色和特效模块重新生成 WebM、MP4 与封面；`npm run demos:check` 校验指纹、产物与正式资源登记。支持 `--ship bb-2` 单舰重录和 `--force` 强制重录。生成、资源发布和验证方法见 [舰船能力演示说明](docs/art/SHIP-ABILITY-DEMOS.md)。
