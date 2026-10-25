# NOBI Racing — Phase 0 报告

日期：2026-10-25（Asia/Shanghai）
项目：D:/project/nobi-racing
目标分支：feature/nobi-racing-phase0

## 交付结论

全新 Monorepo 骨架、架构/数据库/API/设计/授权/CI 文档及 Phase 1–6 任务计划已落地。**离线基线检查已通过；完整工程验收尚未通过。** 当前包源与 Docker 权限受限，不能宣称前后端已经构建成功、SQL 已运行或三端已可发布。

本次只处理 Phase 0，未开始 Phase 1。后续计划仅为任务分解，不触发实施、购买服务或部署。

## 1. 目录、Git 与复用审计

- 起始目标目录存在且为空；未发现 .git 或既有业务文件。Git 返回 not a git repository。
- 父目录与本目录未发现 AGENTS.md。未扫描、导入或修改其他 NOBI 仓库。
- 在目标目录初始化独立 Git 仓库，分支 feature/nobi-racing-phase0。所有代码为本阶段新建，无既有 NOBI 业务代码复用范围。
- 当前执行账户与目录所有者不同，Git 检查需逐命令指定 -c safe.directory=D:/project/nobi-racing；不修改全局信任配置。
- 未配置或推送远端、未创建云资源、未执行生产部署。

## 2. 工具与兼容性

| 工具 | 实测 | 结论 |
| --- | --- | --- |
| Node / npm | 24.19.0 / 11.17.0 | 可用 |
| pnpm | 未安装 | npm 包源 EACCES，无法引导安装 |
| JDK / javac | Temurin 21.0.12.1 LTS | 可用 |
| Maven | 3.9.16 | 可用；解析 Spring Boot parent 时网络 Permission denied |
| Docker CLI | 29.7.2 | 可用，但配置读取权限受限 |
| Docker Engine | npipe/docker_engine permission denied | 不可用，无法执行容器/PG 集成 |
| Git | 2.55.0.windows.3 | 可用 |
| iOS / Android SDK | Windows 不能构建 iOS；Android SDK 未验证 | 原生构建未验证 |

选型交集：Node24 / pnpm10、Vue3.5 / Pinia3、Vite7.3 / plugin-vue6 / Vitest4、Capacitor8、Java21 / Spring Boot4.1.2 / Maven3.9、PostgreSQL18 / Boot管理的Flyway模块。Testcontainers选2.0.5，避免旧1.21.3的Docker29兼容问题。

上述为官方文档与版本范围核对，不能代替安装和运行。详细矩阵及官方来源见 [版本兼容性](../version-compatibility.md)。首次依赖解析后必须审查实际版本并生成真实 pnpm-lock.yaml；目前未伪造锁文件。

## 3. 工程交付

| 目录/文件 | 内容 | 当前边界 |
| --- | --- | --- |
| apps/fan | Vue3 + TS + Pinia + Vite，双语五导航占位页 | 无业务请求、无真实数据 |
| apps/admin | 独立Web管理端，双语锁定预览 | 无登录与编辑功能 |
| apps/fan/capacitor.config.ts | Web资源目录、HTTPS scheme、禁cleartext | App ID为com.example占位；未生成原生工程 |
| packages/i18n | en / zh-CN 字典、locale归一化与英文回退 | UI切换仅会话内 |
| packages/design-tokens | 色彩、间距、字体、圆角、焦点、reduced-motion | 对比度有离线测试；浏览器视觉待验 |
| packages/contracts | OpenAPI3.1、TS草案、授权投影函数 | 仅readiness有服务骨架，其余API为draft |
| services/racing-api | Spring Boot骨架、默认拒绝的安全配置、基础自动化测试 | 运行时未接DB/Redis/IdP |
| db/migration/V1__foundation.sql | 20张核心表、外键/CHECK/索引、无种子 | 待真实PG执行 |
| infra/compose.yaml | 本地PostgreSQL18和Redis8.2 | 无生产配置，Redis无发布端口 |
| .github/workflows | 离线基线CI、手动完整验证CI | 无部署；缺锁时完整Web校验明确失败 |

用户所列导航名称为四个，本基线暂补“首页”，组成首页/赛事/资讯/数据/我的。此为可逆产品假设，后续由产品确认。

## 4. 设计文件索引

