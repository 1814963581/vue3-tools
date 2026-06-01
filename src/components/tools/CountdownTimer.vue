<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

type TimerMode = 'countdown' | 'stopwatch'

const mode = ref<TimerMode>('countdown')

const inputHours = ref(0)
const inputMinutes = ref(5)
const inputSeconds = ref(0)

const countdownTime = ref(0)
const stopwatchTime = ref(0)

const isRunning = ref(false)
const isPaused = ref(false)

let intervalId: number | undefined

const displayTime = computed(() => {
  const time = mode.value === 'countdown' ? countdownTime.value : stopwatchTime.value
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = time % 60
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
    total: time
  }
})

const progress = computed(() => {
  if (mode.value === 'countdown') {
    const total = inputHours.value * 3600 + inputMinutes.value * 60 + inputSeconds.value
    if (total === 0) return 0
    return ((total - countdownTime.value) / total) * 100
  }
  return 0
})

const totalCountdownSeconds = computed(() => {
  return inputHours.value * 3600 + inputMinutes.value * 60 + inputSeconds.value
})

const startCountdown = () => {
  if (totalCountdownSeconds.value === 0) return

  countdownTime.value = totalCountdownSeconds.value
  isRunning.value = true
  isPaused.value = false

  intervalId = window.setInterval(() => {
    if (countdownTime.value > 0) {
      countdownTime.value--
    } else {
      stopTimer()
    }
  }, 1000)
}

const startStopwatch = () => {
  isRunning.value = true
  isPaused.value = false

  intervalId = window.setInterval(() => {
    stopwatchTime.value++
  }, 1000)
}

const pauseTimer = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = undefined
  }
  isPaused.value = true
}

const resumeTimer = () => {
  isPaused.value = false

  if (mode.value === 'countdown') {
    intervalId = window.setInterval(() => {
      if (countdownTime.value > 0) {
        countdownTime.value--
      } else {
        stopTimer()
      }
    }, 1000)
  } else {
    intervalId = window.setInterval(() => {
      stopwatchTime.value++
    }, 1000)
  }
}

const stopTimer = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = undefined
  }
  isRunning.value = false
  isPaused.value = false
}

const resetTimer = () => {
  stopTimer()
  countdownTime.value = 0
  stopwatchTime.value = 0
}

