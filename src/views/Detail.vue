<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSurveyPackage } from '../engine/loader'
import { setMeta } from '../engine/meta'
import { getCategory } from '../data/categories'
import { categoryChipStyle, categoryIcon, categoryTagStyle } from '../data/categoryColors'

const route = useRoute()
const router = useRouter()

const pkg = computed(() => {
  try {
    return getSurveyPackage(route.params.id as string)
  } catch {
    return null
  }
})

if (!pkg.value) {
  router.replace('/')
}

const manifest = computed(() => pkg.value?.manifest)
const qCount = computed(() => pkg.value?.questions.length ?? 0)

// SEO：量表详情页的动态标题与描述
watchEffect(() => {
  if (manifest.value) {
    setMeta(
      `${manifest.value.name}（${qCount.value}题）`,
      `${manifest.value.name}在线测试，共 ${qCount.value} 题：${manifest.value.description}`,
    )
  }
})
const categoryName = computed(() => getCategory(manifest.value?.category).name)
const chipStyle = computed(() => categoryChipStyle(manifest.value?.category))
const tagStyle = computed(() => categoryTagStyle(manifest.value?.category))
</script>

<template>
  <div v-if="manifest">
    <RouterLink to="/" class="back">‹ 返回列表</RouterLink>

    <div class="card detail">
      <div class="cat-row">
        <span class="cat-chip" :style="chipStyle" aria-hidden="true">{{
          categoryIcon(manifest?.category)
        }}</span>
        <span class="cat-tag" :style="tagStyle">{{ categoryName }}</span>
      </div>
      <h1>{{ manifest.name }}</h1>
      <p class="meta">{{ qCount }} 题 · 约 {{ manifest.estimatedMinutes }} 分钟</p>
      <p class="desc">{{ manifest.description }}</p>
      <div class="actions">
        <RouterLink class="btn primary" :to="`/survey/${manifest.id}`">开始测评</RouterLink>
      </div>
    </div>

    <div class="card notice">
      <h2>测评须知</h2>
      <ul>
        <li>请在安静、不受打扰的环境下作答，凭第一直觉选择，不要过度思考。</li>
        <li>题目没有对错、好坏之分，如实作答结果才准确。</li>
        <li>作答数据仅保存在你的浏览器本地，不会上传到任何服务器。</li>
        <li v-if="manifest.disclaimer">{{ manifest.disclaimer }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: 12px;
  color: var(--muted);
  text-decoration: none;
  font-size: 14px;
}
.back:hover {
  color: var(--accent);
}
.detail {
  margin-bottom: 16px;
}
.cat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.cat-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  font-size: 17px;
  flex: none;
}
.cat-tag {
  display: inline-block;
  font-size: 12px;
  border-radius: 999px;
  padding: 3px 10px;
}
.detail h1 {
  margin: 0 0 4px;
  font-size: 22px;
}
.meta {
  color: var(--muted);
  font-size: 13px;
  margin: 0 0 12px;
}
.desc {
  font-size: 15px;
  line-height: 1.7;
}
.actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}
.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.notice h2 {
  margin: 0 0 8px;
  font-size: 16px;
}
.notice ul {
  margin: 0;
  padding-left: 20px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.9;
}
</style>