- [架构与领域模型](../architecture.md)：模块化单体、共享边界、核心聚合、全球时区、AI/提醒/社区扩展点。
- [数据库设计与迁移](../database.md)：20表、约束、授权来源、Flyway前进迁移、账号隔离和恢复策略。
- [OpenAPI契约](../../packages/contracts/openapi.json)与[错误码规范](../api-and-errors.md)：10条路径、分页、DTO、权限标记与Problem错误。
- [UI设计规范](../ui-design.md)：原创深色赛车视觉、Tokens、双语、响应式与无障碍目标。
- [数据源与授权](../data-sources-and-authorization.md)：用途/地域/有效期/审批/撤销、适配器和身份方案。
- [构建与CI/CD](../build-security-cicd.md)：iOS/Android/Web、变量、安全头、验证门禁和未来发布边界。
- [Phase 1–6任务分解](phase-1-6-plan.md)：逐项依赖、责任角色、验收与阶段出口。
- [风险登记表](../security-risk-register.md)：21项风险、控制、责任和未关闭状态。

## 5. 基础检查与验证证据

无需安装依赖即可运行：

~~~powershell
node scripts/doctor.mjs
node scripts/check-baseline.mjs
node --test tests/baseline.test.mjs
~~~

安装后可运行 pnpm check、pnpm test:e2e、mvn -f services/racing-api/pom.xml verify、mvn -f services/racing-api/pom.xml -Pdatabase-it verify。README列出项目本地pnpm引导与首次锁文件生成步骤。

| 检查 | 结果 |
| --- | --- |
| 项目/语言键/五导航/OpenAPI引用与管理权限/凭据模式/文档 | 已通过；覆盖结构、双语键一致、五导航、本地引用、管理权限标记及常见凭据模式 |
| 离线授权策略 | 已通过；状态、启用、有效时间、能力与地域拒绝场景 |
| Tokens核心对比度 | 已通过；修正一次边框对比度后复测 |
| JS语法 / compose静态配置 | 已通过；Compose解析有Docker用户配置读取警告，不表示引擎可用 |
| TypeScript/Vue类型检查、Vitest、Web构建 | 未运行：缺pnpm/依赖且包源EACCES |
| Redocly完整OpenAPI语义校验 | 未运行：依赖不可安装；本地引用检查不等价于此 |
| Playwright桌面/移动Web | 未运行：依赖与浏览器不可安装 |
| Maven verify | 已尝试，失败于parent POM下载Permission denied；未到编译或测试 |
| Flyway/PostgreSQL集成 | 未运行：Maven解析受阻且Docker引擎不可达 |
| iOS / Android构建 | 未运行：只有配置与方案，无原生工程 |

最终可复现的检查摘要保存在 docs/verification/phase-0-checks.json。该摘要只记录确实运行的检查，不能补写未运行测试为通过。

## 6. 安全与授权执行结果

无商业实时数据连接、无采购/收费开通、无受保护官方图片/视频/正文抓取、无官方F1 Logo、无真实用户数据、无密钥/token/密码写入、无其他仓库修改、无生产部署。状态接口显式标记dataMode=mock；当前没有赛事样例夹具，未来所有Mock事实同时标注API模式和界面MOCK。

数据来源默认禁用，真实来源均未获批。Schema限制来源模式一致与授权审批禁止自审；权限/时效/地域/证据在后续服务事务中继续校验。Phase 0只提供拒绝默认值及设计，不冒充完整生产安全实现。

## 7. 未关闭事项与补验顺序

1. 在具备合法包源权限的环境安装固定pnpm；解析依赖、核验peers与许可证，统一Capacitor四包版本，生成并审查锁文件。
2. 运行完整前端类型/单元/构建/API语义检查与Playwright；修复发现的问题，记录真实日志。
3. 恢复Docker引擎访问后运行Maven verify和-Pdatabase-it verify，确认Flyway在空库重复执行与约束测试通过。
4. 核对Android SDK与Mac/Xcode runner可用性；Phase 0仅需验证工具条件，原生业务工程按后续阶段授权生成。
5. 更新报告完整验收结论，再由用户明确决定是否进入Phase 1。

本次可审查提交仅表示已通过可执行的离线基线检查，不代表环境受限的完整工程检查已通过。提交落在指定feature分支，不推送、不合并。提交哈希以该分支git log -1为准，避免在提交内自引用哈希。
