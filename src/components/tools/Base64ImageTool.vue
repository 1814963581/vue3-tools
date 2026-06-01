<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCopyToClipboard } from '@/composables/useCopyToClipboard'
import { useFileUpload } from '@/composables/useFileUpload'
import { formatFileSize, truncate } from '@/utils/format'

type Tab = 'imageToBase64' | 'base64ToImage'

const activeTab = ref<Tab>('imageToBase64')

const imageFile = ref<File | null>(null)
const imagePreview = ref('')
const base64Output = ref('')
const base64Input = ref('')
const decodedPreview = ref('')
const { copyStatus, copyWithStatus } = useCopyToClipboard()
const errorMsg = ref('')

const imageInfo = computed(() => {
  if (!imageFile.value) return null
  return {
    name: imageFile.value.name,
    size: formatFileSize(imageFile.value.size),
    type: imageFile.value.type || 'unknown'
  }
})

const decodedInfo = computed(() => {
  if (!decodedPreview.value) return null
  return {
    type: base64Input.value.match(/^data:(image\/[^;]+);base64,/) ? base64Input.value.match(/^data:(image\/[^;]+);base64,/)?.[1] : 'unknown'
  }
})

const processFile = (file: File) => {
  errorMsg.value = ''
  if (!file.type.startsWith('image/')) {
    errorMsg.value = '请选择图片文件'
    return
  }
  imageFile.value = file
  const reader = new FileReader()
  reader.onload = () => {
    base64Output.value = reader.result as string
    imagePreview.value = reader.result as string
  }
  reader.onerror = () => {
    errorMsg.value = '文件读取失败'
  }
  reader.readAsDataURL(file)
}

const onFiles = (files: File[]) => {
  if (files.length > 0) {
    processFile(files[0])
  }
}

const { inputRef: fileInput, isDragging, handleDragOver, handleDragLeave, handleDrop, handleFileSelect } = useFileUpload(onFiles)

