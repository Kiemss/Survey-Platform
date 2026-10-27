# 项目进展报告（PROGRESS）

> 本文件为唯一进展跟踪文档，每次代码/文档更新后由 AI 同步更新。
> 详细的计划与任务拆分见 [docs/tasks.md](tasks.md)，本文件记录「实际发生了什么」。

---

## 当前状态：v0.1 已上线 ✅

- **最新版本**：v0.1.0
- **线上地址**：https://survey-platform.zhengxinghuo5.workers.dev （已在 Cloudflare 启用 workers.dev 路由）
- **远程仓库**：https://github.com/Kiemss/Survey-Platform
- **部署链路**：push main → Cloudflare Workers Builds 自动构建（`npm run build`）→ `wrangler deploy`（静态资产 + SPA 路由）
- **阻塞问题**：🟢 无
- **自定义域名**：✅ `https://greensail.dpdns.org` 已绑定并生效（workers.dev 仍可用）

---

## 2026-10-27（第六次更新：v0.3 启动——学科分类与量表家族）

### 运维事件：Git 集成故障 + 本地直连部署通道建立

- Cloudflare 构建「fetching repository」失败，重连 GitHub 应用并排除权限问题后仍未恢复。
- **应急方案生效**：本地 `wrangler login`（OAuth）+ `wrangler deploy` 直连部署成功，线上已更新为最新版本（已验证 bundle 指纹）。
- 后续策略：代码照常推送 GitHub 存档；部署改由本地 `npx wrangler deploy` 完成。若 Cloudflare Git 集成日后恢复，两条通道互不冲突（同一 Worker）。
- 备注：wrangler 首次运行需临时 npm 缓存（`$env:npm_config_cache="$env:TEMP\npm-cache"`），因全局缓存目录无写权限。
- 故障根因（Cloudflare 侧报错佐证）：`Error fetching GitHub User or Organization details`——CF 无法获取 GitHub 账户元数据，账号侧无可修复项，维持本地直连部署。构建令牌已轮换。
- UI 规范（`d06cb6e`）：首页量表卡片统一为「左下角题量（题库自动统计）/ 右下角开始测试」，版本号与「约 X 分钟」移出卡片（版本 tag 仅家族模板显示在标题旁）。

### 已完成（`d0ec48c`）

1. **一级学科分类**：新增 [categories.ts](src/data/categories.ts) 分类注册表（当前：心理学 🧠 / 趣味测试 🎉），首页改为顶部 Tab 导航（全部 + 各学科，含计数与空状态），量表 manifest 新增 `category` 字段（缺省 psychology）。
2. **量表家族机制**：同一量表的多套模板（如 MBTI 93 题完整版 / 未来简版）共享一份结果文案——`families/<family>/results.json`；manifest 新增 `family` / `variant` 字段；加载优先级：量表包内 results.json > 家族共享。MBTI 已迁移为家族模式（改名「MBTI 人格类型测评（完整版）」，卡片显示「完整版 93 题」标签）。
3. **文档**：[survey-package-spec.md](docs/survey-package-spec.md) 升级 v2（学科分类、家族机制、新目录结构、上架步骤更新）。
4. 浏览器实测 6/6 通过（Tab 切换/计数/空状态/家族文案加载/无报错）。

### 待办（v0.3 剩余）

1. ~~题库格式校验脚本~~ ✅（`cc2494c`）：[validate-surveys.mjs](scripts/validate-surveys.mjs)，20 余条规则（manifest 一致性、题目 id 重复、single/scale 计分键与策略对齐、letter-pairs 2^n 组合文案覆盖、thresholds 区间连续、家族/分类引用存在性），中文报错；已挂 `prebuild`——本地 `npm run build` 和 Cloudflare 部署前都会自动校验。正向 + 反向（坏 id、缺结果文案）实测均正确拦截。
2. 大五人格 BFI-44（psychology 分类）
3. 趣味测试首秀：1-2 个搞笑测试（fun 分类，single 题型 + 自定义 resultId）

---

## 2026-10-27（第五次更新：v0.2 启动 + 自定义域名绑定）

### 已完成（v0.2 第二批，`95b3423`）

1. **设置全局化**：设置面板从答题页移到全站顶栏 ⚙，含自动下一题开关、跳转速度数字输入（深色模式由 ☀️/🌙 图标直接切换，面板中不重复提供）；settings.ts 升级为 Vue reactive 全局 store，改设置即时同步所有页面并持久化。后续微调（`2a84afb`）：移除面板内深色模式下拉与答题页「设置见右上角」提示。
2. **结果分享图**（share.ts）：canvas 绘制结果卡片（量表名/结果代号/标题/维度条/日期与域名），2x 分辨率导出 PNG 下载；兼容 letter-pairs（MBTI 百分比对）与 thresholds（SDS 维度得分）；分享图固定浅色视觉。
3. **移动端适配**：375px 宽下顶栏/答题页/结果页/历史页布局优化。
4. 浏览器实测通过：全局设置生效、MBTI/SDS 分享图下载成功、无控制台报错。

