# 联机服务部署（v0.8.3）

使用 Node.js 25。一个进程、一个端口同时提供网页、HTTP API 与 WebSocket；无需 Docker、外部数据库或 Redis。账号功能默认停用；启用后使用 Node.js 内置 SQLite，在私有本地目录持久保存账号、会话和已结束战绩。

```sh
npm ci
npm run build
npm start
```

构建同时生成网页 `dist/` 和独立 ESM 服务 `dist-server/`，部署时必须一起保留。私有 `.env`、模型配置和数据库仍位于项目根目录或现有绝对配置路径。

默认访问 http://127.0.0.1:3000。缺少 dist/index.html 时服务会提示先构建。启动命令为 `node --env-file-if-exists=.env dist-server/server/index.js`。

## 网页路由与连接

主菜单 `/` 是统一入口，点击新游戏进入 `/new`。模式卡片依次包含本地游玩、`/api/config` 返回的各个 AI、创建房间、加入房间和快速匹配；只有服务器已连接时在线入口才可用。AI 编队地址为 `/new/ai/:modelId`，普通／FULL 模式由明确的开始按钮提交；刷新、返回和浏览器前进后退不会重复开局。

顶部连接卡片始终连接当前网站所在服务器，连接成功后收起并显示中文状态和服务器地址。浏览器记住上次成功连接的意愿，主动断开会清除；断网恢复和身份接管沿用原有联机规则。进行中的对局需确认认输，然后退出对局再关闭连接；退出命令失败时保留实际状态供重试。房间和匹配队列先离开房间或取消匹配，已结束对局直接离开。

房间地址 `/rooms/:code` 可分享给好友，非成员访问会进入预填房间码的加入页。在线选禁使用 `/matches/:matchId/draft`，在线战场使用 `/battle/online/:matchId`；刷新后恢复连接并核对服务器会话，失效对局回到模式选择并给出提示。后台状态更新不会强行切走主菜单，主菜单提供继续在线流程入口。

应用服务器只对 HTML 页面导航返回 `index.html`，API、WebSocket 和缺失静态文件保留各自错误响应。反向代理应继续将网页、API 和 `/ws` 转发到同一 Node 服务，不需要为每条路由单独配置；纯静态托管需要配置等价的 History 页面回退。

## 配置

复制 `.env.example` 为 `.env`。`HOST` 默认 `127.0.0.1`；局域网可设为 `0.0.0.0`。`PORT` 默认 `3000`。`ALLOWED_ORIGINS` 必须列出浏览器实际访问的完整来源（协议、主机、端口），多项用逗号分隔。公网部署在 HTTPS 反向代理后，代理同时转发 `/ws` 的 WebSocket Upgrade，请将实际 HTTPS 域名加入允许来源。服务不自动安装后台守护程序。

## 可选账号与个人战绩

`AUTH_ENABLED` 默认 `false`。顶部登录、注册入口置灰并显示“暂未开放”，表单不能打开，服务端同时拒绝实际注册和登录。静态托管、缺少配置或配置请求失败时也保持停用。单机、教学、随机 PvP、好友房和在线 AI 均可继续以游客身份使用。

在 `.env` 中设置以下值并重启服务即可启用，无需切换构建参数或重新构建网页：

```dotenv
AUTH_ENABLED=true
AUTH_COOKIE_SECURE=true
# 可选，默认是仓库根目录下的 data/accounts.sqlite
# AUTH_DB_PATH=/private/persistent/azurlane/accounts.sqlite
```

`AUTH_COOKIE_SECURE` 默认 `true`，HTTPS 部署保持此值；仅在本地 HTTP 测试时显式设为 `false`。账号写请求和账号 WebSocket 都校验浏览器来源，因此 `ALLOWED_ORIGINS` 必须与访问地址一致。会话使用有效期 30 天的 `HttpOnly`、`SameSite=Lax` Cookie；退出登录会撤销会话。密码、会话凭证不放入 URL 或账号的 localStorage 数据，也不写入日志。