const downloadBase64 = () => {
  if (!base64Output.value) return
  const blob = new Blob([base64Output.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = (imageFile.value?.name || 'image') + '.base64.txt'
  a.click()
  URL.revokeObjectURL(url)
}

const decodeBase64 = () => {
  errorMsg.value = ''
  decodedPreview.value = ''
  if (!base64Input.value.trim()) {
    errorMsg.value = '请输入 Base64 编码内容'
    return
  }
  const input = base64Input.value.trim()
  if (!input.match(/^data:image\/[^;]+;base64,/) && !input.match(/^[A-Za-z0-9+/=]+$/)) {
    errorMsg.value = '请输入有效的 Base64 编码（支持 data URI 或纯 Base64 字符串）'
    return
  }
  const src = input.startsWith('data:') ? input : `data:image/png;base64,${input}`
  decodedPreview.value = src
}

const downloadDecoded = () => {
  if (!decodedPreview.value) return
  const a = document.createElement('a')
  a.href = decodedPreview.value
  a.download = 'decoded-image.png'
  a.click()
}

const clearImage = () => {
  imageFile.value = null
  imagePreview.value = ''
  base64Output.value = ''
  errorMsg.value = ''
}

const clearDecoded = () => {
  base64Input.value = ''
  decodedPreview.value = ''
  errorMsg.value = ''
}
</script>

<template>
  <div class="base64-image-tool">
    <div class="tab-bar">
      <button
        :class="['tab-btn', { active: activeTab === 'imageToBase64' }]"
        @click="activeTab = 'imageToBase64'"
      >
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        图片转 Base64
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'base64ToImage' }]"
        @click="activeTab = 'base64ToImage'"
      >
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 16 12 12 8 16"/>
          <line x1="12" y1="12" x2="12" y2="21"/>
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          <polyline points="16 16 12 12 8 16"/>
        </svg>
        Base64 转图片
      </button>
    </div>

    <div v-if="activeTab === 'imageToBase64'" class="tab-content">
      <div
        :class="['upload-zone', { dragging: isDragging, 'has-image': imagePreview }]"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @click="!imagePreview && fileInput?.click()"
      >
        <template v-if="!imagePreview">
          <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p class="upload-text">
            <span class="desktop-only">拖拽图片到此处或点击选择</span>
            <span class="mobile-only">点击选择图片</span>
          </p>
          <p class="upload-hint">支持 JPG、PNG、GIF、WEBP、SVG 等格式</p>
        </template>
        <template v-else>
          <img :src="imagePreview" class="preview-image" alt="Preview" />
          <div class="image-overlay">
            <button class="overlay-btn" @click.stop="clearImage">
              <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              重新选择
            </button>
          </div>
        </template>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="file-input"
          @change="handleFileSelect"
        />
      </div>

      <div v-if="imageInfo" class="info-bar">
        <span class="info-item">
          <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
          {{ imageInfo.name }}
        </span>
        <span class="info-item">{{ imageInfo.size }}</span>
        <span class="info-item">{{ imageInfo.type }}</span>
      </div>

      <div v-if="base64Output" class="output-section">
        <div class="output-header">
          <span class="section-title">Base64 编码结果</span>
          <div class="output-actions">
            <button class="action-btn" @click="copyWithStatus(base64Output, 'base64')">
              <svg v-if="copyStatus !== 'base64'" class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="2"/></svg>
              <svg v-else class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {{ copyStatus === 'base64' ? '已复制' : '复制' }}
            </button>
            <button class="action-btn" @click="downloadBase64">
              <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              下载
            </button>
          </div>
        </div>
        <pre class="base64-text">{{ truncate(base64Output, 600) }}</pre>
        <div v-if="base64Output.length > 600" class="expand-hint">Base64 内容较长，已截断显示。点击"复制"获取完整内容。</div>
      </div>
    </div>

    <div v-if="activeTab === 'base64ToImage'" class="tab-content">
      <div class="input-section">
        <label class="section-title">Base64 编码内容</label>
        <textarea
          v-model="base64Input"
          class="base64-input"
          placeholder="粘贴 Base64 编码内容（支持 data:image/...;base64,... 或纯 Base64 字符串）"
          rows="5"
          spellcheck="false"
        ></textarea>
        <div class="input-actions">
          <button class="tool-btn primary" @click="decodeBase64">
            <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/></svg>
            解码预览
          </button>
          <button class="tool-btn" @click="clearDecoded">
            <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            清空
          </button>
        </div>
      </div>

      <div v-if="decodedPreview" class="result-section">
        <div class="output-header">
          <span class="section-title">图片预览</span>
          <div class="output-actions">
            <button class="action-btn" @click="downloadDecoded">
              <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              下载图片
            </button>
          </div>
        </div>
        <div class="preview-container">
          <img :src="decodedPreview" class="decoded-image" alt="Decoded" @error="errorMsg = 'Base64 解码后不是有效的图片'" />
        </div>
        <div v-if="decodedInfo" class="info-bar">
          <span class="info-item">{{ decodedInfo.type }}</span>
        </div>
      </div>
    </div>

    <div v-if="errorMsg" class="error-bar">
      <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {{ errorMsg }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.base64-image-tool {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tab-bar {
  display: flex;
  gap: 8px;
  padding: 6px;
  @include glass-card;
  border-radius: $border-radius;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: $border-radius-sm;
  font-size: 0.875rem;
  font-weight: 600;
  color: $text-muted;
  transition: $transition-bounce;
  background: transparent;

  &:hover {
    color: $text-secondary;
    background: rgba($primary, 0.04);
  }

  &.active {
    background: $gradient-primary;
    color: #fff;
    box-shadow: 0 4px 16px rgba($primary, 0.3);
  }
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  border: 2px dashed rgba($primary, 0.2);
  border-radius: $border-radius-lg;
  @include glass-card;
  cursor: pointer;
  transition: $transition-normal;
  min-height: 200px;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: $primary;
    background: rgba($primary, 0.02);
  }

  &.dragging {
    border-color: $primary;
    background: rgba($primary, 0.06);
    transform: scale(1.01);
  }

  &.has-image {
    padding: 0;
    border-style: solid;
    border-color: rgba($primary, 0.1);
    cursor: default;
  }
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: $primary;
  opacity: 0.5;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 1rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 0.8125rem;
  color: $text-muted;
}

.file-input {
  display: none;
}

.preview-image {
  width: 100%;
  max-height: 360px;
  object-fit: contain;
  background: $bg-soft;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s ease;

  .upload-zone:hover & {
    opacity: 1;
  }
}

.overlay-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: #fff;
  color: $text-primary;
  border-radius: $border-radius;
  font-size: 0.875rem;
  font-weight: 600;
  transition: $transition-fast;

  &:hover {
    transform: scale(1.05);
  }
}

