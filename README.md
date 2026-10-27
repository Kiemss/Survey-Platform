# 绿帆心理测评 (Green Sail)

一个配置驱动的多量表在线测评平台。类似 MBTI、大五人格这类「答题 → 计分 → 出结果」的心理测评/趣味测试，都可以通过**放置一组 JSON 量表包**的方式接入，无需修改任何引擎代码。

**线上地址**：<https://greensail.dpdns.org>

## 特性

- **配置驱动引擎**：四种计分策略（字母配对 letter-pairs / 总分判级 thresholds / 多维度剖面 dimensions / 双维矩阵 quadrant）全部由量表包 JSON 声明，新增测评零代码
- **量表家族**：同一测评的多套模板（如完整版/简版）可共享一份结果文案
- **两级分类**：首页 Tab 按大类组织（人格测评 / 情绪与健康 / 学生专区 / 认知能力 / 关系与家庭 / 趣味测试），支持子类归类与全文搜索、翻页
- **答题体验**：自动下一题（速度可自定义）、自动提交（可选）、答题卡导航、断点续答（草稿自动保存）、未答审查提示、进度条
- **结果呈现**：分数表盘（渐变色带指针）、维度条形图 / 剖面图、四型矩阵可视化、历史记录回看
- **数据隐私**：所有作答与结果仅存于浏览器本地（localStorage），服务器不收集任何数据
- **深色模式**：跟随系统 / 手动切换
- **题库校验**：内置格式校验脚本，坏题库会在构建期被拦截，不会带上生产环境

## 内含量表（58 个）

涵盖六大类：人格测评（MBTI、大五 IPIP、贝姆性别角色 BSRI）、情绪与健康（SDS、PHQ-9、GAD-7、DASS-42、SAS、STAI、PSQI 等）、学生专区（MSSMHS、UPI、KADS-11 等）、认知与情商、关系与家庭（ECR、爱的五种语言等）、趣味测试（拖延症 PFS、手机依赖 SAS-SV 等学术题源轻量测评）。

题源分为三类，均已在各测评页声明：

1. **官方公开渠道**（IPIP 系列、PHQ-9、GAD-7、ASRS 等）：题目与计分键逐题核对
2. **公开授权的知名量表**：按通行中文版整理
3. **网络流传版本**（MBTI 类、部分国内量表）：取最通行版本，注明非官方

## 快速开始

```bash
npm install
npm run dev        # 开发（http://localhost:5173）
npm run validate   # 校验全部量表包格式
npm run build      # 生产构建（构建前自动跑校验）
```

## 如何新增一个测评

创建 `src/data/surveys/<你的量表id>/` 目录，放入四个 JSON：

```
src/data/surveys/my-survey/
├─ manifest.json    # 名称、简介、免责声明、分类
├─ questions.json   # 题目（single 单选 / scale 刻度，支持反向计分）
├─ scoring.json     # 计分策略与结果判定规则
└─ results.json     # 各结果 id 对应的文案
```

运行 `npm run validate` 自检，通过后重启即可在首页看到新量表。完整字段说明见 [docs/survey-package-spec.md](docs/survey-package-spec.md)。

## 技术栈与部署

- Vue 3 + TypeScript + Vite，无后端（纯静态 SPA）
- 部署于 Cloudflare Workers（全球 CDN + 自动 HTTPS）

## 免责声明

站内心理类量表仅供自我探索与参考，不构成任何医学诊断或专业心理评估。详见[免责声明](https://greensail.dpdns.org/disclaimer)与[隐私政策](https://greensail.dpdns.org/privacy)。如有心理健康困扰，请寻求专业帮助。

## License

[MIT](LICENSE)
