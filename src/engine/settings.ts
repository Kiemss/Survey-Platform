/**
 * 应用设置（客户端持久化）
 * 存储于 localStorage；后续新增设置项在此扩展字段并写默认值即可。
 */
export interface AppSettings {
  /** 答题后自动跳转下一题 */
  autoNext: boolean
  /** 自动跳转延迟（毫秒），给选中态留视觉反馈 */
  autoNextDelay: number
  /** 深色模式：跟随系统 / 浅色 / 深色 */
  theme: 'auto' | 'light' | 'dark'
}

const STORAGE_KEY = 'survey-settings'

const DEFAULTS: AppSettings = {
  autoNext: true,
  autoNextDelay: 250,
  theme: 'auto',
}

export function loadSettings(): AppSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return { ...DEFAULTS, ...saved }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(patch: Partial<AppSettings>): AppSettings {
  const merged = { ...loadSettings(), ...patch }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  return merged
}

/** auto 模式下跟随系统偏好 */
export function effectiveTheme(s: AppSettings): 'light' | 'dark' {
  if (s.theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return s.theme
}

/** 把当前主题应用到 <html> 根元素（style.css 用 :root.dark 变量） */
export function applyTheme(s: AppSettings): void {
  document.documentElement.classList.toggle('dark', effectiveTheme(s) === 'dark')
}
