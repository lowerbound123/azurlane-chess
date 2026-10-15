# 游戏资源：本地与 OSS / S3 / COS

默认使用随网站发布的本地美术资源，无需配置桶。远程模式只分发图片、WebP 变体与预览、Spine 缩略图/骨架/图集/贴图和 GLB；网页代码、CSS、字体仍由网站本地提供。

## 固有资源制作与构建

- 作者素材保留在 `public/`、`assets/models/`。
- `assets/runtime/manifest.json` 是版本化资源清单。`assets/runtime/files/` 是发布文件根，里面包含真正的、内容哈希命名的资源文件，需与清单一起提交。
- 修改普通图片、模型或资源映射后，显式运行 `npm run assets:generate`。
- 修改 Spine 骨架、图集、贴图、角色配置或缩略图渲染器后，显式运行 `npm run assets:spine`。该命令导出固定 WebP，再更新清单与发布文件。导出器需要 Playwright Chromium；也可用 `SPINE_BROWSER_EXECUTABLE` 指定已有 Chrome 可执行文件。
- `npm run assets:prepare`、`dev`、`test`、`typecheck` 和 `build` 只校验已保存素材并复制到 `.generated/public`，不重新压图或截图。缺失、过期或损坏会报错并提示生成命令。
- `.generated` 与 `dist` 是可删除重建的发布中转目录；`assets/runtime` 是正式资源。选船页面不会为缺失缩略图临时创建 WebGL 截图或 `blob:` 图片。

## 配置

将 `config/asset-storage.example.json` 复制为私有的 `config/asset-storage.json`，或设置 `ASSET_STORAGE_CONFIG` 指向自定义文件。路径相对仓库根解析；修改后重启后端生效。实际配置已加入 Git 忽略，不应放入 `public`、`.generated/public` 或 `dist`。

开发服务器也会拦截私有配置的直接路径、`raw/import`、`/@fs` 和软链接访问。生产后端拒绝使用位于静态公开目录中的配置；自定义配置文件仍须放在部署者控制的非公开位置。

默认配置文件不存在时使用本地；显式指定的文件不存在、格式错误或远程必填项缺失时拒绝启动，避免把配置错误误认为启用成功。

通用字段：

| 字段 | 说明 |
| --- | --- |
| `provider` | `local`、`s3`、`oss`、`cos`，每次部署选择一个 |
| `bucket` | 桶名；COS 必须包括 `-APPID` 后缀 |
| `region` | 服务商地域，如 `us-east-1`、`oss-cn-hangzhou`、`ap-guangzhou` |
| `endpoint` | 可选的浏览器可访问 HTTP(S) 服务地址/绑定域名，无路径、查询串、内嵌认证 |
| `prefix` | 桶内目录前缀，默认空；不包含桶名或完整 URL |
| `urlTtlSeconds` | 临时链接有效秒数，默认 3600，允许 1–604800 |
| `accessKeyId` / `secretAccessKey` | 私有只读访问密钥；环境变量 `ASSET_ACCESS_KEY_ID` / `ASSET_SECRET_ACCESS_KEY` 优先 |
| `forcePathStyle` | S3 兼容服务需要路径式寻址时设为 `true` |
| `cname` | OSS 已绑定自定义域名时设为 `true`，并填写 `endpoint` |

本次不实现 STS 临时凭据自动获取/续租。配置使用的密钥应能读取指定前缀内的对象。后端使用官方 SDK 生成 GET 预签名 URL，不向浏览器传递密钥；签名生成本身通常是本地计算，不需要额外访问桶检查对象存在。

### 本地

```json
{"provider":"local"}
```

### Amazon S3

```json
{"provider":"s3","bucket":"your-game-assets","region":"us-east-1","prefix":"azurlane/v0.6.3","urlTtlSeconds":3600}
```

