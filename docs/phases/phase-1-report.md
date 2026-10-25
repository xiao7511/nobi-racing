# NOBI Racing — Phase 1 用户应用报告

日期：2026-10-25（Asia/Shanghai）
分支：`feature/nobi-racing-phase1`

## 范围依据与状态

**用户指定的 Phase 1 前端范围已完成，最终七项验证命令全部返回成功。** 真实结果、退出码和日志已写入验证目录。

继续上次中断的用户端任务：Vue 3 + TypeScript + Capacitor，Home、News、Races、Stats、Profile 五个入口，新闻/分站/车手详情和设置；en-US / zh-CN、明暗主题、响应式布局、API Mock、状态管理、组件测试和双语截图。沿用已保存的领域模型、偏好、格式化、异步资源和 ESLint 配置。

用户后续明确的阶段范围优先于 Phase 0 中原始 P1 身份纵切计划。本次不实现 Spring Boot 业务接口、PostgreSQL/Redis、登录、真实数据同步、生产服务或下一阶段。最终验证记录以 `docs/verification/phase-1/checks.json` 为准。

## 功能交付

| 页面 | 路由 | 行为 |
| --- | --- | --- |
| Home | `/#/` | 焦点故事、围场资讯、下一站、积分概览 |
| News | `/#/news` | 分类、标题搜索、空态、详情入口 |
| Races | `/#/races` | 全部/即将开始/已结束筛选，用户时区显示 |
| Stats | `/#/stats` | 车手/车队榜，合成半分积分与车队汇总 |
| Profile | `/#/profile` | 访客本地收藏/关注，空态引导，无假登录 |
| 新闻详情 | `/#/news/mock-aero` | 原创双语正文、收藏、来源与更新时间 |
| 分站详情 | `/#/races/mock-harbor` | 虚构赛道、圈数/长度/弯角、会话赛程、用户/赛道时区切换 |
| 车手详情 | `/#/drivers/mock-mei` | 虚构人物、合成统计、关注 |
| 设置 | `/#/settings` | 语言、深/浅/系统主题、IANA 时区、清空收藏与关注 |
| 404 | 任意未知路径或缺失实体 | 本地化错误和返回首页 |

Hash 路由与按页动态加载便于静态托管和 Capacitor。桌面侧栏、平板图标栏、手机底栏均为五入口；含 Safe Area、触控目标、跳转正文、可见焦点、语义表格和 reduced-motion。HTML lang、文档标题与页面文案同步语言；日期通过 Intl 处理 IANA 时区和 DST。

## Mock、状态与素材

- 4 篇原创故事、3 场虚构赛事、4 名虚构车手、3 支虚构车队；内容、人物、赛道与结果不代表真实赛事。
- 本地异步 API 返回 `mode: mock`，所有实体包含 `provenance`（来源、模式、更新时间与归因）。数据复制后返回，调用方修改不会污染夹具。
- 全局和卡片均有 MOCK 标识；无网络数据请求、第三方字体、照片、官方标识、文章抓取或收费服务。图形为仓库内原创 SVG/CSS。
- 加载骨架、空态、重试、缺失实体、断网提示与请求取消；旧请求不能覆盖新响应，组件卸载取消工作。
- `?scenario=error` / `empty` 是本地 Mock 测试夹具开关；真实网络故障不会回退为未经授权的数据。
- 偏好仅允许语言、主题、合法 IANA 时区、Mock 收藏/关注 ID，集合去重并上限 100。损坏存储安全回退；存储被禁用/配额不足时保留会话状态并在设置提示。无身份、令牌、账号或云同步。

## 工程与验证

项目本地 pnpm 10.34.8，真实 `pnpm-lock.yaml`，严格 peer 检查；Capacitor core/android/ios/cli 固定 8.5.3，App 插件 8.1.2。共享语言规范统一 en-US，管理预览同步语言值以兼容共享包，保持锁定状态。

