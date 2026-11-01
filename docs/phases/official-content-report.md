# 开放资料同步、实拍照片及合规展示

日期：2026-11-01。延续本地 Vue / Spring Boot 项目。用户要求继续开发，后续明确尚未取得全部授权，只同步无需单独申请授权的信息。本轮不注册新的托管站点，不公开发布。

## 已实现与验证

- 首页与资讯页提供官网直达链接、来源状态、独立的开放赛车资料和原创 MOCK 样例。新增 `/legal` 中英双语隐私、版权、来源及发布状态页面，所有页面页脚可达。
- `/api/v1/open-catalog` 默认启用：固定读取 Wikidata 三个条目（Ferrari F2005、Lewis Hamilton、Max Verstappen）的标签、短描述、源修订时间与修订号。主条目结构化元数据以 CC0 开放，无需另行逐项申请转载许可；不混入 Wikipedia 正文或受保护的官网新闻。每六小时同步；失败移除缓存，十五分钟后允许下次尝试；每分钟调度检查。最多 512 KiB 网络响应，解析器额外限制为 64 KiB。禁止重定向，连接和总请求超时，固定 HTTPS 端点，不接受用户输入的外部 URL。元数据仅保留内存，过期或重启后不以打包样例代替。
- 开放资料界面显示社区维护来源、许可、同步时间、原始修订时间、版本和条目直达链接，缺译时显示原文。它不是官方新闻、当前赛历或积分结果。
- `/api/v1/official-news` 仅提供固定 F1/FIA 来源状态。无有效授权时不请求 RSS、不返回标题。未来确有书面授权时才可通过服务器授权文件开启标题/直达链接同步；校验批准状态、证据编号、起止时间、地区和能力，每次读取及同步完成后重新检查。过期、撤销、配置损坏或上游失败移除内存事实。抓取正文、视频和官网媒体图片均不支持。
- 全部 `RacingArt` 示意赛车替换为本站提供的真实照片。Ferrari F2005 为 2018 年铃鹿历史赛车照片，Audi 为 2026 年多伦多展车照片。图片保留作者与许可、资料配图标注、准确替代文本及法律页原图来源；未将照片标成虚构车队或当前赛事。
- OpenAPI 及生成类型/校验器覆盖两个新接口。原赛事客户端限制在赛事接口集合，开放资料通过单独的结构、来源白名单和时效校验读取。新增工具类型环境声明，修复引入 transport 后测试类型检查缺少 Vite 声明的问题。

验证证据位于 `docs/verification/official-content/`：前端 lint、类型检查、3 项 Node 基线和 32 项 Vitest、双应用构建通过；19 项 Java 单元测试通过；官网状态/授权撤销/到期与双语图片页面共 4 项桌面 Edge、移动 WebKit 用例通过。`live-http.json`、`live-browser.json` 和 `live-news-*.png` 记录真实 Java→Wikidata→同源 API→浏览器同步，无浏览器接口替身。隔离浏览器用例的新闻标题为测试构造，不是实际转载授权证据。

OpenAPI lint 通过，保留原 readiness 缺少 4xx 响应声明的一个警告；生成客户端漂移检查通过。未执行完整 Phase 3 PostgreSQL/Redis 集成回归，本轮不改变数据库或 Flyway 迁移；不能将本轮单元及新功能浏览器测试称作全部系统验收。

## 本机预览和复现

本次预览页面：`http://127.0.0.1:5279/#/news`；API：`http://127.0.0.1:5290`。本轮独立 API 未配置持久数据库凭据，新闻、开放资料和法律页可用，赛历/积分页面需要按 README 的本地数据库流程启动正式本地 API，不能将其失败状态理解为真实赛事空数据。

常规本地流程先构建后端，再用 `scripts/local-phase2.ps1 start` 启动数据库与 API，车迷端仍默认代理 5280。脚本的 Java 服务启动已加入 `-Djava.net.useSystemProxies=true`，使用当前 Windows 系统代理；不内置代理地址、不关闭 TLS 验证。其他 Java 启动方式在需要系统代理的环境也需显式传入此 JVM 参数。`OPEN_CATALOG_ENABLED=false` 可关闭开放资料同步。

