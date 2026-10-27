<template>
  <div class="app">
    <header class="topbar">
      <RouterLink to="/" class="logo">心理测评站</RouterLink>
      <nav class="nav">
        <RouterLink to="/history" class="nav-link">历史</RouterLink>
        <div class="settings-wrap" ref="settingsRef">
          <button class="icon-btn" title="设置" @click="settingsOpen = !settingsOpen">⚙</button>
          <div v-if="settingsOpen" class="settings-panel">
            <div class="panel-title">设置</div>
            <div class="setting-row">
              <span>自动下一题</span>
              <button
                class="switch"
                :class="{ on: settings.autoNext }"
                aria-label="自动下一题"
                @click="settings.autoNext = !settings.autoNext"
              />
            </div>
            <div class="setting-row">
              <span>跳转速度（毫秒）</span>
              <input
                class="delay-input"
                type="number"
                min="100"
                max="2000"
                step="50"
                v-model.number="settings.autoNextDelay"
                :disabled="!settings.autoNext"
                @change="clampDelay"
              />
            </div>
          </div>
        </div>
        <button class="icon-btn" :title="themeTitle" @click="toggleTheme">
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
import { settings, applyTheme, effectiveTheme } from './engine/settings'

const media = window.matchMedia('(prefers-color-scheme: dark)')

const isDark = ref(false)
const themeTitle = computed(() => (isDark.value ? '切换主题' : '切换主题'))

function refresh() {
  isDark.value = effectiveTheme(settings) === 'dark'
}

function toggleTheme() {
  // 手动点击 ☀️/🌙 时直接对切主题（auto 会被覆盖为明确选择）
  settings.theme = isDark.value ? 'light' : 'dark'
  applyTheme()
  refresh()
}

function clampDelay() {
  const v = settings.autoNextDelay
  settings.autoNextDelay = Math.min(2000, Math.max(100, Math.round(v || 0)))
}

function onSystemChange() {
  refresh()
}

// 设置面板（点外部收起）
const settingsOpen = ref(false)
const settingsRef = ref<HTMLElement | null>(null)
function onDocClick(e: MouseEvent) {
  if (settingsRef.value && !settingsRef.value.contains(e.target as Node)) {
    settingsOpen.value = false
  }
}

onMounted(() => {
  applyTheme()
  refresh()
  media.addEventListener('change', onSystemChange)
  document.addEventListener('click', onDocClick)
})
onUnmounted(() => {
  media.removeEventListener('change', onSystemChange)
  document.removeEventListener('click', onDocClick)
})
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
  gap: 12px;
}
.logo {
  font-weight: 700;
  font-size: 18px;
  color: var(--text);
  text-decoration: none;
}
.icon-btn {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  border-radius: 6px;
  color: var(--muted);
}
.icon-btn:hover {
  color: var(--accent);
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
.settings-wrap {
  position: relative;
}
.settings-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: 0 8px 24px var(--shadow);
  padding: 12px 14px;
  width: 230px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.panel-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--muted);
}
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  gap: 10px;
}
.setting-row select,
.delay-input {
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 13px;
  background: var(--card);
  color: var(--text);
}
.delay-input {
  width: 88px;
}
.delay-input:disabled {
  opacity: 0.5;
}
.switch {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: var(--line);
  position: relative;
  transition: background 0.15s;
  flex: none;
  border: none;
  cursor: pointer;
  padding: 0;
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
@media (max-width: 480px) {
  .topbar {
    padding: 10px 14px;
  }
  .main {
    padding: 16px 12px 40px;
  }
}
</style>
