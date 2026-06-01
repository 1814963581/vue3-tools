<script setup lang="ts">
import { ref } from 'vue'
import { useCopyToClipboard } from '@/composables/useCopyToClipboard'

const inputText = ref('')
const outputText = ref('')

const { copy } = useCopyToClipboard()

const ERROR_PREFIX = '✗ 编码失败：'
const DECODE_ERROR_PREFIX = '✗ 解码失败：'

const encode = () => {
  try {
    outputText.value = btoa(unescape(encodeURIComponent(inputText.value)))
  } catch (e: any) {
    outputText.value = ERROR_PREFIX + (e.message || '输入内容不正确')
  }
}

const decode = () => {
  try {
    outputText.value = decodeURIComponent(escape(atob(inputText.value.trim())))
  } catch (e: any) {
    outputText.value = DECODE_ERROR_PREFIX + '请输入正确的 Base64 编码'
  }
}

const clearAll = () => {
  inputText.value = ''
  outputText.value = ''
}

const swapIO = () => {
  if (outputText.value && !outputText.value.startsWith('✗')) {
    inputText.value = outputText.value
    outputText.value = ''
  }
}
</script>

<template>
  <div class="base64-codec">
    <div class="toolbar">
      <button class="tool-btn primary" @click="encode">
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        编码
      </button>
      <button class="tool-btn primary" @click="decode">
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        解码
      </button>
      <button class="tool-btn" @click="swapIO">⇄ 互换</button>
      <button class="tool-btn" @click="clearAll">
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        清空
      </button>
      <button v-if="outputText && !outputText.startsWith('✗')" class="tool-btn download" @click="copy(outputText)">
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="2"/></svg>
        复制
      </button>
    </div>

    <div class="editor-layout">
      <div class="editor-pane">
        <div class="pane-header">
          <span class="pane-title">输入</span>
        </div>
        <textarea
          v-model="inputText"
          class="text-area"
          placeholder="输入要编码/解码的文本..."
          rows="8"
        ></textarea>
      </div>

      <div class="editor-pane">
        <div class="pane-header">
          <span class="pane-title">输出</span>
        </div>
        <textarea
          v-model="outputText"
          class="text-area"
          readonly
          placeholder="结果将显示在这里..."
          rows="8"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.base64-codec {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.editor-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.editor-pane {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pane-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: $text-primary;
  background: linear-gradient(135deg, $primary 0%, $secondary 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding: 6px 14px;
  border-radius: $border-radius-full;
  background-color: rgba(79, 124, 255, 0.08);
}

.text-area {
  width: 100%;
  min-height: 200px;
  padding: 16px;
  border-radius: $border-radius;
  border: 1px solid rgba(79, 124, 255, 0.15);
  background: rgba(255, 255, 255, 0.6);
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.875rem;
  line-height: 1.7;
  color: $text-primary;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(79, 124, 255, 0.15);
    background: rgba(255, 255, 255, 0.9);
  }

  &[readonly] {
    background: rgba(79, 124, 255, 0.04);
    cursor: default;
  }
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: $border-radius;
  border: 1px solid rgba(79, 124, 255, 0.15);
  background: rgba(255, 255, 255, 0.6);
  color: $text-primary;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(79, 124, 255, 0.08);
    border-color: $primary;
    color: $primary;
  }

  &.primary {
    background: linear-gradient(135deg, $primary 0%, rgba(79, 124, 255, 0.85) 100%);
    color: #fff;
    border: none;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(79, 124, 255, 0.3);
    }
  }

  &.download {
    background: linear-gradient(135deg, $secondary 0%, rgba(20, 184, 166, 0.85) 100%);
    color: #fff;
    border: none;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(20, 184, 166, 0.3);
    }
  }
}

@include respond-to-down('sm') {
  .editor-layout {
    grid-template-columns: 1fr;
  }
  .editor-pane {
    min-height: 200px;
  }
  .toolbar {
    flex-wrap: wrap;
    gap: 8px;
  }
  .text-area {
    font-size: 0.85rem;
    padding: 12px;
  }
}
</style>
