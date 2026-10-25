# NOBI Racing — Phase 2 后端报告

日期：2026-10-25（Asia/Shanghai）

分支：`feature/nobi-racing-phase2`；基于已验收的 Phase 1 提交 `3206d40`。

## 结论与范围

**用户此前明确的 Phase 2 后端范围已实现并通过本地验证。** Spring Boot API、真实 PostgreSQL/Flyway、Redis ACL/缓存、原创合成适配器、授权门禁、幂等同步、重试/限流、OpenAPI 和测试已落地，本地只读 API 已启动。

本次按用户后续指定的阶段划分执行。原 Phase 0 计划中的资讯编辑/管理后台和身份纵切没有混入本次交付。Phase 1 UI 继续使用内置 Mock transport，**尚未自动请求本后端**。没有真实供应商、商业数据再分发、生产服务或原生包。

## 数据模型与迁移

保留 V1 原文/校验和，新增 `V2__racing_data_and_sync.sql`。实现要求中的 seasons、circuits、race_events、race_sessions、drivers、teams、season_entries、session_results、driver_standings、team_standings、provider_entity_map。

- 通过 ALTER RENAME 复用 V1 领域表。season_entries 保存赛季名册和轮次有效区间，race_entries 独立保存每站参赛快照。
- 增补双语名称、赛道 IANA 时区、UTC 时刻、圈数/长度、来源、采集/更新时间与数据状态。Mock 必须标记 synthetic，不能改标 licensed。
- 来源复合外键和同赛事外键共同阻止跨源/跨站成绩；积分使用 numeric，API 传十进制字符串，保留半分/负分与 DNF 状态。
- 完整 standings 快照与 driver/team 明细在同一事务发布；纠正生成新 UUID/revision，保留旧快照。拒绝未完成或缺少名册主体的载荷。
- 幂等映射、校验和、同步运行、审计和 outbox 均已接线，失败不留下部分事实或发布事件。
- V1 standing_entry 在扩展期间保留并迁移其旧行；原内部赛季行不伪造来源，未补齐来源元数据的行不公开。

## REST API

基路径 `/api/v1`，只公开获权数据。locale 为 en-US / zh-CN；limit 1–100；签名游标最长 512 字符。

| GET 接口 | 用途 |
| --- | --- |
| /readiness | 数据库及缓存 ready/degraded/unavailable |
| /seasons、/seasons/{id} | 赛季目录，支持年份/系列 |
| /circuits、/circuits/{id} | 赛道、国家、长度和时区 |
| /races、/races/{id} | 赛历/详情，支持赛季、状态、UTC 日期范围 |
| /races/{id}/sessions | 练习/排位/正赛 |
| /sessions/{id}/results | 同站成绩与十进制积分 |
| /drivers、/drivers/{id} | 车手及合成简介 |
| /teams、/teams/{id} | 车队 |
| /seasons/{id}/entries | 赛季名册及有效轮次 |
| /standings?seasonId=...&type=driver 或 team | 最新完整快照；可指定 snapshotId |

列表含 items/nextCursor/snapshotVersion/snapshotId/dataMode，详情含 data/dataMode。每条事实含 provenance（sourceId/sourceCode/mode/fetchedAt/attribution/timeZone）、dataStatus、updatedAt。游标绑定资源、筛选、语言、页长、数据/授权版本及服务器地域；版本变化返回 409 SNAPSHOT_CHANGED。

CURSOR_KEY 为空时按进程生成随机签名密钥，重启后旧游标失效；后续多实例部署需从环境密钥管理中提供一致密钥。本地预览不会生成或提交生产密钥。

错误使用 RFC 9457 Problem、稳定 code、traceId、X-Request-ID。400/404/429/503/500 不返回 SQL、栈、供应商载荷或凭据；429 带 Retry-After。管理路径继续拒绝访问，不提供匿名同步或假员工身份。浏览器响应 no-store，不开放跨域凭据。

## 来源许可、同步与缓存

当前唯一适配器 NOBI_SYNTHETIC 只返回仓库内原创虚构数据，无外部 HTTP 请求。Mock 同样检查：来源启用、审批通过、证据核验、申请人与审批人不同、审批人有效 source_manager 角色、半开有效期、用途与部署地域。

同步前、每次重试前和锁定来源/授权后的提交前均检查权限。一个完整授权必须覆盖 catalog/schedule/results/standings，不拼接不同授权；客户端不能提交 grant 或任意供应商 URL。未知/模式不匹配适配器拒绝使用。

source + kind + external ID 幂等映射；相同载荷只增加运行记录/检查时间，不重复事实、快照或 outbox。来源行锁串行化并发导入。日期、时区、长度、枚举、数值精度、引用及完整快照校验失败后整批回滚，记录安全错误码。

