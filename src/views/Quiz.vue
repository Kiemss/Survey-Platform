<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { computeResult, getSurveyPackage, scaleOptions } from '../engine/loader'
import { analytics } from '../engine/analytics'
import { settings } from '../engine/settings'
import type { SurveyResult } from '../engine/types'

const route = useRoute()
const router = useRouter()
const surveyId = route.params.id as string

const pkg = getSurveyPackage(surveyId)
const questions = pkg.questions

// 恢复未完成的作答（同一次未提交的进度）
const DRAFT_KEY = `survey-draft-${surveyId}`
const answers = reactive<Record<string, number>>(
  JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null') ?? {},
)

// 是否恢复了上次进度（给出明确提示 + 重新开始入口，避免「凭空高亮」的困惑）
const resumed = ref(Object.keys(answers).length > 0)

const index = ref(0)
const current = computed(() => questions[index.value])
const currentAnswer = computed(() => answers[current.value.id])
const progress = computed(() => Math.round(((index.value + 1) / questions.length) * 100))
const answeredCount = computed(() => questions.filter((q) => answers[q.id] !== undefined).length)
const allAnswered = computed(() => answeredCount.value === questions.length)

// 自动跳转计时器（设置项来自全局 store，见顶栏 ⚙）
let autoTimer: number | undefined

const submitting = ref(false)

// 答题卡导航面板（>10 题的量表显示）
const sheetOpen = ref(false)

function goTo(i: number) {
  window.clearTimeout(autoTimer)
  index.value = i
}

const unansweredCount = computed(() => questions.length - answeredCount.value)

/** 重新开始：清除草稿并回到第 1 题 */
function restart() {
  window.clearTimeout(autoTimer)
  for (const k of Object.keys(answers)) delete answers[k]
  localStorage.removeItem(DRAFT_KEY)
  resumed.value = false
  index.value = 0
}

function choose(qid: string, value: number) {
  answers[qid] = value
  localStorage.setItem(DRAFT_KEY, JSON.stringify(answers))

  // 自动提交：最后一题答完且全部作答完毕（开启设置时）
  if (
    settings.autoSubmit &&
    settings.autoNext &&
    index.value === questions.length - 1 &&
    allAnswered.value
  ) {
    window.clearTimeout(autoTimer)
    autoTimer = window.setTimeout(submit, settings.autoNextDelay + 150)
    return
  }

  // 自动下一题：非最后一题时延迟跳转，给选中态留出视觉反馈
  if (settings.autoNext && index.value < questions.length - 1) {
    window.clearTimeout(autoTimer)
    autoTimer = window.setTimeout(next, settings.autoNextDelay)
  }
}

function next() {
  window.clearTimeout(autoTimer)
  if (index.value < questions.length - 1) index.value++
}

function prev() {
  window.clearTimeout(autoTimer)
  if (index.value > 0) index.value--
}

onUnmounted(() => window.clearTimeout(autoTimer))

