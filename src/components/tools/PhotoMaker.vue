<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useFileUpload } from '@/composables/useFileUpload'

interface PhotoSize {
  name: string
  width: number
  height: number
  label: string
}

interface BgColor {
  name: string
  color: string
  gradient: string
}

const photoSizes: PhotoSize[] = [
  { name: '一寸', width: 295, height: 413, label: '25×35mm' },
  { name: '二寸', width: 413, height: 579, label: '35×49mm' },
  { name: '小一寸', width: 260, height: 378, label: '22×32mm' },
  { name: '小二寸', width: 413, height: 531, label: '35×45mm' },
  { name: '大一寸', width: 390, height: 567, label: '33×48mm' },
  { name: '大二寸', width: 413, height: 626, label: '35×53mm' },
  { name: '社保照', width: 358, height: 441, label: '26×32mm' },
  { name: '驾照', width: 260, height: 378, label: '22×32mm' },
]

const bgColors: BgColor[] = [
  { name: '白底', color: '#FFFFFF', gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)' },
  { name: '蓝底', color: '#438EDB', gradient: 'linear-gradient(135deg, #438EDB 0%, #2A7BC8 100%)' },
  { name: '红底', color: '#D9363E', gradient: 'linear-gradient(135deg, #D9363E 0%, #C42B32 100%)' },
  { name: '渐变蓝', color: '#1A6FB5', gradient: 'linear-gradient(180deg, #438EDB 0%, #1A6FB5 100%)' },
]

const selectedSize = ref<PhotoSize>(photoSizes[0])
const selectedBg = ref<BgColor>(bgColors[0])
const step = ref<'upload' | 'processing' | 'done'>('upload')
const removeProgress = ref(0)
const progressLabel = ref('')
const previewUrl = ref('')
const originalUrl = ref('')

let processedImageUrl = ''

const onFiles = (files: File[]) => {
  if (files.length > 0) {
    loadPhoto(files[0])
  }
}

const { inputRef: photoInput, isDragging, selectFiles: selectPhoto, handleDragOver, handleDragLeave, handleDrop, handleFileSelect } = useFileUpload(onFiles)

const colorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
  )
}

const getBackgroundColor = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const sampleSize = 10
  const edgePixels: { r: number, g: number, b: number }[] = []

  const topRow = ctx.getImageData(0, 0, width, sampleSize).data
  const bottomRow = ctx.getImageData(0, height - sampleSize, width, sampleSize).data
  const leftCol = ctx.getImageData(0, 0, sampleSize, height).data
  const rightCol = ctx.getImageData(width - sampleSize, 0, sampleSize, height).data

  const addPixels = (data: Uint8ClampedArray) => {
    for (let i = 0; i < data.length; i += 4) {
      edgePixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] })
    }
  }

  addPixels(topRow)
  addPixels(bottomRow)
  addPixels(leftCol)
  addPixels(rightCol)

  const colorMap = new Map<string, { count: number, r: number, g: number, b: number }>()

  edgePixels.forEach(pixel => {
    const key = `${Math.round(pixel.r / 20) * 20},${Math.round(pixel.g / 20) * 20},${Math.round(pixel.b / 20) * 20}`
    if (colorMap.has(key)) {
      const existing = colorMap.get(key)!
      existing.count++
      existing.r = (existing.r + pixel.r) / 2
      existing.g = (existing.g + pixel.g) / 2
      existing.b = (existing.b + pixel.b) / 2
    } else {
      colorMap.set(key, { count: 1, ...pixel })
    }
  })

  let maxCount = 0
  let bgColor = { r: 255, g: 255, b: 255 }

  colorMap.forEach(value => {
    if (value.count > maxCount) {
      maxCount = value.count
      bgColor = { r: Math.round(value.r), g: Math.round(value.g), b: Math.round(value.b) }
    }
  })

  return bgColor
}

const removeBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, bgColor: { r: number, g: number, b: number }, tolerance: number = 40) => {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const visited = new Uint8Array(width * height)
  const queue: number[] = []

  const sampleSize = 5
  for (let x = 0; x < width; x += Math.max(1, Math.floor(width / sampleSize))) {
    for (let y = 0; y < height; y += Math.max(1, Math.floor(height / sampleSize))) {
      const isEdge = x < sampleSize || y < sampleSize || x >= width - sampleSize || y >= height - sampleSize
      if (isEdge) {
        const idx = y * width + x
        const r = data[idx * 4]
        const g = data[idx * 4 + 1]
        const b = data[idx * 4 + 2]
        const dist = colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b)
        if (dist < tolerance * 1.5) {
          queue.push(idx)
          visited[idx] = 1
        }
      }
    }
  }

  while (queue.length > 0) {
    const idx = queue.shift()!
    const y = Math.floor(idx / width)
    const x = idx % width
    const offset = idx * 4

    const r = data[offset]
    const g = data[offset + 1]
    const b = data[offset + 2]
    const dist = colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b)

    if (dist < tolerance * 2.5) {
      const alpha = Math.max(0, Math.min(255, (dist - tolerance * 0.5) / (tolerance * 2) * 255))
      data[offset + 3] = Math.round(alpha)

      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
      ]

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx
          if (!visited[nIdx]) {
            visited[nIdx] = 1
            queue.push(nIdx)
          }
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

const loadPhoto = (file: File) => {
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    originalUrl.value = e.target?.result as string
    processImage()
  }
  reader.readAsDataURL(file)
}

const processImage = () => {
  step.value = 'processing'
  removeProgress.value = 0
  progressLabel.value = '正在识别背景...'

  const img = new Image()
  img.onload = () => {
    removeProgress.value = 20
    progressLabel.value = '正在分析背景色...'

    requestAnimationFrame(() => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      const bgColor = getBackgroundColor(ctx, img.width, img.height)
      removeProgress.value = 50
      progressLabel.value = '正在移除背景...'

      requestAnimationFrame(() => {
        removeBackground(ctx, img.width, img.height, bgColor)
        removeProgress.value = 90
        progressLabel.value = '正在生成照片...'

        if (processedImageUrl) {
          URL.revokeObjectURL(processedImageUrl)
        }

        canvas.toBlob((blob) => {
          if (blob) {
            processedImageUrl = URL.createObjectURL(blob)
            removeProgress.value = 100
            setTimeout(() => {
              step.value = 'done'
              generatePhoto()
            }, 200)
          }
        }, 'image/png')
      })
    })
  }
  img.src = originalUrl.value
}

const generatePhoto = () => {
  if (!processedImageUrl) return

  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = selectedSize.value.width
    canvas.height = selectedSize.value.height
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = selectedBg.value.color
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const imgRatio = img.width / img.height
    const targetRatio = selectedSize.value.width / selectedSize.value.height

    let drawWidth: number
    let drawHeight: number
    let offsetX: number
    let offsetY: number

    if (imgRatio > targetRatio) {
      drawHeight = canvas.height
      drawWidth = img.width * (drawHeight / img.height)
      offsetX = (canvas.width - drawWidth) / 2
      offsetY = 0
    } else {
      drawWidth = canvas.width
      drawHeight = img.height * (drawWidth / img.width)
      offsetX = 0
      offsetY = (canvas.height - drawHeight) / 2
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }

    canvas.toBlob((blob) => {
      if (blob) {
        previewUrl.value = URL.createObjectURL(blob)
      }
    }, 'image/jpeg', 0.95)
  }
  img.src = processedImageUrl
}

const downloadPhoto = () => {
  if (!previewUrl.value) return
  const a = document.createElement('a')
  a.href = previewUrl.value
  a.download = `证件照_${selectedSize.value.name}_${selectedBg.value.name}.jpg`
  a.click()
}

const clearPhoto = () => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  if (processedImageUrl) URL.revokeObjectURL(processedImageUrl)
  previewUrl.value = ''
  processedImageUrl = ''
  originalUrl.value = ''
  step.value = 'upload'
}

const selectSize = (size: PhotoSize) => {
  selectedSize.value = size
  if (step.value === 'done') {
    generatePhoto()
  }
}

const selectBg = (bg: BgColor) => {
  selectedBg.value = bg
  if (step.value === 'done') {
    generatePhoto()
  }
}

watch([selectedSize, selectedBg], () => {
  if (step.value === 'done') {
    generatePhoto()
  }
}, { deep: true })

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  if (processedImageUrl) URL.revokeObjectURL(processedImageUrl)
})
</script>

