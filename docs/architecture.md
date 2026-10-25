# 架构与核心领域模型

## 决策与边界

采用 pnpm Monorepo、两个独立 Vue SPA 和一个 Java 21 / Spring Boot 模块化单体。PostgreSQL 是唯一业务事实存储，Redis 后续用于短期缓存、限流和可重建任务状态。第一阶段不引入微服务、消息队列或搜索集群。REST 是稳定接口；SSE 为可选后续能力。

车迷端共享一套响应式 Web 代码，Capacitor 包装 iOS/Android；管理端不嵌入移动 App。管理端静态资源与车迷端分别构建、单独域名和 CSP。应用内仅放公开配置，密钥与供应商凭据仅在服务端。

~~~mermaid
flowchart LR
  Fan[Fan Web / Capacitor] --> API[Spring Boot REST API]
  Admin[Independent Admin Web] --> API
  API --> DB[(PostgreSQL)]
  API -. cache / rate limit .-> Redis[(Redis)]
  Adapter[Authorized Source Adapters] --> Gate[Rights & Territory Gate]
  Gate --> DB
  DB -. transactional outbox .-> Future[Future AI / Reminder / Community Consumers]
~~~

图中 DB、Redis、适配器和未来消费者是目标结构。Phase 0 实现仅限 UI shell、共享资源、技术状态接口、安全拒绝默认值、契约和迁移草案；尚无业务读取、认证登录、抓取或任务执行。

## 代码依赖

apps/* -> packages/{i18n,design-tokens,contracts}。应用不得互相导入；共享包不得依赖应用。服务端不依赖前端实现，以 OpenAPI 为接口边界。数据源模块不直接修改用户、角色或编辑权限。建议 Phase 1 在单体中按 catalog、calendar、editorial、results、identity、sources、audit、integration 分包，每包区分 domain/application/infrastructure/web。

OpenAPI 是 DTO 权威；Phase 0 的 TS 接口仅为少量可用草案。Phase 1 完成契约评审后生成 API 客户端与 DTO，CI 检查生成产物差异，禁止手工同时维护两个最终模型。

## 核心领域

| 聚合 | 主要对象与关系 | 不变量 |
| --- | --- | --- |
| 赛事目录 | Series -> Season -> Race -> RaceSession；Circuit 有 IANA 时区 | 同赛季轮次唯一；取消赛事保留 ID；UTC 时间与展示时区分开 |
| 参赛与成绩 | RaceEntry 关联 Race / Driver / Team；SessionResult 引用同一 Race 的 Session 与 Entry | 车手转队保留每站快照；DNF/DNS/DSQ 不伪装为正常排名 |
| 积分 | StandingSnapshot / StandingEntry | 按完整快照发布；积分为十进制数，处罚可产生负值 |
| 编辑内容 | Article / ArticleTranslation | draft -> review -> published -> withdrawn；只存授权元数据和自写或许可摘要，双语可独立缺失 |
| 数据权利 | DataSource / SourceGrant / SourceRecord | 未启用、未批准、未生效、过期、撤销或范围不符均拒绝使用 |
| 身份 | AppUser / UserRole | 使用外部 OIDC issuer + subject，不自建密码系统；角色由服务端判定 |
| 可追溯性 | AuditEvent / OutboxEvent | 敏感写入和事实写入在同一事务追加审计/事件；事件消费按 ID 幂等 |

SourceRecord 的内部对象映射为受控多态关系，数据库不可能对多个目标表建立一个外键；应用写入服务必须校验 entity_kind、目标对象存在性和来源一致性，并做定期孤儿记录检查。AI、社区、通知订阅的专属表推迟至对应 Phase 设计，避免将未确定产品能力当作已实现。

## 一致性和全球化

所有事件时刻使用 RFC 3339 / UTC，前端使用 Intl.DateTimeFormat，赛道保存 IANA 时区以处理夏令时。列表使用时间 + UUID 游标，避免仅 offset 分页导致新增数据重复。列表游标绑定过滤条件与快照，签名校验并限制长度。积分 API 传十进制字符串，毫秒时长用整数。

用户语言首先由设备语言映射到 en 或 zh-CN，运行中可切换。内容查询带 locale，缺少翻译时回退英文并在未来 UI 标记原始语言，不机器生成伪译文。当前 UI 切换保留在本次页面会话；登录后偏好保存与本地持久化留给 Phase 1。

## 后续扩展约束

- AI 消费获得授权的数据快照；输出关联源、模型版本、生成时间和人工审核状态；不将供应商正文自动发送第三方模型。
- 提醒消费 RaceScheduleChanged 等 outbox 事件，按用户时区/同意/幂等键发送；变更或取消时撤销旧任务。
- 社区独立审核、举报和封禁边界；不把资讯数据授权扩大成 UGC 媒体再分发许可。
- 可选 SSE 用 Last-Event-ID、心跳和有界重放；不在 URL 放 token；Web 使用同源会话，原生选 fetch 流；不建立未获实时授权的推送流。

## 非功能目标（待压测确认）

公开缓存读取 P95 目标 500ms；内容与赛历默认不声明实时性。监控来源延迟、授权拒绝、API 错误率和 outbox 积压。跨区域部署和数据跨境方案需在真实用户与数据地域明确后评审。所有目标为设计预算，Phase 0 不声称达到生产 SLO。