注册只需要用户名、密码和确认密码，成功后自动登录。用户名为 1–20 个字符，支持中文，去除首尾空白并使用 NFC 规范化，不允许控制字符；规范化后不区分大小写查重和登录。密码仅要求非空且两次输入一致，不限制长度门槛或字符格式，不去除空格、不截断；单字符、数字、中文和空格都可使用。没有密码找回功能。密码以独立随机盐的异步 scrypt 摘要存储，注册和登录有请求限流及计算并发限制。

登录后使用用户名作为联机显示名称，并可打开“我的战绩”。进入房间、匹配队列或对局后，需要先退出当前流程再切换账号或退出登录。同一账号的新连接沿用单连接接管规则；游客仍保留原有浏览器身份。

只有创建对局时已登录的玩家才会关联服务器战绩，席位账号归属在创建时固定，中途登录或之后注册不会补记此前的游客对局。随机 PvP、好友房和在线 AI 均支持记录，纯游客对局不持久保存；单机战绩不上传，不提供排名或完整回放。

战绩按时间倒序显示，每页 20 条。摘要包括对局类型、双方名称和编队快照、胜负、回合数、起止时间、时长、结束阶段及原因；正常结束、认输、超时和中止使用同一归档流程。选禁阶段结束会标明未进入战斗，只保留实际已选编队，不生成未出战舰船的统计。展开战绩可查看双方逐舰的对敌有效伤害、友伤、按来源分类的承受伤害、击沉敌舰数、击落敌机数、存活状态及剩余 HP。每舰可展开伤害来源，分别列出主炮、副炮、鱼雷、航空攻击、碰撞、环境和搁浅的对敌伤害、友伤及承伤。有效伤害以实际扣除的 HP 为准，航空攻击归属母舰。完整统计仅在结束后提供给参与该对局的账号，不出现在进行中的战局快照中。

归档失败不会阻止游戏结束，页面会显示“战绩暂未保存”，服务端使用相同结果快照在 1、5、30 秒后重试。最终失败会保留错误日志；磁盘故障期间未落库的数据不保证保留，重启也不会凭空补全被打断的对局。

### 账号接口

`GET /api/config` 的 `auth.enabled` 表示服务端是否启用账号功能。账号接口使用同源 Cookie，响应不缓存：

| 接口 | 用途 |
| --- | --- |
| `POST /api/auth/register` | 提交 `username`、`password`、`confirmPassword`，注册并登录 |
| `POST /api/auth/login` | 提交 `username`、`password`，登录并设置会话 Cookie |
| `POST /api/auth/logout` | 撤销当前会话并清除 Cookie |
| `GET /api/auth/me` | 获取当前账号；未登录或功能停用时返回空身份 |
| `GET /api/me/matches` | 获取本人战绩，每页 20 条；后续页传回响应中的 `nextCursor` 作为 `cursor` 查询参数 |
| `GET /api/me/matches/:id` | 获取本人参与对局的详细统计；其他人的对局不可访问 |

功能停用时，注册、登录与战绩接口返回 `AUTH_DISABLED`，退出接口仍可清除残留 Cookie。现有 `POST /api/session` 根据有效 Cookie 识别账号；客户端不能提交账号 ID 指定归属。账号联机凭证只保留在内存中，WebSocket 同时校验账号会话和联机凭证。

### 数据目录与备份

`AUTH_DB_PATH` 默认指向仓库根目录的 `data/accounts.sqlite`。默认停用时不创建数据库；启用后由当前单进程服务使用本地持久磁盘。`data/` 已加入 Git 忽略规则，不应置于公开静态目录 `dist/`、`public/`，也不应公开提供文件下载。自定义路径同样需要部署者设置为私有持久目录并妥善限制访问；不要将数据库或备份提交到仓库。

备份时先正常停止服务，再拷贝整个私有 `data/` 目录，包括数据库及仍存在的 `accounts.sqlite-wal`、`accounts.sqlite-shm` 辅助文件；自定义路径则拷贝对应的完整私有目录。不要在运行中只复制 `.sqlite` 主文件。恢复时停止服务，将备份放回相同路径、确认访问权限，再启动服务。

