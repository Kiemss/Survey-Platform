/**
 * SEO 基础：每页动态更新 document.title 与 meta description。
 * 在各视图 setup 阶段调用一次即可。
 */

const SITE = '绿帆心理测评'

export function setMeta(title: string, description?: string) {
  document.title = title ? `${title} - ${SITE}` : SITE

  if (!description) return
  let el = document.querySelector('meta[name="description"]')
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', 'description')
    document.head.appendChild(el)
  }
  el.setAttribute('content', description)
}
