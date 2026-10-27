<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { analytics } from '../engine/analytics'
import { getSurveyPackage } from '../engine/loader'
import type { SurveyResult } from '../engine/types'

const router = useRouter()

function decorate(r: SurveyResult) {
  let surveyName = r.surveyId
  let resultTitle = r.resultId
  try {
    const pkg = getSurveyPackage(r.surveyId)
    surveyName = pkg.manifest.name
    resultTitle = `${r.resultId} ${pkg.results[r.resultId]?.title ?? ''}`.trim()
  } catch {
    // 量表已被移除时仍展示原始 id
  }
  return { ...r, surveyName, resultTitle }
}

const records = ref(analytics.getHistory().map(decorate))

function refresh() {
  records.value = analytics.getHistory().map(decorate)
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function view(r: SurveyResult) {
  sessionStorage.setItem('last-result', JSON.stringify(r))
  router.push(`/result/${r.surveyId}`)
}

function remove(answeredAt: number) {
  analytics.removeResult(answeredAt)
  refresh()
}

function clearAll() {
  if (confirm('确定清空全部本机历史记录吗？此操作不可恢复。')) {
    analytics.clearHistory()
    refresh()
  }
}
</script>

<template>
  <div>
    <div class="head">
      <h1>我的历史</h1>
      <button v-if="records.length" class="btn ghost danger" @click="clearAll">
        清空全部
      </button>
    </div>
    <p class="hint">记录仅保存在本机浏览器中，不会上传；清除浏览器数据会一并清除历史。</p>

    <div v-if="records.length" class="list">
      <div v-for="r in records" :key="r.answeredAt" class="card record">
        <div class="info">
          <p class="survey">{{ r.surveyName }}</p>
          <p class="result">{{ r.resultTitle }}</p>
          <p class="time">{{ formatDate(r.answeredAt) }}</p>
        </div>
        <div class="actions">
          <button class="btn small" @click="view(r)">查看</button>
          <button class="btn small ghost" @click="remove(r.answeredAt)">删除</button>
        </div>
      </div>
    </div>

    <div v-else class="card empty">
      <p>还没有测评记录。</p>
      <RouterLink class="btn" to="/">去做一份测评</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
h1 {
  font-size: 22px;
  margin: 0 0 8px;
}
.hint {
  color: var(--muted);
  font-size: 13px;
  margin-top: 0;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}
.record {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
}
.info p {
  margin: 2px 0;
}
.survey {
  font-weight: 600;
}
.result {
  color: var(--accent);
  font-size: 14px;
}
.time {
  color: var(--muted);
  font-size: 12px;
}
.actions {
  display: flex;
  gap: 8px;
  flex: none;
}
.btn.small {
  padding: 6px 14px;
  font-size: 13px;
}
.btn.ghost {
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--line);
  text-decoration: none;
}
.danger {
  color: var(--danger);
}
.empty {
  margin-top: 14px;
  text-align: center;
  color: var(--muted);
}
@media (max-width: 480px) {
  .record {
    flex-direction: column;
    align-items: stretch;
  }
  .actions .btn {
    flex: 1;
  }
}
</style>
