<script setup lang="ts">
import { computed } from 'vue'
import { listSurveyIds, getSurveyPackage } from '../engine/loader'

const surveys = computed(() =>
  listSurveyIds().map((id) => getSurveyPackage(id).manifest),
)
</script>

<template>
  <div>
    <h1>选择一项测评</h1>
    <p class="hint">全部作答在浏览器本地完成，结果保存在你的设备上，不会上传。</p>
    <div v-for="s in surveys" :key="s.id" class="card survey-card">
      <div class="head">
        <h2>{{ s.name }}</h2>
        <span class="meta">v{{ s.version }} · 约 {{ s.estimatedMinutes }} 分钟</span>
      </div>
      <p class="desc">{{ s.description }}</p>
      <RouterLink class="btn" :to="`/survey/${s.id}`">开始测评</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.survey-card {
  margin-bottom: 16px;
}
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.head h2 {
  margin: 0;
  font-size: 18px;
}
.meta {
  color: var(--muted);
  font-size: 13px;
}
.desc {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}
.hint {
  color: var(--muted);
  font-size: 13px;
}
</style>