<template>
  <div class="photo-maker">
    <div class="options-bar">
      <div class="option-group">
        <div class="group-label">尺寸</div>
        <div class="size-list">
          <button
            v-for="size in photoSizes"
            :key="size.name"
            :class="['size-chip', { active: selectedSize.name === size.name }]"
            @click="selectSize(size)"
          >
            <span class="chip-name">{{ size.name }}</span>
            <span class="chip-dim">{{ size.label }}</span>
          </button>
        </div>
      </div>

      <div class="option-group">
        <div class="group-label">底色</div>
        <div class="color-list">
          <button
            v-for="bg in bgColors"
            :key="bg.name"
            :class="['color-chip', { active: selectedBg.name === bg.name }]"
            @click="selectBg(bg)"
          >
            <span class="color-dot" :style="{ background: bg.gradient }"></span>
            <span class="color-name">{{ bg.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="workspace">
      <div
        v-if="step === 'upload'"
        :class="['upload-zone', { dragging: isDragging }]"
        @click="selectPhoto"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <div class="upload-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <p class="upload-title">
          <span class="desktop-only">点击或拖拽上传照片</span>
          <span class="mobile-only">点击选择照片</span>
        </p>
        <p class="upload-hint">支持 JPG、PNG 格式，建议上传半身正面照</p>
        <div class="upload-features">
          <span class="feature-tag">自动识别背景</span>
          <span class="feature-tag">一键换底色</span>
          <span class="feature-tag">多种尺寸</span>
        </div>
      </div>

      <div v-else-if="step === 'processing'" class="processing-zone">
        <div class="processing-card">
          <div class="processing-visual">
            <div class="processing-ring">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="6"/>
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke="url(#progressGrad)" stroke-width="6"
                  stroke-linecap="round"
                  :stroke-dasharray="2 * Math.PI * 52"
                  :stroke-dashoffset="2 * Math.PI * 52 * (1 - removeProgress / 100)"
                  transform="rotate(-90 60 60)"
                />
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#7c3aed"/>
                    <stop offset="100%" stop-color="#06b6d4"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="processing-pct">{{ removeProgress }}%</div>
            </div>
          </div>
          <p class="processing-label">{{ progressLabel }}</p>
          <p class="processing-sub">基于 Canvas 实现，本地处理保护隐私</p>
        </div>
      </div>

      <div v-else class="preview-layout">
        <div class="preview-main">
          <div class="preview-card">
            <div class="card-header">
              <span class="card-title">证件照预览</span>
              <div class="card-actions">
                <button class="action-text" @click="selectPhoto">更换照片</button>
                <button class="action-text danger" @click="clearPhoto">清除</button>
              </div>
            </div>
            <div class="card-body">
              <div
                class="photo-frame"
                :style="{ background: selectedBg.gradient }"
              >
                <img
                  v-if="previewUrl"
                  :src="previewUrl"
                  alt="证件照"
                  class="photo-result"
                />
              </div>
            </div>
          </div>

          <div class="info-bar">
            <div class="info-item">
              <span class="info-key">尺寸</span>
              <span class="info-val">{{ selectedSize.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">像素</span>
              <span class="info-val">{{ selectedSize.width }} × {{ selectedSize.height }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">底色</span>
              <span class="info-val">{{ selectedBg.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">DPI</span>
              <span class="info-val">300</span>
            </div>
          </div>

          <button class="download-btn" @click="downloadPhoto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            下载证件照
          </button>
        </div>

        <div class="preview-side">
          <div class="side-card" v-if="originalUrl">
            <div class="side-title">原始照片</div>
            <div class="side-body">
              <img :src="originalUrl" alt="原始照片" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <input
      ref="photoInput"
      type="file"
      accept="image/*"
      class="hidden-input"
      @change="handleFileSelect"
    />
  </div>
</template>

<style lang="scss" scoped>
.photo-maker {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.options-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px 20px;
  @include glass-card;
  border-radius: $border-radius-lg;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: $text-muted;
  white-space: nowrap;
  min-width: 36px;
}

.size-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.size-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid $bg-muted;
  border-radius: $border-radius-sm;
  transition: $transition-fast;
  cursor: pointer;
  min-width: 56px;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba($primary, 0.12);
  }

  &.active {
    background: rgba($primary, 0.15);
    border-color: $primary;
    box-shadow: 0 0 12px rgba($primary, 0.2);
  }
}

.chip-name {
  font-size: 0.8125rem;
  font-weight: 700;
  color: $text-primary;
}

.chip-dim {
  font-size: 0.6875rem;
  color: $text-muted;
  margin-top: 1px;
}

.color-list {
  display: flex;
  gap: 10px;
}

.color-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid $bg-muted;
  border-radius: $border-radius-sm;
  transition: $transition-fast;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba($primary, 0.12);
  }

  &.active {
    background: rgba($primary, 0.15);
    border-color: $primary;
    box-shadow: 0 0 12px rgba($primary, 0.2);
  }
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid rgba($primary, 0.12);
  flex-shrink: 0;
}

.color-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: $text-primary;
}

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 380px;
  padding: 48px 24px;
  @include glass-card;
  border-radius: $border-radius-lg;
  border: 2px dashed rgba($primary, 0.12);
  cursor: pointer;
  transition: $transition-normal;

  &:hover, &.dragging {
    border-color: $primary;
    background: rgba($primary, 0.04);
  }

  &.dragging {
    transform: scale(1.005);
  }
}

.upload-icon {
  width: 56px;
  height: 56px;
  color: $text-muted;
  margin-bottom: 16px;
  opacity: 0.6;
}

.upload-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 0.8125rem;
  color: $text-muted;
  margin-bottom: 16px;
}

