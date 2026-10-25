# NOBI Racing · Phase 3 Web 联调

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

Capacitor 的 `webDir=dist`、HTTPS scheme、禁明文传输与 Android 返回键适配已保留。App ID 仍为 `com.example.nobiracing` 占位；未生成原生项目、未签名或上传商店。iOS 需 Mac/Xcode，Android 需 SDK/设备，原生包的构建与真机验收待后续阶段。

## 本地数据库

Phase 2 使用 `infra/phase2-compose.yaml` 和 `scripts/local-phase2.ps1` 管理专用 Compose 项目。PG 55473、Redis 56379、API 5280 均只监听回环，不重用其他 NOBI 项目的数据库。凭据随机生成，Redis 配置专用 ACL，迁移/同步任务与只读 Web 账号分离。`-Pdatabase-it` 另建 Testcontainers 临时数据库，不操作本地持久卷。原 `infra/compose.yaml` 仅保留 Phase 0 参考，不用于本次后端。

## 范围与约束

已实施用户指定的 Phase 1 前端、Phase 2 后端及 Phase 3 Web 数据联调里程碑。原阶段计划中尚未完成的身份、编辑、真实 HTTP 供应商、物理留存清理和移动端能力见报告。不连接商业实时数据、不抓取受保护媒体或正文、不使用官方 F1 Logo、不写入其他 NOBI 仓库、不部署生产、不购买服务、不提交凭据。所有当前赛事事实为合成数据，界面展示 MOCK 标记。
