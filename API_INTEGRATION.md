# AI 接入预留（v0.1 不启用）

当前版本由 `content.mjs` 的 `ScriptedContentProvider` 同步提供对白，`engine.mjs` 是唯一可修改关系、公司状态和钱包的边界。未来接入模型时，不要把 API Key 放进本仓库或浏览器。示例文件是网络客户端契约，不是同步 Provider 的即插即用替代品；正式接入需要在 UI 层增加异步等待、超时与脚本降级，再把通过校验的意图交给 `dispatch()`。

建议增加自有后端 `POST /v1/dialogue`，由后端保存模型密钥。前端可复用 `api-provider.example.mjs`，发送经过裁剪的公开剧情状态、当前事件和允许的 `choiceId` 列表。返回格式：

```json
{
  "lines": ["一到四句 NPC 对白"],
  "intent": {"eventId": "d2-budget", "choiceId": "a"}
}
```

模型只提出对白与意图。程序必须继续用 `dispatch()` 校验当前事件、合法选项、唯一交易编号和钱包余额，不能接受模型直接返回的金额、关系值或公司数值。

接入时还需把 `index.html` 的 CSP `connect-src 'none'` 改成精确的 HTTPS 后端域名，并为请求增加超时、重试、内容审核和脚本内容的降级路径。

新增角色时，需要同时更新 `content.mjs` 的 `roles`、头像映射/文件、事件或动态作者、相关测试与内容审核；姓名和配色会从现有池循环取值，可按需要扩充。不要让模型临时发明联系人 ID；所有作者和交易对象仍须通过存档验证。
