# 战斗音频与通用 BGM 资源

音频源文件和增量下载工具保存在 `assets/battle-audio` 与现有舰娘资源入口。游戏使用的音频通过 `assets/runtime/manifest.json` 发布：7 首 BGM、39 个通用音效、41 个角色的 214 条技能／阵亡／胜利语音，共 260 个 WebM、11,932,135 字节（11.38 MiB）。其余战斗 Cue 保留在源素材目录，按需接入。

## 页面与战斗播放

| 页面 | BGM |
| --- | --- |
| 主界面 | `main-menu` |
| 新游戏／模式选择 | `stage-select` |
| 本地、AI 编队、联机选禁 | `fleet-assembly` |
| 存档、图文教程、错误页 | `archive` |
| 历史战斗选择、教学航程总览 | `campaign` |
| 交互教学选择、联机大厅、战后结算 | `port` |
| 战斗、部署与规划 | `combat`（源条目 `music`） |

BGM 循环播放，同曲目的页面间切换不重新起播。浏览器通常需要第一次点击或按键后才能播放有声媒体；顶部两个按钮分别控制背景音乐和角色语音，偏好保存在独立的 `azurlane-chess.audio.v1` 项目中。角色静音不影响通用战斗音效。

语音身份复用立绘／Spine 的角色映射，历史剧本按场景解析，同一规则适用于联机双方：玩家仅听到己方舰娘的语音。战列舰主炮、航母放飞和前排鱼雷、布雷、封锁、烟幕、雷达、护航等能力触发 `skill*`；同一舰娘同一时刻的齐射／多架放飞只播一次。HP 从正数归零随机播放该角色的 `lose*`，每次沉没只触发一次。己方获胜后，从参战己方舰娘中随机选择一位，再随机选择她的胜利语音；源战斗包的胜利 Cue 名为 `mvp*`，发布目录将其映射为逻辑动作 `victory`。

角色语音统一排队，相邻起播时间至少相隔 1 秒；音效及时播放，不进入语音队列。离开战斗会停止旧战斗的声音并清空待播语音；跳过回放只补齐己方真实阵亡语音，不集中播放所有跳过的技能与爆炸。通用炮声、命中、爆炸、鱼雷、飞机、防空及沉船音效跟随可见战斗时间线，隐藏敌方事件不额外暴露。布雷等无原有攻击动画的能力使用 `soundOnly` 标记记录语音时刻，不覆盖舰船动作。

BGM 使用原生媒体流式循环；短语音和音效按需由 Web Audio 解码并缓存，缓存最多 32 条或 24 MiB。声音文件复用现有本地／云端资源解析和失败回退，音频不可用不会阻断下令、回放或页面导航。

## 范围与来源

- 舰船名单复用 `config/ship-assets.json` 的 `catalog`、`historical`、`templates` 引用集合，与 Spine／立绘下载使用同一个 `activeIds`。当前实际引用 41 艘，另外 9 个未引用候选不下载。
- 每个角色只请求 `cue/cv-<voiceId>-battle.b`；`voiceId` 从基础 `skinId` 去掉末位 `0` 得到。不下载完整 `cv-<voiceId>.b`、gift 包或独立换装语音包。保留所选战斗包内部全部具名 Cue，包括包内已有的联动／换装变体条目。
- 通用战斗音效固定为 `cue/se-battle.b`，当前包有 39 个 Cue：爆炸、不同口径炮声、主炮／副炮、命中、飞机、鱼雷、沉船等。
- 战斗配乐保留 `audio.music` 指定的一包，当前选择 `cue/bgm-battle-arcticocean.b`，约 98.37 秒。
- 通用 BGM 只请求 `audio.musicLibrary` 明确列出的 6 包，覆盖主界面、选关、编队、存档、港口和战役页面。`name` 是资源展示名，`usage` 是素材用途说明；实际页面选曲在 `src/audio/events.ts` 中维护。
- 索引和包均来自配置客户端的官方 CDN。每包先核对索引中的大小、MD5，再解析、解密和转码；清单保存实际 CDN、索引版本和原始包元数据。