使用环境变量提供密钥。S3 兼容服务可增加 `"endpoint":"https://s3.example.com","forcePathStyle":true`。AWS 原生 S3 通常省略 endpoint，使用 SDK 根据 bucket/region 构造的地址。

### 阿里云 OSS

```json
{"provider":"oss","bucket":"your-game-assets","region":"oss-cn-hangzhou","prefix":"azurlane/v0.6.3","urlTtlSeconds":3600}
```

采用 OSS V4 签名。绑定自定义域名时增加 `"endpoint":"https://assets.example.com","cname":true`；必须先在 OSS 完成域名绑定。不要在已签名 URL 上替换域名。

### 腾讯云 COS

```json
{"provider":"cos","bucket":"your-game-assets-1250000000","region":"ap-guangzhou","prefix":"azurlane/v0.6.3","urlTtlSeconds":3600}
```

如需绑定域名，增加 `"endpoint":"https://assets.example.com"`；签名时包含实际访问 Host。请按 COS 对桶地域、APPID 和自定义域名的要求配置。

## 自动同步到桶

准备好固定资源和远程配置后运行：

```sh
# 只校验并列出当前清单，不连接桶、不上传
npm run assets:sync -- --dry-run

# 自动检查并上传需要同步的文件
npm run assets:sync
```

命令读取项目根的 `.env`，复用 `config/asset-storage.json`、`ASSET_STORAGE_CONFIG` 及密钥环境变量。默认本地模式下明确提示并退出，不上传。同步是独立的显式操作，启动、测试和构建均不会写入桶，也不会自动生成或重新压缩素材。

同步范围仅为当前 `assets/runtime/manifest.json` 中的发布文件，相同发布路径只处理一次。脚本先校验全部固定资源及源素材指纹，再以默认 4 路并发执行：

- 查询远端对象元数据；SHA-256、大小、Content-Type 和 Cache-Control 全部一致时跳过。
- 对象不存在或元数据不一致时上传本地文件，保存 `sha256` 自定义元数据，设置清单中的 Content-Type 和 `public, max-age=31536000, immutable`。
- 只有明确的 HTTP 404 视作不存在。403、网络错误等会记录为失败，不据此尝试覆盖；其余文件继续同步。
- 输出每个对象的上传/跳过/失败结果及总数，有失败时返回非零退出码。重新运行会跳过已成功同步的对象。日志不输出密钥、完整 SDK 错误或签名 URL。
- 不删除旧对象，不修改桶 ACL、CORS 或公开访问权限。此前手动上传且没有 `sha256` 元数据的文件会重新上传一次，以建立后续跳过依据。

`--dry-run` 显示本地计划，不查询远端，因此不会预测哪些文件最终会被跳过。

上传凭据需要读取对象元数据和写入对象的权限。可以通过 `ASSET_ACCESS_KEY_ID` / `ASSET_SECRET_ACCESS_KEY` 临时提供上传身份，运行服务继续使用只读身份。S3 还需适当的 `s3:ListBucket` 权限，使不存在的对象返回 404；缺少该权限可能返回 403，脚本会停止处理该对象，而不是假定它不存在。参见 [S3 HeadObject 权限说明](https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadObject.html)。

如果浏览器读取使用的绑定域名/CDN 不支持 HEAD 或 PUT，准备另一个私有上传配置，使用存储服务原生 endpoint，保持 bucket、region、prefix 与读取配置一致：

```sh
ASSET_STORAGE_CONFIG=config/asset-storage.upload.json npm run assets:sync
```

