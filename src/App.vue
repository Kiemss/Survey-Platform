<template>
  <div class="app">
    <header class="topbar">
      <RouterLink to="/" class="logo">心理测评站</RouterLink>
      <nav class="nav">
        <RouterLink to="/history" class="nav-link">历史</RouterLink>
        <button class="theme-btn" :title="themeTitle" @click="toggleTheme">
          {{ isDark ? '🌙' : '☀️' }}
        </button>
      </nav>
    </header>
    <main class="main">
      <RouterView />
    </main>
    <footer class="footer">本站测评仅供自我探索参考，不构成医学诊断</footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  applyTheme,
  effectiveTheme,
  loadSettings,
  saveSettings,
} from './engine/settings'

const media = window.matchMedia('(prefers-color-scheme: dark)')

const isDark = ref(false)
const themeTitle = computed(() => `主题（当前：${loadSettings().theme}，点击切换）`)

function refresh() {
  isDark.value = effectiveTheme(loadSettings()) === 'dark'
}

function toggleTheme() {
  // auto → 对切另一侧；light/dark → 直接对切（形成 light ⇄ dark 循环）
  const next = isDark.value ? 'light' : 'dark'
  saveSettings({ theme: next })
  applyTheme(loadSettings())
  refresh()
}

function onSystemChange() {
  if (loadSettings().theme === 'auto') refresh()
}

onMounted(() => {
  applyTheme(loadSettings())
  refresh()
  media.addEventListener('change', onSystemChange)
})
onUnmounted(() => media.removeEventListener('change', onSystemChange))
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.topbar {
  padding: 12px 24px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  font-weight: 700;
  font-size: 18px;
  color: var(--text);
  text-decoration: none;
}
.theme-btn {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  border-radius: 6px;
}
.nav {
  display: flex;
  align-items: center;
  gap: 14px;
}
.nav-link {
  color: var(--muted);
  text-decoration: none;
  font-size: 14px;
}
.nav-link:hover {
  color: var(--accent);
}
.main {
  flex: 1;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  box-sizing: border-box;
}
.footer {
  padding: 16px;
  text-align: center;
  color: var(--muted);
  font-size: 12px;
  border-top: 1px solid var(--line);
}
</style>