解包流程参考用户指定的 [Perfare：碧蓝航线音频提取](https://www.perfare.net/archives/816)：ACB → HCA → 解密 → 音频解码。该文给出的公开参数低位 `0x95356C72`、高位 `0x0002354E` 已用当前 CDN 企业技能样本验证。Python 密码表实现参考 [Nyagamon/HCADecoder](https://github.com/Nyagamon/HCADecoder/tree/e26b4d3a8bb450224ede3527d522c0330f7bf02b)，保留其 [MIT 许可证](../../scripts/ship-assets/HCA-LICENSE.txt)。解密结果曾与原版 `clHCA::Decrypt()` 逐字节核对一致。

## 使用

沿用现有资源入口：

```sh
npm run assets:fetch -- --dry-run
npm run assets:fetch
npm run assets:check
```

只处理音频，不触发图像或模型生成：

```sh
npm run assets:fetch -- --audio-only --dry-run
npm run assets:fetch -- --audio-only
npm run assets:check -- --audio-only
```

首次导入需要 Node、`uv`，以及提供 HCA 解码器和 `libopus` 编码器的 FFmpeg。Python 复用 `.generated/ship-assets-python` 的锁定环境，不向系统安装依赖。可以用 `FFMPEG_BINARY`、`FFPROBE_BINARY` 指定工具绝对路径。后续资源完整时的再次下载和离线校验不需要 Python、FFmpeg 或网络，也不会重录视频。

## 文件和清单

语音、音效和 BGM 统一使用 WebM／Opus、48 kHz、VBR，并保留源声道数。目标码率分别为语音 32 kbit/s、音效 64 kbit/s、BGM 80 kbit/s；推荐 MIME 为 `audio/webm; codecs="opus"`。WebM 的 Opus 音轨支持见 [MDN 容器说明](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers)。

所有音频从原始 HCA 直接解密、裁切并转码，避免用已有 AAC 再次有损压缩。按 HCA 头的编码延迟、尾部填充与 ACB 波形样本数共同裁切，并将时间戳从零开始；不额外归一化响度，不烘焙播放次数。

```text
assets/battle-audio/
  manifest.json
  voices/<角色身份>/<Cue名>.webm
  effects/<Cue名>.webm
  music/<Cue名或稳定哈希名>.webm
  music/<曲目ID>/<Cue名或稳定哈希名>.webm
```

`manifest.json` 的 `entries` 中：

- `ship:<角色身份>`：中文名、语音编号和该角色的全部战斗 Cue。
- `effects`：通用战斗音效 Cue。
- `music`：原有战斗配乐 Cue，文件名沿用原 Cue 的稳定哈希，扩展名改为 `.webm`。
- `music:<曲目ID>`：通用 BGM，额外记录 `id`、`name`、`usage`。各曲目分目录保存，相同 Cue 名也不会互相覆盖。

每项包含 `source.bundle` 原始包路径／大小／MD5、CDN 版本、`cueNames` 完整条目表和 `clips`。每个 clip 记录相对项目的文件路径、SHA-256、字节数、编码、时长、声道、输出采样率、样本数和 AWB 波形 ID。`sourceSampleRate`／`sourceNumSamples` 分别记录重采样前的源采样率和有效样本数，`numSamples` 按实际解码帧累计；`processing` 是统一格式摘要，`voiceProcessing`／`effectsProcessing`／`musicProcessing` 保存各类编码参数。各类参数独立参与指纹，因此只改变语音参数不会重新处理 BGM。示例查找入口是 `entries["ship:qiye"].clips.skill`、`entries.effects.clips["battle-boom1"]`、`entries["music:main-menu"].clips`。

通用曲库配置示例：

```json
"audio": {
  "music": "cue/bgm-battle-arcticocean.b",
  "musicLibrary": {
    "main-menu": {
      "name": "经典主界面",
      "usage": "主界面、返回主菜单",
      "bundle": "cue/bgm-main.b"
    }
  }
}
```

曲目 ID 使用不超过 48 字符的小写字母、数字和单连字符。每条必须写精确包路径、名称及用途；拒绝通配符、路径跳转和重复包。修改名称／用途只更新清单，不重新下载或转码。

Cue 索引、波形索引和 AWB 文件编号不一定相同；解析器沿 Cue → Sequence → Track event → Synth → Waveform → AWB file ID 解析，避免给声音贴错名字。不能证明正确的分层／外部流式音频、未知事件、非零 AWB 子密钥会明确报错。

## 增量处理与失败

本地文件完整且处理参数未变时不联网、不改写。文件损坏或身份／编码配置变化时只重新处理对应的音频包。下载好的原始包按 MD5 缓存在 `.generated/battle-audio-cache/bundles`，重试前仍检查大小与 MD5。

每包全部 Cue 都完成解密、转码和 FFprobe 验证后，才替换该包的正式文件，并保存已完成进度。HTTP 404 或成功索引中的明确缺失报告为 missing；限流、超时、索引失败、MD5／帧校验失败、解包和转码失败均为 error。两者都阻止把其他角色的语音冒充当前角色，不自动改用其他语音包。

原始 ACB、临时 HCA 和转码中间文件不进入版本管理。正式 WebM 和源清单进入版本管理；游戏使用的部分另由 `assets:generate` 发布为带内容哈希的固定资源。各类旧 M4A 仅在新 WebM 与完整清单完成验证后清理，避免在转换失败时删除原文件。

按用户要求，CDN／Spine／立绘／音频下载和解包类测试及专用音频夹具已删除。`assets:check` 的实际文件、哈希、容器和元数据检查仍保留；游戏运行时加载与已发布资源的完整性检查不受影响。

## 本次准备清单

已准备 41 舰共 466 条战斗语音、39 条战斗音效和 7 首配乐，统一为 512 个 WebM 文件，音频净大小 15,933,825 字节（15.20 MiB）。41 艘的基础 `skill` 条目均存在；现有 7 首 BGM 的文件与清单条目保持不变。

| 类别 | 条数 | 目标码率 | 压缩前 | 压缩后 | 减少 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 战斗语音 | 466 | 32 kbit/s VBR | 24,887,488 字节 | 8,382,912 字节 | 66.32% |
| 通用音效 | 39 | 64 kbit/s VBR | 1,671,473 字节 | 846,509 字节 | 49.36% |
| 现有 BGM | 7 | 80 kbit/s VBR | 6,704,404 字节 | 6,704,404 字节 | 本次未重做 |

语音与音效合计从 25.33 MiB 降至 8.80 MiB；全部音频从 31.72 MiB 降至 15.20 MiB。505 个旧语音／音效 M4A 已在完整校验后清理，目录内没有 M4A 或未登记音频。

通用曲库本次新增 6 首、5,732,411 字节（5.47 MiB）。全部 7 首 BGM 从 AAC 版本的 15,775,023 字节（15.04 MiB）压缩至 6,704,404 字节（6.39 MiB），减少 57.50%；旧 BGM 的 7 个 M4A 已清理。

下表记录素材用途和来源，实际页面绑定见上文。中文展示名用于资源选择，不代替清单保存的原始 Cue 名。

| 曲目 ID | 展示名 | 建议用途 | 官方源包 | 时长 |
| --- | --- | --- | --- | ---: |
| `main-menu` | 经典主界面 | 主界面、返回主菜单 | `cue/bgm-main.b` | 56.72 秒 |
| `stage-select` | 常规关卡 | 选关、关卡详情 | `cue/bgm-level02.b` | 63.04 秒 |
| `fleet-assembly` | 皇家主题 | 编队、出击准备 | `cue/bgm-level03.b` | 171.44 秒 |
| `archive` | 柔和酒吧 | 存档、图鉴、设置 | `cue/bgm-bar-soft.b` | 70.21 秒 |
| `port` | 晴空细雨 | 休闲主页、港口 | `cue/bgm-story-afterrain-soft.b` | 75.01 秒 |
| `campaign` | 余烬主题 | 战役地图、高难关卡预览 | `cue/bgm-main-ashes-theme.b` | 116.26 秒 |
| 原 `music` | 北冰洋战斗配乐 | 战斗 | `cue/bgm-battle-arcticocean.b` | 98.38 秒 |

所有源包均完成大小／MD5、HCA 头及全帧校验、有效样本窗口与 FFprobe 验证，并对最终全部 512 个 WebM 再次完整解码，零错误、全部非静音。输出样本数按实际解码帧登记，避免重采样时的取整偏差。未做音量归一化、拼接或额外循环。

| 舰船 | 资源身份 | 战斗语音条数 |
| --- | --- | ---: |
| 埃克塞特 | `aikesaite` | 6 |
| 埃塞克斯 | `aisaikesi` | 18 |
| 爱斯基摩 | `aisijimo` | 6 |
| 阿贾克斯 | `ajiakesi` | 13 |
| 阿基里斯 | `ajilisi` | 6 |
| 阿卡司塔 | `akasita` | 5 |
| 巴尔的摩 | `baerdimo` | 13 |
| 北卡罗来纳 | `beikaluolaina` | 6 |
| 俾斯麦 | `bisimai` | 12 |
| 博格 | `boge` | 4 |
| 苍龙 | `canglong` | 8 |
| 长岛 | `changdao` | 8 |
| 赤城 | `chicheng` | 15 |
| 大黄蜂 | `dahuangfeng` | 14 |
| 岛风 | `daofeng` | 19 |
| 飞龙 | `feilong` | 8 |
| 海伦娜 | `hailunna` | 23 |
| 胡德 | `hude` | 12 |
| 加贺 | `jiahe` | 14 |
| 金刚 | `jingang` | 14 |
| 旧金山 | `jiujinshan` | 12 |
| 卡萨布兰卡 | `kasabulanka` | 9 |
| 克利夫兰 | `kelifulan` | 9 |
| 黎塞留 | `lisailiu` | 10 |
| 弗莱彻 | `moli` | 5 |
| 欧根亲王 | `ougen` | 14 |
| 企业 | `qiye` | 30 |
| 圣地亚哥 | `shengdiyage` | 8 |
| 斯佩伯爵 | `sipeibojue` | 17 |
| 威尔士亲王 | `weiershiqinwang` | 14 |
| 武藏 | `wuzang` | 18 |
| 香格里拉 | `xianggelila` | 7 |
| 熊野 | `xiongye` | 10 |
| 厌战 | `yanzhan` | 15 |
| 约克城 | `yuekecheng` | 20 |
| Z13 | `z13` | 7 |
| Z18 | `z18` | 5 |
| Z2 | `z2` | 7 |
| Z35 | `z35` | 7 |
| Z9 | `z9` | 10 |
| 筑摩 | `zhumo` | 8 |