## 模型配置

默认模型为 DeepSeek 官方 API 的 `deepseek-flash`，显示名称“小肥鱼”。只需在根目录 `.env` 填写 `DEEPSEEK_FLASH_API_KEY=你的密钥`，重启服务即可启用。未填写密钥的模型不会出现在选择列表中。

添加多个 AI 时，复制 `config/ai-models.example.json` 为 `config/ai-models.json`，按下面格式扩展 `models` 列表。也可通过 `AI_MODELS_FILE` 指向其他配置文件。

```json
{
  "models": [
    {"url":"https://api.deepseek.com","model_id":"deepseek-flash","name":"小肥鱼","reasoning_effort":"medium"},
    {"url":"https://your-provider.example/v1","model_id":"your-model","name":"另一位对手","protocol":"responses","reasoning_effort":"medium"}
  ]
}
```

每项的 `url` 是接口基础地址（不含 `/chat/completions` 或 `/responses`），`model_id` 同时用于请求供应商模型和选择模型，`name` 在大厅选择列表和 AI 对局中显示。`protocol` 默认 `chat`，另支持 `responses`。

`reasoning_effort` 控制该模型的推理强度，省略时默认 `"medium"`，也可按供应商和模型支持的取值配置（例如 `"low"`、`"high"`）。它必须是非空字符串；服务端保留配置值，普通和 FULL 模式及重试均使用相同设置。`chat` 请求发送顶层 `reasoning_effort`，`responses` 请求发送 `reasoning: {"effort": "medium"}`（或配置的其他值）。修改配置后重启联机服务生效。

密钥变量名由 `model_id` 转成大写、将非字母数字下划线字符替换为 `_`，再加 `_API_KEY` 自动生成。例如 `deepseek-flash` → `DEEPSEEK_FLASH_API_KEY`，`your-model` → `YOUR_MODEL_API_KEY`。变量名冲突的列表会被拒绝。旧格式的 `id/model/baseURL/secretEnvName` 应迁移为上述三个字段；配置文件不接受明文密钥。

```dotenv
DEEPSEEK_FLASH_API_KEY=你的DeepSeek密钥
YOUR_MODEL_API_KEY=另一个模型的密钥
```

`.env` 与本地 `config/ai-models.json` 已被 Git 忽略。浏览器只能取得模型 ID 和显示名称，不能读取密钥或接口地址。

`structuredOutput` 默认 false，使用 JSON 文本并进行规则校验；支持 JSON Schema 的供应商可显式设 true。官方 OpenAI Responses 建议开启 true，通过 `text.format` 的严格结构化输出约束己方舰船 ID、每船速度、弹药、主炮冷却、可出动飞机数量及可见锁定目标。请求同时提供仅由玩家视野生成的 `commandGuide`（当前数量上限、合法首步、主炮候选目标和扫雷目标），提示词要求先规划路线、再检查发射窗口及节点朝向，尽量首次返回合法指令。JSON Schema 不代替完整游戏规则校验；非法输出最多纠正一次，纠正指出未通过校验的己方舰船，失败后由玩家重试或结束。FULL 模式仍保留完整的本局己方历史。

`commandGuide` 还提供由当前视野计算的合法 `suggestedPlan` 及路线各节点的朝向、可用鱼雷方向。模型以此为起点改进战术；修改路线时必须重新检查相关发射窗口，服务端仍完整校验模型输出。

提示词将规划限制在当前回合，以建议方案为默认，仅针对可见风险或明确收益进行修改，每船最多考虑一个替代方案。模型只重新检查修改影响的规则和友军路线交互，形成合法且合理的方案后停止优化；FULL 历史仍用于当前回合判断。这是规划边界，不是 API 的硬推理 token 上限。

