<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
  if (page.value > totalPages.value) page.value = totalPages.value
}

// 分页（每页 6 条，样式与首页量表翻页一致）
const PAGE_SIZE = 6
const page = ref(1)
const pageInput = ref('')
const totalPages = computed(() => Math.max(1, Math.ceil(records.value.length / PAGE_SIZE)))
const visible = computed(() =>
  records.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
)

function confirmJump() {
  const v = parseInt(pageInput.value, 10)
  if (!Number.isNaN(v)) page.value = Math.min(totalPages.value, Math.max(1, v))
  pageInput.value = ''
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
      <div v-for="r in visible" :key="r.answeredAt" class="card record">
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

    <div v-if="totalPages > 1" class="pager">
      <button class="pager-btn" :disabled="page <= 1" @click="page--">‹ 上一页</button>
      <span>第 {{ page }} / {{ totalPages }} 页 · 共 {{ records.length }} 条</span>
      <button class="pager-btn" :disabled="page >= totalPages" @click="page++">下一页 ›</button>
      <span class="pager-jump">
        <input
          v-model="pageInput"
          type="number"
          min="1"
          :max="totalPages"
          placeholder="页"
          @keyup.enter="confirmJump"
        />
        <button class="pager-btn" @click="confirmJump">跳转</button>
      </span>
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
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  flex-wrap: wrap;
  font-size: 13px;
  color: var(--muted);
}
.pager-btn {
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--text);
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 13px;
  cursor: pointer;
}
.pager-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pager-jump input {
  width: 56px;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 13px;
  background: var(--card);
  color: var(--text);
  margin-right: 6px;
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
