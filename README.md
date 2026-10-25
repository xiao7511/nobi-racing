# NOBI Racing · Phase 0

全球赛车资讯 App 的全新工程基线，支持 English / 简体中文，目标平台为 Web、iOS、Android，另有独立 Web 管理端。当前仅包含工程预览和技术状态接口，不含真实赛事内容或实时数据服务。

## 当前状态

目录起始为空；未复制其他 NOBI 仓库代码。Phase 0 基础静态检查可离线执行。由于本次会话无法访问 npm/Maven 包源且 Docker 引擎不可用，依赖安装、锁文件、前后端构建和数据库集成测试仍待验证。完整验收状态见 [Phase 0 报告](docs/phases/phase-0-report.md)。

## 目录

- apps/fan：Vue 车迷端，Capacitor 配置供后续原生工程生成使用。
- apps/admin：独立 Vue 管理端，Phase 0 无编辑或授权操作。
- packages/i18n、design-tokens、contracts：双语、视觉基线、API 契约。
- services/racing-api：Spring Boot 基线与 Flyway SQL 草案。
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

在具备合法网络访问的开发环境执行。下列工具安装仅限项目目录；本次未安装成功。

~~~powershell
npm install --prefix .tools/pnpm --no-package-lock pnpm@10.34.8
$env:Path = (Join-Path $PWD '.tools/pnpm/node_modules/.bin') + ';' + $env:Path
pnpm --version
pnpm install --no-frozen-lockfile
pnpm check
pnpm exec playwright install chromium webkit
pnpm test:e2e
mvn -f services/racing-api/pom.xml verify
mvn -f services/racing-api/pom.xml -Pdatabase-it verify
~~~

首次依赖解析必须审查 peer dependencies、补丁版本与许可证，生成并提交真实 pnpm-lock.yaml。随后所有 CI 使用 pnpm install --frozen-lockfile。当前没有伪造锁文件；完整验证工作流会在缺少锁文件时明确失败。

~~~powershell
pnpm dev:fan
pnpm dev:admin
mvn -f services/racing-api/pom.xml spring-boot:run
~~~

车迷端在 http://127.0.0.1:5173，管理端在 http://127.0.0.1:5174，状态接口在 http://127.0.0.1:8080/api/v1/readiness。前端目前不请求后端。业务 API 均为草案。JVM 服务当前不自动连接 DB/Redis 或执行迁移。

## 本地数据库

复制 infra/.env.example 为忽略的 infra/.env，自行填入唯一的本地密码。然后运行 docker compose --env-file infra/.env -f infra/compose.yaml up -d。此命令仅在引擎可用时运行，未在本次会话执行。Redis 暂不发布端口；应用接入前需配置 ACL。数据库迁移验证由 -Pdatabase-it 在临时 Testcontainers PostgreSQL 执行，不操作 compose 持久卷。

## 范围与约束

只完成 Phase 0；Phase 1–6 是计划，不自动执行。不连接商业实时数据、不抓取受保护媒体或正文、不使用官方 F1 Logo、不写入其他 NOBI 仓库、不部署生产、不购买服务、不提交凭据。所有未来 Mock API/夹具必须携带 mode: mock，界面展示 MOCK 标记。
