/**
 * MBTI 简版生成器：从完整版（93 题）题库按维度等距抽题，生成 72/48/28 题模板。
 * 各模板共享 families/mbti/results.json 结果文案（家族机制）。
 * 用法：node scripts/generate-mbti-variants.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pairs = [
  ['E', 'I'],
  ['S', 'N'],
  ['T', 'F'],
  ['J', 'P'],
]

const full = JSON.parse(
  readFileSync(join(root, 'src/data/surveys/mbti/questions.json'), 'utf8'),
)

/** 等距抽取 k 个元素（保持原顺序） */
function pickEvenly(list, k) {
  if (k >= list.length) return [...list]
  const out = []
  for (let i = 0; i < k; i++) {
    out.push(list[Math.round((i * (list.length - 1)) / (k - 1 || 1))])
  }
  return out
}

function bankForPair([a, b]) {
  // 每道题的两个选项分别计两侧字母，只要出现该字母即属于该维度的题库
  return {
    [a]: full.filter((q) => q.options?.some((o) => o.score?.[a])),
    [b]: full.filter((q) => q.options?.some((o) => o.score?.[b])),
  }
}

/** 每对抽 perPair 题，两侧尽量均衡（n 为偶数各半，奇数多的一侧给首字母），按原题顺序交错排列 */
function buildQuestions(perPair) {
  const chosen = []
  for (const pair of pairs) {
    const bank = bankForPair(pair)
    for (const letter of pair) {
      if (bank[letter].length < Math.ceil(perPair / 2)) {
        throw new Error(`维度 ${letter} 题库只有 ${bank[letter].length} 题，不足以抽 ${Math.ceil(perPair / 2)} 题`)
      }
    }
    const halfA = Math.ceil(perPair / 2)
    const halfB = perPair - halfA
    const picked = [
      ...pickEvenly(bank[pair[0]], halfA).map((q) => ({ q, letter: pair[0] })),
      ...pickEvenly(bank[pair[1]], halfB).map((q) => ({ q, letter: pair[1] })),
    ].sort((x, y) => full.indexOf(x.q) - full.indexOf(y.q))
    chosen.push(...picked)
  }
  return chosen.map(({ q }, i) => ({ ...q, id: `q${i + 1}` }))
}

const VARIANTS = [
  { id: 'mbti-72', total: 72, variant: '标准版 72 题', minutes: 15 },
  { id: 'mbti-48', total: 48, variant: '简版 48 题', minutes: 10 },
  { id: 'mbti-28', total: 28, variant: '迷你版 28 题', minutes: 6 },
]

for (const v of VARIANTS) {
  const perPair = v.total / pairs.length
  if (!Number.isInteger(perPair)) throw new Error(`题量 ${v.total} 无法被 4 对维度整除`)
  const questions = buildQuestions(perPair)

  const dir = join(root, 'src/data/surveys', v.id)
  mkdirSync(dir, { recursive: true })

  writeFileSync(
    join(dir, 'questions.json'),
    JSON.stringify(questions, null, 2) + '\n',
  )
  writeFileSync(
    join(dir, 'scoring.json'),
    JSON.stringify({ strategy: 'letter-pairs', pairs }, null, 2) + '\n',
  )
  writeFileSync(
    join(dir, 'manifest.json'),
    JSON.stringify(
      {
        id: v.id,
        name: `MBTI 人格类型测评（${v.variant.split(' ')[0]}）`,
        description: `从完整版 93 题题库按维度等距抽取的 ${v.total} 题快速版本，四维度（E-I、S-N、T-F、J-P）均衡覆盖，判定结果与完整版一致。`,
        estimatedMinutes: v.minutes,
        disclaimer:
          '简版题为完整版等距抽样，精度略低；仅供娱乐与自我探索，不构成专业心理评估。结果描述为类型学概括，请勿以此定义自己或他人。',
        version: '1.0.0',
        category: 'mbti',
        family: 'mbti',
        variant: v.variant,
      },
      null,
      2,
    ) + '\n',
  )
  console.log(`✓ ${v.id}：${questions.length} 题`)
}
