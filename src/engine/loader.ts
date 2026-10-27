import type {
  Question,
  ScoringConfig,
  SurveyPackage,
  SurveyResult,
} from './types'

/**
 * 量表包注册表：Vite 的 import.meta.glob 在构建期收集 surveys/ 下所有量表包。
 * 新增量表 = 新建文件夹放入 JSON，引擎自动发现，无需改代码。
 * 结果文案可放在量表包内（results.json），也可放在 families/<家族>/results.json 由同家族模板共享。
 */
const modules = import.meta.glob('/src/data/surveys/*/*.json', {
  eager: true,
}) as Record<string, unknown>

const familyResults = import.meta.glob('/src/data/families/*/results.json', {
  eager: true,
}) as Record<string, { default: SurveyPackage['results'] }>

function pick<T>(surveyId: string, file: string): T {
  // JSON 以 ES Module 导入，实际数据挂在 default 上
  const mod = modules[`/src/data/surveys/${surveyId}/${file}`] as
    | { default: T }
    | undefined
  if (!mod) throw new Error(`量表包 ${surveyId} 缺少 ${file}`)
  return mod.default
}

export function listSurveyIds(): string[] {
  const ids = new Set<string>()
  for (const path of Object.keys(modules)) {
    const m = path.match(/\/src\/data\/surveys\/([^/]+)\//)
    if (m) ids.add(m[1])
  }
  return [...ids]
}

export function getSurveyPackage(surveyId: string): SurveyPackage {
  const manifest = pick(surveyId, 'manifest.json')
  let results
  const local = modules[`/src/data/surveys/${surveyId}/results.json`] as
    | { default: SurveyPackage['results'] }
    | undefined
  if (local) {
    results = local.default
  } else if (manifest.family) {
    // 家族共享结果文案：从 families/<family>/results.json 读取
    const shared = familyResults[`/src/data/families/${manifest.family}/results.json`]
    if (!shared)
      throw new Error(`量表包 ${surveyId} 缺少 results.json，且家族 ${manifest.family} 无共享结果`)
    results = shared.default
  } else {
    throw new Error(`量表包 ${surveyId} 缺少 results.json`)
  }
  return {
    manifest,
    questions: pick(surveyId, 'questions.json'),
    scoring: pick(surveyId, 'scoring.json'),
    results,
  }
}

/** 通用刻度文案 */
const DEFAULT_SCALE_LABELS = ['非常不同意', '不太同意', '一般', '比较同意', '非常同意']

/** 生成 scale 题的候选选项（作答值 1..n） */
export function scaleOptions(q: Question): { value: number; label: string }[] {
  const n = q.scalePoints ?? 5
  const labels = q.scaleLabels ?? DEFAULT_SCALE_LABELS
  return Array.from({ length: n }, (_, i) => ({
    value: i + 1,
    label: labels[i] ?? labels[labels.length - 1],
  }))
}

/**
 * 计分引擎：按 scoring.json 的策略汇总作答。
 * scale 题：score[dim] += (reverse ? max - v : v) * weight
 * single 题：累加选中选项的显式 score
 */
export function computeResult(
  pkg: SurveyPackage,
  answers: Record<string, number>,
): SurveyResult {
  const scores: Record<string, number> = {}

  const add = (key: string, v: number) => {
    scores[key] = (scores[key] ?? 0) + v
  }

  for (const q of pkg.questions) {
    const answer = answers[q.id]
    if (answer === undefined) continue
    if (q.type === 'scale') {
      // 作答值域为 1..scalePoints（与标准量表计分一致）
      const max = (q.scalePoints ?? 5) + 1
      const v = q.reverse ? max - answer : answer
      add(q.dimension ?? 'total', v * (q.weight ?? 1))
    } else {
      const opt = q.options?.[answer]
      if (opt?.score) {
        for (const [k, v] of Object.entries(opt.score)) add(k, v)
      }
    }
  }

  const cfg = pkg.scoring
  let resultId: string
  let percentages: Record<string, number> | undefined

  if (cfg.strategy === 'letter-pairs') {
    const letters: string[] = []
    percentages = {}
    for (const [a, b] of cfg.pairs ?? []) {
      const sa = scores[a] ?? 0
      const sb = scores[b] ?? 0
      const total = sa + sb || 1
      percentages[a] = Math.round((sa / total) * 100)
      percentages[b] = Math.round((sb / total) * 100)
      letters.push(sa >= sb ? a : b)
    }
    resultId = letters.join('')
  } else {
    const key = cfg.key ?? 'total'
    const total = scores[key] ?? 0
    const band = (cfg.bands ?? []).find((b) => total >= b.min && total <= b.max)
    if (!band) throw new Error(`量表 ${pkg.manifest.id} 的计分区间未覆盖得分 ${total}`)
    resultId = band.resultId
  }

  return {
    surveyId: pkg.manifest.id,
    resultId,
    scores,
    percentages,
    answeredAt: Date.now(),
  }
}
