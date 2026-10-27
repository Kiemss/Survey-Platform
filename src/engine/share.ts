import type { SurveyPackage, SurveyResult } from './types'

/**
 * 结果分享图：canvas 绘制结果卡片并导出 PNG 下载。
 * 固定浅色视觉（分享图脱离页面主题，保证任何环境下观感一致）。
 */

const W = 640
const H = 800
const SCALE = 2 // 2x 导出保证清晰度

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = []
  let line = ''
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth) {
      lines.push(line)
      line = ch
    } else {
      line += ch
    }
  }
  if (line) lines.push(line)
  return lines
}

export function drawShareCard(pkg: SurveyPackage, result: SurveyResult): string {
  const canvas = document.createElement('canvas')
  canvas.width = W * SCALE
  canvas.height = H * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)

  // 背景
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#5b6ff0')
  grad.addColorStop(1, '#8a5cf6')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // 白色主卡片
  ctx.fillStyle = '#ffffff'
  roundRect(ctx, 36, 36, W - 72, H - 72, 24)
  ctx.fill()

  let y = 108
  ctx.textAlign = 'center'
  ctx.fillStyle = '#7a8194'
  ctx.font = '600 20px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(pkg.manifest.name, W / 2, y)

  // 结果代号
  y += 96
  ctx.fillStyle = '#1f2430'
  ctx.font = '900 72px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(result.resultId, W / 2, y)

  // 结果标题（自动换行）
  const title = pkg.results[result.resultId]?.title ?? ''
  if (title) {
    y += 52
    ctx.fillStyle = '#5b6ff0'
    ctx.font = '700 30px "PingFang SC", "Microsoft YaHei", sans-serif'
    const lines = wrapText(ctx, title, W - 160)
    for (const line of lines.slice(0, 2)) {
      ctx.fillText(line, W / 2, y)
      y += 40
    }
  }

  // 维度条：letter-pairs 用百分比对，其余用维度得分
  const barX = 120
  const barW = W - 240
  y += 26
  ctx.textAlign = 'left'

  const bars: { label: string; pct: number }[] =
    pkg.scoring.strategy === 'letter-pairs' && result.percentages
      ? pkg.scoring.pairs!.flatMap(([a, b]) => [
          { label: a, pct: (result.percentages![a] ?? 50) / 100 },
          { label: b, pct: (result.percentages![b] ?? 50) / 100 },
        ])
      : pkg.scoring.strategy === 'dimensions' && result.percentages
        ? (pkg.scoring.dimensions ?? []).map((dim) => ({
            label: dim.name,
            pct: (result.percentages![dim.id] ?? 0) / 100,
          }))
        : Object.entries(result.scores).map(([k, v]) => ({ label: k, pct: 0 }))

  for (const bar of bars) {
    if (y > H - 190) break

    ctx.fillStyle = '#7a8194'
    ctx.font = '500 18px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(bar.label, barX, y)
    ctx.textAlign = 'right'
    ctx.fillText(`${Math.round(bar.pct * 100)}%`, barX + barW, y)

    // 轨道 + 填充
    ctx.fillStyle = '#eceefc'
    roundRect(ctx, barX, y + 10, barW, 14, 7)
    ctx.fill()
    if (bar.pct > 0) {
      ctx.fillStyle = '#5b6ff0'
      roundRect(ctx, barX, y + 10, Math.max(14, barW * bar.pct), 14, 7)
      ctx.fill()
    }
    y += 52
  }

  // 底部信息
  ctx.textAlign = 'center'
  ctx.fillStyle = '#b0b6c6'
  ctx.font = '400 16px "PingFang SC", "Microsoft YaHei", sans-serif'
  const date = new Date(result.answeredAt).toLocaleDateString('zh-CN')
  ctx.fillText(`${date} · ${location.host}`, W / 2, H - 76)
  ctx.fillText('仅供自我探索参考，不构成医学诊断', W / 2, H - 52)

  return canvas.toDataURL('image/png')
}

/** 触发下载分享图 */
export function downloadShareCard(pkg: SurveyPackage, result: SurveyResult): void {
  const a = document.createElement('a')
  a.href = drawShareCard(pkg, result)
  a.download = `${result.surveyId}-${result.resultId}.png`
  a.click()
}
