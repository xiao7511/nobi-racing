# 数据源适配与授权控制方案

## 当前接入清单

| 类别 | 当前状态 | 允许内容 |
| --- | --- | --- |
| 商业实时数据 | 未选择、未购买、未连接 | 无 |
| 官方图片、视频、文章正文 | 未抓取、未下载 | 无 |
| 公共事实/开放 API | 仅作为未来评估候选 | 未取得条款评审前不接入 |
| Mock | 允许本地合成测试 | 必须显式标记，禁止伪装为真实比赛 |
| 自有编辑内容 | 后续人工创建 | 仅有权发布的标题/原创摘要，来源可追溯 |

“公开可访问”“有 RSS”“robots 允许”不等于具有复制、缓存、翻译、训练或再分发授权。本项目当前不选定任何实际供应商，避免把方案等同于已获许可。商业开通、付费与合同签署均在本次范围之外。

## 适配器端口（设计，尚未实现）

每个来源实现 SourceAdapter：describeCapabilities、fetchSchedule、fetchResults、fetchArticleMetadata。输入包含 sourceId、游标、地域、目标能力和授权上下文；输出为标准 DTO + source record key + fetchedAt + attribution + mode。不具备某能力直接拒绝，不以 HTML 抓取回退。

流程为：供应商登记 -> 证据评审 -> 双人审批 -> 禁用默认值 -> 测试映射 -> 限定能力启用 -> 定时同步。网络获取、解析与领域 upsert 分离；域名固定白名单、HTTPS、响应体大小上限、超时和并发限制，拒绝私网/回环/云元数据地址及重定向后的非法目标，防止 SSRF。仅采集已许可字段。

来源事实先通过 schema、日期、枚举和长度校验，再以 source + entityKind + externalId 幂等 upsert。供应商配额用令牌桶，429 尊重 Retry-After，5xx 有界指数退避并加入随机抖动；401/403 不自动反复重试。失败进入可审计隔离队列，不将不完整 standings 覆盖完整快照。

## 授权模型

DataSource.enabled 默认 false。SourceGrant 必须 approved，且 validFrom <= now < validUntil，capability 和 territory 精确匹配，审批人有效，证据引用可核验。没有全球通配授权默认值，不能仅根据客户端自报国家绕过地域许可；服务端结合合同、部署地域和必要的用户可用区策略确定地域，边界不明则停止展示。

能力至少拆分 schedule、results、standings、article_metadata、summary、image、video、realtime、translation、ai_input、redistribution、offline_cache。展示、缓存、翻译、推送和 AI 分析分别判定，不因获得 schedule 就自动获得 realtime 或 ai_input。SourceGrant 的 capabilities 在 Phase 1 加入服务端枚举校验；DB 的 text[] 是存储，不是完整权限引擎。

packages/contracts 的 canUseSource 仅是投影策略函数：检查启用、状态、两端时间、能力与地域。它不能替代服务端审批证据、操作者权限、字段级许可和来源归因校验。不得信任客户端传入 grant。

读 API 同样重新检查授权。缓存按 source、grant revision、locale、territory、mode 分区，撤销/到期先停读并失效缓存与离线包，再处理删除与合同要求。不得把失效授权当成普通的可容忍 stale 数据。

## 人员权限

| 主体/角色 | 许可 |
| --- | --- |
| 匿名车迷 | 已发布且对本地域获权的公开内容 |
| fan | 本人偏好、后续关注与订阅；不能读取他人资料 |
| editor | 创建/修改草稿，提交审核；不得批准来源授权 |
| publisher | 经批准内容的发布/撤回；不得扩大数据源权利 |
| source_manager | 登记、审批、撤销来源授权；需要 MFA 和独立审批人 |
| administrator | 人员和配置治理；不得绕过来源合同门禁 |

RBAC 在服务端映射 permission，再叠加对象归属、地域、来源合同和审核状态（ABAC）。Web 管理端隐藏按钮只是体验，不构成授权。source_manager 不允许批准自己提交的授权；数据库已预留 created_by / approved_by 与禁止自审约束；Phase 1 实现操作者权限、证据复核和审批事务，Phase 0 不提供运行中的审批接口。

## 身份与凭据

Web 规划 OIDC Authorization Code，通过同源 BFF 保持 Secure/HttpOnly/SameSite 会话，写操作检验 CSRF token 与 Origin；管理端强制 MFA 和短会话。移动端使用系统浏览器 + Authorization Code/PKCE，短期访问令牌在内存，刷新令牌仅放 OS 安全存储，不使用 localStorage。校验 issuer、audience、签名算法、expiry、nonce/state，退出撤销会话。

当前服务没有 IdP、没有注册/登录和角色分配流程；仅状态接口公开，其余路径拒绝。后续 OAuth2 Resource Server 由 Spring Security 管理，不自写 JWT 验签。

供应商凭据存放环境密钥管理服务，代码、构建参数、前端 VITE_*、日志、追踪属性、URL 查询串和 OpenAPI 示例不得含密钥。合约证据存于受限文档存储，DB evidence_ref 只存不含凭据的内部引用。

## 授权证据登记字段

每项实际接入前记录：权利人、合同/条款版本、签署日期、可用字段与用途、地域、平台、用户规模、时效性、归因要求、缓存/离线时长、衍生作品/AI 许可、转授权限制、删除要求、费用批准、审批人及复核日期。当前所有真实来源的状态均为“未批准”。
