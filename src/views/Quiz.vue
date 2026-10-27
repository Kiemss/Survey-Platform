<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { computeResult, getSurveyPackage, scaleOptions } from '../engine/loader'
import { analytics } from '../engine/analytics'
import { loadSettings, saveSettings, DELAY_PRESETS } from '../engine/settings'
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

const index = ref(0)
const current = computed(() => questions[index.value])
const currentAnswer = computed(() => answers[current.value.id])
const progress = computed(() => Math.round(((index.value + 1) / questions.length) * 100))

// 自动下一题（设置持久化）
const initial = loadSettings()
const autoNext = ref(initial.autoNext)
const autoNextDelay = ref(initial.autoNextDelay)
let autoTimer: number | undefined

// 设置下拉面板
const settingsOpen = ref(false)
const settingsRef = ref<HTMLElement | null>(null)

function toggleAutoNext() {
  autoNext.value = !autoNext.value
  saveSettings({ autoNext: autoNext.value })
}

function setDelay(v: number) {
  autoNextDelay.value = v
  saveSettings({ autoNextDelay: v })
}

function onDocClick(e: MouseEvent) {
  if (settingsRef.value && !settingsRef.value.contains(e.target as Node)) {
    settingsOpen.value = false
  }
}
document.addEventListener('click', onDocClick)
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  window.clearTimeout(autoTimer)
})

const submitting = ref(false)

function choose(qid: string, value: number) {
  answers[qid] = value
  localStorage.setItem(DRAFT_KEY, JSON.stringify(answers))

  // 自动下一题：非最后一题时延迟跳转，给选中态留出视觉反馈
  if (autoNext.value && index.value < questions.length - 1) {
    window.clearTimeout(autoTimer)
    autoTimer = window.setTimeout(next, autoNextDelay.value)
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

async function submit() {
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
    <div class="quiz-bar">
      <p class="count">第 {{ index + 1 }} / {{ questions.length }} 题</p>
      <div class="settings-wrap" ref="settingsRef">
        <button class="gear-btn" title="设置" @click="settingsOpen = !settingsOpen">⚙</button>
        <div v-if="settingsOpen" class="settings-panel">
          <label class="setting-row" @click.prevent="toggleAutoNext">
            <span>自动下一题</span>
            <span class="switch" :class="{ on: autoNext }" />
          </label>
          <div class="setting-row col">
            <span>跳转速度</span>
            <select
              :value="autoNextDelay"
              :disabled="!autoNext"
              @change="setDelay(Number(($event.target as HTMLSelectElement).value))"
            >
              <option v-for="p in DELAY_PRESETS" :key="p.value" :value="p.value">
                {{ p.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="card question-card">
      <h2 class="q-text">{{ current.text }}</h2>

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
.settings-wrap {
  position: relative;
}
.gear-btn {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: var(--muted);
  line-height: 1;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.15s;
}
.gear-btn:hover {
  color: var(--accent);
}
.settings-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 12px 14px;
  width: 200px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  cursor: pointer;
  gap: 10px;
}
.setting-row.col {
  flex-direction: column;
  align-items: stretch;
  cursor: default;
  gap: 6px;
}
.setting-row.col select {
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 13px;
  background: #fff;
  color: var(--text);
}
.switch {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: var(--line);
  position: relative;
  transition: background 0.15s;
  flex: none;
}
.switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.15s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.switch.on {
  background: var(--accent);
}
.switch.on::after {
  left: 18px;
}
.question-card {
  min-height: 220px;
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
  background: #fff;
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
  background: #fff;
  color: var(--text);
  border: 1px solid var(--line);
}
</style>
