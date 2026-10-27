# 架构设计

> 版本 0.1 · 2026-10-27

## 总体架构

```
┌─────────────────── 纯静态前端（Cloudflare Pages）───────────────────┐
│                                                                      │
│  src/data/surveys/<id>/          src/engine/              src/views/ │
│  ├─ manifest.json      ─────►   ├─ types.ts    类型定义   ├─ Home.vue      量表列表
│  ├─ questions.json              ├─ loader.ts   注册+计分  ├─ Quiz.vue       答题
│  ├─ scoring.json                └─ analytics.ts 统计接口 ├─ ResultView.vue 结果
│  └─ results.json                                                   │
└──────────────────────────────────────────────────────────────────────┘
                                   │（预留）
                                   ▼
                    Cloudflare Workers + D1（日后统计，未实现）
```

## 核心决策

### D1：声明式量表包（配置驱动）

每种量表是一个文件夹（4 个 JSON），计分规则不写死在代码里：
- `letter-pairs`：MBTI 型「维度配对取高者拼字母」
- `thresholds`：SDS 型「总分区间判级」
- 特殊算法的逃生舱：如需自定义策略，扩展 `ScoringConfig.strategy` 并在 `computeResult` 增加分支（保持配置声明优先）。

量表包通过 Vite `import.meta.glob('/src/data/surveys/*/*.json')` 在构建期自动注册——**新增量表零代码改动**。

### D2：题型只有两种

- `single`：选项显式携带 `score: {维度: 分}`，表达力最强（强迫选择、加权都覆盖）；
- `scale`：李克特题，靠 `dimension / weight / reverse / scalePoints` 声明计分，作答值域 1..N（与主流量表的 1-4 / 1-5 计分一致，便于对齐标准常模截断值）。

### D3：数据与隐私

- 作答草稿：`localStorage`（key: `survey-draft-<id>`），提交后清除。
- 结果历史：`localStorage`（key: `survey-history`）。
- 统计上报：`AnalyticsService` 接口 + `LocalStorageAnalytics` 实现。日后接入云端统计时新增 `CloudflareAnalytics` 实现并替换工厂导出即可，页面与计分引擎零改动。

### D4：托管（Cloudflare Pages）

- 生产域名：`<project>.pages.dev`（免费），日后可绑定自定义域名（如 eu.org 二级域名）。
- SPA 路由需要 `public/_redirects`（`/* /index.html 200`）。
- 接入方式：GitHub 仓库 → Pages「连接 Git 仓库」，构建命令 `npm run build`，输出目录 `dist`。

## 目录结构

```
Survey Platform/
├─ docs/               # vibe coding 文档
├─ public/_redirects
├─ src/
│  ├─ data/surveys/    # 量表包（数据层）
│  ├─ engine/          # 类型、加载/计分、统计接口（逻辑层）
│  ├─ views/           # 页面（表现层）
│  ├─ router.ts
│  ├─ App.vue
│  ├─ main.ts
│  └─ style.css
├─ index.html
├─ vite.config.ts
└─ package.json
```

## 扩展路线

| 阶段 | 内容 | 改动范围 |
|---|---|---|
| v0.1（当前） | 引擎 + 2 个量表 + 静态托管 | — |
| v0.2 | 结果分享图（canvas 导出）、历史列表页 | 新增 view + util |
| v0.3 | 自定义计分模块（JS 逃生舱） | loader 支持加载 .js 配置 |
| v1.0 | Cloudflare Workers + D1 云端统计 | 仅新增 analytics 实现 + worker |
