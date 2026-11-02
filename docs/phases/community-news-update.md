# 资讯与车迷社区更新 · 2026-11-02

## 行为变化

1. 公开资讯源检查由每小时改为每两分钟。按 F1DB revision 缓存赛历目录和原始文件，未变化时只查询 revision，不重复下载全部资料。取消简报固定三小时等待；仍仅在已有相应分类数据且会话结束后生成。单次上游失败保留未过期快照，六小时后停止展示。上游发布时间仍决定实际到达速度，不能称为实时官方新闻。当前新快照已收录 19 场正赛。
2. 赛事页加入原创双语 F1 规则入门：周末、积分、轮胎、旗号、安全车、处罚、2026 主动空气动力。参照 FIA Section A Issue 03、Section B Issue 09 与 Formula 1 官方术语说明，核对日期 2026-11-02；不复制完整法规，以现行规则与赛会公告为准。
3. 首页、资讯页加入关注主队相册。11 队共 22 张真实赛车照片，按本机车队关注筛选，拍摄日期较新者优先；支持六秒轮播、暂停、前后切换、减少动画和失焦/后台暂停。照片是已核验相册，不声称每张为最新分站或实时画面。来源、作者、日期、CC BY/CC BY-SA 许可、缩略图改动和 SHA-256 均记录在 `apps/fan/src/content/team-photos.json`，展示于图注与版权页。没有关注车队时给出关注入口。
4. 公开资讯标题、“阅读战报”和个人中心书签进入站内原创战报页；用户可打开 F1 官方成绩目录。GitHub 数据记录只在折叠的“数据出处与许可”中清楚标注，不再伪装成新闻原文。
5. `/forum` 提供真实用户名/密码注册、登录、发主题、回复、举报、作者删除及注销；内容在管理员审核后公开。账号、会话哈希、帖子和举报保存于独立 Node SQLite 数据库，不接触其他项目数据库。双语页面与移动导航已接入。

## 账号与审核

- 用户名 3–24 个 ASCII 字母/数字/下划线，密码 12–128 字符，scrypt 随机盐哈希，登录凭证为随机 256 位并仅在数据库保存 SHA-256。凭证在页面内存保存；站内导航保留，刷新后重新登录，服务端最长一天有效。
- 无邮箱或手机号，不发送邮件；暂不支持自助找回密码。注册必须同意社区规则和账号隐私说明。全部发帖与回复默认待审核；举报暂停公开，管理员复核。禁止 HTML/脚本、图片上传、广告及侵权转载。
- 注册/登录每来源两分钟至多十二次，同时至多两项密码计算；每账号每小时最多十条帖子/回复；请求体上限 16 KiB，服务资源沿用独立 systemd 限制。本站 API 仅信任 Cloudflare 官方代理网段的 `CF-Connecting-IP`，直连者不能伪造该来源。
- 普通用户不能访问待审核他人内容、审核或删除他人帖子。注销需键入用户名，级联删除账号、会话、帖子与回复；SQLite `secure_delete` 和 WAL checkpoint 用于清理已删内容。没有创建数据库备份或邮件测试邀请。
- 首次运行在私有 StateDirectory 生成 `nobi_admin` 管理员及随机密码，写入权限 0600 的 `administrator-password`。登录论坛后可在页面审核，不显示数据库密钥或密码。生产资料仅交付给用户本机忽略文件；不要提交到 Git。

## 验证与发布

- 静态检查、TypeScript、49 项前端单元测试、3 项基线测试与新增服务集成测试；论坛测试覆盖鉴权、待审隔离、审核权限、恶意越权删除、举报隐藏、回复和注销级联。
- 真实本机 API 浏览器验收覆盖桌面/手机尺寸、主队图片筛选切换、站内阅读、规则展开、注册、发帖待审、注销、管理员登录；不在生产创建测试账号或公开测试帖。
- 证据：`docs/verification/community/`。网站、Android 与 TestFlight 的最终发布状态以该目录更新记录为准。

## 来源

- https://www.fia.com/regulation/category/110
- https://www.fia.com/system/files/documents/fia_2026_f1_regulations_-_section_a_general_provisions_-_iss_03_-_2026-06-25.pdf
- https://www.fia.com/system/files/documents/fia_2026_f1_regulations_-_section_b_sporting_-_iss_09_-_2026-10-01.pdf
- https://corp.formula1.com/f1-2026-regulations-terminology-update/
- 图片来源和许可逐张见相册 manifest。适用 CC BY-SA 的图片及其显示裁切仍保持相应图片许可，不对其他代码或照片更改许可。

## 发布结果

- 香港站点：<https://api.nobistudio.com/racing/>；论坛：<https://api.nobistudio.com/racing/#/forum>。最终 release `20261102145638`，未改动其他项目数据库。
- Android `1.0 (3)`：[下载测试 APK](https://api.nobistudio.com/racing/downloads/NOBI-Racing.apk)。签名验证及服务器 SHA-256 一致：`3B7FD605EBD8CD208C806DD9D3DE25AFCD9A1D01332B6BCE775E1A46D754751E`。
- iOS `1.0 (104)`：[Codemagic 成功记录](https://codemagic.io/app/6ae70684fd8c853064084b4a/build/6ae8a132ce391a57b0f3cad7)。Apple 状态 `VALID`、`IN_BETA_TESTING`，已进入现有内部测试。隐私清单已声明为账号功能收集用户名标识和用户发布内容，不用于追踪。
- 公网桌面/手机尺寸浏览器全部通过；生产管理员登录、审核队列、退出均核验成功，没有创建公开测试帖或生产测试账号。
- 管理员登录资料仅保存在用户本机 `.cache/release/forum-administrator.txt`（当前 Windows 用户权限），不包含于代码、截图或 Git。原始 SSH、Apple、Codemagic 密钥文件未改动。
