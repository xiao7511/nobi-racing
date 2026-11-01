# 赛道地图与赛历整理

日期：2026-11-01。

赛事列表与周末详情增加赛道路线图、中文赛道全名、放大弹窗和地理位置链接。当前 OpenF1 返回的 25 个大奖赛周末均有对应地图。以来源的实际赛道匹配，避免把调整举办地的大奖赛映射到同名历史场地；例如 Kuala Lumpur 对应雪邦，Sakhir 对应巴林常规布局。未知场地或图片失败显示缺失提示，不使用其他赛道代替。

赛事页底部“开发样例赛历 / MOCK”区域及其数据库读取已移除。独立的原 UUID 比赛详情与成绩 API 保留；其他页面的合成数据来源标记继续如实展示。

## 地图来源

使用 Jules Roy / F1DB 提供的 SVG，固定版本为 [`f35a8c61d15d275061475e543b8dc79ac3daad97`](https://github.com/f1db/f1db/tree/f35a8c61d15d275061475e543b8dc79ac3daad97/src/assets/circuits/white-outline)。依据 F1DB 场地元数据选择适用于 2026 的布局，包含蒙特利尔、摩纳哥、新加坡等更新版本。

原图未修改，按屏幕大小缩放。SVG 随站点本地提供，页面无需远程图片请求；地理位置通过用户主动点击 OpenStreetMap 链接打开。每张图及版权来源页保留作者、固定版本来源和 CC BY 4.0 链接；完整许可及署名说明位于 `apps/fan/public/media/circuits/LICENSE.txt`、`ATTRIBUTION.txt`。赛道图为路线参考，不代表主办方的最新场地安排或导航数据。

## 验证

- `pnpm check:phase1` 通过：lint、类型检查、3 项 Node 基线、42 项 Vitest、车迷端和管理端构建。
- `pnpm exec playwright test -c playwright.official.config.ts`：桌面 Edge 与移动 WebKit 共 8 项通过，包含地图加载、放大关闭、详情及样例区域移除断言。
- `scripts/verify-circuit-maps-live.mjs`：使用实际本机 Java API，无浏览器 API 替身；桌面与移动端均检查 25 个周末、25 张本地 SVG，放大、详情对应、无横向溢出及样例赛历请求为零。截图与结果见 `docs/verification/circuit-maps/`。
- 本轮没有后端逻辑或契约变更，未重跑 Java 或完整 PostgreSQL/Redis 回归。原后端浏览器用例改为从 API 获取比赛 ID 后直达详情，以适应列表已移除的情况；没有据此声称该完整回归已执行。

本次仅更新本机开发预览，未公开部署。