`pnpm verify:phase1` 会顺序执行静态基线、lint、typecheck、test、build、OpenAPI 和 E2E，逐项保存日志与退出码；失败返回非零。前端专用 CI 已配置，但远端分支保护与 CI 运行需要仓库托管配置，不能由本地通过推断。

自动化覆盖偏好往返/损坏/拒绝、DST、Mock 模式/变异隔离/错误/取消、组件筛选/收藏/积分/设置、异步竞态、Android 返回键边界。浏览器覆盖收藏关注与刷新、分类/搜索、赛历时区、车队汇总、主题/语言保存、404、错误/重试、断网、外部请求与运行时错误。

浏览器测试使用专有 5273/5274 本地端口，拒绝复用既有服务。首次沿用 Phase 0 的服务复用设置时误命中其他项目的 5173 服务，已修正；首次失败不作为本项目验收证据。截图初始化在修改 localStorage 后显式刷新，避免 Hash 导航继续使用旧会话主题。

| 检查 | 最终结果 |
| --- | --- |
| 冻结锁文件安装 | `pnpm install --frozen-lockfile --offline` 通过，无重新解析 |
| lint / typecheck | 通过，ESLint 零警告，fan/admin 及工具/测试类型检查通过 |
| Node 基线测试 | 3 项通过：授权策略、深色与浅色核心 Tokens 对比度 |
| Vitest | 5 文件、17 项通过，含组件交互与异步竞态 |
| build | fan/admin 独立构建通过；fan 主入口约 180.65 kB / gzip 67.96 kB，页面按路由拆分 |
| OpenAPI | 校验通过；保留 Phase 0 的 2 条非阻断警告：本地 server URL、readiness 无 4XX 示例 |
| Playwright | 28 项全部通过；桌面 Microsoft Edge Chromium + iPhone 13 设备参数的 WebKit 27.2 |
| 双语/主题布局矩阵 | 180 次页面组合检查通过：桌面引擎 1440/768/390/320 × 2语言 × 2主题 × 9页面，加 WebKit 390 × 2语言 × 2主题 × 9页面；均无横向溢出 |
| 截图 | 72 张 PNG：1440桌面与390手机 × 2语言 × 2主题 × 9页面。桌面为整页，手机为视口，另含文件哈希与尺寸索引 |
| 许可元数据 | 326项已安装包的 name/version/license 清单已保存，不等同于发布法律审查或漏洞审计 |

结果与原始日志：[checks.json](../verification/phase-1/checks.json)。截图逐页入口：[截图索引](../verification/phase-1/screenshots/README.md)。已目视复核桌面深色首页、浅色积分页、中文手机首页和英文手机设置页，截图不等同于全量视觉差异测试。

Windows 上首次将所有子进程日志转发到嵌套 stdout 管道时，Redocly 在成功验证后触发 libuv 退出断言；单独运行校验正常。验证脚本改为将子进程 stdout/stderr 直接写入日志文件，并保留真实退出码，最终以该脚本完整成功记录为准。

最终键盘复核修正了跳转正文链接与 Hash 路由冲突：拦截锚点默认导航，直接将焦点送到主内容。桌面与 WebKit 均验证按 Enter 后 URL 保持原路由。

## 平台边界与遗留事项

- Web 用户应用与独立管理预览可分别构建；管理业务、登录与服务端权限仍未实施。
- Capacitor HTTPS/no-cleartext/webDir 配置与 Android 返回导航边界有代码/模拟测试。**没有生成 iOS/Android 原生项目、安装包或签名**；占位 App ID 尚未确权，iOS Mac/Xcode、Android SDK 与真机验收仍待后续实施。移动浏览器通过不等于原生包通过。
- Spring Boot/Maven/PostgreSQL/Flyway/Redis 的 Phase 0 补验仍未由本次前端测试覆盖。
- 合成积分只用于 UI 示例，非正式赛季快照/修订/分页实现；真实成绩须后续服务端契约与来源授权。
- 本地存储仅适用于非敏感偏好，未来身份令牌不得扩展写入该存储。
- 未推送、合并、部署生产、购买服务或改动其他仓库。用户授权在全部检查通过后进行本地提交。
