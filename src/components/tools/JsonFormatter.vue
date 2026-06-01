<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCopyToClipboard } from '@/composables/useCopyToClipboard'
import { sortObjectKeys, formatFileSize } from '@/utils/format'

const { isCopied, copy: copyToClipboard } = useCopyToClipboard()

const inputJson = ref(`{
  "name": "张三",
  "age": 28,
  "email": "zhangsan@example.com",
  "skills": ["JavaScript", "Vue", "TypeScript"],
  "address": {
    "city": "北京",
    "district": "朝阳区"
  }
}`)

const outputJson = ref('')
const errorMessage = ref('')
const isValid = ref(true)

const indentSize = ref(2)
const sortKeys = ref(false)

const formatJson = () => {
  errorMessage.value = ''
  isValid.value = true

  if (!inputJson.value.trim()) {
    outputJson.value = ''
    return
  }

  try {
    let parsed = JSON.parse(inputJson.value)

    if (sortKeys.value) {
      parsed = sortObjectKeys(parsed)
    }

    outputJson.value = JSON.stringify(parsed, null, indentSize.value)
  } catch (e: any) {
    isValid.value = false
    errorMessage.value = e.message || 'JSON 格式错误'
    outputJson.value = ''
  }
}

const minifyJson = () => {
  errorMessage.value = ''
  isValid.value = true

  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed)
  } catch (e: any) {
    isValid.value = false
    errorMessage.value = e.message || 'JSON 格式错误'
    outputJson.value = ''
  }
}

const copyOutput = () => {
  copyToClipboard(outputJson.value)
}

const clearAll = () => {
  inputJson.value = ''
  outputJson.value = ''
  errorMessage.value = ''
  isValid.value = true
}

const stats = computed(() => {
  if (!outputJson.value) return { lines: 0, chars: 0, size: '0 B' }
  const lines = outputJson.value.split('\n').length
  const chars = outputJson.value.length
  const size = new Blob([outputJson.value]).size
  return { lines, chars, size: formatFileSize(size) }
})

watch([inputJson, indentSize, sortKeys], () => {
  if (inputJson.value.trim()) {
    formatJson()
  }
}, { immediate: true })
</script>

<template>
  <div class="json-formatter">
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="tool-btn primary" @click="formatJson">
          <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="8" cy="12" r="1.5"/>
            <circle cx="12" cy="8" r="1.5"/>
            <circle cx="16" cy="12" r="1.5"/>
          </svg>
          格式化
        </button>
        <button class="tool-btn" @click="minifyJson">
          <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 14 4 9 9 14"/>
            <polyline points="20 10 20 15 15 10"/>
            <line x1="4" y1="9" x2="20" y2="15"/>
            <line x1="20" y1="9" x2="4" y2="15"/>
          </svg>
          压缩
        </button>
        <button class="tool-btn" @click="clearAll">
          <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          清空
        </button>
      </div>
      <div class="toolbar-right">
        <label class="option-label">
          <span>缩进：</span>
          <select v-model.number="indentSize" class="indent-select">
            <option :value="2">2 空格</option>
            <option :value="4">4 空格</option>
            <option :value="0">无缩进</option>
          </select>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="sortKeys" />
          <span>排序键</span>
        </label>
      </div>
    </div>

    <div class="editor-container">
      <div class="editor-pane">
        <div class="pane-header">
          <span class="pane-icon">
            <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </span>
          <span>输入 JSON</span>
          <span :class="['status-badge', { error: !isValid }]">
              <svg v-if="isValid" class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              {{ isValid ? ' 有效' : ' 无效' }}
          </span>
        </div>
        <textarea
          v-model="inputJson"
          class="editor-input"
          placeholder="粘贴 JSON 数据..."
          :class="{ 'has-error': !isValid }"
        ></textarea>
        <div v-if="errorMessage" class="error-message">
          <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="3"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ errorMessage }}
        </div>
      </div>

      <div class="editor-pane output-pane">
        <div class="pane-header">
          <span class="pane-icon">
            <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 13.5 12 8.5 7 13.5"/>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            </svg>
          </span>
          <span>输出结果</span>
          <div class="stats">
            <span>{{ stats.lines }} 行</span>
            <span>{{ stats.chars }} 字符</span>
            <span>{{ stats.size }}</span>
          </div>
        </div>
        <textarea
          :value="outputJson"
          readonly
          class="editor-input output"
          placeholder="格式化后的 JSON 将显示在这里..."
        ></textarea>
        <button
          v-if="outputJson"
          class="copy-btn"
          :class="{ copied: isCopied }"
          @click="copyOutput"
        >
          <span v-if="isCopied"><svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 已复制</span>
          <span v-else>
            <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="2"/>
            </svg>
            复制结果
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.json-formatter {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 16px;
  @include glass-card;
  border-radius: $border-radius-lg;
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tool-btn {
  padding: 8px 16px;
  background: $bg-soft;
  border-radius: $border-radius;
  color: $text-secondary;
  font-size: 0.875rem;
  font-weight: 600;
  transition: $transition-bounce;

  &:hover {
    background: $bg-muted;
    color: $text-primary;
  }

  &.primary {
    background: $gradient-primary;
    color: white;

    &:hover {
      transform: scale(1.05);
    }
  }
}

.option-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: $text-secondary;
}

