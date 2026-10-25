# 构建、环境变量、安全配置与 CI/CD 设计

> Phase 3 更新：下文保留早期设计背景，实际实现/验收以 [Phase 3 报告](phases/phase-3-report.md) 为准。Web 默认通过同源 `/api/v1` 读取合成后端；开发代理使用仅服务端的 `NOBI_API_PROXY`（回环 HTTP origin），不使用旧 `VITE_API_BASE_URL`。`VITE_DATA_TRANSPORT=fixture` 为显式演示开关，不能触发错误自动回退。Phase 2 本地启动脚本覆盖 API 为 5280，PG 55473、Redis ACL 56379；原 compose 仅作历史参考。

`phase-3-web-api.yml` 对 PR 和本阶段分支运行 frozen 安装、Chromium/WebKit 安装和 `pnpm verify:phase3`，上传七天的合成验收记录，无部署权限。远端实际运行和 required check 尚未设置。浏览器回归使用 Testcontainers 隔离 PG/Redis、测试源码控制服务器及 5276 Web；测试控制端点不会进入应用 JAR。OpenAPI 生成客户端与 standalone 校验器通过漂移检查，无动态编译求值；响应/超时限制和错误脱敏已实施，部署 CSP 与身份认证仍待后续。

## 环境隔离

local、test、staging、production 使用独立数据库、Redis、OIDC client、密钥与域名。Phase 0 只有本地 compose 与验证型 CI，不创建云资源，不部署任何环境，也不申请付费服务。生产发布须未来单独授权。

| 配置 | 放置位置 | 规则 |
| --- | --- | --- |
| VITE_API_BASE_URL | 客户端公开配置 | 可打包公开；当前 shell 尚未调用 API；生产仅 HTTPS |
| PORT / BIND_ADDRESS | 服务端环境 | 当前默认 8080 / 127.0.0.1 |
| DB_URL / DB_USER / DB_PASSWORD | 服务端秘密存储 | Phase 1 JDBC 接线，.env.example 仅占位，服务不自动加载 .env |
| POSTGRES_PASSWORD | 忽略的 infra/.env | 本地自行设置；无默认密码，compose 缺失时拒绝启动 |
| OIDC / provider credentials | 服务端密钥管理 | 暂不配置；禁止进入 VITE_*、镜像层或日志 |
| Apple/Android 签名材料 | 未来 CI 环境秘密 | 不进 Git；无签名测试构建与发布签名任务分开 |

.gitignore 排除 .env、.env.*（保留 .env.example）、node_modules、缓存、构建产物及常见签名/私钥文件。离线检查识别常见凭据模式，但不能替代托管 secret scanning 和人工差异审查。不得为了通过校验添加伪锁文件、空测试结果或固定凭据。

## Web 与管理端

pnpm build 分别产出 apps/fan/dist 与 apps/admin/dist。后续静态托管采用长缓存的 hash 资源，index.html 短缓存。管理端单独域名、不被搜索引擎索引，所有授权以 API 为准。

部署模板需设置 CSP（default-src self；script/style self；connect-src 仅 API/OIDC 需要的明确目标；object-src none；frame-ancestors none）、HSTS、nosniff、Referrer-Policy 及 Permissions-Policy。当前 Vite 开发服务器不代表上线 CSP 已完成，Vue 开发态注入样式与生产构建分开验证。

服务端 CORS 仅允许已配置来源；Web 优先同源 BFF 会话。Cookie Secure/HttpOnly/SameSite、CSRF/Origin 校验、OIDC state/nonce/PKCE、MFA、对象权限和来源门禁在 Phase 1 完整实施。Phase 0 只公开 readiness，其余请求拒绝，没有生产登录入口。

## 移动构建计划

