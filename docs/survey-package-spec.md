# 量表包格式规范（v1）

> 你（开发者）上传新量表时，照本规范创建一个文件夹即可，引擎自动发现并上架。

## 目录结构

```
src/data/surveys/<量表id>/
├─ manifest.json    # 元信息
├─ questions.json   # 题目数组
├─ scoring.json     # 计分与判定规则
└─ results.json     # 结果文案（key = resultId）
```

`<量表id>` 使用小写字母/数字/连字符（如 `bfi44`、`scl90`）。

## manifest.json

```json
{
  "id": "sds",                  // 必须与文件夹名一致
  "name": "抑郁自评量表（SDS）",
  "description": "一句话介绍",
  "estimatedMinutes": 5,
  "disclaimer": "免责/科普说明（心理量表强烈建议填写）",
  "version": "1.0.0"
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

## 上架步骤

1. 在 `src/data/surveys/` 下新建文件夹并放入 4 个 JSON；
2. `npm run dev` 本地核对题目与计分；
3. 提交推送，Cloudflare Pages 自动部署上线。
