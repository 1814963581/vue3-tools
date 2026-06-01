<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFileUpload } from '@/composables/useFileUpload'

interface ImageFile {
  file: File
  preview: string
  name: string
  size: number
  converted?: Blob
  convertedSize?: number
  convertedName?: string
  status: 'pending' | 'processing' | 'done'
}

const supportedFormats = [
  { value: 'image/jpeg', label: 'JPG', ext: '.jpg' },
  { value: 'image/png', label: 'PNG', ext: '.png' },
  { value: 'image/webp', label: 'WEBP', ext: '.webp' },
  { value: 'image/bmp', label: 'BMP', ext: '.bmp' },
]

const imageFiles = ref<ImageFile[]>([])
const targetFormat = ref('image/jpeg')
const quality = ref(80)
const scale = ref(100)

const resetDone = () => {
  imageFiles.value.forEach(img => {
    if (img.status === 'done') {
      img.status = 'pending'
      img.converted = undefined
      img.convertedSize = undefined
      img.convertedName = undefined
    }
  })
}

watch(targetFormat, resetDone)
watch([quality, scale], resetDone)

const handleFiles = (files: File[]) => {
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        imageFiles.value.push({
          file,
          preview: e.target?.result as string,
          name: file.name,
          size: file.size,
          status: 'pending'
        })
      }
      reader.readAsDataURL(file)
    }
  })
}

const { inputRef: imageInput, isDragging, selectFiles: selectImages, handleDragOver, handleDragLeave, handleDrop, handleFileSelect } = useFileUpload(handleFiles)

const convertImage = async (img: ImageFile) => {
  img.status = 'processing'

  return new Promise<void>((resolve) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const scaleFactor = scale.value / 100
      canvas.width = Math.round(image.width * scaleFactor)
      canvas.height = Math.round(image.height * scaleFactor)

      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

      const format = supportedFormats.find(f => f.value === targetFormat.value)!
      const baseName = img.name.replace(/\.[^.]+$/, '')
      const qualityVal = targetFormat.value === 'image/png' || targetFormat.value === 'image/bmp' ? undefined : quality.value / 100

      canvas.toBlob(
        (blob) => {
          if (blob) {
            img.converted = blob
            img.convertedSize = blob.size
            img.convertedName = baseName + format.ext
            img.status = 'done'
          }
          resolve()
        },
        targetFormat.value,
        qualityVal
      )
    }
    image.src = img.preview
  })
}

const convertAll = async () => {
  const pending = imageFiles.value.filter(img => img.status === 'pending')
  for (const img of pending) {
    await convertImage(img)
  }
}

const downloadImage = (img: ImageFile) => {
  if (!img.converted) return
  const url = URL.createObjectURL(img.converted)
  const a = document.createElement('a')
  a.href = url
  a.download = img.convertedName || img.name
  a.click()
  URL.revokeObjectURL(url)
}

const downloadAll = () => {
  imageFiles.value.forEach(img => {
    if (img.converted) {
      downloadImage(img)
    }
  })
}

const removeImage = (index: number) => {
  const img = imageFiles.value[index]
  if (img.preview) {
    URL.revokeObjectURL(img.preview)
  }
  imageFiles.value.splice(index, 1)
}