模型配置可设置 `fast: "none"`（默认，可省略）或 `fast: "fast"`。none 不向供应商发送 `service_tier`，保持供应商/项目默认行为；fast 在 Responses 和 Chat Completions 请求中发送 `service_tier: "fast"`，纠正请求也保留该设置。仅对支持 Fast 模式的供应商开启。服务器请求指标以 `serviceTier` 记录供应商回包的实际档位（白名单值；未提供时为 null），用来确认是否启用或回落。OpenAI 参数参考 [Fast mode 官方文档](https://developers.openai.com/api/docs/guides/fast-mode)。

默认超时 60 秒、并发 2；可按模型设置 `timeoutMs`（1–300000 毫秒）和 `maxOutputTokens`（1–32768，默认 4096）。高推理强度的战术请求可设置较长超时和较大输出上限，例如 `timeoutMs: 180000`、`maxOutputTokens: 16384`。本地模拟接口覆盖两种协议；真实供应商验收需要有效密钥。DeepSeek 接口和模型参考 [官方文档](https://api-docs.deepseek.com)，OpenAI 结构化输出参考 [官方文档](https://developers.openai.com/api/docs/guides/structured-outputs)。

### AI 请求日志与费用用量

服务端为每次实际 API 调用输出一条结构化 `ai_request` 日志（`logVersion: 2`），包含模型、协议、接口路径、对局 ID、回合/队伍、普通或 FULL 模式、已发送历史回合数、开始/结束时间、耗时、HTTP 状态及请求结果。`matchId` 关联同一局的所有回合（独立脚本未提供时为 `null`），可按此字段汇总整局费用。同一轮生成的首次与纠正请求共享 `generationId`，各自有独立的 `requestId` 和从 1 开始的 `attempt`；重试的用量单独记录，统计费用时应汇总所有尝试。`outcome: "ok"` 表示供应商请求正常完成，指令仍需后续规则校验。

`request` 记录推理强度、请求服务档位、输出上限、超时和是否启用结构化输出；`response` 记录供应商响应 ID、`x-request-id`、实际模型、完成/截断原因、响应字节数和可用的处理耗时。`serviceTier` 保留供应商实际使用的档位，未提供为 `null`，不以请求档位代替实际档位。

`usage` 保留供应商返回的数值用量及嵌套明细：输入/输出/总 tokens、缓存命中、缓存写入、推理 tokens，以及 DeepSeek Chat 的 `prompt_cache_hit_tokens` / `prompt_cache_miss_tokens`。缺失字段保持缺失，不将未知用量当作零。推理 tokens 已包含在输出总量中，核算费用时不能再叠加一次。失败、拒绝或截断回包中已提供的用量也保留；HTTP 错误正文读取仍受 1 MiB 上限和超时限制。

`providerBilling` 白名单记录兼容接口实际返回的数值 `cost`、`total_cost`、`price`、分项金额/单价及币种，保留其来源（`response` / `usage` / `billing` / `pricing`）；未返回费用为 `null`，不推断币种或伪造实际扣费。OpenAI 和 DeepSeek 官方响应文档提供 token 用量，未列出可要求响应包含本次价格的参数，因此不向这两个接口添加未经支持的价格参数。可按当时价目表、实际档位和缓存明细核算，实扣以供应商账单为准。[OpenAI 缓存计费](https://developers.openai.com/api/docs/guides/prompt-caching)、[DeepSeek Responses 用量](https://api-docs.deepseek.com/guides/responses_api/)。

上下文、历史、JSON Schema 和最终输出只记录数量、UTF-8 字节数及 SHA-256 摘要；不记录正文、完整推理、API 密钥、请求授权头或供应商自由文本错误。FULL 请求仍完整发送所有历史，日志摘要不会截断模型上下文。日志应保存到服务器的私有目录或由进程管理器收集，并配置日志轮转；不要放入 `dist/`、`public/` 或提交到 Git。

## 游玩与生命周期

### AI 回合上下文模式

在新游戏页选择服务器提供的 AI 模型卡片，编队页通过“AI 模式”选择普通或 **FULL（全部历史回合）**。默认普通，开局后模式固定，适用于列表中所有已配置模型及 `chat` / `responses` 两种协议，游客也可使用。

- **普通**：只向所选模型发送当前回合的 AI 视图，保持原有行为。
- **FULL**：在当前视图之外，一并发送本局每个已完成回合的开始局面、本方已提交指令、当时可见的单位变化及结束局面。回合中的短暂发现、移动、伤害、飞机放飞与返航等观察会保留；相同的连续观察会合并，避免重复渲染数据。已提交指令可能因碰撞或沉没中断，以实际观察结果为准。

FULL 仍遵循战争迷雾：历史只使用该 AI 当时可见的信息，不提供人类私密指令、隐藏敌舰位置或完整战斗统计。失去视野不等于确认击沉；旧位置可能已经过时。服务器按时间顺序发送所有已完成回合，不静默丢弃旧回合；第一回合历史为空，战场显示模式和已记录回合数。

历史只保存在服务器当前对局内存里，不混入其他对局、账号战绩或本地存档。一次成功结算只记录一次，模型输出纠正或手动重试沿用该回合相同的历史，重连也不会重复记录。新对局从空历史开始，重启服务器不恢复正在进行的对局或历史。

FULL 请求输入会随对局增长，可能增加用量、等待时间，并受所选模型的上下文上限限制；超过供应商限制时按现有 AI 请求失败流程提示，不自动改回普通模式。此功能不需要新增环境变量或模型配置字段。WebSocket `ai.start` 可选参数 `aiMode` 为 `standard` 或 `full`，省略时默认 `standard`；对局快照仅公开 `aiMode` 和 `aiHistoryRounds`，不向玩家公开 AI 的历史内容。

首页“联机大厅”默认使用昵称游客，登录后使用账号用户名。好友房通过房间码加入，双方准备后由房主开始选船；匹配按先后顺序两两配对，再进入相同的猜先与选禁流程。游客身份保存在当前浏览器；同一身份新连接接管旧连接。测试两个玩家请用独立浏览器资料，或分别访问 localhost 与 127.0.0.1。

PvP 部署限时 120 秒；匹配规划每轮 120 秒，好友房可选不限时、60、120、300 秒。未提交时待命，连续三轮超时判负。断线暂停规划计时，每人每局累计有 90 秒重连宽限。已锁定结算不会撤销，跳过回放不提前开启下一轮。AI 对局人类规划不限时。

战局仍只在内存中。停止或重启服务会清空房间、队列和未结束对局；客户端需要重新进入。启用账号后，已写入 SQLite 的账号、未过期会话及已结束战绩会保留，重启打断的未结束对局不会生成结果。离线单人、教学与本地存档仍可使用，在线对局不能加载本地存档覆盖服务器状态。GitHub Pages 与 ChatGPT Sites 本轮不发布，维持 v0.3.2。

## 验证与运维

`npm test` 运行引擎、界面与服务器测试；`npm run test:server` 运行服务端定向测试。`GET /api/health` 提供健康检查。使用 Ctrl+C 正常关停，客户端收到服务重启提示，进行中的 AI 请求取消。日志不输出 API 密钥或模型请求正文。

## 选船与选禁

人机和默认 PVP 编队均为 3 前排＋2 后排，每个舰种提供 3 艘同属性、不同目录 ID 的舰船。PVP 双方使用独立的 15 艘舰船池，允许双方选择相同目录 ID；禁用只作用于对方，不能禁用目标方已经选择或禁用的舰船，已选舰船不能撤回。

第一位玩家猜硬币正反面，服务端随机决定先后手。顺序为：后手 ban1 → 先手选1 ban1 → 后手选2 ban2 → 先手选2 ban2 → 后手选2 ban2 → 先手选2 ban2 → 后手最后选1。双方各选择 5 艘，共 10 次选船和 10 次禁用。任何会使前后排配额无法完成的操作都会被拒绝。双方完成并确认后才生成战局、进入部署。

猜先、每次选禁及最终确认均限时 120 秒，与房间的战斗回合限时分开。界面显示倒计时；等待操作的一方超时判负，双方均未最终确认则中止。断线时暂停选禁倒计时，沿用累计 90 秒重连预算；同一游客身份重连会恢复权威选禁进度。

服务端可通过 `GameService` 构造参数 `draftRules` 与 `draftPool` 配置规则（`createApp` 也透传这两个参数）。规则包含 `poolMode`（independent/shared）、`banTarget`（opponent/self）、`fleetLimits`（front/back 数量）和 `steps`（actor 为 first/second，action 为 pick/ban，count 为正整数）。每方选船总数必须等于配额总和且为 1–9，池内 ID 必须来自舰船目录，舰船总数和各前后排库存必须能完成双方流程；默认规则的 20 次操作不能直接套入只有 15 艘的共享池。

当前协议版本为 2；旧客户端需刷新页面。选禁阶段快照为 `stage: draft`、`round: 0`、`game: null`，包含 `draft`、`deadline` 和用于冻结倒计时的 `pausedAt`。`draft.guess` 接收 guess/revision，`draft.action` 接收 shipId/revision，`draft.confirm` 接收 revision；三者沿用 matchId、round、请求 ID 与服务器身份校验。部署和战斗阶段继续使用原协议。

### 静态资源优化（v0.8.3）

- `npm run assets:prepare` 使用 Sharp 将 `public` 的 PNG/JPEG 原图生成有损 WebP（质量 80，保留透明度）、24px 预览和响应式尺寸，写入忽略目录 `.generated`。原图保留用于编辑，生产只发布生成的目录；构建、开发、类型检查和测试会先执行生成步骤。
- 编队头像使用小尺寸图片，立绘先显示模糊预览，再淡入清晰图片；清晰图采用浏览器原生懒加载与异步解码，保留尺寸避免布局跳动。
- Node 对 `/assets` 下带 Vite 内容哈希或图片 SHA256 哈希的文件返回 `Cache-Control: public, max-age=31536000, immutable`。HTML 和没有哈希的文件使用 `no-cache`，错误响应不会长期缓存。
- `deploy/nginx.conf` 是当前 37228 → 3000 的反向代理配置，开启 JavaScript、CSS、SVG、JSON 等文本资源 gzip 和 `Vary: Accept-Encoding`；WebP 等压缩图片不再重复 gzip。更新后使用 `nginx -t` 验证并 reload。


## 对战模式兼容

在线 AI、好友房与快速匹配支持 `annihilation`（19×15 舰队歼灭）和 `domination`（21×17 三据点占领）。`/api/config` 的 `battleModes` 声明支持模式；新客户端只有在服务端明确声明时才可发起占领模式，缺少声明的旧服务继续提供歼灭模式。

`room.create`、`room.update`、`queue.join`、`ai.start` 使用 `payload.battleMode`；缺少模式的旧创建请求默认歼灭，非法值拒绝。房主修改模式会清空准备状态；匹配队列按模式隔离。对局开始后模式固定，房间、队列和对局视图均携带当前选择。

占领积分及 A/B/C 状态对双方公开，回放帧按实际结算时机携带当时状态。公开据点状态不会包含隐藏舰船身份、坐标或指令；FULL AI 历史沿用同样的可见信息边界。已结束战绩的 JSON 快照保存模式与最终据点积分，无需迁移数据库结构。普通模式、协议版本与本机存储键保持兼容。


## 对象存储美术资源

可配置本地、OSS、S3／S3兼容、COS。默认本地；私有配置路径、密钥环境变量、临时URL缓存、`npm run assets:sync` 自动同步及跨域配置见 [资源存储说明](ASSET-STORAGE.md)。同步命令独立执行，上传身份需要对象写入权限；运行服务可继续使用只读身份。JS、CSS、字体与本地回退素材仍由本服务提供。远程模式不改变游戏会话、存档格式或账号存储。