/** 提交前审查：存在未答题时弹窗提示，可选择跳到第一道未答题 */
async function submit() {
  const missing = questions.length - answeredCount.value
  if (missing > 0) {
    const firstUnanswered = questions.findIndex((q) => answers[q.id] === undefined)
    const goFix = window.confirm(
      `还有 ${missing} 道题未作答，提交可能影响结果准确性。\n\n点击「确定」前往第 ${firstUnanswered + 1} 题补答；点击「取消」留在本页。`,
    )
    if (goFix) {
      index.value = firstUnanswered
      return
    }
  }

  submitting.value = true
  try {
    const result: SurveyResult = computeResult(pkg, answers)
    await analytics.reportResult(result)
    localStorage.removeItem(DRAFT_KEY)
    // 结果通过 sessionStorage 传递，也可通过历史记录恢复
    sessionStorage.setItem('last-result', JSON.stringify(result))
    router.push(`/result/${surveyId}`)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="progress-bar">
      <div class="progress" :style="{ width: progress + '%' }" />
    </div>
    <div v-if="resumed" class="resume-banner">
      <span>已恢复上次的作答进度（已答 {{ answeredCount }}/{{ questions.length }}）</span>
      <button class="restart-btn" @click="restart">重新开始</button>
    </div>
    <div class="quiz-bar">
      <p class="count">第 {{ index + 1 }} / {{ questions.length }} 题</p>
    </div>

    <div class="card question-card">
      <div class="q-head">
        <h2 class="q-text">{{ current.text }}</h2>
        <button
          v-if="questions.length > 10"
          class="sheet-toggle"
          @click="sheetOpen = !sheetOpen"
        >
          答题卡
        </button>
      </div>

      <!-- single：强迫选择/单选题 -->
      <div v-if="current.type === 'single'" class="options">
        <button
          v-for="(opt, i) in current.options"
          :key="i"
          class="option"
          :class="{ active: currentAnswer === i }"
          @click="choose(current.id, i)"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- scale：李克特量表题 -->
      <div v-else class="options scale">
        <button
          v-for="opt in scaleOptions(current)"
          :key="opt.value"
          class="option"
          :class="{ active: currentAnswer === opt.value }"
          @click="choose(current.id, opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div v-if="sheetOpen" class="card answer-sheet">
      <p class="sheet-title">
        答题卡 · 已答 {{ answeredCount }}/{{ questions.length }}
        <span v-if="unansweredCount > 0" class="sheet-warn">（未答 {{ unansweredCount }}）</span>
      </p>
      <div class="sheet-grid">
        <button
          v-for="(q, i) in questions"
          :key="q.id"
          class="sheet-cell"
          :class="{
            current: i === index,
            answered: answers[q.id] !== undefined,
          }"
          @click="goTo(i)"
        >
          {{ i + 1 }}
        </button>
      </div>
    </div>

    <div class="nav">
      <button class="btn ghost" :disabled="index === 0" @click="prev">上一题</button>
      <button
        v-if="index < questions.length - 1"
        class="btn"
        :disabled="currentAnswer === undefined"
        @click="next"
      >
        下一题
      </button>
      <button
        v-else
        class="btn"
        :disabled="currentAnswer === undefined || submitting"
        @click="submit"
      >
        提交并查看结果
      </button>
    </div>
  </div>
</template>

<style scoped>
.progress-bar {
  height: 6px;
  background: var(--line);
  border-radius: 3px;
  overflow: hidden;
}
.progress {
  height: 100%;
  background: var(--accent);
  transition: width 0.2s;
}
.count {
  color: var(--muted);
  font-size: 13px;
}
.quiz-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 10px 0 4px;
}
.resume-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 10px;
  padding: 10px 14px;
  border: 1px solid var(--accent);
  background: var(--accent-weak);
  color: var(--accent);
  border-radius: 8px;
  font-size: 13px;
}
.restart-btn {
  border: none;
  background: transparent;
  color: inherit;
  text-decoration: underline;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}
.question-card {
  min-height: 220px;
}
.q-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.sheet-toggle {
  flex-shrink: 0;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--muted);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
}
.sheet-toggle:hover {
  color: var(--accent);
  border-color: var(--accent);
}
.answer-sheet {
  margin-top: 12px;
  padding: 14px 16px;
}
.sheet-title {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--muted);
}
.sheet-warn {
  color: #d46a6a;
}
.sheet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}
.sheet-cell {
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--muted);
  border-radius: 6px;
  padding: 6px 0;
  font-size: 13px;
  cursor: pointer;
}
.sheet-cell.answered {
  background: var(--accent-weak);
  border-color: var(--accent);
  color: var(--accent);
}
.sheet-cell.current {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  font-weight: 600;
}
.q-text {
  font-size: 18px;
  line-height: 1.6;
  margin: 0 0 24px;
}
.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.options.scale {
  flex-direction: row;
  flex-wrap: wrap;
}
.option {
  text-align: left;
  border: 1px solid var(--line);
  background: var(--card);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.15s;
}
.options.scale .option {
  flex: 1;
  text-align: center;
  min-width: 80px;
  padding: 10px 6px;
}
.option:hover {
  border-color: var(--accent);
}
.option.active {
  background: var(--accent-weak);
  border-color: var(--accent);
  color: var(--accent);
  font-weight: 600;
}
.nav {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}
.btn.ghost {
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--line);
}
@media (max-width: 480px) {
  .q-text {
    font-size: 16px;
  }
  .option {
    padding: 14px 16px;
  }
  .options.scale .option {
    min-width: 64px;
  }
  .nav {
    flex-wrap: wrap;
  }
  .nav .btn {
    flex: 1;
  }
}
</style>
