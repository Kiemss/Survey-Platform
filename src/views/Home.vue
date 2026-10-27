<script setup lang="ts">
import { computed, ref } from 'vue'
import { listSurveyIds, getSurveyPackage } from '../engine/loader'
import { CATEGORIES, DEFAULT_TAB, getCategory } from '../data/categories'
import type { SurveyManifest } from '../engine/types'

const surveys = computed(() =>
  listSurveyIds().map((id) => {
    const pkg = getSurveyPackage(id)
    return { ...pkg.manifest, qCount: pkg.questions.length }
  }),
)

// 分类 Tab：全部 + 各学科；默认定位到主分类
type Tab = 'all' | string
const activeTab = ref<Tab>(DEFAULT_TAB)

const tabs = computed(() => [
  { id: 'all' as Tab, name: '全部', icon: '📋', count: surveys.value.length },
  ...CATEGORIES.map((c) => ({
    id: c.id as Tab,
    name: c.name,
    icon: c.icon,
    count: surveys.value.filter((s) => getCategory(s.category).id === c.id).length,
  })),
])

const visible = computed<SurveyManifest[]>(() =>
  surveys.value.filter(
    (s) => activeTab.value === 'all' || getCategory(s.category).id === activeTab.value,
  ),
)

const currentCategory = computed(() =>
  activeTab.value === 'all' ? null : getCategory(activeTab.value),
)
</script>

<template>
  <div>
    <h1>选择一项测评</h1>
    <p class="hint">全部作答在浏览器本地完成，结果保存在你的设备上，不会上传。</p>

    <div class="cat-tabs" role="tablist">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="cat-tab"
        :class="{ active: activeTab === t.id }"
        role="tab"
        :aria-selected="activeTab === t.id"
        @click="activeTab = t.id"
      >
        <span class="tab-icon">{{ t.icon }}</span>
        {{ t.name }}
        <span class="tab-count">{{ t.count }}</span>
      </button>
    </div>

    <p v-if="currentCategory" class="cat-intro">{{ currentCategory.intro }}</p>

    <div v-if="visible.length" class="survey-list">
      <div v-for="s in visible" :key="s.id" class="card survey-card">
        <div class="head">
          <h2>{{ s.name }}</h2>
        </div>
        <p class="desc">{{ s.description }}</p>
        <div class="foot">
          <span class="qcount">{{ s.qCount }} 题</span>
          <RouterLink class="btn" :to="`/survey/${s.id}`">开始测试</RouterLink>
        </div>
      </div>
    </div>
    <div v-else class="card empty">该分类下暂无测评，敬请期待。</div>
  </div>
</template>

<style scoped>
.cat-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 16px 0 8px;
}
.cat-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--text);
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.cat-tab.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.tab-count {
  font-size: 12px;
  opacity: 0.7;
}
.cat-intro {
  color: var(--muted);
  font-size: 13px;
  margin: 4px 0 0;
}
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
.desc {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}
.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.qcount {
  color: var(--muted);
  font-size: 13px;
}
.empty {
  text-align: center;
  color: var(--muted);
}
.hint {
  color: var(--muted);
  font-size: 13px;
}
@media (max-width: 480px) {
  .cat-tab {
    padding: 8px 12px;
    font-size: 13px;
  }
  .foot {
    flex-direction: column;
    align-items: stretch;
  }
  .foot .btn {
    text-align: center;
  }
}
</style>
