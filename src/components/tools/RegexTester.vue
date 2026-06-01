<script setup lang="ts">
import { ref, computed } from 'vue'
import { escapeHtml } from '@/utils/format'
import { useCopyToClipboard } from '@/composables/useCopyToClipboard'

const { copyWithStatus, copyStatus } = useCopyToClipboard()

const pattern = ref('')
const flags = ref({
  g: true,
  i: false,
  m: false
})
const testString = ref(`这是一个测试文本。
邮箱：zhangsan@example.com
电话：138-1234-5678
网址：https://www.example.com
IP地址：192.168.1.1
日期：2024-01-15`)

interface Match {
  text: string
  index: number
  groups?: string[]
}

const regex = computed(() => {
  if (!pattern.value) return null

  const flagStr = Object.entries(flags.value)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join('')

  try {
    return new RegExp(pattern.value, flagStr)
  } catch {
    return null
  }
})

const isValidRegex = computed(() => {
  if (!pattern.value) return true
  return regex.value !== null
})

const matches = computed<Match[]>(() => {
  if (!regex.value || !testString.value) return []

  const results: Match[] = []

  if (flags.value.g) {
    let match
    const re = new RegExp(pattern.value, Object.entries(flags.value).filter(([, v]) => v).map(([k]) => k).join(''))
    while ((match = re.exec(testString.value)) !== null) {
      results.push({
        text: match[0],
        index: match.index,
        groups: match.slice(1).filter(g => g !== undefined)
      })
      if (!flags.value.g) break
    }
  } else {
    const match = regex.value.exec(testString.value)
    if (match) {
      results.push({
        text: match[0],
        index: match.index,
        groups: match.slice(1).filter(g => g !== undefined)
      })
    }
  }

  return results
})

const highlightedText = computed(() => {
  if (!regex.value || !testString.value) return escapeHtml(testString.value)

  const parts: string[] = []
  let lastIndex = 0

  const re = new RegExp(pattern.value, Object.entries(flags.value).filter(([, v]) => v).map(([k]) => k).join(''))
  let match

  while ((match = re.exec(testString.value)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(testString.value.slice(lastIndex, match.index)))
    }
    parts.push(`<mark class="highlight">${escapeHtml(match[0])}</mark>`)
    lastIndex = re.lastIndex
    if (!flags.value.g) break
  }

  if (lastIndex < testString.value.length) {
    parts.push(escapeHtml(testString.value.slice(lastIndex)))
  }

  return parts.join('')
})

const copyMatches = () => {
  const text = matches.value.map(m => m.text).join('\n')
  copyWithStatus(text, 'matches')
}

const commonPatterns = [
  { name: '邮箱', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  { name: '手机号', pattern: '1[3-9]\\d{9}' },
  { name: 'URL', pattern: 'https?:\\/\\/[^\\s]+' },
  { name: 'IP地址', pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}' },
  { name: '日期', pattern: '\\d{4}-\\d{2}-\\d{2}' },
  { name: '时间', pattern: '\\d{2}:\\d{2}:\\d{2}' },
  { name: '身份证', pattern: '[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]' },
  { name: '中文', pattern: '[\\u4e00-\\u9fa5]+' }
]

const usePattern = (p: string) => {
  pattern.value = p
}
</script>

<template>
  <div class="regex-tester">
    <div class="pattern-section">
      <div class="pattern-header">
        <label class="section-label">
          <span class="label-icon">
            <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </span>
          正则表达式
          <span v-if="pattern && isValidRegex" class="match-badge live">{{ matches.length }} 个匹配</span>
          <span v-else-if="pattern && !isValidRegex" class="match-badge error">语法错误</span>
        </label>
        <div class="flags">
          <label v-for="flag in Object.keys(flags)" :key="flag" class="flag-label">
            <input type="checkbox" v-model="flags[flag as keyof typeof flags]" />
            <span class="flag-text">{{ flag.toUpperCase() }}</span>
          </label>
        </div>
      </div>

      <div class="pattern-input-wrapper" :class="{ error: !isValidRegex }">
        <span class="pattern-prefix">/</span>
        <input
          v-model="pattern"
          type="text"
          class="pattern-input"
          placeholder="输入正则表达式..."
        />
        <span class="pattern-suffix">/{{ Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('') }}</span>
      </div>

      <div v-if="!isValidRegex" class="error-message">
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="3"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        正则表达式语法错误
      </div>
    </div>

    <div class="common-patterns">
      <label class="section-label">
        <span class="label-icon">
          <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </span>
        常用模式
      </label>
      <div class="patterns-grid">
        <button
          v-for="p in commonPatterns"
          :key="p.name"
          class="pattern-btn"
          @click="usePattern(p.pattern)"
        >
          {{ p.name }}
        </button>
      </div>
    </div>

    <div class="test-section">
      <label class="section-label">
        <span class="label-icon">
          <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </span>
        测试文本
      </label>
      <textarea
        v-model="testString"
        class="test-input"
        placeholder="输入要测试的文本..."
      ></textarea>
    </div>

    <div class="result-section">
      <div class="result-header">
        <label class="section-label">
          <span class="label-icon">
            <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          匹配结果
          <span v-if="matches.length > 0" class="match-badge">{{ matches.length }}</span>
        </label>
        <button
          v-if="matches.length > 0"
          class="copy-matches-btn"
          @click="copyMatches"
        >
          <span v-if="copyStatus === 'matches'"><svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 已复制</span>
          <span v-else>
            <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="2"/>
            </svg>
            复制
          </span>
        </button>
      </div>

      <div class="highlighted-text" v-html="highlightedText"></div>

      <div v-if="matches.length > 0" class="matches-list">
        <div class="match-item" v-for="(match, index) in matches" :key="index">
          <span class="match-index">#{{ index + 1 }}</span>
          <span class="match-text">{{ match.text }}</span>
          <span class="match-position">{{ match.index }}</span>
          <div v-if="match.groups && match.groups.length > 0" class="match-groups">
            <span v-for="(group, gIndex) in match.groups" :key="gIndex" class="group-item">
              ${{ gIndex + 1 }}: {{ group }}
            </span>
          </div>
        </div>
      </div>

      <div v-else-if="pattern && testString" class="no-matches">
        未找到匹配项
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.regex-tester {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 10px;
}

.label-icon {
  font-size: 1rem;
}

.pattern-section {
  @include glass-card;
  border-radius: $border-radius-lg;
  padding: 20px;
}

.pattern-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.flags {
  display: flex;
  gap: 8px;
}

.flag-label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  input {
    display: none;
  }

  .flag-text {
    padding: 4px 8px;
    background: $bg-soft;
    border-radius: $border-radius;
    font-size: 0.75rem;
    font-weight: 600;
    color: $text-muted;
    transition: $transition-bounce;
  }

  input:checked + .flag-text {
    background: $gradient-primary;
    color: white;
  }
}

