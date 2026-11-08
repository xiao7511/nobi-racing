# NOBI Racing

2026-11-08 后续更新：优化翻译优先队列与失败重试、增加首页新闻图片轮播及全站左右切换，见[新闻与页面交互更新报告](docs/phases/newsroom-enhancements.md)。

2026-11-08 更新：新闻阅读入口、简体中文翻译队列与 F1 官方最新图片／视频同步已在代码中实现，本机验证与运行要求见[新闻中文阅读与最新媒体报告](docs/phases/newsroom-chinese-live-media.md)。本次尚未发布线上或更新移动安装包。

2026-11-02 更新：资讯源两分钟检查、站内战报阅读、F1 规则入门、11 支关注主队图片轮播、持久化注册及人工审核车迷论坛，见[本次更新报告](docs/phases/community-news-update.md)。

公开版本已部署至 [香港站点](https://api.nobistudio.com/racing/)，[Android 测试安装包](https://api.nobistudio.com/racing/downloads/NOBI-Racing.apk)可直接下载。公开版本由 `services/public-reference` 定时同步 F1DB CC BY 4.0 赛历和成绩，提供原创中英文赛况简报、赛道图和本机关注收藏；不启用个人用途的 BBC/OpenF1 接入。最新分站照片使用有条件允许非商业编辑用途的 Audi 官方实拍，并显示出处和权利说明。

原生包名为 `com.nobistudio.racing`。Android 测试 APK 已构建并验证签名；iOS 使用根目录 `codemagic.yaml` 的 `ios-archive` / `ios-testflight` 工作流，签名资料仅存在 Codemagic 加密变量组中。发布和验证详情见 [公开与移动发布报告](docs/phases/public-mobile-release.md)。以下早期阶段记录保留历史范围，以该发布报告描述的当前版本为准。

个人中心更新：`/#/profile` 可集中管理真实车手／车队／周末关注及资讯原文书签，查看所关注周末的下一场会话，支持取消关注、移除收藏及本机数据清理。选择仅存本机，来源失效时不保留旧事实。范围与验证见 [个人中心报告](docs/phases/personal-world-report.md)。

赛季统计更新：`/#/stats` 已接入 OpenF1 的已结束正赛积分参考，支持车手／车队榜、各站回看、精确分差、积分走势图、双人／双队对比和搜索排序。当前收录 18 场快照、23 位积分榜车手与 11 支车队，采用中英双语及深浅主题。范围、运行与验证见 [赛季统计报告](docs/phases/season-insights-report.md)。

赛道地图更新：赛事列表及周末详情已补齐当前赛历 25 个赛道的本地 SVG 路线图，支持放大及位置链接，并保留作者和 CC BY 4.0 许可。赛事页底部“开发样例赛历 / MOCK”已移除。来源与验证见 [赛道地图报告](docs/phases/circuit-maps-report.md)。

简体中文与周末更新：资讯现提供中文标题和 RSS 短摘要、原文对照及本机翻译；赛事页新增 OpenF1 真实周末参考、完整会话、时区切换、取消状态及相关中文报道。范围与验证见 [中文资讯及赛事周末报告](docs/phases/chinese-weekends-report.md)。

最新资讯更新：本机个人阅读模式已接入 BBC Sport F1 RSS 原始标题、发布时间及原文链接，资讯页支持搜索、首页展示五条。通用部署默认关闭，local profile 才默认启用个人模式，不能据此用于商业或公开转载。验证和运行说明见 [最新资讯报告](docs/phases/latest-news-report.md)。

2026-11-01 更新：已增加 Wikidata CC0 开放赛车基础资料自动同步、官网直达及转载授权状态、真实赛车实拍照片、中英双语隐私版权来源页。开发与验收范围见 [开放资料报告](docs/phases/official-content-report.md)。真实赛历与积分仍为 MOCK；没有授权时不转载官网新闻。新增页面：`/#/legal`。

全球赛车资讯 App，支持 English (en-US) / 简体中文，使用 Vue 3、TypeScript、Pinia、Vue Router 和 Capacitor。Phase 1 实现五个主入口、详情及设置页；当前通过 Spring Boot API 读取本地数据库中的原创合成赛事数据。

## 当前状态

Phase 3 车迷端默认通过同源 `/api/v1` 接入 Phase 2 后端。首页、赛事/会话/成绩、车手、车队、积分与关注列表读取 PostgreSQL 合成数据，显示来源与更新时间；赛季切换使用服务器目录。API 失败不会回退内置夹具，积分保持服务端十进制原值。详情和验收边界见 [Phase 3 报告](docs/phases/phase-3-report.md)。新闻仍为本地原创样例，真实身份、编辑发布、商业数据与原生包尚未实施。

本地后端：构建后运行 `./scripts/local-phase2.ps1 start`，访问 [readiness](http://127.0.0.1:5280/api/v1/readiness) 或 [中文赛历](http://127.0.0.1:5280/api/v1/races?locale=zh-CN)。`status` 查看状态，`sync` 执行授权合成同步，`stop` 停止本项目服务并保留卷。本地凭据仅保存在忽略的 `.cache/phase2/`。

车迷端已通过用户验收，依赖与真实锁文件已落地，截图和平台边界见 [Phase 1 报告](docs/phases/phase-1-report.md)。真实身份、资讯发布和管理写入仍待后续实施；[Phase 0 报告](docs/phases/phase-0-report.md)保留历史基线状态。

## 目录

- apps/fan：Vue 车迷端，Capacitor 配置供后续原生工程生成使用。
- apps/admin：独立 Vue 管理端，Phase 0 无编辑或授权操作。
- packages/i18n、design-tokens、contracts：双语、视觉基线、API 契约。
- services/racing-api：Spring Boot 业务读取、合成同步、授权门禁与 Flyway 前进迁移。
- infra：仅本地 PostgreSQL / Redis 配置。
- docs：架构、数据、安全、构建和 Phase 1–6 计划。

## 无依赖检查

要求 Node 24.19+，限制在 Node 24 主版本。

~~~powershell
node scripts/doctor.mjs
node scripts/check-baseline.mjs
node --test tests/baseline.test.mjs
~~~

doctor 默认输出诊断而不阻止离线检查；node scripts/doctor.mjs --strict 在工具缺失或 Docker 不可用时返回失败。离线授权测试直接运行同一份可擦除类型的 TypeScript 策略函数。

## 安装依赖后运行

Node 24.19+，pnpm 10.34.8。在具备合法网络访问的开发环境执行；pnpm 安装仅限项目目录。

~~~powershell
npm install --prefix .tools/pnpm --no-package-lock pnpm@10.34.8
$env:Path = (Join-Path $PWD '.tools/pnpm/node_modules/.bin') + ';' + $env:Path
pnpm --version
pnpm install --frozen-lockfile
pnpm check:phase1
pnpm exec playwright install chromium webkit
pnpm test:e2e
pnpm verify:phase1
mvn -f services/racing-api/pom.xml verify
mvn -f services/racing-api/pom.xml -Pdatabase-it verify
~~~

锁文件固定实际解析版本，strict peers 已通过。Capacitor core/android/ios/cli 固定为同一版本。`verify:phase1` 顺序运行基线、lint、类型、测试、构建、API 校验与浏览器测试，并保存日志到 `docs/verification/phase-1/`。本地有 Edge 时可设置 `$env:NOBI_BROWSER_CHANNEL='msedge'` 代替桌面 Chromium；移动 Safari 仍需 WebKit。

~~~powershell
pnpm dev:fan
pnpm dev:admin
./scripts/local-phase2.ps1 start
~~~

车迷端默认在 http://127.0.0.1:5173，管理端在 http://127.0.0.1:5174。端口被占用时通过 `pnpm --filter @nobi/fan dev --port 5273` 指定其他端口。端到端测试独占 5273/5274，拒绝复用现有服务，避免误测其他项目。

用户端路由：`/#/`、`/#/news`、`/#/races`、`/#/stats`、`/#/profile`、`/#/settings`；赛事、车手和车队详情使用 API 返回的 UUID，从列表点击进入。Hash 路由适配静态托管；生产反向代理与原生 API 地址仍需单独配置验证。新闻例 `/#/news/mock-aero`；`/#/news?scenario=error` / `empty` 可复现本地样例的失败和空态。

语言、外观、时区、收藏与关注 ID 仅存储本地，不含身份令牌或 API 事实。深色、浅色、跟随系统均可选。默认后端模式下，离线/页面隐藏会清除页面内赛事事实，恢复网络/焦点会重查；可见页面每 30 秒刷新。授权撤销由下一次检查发现，不承诺即时推送。

~~~powershell
# 后端已构建时启动本地预览
./scripts/local-phase2.ps1 start
pnpm --filter @nobi/fan dev --host 127.0.0.1 --port 5275
# 完整隔离回归（需要 Docker、Maven、Chromium/Edge 和 WebKit）
$env:NOBI_BROWSER_CHANNEL='msedge' # 未安装 Chromium 时可选
pnpm verify:phase3
~~~

当前预览 [Web](http://127.0.0.1:5275/#/stats) 使用 Vite 同源代理，后端默认 `http://127.0.0.1:5280`。仅服务端开发配置 `NOBI_API_PROXY` 可覆盖为回环 HTTP origin，不得放入凭据。需要独立离线演示时，启动 Vite 前显式设置 `$env:VITE_DATA_TRANSPORT='fixture'`；未设置默认是 `backend`。`pnpm test:e2e:fixture` 验证这一显式样例模式；不会自动切换模式。

修改读取契约后运行 `pnpm api:phase2:update`、`pnpm api:client:generate`，提交 OpenAPI、生成类型与无需动态求值的响应校验器。`pnpm api:client:check` 检测漂移，完整回归保存到 `docs/verification/phase-3/`。测试专用控制服务器仅编译进测试，不能打入应用 JAR。

Capacitor 的 `webDir=dist`、HTTPS scheme、禁明文传输与 Android 返回键适配已保留。Android/iOS 原生工程已生成，使用 `com.nobistudio.racing`，移动包通过 HTTPS 读取公开站点 API。Android 7.0+、iOS 16+；云端构建与签名结果见发布报告。尚未进行实体手机安装验收。

## 本地数据库

Phase 2 使用 `infra/phase2-compose.yaml` 和 `scripts/local-phase2.ps1` 管理专用 Compose 项目。PG 55473、Redis 56379、API 5280 均只监听回环，不重用其他 NOBI 项目的数据库。凭据随机生成，Redis 配置专用 ACL，迁移/同步任务与只读 Web 账号分离。`-Pdatabase-it` 另建 Testcontainers 临时数据库，不操作本地持久卷。原 `infra/compose.yaml` 仅保留 Phase 0 参考，不用于本次后端。

## 范围与约束

已实施用户指定的 Phase 1 前端、Phase 2 后端及 Phase 3 Web 数据联调里程碑，后续更新见本文顶部报告。原阶段计划中尚未完成的身份、编辑、物理留存清理能力见对应阶段报告。公开站点使用独立 Node 服务，不连接其他 NOBI 应用数据库。原本地数据库赛事与成绩仍保留合成来源标记；本地个人参考与公开 F1DB 版本分别标注来源、截至时间和许可。签名资料、Token、服务器私钥与构建缓存均排除在 Git 外。
