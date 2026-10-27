# Survey Platform

一个配置驱动的多量表在线测评平台。类似 MBTI、大五人格这类「答题 → 计分 → 出结果」的心理测评/趣味测试，都可以通过**放置一组 JSON 量表包**的方式接入，无需修改任何引擎代码。

**线上地址**：<https://greensail.dpdns.org>

## 特性

- **配置驱动引擎**：计分策略（字母配对 / 总分判级 / 多维度剖面）全部由量表包 JSON 声明，新增测评零代码
- **量表家族**：同一测评的多套模板（如完整版/简版）可共享一份结果文案
- **学科分类**：首页按分类 Tab 组织（人格测评 / 心理学 / 趣味测试）
- **答题体验**：自动下一题（速度可自定义）、进度条、草稿自动保存
- **结果呈现**：维度条形图 / 得分判级、可保存的结果分享图（canvas 导出 PNG）
- **数据隐私**：所有作答与结果仅存于浏览器本地（localStorage），服务器不收集任何数据
- **深色模式**：跟随系统 / 手动切换
- **题库校验**：内置格式校验脚本，坏题库会在构建期被拦截，不会带上生产环境

## 内含量表

| 量表 | 类型 | 题源 |
|---|---|---|
| MBTI 人格类型测评（93 题） | 类型学（letter-pairs） | 公开流传版本整理 |
| 大五人格测评（IPIP-50） | 特质剖面（dimensions） | [IPIP](https://ipip.ori.org)，公有领域 |
| 抑郁自评量表（SDS） | 临床筛查（thresholds） | Zung (1965)，公有领域 |

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
- 部署于 Cloudflare Pages/Workers（全球 CDN + 自动 HTTPS）

## 免责声明

站内心理类量表仅供自我探索与参考，不构成任何医学诊断或专业心理评估。如有心理健康困扰，请寻求专业帮助。

## License

[MIT](LICENSE)