const switchMode = (newMode: TimerMode) => {
  stopTimer()
  mode.value = newMode
  countdownTime.value = 0
  stopwatchTime.value = 0
}

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="countdown-timer">
    <div class="mode-tabs">
      <button
        :class="['mode-tab', { active: mode === 'countdown' }]"
        @click="switchMode('countdown')"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="13" r="8"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="13" x2="15" y2="13"/>
          <line x1="9" y1="1" x2="15" y2="1"/>
        </svg>
        倒计时
      </button>
      <button
        :class="['mode-tab', { active: mode === 'stopwatch' }]"
        @click="switchMode('stopwatch')"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="13" r="8"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="13" x2="15" y2="13"/>
        </svg>
        秒表
      </button>
    </div>

    <div class="timer-display">
      <div class="progress-ring" v-if="mode === 'countdown' && isRunning">
        <svg class="progress-svg" viewBox="0 0 200 200">
          <circle
            class="progress-bg"
            cx="100"
            cy="100"
            r="90"
          />
          <circle
            class="progress-fill"
            cx="100"
            cy="100"
            r="90"
            :stroke-dasharray="565.48"
            :stroke-dashoffset="565.48 * (1 - progress / 100)"
          />
        </svg>
      </div>

      <div class="time-digits">
        <span class="digit-group">
          <span class="digit">{{ displayTime.hours[0] }}</span>
          <span class="digit">{{ displayTime.hours[1] }}</span>
        </span>
        <span class="separator">:</span>
        <span class="digit-group">
          <span class="digit">{{ displayTime.minutes[0] }}</span>
          <span class="digit">{{ displayTime.minutes[1] }}</span>
        </span>
        <span class="separator">:</span>
        <span class="digit-group">
          <span class="digit">{{ displayTime.seconds[0] }}</span>
          <span class="digit">{{ displayTime.seconds[1] }}</span>
        </span>
      </div>
    </div>

    <div v-if="mode === 'countdown' && !isRunning" class="time-input-section">
      <div class="input-row">
        <div class="input-group">
          <label>时</label>
          <input
            type="number"
            v-model.number="inputHours"
            min="0"
            max="99"
            class="time-input"
          />
        </div>
        <span class="input-separator">:</span>
        <div class="input-group">
          <label>分</label>
          <input
            type="number"
            v-model.number="inputMinutes"
            min="0"
            max="59"
            class="time-input"
          />
        </div>
        <span class="input-separator">:</span>
        <div class="input-group">
          <label>秒</label>
          <input
            type="number"
            v-model.number="inputSeconds"
            min="0"
            max="59"
            class="time-input"
          />
        </div>
      </div>

      <div class="preset-buttons">
        <button class="preset-btn" @click="inputMinutes = 5; inputSeconds = 0">5分钟</button>
        <button class="preset-btn" @click="inputMinutes = 10; inputSeconds = 0">10分钟</button>
        <button class="preset-btn" @click="inputMinutes = 15; inputSeconds = 0">15分钟</button>
        <button class="preset-btn" @click="inputMinutes = 25; inputSeconds = 0">25分钟</button>
        <button class="preset-btn" @click="inputMinutes = 30; inputSeconds = 0">30分钟</button>
        <button class="preset-btn" @click="inputHours = 1; inputMinutes = 0; inputSeconds = 0">1小时</button>
      </div>
    </div>

    <div class="control-buttons">
      <template v-if="!isRunning">
        <button
          v-if="mode === 'countdown'"
          class="control-btn start"
          @click="startCountdown"
          :disabled="totalCountdownSeconds === 0"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          开始
        </button>
        <button
          v-else
          class="control-btn start"
          @click="startStopwatch"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          开始
        </button>
      </template>

      <template v-else>
        <button
          v-if="!isPaused"
          class="control-btn pause"
          @click="pauseTimer"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
          暂停
        </button>
        <button
          v-else
          class="control-btn resume"
          @click="resumeTimer"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          继续
        </button>
        <button
          class="control-btn stop"
          @click="stopTimer"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2"/>
          </svg>
          停止
        </button>
      </template>

      <button
        v-if="isRunning || (mode === 'countdown' && countdownTime > 0)"
        class="control-btn reset"
        @click="resetTimer"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        重置
      </button>
    </div>

    <div v-if="mode === 'countdown' || isRunning" class="timer-info">
      <div v-if="mode === 'countdown'" class="info-item">
        <span class="info-label">设置时间</span>
        <span class="info-value">
          {{ inputHours.toString().padStart(2, '0') }}:{{ inputMinutes.toString().padStart(2, '0') }}:{{ inputSeconds.toString().padStart(2, '0') }}
        </span>
      </div>
      <div v-if="isRunning" class="info-item">
        <span class="info-label">状态</span>
        <span class="info-value status" :class="{ running: !isPaused, paused: isPaused }">
          {{ isPaused ? '已暂停' : '运行中' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.countdown-timer {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.mode-tabs {
  display: flex;
  gap: 8px;
  padding: 6px;
  @include glass-card;
  border-radius: $border-radius-lg;
}

.mode-tab {
  padding: 12px 24px;
  background: transparent;
  border-radius: $border-radius;
  color: $text-secondary;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: $transition-bounce;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: $text-primary;
  }

  &.active {
    background: $gradient-primary;
    color: white;
  }

  .icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    display: inline-block;
  }
}

.timer-display {
  position: relative;
  width: 280px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  @include glass-card;
  border-radius: 50%;
}

.progress-ring {
  position: absolute;
  inset: -10px;
}

.progress-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-bg {
  fill: none;
  stroke: rgba($primary, 0.08);
  stroke-width: 8;
}

.progress-fill {
  fill: none;
  stroke: url($gradient-primary);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
}

.time-digits {
  display: flex;
  align-items: center;
  gap: 4px;
}

.digit-group {
  display: flex;
  gap: 2px;
}

.digit {
  font-size: 3rem;
  font-weight: 700;
  color: $text-primary;
  font-family: 'Monaco', 'Menlo', monospace;

  @media (max-width: 400px) {
    font-size: 2.5rem;
  }
}

.separator {
  font-size: 3rem;
  font-weight: 700;
  color: $primary;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.time-input-section {
  @include glass-card;
  border-radius: $border-radius-lg;
  padding: 24px;
  width: 100%;
}

.input-row {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  gap: 12px;
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: $text-muted;
  }
}

.time-input {
  width: 80px;
  padding: 12px;
  @include glass-card;
  border-radius: $border-radius;
  color: $text-primary;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  border: 1px solid transparent;

  &:focus {
    border-color: $primary;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
}

.input-separator {
  font-size: 2rem;
  font-weight: 700;
  color: $primary;
  margin-bottom: 10px;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.preset-btn {
  padding: 8px 16px;
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

.control-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.control-btn {
  padding: 14px 28px;
  border-radius: $border-radius-lg;
  font-size: 1rem;
  font-weight: 600;
  transition: $transition-bounce;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  .icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.start {
    background: $gradient-primary;
    color: white;

    &:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: $shadow-glow;
    }
  }

  &.pause {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;

    &:hover {
      background: rgba(245, 158, 11, 0.3);
    }
  }

  &.resume {
    background: $gradient-success;
    color: white;

    &:hover {
      transform: scale(1.05);
    }
  }

  &.stop {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;

    &:hover {
      background: rgba(239, 68, 68, 0.3);
    }
  }

  &.reset {
    background: $bg-soft;
    color: $text-secondary;

    &:hover {
      background: rgba($primary, 0.08);
      color: $text-primary;
    }
  }
}

.timer-info {
  display: flex;
  gap: 24px;
  @include glass-card;
  border-radius: $border-radius-lg;
  padding: 16px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.info-label {
  font-size: 0.75rem;
  color: $text-muted;
}

.info-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: $text-primary;

  &.status {
    &.running {
      color: $success;
    }
    &.paused {
      color: #f59e0b;
    }
  }
}

@include respond-to-down('sm') {
  .timer-display {
    font-size: 3rem;
  }
  .control-buttons {
    flex-wrap: wrap;
    gap: 10px;
  }
  .control-btn {
    padding: 12px 20px;
    font-size: 0.85rem;
  }
  .mode-tabs {
    gap: 6px;
  }
  .mode-tab {
    padding: 8px 14px;
    font-size: 0.8rem;
  }
  .preset-buttons {
    flex-wrap: wrap;
    gap: 8px;
  }
  .preset-btn {
    padding: 6px 12px;
    font-size: 0.75rem;
  }
  .time-input {
    width: 70px;
    font-size: 1.5rem;
  }
}
</style>