.pattern-input-wrapper {
  display: flex;
  align-items: center;
  background: $bg-soft;
  border-radius: $border-radius;
  border: 1px solid transparent;
  overflow: hidden;

  &.error {
    border-color: #ef4444;
  }
}

.pattern-prefix, .pattern-suffix {
  padding: 12px 8px;
  color: $text-muted;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 1rem;
  user-select: none;
}

.pattern-suffix {
  padding-right: 12px;
}

.pattern-input {
  flex: 1;
  padding: 12px 0;
  background: transparent;
  color: $primary;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 1rem;

  &::placeholder {
    color: $text-muted;
  }
}

.error-message {
  margin-top: 8px;
  color: #ef4444;
  font-size: 0.875rem;
}

.common-patterns {
  @include glass-card;
  border-radius: $border-radius-lg;
  padding: 20px;
}

.patterns-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pattern-btn {
  padding: 6px 14px;
  background: $bg-soft;
  border-radius: $border-radius-full;
  color: $text-secondary;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: $transition-bounce;

  &:hover {
    background: rgba($primary, 0.08);
    color: $text-primary;
  }
}

.test-section {
  @include glass-card;
  border-radius: $border-radius-lg;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.test-input {
  width: 100%;
  min-height: 150px;
  padding: 12px;
  background: $bg-soft;
  border: 1px solid transparent;
  border-radius: $border-radius;
  color: $text-primary;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  resize: vertical;

  &:focus {
    border-color: $primary;
  }

  &::placeholder {
    color: $text-muted;
  }
}

.result-section {
  @include glass-card;
  border-radius: $border-radius-lg;
  padding: 16px;
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.match-badge {
  padding: 2px 8px;
  background: $gradient-primary;
  border-radius: $border-radius-full;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 6px;

  &.live {
    background: rgba(99, 102, 241, 0.2);
    color: $primary;
    transition: all 0.2s ease;
  }

  &.error {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }
}

.copy-matches-btn {
  padding: 6px 12px;
  background: $bg-soft;
  border-radius: $border-radius;
  font-size: 0.8125rem;
  color: $text-secondary;
  transition: $transition-bounce;

  &:hover {
    background: rgba($primary, 0.08);
    color: $text-primary;
  }
}

.highlighted-text {
  padding: 10px 12px;
  background: $bg-soft;
  border-radius: $border-radius;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 12px;

  :deep(.highlight) {
    background: rgba(99, 102, 241, 0.4);
    color: white;
    padding: 1px 4px;
    border-radius: 3px;
  }
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.match-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  background: $bg-soft;
  border-radius: $border-radius;
  font-size: 0.8125rem;
}

.match-index {
  padding: 2px 6px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: $border-radius-full;
  font-size: 0.6875rem;
  font-weight: 600;
  color: $primary;
  flex-shrink: 0;
}

.match-text {
  font-family: 'Monaco', 'Menlo', monospace;
  color: $text-primary;
  word-break: break-all;
}

.match-position {
  color: $text-muted;
  font-size: 0.75rem;
  margin-left: auto;
}

.match-groups {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid $bg-soft;
}

.group-item {
  padding: 2px 8px;
  background: rgba(16, 185, 129, 0.2);
  border-radius: $border-radius;
  font-size: 0.75rem;
  color: $success;
}

.no-matches {
  padding: 16px;
  text-align: center;
  color: $text-muted;
  font-size: 0.8125rem;
}

@include respond-to-down('sm') {
  .pattern-section, .test-section, .result-section {
    min-height: 200px;
  }
  .test-input {
    font-size: 0.85rem;
    padding: 12px;
  }
  .patterns-grid {
    flex-wrap: wrap;
    gap: 8px;
  }
  .pattern-btn {
    font-size: 0.75rem;
    padding: 4px 10px;
  }
  .matches-list {
    max-height: 300px;
  }
}
</style>
