# AI 与角色扩展接口（v0.2 未连接真实模型）

界面运行预设分支对白，关系、剧情和钱包只有 engine.mjs 的 dispatch() 可以修改。真实模型不能直接修改 GameState，也不能自动创建收款人或账单。

## 已预留的异步入口

dialogue-provider.mjs 导出：

- buildDialogueContext(state, contactId, confirmedMoneyDraft?)：构建当前路线、人物标签、联系人公开资料、最近12条聊天、公开人物记忆、待处理红包、当前事项与允许动作；不发送隐藏关系或经营数值。
- scriptedAsyncProvider.propose(context)：异步脚本 Provider。
- validateDialogueProposal(value, context)：校验1–4句对白及允许的动作。
- requestDialogue(provider, context, { signal, timeoutMs })：默认8秒超时，失败或无效返回时降级脚本；用户取消时结束请求。

api-provider.example.mjs 提供同一 propose() 接口的 HTTPS 后端客户端。示例不在 app.mjs 中启用，没有任何模型密钥或外部请求。

后续接入示意：

~~~js
import {buildDialogueContext, requestDialogue} from './dialogue-provider.mjs';
import {createRemoteDialogueClient} from './api-provider.example.mjs';

const client = createRemoteDialogueClient({endpoint:'https://your-backend.example/v1/dialogue'});
const eventId = activeEvent(game)?.id;
const context = buildDialogueContext(game, contactId);
const result = await requestDialogue(client, context, {signal:controller.signal});
// 先确认当前路线、联系人和 eventId 没有改变，再显示 result.lines。
// result.intent 仍需玩家确认，然后才交给 dispatch(game, result.intent)。
~~~

后端接收 schema = game004.dialogue.v3，返回：

~~~json
{
  "lines": ["收到，我把原始记录按时间整理给你。"],
  "intent": {"type":"CHOOSE","eventId":"w1-task","choiceId":"a"}
}
~~~

返回意图必须与 allowedIntents 中一项逐字段相等。SEND_MONEY 只在玩家已经确认的金额、方式、联系人、备注和 clientActionId 被显式加入允许列表时可提议；SETTLE_INCOMING_MONEY 也只能复用玩家刚刚确认的交易编号、领取/退还决定和请求编号。模型不能自行生成金额或改变关系。所有意图仍由 dispatch() 再检查当前剧情、余额与幂等记录。

正式启用还需：自有后端保存密钥；在 UI 增加等待/取消与过期回应丢弃；将 CSP 的 connect-src 限定到精确后端域名；为模型内容增加审核和速率限制。当前接口是经过测试的接入边界，不代表真实 AI 功能已上线。

## 增加角色或路线

content.mjs 的 SCENARIOS 是路线注册表，分别维护核心事件、6个跨日关系回响、动态、社交模板、日程、隐藏状态键和引导联系人。PERSONAS 记录路线所属人设、初始余额和状态。

新增角色时在相应角色模板增加稳定 ID、displayName、legalName、职业、成年年龄、性格、identityTags 与 moneyPolicy。显示名应混用网名、职位、企业前缀和熟人称呼。补充头像路径、事件或动态作者，并调整该路线联系人数量测试与迁移。不要让模型临时发明联系人 ID。

moneyPolicy 分为 social（收红包）、business（收转账）、formal（主动来款退还）。该策略只影响自由交易，剧情款项按内容规则处理。

新增路线需要同时登记 SCENARIOS、ROUTES、人物预设，以及 engine.mjs 中对应的结局判定和必要存档迁移。新增隐藏状态只能通过规则层 effects() 提交。

## 存档与付款约束

v5 保留原存档键 game004.chairman.v1。v1/v2/v3/v4 逐级迁移；旧局保留原始余额、姓名、选择和聊天，不会倒播已经过去的关系回响。原 underdog 映射为董事长 / 白手起家；重新开始才进入真正的牛马路线。

transactions 是交易事实，messages 只引用 transactionId；ledger 为借贷明细。玩家发出后被退还是同笔交易下的支出和关联退款；NPC待领取红包没有流水，领取后才生成收入，直接退还不生成虚假收支。钱包必须等于初始余额＋收入－支出。重复动作 ID、缺失交易卡、孤立流水和无法匹配剧情的存档会进入恢复页。

纯前端原型能识别结构矛盾和重复操作，不能提供服务器或密码学级的防篡改保证。