.upload-features {
  display: flex;
  gap: 8px;
}

.feature-tag {
  padding: 4px 12px;
  background: rgba($primary, 0.1);
  border: 1px solid rgba($primary, 0.2);
  border-radius: $border-radius-full;
  font-size: 0.75rem;
  font-weight: 600;
  color: $primary-light;
}

.processing-zone {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 380px;
  @include glass-card;
  border-radius: $border-radius-lg;
}

.processing-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px;
}

.processing-visual {
  position: relative;
}

.processing-ring {
  position: relative;
  width: 120px;
  height: 120px;

  svg {
    width: 100%;
    height: 100%;
  }
}

.processing-pct {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: $text-primary;
}

.processing-label {
  font-size: 1rem;
  font-weight: 600;
  color: $text-primary;
}

.processing-sub {
  font-size: 0.8125rem;
  color: $text-muted;
  text-align: center;
  max-width: 280px;
}

.preview-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @include respond-to('md') {
    grid-template-columns: 2fr 1fr;
  }
}

.preview-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-card {
  @include glass-card;
  border-radius: $border-radius-lg;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid $bg-muted;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: $text-primary;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.action-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: $text-secondary;
  transition: $transition-fast;
  cursor: pointer;
  background: none;
  border: none;

  &:hover {
    color: $text-primary;
  }

  &.danger:hover {
    color: $danger;
  }
}

.card-body {
  padding: 24px;
  display: flex;
  justify-content: center;
}

.photo-frame {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 295 / 413;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.photo-result {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.info-bar {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @include respond-to('sm') {
    grid-template-columns: repeat(4, 1fr);
  }
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  @include glass-card;
  border-radius: $border-radius;
}

.info-key {
  font-size: 0.6875rem;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-val {
  font-size: 0.9375rem;
  font-weight: 700;
  color: $text-primary;
}

.download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 20px;
  background: $gradient-primary;
  border-radius: $border-radius;
  color: white;
  font-size: 0.9375rem;
  font-weight: 700;
  transition: $transition-bounce;
  cursor: pointer;
  border: none;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba($primary, 0.35);
  }
}

.preview-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-card {
  @include glass-card;
  border-radius: $border-radius-lg;
  overflow: hidden;
}

.side-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: $text-primary;
  padding: 14px 18px;
  border-bottom: 1px solid $bg-muted;
}

.side-body {
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: $bg-soft;
  min-height: 160px;

  img {
    max-width: 100%;
    max-height: 240px;
    object-fit: contain;
    border-radius: 6px;
  }
}

.hidden-input {
  display: none;
}

.mobile-only {
  display: none;
}

@include respond-to-down('sm') {
  .desktop-only {
    display: none;
  }
  .mobile-only {
    display: inline;
  }
  .upload-zone {
    padding: 24px 16px;
  }
  .preview-layout {
    flex-direction: column;
  }
  .size-list {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
