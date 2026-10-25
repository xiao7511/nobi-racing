# 技术版本与本机可用性

核对日期：2026-10-25。本机命令实测与官方文档兼容条件分别记录；文档满足交集不等于依赖安装、编译或移动端签名构建已验证。

## 本机检查

| 工具 | 实测结果 | 状态 |
| --- | --- | --- |
| Node | v24.19.0；npm 11.17.0 | 可用，项目限定 Node 24 |
| pnpm | PATH 中无 pnpm.cmd | 不可用，npm 包源请求 EACCES，无法本地引导 |
| JDK / javac | Temurin 21.0.12.1 LTS | 可用 |
| Maven | 3.9.16，使用 JDK 21 | 可用；依赖解析另外验证 |
| Docker CLI | 29.7.2 | 可执行，但读取用户 Docker 配置被拒绝 |
| Docker Engine | docker info 连接 npipe/docker_engine permission denied | 不可用；不等同于 Docker 未安装 |
| Git | 2.55.0.windows.3 | 可用 |
| Xcode | 当前为 Windows | 无法在该主机执行 iOS 构建 |
| Android Studio / SDK | 未验证 | 留给 Android runner；不声明可构建 |

最初目录为空且不存在 .git；D:/、D:/project/ 和项目目录均未发现 AGENTS.md。仅在目标目录新建 Git 仓库并切换 feature/nobi-racing-phase0，未读取或复用其他 NOBI 仓库业务代码。

## 选型与交集

| 组件 | 基线 | 兼容判断与限制 |
| --- | --- | --- |
| Node / pnpm | Node 24.19.0、pnpm 10.34.8 | pnpm 10 支持 Node 24；选仍维护的 10 系列，不自动升级主版本 |
| Vue / Pinia | Vue 3.5.44、Pinia 3.x | Pinia 3 要求 Vue ^3.5.11，当前 Vue 满足 |
| Vite / Vue plugin | Vite ~7.3.0、plugin-vue 6.x | Vite 7 要求 Node >=22.12；插件支持 Vite 7 和 Vue 3.5；7.3 仍接收重要/安全修复 |
| TypeScript / vue-tsc | TS ~5.9.3、vue-tsc 3.x | 保守选 TS 5.9；实际 peer/类型检查待安装依赖 |
| vue-i18n | 11.x，Composition API | 两个语言包，legacy=false；Vue 3 适配待编译检查 |
| Capacitor | core/cli/android/ios 同一 8.x 系列 | Node >=22；四包必须在首次解析时统一补丁并锁定，不能独立漂移 |
| 原生 iOS | iOS 15+，Xcode 26+ | 需要 macOS；默认使用 SPM，不在 Windows 伪造原生构建通过 |
| 原生 Android | minSdk 24，compile/target 36 | Android Studio 2025.2.1+；原生模板对应 AGP 8.13 / Gradle 8.14.3，生成后复核 |
| Vitest / Playwright | Vitest 4.x、Playwright 1.x | Vitest 4 需要 Node >=20、Vite >=6，满足；Playwright 浏览器须单独安装 |
| Java / Spring Boot | JDK 21、Boot 4.1.2、Maven 3.9 | Boot 要求 Java >=17、Maven >=3.6.3，本机满足；采用 4.x webmvc 模块名 |
| PostgreSQL / Flyway | PG18；Flyway 使用 Boot BOM | Flyway 需要独立 flyway-database-postgresql 模块；迁移只在一次性库验证 |
| Testcontainers | 2.0.5，仅database-it profile | 使用2.x模块名与PostgreSQLContainer包，避免旧1.21.3的Docker29 API兼容问题；实际引擎仍待测试 |
| Redis | 候选 Redis 8.2-alpine | Phase 0 仅本地配置，无应用依赖；许可证与镜像补丁在实际接入前复核 |

没有使用 latest 依赖声明。部分直接依赖保留限定主/次版本范围以待真实解析，尚不存在可信的传递依赖清单。不得据此宣称整个供应链已兼容或安全。首次解析后提交 pnpm-lock.yaml、Maven effective-pom / dependency tree 摘要，并固定 Capacitor 四包与容器 digest；补丁升级走 PR 和回归检查。

## 官方核对依据

- [Vite 7 迁移与 Node 条件](https://v7.vite.dev/guide/migration)、[Vite 维护版本](https://vite.dev/releases)：当前选择 7.3 系列及 Node 24 满足公开条件。
- [Vue 插件 package.json](https://raw.githubusercontent.com/vitejs/vite-plugin-vue/main/packages/plugin-vue/package.json)、[Pinia 3 package.json](https://raw.githubusercontent.com/vuejs/pinia/v3/packages/pinia/package.json)：peer 范围支持当前 Vue / Vite 选择。
- [Vue 发布元数据](https://registry.npmjs.org/vue/latest)、[pnpm 发布记录](https://www.npmjs.com/package/pnpm?activeTab=versions)、[pnpm Node 兼容表](https://github.com/pnpm/pnpm/blob/main/pnpm/docs/installation.md)：核实发布存在性及 Node 兼容范围。
- [Capacitor 8 环境](https://capacitorjs.com/docs/getting-started/environment-setup)、[Capacitor 8 升级要求](https://capacitorjs.com/docs/updating/8-0)：Node、原生系统、SDK 与工具链条件。
- [Vitest 4 迁移条件](https://v4.vitest.dev/guide/migration.html)：与 Node 24 / Vite 7 的交集。
- [Spring Boot 系统要求](https://docs.spring.io/spring-boot/system-requirements.html)：当前官方 4.1.2 的 Java 与 Maven 条件。
- [PostgreSQL 支持周期](https://www.postgresql.org/support/versioning/)、[Flyway PostgreSQL 模块](https://documentation.red-gate.com/flyway/reference/database-driver-reference/postgresql-database)：PG18 系列与迁移驱动选择。

以上是选型时的文档证据；依赖安装和运行测试仍是最终兼容性门禁。

[Testcontainers 2.0.5 发布](https://github.com/testcontainers/testcontainers-java/releases/tag/2.0.5)与[旧版本 Docker29 API 问题](https://github.com/testcontainers/testcontainers-java/issues/11235)用于核对集成测试选型；不通过降低引擎安全配置规避兼容问题。
