<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { listSurveyIds, getSurveyPackage } from '../engine/loader'
import { GROUPS, DEFAULT_TAB, getCategory, getGroup } from '../data/categories'

interface SurveyCard extends Record<string, unknown> {
  id: string
  name: string
  description: string
  category?: string
  qCount: number
}

const PAGE_SIZE = 4

const surveys = computed<SurveyCard[]>(() =>
  listSurveyIds().map((id) => {
    const pkg = getSurveyPackage(id)
    return {
      id: pkg.manifest.id,
      name: pkg.manifest.name,
      description: pkg.manifest.description,
      category: pkg.manifest.category,
      qCount: pkg.questions.length,
    } as SurveyCard
  }),
)

// 一级综合大类 Tab：全部 + 6 个大类（分类明细只用于归类，不外显）
type Tab = 'all' | string
const activeTab = ref<Tab>(DEFAULT_TAB)

// 搜索（跨所有分类；非空时覆盖 Tab 筛选）
const keyword = ref('')

const tabs = computed(() => [
  { id: 'all' as Tab, name: '全部', icon: '📋', count: surveys.value.length },
  ...GROUPS.map((g) => ({
    id: g.id as Tab,
    name: g.name,
    icon: g.icon,
    count: surveys.value.filter((s) => getCategory(s.category).group === g.id).length,
  })),
])

/** 搜索匹配：名称 / 简介 / 子类名 */
function matchSearch(s: SurveyCard, kw: string): boolean {
  const cat = getCategory(s.category)
  return (
    s.name.toLowerCase().includes(kw) ||
    s.description.toLowerCase().includes(kw) ||
    cat.name.toLowerCase().includes(kw)
  )
}

const filtered = computed<SurveyCard[]>(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (kw) return surveys.value.filter((s) => matchSearch(s, kw))
  if (activeTab.value === 'all') return surveys.value
  return surveys.value.filter((s) => getCategory(s.category).group === activeTab.value)
})

// 分页
const page = ref(1)
const pageInput = ref('')
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const visible = computed(() =>
  filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
)

// Tab / 搜索变化时回到第 1 页
watch([activeTab, keyword], () => {
  page.value = 1
})
watch(keyword, () => {
  pageInput.value = ''
})

/** 确认跳转：点击「跳转」按钮或回车生效 */
function confirmJump() {
  const v = parseInt(pageInput.value, 10)
  if (!Number.isNaN(v)) page.value = Math.min(totalPages.value, Math.max(1, v))
  pageInput.value = ''
}

const currentGroup = computed(() =>
  activeTab.value === 'all' ? null : getGroup(activeTab.value),
)
const searching = computed(() => keyword.value.trim().length > 0)
</script>

<template>
  <div>
    <h1>选择一项测评</h1>
    <p class="hint">全部作答在浏览器本地完成，结果保存在你的设备上，不会上传。</p>

    <input
      v-model="keyword"
      class="search"
      type="search"
      placeholder="搜索量表名称、描述或分类…"
      aria-label="搜索量表"
    />

    <div class="cat-tabs" role="tablist">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="cat-tab"
        :class="{ active: !searching && activeTab === t.id }"
        role="tab"
        :aria-selected="activeTab === t.id"
        @click="activeTab = t.id"
      >
        <span class="tab-icon">{{ t.icon }}</span>
        {{ t.name }}
        <span class="tab-count">{{ t.count }}</span>
      </button>
    </div>

    <p v-if="searching" class="cat-intro">
      搜索「{{ keyword.trim() }}」：找到 {{ filtered.length }} 个结果
    </p>
    <p v-else-if="currentGroup" class="cat-intro">{{ currentGroup.intro }}</p>

    <div v-if="visible.length" class="survey-list">
      <RouterLink
        v-for="s in visible"
        :key="s.id"
        class="card survey-card"
        :to="`/about/${s.id}`"
      >
        <div class="head">
          <h2>{{ s.name }}</h2>
          <span v-if="searching" class="cat-tag">{{ getCategory(s.category).name }}</span>
        </div>
        <p class="desc">{{ s.description }}</p>
        <div class="foot">
          <span class="qcount">{{ s.qCount }} 题</span>
          <RouterLink class="btn" :to="`/survey/${s.id}`" @click.stop>开始测试</RouterLink>
        </div>
      </RouterLink>
    </div>
    <div v-else class="card empty">没有找到匹配的测评，换个关键词试试。</div>

    <div v-if="totalPages > 1" class="pager">
      <button class="pager-btn" :disabled="page <= 1" @click="page--">‹ 上一页</button>
      <span class="pager-info">第 {{ page }} / {{ totalPages }} 页</span>
      <button class="pager-btn" :disabled="page >= totalPages" @click="page++">下一页 ›</button>
      <span class="pager-jump">
        <input
          v-model="pageInput"
          type="number"
          min="1"
          :max="totalPages"
          placeholder="页码"
          @keyup.enter="confirmJump"
        />
        <button class="pager-btn" @click="confirmJump">跳转</button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.search {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  background: var(--card);
  color: var(--text);
  margin-top: 12px;
}
.search:focus {
  outline: none;
  border-color: var(--accent);
}
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
  display: block;
  color: inherit;
  text-decoration: none;
}
.survey-card:hover h2 {
  color: var(--accent);
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
.cat-tag {
  font-size: 12px;
  color: var(--accent);
  background: var(--accent-weak);
  border-radius: 999px;
  padding: 3px 10px;
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
  .pager {
    gap: 10px;
  }
}
</style>
