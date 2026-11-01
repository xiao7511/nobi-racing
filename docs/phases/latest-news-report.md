# 最新资讯：本机个人 RSS 阅读

日期：2026-11-01。用户要求在未取得全部授权、未公开运营阶段继续开发最新资讯能力。本轮延续现有本地项目，不发布网站、不购买数据或代为签订内容合同。

## 本轮行为

资讯页优先显示 BBC Sport F1 RSS 原始新闻标题，附发布方署名、原文直达链接及来源提供的发布时间；另显示本站采集时间。支持本地标题搜索。首页展示最新五条，并保留有资料配图标注的真实赛车照片。缺少发布时间时明确显示缺失，不用采集时间冒充发布时间。最近一条有日期报道超过 72 小时时提示来源内容较旧。

后端新增 `GET /api/v1/latest-news`。固定只读取 `https://feeds.bbci.co.uk/sport/formula1/rss.xml`，十五分钟检查一次，与来源 RSS 的 TTL 一致；浏览器请求不触发上游请求。只接受 BBC Sport 频道、受限的 F1 文章路径和来源原有 RSS 参数；保留原始英文标题和原文链接，不抓取文章正文、照片或视频，不自动翻译或生成新闻。按原始发布时间排序、去重并最多展示二十条。

缓存仅在进程内保留。到期、上游失败、离线或页面隐藏时不展示旧标题；失败不回退虚构样例。可见页面三十秒检查本站 API，刷新时保持尚未到期的标题和搜索输入；错误到达后清除旧数据。来源状态刷新不抢夺搜索框焦点。读取无需等待上游网络请求完成。

网络响应上限 512 KiB，连接、响应期限与 XML 防护沿用现有工具；禁重定向、外部实体和 DTD。页面只渲染文本，API 与浏览器均校验来源、结构和有效期；生成的 OpenAPI 校验器包含此接口。远端客户端请求此个人阅读接口返回 403。

## 使用范围与来源依据

BBC Sport 的[RSS 使用说明](https://www.bbc.co.uk/sport/articles/cqllxj2n4kyo)提供网站使用说明及署名要求，并要求遵守 BBC 条款。这不是开放版权内容。BBC 的[RSS 条款入口](https://www.bbc.co.uk/usingthebbc/terms-of-use/#15metadataandrssfeeds)和[可读取的历史条款 PDF](https://downloads.bbc.co.uk/usingthebbc/bbc_terms_of_use_31March2022english.pdf)区分个人与商业用途；历史 PDF 不替代现行条款。

本轮按当前本机个人阅读场景接入，不据此断言商业网站或公开再分发已获授权。页面明确说明此限制、来源条款和非官方关系，不使用 BBC Logo。商业或公开使用前须重新核对当时的来源条款和实际业务；不能只改一个开关就视为取得授权。ICP备案和内容使用权分别处理，当前仍未公开运营。

通用配置 `LATEST_NEWS_MODE` 默认 `disabled`。仅 `personal` 且 `server.address` 为 `127.0.0.1` 或 `::1` 时启动此同步；`local` 开发 profile 默认 personal，可用环境变量显式关闭。此设置不是认证系统，也不能阻止操作者另行搭建公共反向代理；不要把 local profile 或个人阅读模式带到公共部署。F1/FIA 官网原标题适配器继续要求原有授权记录，不借 BBC 接入改变其规则。CC0 赛车基础资料仍独立展示。

## 验证

`docs/verification/latest-news/` 保存本轮日志、实际 HTTP 摘要和桌面/移动截图。未归档第三方文章正文或整份 RSS；实际请求的临时 XML 仅位于忽略的 `.cache/`。

- Java 24 项单元测试通过：新增覆盖模式/监听边界、访问来源、定时节流、过期/失败清除、标题与原始链接、时间排序、去重、缺失日期、未来日期、非赛事推广过滤、HTML/XML 和恶意链接拒绝。
- 前端 lint、类型检查、3 项 Node 基线、37 项 Vitest 和双应用构建通过。新增验证不接受额外正文、错误来源、伪造日期、重复链接，以及刷新保留/失败清除。
- 桌面 Edge 与移动 WebKit 共 6 项隔离浏览器用例，覆盖最新资讯搜索、原文链接、双语界面、到期隐藏、禁用/畸形响应、原授权撤销及版权页。隔离用例使用明确虚构的测试标题，不代表实际新闻或授权。
- `node scripts/verify-latest-news-live.mjs` 直接访问真实 Java API，在两种浏览器验证真实 BBC Sport RSS 的标题、链接、发布时间、搜索和首页五条预览；没有浏览器 API 替身。本轮实际取得二十条。证据见 `live-browser.json`、`live-http.json`、`latest-news-*.png` 及 `home-*.png`。
- OpenAPI 校验及生成漂移检查通过；保留原 readiness 缺少 4xx 声明的一个警告。未重跑完整 PostgreSQL/Redis Phase 3 集成，未改变 Flyway 迁移。

## 预览及复现

页面：`http://127.0.0.1:5279/#/news`；本轮 API：`http://127.0.0.1:5290`，显式 `--nobi.latest-news.mode=personal`。真实赛历/积分仍是原有 MOCK 数据模式；本轮预览 API 未配置原本数据库凭据，相关页面可能显示不可用，不能解读为真实比赛空数据。

常规开发可运行 `scripts/local-phase2.ps1 start` 启动带数据库的 local profile API（5280），再运行车迷端。需要系统代理的 Windows 环境使用 `-Djava.net.useSystemProxies=true`；不内置代理地址或关闭 TLS 验证。

测试命令：`pnpm check:phase1`、`mvn -f services/racing-api/pom.xml test`、`pnpm check:api`、`pnpm api:client:check`、`pnpm exec playwright test -c playwright.official.config.ts`。本机 Edge 设置 `NOBI_BROWSER_CHANNEL=msedge`。真实预览检查用 `node scripts/verify-latest-news-live.mjs`，可通过 `NOBI_OPEN_PREVIEW` 指定其他回环 HTTP origin。

Windows 运行预览时将构建 JAR 复制到唯一的 `.cache/latest-news/runtime-*` 目录后启动，避免正在运行的 JAR 锁住 Maven 后续打包。仅停止经 PID、Java 进程名、JAR 名和 5290 端口参数验证的本轮预览进程；没有停止其他项目。

本次交付不等于整个赛车产品或法律审查完成。真实赛事实时来源、身份与编辑后台、原生包、公开运营主体及相关备案/许可仍按既有计划推进。
