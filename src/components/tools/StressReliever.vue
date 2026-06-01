<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

type ShapeType = 'circle' | 'square' | 'triangle' | 'star' | 'hexagon' | 'diamond'
type GameState = 'idle' | 'playing' | 'won' | 'lost'
type GameMode = 'relaxed' | 'timed'

interface ShapeDef {
  color: string
  label: string
  draw: (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => void
  hitTest: (mx: number, my: number, cx: number, cy: number, size: number) => boolean
}

const SHAPES: Record<ShapeType, ShapeDef> = {
  circle: {
    color: '#4F7CFF',
    label: '圆形',
    draw(ctx, cx, cy, s) {
      ctx.beginPath()
      ctx.arc(cx, cy, s * 0.55, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 2
      ctx.stroke()
    },
    hitTest(mx, my, cx, cy, s) {
      return Math.hypot(mx - cx, my - cy) <= s * 0.55 + 6
    },
  },
  square: {
    color: '#FB923C',
    label: '方形',
    draw(ctx, cx, cy, s) {
      const h = s * 0.48
      ctx.beginPath()
      ctx.roundRect(cx - h, cy - h, h * 2, h * 2, 6)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 2
      ctx.stroke()
    },
    hitTest(mx, my, cx, cy, s) {
      const h = s * 0.48 + 6
      return Math.abs(mx - cx) <= h && Math.abs(my - cy) <= h
    },
  },
  triangle: {
    color: '#10B981',
    label: '三角',
    draw(ctx, cx, cy, s) {
      const r = s * 0.5
      ctx.beginPath()
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx + r * 0.866, cy + r * 0.5)
      ctx.lineTo(cx - r * 0.866, cy + r * 0.5)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 2
      ctx.stroke()
    },
    hitTest(mx, my, cx, cy, s) {
      return pointInTriangle(mx, my, cx, cy, s * 0.5)
    },
  },
  star: {
    color: '#F59E0B',
    label: '星形',
    draw(ctx, cx, cy, s) {
      drawStar(ctx, cx, cy, s * 0.5, s * 0.2, 5)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 2
      ctx.stroke()
    },
    hitTest(mx, my, cx, cy, s) {
      return Math.hypot(mx - cx, my - cy) <= s * 0.5 + 6
    },
  },
  hexagon: {
    color: '#8B5CF6',
    label: '六边',
    draw(ctx, cx, cy, s) {
      const r = s * 0.5
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2
        const px = cx + Math.cos(angle) * r
        const py = cy + Math.sin(angle) * r
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 2
      ctx.stroke()
    },
    hitTest(mx, my, cx, cy, s) {
      return Math.hypot(mx - cx, my - cy) <= s * 0.5 + 6
    },
  },
  diamond: {
    color: '#EF4444',
    label: '菱形',
    draw(ctx, cx, cy, s) {
      const r = s * 0.5
      ctx.beginPath()
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx + r * 0.7, cy)
      ctx.lineTo(cx, cy + r)
      ctx.lineTo(cx - r * 0.7, cy)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 2
      ctx.stroke()
    },
    hitTest(mx, my, cx, cy, s) {
      const r = s * 0.5 + 6
      return Math.abs(mx - cx) / (r * 0.7) + Math.abs(my - cy) / r <= 1
    },
  },
}

type ShapeTypeArray = ShapeType[]
const LEVELS: ShapeTypeArray[] = [
  ['circle', 'square', 'triangle'],
  ['circle', 'square', 'triangle', 'star'],
  ['circle', 'square', 'triangle', 'star', 'hexagon'],
  ['circle', 'square', 'triangle', 'star', 'hexagon', 'diamond'],
]
const LEVEL_TIMES = [0, 0, 90, 75]

interface ShapeItem {
  id: number
  type: ShapeType
  x: number
  y: number
  targetX: number
  targetY: number
  size: number
  placed: boolean
  animating: boolean
}

interface PopText {
  x: number
  y: number
  text: string
  opacity: number
  life: number
}

