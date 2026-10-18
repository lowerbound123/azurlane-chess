# 舰船能力演示

选船界面覆盖当前全部十五舰。立绘区域右上角“能力演示”开关默认关闭；开启后静音循环播放当前舰船，切船保留开关并从头播放。离开选船页后重置。

播放器提供暂停、重播和放大。放大沿用同一个 video 元素，缩回保留进度。页面后台或媒体离屏时暂停；恢复时尊重玩家手动暂停。减少动态效果时先保留封面，点击后播放一次。媒体失败依次尝试首选格式远端、本地、兼容格式远端、本地；自动播放被拒绝时显示“点击播放”，不将其误判成坏视频。完全失败时显示立绘与重试。

## 一键生成

```sh
npm run demos:render
npm run demos:render -- --ship ca-3 --force
npm run demos:render -- --all --verify-only
npm run demos:check
```

默认复用完整的十五舰产物，源码或素材变化不会使既有视频失效。仅在用户明确要求时执行重录，使用 `--force` 覆盖所选视频。`--verify-only` 只做真实浏览器的直接跳帧/回退/重复/顺序播放画布一致性检查。`--check` 不启动浏览器，检查文件内容哈希、元数据与正式资源登记，不计算或比对录制源指纹。

依赖 Node 25、项目开发依赖、Chrome/Playwright Chromium、FFmpeg（libvpx-vp9 与 libx264）和 ffprobe。可用 `DEMO_BROWSER_EXECUTABLE`、`FFMPEG`、`FFPROBE` 指定路径；默认用浏览器硬件 WebGL，必要时设置 `DEMO_SOFTWARE_RENDERING=1` 使用 SwiftShader。

输出位于 `assets/ability-demos/<shipId>/`，包含 WebM、MP4、WebP 封面、四帧联系图与真实结算证据。统一 768×960、30 fps、4:5、无音轨。逐舰在同盘临时目录转码、检查后联合替换视频目录与清单；失败回滚旧产物，中断关闭自己创建的浏览器、编码器和服务。

十五舰全部有效后，生成器自动将视频和封面登记到 `assets/runtime/manifest.json` 的 `abilityDemos` 与 `files`，使用 `ability-demo/<id>/webm|mp4|poster` 稳定资源 ID、带内容哈希的发布路径和正确 MIME。加载通过既有 AssetClient，因此沿用本地与对象存储解析、子路径及现有 `assets:sync` 手动上传。不会自动发布到服务器或对象存储。

## 编辑与更新

- `src/ability-demos/scenarios.ts`：原三支样片、统一编译与实际可见性采样。
- `src/ability-demos/remaining.ts`：其余十二舰的场景、指令和字幕时间线。
- `src/ability-demos/evidence.ts`：真实结算与分镜数字的导出前断言；规则变更导致字幕不一致时停止输出。
- `src/ability-demos/render.ts`：固定时钟与镜头，复用 Board、Units、Effects、BattleAbilities、真实角色和模型。
- `tools/ship-ability-demos.html`：开发工作台，可切换十五舰、播放、逐帧拖动。
- `src/components/ShipAbilityDemo.vue` 与 `use-ability-demo.ts`：正式播放器；不导入战斗作者工具或额外 WebGL 场景。

场景只安排初始位置、合法指令和靶舰，不修改主角配置或附加演示状态。移动前快照与结算帧分开；旧金山的独立对比明确标记“示例 A / B”，不会将重置表现为回血。雷达、烟幕与飞机整备按照真实回合显示。

纯特效或规则更新后继续复用现有视频。用户明确要求重录时，再执行 `npm run demos:render -- --all --force`。更换基础美术并获得重录指令时，先更新对应源素材和 Spine 缩略图，再生成基础固定素材，最后重录演示：

```sh
# 若修改了 Spine 美术，先显式更新其缩略图
node scripts/render-spine-previews.mjs
# 作者模式避免旧演示校验阻止更新基础美术
node scripts/generate-assets.mjs --base-only
npm run demos:render -- --all --force
```

普通 `build`/`assets:prepare` 仅校验和复制，绝不现场录制。只有产物缺失、损坏、规格或资源登记不符时才阻止构建；代码、规则、素材或依赖更新不会要求重录。现有清单中的历史源指纹作为旧字段忽略，新录制不再生成源指纹。视频文件的内容 SHA-256、尺寸、帧率、编码与 MIME 校验继续保留。没有演示来源的独立作者夹具仍可只生成基础素材。

## 验证

```sh
npx vitest run tests/ability-demos.test.ts tests/ability-demos-full.test.ts tests/ability-demo-assets.test.ts tests/ability-demo-pipeline.test.ts tests/ui-ability-demo.test.ts
npm run typecheck
npm run build
npm run demos:check
```

录制器逐舰验证实际语义断言、同帧采样一致性、角色加载、编码、尺寸、帧数、时长和无音轨；联系图及视频仍需人工审看。正式页面需检查桌面、小屏、切船、暂停/放大、后台恢复、默认零视频下载、关闭后释放以及网络/格式回退。桌面 WebKit 验证不代表 iOS 实机验证。

## 本批验收（v0.7.11，2026-10-16）

- 十五舰均输出 WebM、MP4、封面、联系图和真实结算证据；发布清单登记 45 个媒体资源。双格式视频总计约 28.12 MiB，最大单格式约 1.61 MiB。
- 十五舰同帧直接跳转、回退、重复及顺序采样均像素一致。导出器逐条通过编码、768×960、30 fps、帧数、时长、无音轨检查；关键帧及护航、驻守、侦察轰炸的成片动作已人工核查。
- `npm test`：132 个文件、723 项测试通过；`npm run typecheck`、`npm run build` 通过。构建保留现有大体积 chunk 提示。`npm run demos:check` 十五舰通过，重复生成正确跳过十五舰。
- 生产构建使用 Chrome、Firefox、桌面 WebKit 逐舰播放十五条，验证暂停、重播、放大/缩回和释放。根路径与 `/azurlane-chess/` 子路径均检查 1440px、390px 布局及 30 条视频的 MIME、字节长度、不可变缓存和 Range/206。
- Chrome 额外实测减少动态效果、MP4 单格式、HTTP 200 坏 WebM 回退、远端 403 回退，以及全部格式失败后的重试。WebKit 的严格元数据预载已通过真实浏览器和回归测试修复。

以上 WebKit 是桌面测试引擎；本批没有进行原生 Safari 或 iOS 实机验收。素材仍按现有手动发布流程上传，本批未部署。