这类 `config/asset-storage.*.json` 私有配置同样被 Git 忽略。OSS 元数据通过官方 SDK 的 HEAD/PUT 读取和设置，见 [OSS 对象元数据说明](https://www.alibabacloud.com/help/en/oss/developer-reference/manage-object-metadata-4)。上传后的浏览器 CORS 要求见下文，脚本不代改桶设置。

## 发布路径与手动上传约定

也可以按以下规则自行上传，路径与自动同步完全一致：

1. 显式生成资源并完成 `npm run build`。
2. 按 `assets/runtime/manifest.json` 的 `files` 字段上传资源；相同 `path` 只上传一次。
3. 本地文件为 `assets/runtime/files/<path>`，对象键为 `<prefix>/<path>`（prefix 为空时直接用 path）。例如清单中 `path` 为 `assets/runtime/aircraft-<hash>.glb`，上述示例对象键就是 `azurlane/v0.6.3/assets/runtime/aircraft-<hash>.glb`。
4. `files` 中的 `contentType`、`bytes`、`sha256` 可用于设置响应类型与核对上传。不要上传原始未压缩立绘来替代清单指向的 WebP；小图/模糊预览也必须上传。
5. 先把该版本清单里的文件上传完整，再启用对应 prefix。保留本地发布包所有资源，供失败回退使用。

清单同时记录 Spine 图集原始页名与独立贴图 ID；不要手动改写图集中的页名，也不要把签名 URL 写入清单。

## 浏览器访问要求

- `endpoint` 必须能从玩家浏览器访问。内部私网地址不适合浏览器直连。
- 桶跨域规则允许网站来源的 `GET`/`HEAD`，以及必要的预检；WebGL 贴图和 fetch 下载需要有效的 `Access-Control-Allow-Origin`。
- 正确设置清单里的 Content-Type（如 `image/webp`、`image/svg+xml`、`application/json`、`text/plain`、`model/gltf-binary`），不要返回登录页或错误 HTML 冒充素材。
- CDN/绑定域名必须转发并保留签名查询串及签名 Host 语义；不能任意改写地址后期待原签名仍有效。
- 固定哈希路径可以设置长期不可变内容缓存；签名解析 API 本身返回 `Cache-Control: no-store`，由应用的过期时间控制 URL 复用。

## 复用、失败回退与诊断

`POST /api/assets/resolve` 接收 `{"ids":["models/aircraft"]}`，仅接受当前清单中的 ID，最多 128 项。返回 `assets[id] = {url, expiresAt, source}`；`expiresAt` 为 epoch 毫秒，本地资源为 `null`。

同一服务进程内所有玩家共享缓存：同一对象在 URL 有效期内返回完全相同的地址；首次/过期后的并发访问合并为一次签名；到期后的下一次请求才刷新。不提供客户端强制重签开关。服务重启会清空缓存；不同后端进程之间不共享。

浏览器会共享解析结果并合并批量请求。远端下载失败时最多重新解析一次；如果地址仍有效未变，或新地址再次失败，就使用同版本本地文件。Spine 一组资源统一回退，已加载的纹理/模型不会因为 URL 到期被销毁。

后端维护 `signatures`、`hits`、`coalesced`、`failures` 计数，签名失败仅记录供应商、资源 ID 和失败计数，不记录密钥、完整签名 URL 或原始 SDK 错误。前端回退诊断也只使用资源 ID。URL 能成功签名不代表对象已上传，404/CORS/访问权限仍需按上述清单和桶配置核对。

本地与纯静态部署、旧后端缺少资源模式字段时仍可使用完整本地资源。本版验证覆盖官方 SDK 假凭据签名和本地 HTTP 桶替身；未配置真实云凭据时不声称已通过真实 OSS/S3/COS 访问验收。

### 舰船能力视频

十五舰演示使用同一固定资产清单和 AssetClient：资源 ID 为 `ability-demo/<shipId>/webm`、`/mp4`、`/poster`，MIME 分别为 `video/webm`、`video/mp4`、`image/webp`。`npm run demos:render` 在全量产物有效后登记带哈希路径；原 `assets:sync` 会一并同步，不会由视频生成命令自动上传。远端视频失败时播放器有限回退同版本地文件及兼容格式。参见 [维护说明](art/SHIP-ABILITY-DEMOS.md)。
