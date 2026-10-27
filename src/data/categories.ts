/**
 * 一级学科分类注册表（首页 Tab 顺序即数组顺序）。
 * 新增分类 = 在此追加一项，并在量表包 manifest.json 中引用其 id。
 */
export interface SurveyCategory {
  id: string
  name: string
  icon: string
  /** 一句话说明，显示在 Tab 内容区顶部 */
  intro: string
}

export const CATEGORIES: SurveyCategory[] = [
  {
    id: 'mbti',
    name: 'MBTI 人格类型',
    icon: '🎯',
    intro: '十六型人格（类型学）测评，多种题量模板，结果仅供娱乐与自我探索',
  },
  {
    id: 'psychology',
    name: '心理学',
    icon: '🧠',
    intro: '专业向量表：人格特质、情绪与心理健康筛查',
  },
  {
    id: 'fun',
    name: '趣味测试',
    icon: '🎉',
    intro: '轻松搞笑的娱乐向测试，结果仅供一乐',
  },
]

/** 量表默认归类（manifest 未声明 category 时落入） */
export const DEFAULT_CATEGORY = 'psychology'

/** 首页默认选中的 Tab */
export const DEFAULT_TAB = 'mbti'

export function getCategory(id?: string): SurveyCategory {
  const found = CATEGORIES.find((c) => c.id === id)
  return found ?? CATEGORIES.find((c) => c.id === DEFAULT_CATEGORY)!
}