const clearAll = () => {
  imageFiles.value.forEach(img => {
    if (img.preview) {
      URL.revokeObjectURL(img.preview)
    }
  })
  imageFiles.value = []
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const pendingCount = () => imageFiles.value.filter(img => img.status === 'pending').length
const doneCount = () => imageFiles.value.filter(img => img.status === 'done').length
const getExt = (name: string) => name.split('.').pop()?.toUpperCase()
const sizePercentChange = (original: number, converted: number): string => {
  const change = ((converted - original) / original * 100)
  const sign = change > 0 ? '+' : ''
  return sign + change.toFixed(0) + '%'
}
</script>

<template>
  <div class="image-converter">
    <div class="toolbar">
      <button class="tool-btn primary" @click="selectImages">
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        选择图片
      </button>
      <button
        v-if="imageFiles.length > 0"
        class="tool-btn"
        @click="clearAll"
      >
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        清空
      </button>
      <button
        v-if="imageFiles.length > 0 && pendingCount() > 0"
        class="tool-btn accent"
        @click="convertAll"
      >
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        转换全部
      </button>
      <button
        v-if="doneCount() > 0"
        class="tool-btn download"
        @click="downloadAll"
      >
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        下载全部 ({{ doneCount() }})
      </button>
    </div>

    <div class="options-section">
      <div class="option-group">
        <label class="option-label">目标格式</label>
        <div class="format-buttons">
          <button
            v-for="format in supportedFormats"
            :key="format.value"
            :class="['format-btn', { active: targetFormat === format.value }]"
            @click="targetFormat = format.value"
          >
            {{ format.label }}
          </button>
        </div>
      </div>

      <div v-if="targetFormat !== 'image/png' && targetFormat !== 'image/bmp'" class="option-group">
        <label class="option-label">
          <span>质量</span>
          <span class="option-value">{{ quality }}%</span>
        </label>
        <input
          type="range"
          v-model.number="quality"
          min="10"
          max="100"
          class="quality-slider"
        />
      </div>

      <div class="option-group">
        <label class="option-label">
          <span>输出尺寸</span>
          <span class="option-value">{{ scale }}%</span>
        </label>
        <input
          type="range"
          v-model.number="scale"
          min="10"
          max="100"
          step="5"
          class="quality-slider"
        />
      </div>

      <div v-if="targetFormat === 'image/png'" class="format-hint">
        <svg class="hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        PNG 为无损格式，无质量参数。可通过上方"输出尺寸"缩小分辨率来减小体积。
      </div>
      <div v-if="targetFormat === 'image/bmp'" class="format-hint">
        <svg class="hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        BMP 为无损格式，无质量参数。可通过上方"输出尺寸"缩小分辨率来减小体积。
      </div>
    </div>

    <input
      ref="imageInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden-input"
      @change="handleFileSelect"
    />

    <div
      v-if="imageFiles.length === 0"
      :class="['drop-zone', { dragging: isDragging }]"
      @click="selectImages"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="drop-icon">
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <polyline points="8.5 13.5 2.5 3.01 14.5 12 4.5 6"/>
        </svg>
      </div>
      <p class="drop-text">
        <span class="desktop-only">拖拽图片到此处，或点击选择</span>
        <span class="mobile-only">点击选择图片</span>
      </p>
      <p class="drop-hint">支持 JPG、PNG、WebP、BMP 格式互转</p>
    </div>

    <div v-else class="images-grid">
      <div
        v-for="(img, index) in imageFiles"
        :key="index"
        class="image-card"
        :class="{ done: img.status === 'done' }"
      >
        <div class="image-preview">
          <img :src="img.preview" :alt="img.name" />
          <div v-if="img.status === 'processing'" class="processing-overlay">
            <div class="spinner"></div>
          </div>
        </div>

        <div class="image-info">
          <div class="image-name" :title="img.name">{{ img.name }}</div>

          <div class="size-row">
            <span class="original-format">{{ getExt(img.name) }}</span>
            <span class="arrow">→</span>
            <span class="target-format">{{ supportedFormats.find(f => f.value === targetFormat)?.label }}</span>
          </div>

          <div v-if="img.status === 'done' && img.convertedSize" class="size-change">
            <span class="original-size">{{ formatSize(img.size) }}</span>
            <span class="arrow">→</span>
            <span class="converted-size" :class="{ larger: img.convertedSize > img.size, smaller: img.convertedSize < img.size }">
              {{ formatSize(img.convertedSize) }}
            </span>
            <span class="size-percent" :class="{ larger: img.convertedSize > img.size, smaller: img.convertedSize < img.size }">
              ({{ sizePercentChange(img.size, img.convertedSize) }})
            </span>
          </div>

          <div class="image-actions">
            <button
              v-if="img.status === 'pending'"
              class="action-btn convert"
              @click="convertImage(img)"
            >
              转换
            </button>
            <button
              v-if="img.status === 'done'"
              class="action-btn download"
              @click="downloadImage(img)"
            >
              下载
            </button>
            <button
              class="action-btn remove"
              @click="removeImage(index)"
            >
              删除
            </button>
          </div>
        </div>
      </div>

      <div class="add-more-card" @click="selectImages">
        <div class="add-icon">+</div>
        <span>添加更多</span>
      </div>
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

.image-converter {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 16px;
  @include glass-card;
  border-radius: $border-radius-lg;
}

.tool-btn {
  padding: 10px 18px;
  background: $bg-soft;
  border-radius: $border-radius;
  color: $text-secondary;
  font-size: 0.875rem;
  font-weight: 600;
  transition: $transition-bounce;

  &:hover {
    background: rgba($primary, 0.08);
    color: $text-primary;
  }

  &.primary {
    background: $gradient-primary;
    color: white;

    &:hover {
      transform: scale(1.02);
    }
  }

  &.accent {
    background: $gradient-secondary;
    color: white;

    &:hover {
      transform: scale(1.02);
    }
  }

  &.download {
    background: $success;
    color: white;
  }
}

.options-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  padding: 14px 16px;
  @include glass-card;
  border-radius: $border-radius-lg;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-label {
  font-size: 0.75rem;
  color: $text-muted;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-value {
  font-weight: 600;
  font-size: 0.875rem;
  color: $text-primary;
}

.format-buttons {
  display: flex;
  gap: 8px;
}

.format-btn {
  padding: 8px 16px;
  background: $bg-soft;
  border: 1px solid rgba($primary, 0.08);
  border-radius: $border-radius;
  color: $text-secondary;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: $transition-fast;
  cursor: pointer;

  &:hover {
    background: rgba($primary, 0.08);
    border-color: rgba($primary, 0.12);
  }

  &.active {
    background: rgba($primary, 0.15);
    border-color: $primary;
    color: $text-primary;
    box-shadow: 0 0 12px rgba($primary, 0.2);
  }
}

.quality-slider {
  width: 200px;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba($primary, 0.08);
  border-radius: 2px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: $gradient-primary;
    border-radius: 50%;
    cursor: pointer;
  }
}

.format-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: $border-radius;
  color: #b45309;
  font-size: 0.8125rem;
  line-height: 1.5;
}

