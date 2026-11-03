# F1 新闻专栏 · 2026-11-03

入口：网站首页、资讯页 → 新闻专栏；直接地址 `#/newsroom`。车手、车队、赛事分类，支持关注对象、标题搜索和语言筛选。原有赛事战报、主队轮播、论坛和四项移动导航保留。

## 更新与数据边界

- 新闻元数据来自 [GDELT Project](https://www.gdeltproject.org/about.html#termsofuse)。[GKG 页面标题说明](https://blog.gdeltproject.org/gkg-2-0-now-includes-page-titles/)；服务读取官方英文及翻译数据增量文件，不调用持续限流的 DOC 查询端点。每 2 分钟读取两个独立清单；批次约 15 分钟，提供方可能延迟。仅收录允许域名且标题与 F1 相关的索引条目，不保证覆盖所有媒体或每一篇报道。
- 浏览器通过 SSE 接收新状态，15 秒心跳，连接中断自动重连；可见页面每 30 秒补查。新闻留存最近 7 天、最多 300 条；最后成功同步超过 6 小时停止展示，避免把失效缓存标作最新内容。断线、源端延迟与空筛选均有明确状态。
- `indexedAt` 是 GDELT 发现时间，不冒充出版时间；`publishedAt` 留空。只展示索引标题与原站链接，不抓取新闻全文、原站配图、社交图片或视频文件。GDELT 使用条件不替代出版者的著作权。
- 原中文标题直接保留；部分标题按准确原题中文整理，其余使用 [MyMemory API](https://mymemory.translated.net/doc/spec.php) 在[匿名配额](https://mymemory.translated.net/doc/usagelimits.php)内翻译。自设每日 4000 字符、每轮最多 4 次请求、缓存去重；只提交公开标题。标注机器翻译并保留原题，未得到可用译题的记录可在全部语种查看。不向翻译服务提交用户、论坛、搜索或账号内容。

## 图片和视频

- 真实赛车图片采用已有 22 张经核验的主队照片、带单独使用条件的墨西哥站照片，以及每 30 分钟更新的 Wikimedia Commons 开放相册。自动图片必须有明确 CC BY/CC BY-SA/CC0 条件、作者、拍摄日期、F1 车手和车队，源站和文件域名受限，单张不超过 3MB，校验 JPEG/PNG 文件头。本机已成功导入两张安东内利荷兰站照片。每张图单独显示来源及许可；资料图不代表最新新闻现场或人物背书。仅生成缩略尺寸，不进行内容编辑；适用许可继续保留。
- 视频使用 FORMULA 1、Mercedes-AMG PETRONAS、Ferrari 官方 YouTube 上传列表，不下载或重传视频。使用 [YouTube 官方 iframe API](https://developers.google.com/youtube/iframe_api_reference) 和[播放器参数](https://developers.google.com/youtube/player_parameters)。用户点击同意后才连接 Google/YouTube，无自动播放。独立 HTTPS 播放器页面提供原生 WebView 所需 HTTP Referrer；播放器页允许指定原生应用来源嵌入，其他页面继续禁止框架嵌入。
- 实测部分官方上传列表的视频无法嵌入或受地区/版权限制，不能保证平台视频可播放。播放器错误/连接超时有明确提示，始终提供频道原站最新视频入口；频道列表由平台更新，无伪造的“视频已同步”时间。没有将无内容的 Atom feed 或无效用户名列表冒充可用视频源。

## 运行与验收

独立公开参考服务引入 `fflate@0.8.3` 流式处理压缩增量，压缩/解压大小和条目路径受限；最新文件核验清单 MD5。禁止任意来源抓取。原有论坛数据库继续使用原 StateDirectory，不重置账号或帖子。首发种子仅使用本次从真实接口取得的数据和开放图片，保留实际同步时间；运行后持续自动增量更新。

检查项目：lint、TypeScript、现有 49 个前端单元测试、3 个基线测试、9 个公开服务测试；WebKit 320/390px 与 Edge 桌面检查真实新闻、分类/搜索、图片加载、署名许可、视频加载同意/关闭、官方来源入口和移动四项底栏。验收证据位于 `docs/verification/newsroom/`，未作实体 iPhone 播放或所有地区可用性承诺。

## 发布结果

- 香港网站已发布 release `20261103040654`：[新闻专栏](https://api.nobistudio.com/racing/#/newsroom)。公网 API 返回 `ready`，首发 7 条新闻自动增加至 8 条；2026-11-03 04:35 UTC 验证时，来源批次为 04:30 UTC、最新索引发现为 04:15 UTC。8 条均有中文标题；这是一轮真实观测，不保证未来每条新闻都有即时译题或完整覆盖。
- 公网已核验两张动态开放照片的 MIME、字节内容和许可，SSE 首个数据事件及 15 秒心跳正常，主站继续禁止页面框架嵌入。服务无自动重启，观测内存峰值约 129 MiB，低于自有服务的 192 MiB 限额。
- 公网 WebKit 320/390px 和 Edge 桌面验收通过。初次验收的 5 秒路由等待不足，随后调整为等待导航及异步资源就绪；本机浏览器还出现过资源不足，停止本次专用预览后串行复验通过。没有修改其他本机或服务器应用。
- Android `1.0 (5)` 签名、包名和版本核验通过；本机、服务器及公网下载 SHA-256 一致：`8cc1fb71edd5abbcf192a298dda5c93f30c131942811a5101adcbc07d7e21156`。[测试 APK](https://api.nobistudio.com/racing/downloads/NOBI-Racing.apk)。
- iOS `1.0 (106)` 已经 [Codemagic 构建并上传](https://codemagic.io/app/6ae70684fd8c853064084b4a/build/6ae95e59c317a2c8bacdb87c)，所有步骤成功；Apple 确认为 `VALID / IN_BETA_TESTING`，可供现有内部测试组安装。没有提交 App Store 正式审核或新增测试邀请。
