# 导航与来源入口修正 · 2026-11-02

- 移动底栏由六项精简到首页、资讯、赛事、我的四项。底栏高度固定为 64px 加底部安全区，四列等宽，文字和图标固定尺寸；数据、论坛、设置和来源页可从“我的”访问，桌面六项侧栏保留。
- HTML 文本自动调整固定为 100%，页面采用稳定小视口高度和滚动条预留空间；移动输入、选择和文本框字号至少 16px，切页前取消输入焦点，不禁用用户手动缩放。初测旧版在模拟移动 WebKit 中的普通导航已为 scale=1，未在实体 iPhone 上复现；本次针对小字号控件触发 iOS 聚焦缩放和导航布局变化因素修正。
- 统一 `safeHref` 将 GitHub、www.github.com、raw.githubusercontent.com 来源入口改为站内 `/sources`，目标窗口改为当前页面。保留来源 URI 纯文字、F1DB/Marcel Overdijk、Jules Roy 署名、适用 CC BY 许可和官方成绩入口。版权归属及开放数据契约没有删除或伪装。
- 已覆盖资讯顶部 F1DB、采集元数据、赛历和周末详情、赛道图、积分、个人中心、版权页及战报出处。周末相关战报与收藏进入站内 `/brief` 阅读。公开反馈指向论坛，不再要求访问项目 Issues。
- 浏览器检查：移动 WebKit 320/390px、移动 Edge 390px；多次通过底栏往返，断言视口宽度、缩放值、底栏宽高与位置一致，输入字号至少 16px，离开设置后输入失焦。全路由扫描无 GitHub 可点击链接或 GitHub 网络请求，F1DB 点击同一窗口进入来源页。
- 证据位于 `docs/verification/navigation/`，未进行实体 iPhone 安装验收。实际发布、Android 签名和 Apple 处理结果随该目录记录。

## 发布与验收

- 香港站点 release：`20261102153422`。公网 WebKit 320/390px 与 Edge 390px 的循环切页和来源入口测试全部通过，底栏 64px（另加设备安全区）、四项等宽、视口 scale=1，未请求 GitHub 页面。
- Android 测试包 `1.0 (4)` 已更新，签名和服务器文件哈希验证通过；SHA-256 `d0f192e77992f16e9ae72a4025532a1a807a6f4e94aa00fe5b67743b93f585ea`。
- iOS `1.0 (105)` 已通过 [Codemagic 构建及上传](https://codemagic.io/app/6ae70684fd8c853064084b4a/build/6ae8ad727bc6d6971ecdacc0)，Publishing 成功；Apple 状态 `VALID / IN_BETA_TESTING`，详见 `ios-testflight.json`。
- 网站刷新后使用新资源；已安装原生包包含本地前端资源，需要安装新版 APK 或通过 TestFlight 更新后才能使用修正。
- 论坛数据库和注册账号继续保留；本机隔离预览已停止，临时 SSH 私钥副本已清理。