.indent-select {
  padding: 6px 10px;
  background: $bg-soft;
  border: 1px solid rgba($primary, 0.12);
  border-radius: $border-radius;
  color: $text-primary;
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    border-color: $primary;
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: $text-secondary;
  cursor: pointer;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: $primary;
    cursor: pointer;
  }
}

.editor-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;

  @media (min-width: 900px) {
    flex-direction: row;
  }
}

.editor-pane {
  display: flex;
  flex-direction: column;
  @include glass-card;
  border-radius: $border-radius-lg;
  overflow: hidden;
  position: relative;
  flex: 1;
  min-height: 250px;
}

.pane-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: $bg-soft;
  font-size: 0.875rem;
  font-weight: 600;
  color: $text-secondary;
  border-bottom: 1px solid rgba($primary, 0.06);
}

.pane-icon {
  font-size: 1rem;
}

.status-badge {
  margin-left: auto;
  padding: 2px 10px;
  background: rgba(16, 185, 129, 0.1);
  color: $success;
  border-radius: $border-radius-full;
  font-size: 0.75rem;

  &.error {
    background: rgba(239, 68, 68, 0.1);
    color: $danger;
  }
}

.stats {
  margin-left: auto;
  display: flex;
  gap: 12px;
  font-size: 0.75rem;
  color: $text-muted;
}

.editor-input {
  flex: 1;
  padding: 16px;
  background: transparent;
  color: $text-primary;
  font-family: 'Monaco', 'Menlo', 'Cascadia Code', monospace;
  font-size: 0.875rem;
  line-height: 1.7;
  resize: none;
  border: none;

  &::placeholder {
    color: $text-muted;
  }

  &.has-error {
    border-left: 3px solid $danger;
  }

  &.output {
    color: $success;
  }
}

.error-message {
  padding: 10px 16px;
  background: rgba(239, 68, 68, 0.06);
  color: $danger;
  font-size: 0.875rem;
  border-top: 1px solid rgba(239, 68, 68, 0.12);
}

.copy-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 10px 20px;
  background: $gradient-primary;
  border-radius: $border-radius;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  transition: $transition-bounce;
  box-shadow: 0 4px 12px rgba($primary, 0.25);

  &:hover {
    transform: scale(1.05);
  }

  &.copied {
    background: $success;
  }
}

@include respond-to-down('sm') {
  .editor-container {
    flex-direction: column;
  }
  .editor-pane {
    min-height: 250px;
  }
  .editor-input {
    font-size: 0.85rem;
    padding: 12px;
  }
  .toolbar {
    flex-wrap: wrap;
    gap: 8px;
  }
  .stats {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>