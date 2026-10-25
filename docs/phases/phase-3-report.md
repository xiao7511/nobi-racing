# Phase 3：Web 与数据库联调

日期：2026-10-25。分支 `codex/nobi-racing-phase3`，基于 Phase 2 `97ea69b`。用户授权继续后续开发，本轮交付可本地验证的 Web 读取纵切；原 Phase 1–6 计划中的全部事项不因里程碑名称而自动完成。

## 实现

- 车迷端默认读取同源 API：首页、赛季目录/切换、赛历、赛事/赛道/会话/具名成绩、车手、车队、服务端积分快照、UUID 关注列表。新闻保留明确区分的原创本地样例。
- 从 OpenAPI 0.3.0 生成 TypeScript 类型与 Ajv standalone 校验器，浏览器不需要 `unsafe-eval`；生成漂移进入验收。成绩 API 增加 `driverName`/`teamName`，不改动 V1/V2 迁移。
- 每次成功响应校验结构和 synthetic/mock 模式。请求同源、无凭据、拒绝重定向，8 秒超时，响应上限 2 MB。分页最多 20×100，游标不得重复，页面须同一 snapshotVersion/snapshotId；积分保持字符串，不在客户端重算车队总分。
- 页面呈现来源、采集/更新时间、时区、合成状态和积分 snapshotId。错误只呈现本地翻译及净化的请求参考号，429 遵守 Retry-After 并禁用重试按钮。
- 后端错误、无效 ID、未知赛季、模式或响应结构异常均清除当前事实，不回退打包夹具。离线及隐藏页面立即清除内存事实；恢复网络、焦点/可见性后重查，可见且在线时每 30 秒刷新。检查期间也移除旧事实。
- 本地存储只有偏好、关注 UUID 和原创新闻收藏 ID；不持久化 API 事实。旧 Mock 关注 ID 保留但在数据库列表中不可用，不用其他车手替换。
- Vite 开发/预览以 `/api/v1` 代理至回环后端，显式 `VITE_DATA_TRANSPORT=fixture` 才启用旧演示 UI；默认 backend。不会将 DB/Redis 凭据打包给浏览器。

## 验证与复现

执行 `pnpm verify:phase3`：Maven 单元/数据库/浏览器集成、生成客户端漂移、实际 HTTP 响应契约、OpenAPI、lint/类型/构建、前端单元、旧夹具旅程与基线扫描。日志和最终状态保存在 [checks.json](../verification/phase-3/checks.json)，浏览器结果及截图哈希在 [browser-results.json](../verification/phase-3/browser-results.json)。失败不写完整验收通过状态。

浏览器使用独立 Testcontainers PostgreSQL/Redis、随机端口 Spring Boot 和专用 5276 Vite，不修改本地持久数据。测试通过测试源码内的随机密钥回环控制服务器实施真实授权撤销/恢复与积分纠错；该服务器不编译进生产包。

验收覆盖：11 项 Java 单元、13 项数据库/Redis 集成、1 项浏览器集成编排；26 项前端单元、3 项 Node 基线、34 个实际 HTTP 响应契约；18 项真实 API 浏览器用例（桌面 Chromium/本机 Edge 与移动 WebKit）及 26 项原夹具浏览器旅程。24 张截图覆盖两语言×两主题×赛事/积分/个人页×两引擎，测试断言路由标题和无文档横向溢出。

关键负向场景：数据库授权撤销后触发重新检查不再显示原积分；恢复后重新读取；断网清除；503 无样例回退；畸形小数响应拒绝；429 冷却；历史赛季无积分空态；旧标识/不存在赛季拒绝。测试将权威车队分修正为 `999.125` 并断言 UI 原样展示，证明没有依车手积分重算。CSP 无 `unsafe-eval` 时校验器可运行，测试页面无第三方 origin 请求。

本地查看：先构建后端，再 `./scripts/local-phase2.ps1 start`，启动 `pnpm --filter @nobi/fan dev --host 127.0.0.1 --port 5275`，打开 [积分](http://127.0.0.1:5275/#/stats)。脚本沿用 Phase 2 名称和隔离卷，仅同步原创合成源；账户仍分为任务 owner 与只读 Web reader。

交付时已恢复本地服务，在应用内浏览器确认中文积分页读取 4 位车手并显示来源快照。通过 5275 同源代理检查 readiness、赛季和积分均为 HTTP 200/mock，记录见 [local-smoke.json](../verification/phase-3/local-smoke.json) 与 [实际预览截图](../verification/phase-3/local-preview.png)。验收脚本使用 `.cache/phase3-verification.lock` 防止并发覆盖记录；异常强制结束后，核实记录的进程已经退出才能移除此锁重跑。

## 尚未完成的边界

- 数据均为原创合成，客户端主动拒绝 licensed 模式。未接入任何商业来源或外部 HTTP adapter；供应商 SSRF、重试/熔断与真实配额验证仍待获权接入时实施。
- 已显示页面在下一次焦点/网络/可见性检查或 30 秒轮询时感知撤销。没有即时撤销推送/SSE、授权数据离线包或合同要求的物理清理机制；不能声称即时撤销闭环或生产可用。
- 真实身份/BFF/OIDC、云端关注/偏好、资讯编辑发布与管理写入尚未实现。
- 未部署生产反向代理或 CSP；开发测试中的 CSP 不是部署证据。未生成/编译原生工程，Capacitor 原生网络地址与真机验收仍待实施。
- CI 定义已加入，远端运行/required check 设置、供应链完整扫描和生产恢复演练未执行。本轮无生产发布、采购、商店上传或第三方消息。