function pointInTriangle(px: number, py: number, cx: number, cy: number, r: number): boolean {
  const x1 = cx, y1 = cy - r, x2 = cx + r * 0.866, y2 = cy + r * 0.5, x3 = cx - r * 0.866, y3 = cy + r * 0.5
  const margin = 8
  const minX = Math.min(x1, x2, x3) - margin, maxX = Math.max(x1, x2, x3) + margin
  const minY = Math.min(y1, y2, y3) - margin, maxY = Math.max(y1, y2, y3) + margin
  if (px < minX || px > maxX || py < minY || py > maxY) return false
  const d1 = sign(px, py, x1, y1, x2, y2)
  const d2 = sign(px, py, x2, y2, x3, y3)
  const d3 = sign(px, py, x3, y3, x1, y1)
  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0)
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0)
  return !(hasNeg && hasPos)
}

function sign(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
  return (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3)
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, points: number) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = (Math.PI / points) * i - Math.PI / 2
    const px = cx + Math.cos(angle) * r
    const py = cy + Math.sin(angle) * r
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
  }
  ctx.closePath()
}

function drawShapeOutline(ctx: CanvasRenderingContext2D, type: ShapeType, cx: number, cy: number, size: number) {
  ctx.save()
  ctx.strokeStyle = 'rgba(120,120,120,0.2)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  switch (type) {
    case 'circle':
      ctx.arc(cx, cy, size * 0.55, 0, Math.PI * 2)
      break
    case 'square': {
      const h = size * 0.48
      ctx.roundRect(cx - h, cy - h, h * 2, h * 2, 6)
      break
    }
    case 'triangle': {
      const r = size * 0.5
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx + r * 0.866, cy + r * 0.5)
      ctx.lineTo(cx - r * 0.866, cy + r * 0.5)
      ctx.closePath()
      break
    }
    case 'star':
      drawStar(ctx, cx, cy, size * 0.5, size * 0.2, 5)
      break
    case 'hexagon': {
      const r = size * 0.5
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2
        const px = cx + Math.cos(angle) * r
        const py = cy + Math.sin(angle) * r
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
    }
    case 'diamond': {
      const r = size * 0.5
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx + r * 0.7, cy)
      ctx.lineTo(cx, cy + r)
      ctx.lineTo(cx - r * 0.7, cy)
      ctx.closePath()
      break
    }
  }
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}

const gameState = ref<GameState>('idle')
const gameMode = ref<GameMode>('relaxed')
const currentLevel = ref(1)
const score = ref(0)
const timeLeft = ref(0)
const totalItems = ref(0)
const placedCount = ref(0)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let animId = 0
let width = 0
let height = 0
let dpr = 1
let timerInterval = 0

let items: ShapeItem[] = []
let popTexts: PopText[] = []
let bgParticles: { x: number; y: number; vx: number; vy: number; opacity: number; r: number }[] = []
let boxX = 0
let boxY = 0
let boxW = 0
let boxH = 0
let slotSize = 0

let nextItemId = 1