### 已完成（v0.2 第一批）

1. **自定义域名绑定成功**：`https://greensail.dpdns.org`（DigitalPlat 注册 → Cloudflare 托管 → 绑定到 Worker，Production 环境）；workers.dev 地址仍可用。
2. **新增设置模块** [settings.ts](src/engine/settings.ts)：基础设置客户端持久化（localStorage，key `survey-settings`），后续设置项在此扩展。
3. **自动下一题**（默认开）：
   - 答题后 350ms 自动跳下一题（给选中态留视觉反馈），最后一题不自动跳（等待提交）；
   - 答题页右上角「自动下一题：开/关」切换按钮，状态持久化；
   - 手动翻题/离开页面时取消已排队的自动跳转，避免连跳。
3. **设置下拉面板改版**：答题页右上角改为 ⚙ 图标，点击弹出设置面板（点外部自动收起），内含：
   - 「自动下一题」开关（iOS 风格 switch）；
   - 「跳转速度」选择：150/250/400/600ms 四档预设，**默认 250ms**（原 350ms 用户反馈太慢），自动跳转关闭时该选项禁用。
4. **深色模式**（`031dbb5`）：顶栏 ☀️/🌙 按钮切换；设置支持 `auto`（默认，跟随系统）/light/dark 三态，首次访问跟随系统偏好；深色配色以 `:root.dark` CSS 变量实现，全部组件改用主题变量。
5. **跳转速度改为数字自定义输入**：100–2000ms（步进 50，自动钳制），替代原四档预设；自动跳转关闭时禁用。
6. **历史记录页**（`894ce2f`）：顶栏新增「历史」入口（/history）：
   - 列表展示本机全部测评记录（量表名、结果、时间，新的在前）；
   - 「查看」回跳该次结果详情页；「删除」删单条；「清空全部」带确认对话框；
   - analytics.ts 接口层相应扩展 `removeResult()`，getHistory 改为按时间倒序；
   - 量表被移除的旧记录仍以原始 id 兜底展示（不崩溃）；
   - 浏览器实测 6/6 通过（列表/查看/删除/清空/深色模式/无报错）。
7. 以上已推送，Cloudflare 自动重新部署中。

### 待办（下一步）

1. v0.3 量表扩充：大五人格 BFI-44、SCL-90，题库格式校验脚本
2. 可选：SDS 复测趋势视图（基于历史数据折线）
3. 可选：分享图支持移动端直接调起系统分享（Web Share API）

### 已完成

1. **Cloudflare 流程变更应对**：新版控制台把 Pages 收进「Workers 部署」流程，默认 deploy 命令为 `npx wrangler deploy`，需要在仓库中提供配置。新增 [wrangler.jsonc](wrangler.jsonc)：
   - `assets.directory = ./dist`（Vite 构建产物）
   - `assets.not_found_handling = "single-page-application"`（SPA 路由兜底，替代原 Pages 的 `_redirects` 方案）
2. 配置已提交并推送（`770e9b9`）。
3. **确认决策**：用户页面已进入 Workers 流程，保持该流程而非回退 legacy Pages。`public/_redirects` 保留（对 legacy Pages 兼容，无副作用）。
4. **域名预期变化**：上线域名将为 `survey-platform.<子域名>.workers.dev`（Workers 站点），而非 `*.pages.dev`。

### 待办（下一步）

1. 用户点击 Deploy → 线上全流程验证；
2. 绑定自定义域名（可选项，后续再说）；
3. 进入 v0.2 体验增强（见 [docs/tasks.md](docs/tasks.md)）。

## 2026-10-27（第三次更新：接入 GitHub）

### 已完成

1. **git 初始化**：本地首次提交 `df7c5b7`（全部代码 + 文档，node_modules/dist 已忽略）。
2. **推送 GitHub**：仓库 `Kiemss/Survey-Platform`，main 分支已同步（`git ls-remote` 核对过）。
3. **网络问题解决**：本机 DNS 直连无法解析 github.com；本机有 Clash 代理（127.0.0.1:7890），git 设置 `HTTPS_PROXY=http://127.0.0.1:7890` 后推送正常。**经验：后续推送需先开代理。**
4. 用户已在 Cloudflare Dashboard 完成 GitHub 授权（Compute → Workers & Pages → Create → Pages → Connect to Git），进入仓库选择页。

### 待办（下一步）

