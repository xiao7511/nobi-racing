# 本机英中翻译

仅监听 `127.0.0.1:5291`，使用 Argos en-zh 1.9 模型、CTranslate2 CPU 推理和 OpenCC 转为简体。不调用第三方翻译 API、不收费、不将新闻发送到外部翻译服务。用于本机个人阅读辅助，输出可能有误。

在项目根目录安装（Python 3.11）：

```powershell
python -m venv .tools/translation/venv
.tools/translation/venv/Scripts/python.exe -m pip install -r services/local-translation/requirements.txt
Invoke-WebRequest -Uri 'https://argos-net.com/v1/translate-en_zh-1_9.argosmodel' -OutFile .tools/translation/en-zh.argosmodel
.tools/translation/venv/Scripts/python.exe services/local-translation/install_model.py --archive .tools/translation/en-zh.argosmodel
./scripts/local-translation.ps1 start
```

官方备用模型地址：`https://data.argosopentech.com/argospm/v1/translate-en_zh-1_9.argosmodel`。两个地址本次实测 SHA-256 均为 `433e7c4f034d87fbe2353161e05f18646d7999452f801a4e1f0378522b9850ab`，安装脚本拒绝不匹配内容。不要更改校验值来忽略下载错误。

`GET /health` 验证模型就绪；`POST /translate` 接收 `{"texts":["An English headline"],"source":"en","target":"zh-CN"}`，最多 40 段、每段 1200 字符。`source` 默认 `en`；设为 `zh` 时仅通过 OpenCC 转简体，不送入英文模型。总请求体最多 64 KiB，单个推理任务持锁执行，其他并发请求返回 busy；不开放 CORS。只有可信本机进程应连接该服务，不要映射到公网。`scripts/local-translation.ps1 status/stop` 按保存的 PID、启动时间和命令行识别本项目进程。

公开新闻服务 `services/public-reference` 默认使用上述本地翻译地址，批量处理英文新闻标题和公开摘要。可通过 `NEWS_TRANSLATION_URL` 指定兼容端点，或用 `NEWS_TRANSLATION_ENABLED=false` 关闭本地请求。端点需要与新闻 API 一起运行；停用时仅有配额受限的 MyMemory 后备翻译，未完成的条目保持待翻译状态。此前 Java API 的启用规则见下文。

API 的 `NEWS_TRANSLATION_ENABLED=true` 启用调用，通用部署默认关闭。项目的 local profile 默认启用；本轮独立 5290 预览显式启用。模型、虚拟环境与日志保存在 Git 忽略的 `.tools/`、`.cache/` 中，不把数十 MB 权重加入仓库。

`content/news-zh-edited.json` 是按“原文链接 + 原标题 + 原摘要”的 SHA-256 匹配的 AI 辅助中文校订稿。只有对应的实时源条目及原文内容完全一致才使用，源内容变化就不匹配；它不作为来源失败时的新闻缓存或样例回退。新条目通过本机模型翻译，页面区分“AI 辅助中文校订”和“本机机器翻译”。两者都不是发布方提供的中文稿，不构成事实核查。

来源与许可：[Argos Translate](https://github.com/argosopentech/argos-translate)、[官方模型目录](https://github.com/argosopentech/argospm-index)、[维护者对模型 MIT/CC0 许可的说明](https://github.com/argosopentech/argos-translate/issues/533)、[CTranslate2](https://opennmt.net/CTranslate2/)。模型许可不替代新闻内容的使用条件。当前 BBC RSS 阅读及翻译仅用于用户指定的本机个人场景；公开或商业用途需另行核实来源许可。