function resizeCanvas() {
  const canvas = canvasRef.value
  const wrapper = wrapperRef.value
  if (!canvas || !wrapper) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  const rect = wrapper.getBoundingClientRect()
  width = rect.width
  height = rect.height
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function generateLevel(levelIdx: number) {
  if (width <= 0 || height <= 0) return
  const shapeTypes = LEVELS[levelIdx]
  items = []
  popTexts = []
  bgParticles = []

  computeSlotLayout(shapeTypes)
  scrambleShapes(shapeTypes)

  placedCount.value = 0
  totalItems.value = shapeTypes.length

  const time = LEVEL_TIMES[levelIdx]
  if (time > 0) {
    gameMode.value = 'timed'
    timeLeft.value = time
  } else {
    gameMode.value = 'relaxed'
    timeLeft.value = 0
  }
}

function computeSlotLayout(shapeTypes: ShapeTypeArray) {
  slotSize = Math.min(width / (shapeTypes.length + 1), 60)

  const cols = shapeTypes.length
  boxW = cols * (slotSize + 16) + 30
  boxH = slotSize + 54

  boxX = (width - boxW) / 2
  boxY = height - boxH - 16

  for (let i = 0; i < shapeTypes.length; i++) {
    const sx = boxX + 20 + i * (slotSize + 16) + slotSize / 2
    const sy = boxY + slotSize / 2 + 8
    items.push({
      id: nextItemId++,
      type: shapeTypes[i],
      x: 0,
      y: 0,
      targetX: sx,
      targetY: sy,
      size: slotSize * 0.85,
      placed: false,
      animating: false,
    })
  }
}

function scrambleShapes(_shapeTypes: ShapeTypeArray) {
  const marginX = 60
  const marginY = 30
  const areaH = boxY - marginY - 30
  const areaW = width - marginX * 2

  const cols = Math.ceil(Math.sqrt(items.length))
  const rows = Math.ceil(items.length / cols)
  const cellW = areaW / cols
  const cellH = areaH / rows

  for (let i = 0; i < items.length; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const baseX = marginX + cellW * (col + 0.5)
    const baseY = marginY + cellH * (row + 0.5)
    items[i].x = baseX + rand(-cellW * 0.2, cellW * 0.2)
    items[i].y = baseY + rand(-cellH * 0.2, cellH * 0.2)
  }
}

async function startGame() {
  score.value = 0
  currentLevel.value = 1
  gameState.value = 'playing'
  await nextTick()
  resizeCanvas()
  generateLevel(0)
  startTimerIfNeeded()
}

function nextLevel() {
  currentLevel.value++
  if (currentLevel.value > LEVELS.length) {
    gameState.value = 'won'
    stopTimer()
    return
  }
  generateLevel(currentLevel.value - 1)
  gameState.value = 'playing'
  startTimerIfNeeded()
}

function startTimerIfNeeded() {
  stopTimer()
  if (gameMode.value === 'timed' && timeLeft.value > 0) {
    timerInterval = window.setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0) {
        timeLeft.value = 0
        gameState.value = 'lost'
        stopTimer()
      }
    }, 1000)
  }
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = 0
  }
}

function addPopText(x: number, y: number, text: string) {
  popTexts.push({ x, y, text, opacity: 1, life: 1 })
}

function spawnParticles(x: number, y: number, _color: string) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 1.5 + Math.random() * 3
    bgParticles.push({
      x, y,
      r: 2 + Math.random() * 4,
      opacity: 0.9,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    })
  }
}

function handleClick(e: MouseEvent) {
  if (gameState.value !== 'playing') return
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top

  for (const item of items) {
    if (item.placed || item.animating) continue
    const def = SHAPES[item.type]
    if (def.hitTest(mx, my, item.x, item.y, item.size)) {
      item.animating = true
      item.placed = true
      score.value += 10
      placedCount.value++
      addPopText(item.x, item.y - 10, '+10')
      spawnParticles(item.x, item.y, def.color)
      if (placedCount.value === totalItems.value) {
        const bonus = gameMode.value === 'timed' ? timeLeft.value * 2 : 50
        score.value += bonus
        setTimeout(() => {
          if (gameState.value === 'playing') nextLevel()
        }, 900)
      }
      return
    }
  }
}

function drawingLoop() {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)

  drawBackground()
  drawStorageBox()

  for (const item of items) {
    if (item.placed && item.animating) {
      item.x = lerp(item.x, item.targetX, 0.13)
      item.y = lerp(item.y, item.targetY, 0.13)
      if (Math.abs(item.x - item.targetX) < 0.4 && Math.abs(item.y - item.targetY) < 0.4) {
        item.x = item.targetX
        item.y = item.targetY
        item.animating = false
      }
    }

    if (item.placed) {
      drawShapeInSlot(item)
    }

    if (!item.placed) {
      drawScatteredShape(item)
    }
  }

  updateAndDrawParticles()
  drawPopTexts()

  animId = requestAnimationFrame(drawingLoop)
}

function drawBackground() {
  if (!ctx) return
  ctx.fillStyle = '#f5f0ea'
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = 'rgba(180,160,140,0.1)'
  ctx.lineWidth = 0.5
  const gs = 32
  for (let x = gs; x < width; x += gs) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
  }
  for (let y = gs; y < height; y += gs) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
  }
}