.info-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 16px;
  @include glass-card;
  border-radius: $border-radius;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba($primary, 0.08);
  border-radius: $border-radius-full;
  font-size: 0.8125rem;
  color: $text-secondary;
  font-weight: 500;
}

.output-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: $text-primary;
  background: linear-gradient(135deg, $primary 0%, $secondary 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.output-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: $border-radius;
  background: rgba($primary, 0.08);
  color: $primary;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: $transition-bounce;

  &:hover {
    background: rgba($primary, 0.15);
    transform: translateY(-1px);
  }
}

.base64-text {
  padding: 16px;
  @include glass-card;
  border-radius: $border-radius;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
  line-height: 1.5;
  color: $text-secondary;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
}

.expand-hint {
  font-size: 0.75rem;
  color: $text-muted;
  text-align: center;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.base64-input {
  width: 100%;
  min-height: 140px;
  padding: 16px;
  border-radius: $border-radius;
  border: 1px solid rgba($primary, 0.15);
  background: rgba(255, 255, 255, 0.6);
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: $text-primary;
  resize: vertical;
  transition: $transition-normal;

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.15);
    background: rgba(255, 255, 255, 0.9);
  }

  &::placeholder {
    color: $text-muted;
  }
}

.input-actions {
  display: flex;
  gap: 10px;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: $border-radius;
  border: 1px solid rgba($primary, 0.15);
  background: rgba(255, 255, 255, 0.6);
  color: $text-primary;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: $transition-bounce;

  &:hover {
    background: rgba($primary, 0.08);
    border-color: $primary;
    color: $primary;
  }

  &.primary {
    background: $gradient-primary;
    color: #fff;
    border: none;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba($primary, 0.3);
    }
  }
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-container {
  display: flex;
  justify-content: center;
  padding: 16px;
  @include glass-card;
  border-radius: $border-radius;
  min-height: 100px;
}

.decoded-image {
  max-width: 100%;
  max-height: 360px;
  object-fit: contain;
  border-radius: $border-radius-sm;
}

.error-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba($danger, 0.1);
  border: 1px solid rgba($danger, 0.3);
  border-radius: $border-radius;
  color: $danger;
  font-size: 0.875rem;
  font-weight: 500;
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
  .tab-bar {
    flex-wrap: wrap;
  }
  .tab-btn {
    flex: 1;
    min-width: 120px;
    font-size: 0.85rem;
    padding: 10px 14px;
  }
  .upload-zone {
    padding: 24px 16px;
  }
  .upload-icon {
    width: 48px;
    height: 48px;
  }
  .upload-text {
    font-size: 0.9rem;
  }
  .upload-hint {
    font-size: 0.75rem;
  }
  .base64-input {
    font-size: 0.8rem;
    padding: 12px;
  }
  .preview-image {
    max-height: 200px;
  }
  .info-bar {
    flex-wrap: wrap;
    gap: 8px;
  }
  .output-actions {
    flex-direction: column;
    gap: 8px;
  }
  .action-btn {
    width: 100%;
  }
}
</style>