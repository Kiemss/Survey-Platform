/**
 * 量表包核心类型定义
 * 一个"量表包" = surveys/<id>/ 下的 manifest.json + questions.json + scoring.json + results.json
 * 详见 docs/survey-package-spec.md
 */

export interface SurveyManifest {
  id: string
  name: string
  description: string
  /** 预计用时（分钟） */
  estimatedMinutes: number
  /** 结果页展示的免责/科普说明，尤其心理类量表需要 */
  disclaimer?: string
  version: string
  /** 一级学科分类 id，对应 categories.ts 注册表；缺省归入 psychology */
  category?: string
  /**
   * 量表家族 id：同家族的多套模板共享结果文案（families/<family>/results.json）。
   * 设置 family 后量表包内可省略 results.json
   */
  family?: string
  /** 家族内的模板名，如「完整版 93 题」，家族共享结果时建议填写 */
  variant?: string
}

export type QuestionType = 'single' | 'scale'

export interface QuestionOption {
  label: string
  /** 该选项对各维度/计分键的贡献。single 题型必填 */
  score?: Record<string, number>
}

export interface Question {
  id: string
  text: string
  type: QuestionType
  /** single 题型的选项（带显式计分） */
  options?: QuestionOption[]
  /** scale 题型的计分维度键；缺省计到 "total" */
  dimension?: string
  /** scale 题型的维度权重，默认 1 */
  weight?: number
  /** scale 题型是否反向计分 */
  reverse?: boolean
  /** scale 题型的刻度数，默认 5 */
  scalePoints?: number
  /** scale 题型自定义刻度文案（从低到高），缺省用通用文案 */
  scaleLabels?: string[]
  /** 不计分题（如量表干扰题）：正常作答与展示，但不参与任何维度汇总 */
  unscored?: boolean
}

/** scoring.json：计分与结果判定规则 */
export interface ScoringConfig {
  strategy: 'letter-pairs' | 'thresholds' | 'dimensions' | 'quadrant'
  /**
   * letter-pairs：维度配对，如 [["E","I"],["S","N"]]。
   * 每对取得分高者为结果字母，按顺序拼接成结果 id（如 "INTJ"）
   */
  pairs?: [string, string][]
  /**
   * thresholds：对某个计分键按区间判级。
   * key 缺省为 "total"；bands 需覆盖 [0, +∞)，自上而下匹配
   */
  key?: string
  bands?: { min: number; max: number; resultId: string }[]
  /**
   * dimensions：多维度剖面（如大五人格）。
   * 每个维度归一化为百分比，结果 id 取得分最高的维度键；
   * 结果文案需覆盖全部维度 id
   */
  dimensions?: { id: string; name: string }[]

  /**
   * quadrant：两个独立维度构成四象限（如依恋类型的焦虑×回避）。
   * 每个维度按理论满分归一化，与 cutoff 比较；高/低组合查 map 得 resultId。
   * map 键为「维度1首字母大小写 + 维度2首字母」如 "aA"（低焦虑高回避）
   */
  quadrant?: {
    dimensions: { id: string; name: string; cutoff: number }[]
    map: Record<string, string>
  }
}

/** results.json：结果条目。key 为 resultId */
export type ResultMap = Record<
  string,
  {
    title: string
    subtitle?: string
    description: string
    suggestions?: string[]
  }
>

/** 引擎内组装完成的量表包 */
export interface SurveyPackage {
  manifest: SurveyManifest
  questions: Question[]
  scoring: ScoringConfig
  results: ResultMap
}

/** 计分产出 */
export interface SurveyResult {
  surveyId: string
  /** 结果 id（letter-pairs 拼接串或 thresholds 的 resultId） */
  resultId: string
  /** 各计分键原始得分 */
  scores: Record<string, number>
  /** letter-pairs 时各字母的归一化百分比（0-100），用于画条形图 */
  percentages?: Record<string, number>
  answeredAt: number
}
