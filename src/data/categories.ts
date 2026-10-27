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
    id: 'personality',
    name: '人格测评',
    icon: '🧩',
    intro: '类型学与特质向人格测评（MBTI、大五人格等），探索你的行为与思维模式',
  },
  {
    id: 'psychology',
    name: '心理学',
    icon: '🧠',
    intro: '专业向量表：情绪与心理健康筛查（临床/学术类）',
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
export const DEFAULT_TAB = 'personality'

export function getCategory(id?: string): SurveyCategory {
  const found = CATEGORIES.find((c) => c.id === id)
  return found ?? CATEGORIES.find((c) => c.id === DEFAULT_CATEGORY)!
}
