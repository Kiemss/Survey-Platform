# 任务清单

> 按 docs/PRD.md 的里程碑拆分。✅ = 已完成

## v0.1 MVP（当前）

- [x] 项目脚手架（Vite + Vue3 + TS + vue-router）
- [x] 引擎：类型定义、量表包自动注册、计分（letter-pairs / thresholds）
- [x] AnalyticsService 统计接口层（localStorage 实现 + 云端预留）
- [x] 页面：首页列表 / 答题页（进度、草稿恢复）/ 结果页（维度图、得分）
- [x] 量表包：MBTI 93 题、SDS 20 题
- [x] 文档：PRD、架构、量表包规范
- [x] Cloudflare Pages 部署配置（_redirects）
- [ ] 本地完成一次 MBTI + 一次 SDS 全流程人工验证
- [ ] 推送 GitHub 并接入 Cloudflare Pages（pages.dev 域名上线）

## v0.2 体验增强

- [ ] 结果分享图（canvas 导出 PNG）
- [ ] 历史记录页（查看/删除本机历史）
- [ ] 答题中途退出恢复提示
- [ ] 移动端适配细调与深色模式

## v0.3 量表情报

- [ ] 自定义计分模块逃生舱（scoring.js）
- [ ] 新增量表：大五人格 BFI-44、SCL-90（题库整理）
- [ ] 量表包 JSON 格式校验脚本（CI 兜底）

## v1.0 数据统计（可选，需后端）

- [ ] Cloudflare Functions/Workers + D1 匿名统计
- [ ] 结果占比统计页（只展示聚合数据）
- [ ] AnalyticsService 切换云端实现
