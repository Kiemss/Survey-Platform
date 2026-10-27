import QRCode from 'qrcode'
import type { SurveyPackage, SurveyResult } from './types'

/**
 * 结果分享图：canvas 绘制结果卡片（含右下角二维码），优先调起系统分享面板
 * （微信/QQ/微博等均走系统分享），不支持时兜底下载 PNG。
 * 固定品牌绿视觉（分享图脱离页面主题，保证任何环境下观感一致）。
 */

const W = 640
const H = 840
const SCALE = 2 // 2x 导出保证清晰度
const BRAND = '绿帆心理测评'

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

/** 生成带二维码的结果分享图 */
export async function drawShareCard(
  pkg: SurveyPackage,
  result: SurveyResult,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = W * SCALE
  canvas.height = H * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)

  // 背景（品牌绿渐变）
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#2f6f4f')
  grad.addColorStop(1, '#67a982')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // 白色主卡片（底部留出二维码区域）
  ctx.fillStyle = '#ffffff'
  roundRect(ctx, 36, 36, W - 72, H - 150, 24)
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
    ctx.fillStyle = '#2f6f4f'
    ctx.font = '700 30px "PingFang SC", "Microsoft YaHei", sans-serif'
    const lines = wrapText(ctx, title, W - 160)
    for (const line of lines.slice(0, 2)) {
      ctx.fillText(line, W / 2, y)
      y += 40
    }
  }

  ctx.textAlign = 'left'
  const barX = 120
  const barW = W - 240

  // thresholds 量表：直接展示总分，避免画出全 0 的假条形图
  if (pkg.scoring.strategy === 'thresholds') {
    const total = result.scores[pkg.scoring.key ?? 'total'] ?? 0
    y += 30
    ctx.fillStyle = '#7a8194'
    ctx.font = '500 20px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillText('总分', barX, y)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#2f6f4f'
    ctx.font = '900 56px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillText(String(total), barX + barW, y + 14)
    y += 60
    ctx.textAlign = 'left'
  } else {
    // 维度条：letter-pairs 用百分比对，dimensions/quadrant 用维度百分比
    const bars: { label: string; pct: number }[] =
      pkg.scoring.strategy === 'letter-pairs' && result.percentages
        ? pkg.scoring.pairs!.flatMap(([a, b]) => [
            { label: a, pct: (result.percentages![a] ?? 50) / 100 },
            { label: b, pct: (result.percentages![b] ?? 50) / 100 },
          ])
        : (result.percentages
          ? (pkg.scoring.strategy === 'quadrant'
              ? (pkg.scoring.quadrant?.dimensions ?? [])
              : (pkg.scoring.dimensions ?? [])
            ).map((dim) => ({
              label: dim.name,
              pct: (result.percentages![dim.id] ?? 0) / 100,
            }))
          : [])

    for (const bar of bars) {
      if (y > H - 320) break

      ctx.fillStyle = '#7a8194'
      ctx.font = '500 18px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(bar.label, barX, y)
      ctx.textAlign = 'right'
      ctx.fillText(`${Math.round(bar.pct * 100)}%`, barX + barW, y)

      // 轨道 + 填充
      ctx.fillStyle = '#eaf3ed'
      roundRect(ctx, barX, y + 10, barW, 14, 7)
      ctx.fill()
      if (bar.pct > 0) {
        ctx.fillStyle = '#2f6f4f'
        roundRect(ctx, barX, y + 10, Math.max(14, barW * bar.pct), 14, 7)
        ctx.fill()
      }
      y += 52
    }
  }

  // 底部左侧：站名 + 日期 + 免责
  ctx.textAlign = 'left'
  const bottomY = H - 108
  ctx.fillStyle = '#1f2430'
  ctx.font = '700 24px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(BRAND, barX, bottomY)
  ctx.fillStyle = '#b0b6c6'
  ctx.font = '400 15px "PingFang SC", "Microsoft YaHei", sans-serif'
  const date = new Date(result.answeredAt).toLocaleDateString('zh-CN')
  ctx.fillText(`${date} · ${location.host}`, barX, bottomY + 26)
  ctx.fillText('仅供自我探索参考，不构成医学诊断', barX, bottomY + 48)

  // 底部右侧：二维码（指向该量表详情页，便于追溯来源）
  const qrSize = 128
  const qrX = W - 36 - qrSize - 28
  const qrY = bottomY - 56
  ctx.fillStyle = '#f6f7f9'
  roundRect(ctx, qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 10)
  ctx.fill()
  try {
    const qrCanvas = document.createElement('canvas')
    await QRCode.toCanvas(qrCanvas, `${location.origin}/about/${result.surveyId}`, {
      width: qrSize,
      margin: 0,
      color: { dark: '#1f2430', light: '#ffffff' },
    })
    ctx.drawImage(qrCanvas, qrX, qrY)
  } catch {
    // 二维码生成失败时留白，不阻塞分享
  }

  return canvas
}

export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled'

/**
 * 分享结果图：优先调起系统分享面板（微信/QQ/微博走系统分享），
 * 不支持（如桌面浏览器）时兜底下载 PNG。
 */
export async function shareResultCard(
  pkg: SurveyPackage,
  result: SurveyResult,
): Promise<ShareOutcome> {
  const canvas = await drawShareCard(pkg, result)
  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, 'image/png'),
  )
  if (!blob) return 'cancelled'

  const filename = `${result.surveyId}-${result.resultId}.png`
  const file = new File([blob], filename, { type: 'image/png' })

  // 系统分享面板（移动端可用，可直接分享图片到微信/QQ/微博）
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: pkg.manifest.name,
        text: `我在「${pkg.manifest.name}」的结果是：${result.resultId}`,
      })
      return 'shared'
    } catch (e) {
      // 用户取消分享面板不算错误
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled'
    }
  }

  // 兜底：下载 PNG
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  return 'downloaded'
}