function drawStorageBox() {
  if (!ctx) return

  ctx.fillStyle = '#e8dfd2'
  ctx.beginPath()
  ctx.roundRect(boxX, boxY, boxW, boxH, 12)
  ctx.fill()
  ctx.strokeStyle = '#c4b8a8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(boxX, boxY, boxW, boxH, 12)
  ctx.stroke()

  ctx.fillStyle = '#d6ccbd'
  const innerPad = 10
  ctx.beginPath()
  ctx.roundRect(boxX + innerPad, boxY + innerPad, boxW - innerPad * 2, boxH - innerPad * 2, 8)
  ctx.fill()

  ctx.fillStyle = 'rgba(140,130,115,0.6)'
  ctx.font = 'bold 11px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('收纳盒', boxX + boxW / 2, boxY + 13)

  for (const item of items) {
    const sx = item.targetX
    const sy = item.targetY

    ctx.strokeStyle = item.placed ? 'rgba(16,185,129,0.3)' : 'rgba(120,120,120,0.15)'
    ctx.lineWidth = item.placed ? 2 : 1
    ctx.setLineDash(item.placed ? [] : [3, 3])
    ctx.beginPath()
    ctx.roundRect(sx - slotSize * 0.48, sy - slotSize * 0.48, slotSize * 0.96, slotSize * 0.96, 4)
    ctx.stroke()
    ctx.setLineDash([])

    if (!item.placed) {
      drawShapeOutline(ctx, item.type, sx, sy, slotSize * 0.85)
    }
  }
}

function drawShapeInSlot(item: ShapeItem) {
  if (!ctx) return
  const def = SHAPES[item.type]
  ctx.save()
  ctx.fillStyle = def.color
  ctx.globalAlpha = 0.9
  def.draw(ctx, item.x, item.y, item.size)

  if (item.animating) {
    ctx.globalAlpha = 1
  }
  ctx.restore()
}

