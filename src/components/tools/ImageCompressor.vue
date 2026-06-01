<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFileUpload } from '@/composables/useFileUpload'

interface ImageFile {
  file: File
  preview: string
  name: string
  size: number
  compressed?: Blob
  compressedSize?: number
  status: 'pending' | 'processing' | 'done'
}

const imageFiles = ref<ImageFile[]>([])
const quality = ref(80)
const maxWidth = ref(1920)
const maintainRatio = ref(true)

const resetDone = () => {
  imageFiles.value.forEach(img => {
    if (img.status === 'done') {
      img.status = 'pending'
      img.compressed = undefined
      img.compressedSize = undefined
    }
  })
}

watch([quality, maxWidth, maintainRatio], resetDone)

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

const compressImage = async (img: ImageFile) => {
  img.status = 'processing'

  return new Promise<void>((resolve) => {
    const image = new Image()
    image.onload = () => {
      let { width, height } = image

      if (maintainRatio.value) {
        if (width > maxWidth.value) {
          height = (height * maxWidth.value) / width
          width = maxWidth.value
        }
      } else {
        width = maxWidth.value
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(image, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            img.compressed = blob
            img.compressedSize = blob.size
            img.status = 'done'
          }
          resolve()
        },
        'image/jpeg',
        quality.value / 100
      )
    }
    image.src = img.preview
  })
}

const compressAndDownload = async () => {
  const pending = imageFiles.value.filter(img => img.status === 'pending')
  for (const img of pending) {
    await compressImage(img)
  }
  downloadAll()
}

const compressSingle = (img: ImageFile) => {
  if (img.status === 'pending') {
    compressImage(img)
  }
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

const getSavings = (img: ImageFile): string => {
  if (!img.compressedSize) return '0%'
  const savings = ((img.size - img.compressedSize) / img.size * 100)
  return savings > 0 ? savings.toFixed(0) + '%' : '0%'
}

const downloadImage = (img: ImageFile) => {
  if (!img.compressed) return
  const url = URL.createObjectURL(img.compressed)
  const a = document.createElement('a')
  a.href = url
  a.download = img.name.replace(/\.[^.]+$/, '_compressed.jpg')
  a.click()
  URL.revokeObjectURL(url)
}

const downloadAll = () => {
  imageFiles.value.forEach(img => {
    if (img.compressed) {
      downloadImage(img)
    }
  })
}

const qualityColor = () => {
  if (quality.value >= 80) return '#22c55e'
  if (quality.value >= 50) return '#f59e0b'
  return '#ef4444'
}

const pendingCount = () => imageFiles.value.filter(img => img.status === 'pending').length
const doneCount = () => imageFiles.value.filter(img => img.status === 'done').length
</script>

<template>
  <div class="image-compressor">
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
        @click="compressAndDownload"
      >
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        压缩全部并下载
      </button>
      <button
        v-else-if="doneCount() > 0"
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
      <div class="option-row">
        <label class="option-label">
          <span>质量</span>
          <span class="option-value" :style="{ color: qualityColor() }">{{ quality }}%</span>
        </label>
        <input
          type="range"
          v-model.number="quality"
          min="10"
          max="100"
          class="quality-slider"
        />
      </div>

      <div class="option-row">
        <label class="option-label">
          <span>最大宽度</span>
          <span class="option-value">{{ maxWidth }}px</span>
        </label>
        <input
          type="range"
          v-model.number="maxWidth"
          min="320"
          max="3840"
          step="100"
          class="width-slider"
        />
      </div>

      <label class="checkbox-label">
        <input type="checkbox" v-model="maintainRatio" />
        <span>保持宽高比</span>
      </label>
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
      <p class="drop-hint">支持 JPG、PNG、WebP 格式</p>
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
            <span class="original-size">{{ formatSize(img.size) }}</span>
            <template v-if="img.compressedSize">
              <span class="arrow">→</span>
              <span class="compressed-size">{{ formatSize(img.compressedSize) }}</span>
            </template>
          </div>

          <div v-if="img.status === 'done'" class="savings-badge">
            -{{ getSavings(img) }}
          </div>

          <div class="image-actions">
            <button
              v-if="img.status === 'pending'"
              class="action-btn compress"
              @click="compressSingle(img)"
            >
              压缩
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

.image-compressor {
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
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  @include glass-card;
  border-radius: $border-radius-lg;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 180px;
}

.option-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.75rem;
  color: $text-muted;
  min-width: 50px;
}

.option-value {
  font-weight: 600;
  font-size: 0.875rem;
}

.quality-slider, .width-slider {
  flex: 1;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: $text-secondary;
  cursor: pointer;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: $primary;
  }
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
  margin-bottom: 8px;
}

.original-size {
  color: $text-muted;
}

.arrow {
  color: $text-muted;
}

.compressed-size {
  color: $success;
  font-weight: 600;
}

.savings-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(34, 197, 94, 0.2);
  color: $success;
  border-radius: $border-radius-full;
  font-size: 0.6875rem;
  font-weight: 600;
  margin-bottom: 10px;
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

  &.compress {
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
  .image-preview img {
    max-width: 100%;
    max-height: 200px;
  }
  .options-section {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
