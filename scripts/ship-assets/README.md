# 官方 CDN Python 助手

此目录为 Node 增量资源导入器的隔离辅助程序。使用 nobbyfix/AzurLane-AssetDownloader 的 PyPI 包 `azlassets==5.3.1`（2026-10-15 查询）和 `UnityPy==1.25.0`；完整传递依赖保存在 `uv.lock`。不要安装到系统 Python。

从项目根目录初始化（需要 uv，首次允许下载 Python 及依赖）：

```sh
UV_PROJECT_ENVIRONMENT="$PWD/.generated/ship-assets-python" uv sync --project scripts/ship-assets --frozen --python 3.11
.generated/ship-assets-python/bin/python scripts/ship-assets/cdn.py --request /tmp/ship-request.json --output /tmp/ship-assets
```

请求格式：`{"client":"EN","ships":[{"id":"enterprise","assetName":"qiye"}]}`。stdout 为单个 JSON，临时目录同时包含 `report.json`。日志写 stderr。报告包含每船 `status`、`files.painting`（PNG 绝对路径）、`files.chibi`（所有 skel/atlas/纹理的 name/path 数组）和每个 bundle 的 `assets` 状态。调用方负责转换 WebP、最终路径映射和发布。

仅通过上游 client 配置中的官方 gate 发出 10800 protobuf 版本请求，然后读取完整版本字符串对应的 `/android/hash/$…` 索引。美术助手 `cdn.py` 默认只解析 azhash 与 paintinghash；资源只允许精确 `char/{assetName}`、`painting/{assetName}`、`painting/{assetName}_tex`。不运行上游完整游戏下载管理器，不使用前缀通配，不下载额外换装包或 Live2D。painting 的精确同名 Texture2D 使用上游 imgrecon 和对应 mesh 重建；所有 char TextAsset `.skel` / `.atlas` 与 Texture2D 都提取，以保留多 skeleton 附件。

`missing` 只表示成功读取索引后路径不存在或资源明确 HTTP 404；gate、索引、认证、429、5xx、超时、校验或解析失败均为 `error`。任何 `error` 必须阻止替代源的自动降级。某船报告可同时有部分成功文件和失败资产，调用方应按资产状态处理，不能将整个错误报告当作不存在。辅助 `_tex` 不在索引时并不单独导致 painting 缺失，只要另一个 bundle 已成功提供纹理。

来源：<https://github.com/nobbyfix/AzurLane-AssetDownloader>、<https://pypi.org/project/azlassets/5.3.1/>。代码使用上游配置、protobuf framing、hashfile 解析及 imgrecon；网络请求单独实现以保留明确的错误类别，并为 gate 添加 EOF 检查及 20 秒超时。

实测（2026-10-15）：EN gate 成功返回 `$azhash$9$3$384$5161947fc65ed094` 与 `$paintinghash$662$7b8fe99327a74ad1`。仅请求企业 `qiye` 的上述三个精确 bundle，完成大小/MD5 校验、skel/atlas/PNG 提取及 painting mesh 重建。此证据说明当时官方索引及协议可用；后续网络失败必须按报告错误处理，不能假定 CDN 永远可用。

组件修复可为每船加 `needs:["painting"]` 或 `needs:["chibi"]`，默认请求两者。只修复立绘只下载两个 painting 精确路径，只修复 Spine 只下载 char 精确路径；状态仅检查请求的组件。一次调用复用同一 gate/hashfile 发现结果处理多船。报告 `source` 包含 `{cdn,versions}`。

网络超时、断连或 HTTP 5xx 最多额外重试两次，各次独立超时；所有 HTTP 4xx 均不重试，404 单独记 missing。大小或 MD5 不符直接 error。painting 必须具有同名 mesh 才可重建成功；缺 mesh 时无法证明纹理未被拼接，保守报告 error，避免把拼接图误当完整立绘。mesh 可以位于 base 或 `_tex` 任一已下载 bundle。

## 战斗音频与 BGM 助手

`audio.py` 复用上述 gate、索引解析和网络处理，同时明确请求 AZL 与 CV 索引；指定的索引有任何一种未返回都算发现失败。它仅接受 Node 入口生成的精确战斗语音包 `cue/cv-<voiceId>-battle.b`、`cue/se-battle.b` 与配置明确列出的 `cue/bgm-<name>.b`，不下载完整角色语音、gift 包或其他音频目录。

音频请求格式为 `{client,cache,entries:[{key,kind,bundle,id?,voiceId?,name?,usage?}]}`；key 为 `ship:<id>`、`effects`、原战斗配乐 `music`，或具名曲库 `music:<id>`，kind 为 `voice`、`effects` 或 `music`。具名音乐的 ID 必须与 key 一致，并使用 1–48 字符的小写字母、数字及单连字符；无 ID 的旧 `music` 请求仍受支持。通过同样的 `--request`／`--output` 参数调用，stdout 为 `{entries:[{key,status,source,clips}]}`。每条 clip 带具名 Cue、AWB ID、源／输出样本信息与已验证的临时 WebM 路径，Node 调用方负责正式路径和清单。

Node 入口从 `audio.musicLibrary` 生成具名请求，校验名称、建议用途、精确包路径和包去重，输出到独立 `music/<id>` 目录。名称／用途不参与转码指纹，修改这两项只更新清单；新增曲目不会重新处理已完成的战斗语音、音效或配乐。

`cri.py` 解析 UTF／ACB 和内嵌 AFS2，沿明确引用解析 Cue 与波形，不假定 Cue 下标等于 AWB ID。`hca.py` 按 [Perfare 原文](https://www.perfare.net/archives/816) 的公开参数解密，验证头部及全部帧校验和，密码表算法参考固定提交的 [Nyagamon/HCADecoder](https://github.com/Nyagamon/HCADecoder/tree/e26b4d3a8bb450224ede3527d522c0330f7bf02b)，许可证见 `HCA-LICENSE.txt`。不需要 Windows、.NET、VGMToolbox 或编译 C++。

首次转码需要 PATH 中有 `ffmpeg` 与 `ffprobe`，或者设置 `FFMPEG_BINARY`、`FFPROBE_BINARY`。所有音频使用 `libopus`、48 kHz、VBR 保存 WebM，语音／音效／BGM 目标码率为 32／64／80 kbit/s，直接从原 HCA 编码并保持源声道数。每条按 HCA 编码延迟、尾部填充和 ACB 样本数裁切并重置时间戳，再用 FFprobe 核对编码、时长、采样率、声道和实际帧样本总数。原始包按 MD5 保存到指定 cache，临时解密 HCA 在处理后删除。只有新文件和完整清单通过检查后才清理对应旧 M4A；既有完整 BGM 不重做。完整流程与范围见 [战斗音频资源说明](../../docs/art/BATTLE-AUDIO.md)。

按用户要求，本目录 CDN／音频解包测试以及 Node 下载处理测试与专用音频夹具已删除。实际资源检查仍使用 `npm run assets:check`，保留大小／哈希／容器及元数据检查。
