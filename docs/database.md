# PostgreSQL Schema 与迁移策略

> Phase 2 当前实现：保留 V1 校验和并执行 V2 前进迁移；season/circuit/race/race_session/driver/team 等已改为要求的复数表名，新增 season_entries、driver_standings、team_standings、sync_run。下文基线表格为 Phase 0 原设计记录。真实 PostgreSQL 18 的空库、重复、validate、V1 升级和跨源/跨站约束均已通过，详细模型与权限见 [Phase 2 报告](phases/phase-2-report.md)。

## 基线

选择 PostgreSQL 18 系列，compose / Testcontainers 候选镜像为 18.6-alpine。正式上线前按实际发布状态复核补丁、扫描镜像并固定 digest。SQL 位于 services/racing-api/src/main/resources/db/migration/V1__foundation.sql；共 20 张表，无种子、用户凭据或商业数据。当前未连接 DB，迁移执行尚未验证。

## 关系与存储

| 表 | 用途 / 关键约束 |
| --- | --- |
| data_source | code 唯一，mode 为 mock/licensed，enabled 默认 false，归因必填 |
| source_grant | 审批证据引用、能力集合、地域、有效区间、保留期；approved 必须有审批人 |
| app_user | issuer + subject 唯一；en/zh-CN；时区；删除时间，无密码、无明文邮箱 |
| user_role | 用户与受控角色复合主键 |
| series / season | 系列 code 唯一；系列 + 年份唯一 |
| circuit | 国家码、IANA 时区、来源/模式/采集时间 |
| race | 赛季 + round 唯一；开始时间索引；revision 支持并发修改 |
| race_session | 赛事 + 类型 + 序号唯一；结束不得早于开始 |
| driver / team | 展示信息与来源标记，不使用外部供应商 ID 作主键 |
| race_entry | 每站参赛快照，同一车手在一站仅一条；保存当站车队 |
| session_result | 会话 + 参赛项主键；双复合外键保证属于同一 Race |
| standing_snapshot | 赛季、所依据赛事和快照时间；赛季与赛事复合外键 |
| standing_entry | driver/team 二选一；快照内参赛主体唯一；允许并列名次 |
| article | HTTPS 原文链接、来源、状态、发布时间、作者、发布者与 revision |
| article_translation | article + locale 主键，标题 240 字符、摘要 1000 字符上限，无正文列 |
| source_record | source + kind + external_id 幂等映射与校验和 |
| audit_event | 操作人、动作、对象、traceId、时间；details 为已脱敏 JSON 对象 |
| outbox_event | 聚合 ID、事件类型、JSON 对象、发布标记、重试计数 |

UUID 由 PostgreSQL 内建 gen_random_uuid() 生成；不依赖 uuid-ossp。外部事实表通过 (source_id, data_mode) 复合外键引用 source，防止把 mock 来源的数据标成 licensed。series/season 是内部目录键，其供应商映射和权利来源通过 SourceRecord 追溯。外键列的查询索引随具体访问路径在 Phase 1–3 通过 EXPLAIN 增补，避免盲目建全量索引。

Timestamp 均为 timestamptz；UTC 存储、API 带时区偏移；IANA timezone、ISO 国家码、合法 HTTPS URL、capabilities 枚举和地域许可由应用层进一步验证。DB CHECK 仅覆盖静态不变量；时间有效性、权利撤销、审批人权限和自审禁止必须在服务端事务执行时校验，不能靠陈旧缓存或 UI 校验。

## 迁移生命周期

1. V1 为首次空库迁移；草案在首次使用前允许评审修正。应用到任何共享环境后禁止修改原文件，使用 V2__description.sql 等前进迁移。
2. Flyway validateOnMigrate 开启；禁止 clean、自动 repair、baselineOnMigrate 和 Hibernate 自动 DDL。共享环境失败应保留现场，人工判定补偿迁移。
3. 采用 expand -> backfill -> contract。新增可空列、兼容旧代码后再填充，最后收紧约束；大表建索引单独评审 CONCURRENTLY 与事务设置。
4. 管理迁移用户仅在受控任务使用 DDL；应用账号仅获得所需 DML，审计账号只读，审计表对应用不授 UPDATE/DELETE。
5. 数据接入按 source_record 去重，在一个事务写领域事实与 outbox，重复执行不重复创建对象。跨源纠错保留 revision、源记录及审计。
6. 备份采用加密全量 + WAL/PITR；每次发布前验证恢复点，定期在隔离库恢复演练。应用回退优先保持新 schema 兼容，破坏性迁移必须另做恢复演练。

## 可执行验证

mvn -f services/racing-api/pom.xml -Pdatabase-it verify 使用 Testcontainers 创建一次性 PostgreSQL，执行 migrate、第二次零迁移、validate，再检查 locale、年份和唯一约束。测试不得禁用 Docker 检查后被报告为通过。当前引擎权限不足，未运行成功。

Phase 1 补充同赛事外键、发布状态、mock/licensed 来源不匹配、非法参赛主体、并发 revision 与撤销授权测试；增加上一已发布版本 -> 下一版本升级测试。当前 Spring Boot 仅状态接口，Flyway 依赖用于迁移测试；服务启动不自动迁移，也不宣称拥有运行时 JDBC/Redis 接线。

## 保留与删除

匿名源事实按合同有效期和 retention_days 清理；撤销后先停止 API 与缓存展示，再按合同删除原始载荷和衍生数据。SourceRecord 不存原始商业载荷。用户注销先撤销会话，再删除偏好与后续订阅；审计按经批准的最短期限保留并假名化 actor，不能在存在审计外键时直接删除用户。outbox 发布完成按运维策略归档，不用于无限期储存 PII。
