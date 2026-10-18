# 舰船能力样片生成

本批先完成三艘舰船，供选船界面的演示开关方案审核：武藏 `bb-2`（12 秒）、阿卡司塔 `dd-3`（14 秒）、埃塞克斯 `cv-2`（18 秒）。本批不接入选船界面。

## 一键生成

```sh
npm run demos:render
npm run demos:render -- --ship bb-2
npm run demos:render -- --all --force
npm run demos:check
npm run demos:render -- --all --verify-only
```

当前默认处理十五舰，复用完整的现有产物；修改游戏特效、角色或规则不会要求重录。仅在用户明确要求时，用 `--force` 强制重录所选视频。`--verify-only` 在真实浏览器中比较直接跳转、回退、重复和顺序播放到同一帧的战斗画布（不转码），`--check` 只检查产物内容哈希、规格和资源登记，不校验录制源指纹，也不启动服务器、浏览器或编码器；产物损坏或缺失时返回非零退出码。

需要项目已安装依赖（`npm ci`）、Node 25、FFmpeg（包含 `libvpx-vp9`、`libx264`）、ffprobe，以及 Playwright Chromium 或本机 Chrome。支持用 `DEMO_BROWSER_EXECUTABLE`、`FFMPEG`、`FFPROBE` 指定路径。脚本预检编码器后调用现有 `prepareAssets` 验证并准备固定资源，启动仅监听 `127.0.0.1:4189` 的临时 Vite 服务；端口冲突会报错，不会关闭占用该端口的其他服务。录制结束会关闭自己启动的服务和浏览器；中断会进入统一取消路径并等待编码进程退出。

产物位于 `assets/ability-demos/<舰船ID>/`：

- `demo.webm`：VP9，768×960，30 fps，无音轨。
- `demo.mp4`：H.264，yuv420p，faststart，同尺寸帧率，无音轨。
- `poster.webp`：完整尺寸封面。
- `contact.webp`：开始、代表性瞬间、后段、结束四帧对照。
- `evidence.json`：初始场景、提交指令产生的事件、弹道与特效事件、各回合真实结果、编码规格及关键帧时间。

`assets/ability-demos/manifest.json` 记录每支视频的规格和内容哈希，历史源指纹字段会被忽略。每支视频先通过同帧画布一致性检查，再在输出目录所在磁盘的临时目录完成双格式编码、帧数/尺寸/时长/音轨检查。新目录与 manifest 联合替换；manifest 替换失败时回滚旧目录，录制或转码失败时保留原有视频。普通 `build`、开发启动和素材生成命令不会自动重录视频。

## 复用路径与编辑入口

```text
scenarios.ts 编排真实舰船、初始位置、各回合指令、镜头字幕时间
  → resolveRound(..., { termination: 'mission' })
  → interpolateFrame / sampleBattleVisuals / 可见性过滤
  → Board + Units + Effects + BattleAbilities + 原有角色和战术模型
  → 固定帧号 seekFrame（海面、螺旋桨、角色、特效时间同步）
  → Playwright 截图流 → FFmpeg → WebM / MP4 / WebP / 证据
```

- [场景与字幕编排](../src/ability-demos/scenarios.ts)：只编排位置和合法指令，不覆写演示舰船的能力数值。通过 `orders` 执行真实回合，通过 `beats` 将回合模拟时间映射为视频时间，可暂停、慢放或跨回合。
- [渲染适配器](../src/ability-demos/render.ts)：固定镜头、加载角色、按帧采样并调用游戏现有渲染模块。角色素材加载失败会停止录制，避免输出替代角色。
- [录制脚本](../scripts/render-ability-demos.mjs)：启动环境、逐帧录制、双格式编码、校验和替换产物。
- [产物完整性检查](../scripts/ability-demo-manifest.mjs)：逐文件核对非空内容与 SHA-256；不遍历录制源码或比对源指纹。规则、特效、模型、角色、字体或依赖变化不会使现有视频失效。

手工预览：运行现有开发服务器后访问 `/tools/ship-ability-demos.html`，可切换三艘船、播放/暂停、拖动逐帧检查。工作台仅供开发使用，未接入生产路由。画面保持固定 4:5 比例，适合后续嵌入选船立绘区域；本批不加入音效。

## 三支样片的规则表达

- 武藏：使用原始重炮配置，一发覆盖中心及周围六格，中心敌舰受到 120、邻格敌舰和友舰各受到 60。靶舰使用不下达飞行指令的真实航母，避免自动副炮干扰重炮演示。
- 阿卡司塔：先呈现我方烟幕，再切敌方真实视角。隐藏舰船完全从渲染列表移除；第二回合敌舰靠近到相邻格后发现目标，第三回合烟幕按规则消散。切换观察方会重建单位层，避免复用旧阵营颜色。
- 埃塞克斯：使用真实四战两轰机库，从槽位 0 和 4 放飞一战一轰；敌方来袭轰炸机由另一个真实航母放飞。字幕按实际拦截、轰炸、回收时刻编排，跨四回合展示巡逻、返航与整备。母舰本批没有移动。

## 验证

```sh
npx vitest run tests/ability-demos.test.ts tests/ability-demo-pipeline.test.ts
npm run typecheck
npm run build
npm run demos:check
```

测试验证三套场景的真实伤害、可见性、放飞与回收，以及忽略历史源指纹、产物损坏/缺失时拒绝复用、manifest 更新失败时回滚和取消检查。生成器还会校验实际编码产物的帧数、时长、分辨率、编码和音轨，并输出关键帧用于人工检查。

本批执行一次版本递增至 `v0.7.9`；并行任务随后将共享项目推进至 `v0.7.10`。本批没有改变存档格式或游戏数值。

最终验证：128 个测试文件、699 项全量测试通过；依赖缓存补强后的本批专项 8 项通过。前后端类型检查、生产构建、三支视频的同帧采样一致性与 `demos:check` 均通过。

## 全十五舰与选船界面

本说明最初记录三支样片；现已扩展为十五舰完整能力演示，并接入立绘右上角开关。当前完整的生成、资源发布、播放器行为与验证方法见 [舰船能力演示维护说明](art/SHIP-ABILITY-DEMOS.md)。默认 `demos:render` 覆盖十五舰，完成后自动登记正式资源；普通构建只校验和复制。
