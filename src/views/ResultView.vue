﻿﻿﻿<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getSurveyPackage } from '../engine/loader'
import { analytics } from '../engine/analytics'
import ScoreGauge from '../components/ScoreGauge.vue'
import { shareResultCard, type ShareOutcome } from '../engine/share'
import { setMeta } from '../engine/meta'
import type { SurveyResult } from '../engine/types'

const route = useRoute()
const surveyId = route.params.id as string

const pkg = getSurveyPackage(surveyId)
setMeta(`${pkg.manifest.name} · 测评结果`)

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

// dimensions / quadrant 策略：各维度归一化百分比条
const dimBars = computed(() => {
  const cfg = pkg.scoring
  if (!result.value?.percentages) return []
  if (cfg.strategy === 'dimensions') {
    return (cfg.dimensions ?? []).map((d) => ({
      id: d.id,
      name: d.name,
      pct: result.value!.percentages![d.id] ?? 0,
    }))
  }
  if (cfg.strategy === 'quadrant') {
    return (cfg.quadrant?.dimensions ?? []).map((d) => ({
      id: d.id,
      name: d.name,
      pct: result.value!.percentages![d.id] ?? 0,
    }))
  }
  return []
})

// thresholds 策略：分数表盘（色带 + 指针），letter-pairs/dimensions/quadrant 不显示
const gaugeBands = computed(() =>
  pkg.scoring.strategy === 'thresholds' ? (pkg.scoring.bands ?? []) : [],
)
const showGauge = computed(() => gaugeBands.value.length > 0 && !!result.value)
const totalScore = computed(() => result.value?.scores[pkg.scoring.key ?? 'total'] ?? 0)

// 分享结果图：系统分享面板（移动端）优先，桌面端兜底下载
const shareNote = ref('')
const sharing = ref(false)
async function share() {
  if (!result.value || sharing.value) return
  sharing.value = true
  shareNote.value = ''
  try {
    const outcome: ShareOutcome = await shareResultCard(pkg, result.value)
    if (outcome === 'downloaded') shareNote.value = '已保存分享图到本地'
  } finally {
    sharing.value = false
  }
}
</script>

<template>
  <div v-if="detail">
    <h1>你的测评结果</h1>

    <!-- ① 主结果卡：代号 + 标题 + 表盘（thresholds） -->
    <div class="card result-card">
      <p class="result-id font-display">{{ detail.resultId }}</p>
      <h2>{{ detail.info.title }}</h2>
      <p v-if="detail.info.subtitle" class="subtitle">{{ detail.info.subtitle }}</p>
      <ScoreGauge
        v-if="showGauge"
        class="result-gauge"
        :score="totalScore"
        :bands="gaugeBands"
        :results="pkg.results"
      />
    </div>

    <!-- ② 数据可视化卡：letter-pairs 双向条 / dimensions·quadrant 剖面条 / thresholds 总分 -->
    <div v-if="pairs.length" class="card viz-card">
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

    <!-- dimensions 量表：多维度剖面图 -->
    <div v-else-if="dimBars.length" class="card viz-card">
      <h3>维度剖面</h3>
      <div v-for="d in dimBars" :key="d.id" class="dim">
        <div class="dim-labels">
          <span :class="{ strong: d.pct >= 50 }">{{ d.name }} {{ d.pct }}%</span>
        </div>
        <div class="dim-bar">
          <div class="dim-left" :style="{ width: d.pct + '%' }" />
        </div>
      </div>
    </div>

    <!-- thresholds 量表：原始分 -->
    <div v-else-if="pkg.scoring.strategy === 'thresholds'" class="card viz-card">
      <h3>得分详情</h3>
      <p class="score">
        总分：<strong>{{ detail.scores.total ?? 0 }}</strong>
      </p>
    </div>

    <!-- ③ 解读卡：描述 + 建议 -->
    <div v-if="detail.info.description || detail.info.suggestions" class="card read-card">
      <h3>结果解读</h3>
      <p v-if="detail.info.description" class="desc">{{ detail.info.description }}</p>
      <ul v-if="detail.info.suggestions" class="suggestions">
        <li v-for="(s, i) in detail.info.suggestions" :key="i">{{ s }}</li>
      </ul>
    </div>

    <p v-if="pkg.manifest.disclaimer" class="disclaimer">{{ pkg.manifest.disclaimer }}</p>

    <div class="actions">
      <button class="btn" :disabled="sharing" @click="share">
        {{ sharing ? '生成中…' : '分享结果图' }}
      </button>
      <RouterLink class="btn ghost" :to="`/survey/${surveyId}`">再测一次</RouterLink>
      <RouterLink class="btn ghost" to="/">返回首页</RouterLink>
    </div>
    <p v-if="shareNote" class="share-note">{{ shareNote }}</p>
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
.viz-card,
.read-card {
  margin-top: 14px;
}
.viz-card h3,
.read-card h3 {
  margin: 0 0 14px;
  font-size: 15px;
  color: var(--muted);
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
.result-gauge {
  margin: 18px 0 4px;
  text-align: left;
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
.share-note {
  color: var(--muted);
  font-size: 13px;
  margin-top: 10px;
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
  .dim-labels {
    font-size: 13px;
  }
  .actions .btn,
  .actions .btn.ghost {
    flex: 1;
    text-align: center;
  }
}
</style>