function drawScatteredShape(item: ShapeItem) {
  if (!ctx) return
  const def = SHAPES[item.type]

  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  ctx.beginPath()
  ctx.arc(item.x + 2, item.y + 2, item.size * 0.6, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = def.color
  ctx.shadowColor = 'rgba(0,0,0,0.1)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 2
  def.draw(ctx, item.x, item.y, item.size)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.beginPath()
  ctx.arc(item.x - item.size * 0.15, item.y - item.size * 0.2, item.size * 0.2, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,165,0,0.4)'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 4])
  ctx.beginPath()
  ctx.arc(item.x, item.y, item.size * 0.65, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}

function updateAndDrawParticles() {
  if (!ctx) return
  for (let i = bgParticles.length - 1; i >= 0; i--) {
    const p = bgParticles[i]
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.05
    p.opacity -= 0.022
    if (p.opacity <= 0) { bgParticles.splice(i, 1); continue }
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(79,124,255,${p.opacity})`
    ctx.fill()
  }
}

function drawPopTexts() {
  if (!ctx) return
  for (let i = popTexts.length - 1; i >= 0; i--) {
    const pt = popTexts[i]
    pt.y -= 1.1
    pt.life -= 0.018
    pt.opacity = pt.life
    if (pt.life <= 0) { popTexts.splice(i, 1); continue }
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.fillStyle = `rgba(79,124,255,${pt.opacity})`
    ctx.textAlign = 'center'
    ctx.fillText(pt.text, pt.x, pt.y)
  }
}

let resizeObs: ResizeObserver | null = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d', { alpha: false })!
  resizeCanvas()
  animId = requestAnimationFrame(drawingLoop)
  resizeObs = new ResizeObserver(() => { resizeCanvas() })
  if (wrapperRef.value) resizeObs.observe(wrapperRef.value)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  stopTimer()
  resizeObs?.disconnect()
})

const progressPercent = computed(() =>
  totalItems.value > 0 ? Math.round((placedCount.value / totalItems.value) * 100) : 0,
)

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

const levelName = computed(() => {
  if (gameMode.value === 'timed') return `关卡 ${currentLevel.value} · 限时`
  return `关卡 ${currentLevel.value}`
})
</script>

<template>
  <div class="tidy-game">
    <div class="toolbar">
      <div class="toolbar-left">
        <span class="level-badge">{{ levelName }}</span>
        <span v-if="gameMode === 'timed' && gameState === 'playing'" class="timer-badge" :class="{ urgent: timeLeft <= 15 }">
          ⏱ {{ formattedTime }}
        </span>
      </div>
      <div class="toolbar-center">
        <span class="score-badge">⭐ {{ score }}</span>
      </div>
      <div class="toolbar-right">
        <span class="progress-text">{{ placedCount }} / {{ totalItems }}</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
        </div>
      </div>
    </div>

    <div ref="wrapperRef" class="canvas-wrapper">
      <canvas ref="canvasRef" class="game-canvas" @click="handleClick"></canvas>

      <div v-if="gameState === 'idle'" class="start-screen">
        <div class="start-content">
          <div class="start-icon">
            <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.213-3.213c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.61-1.61a2.404 2.404 0 0 1 1.705-.707c.618 0 1.234.236 1.704.706l1.568 1.568c.24.241.566.349.878.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.213 3.213c-.464.18-.894.527-.967 1.02z"/>
            </svg>
          </div>
          <h2 class="start-title">形状分类收纳</h2>
          <p class="start-desc">
            将散落的<span class="hl">几何形状</span>放入收纳盒<br />
            每个形状都有专属的<span class="hl">凹槽位置</span><br />
            全部归位即可过关 <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </p>
          <div class="shape-preview">
            <span class="preview-item" style="color:#4F7CFF">●</span>
            <span class="preview-item" style="color:#FB923C">■</span>
            <span class="preview-item" style="color:#10B981">▲</span>
            <span class="preview-item" style="color:#F59E0B">★</span>
            <span class="preview-item" style="color:#8B5CF6">⬡</span>
            <span class="preview-item" style="color:#EF4444">◆</span>
          </div>
          <button class="start-btn" @click="startGame">
            <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.213-3.213c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.61-1.61a2.404 2.404 0 0 1 1.705-.707c.618 0 1.234.236 1.704.706l1.568 1.568c.24.241.566.349.878.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.213 3.213c-.464.18-.894.527-.967 1.02z"/>
            </svg>
            开始分类
          </button>
          <p class="mode-hint">共 {{ LEVELS.length }} 关，形状逐步增加</p>
        </div>
      </div>

      <div v-if="gameState === 'won'" class="overlay won-overlay">
        <div class="overlay-content">
          <div class="overlay-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></div>
          <h2>全部分类完成！</h2>
          <p class="big-score">{{ score }}</p>
          <p>最终得分</p>
          <button class="start-btn" @click="startGame"><svg style="width:1.1em;height:1.1em;vertical-align:-0.15em;display:inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> 再来一次</button>
        </div>
      </div>

      <div v-if="gameState === 'lost'" class="overlay lost-overlay">
        <div class="overlay-content">
          <div class="overlay-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          <h2>时间到！</h2>
          <p class="big-score">{{ placedCount }} / {{ totalItems }}</p>
          <p>已完成</p>
          <button class="start-btn" @click="startGame"><svg style="width:1.1em;height:1.1em;vertical-align:-0.15em;display:inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> 重新挑战</button>
        </div>
      </div>

      <div v-if="gameState === 'playing' && progressPercent === 100 && placedCount === totalItems" class="overlay next-overlay">
        <div class="overlay-content">
          <div class="overlay-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="7.5 12 10.5 15 16.5 9"/></svg></div>
          <h2>本关完成！</h2>
          <p class="big-score" style="font-size: 2rem;">+{{ gameMode === 'timed' ? timeLeft * 2 : 50 }} 奖励</p>
        </div>
      </div>
    </div>

    <div class="hints">
      <span class="hint-item"><svg style="width:1em;height:1em;vertical-align:-0.15em;display:inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="20" rx="6"/><line x1="6" y1="7" x2="6" y2="11"/></svg> 点击形状 → 自动归位</span>
      <span class="hint-item"><svg style="width:1em;height:1em;vertical-align:-0.15em;display:inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> 每个形状有专属凹槽</span>
      <span class="hint-item"><svg class="inline-svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg> 橙色虚线 = 待整理</span>
      <span class="hint-item"><svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> 全部归位进入下一关</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.inline-svg {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  display: inline-block;
}

.tidy-game {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  min-height: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 16px;
  @include glass-card;
  border-radius: $border-radius-lg;
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-center {
  display: flex;
  align-items: center;
}

.level-badge {
  font-size: 0.8125rem;
  font-weight: 600;
  color: $primary;
  padding: 4px 12px;
  background: rgba($primary, 0.08);
  border-radius: $border-radius-full;
}

.timer-badge {
  font-size: 0.8125rem;
  font-weight: 600;
  color: $warning;
  padding: 4px 10px;
  background: rgba($warning, 0.1);
  border-radius: $border-radius-full;
  transition: color 0.3s, background 0.3s;

  &.urgent {
    color: $danger;
    background: rgba($danger, 0.12);
    animation: urgent-pulse 0.6s ease-in-out infinite;
  }
}

@keyframes urgent-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.score-badge {
  font-size: 1rem;
  font-weight: 700;
  color: $accent;
}

.progress-text {
  font-size: 0.75rem;
  color: $text-muted;
  white-space: nowrap;
}

.progress-bar {
  width: 100px;
  height: 6px;
  background: $bg-soft;
  border-radius: 3px;
  overflow: hidden;

  @include respond-to('sm') {
    width: 140px;
  }
}

.progress-fill {
  height: 100%;
  background: $gradient-primary;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  @include glass-card;
  border-radius: $border-radius-lg;
  overflow: hidden;
  min-height: 400px;
  max-height: 640px;
  user-select: none;
}

.game-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  cursor: pointer;
}

.start-screen {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f0ea;
}

.start-content {
  text-align: center;
  max-width: 380px;
  padding: 24px;
}

.start-icon {
  font-size: 3.5rem;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.start-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: $text-primary;
  margin-bottom: 16px;
}

.start-desc {
  font-size: 0.9375rem;
  color: $text-secondary;
  line-height: 1.8;
  margin-bottom: 24px;

  .hl {
    color: $primary;
    font-weight: 600;
  }
}

.shape-preview {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-bottom: 28px;
  font-size: 1.5rem;

  .preview-item {
    animation: float 2.5s ease-in-out infinite;
    &:nth-child(2) { animation-delay: -0.3s; }
    &:nth-child(3) { animation-delay: -0.6s; }
    &:nth-child(4) { animation-delay: -0.9s; }
    &:nth-child(5) { animation-delay: -1.2s; }
    &:nth-child(6) { animation-delay: -1.5s; }
  }
}

.mode-hint {
  font-size: 0.8125rem;
  color: $text-muted;
  margin-top: 14px;
}

.start-btn {
  padding: 14px 36px;
  background: $gradient-primary;
  color: white;
  font-size: 1.0625rem;
  font-weight: 700;
  border-radius: $border-radius-full;
  transition: $transition-bounce;
  box-shadow: 0 4px 16px rgba($primary, 0.3);
  border: none;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 8px 24px rgba($primary, 0.35);
  }

  &:active { transform: scale(0.97); }
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: overlay-in 0.3s ease;
}

@keyframes overlay-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.won-overlay { background: rgba(245, 240, 234, 0.9); backdrop-filter: blur(8px); }
.lost-overlay { background: rgba(245, 240, 234, 0.9); backdrop-filter: blur(8px); }
.next-overlay { background: rgba(245, 240, 234, 0.75); backdrop-filter: blur(4px); pointer-events: none; }

.overlay-content {
  text-align: center;

  h2 {
    font-size: 1.75rem;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: 12px;
  }

  p {
    color: $text-secondary;
    font-size: 0.9375rem;
  }
}

.overlay-icon {
  font-size: 4rem;
  margin-bottom: 12px;
}

.big-score {
  font-size: 3rem !important;
  font-weight: 800 !important;
  color: $primary !important;
  margin-bottom: 4px;
}

.hints {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 0 4px;
}

.hint-item {
  font-size: 0.8125rem;
  color: $text-muted;
}

@include respond-to-down('sm') {
  .tidy-game {
    padding: 16px;
  }
  .canvas-wrapper {
    min-height: 200px;
  }
}
</style>