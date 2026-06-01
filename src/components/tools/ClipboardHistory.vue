<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCopyToClipboard } from '@/composables/useCopyToClipboard'
import { formatRelativeTime } from '@/utils/format'

interface ClipboardItem {
  id: string
  text: string
  time: Date
  copied: boolean
}

const clipboardHistory = ref<ClipboardItem[]>([])
const copyStatus = ref('')
const searchQuery = ref('')
const maxItems = 50

const { copyText: copyToClipboardText } = useCopyToClipboard()

const addToHistory = async (text: string) => {
  if (!text.trim()) return

  const existing = clipboardHistory.value.findIndex(item => item.text === text)
  if (existing !== -1) {
    clipboardHistory.value[existing].time = new Date()
    clipboardHistory.value.unshift(clipboardHistory.value.splice(existing, 1)[0])
  } else {
    const newItem: ClipboardItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text,
      time: new Date(),
      copied: false
    }
    clipboardHistory.value.unshift(newItem)

    if (clipboardHistory.value.length > maxItems) {
      clipboardHistory.value.pop()
    }
  }
}

const copyItem = async (item: ClipboardItem) => {
  const success = await copyToClipboardText(item.text)
  if (success) {
    item.copied = true
    copyStatus.value = item.id
    setTimeout(() => {
      item.copied = false
      copyStatus.value = ''
    }, 2000)
  }
}

const deleteItem = (id: string) => {
  const index = clipboardHistory.value.findIndex(item => item.id === id)
  if (index !== -1) {
    clipboardHistory.value.splice(index, 1)
  }
}

const clearAll = () => {
  clipboardHistory.value = []
}

const filteredHistory = () => {
  if (!searchQuery.value.trim()) {
    return clipboardHistory.value
  }
  const query = searchQuery.value.toLowerCase()
  return clipboardHistory.value.filter(item =>
    item.text.toLowerCase().includes(query)
  )
}

const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text && text !== lastText) {
      lastText = text
      addToHistory(text)
    }
    return true
  } catch (err) {
    console.log('Paste permission denied or not supported')
    return false
  }
}

const isChecking = ref(false)

const startCheckClipboard = async () => {
  isChecking.value = true
  await handlePaste()
  setTimeout(() => {
    isChecking.value = false
  }, 1000)
}

let pollTimer: number | undefined

onMounted(() => {
  pollTimer = window.setInterval(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text && text !== lastText) {
        lastText = text
        addToHistory(text)
      }
    } catch {
      // 权限不足，停止轮询，等待用户点击检测按钮
    }
  }, 60000)

  window.addEventListener('paste', (e: ClipboardEvent) => {
    const text = e.clipboardData?.getData('text')
    if (text) {
      lastText = text
      addToHistory(text)
    }
  })
})

let lastText = ''

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
  }
})
</script>

<template>
  <div class="clipboard-history">
    <div class="toolbar">
      <div class="toolbar-left">
        <h3 class="toolbar-title">
          <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="2"/>
          </svg>
          剪贴板历史
        </h3>
        <span class="item-count">{{ clipboardHistory.length }} 条记录</span>
      </div>
      <div class="toolbar-right">
        <button
          class="tool-btn"
          @click="startCheckClipboard"
          :disabled="isChecking"
        >
          <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
          </svg>
          检测
        </button>
        <button
          class="tool-btn danger"
          @click="clearAll"
          :disabled="clipboardHistory.length === 0"
        >
          <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          清空
        </button>
      </div>
    </div>

    <div class="search-section">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜索剪贴板内容..."
      />
    </div>

    <div v-if="clipboardHistory.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="2"/>
          </svg>
        </div>
        <p class="empty-text">剪贴板历史为空</p>
        <p class="empty-hint">点击"检测"按钮读取当前剪贴板内容</p>
      </div>

    <div v-if="clipboardHistory.length > 0" class="history-list">
      <div
        v-for="item in filteredHistory()"
        :key="item.id"
        class="history-item"
        :class="{ copied: copyStatus === item.id }"
      >
        <div class="item-content">
          <pre class="item-text">{{ item.text }}</pre>
        </div>
        <div class="item-footer">
          <span class="item-time">{{ formatRelativeTime(item.time) }}</span>
          <div class="item-actions">
            <button
              class="action-btn copy"
              :class="{ copied: item.copied }"
              @click="copyItem(item)"
            >
              <svg v-if="!item.copied" class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="2"/>
              </svg>
              <svg v-else class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button
              class="action-btn delete"
              @click="deleteItem(item.id)"
            >
              <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="info-bar">
      <span class="info-icon">
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18h6"/>
          <path d="M10 22h4"/>
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
        </svg>
      </span>
      <span>每分钟自动刷新一次，也可点击"检测"按钮手动读取</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.clipboard-history {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  @include glass-card;
  border-radius: $border-radius-lg;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-title {
  font-size: 1rem;
  font-weight: 600;
  color: $text-primary;
}

.item-count {
  padding: 4px 12px;
  background: rgba(99, 102, 241, 0.2);
  color: $primary;
  border-radius: $border-radius-full;
  font-size: 0.75rem;
  font-weight: 600;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

.tool-btn {
  padding: 8px 16px;
  border-radius: $border-radius;
  font-size: 0.875rem;
  font-weight: 600;
  transition: $transition-bounce;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.danger {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;

    &:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.3);
    }
  }
}

.search-section {
  padding: 0 4px;
}

.search-input {
  width: 100%;
  padding: 14px 18px;
  @include glass-card;
  border-radius: $border-radius-lg;
  color: $text-primary;
  font-size: 0.9375rem;
  border: 1px solid transparent;
  transition: $transition-normal;

  &:focus {
    border-color: $primary;
  }

  &::placeholder {
    color: $text-muted;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  @include glass-card;
  border-radius: $border-radius-lg;
  border: 2px dashed rgba($primary, 0.08);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 1.125rem;
  color: $text-secondary;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 0.875rem;
  color: $text-muted;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
}

.history-item {
  @include glass-card;
  border-radius: $border-radius-lg;
  overflow: hidden;
  transition: $transition-bounce;

  &:hover {
    @include glass-card-hover;
  }

  &.copied {
    border: 1px solid rgba(34, 197, 94, 0.5);
  }
}

.item-content {
  padding: 14px 16px;
}

.item-text {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  color: $text-primary;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
  max-height: 100px;
  overflow-y: auto;
  margin: 0;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: $bg-soft;
}

.item-time {
  font-size: 0.75rem;
  color: $text-muted;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  background: $bg-soft;
  border-radius: $border-radius;
  font-size: 0.875rem;
  transition: $transition-bounce;

  &:hover {
    background: rgba($primary, 0.08);
  }

  &.copied {
    background: rgba(34, 197, 94, 0.2);
    color: $success;
  }

  &.delete:hover {
    background: rgba(239, 68, 68, 0.2);
  }
}

.info-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  @include glass-card;
  border-radius: $border-radius-lg;
  font-size: 0.8125rem;
  color: $text-muted;
}

.info-icon {
  font-size: 1rem;
}

@include respond-to-down('sm') {
  .history-list {
    max-height: 400px;
  }
  .history-item {
    padding: 12px;
  }
  .item-content {
    font-size: 0.85rem;
  }
  .item-time {
    font-size: 0.7rem;
  }
  .toolbar {
    flex-wrap: wrap;
    gap: 8px;
  }
  .empty-state {
    padding: 40px 20px;
  }
  .empty-icon {
    width: 48px;
    height: 48px;
  }
}
</style>
