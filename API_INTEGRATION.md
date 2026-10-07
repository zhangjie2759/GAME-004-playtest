# GAME-004 v0.3 对话 API 接口

目前手机输入框已接入 `SEND_FREE_MESSAGE`，本地脚本负责离线回复。真实模型未启用，页面会显示“离线演示”。钱包、证据、人物关系、剧情和结局均由 `engine.mjs` 的 `dispatch()` 决定。

## 将来接入国内模型

浏览器只调用你自己的 HTTPS 服务，不直接连接百炼，也不保存模型密钥。服务端把密钥放入环境变量或云平台 Secret，调用对应地域的模型 API；公开仓库和浏览器代码里不能出现密钥。先在百炼控制台确认地域和免费额度，再决定模型及服务部署地址。

前端开关位于 `ai-config.mjs`。当前试玩版已连接北京区域的阿里云函数计算代理，`index.html` 的 CSP `connect-src` 仅允许该精确服务域名。千问 API Key 只保存在函数环境变量 `DASHSCOPE_API_KEY` 中，静态 GitHub Pages 和本仓库均不保存密钥。

部署端点：`https://game-dialogue-mosiwwjfts.cn-beijing.fcapp.run/v1/dialogue`

`remote-dialogue-client.mjs` 通过 POST 把 `buildDialogueContext(state, contactId, null, userMessage)` 的 JSON 发给服务端，且不携带浏览器凭据。服务端应验证来源、限制频率和请求大小，并实现会话验证；不能相信浏览器传来的游戏状态来记账。`requestDialogue()` 在超时、网络错误和无效结构时使用本地角色回复。用户取消时应立即停止等待。

请求 `schema` 为 `game004.dialogue.v4`，包含路线、玩家标签、固定角色人设、近 12 条聊天、公开人物记忆、近期动态、当前事项以及 `allowedIntents`。不包含隐藏关系分数或钱包内部可写状态。服务端返回示例：

```json
{
  "replyLines": ["我先核对原始记录，再给您一个明确时间。"],
  "reactionType": "understood",
  "emotion": "guarded",
  "memorySignal": "none",
  "proposedIntentId": "intent-1"
}
```

`replyLines` 需为 1–4 句，每句不超过 300 字。`reactionType`、`memorySignal` 和意图 ID 必须经过 `validateDialogueProposal()` 白名单校验。模型不能生成新的联系人、交易金额或状态效果。`proposedIntentId` 必须是本次请求 `allowedIntents` 中的 ID；最终动作仍由 `dispatch()` 检查当日事件、联系人、余额和幂等编号。涉及剧情款项时前端先显示金额确认，玩家确认后才执行。模型提出的记忆信号当前仅记录，不独立改关系；未来如需生效，必须增加可验证的规则依据。

全部角色位于 `personas.mjs`，使用稳定的路线与联系人 ID。增加角色时在 `content.mjs` 登记稳定 ID、成年年龄、网名、职业和头像路径，并在 `personas.mjs` 补全人格与朋友圈；模型不能临时创造可交互联系人。

存档键仍为 `game004.chairman.v1`，内容版本为 v6。旧版本顺序迁移，异常存档进入恢复页，不静默覆盖。此版本是原型，仍需在 Jay 手机上确认对话真实感和剧情节奏。
