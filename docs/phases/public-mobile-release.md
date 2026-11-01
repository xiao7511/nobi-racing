# 公开站点与移动发布

更新日期：2026-11-01。

## 香港站点

- 地址：https://api.nobistudio.com/racing/
- 香港 Ubuntu 服务器内独立目录 `/opt/nobi-racing`、独立 Node 24 运行时、独立 `nobi-racing-public.service`。仅监听回环 5292，经现有 HTTPS Nginx 的 `/racing/` 路由提供服务。
- 当前 release：`20261101095031`。安装脚本先准备完整目录，切换 symlink，检查数据就绪和 `nginx -t` 后平滑重载。未迁移或修改其他应用数据库。
- F1DB CC BY 4.0 开放数据每小时在服务端同步；浏览器不直接抓上游。快照六小时有效。公开版不启用 BBC RSS、OpenF1 个人接入或合成赛历。
- 发布时包括 23 个非取消/取消标记的周末条目、18 场已完成正赛快照、20 条 NOBI 原创中英文简报。F1DB 发布存在延迟，不声称官方实时成绩。预估会话结束时间另行注明。
- 赛车照片为 2026 墨西哥城大奖赛 10 月 31 日 Audi 官方实拍；非商业编辑用途条件、署名及原始许可页见 `docs/licensing/race-photo-record.md`。页面仅在当前/最近开始分站有对应已核验图片时展示，避免把旧站图标成新站图。
- 来源、地图 CC BY 署名、图片条件、本机存储说明和反馈入口均在 `/#/legal`。此记录说明已落实的来源与部署措施，不代表完成全部地区的法律审查或取得新闻转载权。

## Android

- 下载：https://api.nobistudio.com/racing/downloads/NOBI-Racing.apk
- 包名 `com.nobistudio.racing`，版本 `1.0 (2)`，最低 Android 7.0 / API 24，目标 API 36。
- 当前是 debug 签名的测试安装包；已通过 `apksigner verify` 和包元数据检查，未提交 Google Play，未进行实体手机安装验收。
- SHA-256：`A1B84BB0375B3CDF5333B5E9EB2349794A3BDA24E5165010C1D22D43CDDF2C34`。公网下载文件与本机构建文件一致。
- 不允许明文流量，禁用 Android backup，使用 HTTPS 公开数据服务。无广告或分析 SDK。

## iOS / Codemagic

- 包名 `com.nobistudio.racing`，最低 iOS 16。工程包含 UserDefaults 必要原因 `CA92.1` 隐私清单及标准 HTTPS 加密声明。
- Codemagic App：`6ae70684fd8c853064084b4a`。仅此应用可使用加密变量组 `nobi_racing_signing`；七项签名变量已确认 `secure=true`。
- `ios-archive` 首次构建成功：<https://codemagic.io/app/6ae70684fd8c853064084b4a/build/6ae707d81d4337d8092678ca>，产出已签名 `App.ipa`。
- Apple App Store Connect 应用记录已核验，ID `6829415439`，Bundle ID 一致。
- 最终 `ios-testflight` 成功：<https://codemagic.io/app/6ae70684fd8c853064084b4a/build/6ae70b3332c7d01c709ee0e7>。Apple 已接收 `1.0 (103)`，处理状态 `VALID`，内部测试状态 `READY_FOR_BETA_TESTING`；外部状态 `READY_FOR_BETA_SUBMISSION`，尚未提交外部审核。
- 没有创建公开测试邀请、发送测试邮件或提交 App Store 正式审核。IPA 签名构建成功不等同于 TestFlight 已就绪。

## 验证

- ESLint、TypeScript、49 项 Vitest、3 项基线测试、3 项公开数据服务测试通过。
- Android 构建成功，123 个 Gradle 任务；APK 签名及公网 SHA-256 复核通过。
- 公网 HTTPS、赛历/积分/简报接口均返回 200 和就绪状态，证据位于 `docs/verification/release/public-http.json`。
- 桌面 1440×1000、手机尺寸 390×844 的真实浏览器检查通过：首页实际分站照片、积分、地图、关注、书签、刷新保留、中英文/深浅切换、来源、无横向溢出。未替换 API 或使用测试数据。
- 本站 `no-transform` 响应阻止共享 Cloudflare 自动插入分析脚本；已核实响应与浏览器无外部请求。共享 CDN 对公开 API 仍反射 Origin；两个原生 Origin 可用。直连 Node/Nginx 限原生 Origin，公开 API 本身不含登录、身份、密钥或私有数据。没有修改其他应用的 CDN 规则。
- 浏览器、隐私/CORS 和 Apple 实际状态证据位于 `docs/verification/release/`。尚未进行实体 Android/iPhone 安装验收，也没有分配内部测试员或发送邀请。

## 后续更新

Web 构建使用 `NOBI_WEB_BASE=/racing/`、`VITE_REFERENCE_MODE=public`、`VITE_ANDROID_DOWNLOAD_URL=/racing/downloads/NOBI-Racing.apk`，无需跨域 API 地址。移动构建使用 `VITE_REFERENCE_MODE=public` 与 `VITE_API_BASE_URL=https://api.nobistudio.com/racing`，然后执行 Capacitor sync。

`scripts/install-hk-release.sh` 仅处理本项目 release、systemd 服务和独立 Nginx snippet。签名证书、私钥、描述文件、Token、SSH 临时副本和产物位于忽略目录，不能加入仓库。Codemagic 自动签名时不输出秘密，不撤销已有 Apple 证书。