1. 首次获可用依赖并确定拥有的 bundle/application ID 后，在 apps/fan 生成 Capacitor Android/iOS 工程；提交原生模板、wrapper 与依赖锁，不在当前阶段手工伪造平台目录。
2. Android runner：Node 24、JDK 21/Android Studio 内置兼容 JDK、SDK36，pnpm build 后 pnpm --filter @nobi/fan exec cap sync android，再在 android 目录使用 gradlew.bat assembleDebug / lint / test。正式 AAB 为未来签名任务。
3. iOS runner：macOS + Xcode26、iOS15+、SPM；Web build 后 cap sync ios，xcodebuild -resolvePackageDependencies；依据生成工程实际 scheme 执行 simulator build，CODE_SIGNING_ALLOWED=NO。真实设备/归档/商店上传分别验证。
4. 禁止生产 server.url、任意 allowNavigation、cleartext HTTP 与调试 WebView；审查 deep link/App Link/Universal Link，插件权限最小化。当前配置无 server.url、cleartext=false。
5. com.example.nobiracing 仅占位符，不能用于最终商店发布。应用图标、截图和启动页需原创或已授权资产。APNs/FCM、账号注销、隐私清单和 Data Safety 表在相应 Phase 准备。

本次未安装原生 SDK、未生成原生工程、未构建 IPA/APK、未创建开发者账号或签名文件。

## 数据与服务

Flyway schema 与应用发布分开审查。迁移账号与应用账号分离，应用不获得 DDL。数据库外部访问需 TLS、最小权限与网络隔离；当前 compose 仅绑定 PostgreSQL 到 loopback，Redis 无宿主发布端口，默认保护模式只供容器内健康检查。实际应用连接 Redis 前配置 ACL / TLS，不能通过关闭保护模式便捷上线。

未来加入 HTTP 限流、请求体上限、超时、审计、日志脱敏、traceId、资源所有权检查，禁止 raw HTML 内容直接渲染。健康接口分 liveness 与 dependency readiness；当前 /readiness 仅基线状态，不可用作生产流量门禁。

## 已提供的 CI

| 工作流 | 触发 | 检查与限制 |
| --- | --- | --- |
| baseline.yml | push / pull_request | Node24、静态结构/i18n/OpenAPI引用/凭据模式、源策略与 Tokens 对比度 |
| full-validation.yml | workflow_dispatch | Web: 要求真实锁文件 -> frozen install -> 类型/单元/构建/完整 OpenAPI -> Chromium/WebKit；Java: verify -> PG Testcontainers |
| 原生 / 发布 | 仅方案 | 尚无自动签名、上传或环境部署任务 |

由于本次无法解析包源，full-validation 的 Web 任务在缺锁时必须失败；没有用非 frozen CI 安装掩盖这一问题。首次解析完成后，完整验证应升级为 PR required check，不允许仅凭 baseline 绿色合并业务实现。Java 任务仍须远端 Maven 和可访问 Docker。

工作流权限为 contents:read，不使用 pull_request_target，不传入云凭据。产物只保留短期失败追踪，需检查追踪中无用户数据。当前 actions 按主版本标签引用；生产启用前核实并固定不可变 commit SHA，开启受控依赖升级。

## 后续交付流水线（设计）

PR：静态与秘密扫描 -> frozen依赖/许可/SBOM/漏洞检查 -> Web/Java 单元和契约 -> PG迁移/Redis集成 -> Web E2E / 语言/可访问性 -> 容器/原生测试构建。主分支只产生版本化候选制品；staging 和 production 分别由受保护环境批准，OIDC 短期身份发布，禁止长期云密钥。

发布必须先确认数据权利、备份恢复、迁移兼容、隐私说明和回退制品。数据库采用前进修复，应用使用兼容上一版本的 schema；移动端受商店传播延迟影响，API 保持兼容窗口。Phase 0 不启用上述部署流程。

## 最短补验路径（仍属于 Phase 0）

在有合法包源与 Docker 权限的环境按 README 引导 pnpm，解析并审查锁文件；运行 pnpm check、pnpm test:e2e、mvn verify、-Pdatabase-it verify；核对 native SDK 可用性并更新报告。此前不能声称完整工程验收通过，也不能自动开始 Phase 1。
