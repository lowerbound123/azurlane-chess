# 舰娘资源配置与增量导入

当前为 41 套基础舰娘资源，覆盖 15 个普通选船槽位、35 个历史战役单位。所有实际导入资源来自官方 EN CDN，骨骼版本为 Spine 3.8.99；原创默认水手也使用原生 3.8.99，只保留一个 Spine 3.8 运行时。下载和加载会拒绝不兼容的真实骨骼版本。舰娘 authoring 文件合计 27.04 MiB，运行时另外包含响应式图片和待机缩略图。

黎塞留、岛风、武藏保留官方合成画布的完整范围，不配置 `portraitCrop`；前端通过主体锚点与等比缩放控制展示位置，避免在生成资源时永久裁掉舰装和效果。

## 使用

需要项目指定的 Node.js；首次下载还需 [uv](https://docs.astral.sh/uv/)，脚本会在 `.generated/ship-assets-python` 初始化锁定的 Python 3.11 环境。音频首次导入还需要带 HCA 解码、libopus 编码的 `ffmpeg`、`ffprobe`。语音／音效／BGM 统一使用 WebM／Opus、48 kHz，VBR 目标码率分别为 32／64／80 kbit/s，保留源声道数。只检查已有文件不需要 Python、FFmpeg 或网络。

```sh
npm run assets:check
npm run assets:fetch -- --dry-run
npm run assets:fetch
```

`assets:fetch` 校验本地哈希，仅请求缺失或损坏的组件。图集页损坏只修复该角色的小人包；立绘缺失只请求立绘包。完整资源再次执行返回 `planned: []`、`changed: false`，不请求远端、不导出缩略图、不重写运行时文件。正常 dev/test/build 只验证并复制固定资源，不联网。

同一入口也准备当前实际引用舰船的战斗语音、通用战斗音效，以及 `audio.music` 指定的战斗配乐和 `audio.musicLibrary` 列出的通用 BGM。音频源文件保存在 `assets/battle-audio`；`assets:generate` 将游戏使用的技能、阵亡、胜利语音以及音效、BGM 登记到运行时资源清单，构建仍只校验和复制。需要单独处理音频时使用：

```sh
npm run assets:fetch -- --audio-only --dry-run
npm run assets:fetch -- --audio-only
npm run assets:check -- --audio-only
```

语音只请求实际映射引用的基础角色 `cue/cv-<编号>-battle.b`，不下载未引用的备用舰、主界面语音包或礼物语音包。文件损坏只重做所属音频包；已完成的其他包保持不变。完整说明及清单结构见 [战斗音频资源](BATTLE-AUDIO.md)。

首次导入或小人资源变化需要本机浏览器导出待机图，可使用已安装 Chrome：

```sh
SPINE_BROWSER_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm run assets:fetch
```

## 编辑名单

唯一手工入口是 [config/ship-assets.json](../../config/ship-assets.json)：

- `ships`：中文名、舰种、基础版 `assetName`、`skinId`、同舰种替补顺序，以及固定提交的立绘公开备用源。`portraitCrop` 是原始合成立绘上的归一化裁剪矩形（left、top、width、height），在压缩与水印之前执行，并同步生成头像；`characterOffset` 是渲染层配准偏移，不修改原始骨骼、不请求媒体。未被映射引用的候选仅保存配置，不下载媒体。
- `catalog`：稳定的选船槽位 ID → 资源身份；每个普通槽位使用不同身份。
- `historical`：战役 ID → 单位 ID → 资源身份；不通过舰名或全局单位 ID 猜测。
- `historicalSubstitutions`：无对应舰娘的历史单位使用的外观及理由。
- `templates`：旧存档或无独立身份靶舰的同舰种默认资源。
- `portraits`：最长边不超过 1600px、WebP 质量 80、头像最大 256px；`portraits.watermark` 配置固定文字“请支持官方碧蓝航线喵～”，烘焙到全部 41 张舰娘立绘、41 张头像及默认立绘中。
- `audio.music`：一首配乐的精确官方包路径。通用音效固定为 `cue/se-battle.b`；战斗语音编号从实际引用舰船的基础 `skinId` 去掉末位 `0` 得到。
- `audio.musicLibrary`：可选的具名通用 BGM 曲库，格式为 `<曲目ID>: {name, usage, bundle}`。`usage` 只记录建议页面用途；新增曲目只处理新增包，名称／用途变化不重转码。每首独立保存到 `music/<曲目ID>`，已有战斗配乐和语音／音效不变。

改动后运行 `assets:fetch`。名称或映射变化会更新展示数据；基础资源名、源提交或压缩参数变化会重新处理受影响资源。`painting` 与 `chibi` 使用独立配置指纹，修改水印或立绘压缩参数只使立绘组件失效，不会重新下载 Spine 小人。运行时生成清单 `src/characters/ships.generated.json` 和 `assets/ship-assets.lock.json` 随资源一起保存，不手工修改。锁文件记录 CDN 版本、bundle MD5、最终文件 SHA-256、全部动作名和显示参数。新增战役单位应在配置中补齐显式映射，并确保舰种一致。

## 来源与失败处理

官方路径精确请求 `char/<base>`、`painting/<base>`，并从基础 prefab 的可见图层枚举必要纹理依赖。武藏、岛风、Z13、Z9 额外合成人物／前景，Z13 还读取 prefab 明确引用的默认表情 Sprite；按官方层级顺序、位置、尺寸、缩放和 pivot 合成，缺少任一必要层会报错。配置中的 `paintingLayers` 固定这四张基础立绘的所需层名，来源与布局记录在锁文件。下载器不使用舰名前缀匹配，不获取额外皮肤包、Live2D 或整包客户端；音频仅获取上文声明的精确范围。实现参考 [AzurLane-AssetDownloader](https://github.com/nobbyfix/AzurLane-AssetDownloader)，Python 的直接和传递依赖锁定在 `scripts/ship-assets/uv.lock`。

立绘明确的索引缺失或 HTTP 404 才会尝试配置中的公开仓库；来源固定至完整 Git 提交。Spine 小人只使用官方 CDN 下载的原生 3.8.99 资源，已移除旧版公开 Spine 备用源配置。同一舰娘仍无完整资源时，按顺序挑选可用同舰种替补，普通目录避免与其他槽位重复，历史文本保留原名。超时、限流、校验和提取错误会报错，不会自动换人。

所有产物先解析、解码和验证，再写入项目；已验证的进度写入锁文件，重试可继续。临时 Unity 包和原始立绘在处理完成后清理。只保留压缩立绘/头像和必要骨骼、图集、无损纹理，删除配置不会主动清理用户手工文件。

## 当前资源清单

立绘列包含头像。普通目录本人资源全部可用，没有发生身份替换。历史战役的外观代用见配置中的 `historicalSubstitutions`。

| 舰娘 | 资源身份 | 骨骼版本 | 立绘＋头像 | 小人资源 | 来源 |
|---|---|---|---:|---:|---|
| 埃克塞特 | `aikesaite` | 3.8.99 | 164 KiB | 254 KiB | 官方 EN CDN |
| 埃塞克斯 | `aisaikesi` | 3.8.99 | 261 KiB | 447 KiB | 官方 EN CDN |
| 爱斯基摩 | `aisijimo` | 3.8.99 | 330 KiB | 385 KiB | 官方 EN CDN |
| 阿贾克斯 | `ajiakesi` | 3.8.99 | 114 KiB | 421 KiB | 官方 EN CDN |
| 阿基里斯 | `ajilisi` | 3.8.99 | 118 KiB | 210 KiB | 官方 EN CDN |
| 阿卡司塔 | `akasita` | 3.8.99 | 142 KiB | 228 KiB | 官方 EN CDN |
| 巴尔的摩 | `baerdimo` | 3.8.99 | 244 KiB | 184 KiB | 官方 EN CDN |
| 北卡罗来纳 | `beikaluolaina` | 3.8.99 | 138 KiB | 411 KiB | 官方 EN CDN |
| 俾斯麦 | `bisimai` | 3.8.99 | 237 KiB | 275 KiB | 官方 EN CDN |
| 博格 | `boge` | 3.8.99 | 173 KiB | 184 KiB | 官方 EN CDN |
| 苍龙 | `canglong` | 3.8.99 | 172 KiB | 398 KiB | 官方 EN CDN |
| 长岛 | `changdao` | 3.8.99 | 147 KiB | 305 KiB | 官方 EN CDN |
| 赤城 | `chicheng` | 3.8.99 | 243 KiB | 561 KiB | 官方 EN CDN |
| 大黄蜂 | `dahuangfeng` | 3.8.99 | 182 KiB | 251 KiB | 官方 EN CDN |
| 岛风 | `daofeng` | 3.8.99 | 454 KiB | 472 KiB | 官方 EN CDN |
| 飞龙 | `feilong` | 3.8.99 | 130 KiB | 210 KiB | 官方 EN CDN |
| 海伦娜 | `hailunna` | 3.8.99 | 209 KiB | 232 KiB | 官方 EN CDN |
| 胡德 | `hude` | 3.8.99 | 239 KiB | 259 KiB | 官方 EN CDN |
| 加贺 | `jiahe` | 3.8.99 | 159 KiB | 355 KiB | 官方 EN CDN |
| 金刚 | `jingang` | 3.8.99 | 129 KiB | 266 KiB | 官方 EN CDN |
| 旧金山 | `jiujinshan` | 3.8.99 | 557 KiB | 371 KiB | 官方 EN CDN |
| 卡萨布兰卡 | `kasabulanka` | 3.8.99 | 358 KiB | 272 KiB | 官方 EN CDN |
| 克利夫兰 | `kelifulan` | 3.8.99 | 129 KiB | 282 KiB | 官方 EN CDN |
| 黎塞留 | `lisailiu` | 3.8.99 | 323 KiB | 396 KiB | 官方 EN CDN |
| 弗莱彻 | `moli` | 3.8.99 | 132 KiB | 171 KiB | 官方 EN CDN |
| 欧根亲王 | `ougen` | 3.8.99 | 293 KiB | 420 KiB | 官方 EN CDN |
| 企业 | `qiye` | 3.8.99 | 282 KiB | 754 KiB | 官方 EN CDN |
| 圣地亚哥 | `shengdiyage` | 3.8.99 | 147 KiB | 258 KiB | 官方 EN CDN |
| 斯佩伯爵 | `sipeibojue` | 3.8.99 | 161 KiB | 342 KiB | 官方 EN CDN |
| 威尔士亲王 | `weiershiqinwang` | 3.8.99 | 232 KiB | 244 KiB | 官方 EN CDN |
| 武藏 | `wuzang` | 3.8.99 | 369 KiB | 2041 KiB | 官方 EN CDN |
| 香格里拉 | `xianggelila` | 3.8.99 | 199 KiB | 271 KiB | 官方 EN CDN |
| 熊野 | `xiongye` | 3.8.99 | 435 KiB | 243 KiB | 官方 EN CDN |
| 厌战 | `yanzhan` | 3.8.99 | 307 KiB | 765 KiB | 官方 EN CDN |
| 约克城 | `yuekecheng` | 3.8.99 | 260 KiB | 236 KiB | 官方 EN CDN |
| Z13 | `z13` | 3.8.99 | 470 KiB | 1667 KiB | 官方 EN CDN |
| Z18 | `z18` | 3.8.99 | 160 KiB | 212 KiB | 官方 EN CDN |
| Z2 | `z2` | 3.8.99 | 132 KiB | 256 KiB | 官方 EN CDN |
| Z35 | `z35` | 3.8.99 | 153 KiB | 245 KiB | 官方 EN CDN |
| Z9 | `z9` | 3.8.99 | 632 KiB | 1264 KiB | 官方 EN CDN |
| 筑摩 | `zhumo` | 3.8.99 | 407 KiB | 553 KiB | 官方 EN CDN |