1. 用户在 Cloudflare 选中 `Survey-Platform` 仓库 → 构建命令 `npm run build`、输出目录 `dist` → Save and Deploy；
2. 拿到 `*.pages.dev` 域名，线上全流程验证；
3. 进入 v0.2 体验增强（见 [docs/tasks.md](docs/tasks.md)）。

## 2026-10-27（第二次更新：修复白屏）

### 已完成

1. **新增 [PROGRESS.md](PROGRESS.md)**：确立本文件为唯一进展报告，每次更新同步维护。
2. **修复答题页白屏 bug**：
   - 现象：首页正常，点击"开始测评"跳转 `/survey/mbti` 后白屏，控制台报 `Cannot read properties of undefined (reading 'text')`；
   - 根因：Vite 中 JSON 文件以 ES Module 导入，实际数据挂在模块的 `.default` 属性上，而 [loader.ts](src/engine/loader.ts) 的 `pick()` 直接把模块命名空间当成了数据，导致 `questions` 为空壳对象；
   - 修复：`pick()` 解包 `.default`；
   - 验证：浏览器实测首页文案、MBTI 答题翻题、SDS 直达路由（`/survey/sds`，同时验证了 SPA 路由兜底）全部通过，新会话控制台无异常；`npm run build` 通过。
   - 经验教训：**`import.meta.glob` 加载 JSON 必须取 `.default`**——后续接 Cloudflare Workers 端或做 SSR 时要留意同类问题。

### 待办（下一步）

1. 推送 GitHub → 接入 Cloudflare Pages 上线（`xxx.pages.dev`）；
2. v0.2 体验增强（见 [docs/tasks.md](docs/tasks.md)）。

## 2026-10-27

### 已完成

1. **技术方案确认**：Vue3 + Vite + TypeScript 纯静态方案；托管定 Cloudflare Pages（先用 pages.dev 域名）；结果仅存客户端、预留统计接口。
2. **项目脚手架**：`package.json` / `vite.config.ts` / `tsconfig.json` / `index.html` / `.gitignore` / `public/_redirects`（SPA 路由兜底）。
3. **问卷引擎**（`src/engine/`）：
   - `types.ts`：量表包/题目/计分/结果类型定义；
   - `loader.ts`：`import.meta.glob` 自动注册量表包 + 计分引擎（支持 `letter-pairs` 与 `thresholds` 两种策略，scale 题作答值域 1..N 对齐标准量表）；
   - `analytics.ts`：`AnalyticsService` 接口层，当前为 localStorage 实现，日后可无痛切换 Cloudflare Workers + D1。
4. **页面**（`src/views/`）：首页量表列表、答题页（进度条、草稿自动保存、恢复未完成作答）、结果页（MBTI 维度倾向条形图 / SDS 总分判级）。
5. **首批量表包**：MBTI 93 题（公开流传版，16 型结果文案）、SDS 抑郁自评 20 题（含反向计分、危机干预提示）。
6. **文档**：`docs/PRD.md`、`docs/architecture.md`、`docs/tasks.md`、`docs/survey-package-spec.md`（开发者上传题库的规范）。

### 遇到的问题

| 问题 | 状态 | 说明 |
|---|---|---|
| npm 全局缓存目录 `F:\Program\NodeJsPath\node_cache` 无写权限 | ✅ 绕过 | 本次安装使用 `--cache %TEMP%\npm-cache`；建议执行 `npm config set cache "$env:LOCALAPPDATA\npm-cache"` 永久修复 |
| 点击量表后页面白屏 | ✅ 已修复 | 根因与修复见上方「第二次更新」 |
| Cloudflare 部署失败：`Invalid _redirects configuration ... Infinite loop` | ✅ 已修复 | 构建正常，部署阶段 wrangler 把 `public/_redirects` 当 Workers 路由规则解析，Pages 写法 `/* /index.html 200` 在 Workers 规则引擎中无限循环；SPA 兜底已由 wrangler.jsonc 的 `not_found_handling` 承担，删除该文件（提交 961b5d3） |

### 待办（下一步）

1. 本地完整走通 MBTI + SDS 全流程人工验证；
2. 推送 GitHub → 接入 Cloudflare Pages 上线（`xxx.pages.dev`）。→ **见上方「第三次更新」，GitHub 已推送完成**

### 里程碑总览

| 里程碑 | 状态 |
|---|---|
| v0.1 MVP（引擎 + 2 量表 + 本地跑通） | ✅ 完成（已浏览器验证） |
| v0.1 上线（GitHub + Cloudflare） | ✅ 完成（workers.dev 已启用，公网可访问） |
| v0.2 体验增强（分享图/历史页/深色模式） | ⬜ 未开始 |
| v0.3 量表扩充（BFI-44、SCL-90、自定义计分） | ⬜ 未开始 |
| v1.0 云端统计（Workers + D1，可选） | ⬜ 未开始 |
