# 量表包格式规范（v2）

> 你（开发者）上传新量表时，照本规范创建一个文件夹即可，引擎自动发现并上架。

## 目录结构

```
src/data/
├─ categories.ts             # 一级学科分类注册表（首页 Tab）
├─ surveys/<量表id>/         # 量表包（一个文件夹 = 一个可作答的模板）
│  ├─ manifest.json          # 元信息
│  ├─ questions.json         # 题目数组
│  ├─ scoring.json           # 计分与判定规则
│  └─ results.json           # 结果文案（可选，见「量表家族」）
└─ families/<家族id>/        # 家族共享结果文案
   └─ results.json
```

`<量表id>` 使用小写字母/数字/连字符（如 `bfi44`、`scl90`）。

## 学科分类

`src/data/categories.ts` 是分类注册表（首页 Tab 按数组顺序渲染）。上传新量表时在 manifest 里引用已有分类 id（如 `"category": "psychology"`）；要开新学科（如「认知科学」）先在 categories.ts 追加一项。缺省归入 `psychology`。

## 量表家族（多模板共享结果文案）

同一量表有多套题库模板（如 MBTI 的 93 题完整版 / 48 题简版）时：

1. 每个模板一个量表包文件夹（如 `mbti`、`mbti-short`），manifest 里都写 `"family": "mbti"` 和各自的 `"variant"`（如「完整版 93 题」「简版 48 题」）；
2. 结果文案**只放一份**在 `src/data/families/mbti/results.json`，各量表包内省略 results.json；
3. 引擎加载顺序：量表包内 results.json 优先，其次按 manifest.family 读家族共享文案。

适用判据：**结果类型完全同构**（同 resultId 集合）才共享；SCL-90 与 SDS 虽然都是判级型但 resultId 语义不同，各自持有 results.json。

## manifest.json

```json
{
  "id": "sds",                  // 必须与文件夹名一致
  "name": "抑郁自评量表（SDS）",
  "description": "一句话介绍",
  "estimatedMinutes": 5,
  "disclaimer": "免责/科普说明（心理量表强烈建议填写）",
  "version": "1.0.0",
  "category": "psychology",     // 学科分类 id，缺省 psychology
  "family": "mbti",             // 可选：家族 id（共享结果文案时必填）
  "variant": "完整版 93 题"      // 可选：家族内模板名（建议填写）
}
```

## questions.json

题型二选一：

**single（单选/强迫选择）**——每个选项显式声明计分：

```json
{
  "id": "q1",
  "type": "single",
  "text": "在聚会上你通常……",
  "options": [
    { "label": "主动交谈", "score": { "E": 1 } },
    { "label": "安静观察", "score": { "I": 1 } }
  ]
}
```

**scale（李克特量表）**——靠字段声明计分：

```json
{
  "id": "s1",
  "type": "scale",
  "text": "我觉得闷闷不乐",
  "scalePoints": 4,                       // 缺省 5
  "scaleLabels": ["没有", "少部分", "相当多", "全部"],  // 缺省用通用 5 级文案
  "dimension": "焦虑",                     // 缺省计到 "total"
  "weight": 1,                            // 缺省 1
  "reverse": false                        // true = 反向计分
}
```

注意：scale 题作答值域为 **1..scalePoints**（与纸质量表一致，便于直接套用标准截断值）。反向计分自动换算为 `(scalePoints + 1) - 作答值`。

## scoring.json

**letter-pairs（MBTI 型）**：

```json
{ "strategy": "letter-pairs", "pairs": [["E","I"], ["S","N"], ["T","F"], ["J","P"]] }
```

每对维度取得分高者，按顺序拼接为 resultId（如 `INTJ`），并自动生成维度百分比用于条形图。

**thresholds（判级型）**：

```json
{
  "strategy": "thresholds",
  "key": "total",
  "bands": [
    { "min": 0,  "max": 52, "resultId": "normal" },
    { "min": 53, "max": 62, "resultId": "mild" }
  ]
}
```

`bands` 必须从 0 连续覆盖到量表满分，自上而下匹配。`key` 缺省 `total`。

## results.json

key 必须覆盖所有可能的 resultId：

```json
{
  "normal": {
    "title": "结果标题",
    "subtitle": "可选副标题",
    "description": "结果解读",
    "suggestions": ["建议1", "建议2"]
  }
}
```

放置位置二选一：量表包内（独立量表）或 `families/<family>/results.json`（家族共享，见上文）。

## 上架步骤

1. 需要新学科分类时，先在 `src/data/categories.ts` 追加；
2. 在 `src/data/surveys/` 下新建文件夹并放入 JSON（独立量表 4 个；家族模板 3 个，results 放家族目录）；
3. 运行 `npm run validate` 自检（manifest 字段、题目/计分键对齐、结果文案覆盖等 20 余条规则，中文报错定位到题）；
4. `npm run dev` 本地核对题目与计分；
5. 提交推送——**部署前 Cloudflare 会自动再跑一遍校验**（已挂 prebuild），坏题库会直接构建失败上不了线。
