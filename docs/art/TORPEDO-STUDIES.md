# 独立鱼雷外观模型库

四构型中的 Mk 14 标准型现已接入正式游戏，用于替代原鱼雷几何。其他三款仍为独立美术稿。没有新增武器类型或改变数值/发射逻辑；标准型已加入固定运行时资源清单。

## 构型与外观参考

| 文件 | 外形参考 | 保留的主要特征 | 美术处理 |
| --- | --- | --- | --- |
| `mk14.glb` | 美制 Mk 14 | 圆钝雷首、长筒体、渐缩尾段、十字尾舵及双桨 | 深海蓝黑表面，适度突出分段接缝、检修盖和铭牌 |
| `type93.glb` | 日制九三式 | 较大的长径比、长筒段、圆钝头部与小尾部 | 银灰筒身、深色雷首；强调长度与端部收束，颜色为美术区分 |
| `g7e.glb` | 德制 G7e/T3 馆藏外形 | 暖金属色头部、钢色筒体、雷首端帽和触角轮廓 | 雷首外部零件简化成可辨识的形状，不复刻内部机构 |
| `mk13.glb` | 美制 Mk 13 馆藏与历史照片 | 短粗本体、尾部护环、木质头套与箱形尾套 | 将投放附件独立成组，可隐藏查看本体；表示离水投放展示状态 |

这些是基于真实外形的原创美术构型，不是某一生产批次的精确复刻。长径比例参考实物，紧固件、铰链、缝隙、文字、桨叶厚度等为近距离查看作了适度放大。摄影中的展品涂装、锈蚀与训练配置不代表所有服役批次；配色是美术选择。

## 实际查阅的照片与资料

- [美国海军水下博物馆：Mk 14](https://navalunderseamuseum.org/mk-14/)：确认构型用途与外观背景。
- [USS Bowfin 展品照片，ShipPhotos 原摄影目录](https://shipphotos.net/militaryPhotos/museums/bowfin/)：`IMG_0723.jpg`，用于圆钝雷首、平滑筒体、尾段和尾舵观察。
- [NHHC：NH 94125 九三式鱼雷照片](https://www.history.navy.mil/our-collections/photography/numerical-list-of-images/nhhc-series/nh-series/NH-94000/NH-94125.html)：细长比例与头尾外形；实际查看了其[公共领域照片镜像](https://commons.wikimedia.org/wiki/File:Type93torpedo.jpg)。
- [Ray Cunningham：IWM 的 G7e/T3 实物照片](https://www.flickr.com/photos/zaruka/54463383260)：用于头部外形、金属表面和筒身分段参考。
- [美国海军水下博物馆：Mk 13](https://navalunderseamuseum.org/mk-13/)：实际查看页面中 Mk13-1 和带木质头套/尾套的历史照片，参考短粗比例、木质投放附件及护环。

照片仅用于观察和设计，没有作为贴图、背景或文件分发；全部网格、材质和文字由本项目脚本在 Blender 创建。

## 文件与坐标

- `assets/models/torpedoes/torpedo-studies.blend`：可编辑源库，保留按构型分组的壳体、表面细节、尾部和投放附件。原始 Blender 场景不删除。
- 同目录四个 GLB：独立资产，原点居中、雷首朝 +X；Blender Z 向上，导出后 Three.js Y 向上。模型采用统一展示缩尺，单位不是工程尺寸。
- `catalog.json`：独立美术目录，记录文件大小和 Mesh 数；不属于游戏资源清单。
- `scripts/build-torpedo-models.py`：通过 Blender MCP 执行的制作脚本。重跑时新建场景，稳定导出根名称。导出时合并静态零件，源 `.blend` 保留可编辑命名零件。

GLB 根名称为 `Torpedo_mk14`、`Torpedo_type93`、`Torpedo_g7e`、`Torpedo_mk13`，标记 `studyOnly: true`。每款有两个 `torpedoPropeller` 旋转轴，`spinDirection` 分别为 1 与 -1；Mk 13 的 `Launch_Kit` 带 `displayAttachment` 标记。展示动画仅表达旋转方向，不模拟真实转速或水动力。

当前四款约 9,600—14,100 三角面，GLB 分别约 196 / 207 / 208 / 302 KiB，无外部贴图；面数与大小以 `catalog.json` 及实际导出为准。航空型另含几何木纹、分片木套及角部紧固件。

## 观察方式

启动 `npm run dev -- --port 4175`，访问 `/tools/torpedo-preview.html`：

- 四款单独观察，拖动旋转、滚轮缩放。
- 斜视、侧视、雷首特写、尾部特写。
- 同尺度对照，保留四款长短差异。
- 开关双桨动画；Mk 13 可拆下/装回投放附件。

页面仅在开发环境挂载，直接读取独立模型文件，不依赖战场、引擎或正式资源清单。后续决定采用哪些构型后，再单独进行游戏尺度、性能与资源接入。