执行：`pnpm check:phase1`、`mvn -f services/racing-api/pom.xml test`、`pnpm check:api`、`pnpm api:client:check`。浏览器：`pnpm exec playwright test -c playwright.official.config.ts` 及 `pnpm exec playwright test tests/e2e/legal.spec.ts`。有本机 Edge 时设置 `NOBI_BROWSER_CHANNEL=msedge`。真实联网预览验证：`node scripts/verify-official-live.mjs`，默认访问 5279，可用 `NOBI_OPEN_PREVIEW` 指定其他回环 HTTP origin。

## 官网授权适配器

当前没有任何批准授权文件，默认保持关闭，符合用户后续指示。只有在运营方取得覆盖实际用途的有效权利后，才可将 `NEWS_GRANTS_FILE` 指向服务器可读的 JSON 数组。每条记录须包含 `sourceId`（formula1/fia）、`status`（approved）、`evidence`（真实证据引用）、`validFrom`/`validUntil`（UTC ISO 时间）、`territories`（包含 DATA_TERRITORY）和 `capabilities`（包含 headline-link-display）。这是受信任的运营配置，不是审批工作台；填写字段不会创造法律上的授权。不要提交合同、身份资料或凭据。

## 照片溯源

照片原始文件未修改，页面以容器裁切展示。Ferrari 文件及适用改编遵循 CC BY-SA 2.0，独立于项目代码。许可不授予商标、肖像或背书权利。

| 文件 | 作者 / 许可 | SHA-256 |
| --- | --- | --- |
| apps/fan/public/media/ferrari-f2005.jpg | Takayuki Suzuki / CC BY-SA 2.0 | AFA04F3B559B7811164B6073F5DECC3E3F186A1FA201B344A58AD74C9CD03953 |
| apps/fan/public/media/audi-revolut-f1.jpg | Mustang Joe / CC0 1.0 | E703FE66E4FBF4639AE1014B558DD7B869EB650236B58AFB61183D54A0D388A7 |

原始元数据见 `image-license-evidence.json`，网页来源见法律页。原图许可页：[Ferrari](https://commons.wikimedia.org/wiki/File:Ferrari_F2005_2018_Japanese_Grand_Prix_(45632549731).jpg)、[Audi](https://commons.wikimedia.org/wiki/File:Audi_Revolut_F1.jpg)。

## 尚需完成的开发及发布条件

- 原 Phase 1–6 的身份/BFF/OIDC、编辑与审核后台、云端偏好、移动原生包、通知和生产运维仍未实现，不能把本次内容同步里程碑称为整个赛车产品完成。
- 当前赛历、车手榜和积分仍为合成 MOCK；尚未取得可用于当前用途的真实赛事实时/成绩来源。本轮没有通过抓取官网表格绕开原来源授权策略。
- 待运营方确定主体、上线地区、联系方式、真实投诉/更正/隐私权利渠道、日志保存策略，再结合服务性质完成适用的备案、许可与专业法律审查。中国大陆部署应核实互联网信息服务、个人信息保护、著作权及可能适用的互联网新闻信息服务要求，不预设体育资讯必然豁免。不得伪造主体或备案号。
- 来源公开可读不等于允许转载。F1 RSS 条款限制商业聚合及修改；免责声明、署名或 robots 许可均不替代著作权或合同许可。开放资料也不能冒称官方权威结果。

依据：[Wikidata 许可](https://www.wikidata.org/wiki/Wikidata:Licensing)、[F1 法律条款](https://www.formula1.com/en/information/legal-notices.7egvZU48hzrypubGBNcQKt)、[F1 使用指引](https://www.formula1.com/en/information/guidelines.4EOKE9RRqevL4niTK9kWyt)、[个人信息保护法](https://www.miit.gov.cn/jgsj/zfs/fl/art/2022/art_515a4b20c12f430eab54bb4f56d89f56.html)、[互联网信息服务管理办法](https://www.miit.gov.cn/datainfo/fgk/gytxyxxhfg/xzfg/art/2020/art_44595811ff9a42b9b073386046905103.html)。本报告记录技术措施与待办，不作法律合规认证。
