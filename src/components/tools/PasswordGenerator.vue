<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const length = ref(16)
const useUppercase = ref(true)
const useLowercase = ref(true)
const useNumbers = ref(true)
const useSymbols = ref(true)

const excludeAmbiguous = ref(false)
const customExclude = ref('')

const generatedPassword = ref('')
const passwordHistory = ref<string[]>([])
const copyStatus = ref('')

const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
const numberChars = '0123456789'
const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

const ambiguousChars = 'Il1O0'

const getCharPool = computed(() => {
  let pool = ''
  if (useUppercase.value) pool += uppercaseChars
  if (useLowercase.value) pool += lowercaseChars
  if (useNumbers.value) pool += numberChars
  if (useSymbols.value) pool += symbolChars

  if (pool === '') pool = lowercaseChars

  if (excludeAmbiguous.value) {
    for (const char of ambiguousChars) {
      pool = pool.replace(new RegExp(char, 'g'), '')
    }
  }

  if (customExclude.value) {
    for (const char of customExclude.value) {
      pool = pool.replace(new RegExp(char, 'g'), '')
    }
  }

  return pool
})

const strengthLevel = computed(() => {
  const len = length.value
  let score = 0

  if (len >= 8) score++
  if (len >= 12) score++
  if (len >= 16) score++
  if (len >= 20) score++

  if (useUppercase.value) score++
  if (useLowercase.value) score++
  if (useNumbers.value) score++
  if (useSymbols.value) score++

  if (score <= 3) return { level: 0, text: '弱', color: '#ef4444' }
  if (score <= 5) return { level: 1, text: '中等', color: '#f59e0b' }
  if (score <= 7) return { level: 2, text: '强', color: '#22c55e' }
  return { level: 3, text: '极强', color: '#10b981' }
})

const filterExclude = (chars: string): string => {
  if (!customExclude.value) return chars
  let result = chars
  for (const char of customExclude.value) {
    result = result.replace(new RegExp(char, 'g'), '')
  }
  return result
}

const generatePassword = () => {
  const pool = getCharPool.value
  let password = ''

  if (useUppercase.value && !excludeAmbiguous.value) {
    let chars = filterExclude(uppercaseChars)
    chars = excludeAmbiguous.value ? chars.replace(/[Il]/g, '') : chars
    if (chars.length > 0) password += chars[Math.floor(Math.random() * chars.length)]
  }
  if (useLowercase.value) {
    const chars = filterExclude(lowercaseChars)
    if (chars.length > 0) password += chars[Math.floor(Math.random() * chars.length)]
  }
  if (useNumbers.value) {
    let chars = filterExclude(numberChars)
    chars = excludeAmbiguous.value ? chars.replace(/[IlO0]/g, '') : chars
    if (chars.length > 0) password += chars[Math.floor(Math.random() * chars.length)]
  }
  if (useSymbols.value) {
    const chars = filterExclude(symbolChars)
    if (chars.length > 0) password += chars[Math.floor(Math.random() * chars.length)]
  }

  for (let i = password.length; i < length.value; i++) {
    password += pool[Math.floor(Math.random() * pool.length)]
  }

  generatedPassword.value = password.split('').sort(() => Math.random() - 0.5).join('')

  if (passwordHistory.value.length >= 10) {
    passwordHistory.value.pop()
  }
  passwordHistory.value.unshift(generatedPassword.value)
}