.hint-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.hidden-input {
  display: none;
}

.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 300px;
  padding: 40px 20px;
  @include glass-card;
  border-radius: $border-radius-lg;
  border: 2px dashed rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: $transition-normal;

  &:hover, &.dragging {
    border-color: $primary;
    background: rgba($primary, 0.05);
  }

  &.dragging {
    transform: scale(1.01);
  }
}

.drop-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
  line-height: 1;
}

.drop-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 8px;
}

.drop-hint {
  font-size: 0.875rem;
  color: $text-muted;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.image-card {
  @include glass-card;
  border-radius: $border-radius-lg;
  overflow: hidden;
  transition: $transition-normal;

  &.done {
    border: 1px solid rgba(34, 197, 94, 0.3);
  }
}

.image-preview {
  position: relative;
  aspect-ratio: 16 / 10;
  background: rgba(0, 0, 0, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.processing-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.image-info {
  padding: 14px;
}

.image-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.size-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  margin-bottom: 6px;
}

.original-format {
  padding: 2px 8px;
  background: rgba($primary, 0.08);
  border-radius: $border-radius-full;
  color: $text-secondary;
  font-weight: 600;
}

.arrow {
  color: $text-muted;
}

.target-format {
  padding: 2px 8px;
  background: rgba($primary, 0.2);
  border-radius: $border-radius-full;
  color: $primary-light;
  font-weight: 600;
}

.size-change {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.6875rem;
  margin-bottom: 8px;
}

.original-size {
  color: $text-muted;
}

.converted-size {
  color: $success;
  font-weight: 600;

  &.larger {
    color: #ef4444;
  }

  &.smaller {
    color: $success;
  }
}

.size-percent {
  font-size: 0.625rem;
  color: $success;

  &.larger {
    color: #ef4444;
  }

  &.smaller {
    color: $success;
  }
}

.image-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  flex: 1;
  padding: 7px 10px;
  border-radius: $border-radius;
  font-size: 0.75rem;
  font-weight: 600;
  transition: $transition-fast;

  &.convert {
    background: $gradient-primary;
    color: white;
  }

  &.download {
    background: rgba(34, 197, 94, 0.2);
    color: $success;
  }

  &.remove {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  &:hover {
    transform: scale(1.03);
  }
}

.add-more-card {
  @include glass-card;
  border-radius: $border-radius-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  cursor: pointer;
  transition: $transition-normal;
  min-height: 200px;
  border: 2px dashed rgba($primary, 0.08);

  &:hover {
    border-color: $primary;
    background: rgba($primary, 0.05);
  }

  .add-icon {
    font-size: 2.5rem;
    color: $text-muted;
  }

  span {
    font-size: 0.875rem;
    color: $text-muted;
  }
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
  .drop-zone {
    padding: 24px 16px;
  }
  .format-buttons {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
