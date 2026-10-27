/**
 * 分类颜色映射：每个一级大类固定一个主色，用于量表卡片/详情页的分类图标底色与标签配色。
 * 子类不单独设色，缺省继承所属大类的颜色（getCategory → group → 色）。
 * 新增颜色前先在 docs/design-system.md §2 扩展色板登记。
 */
import { getCategory, getGroup } from './categories'

const GROUP_COLORS: Record<string, string> = {
  personality: '#6366f1', // 人格测评 · 蓝紫
  mental: '#14b8a6', // 情绪与健康 · 蓝绿
  student: '#f59e0b', // 学生专区 · 橙
  cognitive: '#a855f7', // 认知能力 · 紫
  relationship: '#ec4899', // 关系与家庭 · 粉
  fun: '#f43f5e', // 趣味测试 · 玫红
}

/** 未登记大类的兜底色（中性灰） */
const DEFAULT_COLOR = '#7a8194'

/** 某子类（或直接传大类 id 不存在时按子类解析）对应的颜色 */
export function getCategoryColor(categoryId?: string): string {
  const cat = getCategory(categoryId)
  return GROUP_COLORS[cat.group] ?? DEFAULT_COLOR
}

/** 分类图标底色样式：主色低透明度底，深浅色主题下均可读 */
export function categoryChipStyle(categoryId?: string): Record<string, string> {
  const color = getCategoryColor(categoryId)
  return { background: `${color}26`, color }
}

/** 分类标签样式：文字用主色，底色为低透明度同色 */
export function categoryTagStyle(categoryId?: string): Record<string, string> {
  return categoryChipStyle(categoryId)
}

/** 分类图标的 emoji（取自一级大类） */
export function categoryIcon(categoryId?: string): string {
  return getGroup(getCategory(categoryId).group).icon
}
