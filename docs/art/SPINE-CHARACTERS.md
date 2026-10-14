# 舰船 Spine 角色接入（v0.4.8）

当前使用官方 `@esotericsoftware/spine-threejs 4.2.120`，正式素材请使用 **Spine 4.2** 导出。Spine 导出数据与运行时主次版本必须一致；后续改用 4.3 等版本时需同时升级运行时并验证，不能只改配置中的版本号。Three.js 固定为运行时声明支持的 0.184.0。

## 替换素材

1. 将 JSON（或二进制 `.skel`）、`.atlas` 及 atlas 引用的所有纹理图片放到 `public/characters/角色目录/`。图集图片名称、相对路径、大小写须与 atlas 一致。
2. 在 `src/characters/config.ts` 的 `profiles` 添加角色；在 `templates` 中用舰种 ID 映射角色 ID：`dd` 驱逐、`cl` 轻巡、`ca` 重巡、`bb` 战列、`cv` 航母（以 `src/engine.ts` 为准）。未配置舰种使用 `defaultProfile`。
3. 配置动作名、缩放和位置后执行 `npm run build`，刷新页面。只是素材替换不需要改动游戏规则或存档。

```js
// profiles 内：
unicorn: {
  skeleton: 'characters/unicorn/unicorn.skel',
  atlas: 'characters/unicorn/unicorn.atlas',
  format: 'binary', // JSON 导出用 'json'
  scale: 0.014,     // Spine 像素到棋盘世界单位的比例
  offset: [0, 0],  // 立牌平面中的水平/垂直位置，世界单位
  skin: 'default',
  labelHeight: 1.65, // 名称血条相对人物脚底的高度，避免遮住头部
  animations: {
    idle: 'Idle', move: 'Move', torpedo: 'Attack_Torpedo',
    fire: 'Attack_Gun', hit: 'Damage', aircraft: 'Launch', sweep: 'Attack_Gun',
  },
},
// templates 内：
cv: 'unicorn',
```

支持 JSON 与 binary 加载路径、atlas 多页纹理、皮肤、顶点双色染色。默认资源是本项目原创的简易水手，包含 JSON、atlas、SVG 纹理和六个动作；可替换为正式 PNG 图集。二进制路径已接入，但当前没有正式 `.skel` 文件可做真实素材验收。

## 动作与显示规则

- 人物完整面向相机，舰名和血条独立显示，底座箭头仍代表实际船头方向。
- 待机与移动循环；主炮/副炮、鱼雷、放飞、清雷、受击触发一次动作后回到待机。受击优先；同时发生的其他动作取当前最新事件，暂不混合多个攻击姿态。
- 展示事件只影响动画，不改变命中、伤害、回合与联机结算。敌方动作经过服务器视野过滤，只有当前帧中可见的舰船可以播放。
- 无映射动作时依次回退到配置的 idle、名为 idle 的动画、素材的首个动画；无动画时显示静态骨架。
- 素材错误/版本不符/加载超时会记录控制台提示并使用默认角色；默认素材也失败时仍保留可点选的几何占位小人。加载完成前同样显示占位。
- 同一场景共享 atlas；删除舰船不会销毁其他舰船的纹理，退出地图时统一释放。加载过程中退出地图不会重新挂载已销毁角色。
- 旧存档不改键、不改格式；旧回放缺少动作字段时仍可显示角色，保持待机/移动。

## 本地验收

生产网页的首页挂载且页面加载完成后，在浏览器空闲时预加载 Spine 渲染代码；不支持空闲回调的浏览器延迟一秒执行。离开首页会取消尚未开始的任务。使用 Vite 官方构建清单查找运行时及其静态依赖，以低优先级下载到 HTTP 缓存，不执行模块、不创建 WebGL、场景、角色或纹理；战场按原有路径导入，复用浏览器缓存。同次打开网页成功预加载后，返回首页不再重复调度。公开静态文件使用一致的 CORS 响应，移除与文件内容无关的 Vary: Origin，让预下载和模块请求复用缓存；账号与 API 来源校验保持原规则。预加载失败会记录控制台警告，战场仍可重新下载，避免后台导入或原生 preload 的失败缓存阻断正式模块加载。开发服务继续按需加载。

选船页面优先使用预先导出的 Spine 待机 WebP，直接下载内容哈希小图，无需启动 Three.js／Spine 渲染器。更新角色素材、皮肤、动作映射或缩略图渲染代码后，在装有 Playwright Chromium 的本机执行 `npm run assets:spine`。使用已有 Chromium 可设置 `SPINE_BROWSER_EXECUTABLE` 指向其可执行文件。工具会临时启动 127.0.0.1:4176，导出 `public/characters/previews` 图片与指纹清单，再自动关闭浏览器和服务。

构建会核对素材、配置、运行时版本和缩略图渲染代码的指纹。未导出或已经失效的角色不会复用旧图，会继续使用原有运行时生成方式，并在构建时提示重新导出。服务器发布构建只校验和复制 WebP，不需要安装浏览器；战场中的实时 Spine 动画继续使用原有运行时。

开发服务的 `/tools/character-review.html` 展示默认小人，可按按钮检查动作并拖动旋转镜头。此页仅本地验收，不进入默认生产网页。

已保留 Spine 官方运行时许可证于 `public/characters/SPINE-RUNTIMES-LICENSE.txt`，随网页构建分发。正式发布使用须符合其中的 Spine Editor 授权条款。
