<script setup lang="ts">
import { ref, computed } from 'vue'

const inputText = ref('')

const stats = computed(() => {
  const text = inputText.value
  const chars = text.length
  const charsNoSpace = text.replace(/\s/g, '').length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length
  const sentences = (text.match(/[。！？.!?]+/g) || []).length
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0
  const lines = text.trim() ? text.split('\n').length : 0
  const numbers = (text.match(/\d+/g) || []).length
  const punctuation = (text.match(/[，。！？、；：""''【】《》（）…—,.!?;:'"()\[\]{}<>]/g) || []).length
  const bytes = new Blob([text]).size

  return {
    chars, charsNoSpace, words, chineseChars, englishWords,
    sentences, paragraphs, lines, numbers, punctuation, bytes
  }
})

const readingTime = computed(() => {
  const chineseMin = Math.ceil(stats.value.chineseChars / 400)
  const englishMin = Math.ceil(stats.value.englishWords / 200)
  return Math.max(chineseMin, englishMin)
})

const clearText = () => {
  inputText.value = ''
}

const copyStats = () => {
  const s = stats.value
  const text = `字数统计：
总字符：${s.chars}
不含空格：${s.charsNoSpace}
中文字数：${s.chineseChars}
英文词数：${s.englishWords}
句子数：${s.sentences}
段落数：${s.paragraphs}
行数：${s.lines}
字节数：${s.bytes}
预计阅读：${readingTime.value} 分钟`
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="word-counter">
    <div class="toolbar">
      <button class="tool-btn" @click="clearText">
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        清空
      </button>
      <button class="tool-btn download" @click="copyStats">
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        复制统计
      </button>
    </div>

    <div class="main-layout">
      <div class="editor-pane">
        <div class="pane-header">
          <span class="pane-title">输入文本</span>
          <span class="pane-count">{{ stats.chars }} 字符</span>
        </div>
        <textarea
          v-model="inputText"
          class="text-area"
          placeholder="在此输入或粘贴文本，实时统计字数..."
          rows="14"
        ></textarea>
      </div>

      <div class="stats-pane">
        <div class="pane-header">
          <span class="pane-title">统计结果</span>
        </div>
        <div class="stats-grid">
          <div class="stat-card primary">
            <span class="stat-value">{{ stats.chars }}</span>
            <span class="stat-label">总字符</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.charsNoSpace }}</span>
            <span class="stat-label">不含空格</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.chineseChars }}</span>
            <span class="stat-label">中文字数</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.englishWords }}</span>
            <span class="stat-label">英文词数</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.sentences }}</span>
            <span class="stat-label">句子数</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.paragraphs }}</span>
            <span class="stat-label">段落数</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.lines }}</span>
            <span class="stat-label">行数</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.numbers }}</span>
            <span class="stat-label">数字组</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.punctuation }}</span>
            <span class="stat-label">标点符号</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.bytes }}</span>
            <span class="stat-label">字节数</span>
          </div>
          <div class="stat-card accent">
            <span class="stat-value">{{ readingTime }}</span>
            <span class="stat-label">阅读时间(分钟)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.word-counter {
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
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover { background: rgba($primary, 0.08); color: $text-primary; }
  &.download { background: $success; color: white; }

  .inline-svg {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    display: inline-block;
  }
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @include respond-to('md') {
    grid-template-columns: 1fr;
  }
}

.editor-pane, .stats-pane {
  @include glass-card;
  border-radius: $border-radius-lg;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid $bg-muted;
}

.pane-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: $text-primary;
}

.pane-count {
  font-size: 0.75rem;
  color: $text-muted;
}

.text-area {
  flex: 1;
  padding: 14px;
  background: transparent;
  border: none;
  color: $text-primary;
  font-size: 0.9375rem;
  line-height: 1.8;
  resize: vertical;
  min-height: 300px;

  &::placeholder { color: $text-muted; }
}

.stats-grid {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  overflow-y: auto;
  max-height: 400px;
}

.stat-card {
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid $bg-muted;
  border-radius: $border-radius;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.primary {
    grid-column: span 2;
    background: rgba($primary, 0.06);
    border-color: rgba($primary, 0.2);

    .stat-value {
      font-size: 2rem;
      color: $primary-light;
    }
  }

  &.accent {
    grid-column: span 2;
    background: rgba($success, 0.08);
    border-color: rgba($success, 0.2);

    .stat-value { color: $success; }
  }
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: $text-primary;
}

.stat-label {
  font-size: 0.6875rem;
  color: $text-muted;
  font-weight: 500;
}

@include respond-to-down('sm') {
  .text-area {
    font-size: 0.85rem;
    padding: 12px;
    min-height: 200px;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .stat-card {
    padding: 14px;
  }
  .stat-value {
    font-size: 1.25rem;
  }
}
</style>
