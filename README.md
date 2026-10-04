# 碧蓝推演棋 / azurlane chess v0.4.0

Vue 3 + Vite + Three.js，纯静态 3D 战棋网页游戏。 A playable PvAI prototype with home menu, fleet selection, deployment, untimed planning, simultaneous resolution, two-layer RTS fog, contextual ranges, all-friendly plan visibility, local persistence, and illustrated/action-gated tutorials.

## Local development

- `npm ci`
- `npm run dev`
- `npm test`
- `npm run build`

The pure deterministic engine is `src/engine.js`. Unit templates expose capabilities and numerical configuration. `role` is only used by the roster UI; battle rules never branch on ship template names. Ships, planes and torpedoes all have unit identifiers, positions and capability configuration. Seed and order sequence fully determine resolution.

## Controls

Left click selects a ship; right click appends a reachable route. Sidebar supports all actions and touch. Q/E select a ±60° turn, Z selects straight; W appends forward movement, Space appends a wait/rotation. Backspace removes the last movement step. T/G/F/M choose torpedo/artillery/aircraft/minesweeping. 1–5 select ships, Enter resolves, Escape restores route mode.

## Mobile play

Landscape places the 3D sea beside a collapsible orders panel; portrait uses an expandable bottom panel. Tap to select or issue orders, drag to pan, and pinch or use the mouse wheel to zoom. Toggle “旋转视角” to orbit the camera; “全图” restores the default view and “定位当前舰” centers the selected ship. Ship name standees always face the camera, while their base arrows show world heading. Gestures never issue orders. Camera state is not part of saves.

## Explicit prototype edge conventions

- Plane HP is **2**; carrier hull HP is **210**.
- Map: 19×15 odd-row hexes, mirrored fixed island clusters, 8 public neutral mines, two guaranteed open rows and connected water. Deployment regions are bottom-left/top-right 3×3.
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

`tests/engine.test.js`: 21 mechanics/visibility/map invariants.
`tests/capabilities.test.js`: seven per-unit torpedo/radius, resting adjacency, frozen-target return, carrier death cleanup, simultaneous-circle grouping, and straight-flight regressions.
`tests/regressions.test.js`: normalized broadside validation and AA-before-collision regressions.
`tests/full-games.test.js`: three full AI-vs-AI games, checking legal nonoverlapping end positions, finite values and correct round transitions through a terminal result.
`tests/ui.test.js`: actual Vue component mounted in Happy DOM; selection duplicates, deployment, 285 map cells, hidden enemy filtering, movement/undo, torpedo planning, repeated main-gun targeting via ship marker, aircraft planning, full round execution and restart, including stale turn/window reset.

Numbers and AI behavior are an initial balance baseline, not a calibrated competitive ruleset.


## Planning, fog and persistence update

- New games initialize separate team exploration memory. Visibility is accumulated on every simulation substep and copied into each animation frame. Unknown cells hide terrain; remembered cells keep terrain without enemy ghosts. Public mines remain visible everywhere.
- `src/planning.js` separates player-known terrain, heading-aware BFS, known-route preference, ranges and route/history edits. Main and aircraft ranges use round-start origins; secondary/AA guides use the planned endpoint. Plane budget uses the same Euclidean/√3 flight metric as simulation. Torpedo rays show fractional current-round travel from the selected node and full lifetime limits.
- All friendly routes, numbered steps/endpoints, torpedo windows/rays, stacked main target counts, aircraft routes and mine-sweep orders stay visible across ship selection. Opposing plans are never rendered. Range and plan layers can be hidden.
- Click a route node to keep it and remove later steps. Segment undo, current-ship undo/redo, movement-only redraw and full reset are distinct. Changed routes prune unreachable or illegal torpedo windows with feedback.
- Home menu opens new game, local load, illustrated guide, or 10 independent interactive lessons. The 8-section guide embeds 6 original SVG illustrations. All 32 teaching steps are gated by actual board actions; real simulation drives collisions, automatic secondary fire, fog retreat, artillery/reload, torpedoes, aircraft AA and mines.
- Autosave captures stable deployment/planning/round-result transitions, with three confirmed-overwrite manual slots. JSON export/import supports explicit cross-device backup. Snapshots preserve aircraft Infinity readiness, exploration and plan segments. Storage failures are surfaced, malformed imports do not overwrite slots or active battle, and tutorial saves are memory-only. Loading resets transient playback/history/targeting state. There is no backend or automatic cloud synchronization.
- Save overlays block battle shortcuts, and animation skip is disabled until simulation results exist.

Verification additions: `fog-planning.test.js` (12), `save.test.js` (14), `tutorial.test.js` (10 controlled fixtures), plus mounted Vue fog/edit, home/save/import, and all-lesson tutorial flows. The expanded aggregate is 73 tests, including three complete AI-vs-AI matches.
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


## v0.4.0 3D 海战场景

海战地图由 Three.js 渲染，包含立体岛屿、水雷、带姓名与血条的朝向镜头立牌、简易飞机与鱼雷模型，以及主炮抛物线、副炮和防空轨迹。Vue 保留指令、菜单与存档界面。所有模型由程序生成，不依赖外部模型资源。

3D 高度只用于显示，六角坐标、碰撞、伤害与存档规则沿用原有引擎。未知地形和视野外敌方单位不进入场景；弹道按当前视野裁切。若设备不能建立 WebGL 画布，页面会显示重试与返回主菜单入口。

测试分为引擎/弹道/场景数学与 Vue 语义交互测试，以及真实浏览器中的 WebGL 点选、镜头与动画验证。Happy DOM 使用显式测试适配器，不承担 GPU 渲染验证。
