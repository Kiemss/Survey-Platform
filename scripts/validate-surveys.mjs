/**
 * 量表包格式校验脚本
 * 用法：node scripts/validate-surveys.mjs
 * 在 CI / prebuild 中自动执行：发现任何错误则退出码 1，阻止部署。
 * 规则详见 docs/survey-package-spec.md。
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const surveysDir = join(root, 'src', 'data', 'surveys')
const familiesDir = join(root, 'src', 'data', 'families')
const categoriesPath = join(root, 'src', 'data', 'categories.ts')

const errors = []
let surveyCount = 0

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (e) {
    errors.push(`${path}: JSON 解析失败（${e.message}）`)
    return null
  }
}

// 分类 id 注册表：从 categories.ts 粗提取 CATEGORIES 数组中的 id
function loadCategoryIds() {
  if (!existsSync(categoriesPath)) {
    errors.push(`缺少 ${categoriesPath}`)
    return new Set()
  }
  const text = readFileSync(categoriesPath, 'utf8')
  const ids = [...text.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1])
  return new Set(ids)
}

function validateQuestions(surveyId, questions, scoring) {
  const seenIds = new Set()
  const scoreKeys = new Set()

  questions.forEach((q, i) => {
    const at = `${surveyId}/questions.json 第 ${i + 1} 题（${q.id ?? '?'}）`
    if (!q.id) errors.push(`${at}: 缺少 id`)
    else if (seenIds.has(q.id)) errors.push(`${at}: 题目 id 重复`)
    else seenIds.add(q.id)

    if (!q.text) errors.push(`${at}: 缺少题干 text`)
    if (q.type !== 'single' && q.type !== 'scale') {
      errors.push(`${at}: type 必须为 "single" 或 "scale"，当前 "${q.type}"`)
      return
    }

    if (q.type === 'single') {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`${at}: single 题必须有至少 2 个 options`)
      } else {
        for (const [j, opt] of q.options.entries()) {
          if (!opt.label) errors.push(`${at} 第 ${j + 1} 个选项: 缺少 label`)
          if (!opt.score || typeof opt.score !== 'object') {
            errors.push(`${at} 第 ${j + 1} 个选项: 缺少 score 计分对象`)
          } else {
            for (const k of Object.keys(opt.score)) scoreKeys.add(k)
          }
        }
      }
    } else {
      const points = q.scalePoints ?? 5
      if (!Number.isInteger(points) || points < 2) {
        errors.push(`${at}: scalePoints 必须为 ≥2 的整数`)
      }
      scoreKeys.add(q.dimension ?? 'total')
    }
  })

  return { seenIds, scoreKeys }
}

function validateScoring(surveyId, scoring, resultsKeys) {
  if (scoring.strategy === 'letter-pairs') {
    if (!Array.isArray(scoring.pairs) || scoring.pairs.length === 0) {
      errors.push(`${surveyId}/scoring.json: letter-pairs 策略缺少 pairs 配对数组`)
      return new Set()
    }
    const keys = new Set()
    for (const pair of scoring.pairs) {
      if (!Array.isArray(pair) || pair.length !== 2) {
        errors.push(`${surveyId}/scoring.json: pairs 每项必须是 [a, b] 二元组`)
        continue
      }
      keys.add(pair[0])
      keys.add(pair[1])
    }
    // letter-pairs 结果 id 是各对取高者的字母组合，要求文案覆盖全部 2^n 组合
    const combos = 2 ** keys.size
    const missing = []
    // pairs[i] = [a, b]，bit=0 取 a，bit=1 取 b
    for (let mask = 0; mask < combos; mask++) {
      const id = scoring.pairs
        .map(([a, b], i) => ((mask >> i) & 1 ? b : a))
        .join('')
      if (!resultsKeys.has(id)) missing.push(id)
    }
    if (missing.length) {
      errors.push(
        `${surveyId}: 结果文案缺少 ${missing.length} 个组合的 resultId：${missing.join(', ')}`,
      )
    }
    return keys
  }

  if (scoring.strategy === 'thresholds') {
    const key = scoring.key ?? 'total'
    const bands = scoring.bands ?? []
    if (bands.length === 0) {
      errors.push(`${surveyId}/scoring.json: thresholds 策略缺少 bands`)
      return new Set([key])
    }
    let cursor = 0
    for (const [i, band] of bands.entries()) {
      if (band.min !== cursor) {
        errors.push(
          `${surveyId}/scoring.json: 第 ${i + 1} 个 band 的 min(${band.min}) 未与上一个 max(${cursor - 1}) 连续衔接`,
        )
      }
      if (band.max < band.min) {
        errors.push(`${surveyId}/scoring.json: 第 ${i + 1} 个 band 的 max 小于 min`)
      }
      if (!resultsKeys.has(band.resultId)) {
        errors.push(`${surveyId}/scoring.json: band resultId "${band.resultId}" 没有对应结果文案`)
      }
      cursor = band.max + 1
    }
    if (cursor <= bands[bands.length - 1].max) {
      // bands 已检查衔接，此处仅提示上界
    }
    return new Set([key])
  }

  errors.push(`${surveyId}/scoring.json: 未知 strategy "${scoring.strategy}"`)
  return new Set()
}

function validateSurvey(dirName, categoryIds, familyResultKeys) {
  surveyCount++
  const dir = join(surveysDir, dirName)
  const manifest = readJson(join(dir, 'manifest.json'))
  const questions = readJson(join(dir, 'questions.json'))
  const scoring = readJson(join(dir, 'scoring.json'))
  const resultsPath = join(dir, 'results.json')
  const results = existsSync(resultsPath) ? readJson(resultsPath) : null

  // manifest
  if (!manifest) return
  if (manifest.id !== dirName) {
    errors.push(`${dirName}/manifest.json: id("${manifest.id}") 必须与文件夹名一致`)
  }
  for (const field of ['id', 'name', 'description', 'estimatedMinutes', 'version']) {
    if (manifest[field] === undefined) errors.push(`${dirName}/manifest.json: 缺少必填字段 ${field}`)
  }
  if (manifest.category && !categoryIds.has(manifest.category)) {
    errors.push(`${dirName}/manifest.json: category "${manifest.category}" 未在 categories.ts 注册`)
  }

  // 家族结果解析
  let resultKeys = new Set()
  if (results) {
    resultKeys = new Set(Object.keys(results))
    for (const [k, v] of Object.entries(results)) {
      if (!v.title || !v.description) {
        errors.push(`${dirName}/results.json: "${k}" 缺少 title 或 description`)
      }
    }
  } else if (manifest.family) {
    const fk = familyResultKeys.get(manifest.family)
    if (!fk) {
      errors.push(
        `${dirName}/manifest.json: family "${manifest.family}" 在 families/ 下没有 results.json`,
      )
    } else {
      resultKeys = fk
    }
  } else {
    errors.push(`${dirName}: 缺少 results.json，且 manifest 未声明 family`)
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    errors.push(`${dirName}/questions.json: 必须为非空数组`)
    return
  }
  if (!scoring) return

  const { scoreKeys } = validateQuestions(dirName, questions, scoring)
  const scoringKeys = validateScoring(dirName, scoring, resultKeys)

  // 计分键对齐：题目产生的键必须都被计分策略消费（避免拼错维度名）
  for (const k of scoreKeys) {
    if (!scoringKeys.has(k)) {
      errors.push(
        `${dirName}: 题目计分键 "${k}" 未被 scoring.json 的策略使用（${scoring.strategy === 'letter-pairs' ? 'pairs' : `key: ${scoring.key ?? 'total'}`}），可能是维度名拼写错误`,
      )
    }
  }
}

function loadFamilyResultKeys() {
  const map = new Map()
  if (!existsSync(familiesDir)) return map
  for (const family of readdirSync(familiesDir)) {
    const p = join(familiesDir, family, 'results.json')
    if (existsSync(p)) {
      const data = readJson(p)
      if (data) map.set(family, new Set(Object.keys(data)))
    }
  }
  return map
}

// ---- 主流程 ----
const categoryIds = loadCategoryIds()
const familyResultKeys = loadFamilyResultKeys()

if (!existsSync(surveysDir)) {
  errors.push(`缺少量表目录 ${surveysDir}`)
} else {
  for (const dirName of readdirSync(surveysDir)) {
    validateSurvey(dirName, categoryIds, familyResultKeys)
  }
}

if (errors.length) {
  console.error(`\n✘ 量表包校验失败，共 ${errors.length} 个错误：\n`)
  for (const e of errors) console.error(`  - ${e}`)
  console.error('')
  process.exit(1)
}

console.log(`✓ 量表包校验通过（${surveyCount} 个量表，${categoryIds.size} 个分类，${familyResultKeys.size} 个家族）`)
