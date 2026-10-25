# API 草案与错误码

> Phase 3 更新：当前 OpenAPI 版本 0.3.0，成绩响应增加 `driverName` 与 `teamName`。已实现的 GET 操作生成 TypeScript DTO 和 standalone 响应校验器，`pnpm api:client:generate` 更新，`pnpm api:client:check` 检测漂移；Web 使用同源 `/api/v1` 并拒绝非 synthetic/mock 数据。分页除游标外校验相同 snapshotVersion/snapshotId，不进行跨快照拼接；详细边界见 [Phase 3 报告](phases/phase-3-report.md)。

> Phase 2 更新：OpenAPI 已为 0.2.0，`x-phase-status=implemented-phase2` 的赛历/目录/成绩/积分接口已经实现，locale 为 en-US/zh-CN。readiness 检查 DB/Redis，错误包含 traceId；34 个真实 HTTP 响应通过契约校验。下文 Phase 0 草案说明保留为历史；当前可调用端点、游标/缓存规则和错误边界见 [Phase 2 报告](phases/phase-2-report.md)。Profile、资讯与管理写入仍是不可用草案。

OpenAPI 3.1 权威文件为 packages/contracts/openapi.json（JSON 格式也是有效 OpenAPI 文档）。版本 0.0.0，REST 基路径 /api/v1。只有 GET /api/v1/readiness 已写入服务骨架；其返回 foundation、phase=0、dataMode=mock，仅表示进程级基线，不表示数据库/外部来源已就绪。其余操作标记 x-phase-status=draft。

## 首批接口

| 操作 | 行为 | 授权 |
| --- | --- | --- |
| GET /readiness | Phase 0 技术状态 | 公开 |
| GET /races、/races/{id} | 赛历、赛事详情 | 公开已授权数据 |
| GET /articles、/articles/{id} | 已发布标题、摘要、原文链接 | 公开已授权数据，无正文 |
| GET /standings | 指定赛季和 driver/team 的最新完整快照 | 公开已授权数据 |
| GET /me | 本人资料 | 会话或访问令牌 |
| PUT /me/preferences | 更新本人语言与时区 | 对象归属 + Cookie 写操作 CSRF |
| GET /admin/sources | 来源清单 | sources:read |
| PUT /admin/source-grants/{id}/approve | 有证据、无自审的授权审批 | sources:approve + MFA + 审计 + If-Match |

后续单站成绩、管理端内容编辑与发布、账号删除、订阅和社区操作在对应 Phase 扩展契约，不伪装为当前可调用接口。draft 审批模型含证据引用、版本、申请人与审批人；实际权限校验和审批页面留给 Phase 1–2。

## 协议规则

- JSON UTF-8，UUID 标识，不暴露数据库顺序主键或第三方凭据。未知字段策略由请求 DTO 严格校验，禁止直接绑定持久化实体。
- 时间使用 RFC 3339 带偏移；timeZone 使用 IANA 标识，积分以十进制字符串传输。
- locale 仅 en/zh-CN，默认 en；语言不代表地域授权。
- 列表 limit 默认 20、范围 1–100，cursor 最长 512 字符，绑定排序与过滤条件。响应含 items 和 nextCursor，末页为 null。
- 公开事实响应必须含 provenance.sourceId、mode、fetchedAt、attribution。stale 仅在合同许可且未过期授权时出现。
- 并发写使用 revision / ETag / If-Match；幂等导入使用源记录自然键。未来创建类写操作使用 Idempotency-Key，结果有界保留。
- 429/503 使用 Retry-After；CORS 白名单与同源 Cookie 按环境显式配置，不反射任意 Origin。
- 写操作与鉴权响应不缓存；公开缓存按来源许可控制，用户及管理响应 Cache-Control: no-store。
- API 错误不是供应商原始响应。基础 readiness 使用 OpenAPI 对齐的静态结构；未来接口实现必须用契约验证器检测响应漂移。

## 错误格式与映射

使用 application/problem+json（RFC 9457）：type、title、status、稳定 code；业务实现补充 traceId 和经脱敏 detail。detail 不含 SQL、栈、凭据、供应商载荷或内部地址。客户端按 code 翻译，title 只作默认说明。

| code | HTTP | 处理 |
| --- | --- | --- |
| VALIDATION_FAILED | 400 | 修正参数，返回安全的字段错误 |
| AUTH_REQUIRED | 401 | 重新建立身份，会话无效不重试业务请求 |
| AUTH_FORBIDDEN | 403 | 权限或对象归属不足 |
| RESOURCE_NOT_FOUND | 404 | 资源不存在或按防枚举策略隐藏 |
| VERSION_CONFLICT | 409 | 重新读取后明确合并，禁止静默覆盖 |
| SOURCE_NOT_AUTHORIZED | 403 | 来源/地域/能力/时效不符，禁止回退抓取 |
| SOURCE_UNAVAILABLE | 503 | 显示来源状态，在许可内有界重试 |
| RATE_LIMITED | 429 | 尊重 Retry-After |
| INTERNAL_ERROR | 500 | 通用提示与 traceId，记录脱敏内部日志 |

安全过滤器当前对匿名受保护 GET 返回 AUTH_REQUIRED；业务错误映射、trace filter 与字段校验属于 Phase 1。不要将框架默认错误当成已完成完整规范。

## 检查

node scripts/check-baseline.mjs 检查本地 $ref、operationId 唯一和管理权限标记，不是完整 OpenAPI 语义校验器。安装依赖后 pnpm check:api 运行 Redocly 规范校验；Phase 1 再增加 schema 驱动 Mock 与 Java/TS 契约测试。所有 Mock 实例必须是合成数据并携带显式来源标记。
