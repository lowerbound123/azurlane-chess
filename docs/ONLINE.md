# 联机服务部署（v0.4.2）

使用 Node.js 25。一个进程、一个端口同时提供网页、HTTP API 与 WebSocket；无需 Docker、数据库或 Redis。

```sh
npm ci
npm run build
npm start
```

默认访问 http://127.0.0.1:3000。缺少 dist/index.html 时服务会提示先构建。启动命令为 `node --env-file-if-exists=.env server/index.js`。

## 配置

复制 `.env.example` 为 `.env`。`HOST` 默认 `127.0.0.1`；局域网可设为 `0.0.0.0`。`PORT` 默认 `3000`。`ALLOWED_ORIGINS` 必须列出浏览器实际访问的完整来源（协议、主机、端口），多项用逗号分隔。公网部署在 HTTPS 反向代理后，代理同时转发 `/ws` 的 WebSocket Upgrade，请将实际 HTTPS 域名加入允许来源。服务不自动安装后台守护程序。

## 模型配置

复制 `config/ai-models.example.json` 为 `config/ai-models.json`，设置 `AI_MODELS_FILE=config/ai-models.json`。该本地配置和 `.env` 已忽略，不应提交。

每个模型的 `id` 唯一，`name` 是大厅显示名称，`model` 是供应商模型标识。`baseURL` 包含 `/v1`；`protocol` 为 `chat` 或 `responses`，分别追加 `/chat/completions` 或 `/responses`。`secretEnvName` 指定读取密钥的环境变量，例如 `.env` 中的 `AI_CHAT_API_KEY` 和 `AI_RESPONSES_API_KEY`。浏览器只能获取模型 ID 和名称。

支持 JSON Schema 的模型设 `structuredOutput:true`，否则设 false，仍会校验 JSON 与游戏规则。默认超时 60 秒、并发 2。非法输出最多纠正一次；失败暂停等待玩家手动重试或结束，不会切换成规则 AI。未配置模型不影响好友房和匹配。示例中的模型名需替换为供应商实际支持的模型。本地模拟接口已覆盖两种协议；真实供应商验收需要有效配置与密钥。

## 游玩与生命周期

首页“联机大厅”使用昵称游客。好友房支持房间码、选舰、准备及房主开战；匹配按先后顺序两两配对。游客身份保存在当前浏览器；同一身份新连接接管旧连接。测试两个玩家请用独立浏览器资料，或分别访问 localhost 与 127.0.0.1。

PvP 部署限时 120 秒；匹配规划每轮 120 秒，好友房可选不限时、60、120、300 秒。未提交时待命，连续三轮超时判负。断线暂停规划计时，每人每局累计有 90 秒重连宽限。已锁定结算不会撤销，跳过回放不提前开启下一轮。AI 对局人类规划不限时。

战局只在内存中。停止或重启服务会清空房间、队列和对局；客户端需要重新进入。离线单人、教学与本地存档仍可使用，在线对局不能加载本地存档覆盖服务器状态。GitHub Pages 与 ChatGPT Sites 本轮不发布，维持 v0.3.2。

## 验证与运维

`npm test` 运行引擎、界面与服务器测试；`npm run test:server` 运行服务端定向测试。`GET /api/health` 提供健康检查。使用 Ctrl+C 正常关停，客户端收到服务重启提示，进行中的 AI 请求取消。日志不输出 API 密钥或模型请求正文。
