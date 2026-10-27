<script setup lang="ts">
import { computed } from 'vue'
import type { ResultMap, ScoringConfig } from '../engine/types'

type Band = NonNullable<ScoringConfig['bands']>[number]

const props = defineProps<{
  /** 当前总分（scoring.key 对应的计分键） */
  score: number
  /** thresholds 档位区间（覆盖 [min, max] 连续区间，自上而下匹配） */
  bands: Band[]
  /** 结果文案表，用于兜底取档位名称 */
  results: ResultMap
}>()

/* 全局刻度范围：以 bands 的最小/最大值等比铺开 */
const min = computed(() => props.bands[0]?.min ?? 0)
const max = computed(() => Math.max(...props.bands.map((b) => b.max), 0))
const span = computed(() => Math.max(1, max.value - min.value))

function toPct(v: number): number {
  return Math.min(100, Math.max(0, ((v - min.value) / span.value) * 100))
}

/** 绿→黄→橙→红 色带：按档数在色带上均匀取色（2 档即绿/红双色） */
const RAMP = ['#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444']
function rampColor(index: number, total: number): string {
  if (total <= 1) return RAMP[0]
  return RAMP[Math.round((index * (RAMP.length - 1)) / (total - 1))]
}

/** 色带渐变：每档一段实色，档位边界按分值等比定位（硬过渡） */
const gradientCss = computed(() => {
  const n = props.bands.length
  const stops = props.bands.map((b, i) => {
    const c = rampColor(i, n)
    const s = toPct(b.min)
    const e = Math.max(toPct(b.max), s + 0.5)
    return `${c} ${s}%, ${c} ${e}%`
  })
  return `linear-gradient(to right, ${stops.join(', ')})`
})

/** 档位间刻度线位置（不含首尾端点） */
const ticks = computed(() =>
  props.bands.slice(0, -1).map((b) => toPct(b.max)),
)

const pointerPct = computed(() => toPct(props.score))

/** 得分落在的档位（自上而下，取 score ≥ min 的最高档） */
const currentIndex = computed(() => {
  for (let i = props.bands.length - 1; i >= 0; i--) {
    if (props.score >= props.bands[i].min) return i
  }
  return 0
})
const currentColor = computed(() => rampColor(currentIndex.value, props.bands.length))

/* 常见档位 resultId 的短名；未登记的回退到结果文案标题 */
const SHORT_LABELS: Record<string, string> = {
  none: '无',
  normal: '正常',
  minimal: '极轻',
  mild: '轻度',
  moderate: '中度',
  modsevere: '中重度',
  severe: '重度',
  extremely_severe: '极重度',
  subclinical: '亚临床',
  clinical: '临床水平',
  low: '低',
  slightly_low: '偏低',
  extremely_low: '极低',
  mid: '中',
  medium: '中',
  elevated: '偏高',
  borderline: '临界',
  high: '高',
  extremely_high: '极高',
  attention: '需关注',
  significant: '显著',
  marked: '明显',
  good: '良好',
  poor: '较差',
}

function bandLabel(b: Band): string {
  return SHORT_LABELS[b.resultId] ?? props.results[b.resultId]?.title ?? b.resultId
}

const currentLabel = computed(() => bandLabel(props.bands[currentIndex.value]))

/** 指针贴近两端时改变数值气泡对齐方式，避免溢出裁切 */
const pointerAlign = computed(() => {
  if (pointerPct.value < 7) return 'left'
  if (pointerPct.value > 93) return 'right'
  return 'center'
})
</script>

<template>
  <div
    class="gauge"
    role="img"
    :aria-label="`得分 ${score}，处于「${currentLabel}」档`"
  >
    <div class="gauge-band" :style="{ background: gradientCss }">
      <span
        v-for="(t, i) in ticks"
        :key="i"
        class="gauge-tick"
        :style="{ left: t + '%' }"
      />
      <div class="gauge-pointer" :class="pointerAlign" :style="{ left: pointerPct + '%', color: currentColor }">
        <span class="gauge-bubble">{{ score }}</span>
        <span class="gauge-dot" />
      </div>
    </div>
    <div class="gauge-range">
      <span>{{ min }}</span>
      <span>{{ max }}</span>
    </div>
    <div class="gauge-labels">
      <span
        v-for="(b, i) in bands"
        :key="b.resultId"
        :style="{ left: ((toPct(b.min) + toPct(b.max)) / 2) + '%' }"
        >{{ bandLabel(b) }}</span
      >
    </div>
    <p class="gauge-current">当前档：<b :style="{ color: currentColor }">{{ currentLabel }}</b></p>
  </div>
</template>

<style scoped>
.gauge {
  padding-top: 26px; /* 为指针数值气泡留出空间 */
}
.gauge-band {
  position: relative;
  height: 14px;
  border-radius: 7px;
}
.gauge-tick {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
}
.gauge-pointer {
  position: absolute;
  top: 50%;
  z-index: 2;
}
.gauge-dot {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--card);
  border: 3px solid currentColor;
  box-shadow: 0 1px 4px var(--shadow);
}
.gauge-bubble {
  position: absolute;
  bottom: 6px;
  left: 0;
  transform: translate(-50%, -100%);
  background: var(--card);
  border: 1px solid var(--line);
  color: var(--text);
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  box-shadow: 0 1px 4px var(--shadow);
}
/* 两端对齐：防止气泡溢出被裁切 */
.gauge-pointer.left .gauge-bubble {
  transform: translateY(-100%);
}
.gauge-pointer.right .gauge-bubble {
  transform: translate(-100%, -100%);
}
.gauge-range {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 11px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.gauge-labels {
  position: relative;
  height: 18px;
  margin-top: 2px;
}
.gauge-labels span {
  position: absolute;
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--muted);
  white-space: nowrap;
}
.gauge-current {
  display: none;
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--muted);
  text-align: center;
}
@media (max-width: 480px) {
  .gauge-labels {
    display: none;
  }
  .gauge-current {
    display: block;
  }
}
</style>
