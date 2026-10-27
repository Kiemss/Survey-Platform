import { reactive, watch } from 'vue'

/**
 * 应用设置（客户端持久化）
 * 全局响应式 store：任何组件读写 settings 都会实时同步并持久化到 localStorage。
 * 新增设置项：扩展 AppSettings 字段 + DEFAULTS 默认值即可。
 */
export interface AppSettings {
  /** 答题后自动跳转下一题 */
  autoNext: boolean
  /** 自动跳转延迟（毫秒），给选中态留视觉反馈 */
  autoNextDelay: number
  /** 最后一题答完且全部作答完毕后自动提交 */
  autoSubmit: boolean
  /** 深色模式：跟随系统 / 浅色 / 深色 */
  theme: 'auto' | 'light' | 'dark'
}

const STORAGE_KEY = 'survey-settings'

const DEFAULTS: AppSettings = {
  autoNext: true,
  autoNextDelay: 250,
  autoSubmit: true,
  theme: 'auto',
}

function loadRaw(): AppSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return { ...DEFAULTS, ...saved }
  } catch {
    return { ...DEFAULTS }
  }
}

/** 全局响应式设置对象（组件直接 import 使用） */
export const settings = reactive<AppSettings>(loadRaw())

watch(settings, (s) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
})

/** auto 模式下跟随系统偏好 */
export function effectiveTheme(s: AppSettings): 'light' | 'dark' {
  if (s.theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return s.theme
}

/** 把当前主题应用到 <html> 根元素（style.css 用 :root.dark 变量） */
export function applyTheme(): void {
  document.documentElement.classList.toggle('dark', effectiveTheme(settings) === 'dark')
}
