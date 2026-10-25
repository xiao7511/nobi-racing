# NOBI Racing · Phase 2

全球赛车资讯 App，支持 English (en-US) / 简体中文，使用 Vue 3、TypeScript、Pinia、Vue Router 和 Capacitor。Phase 1 实现五个主入口、新闻/分站/车手详情及设置页。内容均为原创虚构，API 在本地异步返回合成数据。

## 当前状态

Phase 2 后端已实现 Spring Boot/JDBC/Flyway、PostgreSQL、Redis ACL 缓存和受授权控制的合成适配器，以及赛季、赛道、赛事、会话、成绩、车手、车队与积分 API。`pnpm verify:phase2` 运行完整验收，详情见 [Phase 2 报告](docs/phases/phase-2-report.md)。Phase 1 UI 仍使用内置 Mock，不会自动请求新后端。

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

用户端路由：`/#/`、`/#/news`、`/#/races`、`/#/stats`、`/#/profile`、`/#/settings`；详情例 `/#/news/mock-aero`、`/#/races/mock-harbor`、`/#/drivers/mock-mei`。Hash 路由适配静态托管及 Capacitor。`/#/news?scenario=error` / `empty` 可复现 Mock 失败和空态；正常页面不提供开发调试控件。

语言、外观、时区、收藏与关注仅存储本地，不含身份令牌。深色、浅色、跟随系统均可选。前端仍不请求 Spring Boot 或第三方服务；Phase 2 API、PostgreSQL、Redis 通过独立本地脚本运行，真实身份尚未接入。

Capacitor 的 `webDir=dist`、HTTPS scheme、禁明文传输与 Android 返回键适配已保留。App ID 仍为 `com.example.nobiracing` 占位；未生成原生项目、未签名或上传商店。iOS 需 Mac/Xcode，Android 需 SDK/设备，原生包的构建与真机验收待后续阶段。

## 本地数据库

Phase 2 使用 `infra/phase2-compose.yaml` 和 `scripts/local-phase2.ps1` 管理专用 Compose 项目。PG 55473、Redis 56379、API 5280 均只监听回环，不重用其他 NOBI 项目的数据库。凭据随机生成，Redis 配置专用 ACL，迁移/同步任务与只读 Web 账号分离。`-Pdatabase-it` 另建 Testcontainers 临时数据库，不操作本地持久卷。原 `infra/compose.yaml` 仅保留 Phase 0 参考，不用于本次后端。

## 范围与约束

已实施用户指定的 Phase 1 前端和 Phase 2 后端，不自动进入后续阶段。不连接商业实时数据、不抓取受保护媒体或正文、不使用官方 F1 Logo、不写入其他 NOBI 仓库、不部署生产、不购买服务、不提交凭据。所有 Mock API/夹具携带 mode: mock，界面展示 MOCK 标记。
