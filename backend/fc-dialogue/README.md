# GAME-004 阿里云函数计算对话后端

`app.py` 是已部署到阿里云函数计算北京区域的 Python 3.10 Web 函数，启动命令为 `python3 app.py`，监听 `FC_CUSTOM_LISTEN_PORT`。公开接口为 `POST /v1/dialogue`。

必填环境变量：`DASHSCOPE_API_KEY`。推荐同时配置 `DASHSCOPE_BASE_URL` 为百炼北京业务空间的 OpenAI 兼容 Base URL；默认回退至 DashScope 公共域名。可选变量：`QWEN_MODEL=qwen3.7-plus`、`ALLOWED_ORIGIN=https://zhangjie2759.github.io`、`RATE_LIMIT_PER_HOUR=60`、`MODEL_TIMEOUT_SECONDS=28`。为兼容旧配置，程序会把低于 28 秒的模型超时自动提升到 28 秒。

当前公网地址为 `https://game-dialogue-mosiwwjfts.cn-beijing.fcapp.run/v1/dialogue`。触发器采用无需认证模式供静态 H5 调用；后端仍会校验精确 Origin、请求结构、允许意图、输出结构和调用频率。

API Key 只能填入函数计算的环境变量或 KMS，不得写入本目录、前端或 GitHub。CORS 与实例内限流仅适合个人试玩；扩大公开测试前应增加服务端会话鉴权或验证码，并设置百炼预算/用完即停。
