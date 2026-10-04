# 联机服务部署（v0.4.3）

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

默认模型为 DeepSeek 官方 API 的 `deepseek-flash`，显示名称“小肥鱼”。只需在根目录 `.env` 填写 `DEEPSEEK_FLASH_API_KEY=你的密钥`，重启服务即可启用。未填写密钥的模型不会出现在选择列表中。

添加多个 AI 时，复制 `config/ai-models.example.json` 为 `config/ai-models.json`，按下面格式扩展 `models` 列表。也可通过 `AI_MODELS_FILE` 指向其他配置文件。

```json
{
  "models": [
    {"url":"https://api.deepseek.com","model_id":"deepseek-flash","name":"小肥鱼"},
    {"url":"https://your-provider.example/v1","model_id":"your-model","name":"另一位对手","protocol":"responses"}
  ]
}
```

每项的 `url` 是接口基础地址（不含 `/chat/completions` 或 `/responses`），`model_id` 同时用于请求供应商模型和选择模型，`name` 在大厅选择列表和 AI 对局中显示。`protocol` 默认 `chat`，另支持 `responses`。

密钥变量名由 `model_id` 转成大写、将非字母数字下划线字符替换为 `_`，再加 `_API_KEY` 自动生成。例如 `deepseek-flash` → `DEEPSEEK_FLASH_API_KEY`，`your-model` → `YOUR_MODEL_API_KEY`。变量名冲突的列表会被拒绝。旧格式的 `id/model/baseURL/secretEnvName` 应迁移为上述三个字段；配置文件不接受明文密钥。

```dotenv
DEEPSEEK_FLASH_API_KEY=你的DeepSeek密钥
YOUR_MODEL_API_KEY=另一个模型的密钥
```

`.env` 与本地 `config/ai-models.json` 已被 Git 忽略。浏览器只能取得模型 ID 和显示名称，不能读取密钥或接口地址。

`structuredOutput` 默认 false，使用 JSON 文本并进行规则校验；支持 JSON Schema 的供应商可显式设 true。默认超时 60 秒、并发 2，非法输出最多纠正一次，失败后由玩家重试或结束。本地模拟接口覆盖两种协议；真实供应商验收需要有效密钥。DeepSeek 接口和模型参考 [官方文档](https://api-docs.deepseek.com)。

## 游玩与生命周期

首页“联机大厅”使用昵称游客。好友房支持房间码、选舰、准备及房主开战；匹配按先后顺序两两配对。游客身份保存在当前浏览器；同一身份新连接接管旧连接。测试两个玩家请用独立浏览器资料，或分别访问 localhost 与 127.0.0.1。

PvP 部署限时 120 秒；匹配规划每轮 120 秒，好友房可选不限时、60、120、300 秒。未提交时待命，连续三轮超时判负。断线暂停规划计时，每人每局累计有 90 秒重连宽限。已锁定结算不会撤销，跳过回放不提前开启下一轮。AI 对局人类规划不限时。

战局只在内存中。停止或重启服务会清空房间、队列和对局；客户端需要重新进入。离线单人、教学与本地存档仍可使用，在线对局不能加载本地存档覆盖服务器状态。GitHub Pages 与 ChatGPT Sites 本轮不发布，维持 v0.3.2。

## 验证与运维

`npm test` 运行引擎、界面与服务器测试；`npm run test:server` 运行服务端定向测试。`GET /api/health` 提供健康检查。使用 Ctrl+C 正常关停，客户端收到服务重启提示，进行中的 AI 请求取消。日志不输出 API 密钥或模型请求正文。
