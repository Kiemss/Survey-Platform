/**
 * 应用设置（客户端持久化）
 * 存储于 localStorage；后续新增设置项在此扩展字段并写默认值即可。
 */
export interface AppSettings {
  /** 答题后自动跳转下一题 */
  autoNext: boolean
}

const STORAGE_KEY = 'survey-settings'

const DEFAULTS: AppSettings = {
  autoNext: true,
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
