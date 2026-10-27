import type { SurveyResult } from './types'

/**
 * 统计接口层（预留）：
 * 现阶段所有数据只留在客户端（localStorage）。
 * 日后接入 Cloudflare Workers + D1 时，仅需新增一个实现本接口的类并在工厂处切换，
 * 页面与计分引擎零改动。
 */
export interface AnalyticsService {
  /** 上报一次完成的测评（可选开启） */
  reportResult(result: SurveyResult): Promise<void>
  /** 读取本机历史记录（新的在前） */
  getHistory(surveyId?: string): SurveyResult[]
  /** 删除单条历史记录（按作答时间戳定位） */
  removeResult(answeredAt: number): void
  /** 清空本机历史记录 */
  clearHistory(): void
}

const STORAGE_KEY = 'survey-history'

class LocalStorageAnalytics implements AnalyticsService {
  async reportResult(result: SurveyResult): Promise<void> {
    const list = this.getHistory()
    list.push(result)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    // TODO: 日后在此处替换/追加为 fetch('/api/results', ...) 上报云端
  }

  getHistory(surveyId?: string): SurveyResult[] {
    try {
      const list: SurveyResult[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      const filtered = surveyId ? list.filter((r) => r.surveyId === surveyId) : list
      return filtered.sort((a, b) => b.answeredAt - a.answeredAt)
    } catch {
      return []
    }
  }

  removeResult(answeredAt: number): void {
    const list = this.getHistory().filter((r) => r.answeredAt !== answeredAt)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }

  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const analytics: AnalyticsService = new LocalStorageAnalytics()