429/暂时服务失败最多重试 3 次，指数退避加抖动，等待上限 10 秒；401/403 不重复重试。Redis 原子窗口限制 API 和来源调用。Redis 失效时最多 1024 个键的进程内限流器继续限额，此降级不等同于多副本全局配额。

Redis 默认用户关闭，nobi ACL 仅允许 `nobi:p2:*` 与必要连接/缓存/计数命令。缓存绑定来源、模式、数据与授权版本、语言、筛选、地域；**每次缓存命中前仍查询 PostgreSQL 授权**。只有同一授权含 redistribution 和 offline_cache 才缓存事实，TTL 最多 30 秒且不超过授权有效期。

撤销/到期/停源后旧缓存命名空间不可读取，物理旧键由 TTL 清除；真实合同要求的全量物理清理/保留工作流尚未实现。数据库授权不可用时禁止用缓存兜底；Redis 故障可回到已授权的数据库读取并显示 degraded。

同步通过本地非 Web 任务执行。local-phase2.ps1 的迁移/种子/同步 JVM 使用 owner；HTTP JVM 只继承 nobi_reader 密码并仅获必要表 SELECT，无来源授权、审计/outbox 写权限。生成凭据仅在忽略的 `.cache/phase2/`，不进入 Git/前端/日志。没有创建可登录员工账号，端口仅绑定回环。

## 验证

完整命令 `pnpm verify:phase2` 的逐项真实退出码与日志见 [checks.json](../verification/phase-2/checks.json)。

| 检查 | 结果 |
| --- | --- |
| Java 21 / Spring Boot 4.1.2 / Maven | 编译、单元、打包和集成 verify 通过 |
| 后端单元 | 11 项通过，无跳过 |
| PostgreSQL 18.6 / Redis 8.2 集成 | 13 项通过，无跳过，使用独立临时容器 |
| Flyway | 空库 V1→V2、重复零迁移、validate、含旧赛季的 V1 升级通过 |
| 同步/授权 | 幂等、并发、修正保留旧快照、提交/重试间撤销、部分载荷/坏引用回滚、跨源/跨站约束通过 |
| Redis | ACL 越界拒绝、原子限额、缓存前撤销/到期/地域检查、暂停 Redis 后降级通过 |
| OpenAPI | 语义与生成漂移检查通过；保留 readiness 无 4XX 的 1 条提示，不虚构业务响应 |
| 实际响应契约 | 34 个真实 HTTP 响应通过 JSON Schema 2020-12/OpenAPI schema，非手写替代样例 |
| 前端回归 | lint、typecheck、3 项 Node 基线、17 项 Vitest、fan/admin 独立构建通过 |
| 本地运行 | 独立 Compose、非 Web 同步任务、只读账号 API 与 readiness 已实际启动 |

首轮三个集成断言失败来自测试未清空无外键关联的历史 outbox，补齐隔离后整套通过。不把跳过或失败的测试记为通过。未重复声明原生构建、远端 CI 或新的浏览器验收。

## 本地验证

要求 PowerShell 7、Java 21、Maven、Node24/pnpm10、Docker Desktop。

```powershell
pnpm verify:phase2
./scripts/local-phase2.ps1 start
./scripts/local-phase2.ps1 status
./scripts/local-phase2.ps1 sync
./scripts/local-phase2.ps1 stop
```

- [readiness](http://127.0.0.1:5280/api/v1/readiness)、[seasons](http://127.0.0.1:5280/api/v1/seasons)、[中文赛历](http://127.0.0.1:5280/api/v1/races?locale=zh-CN)、[drivers](http://127.0.0.1:5280/api/v1/drivers)、[teams](http://127.0.0.1:5280/api/v1/teams)。从 seasons 取 UUID 查询 standings。
- [Phase 1 Web 预览](http://127.0.0.1:5275/)继续使用其本地 Mock。
- 本项目独立端口为 API 5280、PG 55473、Redis 56379。stop 保留卷，不自动删数据，不操作其他项目。
- 本地原创授权有效 30 天；重启不恢复撤销来源/授权、不延长有效期。
- CI 定义已新增，未推送、设置远端保护规则或声称远端 CI 已运行。

## 后续边界

真实供应商合同/字段权利、HTTPS/SSRF/载荷/超时/配额接线、生产地域识别、真实 OIDC/MFA 管理写入、资讯发布与后台 UI、原生安装包、提醒/AI/社区、生产容量/渗透/完整供应链审查及部署均未启用。本次结果是可复现的合成数据后端，不表示取得商业实时资讯运营授权。