const copyPassword = async (password: string) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(password)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = password
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    copyStatus.value = password
    setTimeout(() => {
      copyStatus.value = ''
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const regenerate = () => {
  generatePassword()
}

watch([length, useUppercase, useLowercase, useNumbers, useSymbols, excludeAmbiguous, customExclude], () => {
  if (generatedPassword.value) {
    generatePassword()
  }
})
</script>

<template>
  <div class="password-generator">
    <div class="password-display">
      <div class="password-field">
        <input
          type="text"
          :value="generatedPassword"
          readonly
          class="password-input"
          placeholder="点击生成按钮创建密码"
        />
        <button class="regenerate-btn" @click="regenerate" title="重新生成">
          <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>

      <div class="strength-indicator">
        <div class="strength-label">
          <span>密码强度：</span>
          <span class="strength-text" :style="{ color: strengthLevel.color }">
            {{ strengthLevel.text }}
          </span>
        </div>
        <div class="strength-bar">
          <div
            class="strength-fill"
            :style="{
              width: ((strengthLevel.level + 1) / 4 * 100) + '%',
              backgroundColor: strengthLevel.color
            }"
          ></div>
        </div>
      </div>

      <button class="generate-btn" @click="generatePassword">
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="3"/>
          <circle cx="8" cy="8" r="1.5"/>
          <circle cx="16" cy="8" r="1.5"/>
          <circle cx="8" cy="16" r="1.5"/>
          <circle cx="16" cy="16" r="1.5"/>
          <circle cx="12" cy="12" r="1.5"/>
        </svg>
        生成密码
      </button>
    </div>

    <div class="options-section">
      <div class="option-row">
        <label class="option-label">密码长度</label>
        <div class="length-control">
          <input
            type="range"
            v-model.number="length"
            min="4"
            max="64"
            class="length-slider"
          />
          <span class="length-value">{{ length }}</span>
        </div>
      </div>

      <div class="option-grid">
        <label class="checkbox-label">
          <input type="checkbox" v-model="useUppercase" />
          <span class="checkbox-text">大写字母 (A-Z)</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="useLowercase" />
          <span class="checkbox-text">小写字母 (a-z)</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="useNumbers" />
          <span class="checkbox-text">数字 (0-9)</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="useSymbols" />
          <span class="checkbox-text">特殊符号 (!@#$%)</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="excludeAmbiguous" />
          <span class="checkbox-text">排除易混淆字符 (il1O0)</span>
        </label>
      </div>

      <div class="option-row">
        <label class="option-label">排除字符</label>
        <input
          type="text"
          v-model="customExclude"
          placeholder="输入要排除的字符"
          class="exclude-input"
        />
      </div>
    </div>

    <div v-if="passwordHistory.length > 0" class="history-section">
      <div class="history-header">
        <span class="history-icon">
          <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="2"/>
          </svg>
        </span>
        <span>历史记录</span>
        <button class="clear-btn" @click="passwordHistory = []">清空</button>
      </div>
      <div class="history-list">
        <div
          v-for="(pwd, index) in passwordHistory"
          :key="index"
          class="history-item"
        >
          <span class="history-password">{{ pwd }}</span>
          <button
            class="copy-icon"
            @click="copyPassword(pwd)"
          >
            <svg v-if="copyStatus === pwd" class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="2"/>
            </svg>
          </button>
        </div>
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

.password-generator {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.password-display {
  @include glass-card;
  border-radius: $border-radius-lg;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.password-field {
  display: flex;
  gap: 12px;
}

.password-input {
  flex: 1;
  padding: 16px 20px;
  @include glass-card;
  border-radius: $border-radius;
  color: $text-primary;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 1.125rem;
  font-weight: 600;
  border: 1px solid transparent;

  &::placeholder {
    color: $text-muted;
    font-size: 0.875rem;
  }
}

.regenerate-btn {
  padding: 16px;
  @include glass-card;
  border-radius: $border-radius;
  font-size: 1.25rem;
  transition: $transition-bounce;

  &:hover {
    @include glass-card-hover;
    transform: rotate(180deg);
  }
}

.strength-indicator {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.strength-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: $text-secondary;
}

.strength-text {
  font-weight: 600;
}

.strength-bar {
  height: 6px;
  background: rgba($primary, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.generate-btn {
  padding: 16px;
  background: $gradient-primary;
  border-radius: $border-radius;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  transition: $transition-bounce;

  &:hover {
    transform: scale(1.02);
    box-shadow: $shadow-glow;
  }
}

.options-section {
  @include glass-card;
  border-radius: $border-radius-lg;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.option-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: $text-muted;
}

.length-control {
  display: flex;
  align-items: center;
  gap: 16px;
}

.length-slider {
  flex: 1;
  appearance: none;
  -webkit-appearance: none;
  height: 8px;
  background: rgba($primary, 0.08);
  border-radius: 4px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: $gradient-primary;
    border-radius: 50%;
    cursor: pointer;
    transition: $transition-bounce;

    &:hover {
      transform: scale(1.2);
    }
  }
}

.length-value {
  min-width: 40px;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: $primary;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: $primary;
    cursor: pointer;
  }
}

.checkbox-text {
  font-size: 0.875rem;
  color: $text-secondary;
}

.exclude-input {
  padding: 12px 16px;
  @include glass-card;
  border-radius: $border-radius;
  color: $text-primary;
  font-size: 0.875rem;
  border: 1px solid transparent;
  transition: $transition-normal;

  &:focus {
    border-color: $primary;
  }

  &::placeholder {
    color: $text-muted;
  }
}

.history-section {
  @include glass-card;
  border-radius: $border-radius-lg;
  padding: 20px;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: $text-secondary;
}

.history-icon {
  font-size: 1rem;
}

.clear-btn {
  margin-left: auto;
  padding: 4px 12px;
  background: rgba(239, 68, 68, 0.2);
  border-radius: $border-radius;
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 600;
  transition: $transition-bounce;

  &:hover {
    background: rgba(239, 68, 68, 0.3);
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: $bg-soft;
  border-radius: $border-radius;
  transition: $transition-bounce;

  &:hover {
    background: $bg-muted;
  }
}

.history-password {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  color: $text-primary;
  word-break: break-all;
}

.copy-icon {
  padding: 6px 10px;
  background: transparent;
  border-radius: $border-radius;
  font-size: 0.875rem;
  flex-shrink: 0;
  margin-left: 8px;
  transition: $transition-bounce;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

@include respond-to-down('sm') {
  .password-generator {
    padding: 16px;
  }
  .password-display {
    font-size: 1.1rem;
    padding: 14px;
  }
  .option-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .length-control {
    flex-direction: column;
    gap: 10px;
  }
  .generate-btn {
    width: 100%;
    padding: 14px;
  }
}
</style>
