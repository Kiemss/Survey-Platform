<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getSurveyPackage } from '../engine/loader'
import { analytics } from '../engine/analytics'
import { downloadShareCard } from '../engine/share'
import type { SurveyResult } from '../engine/types'

const route = useRoute()
const surveyId = route.params.id as string

const pkg = getSurveyPackage(surveyId)

// 优先取刚提交的结果，否则回退到本机历史
const result = computed<SurveyResult | null>(() => {
  const last = sessionStorage.getItem('last-result')
  if (last) {
    const r = JSON.parse(last) as SurveyResult
    if (r.surveyId === surveyId) return r
  }
  const history = analytics.getHistory(surveyId)
  return history.length ? history[history.length - 1] : null
})

const detail = computed(() => {
  if (!result.value) return null
  const r = result.value
  return {
    ...r,
    info: pkg.results[r.resultId] ?? {
      title: r.resultId,
      description: '未找到对应的结果文案。',
    },
  }
})

const pairs = computed(() => {
  const cfg = pkg.scoring
  if (cfg.strategy !== 'letter-pairs' || !result.value?.percentages) return []
  return cfg.pairs!.map(([a, b]) => ({
    a,
    b,
    pa: result.value!.percentages![a] ?? 50,
    pb: result.value!.percentages![b] ?? 50,
  }))
})
</script>

<template>
  <div v-if="detail">
    <h1>你的测评结果</h1>

    <div class="card result-card">
      <p class="result-id">{{ detail.resultId }}</p>
      <h2>{{ detail.info.title }}</h2>
      <p v-if="detail.info.subtitle" class="subtitle">{{ detail.info.subtitle }}</p>
      <p class="desc">{{ detail.info.description }}</p>
      <ul v-if="detail.info.suggestions" class="suggestions">
        <li v-for="(s, i) in detail.info.suggestions" :key="i">{{ s }}</li>
      </ul>
    </div>

    <!-- letter-pairs 量表：维度倾向条形图 -->
    <div v-if="pairs.length" class="card">
      <h3>维度倾向</h3>
      <div v-for="p in pairs" :key="p.a + p.b" class="dim">
        <div class="dim-labels">
          <span :class="{ strong: p.pa >= p.pb }">{{ p.a }} {{ p.pa }}%</span>
          <span :class="{ strong: p.pb > p.pa }">{{ p.b }} {{ p.pb }}%</span>
        </div>
        <div class="dim-bar">
          <div class="dim-left" :style="{ width: p.pa + '%' }" />
        </div>
      </div>
    </div>

    <!-- thresholds 量表：原始分 -->
    <div v-else class="card">
      <h3>得分详情</h3>
      <p class="score">
        总分：<strong>{{ detail.scores.total ?? 0 }}</strong>
      </p>
    </div>

    <p v-if="pkg.manifest.disclaimer" class="disclaimer">{{ pkg.manifest.disclaimer }}</p>

    <div class="actions">
      <button class="btn" @click="downloadShareCard(pkg, result!)">保存分享图</button>
      <RouterLink class="btn ghost" :to="`/survey/${surveyId}`">再测一次</RouterLink>
      <RouterLink class="btn ghost" to="/">返回首页</RouterLink>
    </div>
  </div>

  <div v-else>
    <p>没有找到测评结果。</p>
    <RouterLink class="btn" :to="`/survey/${surveyId}`">去做这份测评</RouterLink>
  </div>
</template>

<style scoped>
.result-card {
  text-align: center;
  padding: 32px 20px;
}
.result-id {
  font-size: 40px;
  font-weight: 800;
  color: var(--accent);
  margin: 0;
  letter-spacing: 2px;
}
.subtitle {
  color: var(--muted);
}
.desc {
  line-height: 1.8;
  text-align: left;
}
.suggestions {
  text-align: left;
  line-height: 1.8;
  color: var(--muted);
}
.dim {
  margin-bottom: 16px;
}
.dim-labels {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 6px;
}
.strong {
  font-weight: 700;
  color: var(--accent);
}
.dim-bar {
  display: flex;
  height: 10px;
  background: var(--line);
  border-radius: 5px;
  overflow: hidden;
}
.dim-left {
  background: var(--accent);
}
.disclaimer {
  color: var(--muted);
  font-size: 12px;
  margin-top: 16px;
}
.actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.btn.ghost {
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--line);
  text-decoration: none;
}
@media (max-width: 480px) {
  .result-card {
    padding: 24px 16px;
  }
  .result-id {
    font-size: 32px;
  }
  .actions .btn,
  .actions .btn.ghost {
    flex: 1;
    text-align: center;
  }
}
</style>
