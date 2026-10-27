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

### 已完成（`ebb796d`，v0.3 第二批）

1. **MBTI 独立分类 Tab**：新增「🎯 MBTI 人格类型」分类（置于首位且为默认 Tab），心理学 Tab 定位为专业量表（SDS 等临床/学术测评）。
2. **四种题量模板**（家族机制首次实战）：完整版 93 / 标准版 72 / 简版 48 / 迷你版 28；三个简版由 [generate-mbti-variants.mjs](scripts/generate-mbti-variants.mjs) 从完整版题库按维度等距抽题生成（每对维度两侧均衡），共享 families/mbti/results.json 文案，16 型结果零重复维护。
3. **卡片 UI 再收敛**：右上角版本徽章删除，卡片 = 标题/描述/底部（左题量右开始测试）。
4. 浏览器实测 5/5 通过（Tab 计数/卡片结构/28 题答题流/家族结果文案/分类隔离）。

### 待办（v0.3 剩余）

1. ~~大五人格~~ ✅ 已上线（IPIP-50，见下）
2. 趣味测试首秀：1-2 个搞笑测试（fun 分类）

### 已完成（v0.3 第三批：人格测评 Tab + 大五人格 IPIP-50）

1. **分类标准化**：原「MBTI 人格类型」Tab 更名为「🧩 人格测评」，定位为所有非临床人格测评（类型学+特质向）；「心理学」保留临床/学术量表（SDS）。
2. **MBTI 简版撤架**：72/48/28 题模板及生成脚本删除，仅保留 93 题完整版（用户决策：网络流传 144/200 题版本无可靠题源，不追）。
3. **大五人格 IPIP-50 上线**：题目取自 IPIP 官网公版 50 题（Goldberg 1992，public domain），5 维度×10 题，15 道反向计分题按官方计分键标注；新增引擎 `dimensions` 策略（多维度归一化剖面、结果取最高维度）；结果页新增「维度剖面」五维条形图，分享图同步适配。
4. 校验脚本支持 dimensions 策略校验（维度文案覆盖检查）；量表包校验通过（3 量表 / 3 分类 / 1 家族）。
5. 排障记录：dev 服务器曾报 `Cannot read properties of null (reading 'component')`，经生产预览隔离验证为旧会话 HMR 残留日志，非代码问题（生产构建与 4173 预览均正常）。
6. Cloudflare Git 集成已由用户修复，部署回归「推送 GitHub → CF 自动构建」通道。

### 已完成（v0.3 第四批：开源化 + 大五家族扩容）

1. **开源化**：README.md（特性/量表表/新增测评指南/MIT）、LICENSE（MIT）；页脚极简化（© 版权 · 免责声明 · GitHub 开源链接）。
2. **设计规范文档**：[docs/design-system.md](docs/design-system.md)——色彩变量表/字号档位/4px 间距基数/圆角阴影/组件规范/页面骨架/变更流程，作为后续视觉打磨的唯一规范。
3. **大五家族扩容（bigfive 家族）**：IPIP-NEO 120 题（25 分钟）与 300 题（60 分钟）上线，题目与反向计分键来自 IPIP 官网（30FacetNEO-PI-RItems.htm / newNEOFacetsKey.htm，经官方 300-120 对照表交叉验证），三版本（50/120/300）共享 families/bigfive/results.json 文案。校验通过（5 量表 / 2 家族）。
4. 部署验证：`032554c` 推送后 CF 自动构建成功（线上指纹 index-C-xJBf3B），Git 集成通道确认恢复。

### 已完成（v0.3 第五批：首页交互改版）

1. **两级分类撤销**（用户决策）：回到一级平铺 Tab（全部 + 各分类），categories.ts 保留 group 字段供日后恢复。
2. **翻页跳转改为确认式**：页码输入 + 「跳转」按钮（或回车）才切换，替代原先的 change 即跳。
3. **量表详情页**（/about/:id，新增 Detail.vue）：首页卡片整体点击进详情（简介/题数/时长/测评须知/开始按钮）；「开始测试」按钮仍直达答题（click.stop 防冒泡）。借鉴自竞品 moodaxis 的信任前置模式。
4. 竞品走查完成（pixues/moodaxis/anxietyaidtools/psychologytest.net），可借鉴清单：答题卡导航、结果页推荐量表、卡片时长/热度。

### 已完成（v0.3 第六批：答题收尾体验）

1. **设置新增「自动提交」**（默认开启）：最后一题答完且全部作答完毕后自动提交出结果；关闭则停留在提交按钮。
2. **提交前审查**：存在未答题时弹窗提示未答数量，可一键跳至第一道未答题补答或坚持提交。
3. **Tab 二次回退**（用户决策）：一级 Tab 改为 6 个综合大类（人格测评/情绪与健康/学生专区/认知能力/关系与家庭/趣味测试），24 个明细分类仅作归类用，不外显。

### 已完成（v0.3 第七批：公版量表第一批 7 个）

1. **新建 7 个公版量表**（情绪与健康 Tab，全部 thresholds 策略）：PHQ-9（抑郁筛查）、GAD-7（广泛性焦虑）、ASRS v1.1（成人ADHD筛查）、AQ-50（自闭谱系商数）、AIS（阿森斯失眠）、PSTR（心理压力）、EAT-26（饮食态度）。0 基计分量表用 single 显式 score 实现（引擎 scale 题按 1..n 计分）；AIS 保留原版 0/2/4/6 选项结构并补 16-48 重度档；PSTR 高档上限延展至 80 以覆盖满分；AQ-50 计分键对照官方 PDF 核实。
2. 新增分类：adhd / autism / sleep / stress。
3. 答题交互：答题卡展开期间始终显示「提交」按钮；跳题后答题卡保持展开；草稿恢复增加蓝色提示条 + 「重新开始」清除入口。
4. 校验通过（12 量表 / 28 分类 / 2 家族）。ECR（依恋）因需要引擎新增 quadrant 策略，推迟至第二批。

### 待办（v0.3 剩余）

1. 趣味测试首秀：1-2 个搞笑测试（fun 分类）
2. 版面优化（按 design-system.md）：整体设计系统打磨、答题页视觉、结果页升级（雷达图等）

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
