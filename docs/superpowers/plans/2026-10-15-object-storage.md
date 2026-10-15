# 对象存储读取与固有美术资源实施计划

用户已明确授权实施。基线94f33836fdde8a5aba5a17dce61b97dea495a940 / v0.6.2，当前开发分支codex/online-v042，复用现有工作区。最终仅推进一次v0.6.3。范围：local/OSS/S3兼容/COS读取；默认本地；手工上传；单服务进程跨玩家复用；失败回退本地；固定小图与Spine缩略图。不自动上传、推送或部署。

## 共享契约（先固定再并行）
- shared/assets.ts 定义 RuntimeAssetManifest / AssetProvider / AssetResolution / AssetResolveResponse。
- assets/runtime/manifest.json 纳入Git；assets/runtime/files/<record.path>保存发布字节。files键是逻辑资源ID，path统一为assets/runtime/<可读名>-<SHA256前16位>.<扩展名>；SHA256完整值供校验。路径不带前导斜杠。
- images沿用原始图片路径作为键，src/preview/variants.src均为files的资源ID（优化图片可直接用发布path作ID）；宽高/bytes记录生成成品。
- spine键为profileId；skeleton/atlas为files资源ID，pages把atlas中原始页名称映射到贴图资源ID。图集文本保留原始页名称，运行时必须传fileAlias映射。
- spinePreviews是profileId→files资源ID。models={aircraft:'models/aircraft',mine:'models/mine'}。sources为作者素材相对路径→SHA256，spineFingerprints为profileId→现有spineFingerprint结果。
- 准备阶段复制fixed files到.generated/public，复制manifest到.generated/public/assets/runtime-manifest.json。前端直接import受版本管理manifest；后端优先从staticRoot/assets/runtime-manifest.json读取，开发/requireBuild:false可回退仓库assets/runtime/manifest.json。
- PublicConfig新增assetStorage?:{provider:AssetProvider}；POST /api/assets/resolve 请求{ids:string[]}，返回AssetResolveResponse。local返回expiresAt:null及本地path；前端始终按BASE_URL计算自己的本地回退路径。
- API仅接收清单ID，单批最多128。远程URL为prefix+record.path的GET签名。默认TTL3600秒，有效期内绝不强制重签；过期才签发，100并发合并为一个Promise。缓存键包含存储配置标识、对象键、sha256；签名失败不能永久缓存。
- 各加载器失败后允许重新解析一次（仍使用后端有效缓存）；若URL未变或重试失败则本地回退。Spine整组回退。不因URL过期卸载已加载资源。

## Task 1 固定资源（root）
- TDD：显式生成→准备可复现且不改变固定文件；准备不压图；缺失/过期/变更报错；生成保持预览尺寸透明通道并收集Spine依赖；模型固定寻址。
- 新增scripts/generate-assets.mjs和共用只读校验；改prepare-assets.mjs为校验/复制；迁移已有成品至assets/runtime。
- assets:generate显式压图并输出清单；assets:spine显式截图然后生成固定成品。正常dev/test/build仅prepare。导出器允许从作者素材读取，不能依赖已过期运行清单造成循环。
- root负责package scripts（等待后端依赖安装结束）、生成契约、版本、文档、集成、任务状态。

## Task 2 后端（storage_server）
- 所有server相关修改、config/asset-storage.example.json、.env.example、.gitignore中的私有配置规则；shared/network.ts的公开配置；tests/server-assets.test.ts。
- 官方SDK依赖安装由此任务负责（package/lock仅依赖，不改scripts/version；完成安装通知root）。S3 AWS SDK v3，OSS ali-oss（V4签名），COS cos-nodejs-sdk-v5。自行补所需类型。
- ASSET_STORAGE_CONFIG可指定文件；默认config/asset-storage.json；不存在默认local，显式路径缺失/格式坏/远程必填缺失启动报错。内联accessKeyId/secretAccessKey，ASSET_ACCESS_KEY_ID/ASSET_SECRET_ACCESS_KEY环境变量优先；provider,bucket,region,endpoint,prefix,urlTtlSeconds，S3 forcePathStyle，OSS cname/COS绑定域名须在签名阶段配置，不能签完替换host。第一版不含STS。
- 服务进程级实例，跨玩家共享缓存+并发合并，expiry精确到SDK秒级，不提前刷新；无账号要求，清单白名单，不接任意url/key。
- per-resource签名失败返回local fallback，日志只计数/资源ID/供应商，不含原SDK异常敏感文本/签名URL/密钥。
- 用SDK假凭据验签形状，100并发/到期/失败重试/隔离/未知ID/秘密不入公开配置测试。

## Task 3 前端（storage_client）
- src资源客户端、新增相关composables、ProgressiveImage.vue、SpineThumbnail.vue/use-spine-thumbnails.ts、characters/spine.ts、scene/tactical-models.ts及相关前端测试；不要改root生成器或后端、package、shared。
- 从shared/assets.ts及assets/runtime/manifest.json取类型/清单，等待root生成文件；前端资源模式配置只共享一次读取/api/config，超时/旧服/静态站local；不要向浏览器传凭据。
- URL有效期缓存及in-flight合并；批量解析；失败重新解析一次后同版local；图片src/srcset/preview全覆盖，懒加载不持有过期URL直到首次请求（图片首次进入视口前解析或onerror恢复）；失败反馈不循环。
- Spine skeleton/atlas/pages均独立解析；AssetManager.loadTextureAtlas(fileAlias)避免签名URL相对拼接；整组local重试，保持GPU资源销毁机制。
- 固定缩略图直接解析；缺失显示固定默认或占位并提示，不动态import previews renderer、不创建临时缩略图blob。导出器仍可用SpinePreviews工具（root处理导出路径）。
- GLB通过manifest.models稳定ID和下载字节缓存加载；不改变JS/CSS/fonts代码预加载。
- 前端测试local/远程/过期/失败/子路径/不重复解析/不临时渲染缩略图。

## Task 4 集成与验收（root）
- 审查生成物和接口；生成contracts；typecheck，全量tests，build；资源校验不改变Git跟踪成品。
- 独立最终审查，修复重要问题并做定向回归。
- Playwright/Chrome真实本地桶替身：直连远端资源、跨页面缓存、403/404本地回退、Spine/GLB/图片、移动端；不伪称真实三云验收。
- 文档：配置示例、环境变量、上传清单路径、CORS/Content-Type/绑定域名/有效期与缓存范围；显式生成流程和固定文件提交要求。
- 一次version:next至0.6.3，最终构建，报告验证及真实云未配置限制。
