/**
 * 构建期生成 public/sitemap.xml：
 * 首页 + 全部量表详情页 + 法律页。挂在 prebuild 上自动运行。
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = 'https://greensail.dpdns.org'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const surveysDir = join(root, 'src', 'data', 'surveys')

const urls = [
  { loc: `${BASE}/`, priority: '1.0' },
]

if (existsSync(surveysDir)) {
  for (const dir of readdirSync(surveysDir, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue
    const manifestPath = join(surveysDir, dir.name, 'manifest.json')
    if (!existsSync(manifestPath)) continue
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
      // 以 manifest.id 为准（与路由一致），目录名仅作兜底
      urls.push({ loc: `${BASE}/about/${manifest.id ?? dir.name}`, priority: '0.8' })
    } catch {
      urls.push({ loc: `${BASE}/about/${dir.name}`, priority: '0.8' })
    }
  }
}

urls.push(
  { loc: `${BASE}/disclaimer`, priority: '0.3' },
  { loc: `${BASE}/privacy`, priority: '0.3' },
)

const today = new Date().toISOString().slice(0, 10)
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join('\n') +
  `\n</urlset>\n`

writeFileSync(join(root, 'public', 'sitemap.xml'), xml)
console.log(`sitemap.xml 已生成：${urls.length} 个 URL`)
