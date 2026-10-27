/**
 * 分类注册表：两级结构
 * - GROUPS：一级大类（首页 Tab）
 * - CATEGORIES：二级子类（Tab 内容区的筛选 chips），manifest.category 指向子类 id
 * 新增量表子类 = 在 CATEGORIES 追加一项（指定所属 group），Tab 与 chips 自动出现。
 */

export interface SurveyGroup {
  id: string
  name: string
  icon: string
  /** Tab 内容区顶部的一句话说明 */
  intro: string
}

export interface SurveyCategory {
  id: string
  name: string
  /** 所属一级大类 id */
  group: string
}

export const GROUPS: SurveyGroup[] = [
  {
    id: 'personality',
    name: '人格测评',
    icon: '🧩',
    intro: '类型学与特质向人格测评，探索你的行为与思维模式',
  },
  {
    id: 'mental',
    name: '情绪与健康',
    icon: '🧠',
    intro: '抑郁、焦虑、强迫、社交等情绪与心理健康筛查量表',
  },
  {
    id: 'student',
    name: '学生专区',
    icon: '🎓',
    intro: '面向不同学段学生的心理健康与发展评估量表',
  },
  {
    id: 'cognitive',
    name: '认知能力',
    icon: '🧮',
    intro: '智商、情商等认知与情绪能力测评',
  },
  {
    id: 'relationship',
    name: '关系与家庭',
    icon: '❤️',
    intro: '依恋、爱情态度与家庭关系的测评',
  },
  {
    id: 'fun',
    name: '趣味测试',
    icon: '🎉',
    intro: '轻松搞笑的娱乐向测试，结果仅供一乐',
  },
]

export const CATEGORIES: SurveyCategory[] = [
  // 人格测评
  { id: 'typology', name: '类型学', group: 'personality' },
  { id: 'trait', name: '特质剖面', group: 'personality' },
  // 情绪与健康
  { id: 'depression', name: '抑郁', group: 'mental' },
  { id: 'anxiety', name: '焦虑', group: 'mental' },
  { id: 'ocd', name: '强迫', group: 'mental' },
  { id: 'bipolar', name: '双相情感', group: 'mental' },
  { id: 'social', name: '社交与恐惧', group: 'mental' },
  { id: 'addiction', name: '成瘾', group: 'mental' },
  { id: 'eating', name: '饮食失调', group: 'mental' },
  { id: 'aggression', name: '攻击性', group: 'mental' },
  { id: 'psychology', name: '综合筛查', group: 'mental' },
  // 学生专区
  { id: 'primary', name: '小学', group: 'student' },
  { id: 'secondary', name: '中学', group: 'student' },
  { id: 'college', name: '大学', group: 'student' },
  // 认知能力
  { id: 'iq', name: '智商', group: 'cognitive' },
  { id: 'eq', name: '情商', group: 'cognitive' },
  // 关系与家庭
  { id: 'love', name: '爱情与依恋', group: 'relationship' },
  { id: 'family', name: '家庭与婚姻', group: 'relationship' },
  // 趣味测试
  { id: 'fun', name: '趣味', group: 'fun' },
]

/** 量表默认归类（manifest 未声明 category 时落入） */
export const DEFAULT_CATEGORY = 'psychology'

/** 首页默认选中的 Tab（'all' 为全部） */
export const DEFAULT_TAB = 'all'

export function getGroup(id: string): SurveyGroup {
  return GROUPS.find((g) => g.id === id) ?? GROUPS[0]
}

export function getCategory(id?: string): SurveyCategory {
  const found = CATEGORIES.find((c) => c.id === id)
  return found ?? CATEGORIES.find((c) => c.id === DEFAULT_CATEGORY)!
}

/** 某大类下的全部子类 */
export function categoriesOfGroup(groupId: string): SurveyCategory[] {
  return CATEGORIES.filter((c) => c.group === groupId)
}
