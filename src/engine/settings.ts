/**
 * 应用设置（客户端持久化）
 * 存储于 localStorage；后续新增设置项在此扩展字段并写默认值即可。
 */
export interface AppSettings {
  /** 答题后自动跳转下一题 */
  autoNext: boolean
  /** 自动跳转延迟（毫秒），给选中态留视觉反馈 */
  autoNextDelay: number
}

const STORAGE_KEY = 'survey-settings'

const DEFAULTS: AppSettings = {
  autoNext: true,
  autoNextDelay: 250,
}

/** 速度预设（下拉可选项） */
export const DELAY_PRESETS: { label: string; value: number }[] = [
  { label: '立即（150ms）', value: 150 },
  { label: '快速（250ms）', value: 250 },
  { label: '舒适（400ms）', value: 400 },
  { label: '悠闲（600ms）', value: 600 },
]

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
