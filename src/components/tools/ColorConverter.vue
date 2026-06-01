<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex, isValidHex } from '@/utils/color'
import { useCopyToClipboard } from '@/composables/useCopyToClipboard'

const { copyWithStatus, copyStatus } = useCopyToClipboard()

const hexColor = ref('#6366f1')
const rgbColor = ref({ r: 99, g: 102, b: 241 })
const hslColor = ref({ h: 244, s: 90, l: 67 })

const activeFormat = ref<'hex' | 'rgb' | 'hsl'>('hex')

const isDraggingSaturation = ref(false)
const isDraggingLightness = ref(false)
const isDraggingHue = ref(false)

const satBrightRef = ref<HTMLDivElement>()
const hueRef = ref<HTMLDivElement>()
const lightRef = ref<HTMLDivElement>()

const satX = ref(61)
const satY = ref(80)
const lightY = ref(50)
const hueX = ref(61)

const updateFromHsl = () => {
  const h = hslColor.value.h
  const s = hslColor.value.s
  const l = hslColor.value.l

  const rgb = hslToRgb(h, s, l)
  rgbColor.value = rgb
  hexColor.value = rgbToHex(rgb.r, rgb.g, rgb.b)

  satX.value = s
  satY.value = 100 - l
  hueX.value = (h / 360) * 100
  lightY.value = l
}

const updateFromRgb = () => {
  hexColor.value = rgbToHex(rgbColor.value.r, rgbColor.value.g, rgbColor.value.b)
  hslColor.value = rgbToHsl(rgbColor.value.r, rgbColor.value.g, rgbColor.value.b)
}

const updateFromHex = () => {
  const rgb = hexToRgb(hexColor.value)
  if (rgb) {
    rgbColor.value = rgb
    hslColor.value = rgbToHsl(rgb.r, rgb.g, rgb.b)
    satX.value = hslColor.value.s
    satY.value = 100 - hslColor.value.l
    hueX.value = (hslColor.value.h / 360) * 100
    lightY.value = hslColor.value.l
  }
}

const handleColorPickerChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  hexColor.value = target.value
  updateFromHex()
}

const handleSaturationClick = (e: MouseEvent) => {
  if (!satBrightRef.value) return
  const rect = satBrightRef.value.getBoundingClientRect()
  satX.value = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
  satY.value = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
  updateColorFromSliders()
}

const handleHueClick = (e: MouseEvent) => {
  if (!hueRef.value) return
  const rect = hueRef.value.getBoundingClientRect()
  hueX.value = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
  updateColorFromSliders()
}

const handleLightnessClick = (e: MouseEvent) => {
  if (!lightRef.value) return
  const rect = lightRef.value.getBoundingClientRect()
  lightY.value = Math.max(0, Math.min(100, 100 - ((e.clientY - rect.top) / rect.height) * 100))
  updateColorFromSliders()
}

const handleMouseMove = (e: MouseEvent) => {
  if (isDraggingSaturation.value) {
    handleSaturationClick(e)
  } else if (isDraggingHue.value) {
    handleHueClick(e)
  } else if (isDraggingLightness.value) {
    handleLightnessClick(e)
  }
}

const handleMouseUp = () => {
  isDraggingSaturation.value = false
  isDraggingHue.value = false
  isDraggingLightness.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

const startDragSaturation = (e: MouseEvent) => {
  isDraggingSaturation.value = true
  handleSaturationClick(e)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const startDragHue = (e: MouseEvent) => {
  isDraggingHue.value = true
  handleHueClick(e)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const startDragLightness = (e: MouseEvent) => {
  isDraggingLightness.value = true
  handleLightnessClick(e)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const updateColorFromSliders = () => {
  const h = (hueX.value / 100) * 360
  const s = satX.value
  const l = 100 - satY.value

  hslColor.value = { h: Math.round(h), s: Math.round(s), l: Math.round(l) }
  const rgb = hslToRgb(h, s, l)
  rgbColor.value = rgb
  hexColor.value = rgbToHex(rgb.r, rgb.g, rgb.b)
}

const handleHexInput = () => {
  if (isValidHex(hexColor.value)) {
    updateFromHex()
  }
}

const handleRgbChange = () => {
  rgbColor.value.r = Math.max(0, Math.min(255, Math.round(rgbColor.value.r)))
  rgbColor.value.g = Math.max(0, Math.min(255, Math.round(rgbColor.value.g)))
  rgbColor.value.b = Math.max(0, Math.min(255, Math.round(rgbColor.value.b)))
  updateFromRgb()
  satX.value = hslColor.value.s
  satY.value = 100 - hslColor.value.l
  hueX.value = (hslColor.value.h / 360) * 100
  lightY.value = hslColor.value.l
}

const handleHslChange = () => {
  hslColor.value.h = Math.max(0, Math.min(360, Math.round(hslColor.value.h)))
  hslColor.value.s = Math.max(0, Math.min(100, Math.round(hslColor.value.s)))
  hslColor.value.l = Math.max(0, Math.min(100, Math.round(hslColor.value.l)))
  updateFromHsl()
}

const saturationGradient = computed(() => {
  const h = (hueX.value / 100) * 360
  const rgb1 = hslToRgb(h, 0, 50)
  const rgb2 = hslToRgb(h, 100, 50)
  return `linear-gradient(to right, rgb(${rgb1.r}, ${rgb1.g}, ${rgb1.b}), rgb(${rgb2.r}, ${rgb2.g}, ${rgb2.b}))`
})

const lightnessGradient = computed(() => {
  const h = (hueX.value / 100) * 360
  const s = satX.value
  const rgb1 = hslToRgb(h, s, 0)
  const rgb2 = hslToRgb(h, s, 50)
  const rgb3 = hslToRgb(h, s, 100)
  return `linear-gradient(to right, rgb(${rgb1.r}, ${rgb1.g}, ${rgb1.b}), rgb(${rgb2.r}, ${rgb2.g}, ${rgb2.b}), rgb(${rgb3.r}, ${rgb3.g}, ${rgb3.b}))`
})

const colorPreviewStyle = computed(() => ({
  backgroundColor: hexColor.value
}))

const presetColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#78716c', '#64748b', '#1e293b'
]

onMounted(() => {
  updateFromHex()
})
</script>

<template>
  <div class="color-converter">
    <div class="color-preview" :style="colorPreviewStyle">
      <span class="preview-text">{{ hexColor }}</span>
    </div>

    <div class="picker-area">
      <div
        class="saturation-picker"
        :style="{ background: saturationGradient }"
        ref="satBrightRef"
        @mousedown="startDragSaturation"
      >
        <div class="sat-white"></div>
        <div class="sat-black"></div>
        <div
          class="sat-cursor"
          :style="{
            left: satX + '%',
            top: satY + '%',
            backgroundColor: hexColor
          }"
        ></div>
      </div>

      <div class="sliders">
        <div class="slider-row">
          <span class="slider-label">色相</span>
          <div
            class="hue-slider"
            ref="hueRef"
            @mousedown="startDragHue"
          >
            <div
              class="hue-cursor"
              :style="{ left: hueX + '%' }"
            ></div>
          </div>
          <span class="slider-value">{{ hslColor.h }}°</span>
        </div>

        <div class="slider-row">
          <span class="slider-label">明度</span>
          <div
            class="lightness-slider"
            ref="lightRef"
            :style="{ background: lightnessGradient }"
            @mousedown="startDragLightness"
          >
            <div
              class="light-cursor"
              :style="{ top: (100 - lightY) + '%' }"
            ></div>
          </div>
          <span class="slider-value">{{ hslColor.l }}%</span>
        </div>

        <div class="color-picker-row">
          <input
            type="color"
            :value="hexColor"
            @input="handleColorPickerChange"
            class="native-color-picker"
          />
          <input
            v-model="hexColor"
            type="text"
            placeholder="#000000"
            class="hex-input"
            @input="handleHexInput"
          />
        </div>
      </div>
    </div>

    <div class="preset-colors">
      <label class="preset-label">预设颜色</label>
      <div class="preset-grid">
        <button
          v-for="color in presetColors"
          :key="color"
          class="preset-btn"
          :style="{ backgroundColor: color }"
          :class="{ active: hexColor === color }"
          @click="hexColor = color; updateFromHex()"
        />
      </div>
    </div>

    <div class="format-tabs">
      <button
        :class="['tab', { active: activeFormat === 'hex' }]"
        @click="activeFormat = 'hex'"
      >
        HEX
      </button>
      <button
        :class="['tab', { active: activeFormat === 'rgb' }]"
        @click="activeFormat = 'rgb'"
      >
        RGB
      </button>
      <button
        :class="['tab', { active: activeFormat === 'hsl' }]"
        @click="activeFormat = 'hsl'"
      >
        HSL
      </button>
    </div>

    <div class="input-section">
      <div v-show="activeFormat === 'hex'" class="input-group">
        <label>HEX 值</label>
        <div class="input-wrapper">
          <input
            v-model="hexColor"
            type="text"
            placeholder="#000000"
            @input="handleHexInput"
          />
          <button
            class="copy-btn"
            @click="copyWithStatus(hexColor, 'HEX')"
          >
            <template v-if="copyStatus === 'HEX'"><svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 已复制!</template>
            <template v-else>复制</template>
          </button>
        </div>
      </div>

      <div v-show="activeFormat === 'rgb'" class="input-group rgb-inputs">
        <label>RGB 值</label>
        <div class="rgb-grid">
          <div class="rgb-item">
            <span class="rgb-label">R</span>
            <input
              v-model.number="rgbColor.r"
              type="number"
              min="0"
              max="255"
              @change="handleRgbChange"
            />
          </div>
          <div class="rgb-item">
            <span class="rgb-label">G</span>
            <input
              v-model.number="rgbColor.g"
              type="number"
              min="0"
              max="255"
              @change="handleRgbChange"
            />
          </div>
          <div class="rgb-item">
            <span class="rgb-label">B</span>
            <input
              v-model.number="rgbColor.b"
              type="number"
              min="0"
              max="255"
              @change="handleRgbChange"
            />
          </div>
        </div>
        <button
          class="copy-btn full-width"
          @click="copyWithStatus(`rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`, 'RGB')"
        >
          <template v-if="copyStatus === 'RGB'"><svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 已复制!</template>
          <template v-else>复制 RGB 值</template>
        </button>
      </div>

      <div v-show="activeFormat === 'hsl'" class="input-group hsl-inputs">
        <label>HSL 值</label>
        <div class="hsl-grid">
          <div class="hsl-item">
            <span class="hsl-label">H</span>
            <input
              v-model.number="hslColor.h"
              type="number"
              min="0"
              max="360"
              @change="handleHslChange"
            />
            <span class="hsl-unit">°</span>
          </div>
          <div class="hsl-item">
            <span class="hsl-label">S</span>
            <input
              v-model.number="hslColor.s"
              type="number"
              min="0"
              max="100"
              @change="handleHslChange"
            />
            <span class="hsl-unit">%</span>
          </div>
          <div class="hsl-item">
            <span class="hsl-label">L</span>
            <input
              v-model.number="hslColor.l"
              type="number"
              min="0"
              max="100"
              @change="handleHslChange"
            />
            <span class="hsl-unit">%</span>
          </div>
        </div>
        <button
          class="copy-btn full-width"
          @click="copyWithStatus(`hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`, 'HSL')"
        >
          <template v-if="copyStatus === 'HSL'"><svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 已复制!</template>
          <template v-else>复制 HSL 值</template>
        </button>
      </div>
    </div>

    <div class="color-values">
      <div class="value-item" @click="copyWithStatus(hexColor, 'HEX')">
        <span class="value-label">HEX</span>
        <span class="value-text">{{ hexColor }}</span>
      </div>
      <div class="value-item" @click="copyWithStatus(`rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`, 'RGB')">
        <span class="value-label">RGB</span>
        <span class="value-text">rgb({{ rgbColor.r }}, {{ rgbColor.g }}, {{ rgbColor.b }})</span>
      </div>
      <div class="value-item" @click="copyWithStatus(`hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`, 'HSL')">
        <span class="value-label">HSL</span>
        <span class="value-text">hsl({{ hslColor.h }}, {{ hslColor.s }}%, {{ hslColor.l }}%)</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.color-converter {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.color-preview {
  height: 80px;
  border-radius: $border-radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease;
  box-shadow: $shadow-md;
}

.preview-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.picker-area {
  display: flex;
  gap: 16px;
  align-items: flex-start;

  @media (max-width: 500px) {
    flex-direction: column;
  }
}

.saturation-picker {
  position: relative;
  width: 240px;
  height: 160px;
  border-radius: $border-radius;
  cursor: crosshair;
  flex-shrink: 0;

  @media (max-width: 500px) {
    width: 100%;
    height: 140px;
  }
}

.sat-white {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, #fff, transparent);
  border-radius: $border-radius;
}

.sat-black {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #000, transparent);
  border-radius: $border-radius;
}

.sat-cursor {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 3px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5), inset 0 0 2px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 2;
}

.sliders {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.color-picker-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 8px;
}

.native-color-picker {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: $border-radius;
  cursor: pointer;
  padding: 0;
  background: transparent;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: 2px solid rgba($primary, 0.12);
    border-radius: $border-radius;
  }
}

.hex-input {
  flex: 1;
  padding: 10px 14px;
  @include glass-card;
  border-radius: $border-radius;
  color: $text-primary;
  font-size: 1rem;
  font-weight: 600;
  border: 1px solid transparent;
  transition: $transition-normal;

  &:focus {
    border-color: $primary;
  }

  &::placeholder {
    color: $text-muted;
  }
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: $text-muted;
  width: 32px;
  flex-shrink: 0;
}

.slider-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: $text-secondary;
  width: 40px;
  text-align: right;
  flex-shrink: 0;
}

.hue-slider {
  position: relative;
  flex: 1;
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(to right,
    #ff0000 0%,
    #ffff00 17%,
    #00ff00 33%,
    #00ffff 50%,
    #0000ff 67%,
    #ff00ff 83%,
    #ff0000 100%
  );
  cursor: pointer;
}

.hue-cursor {
  position: absolute;
  top: 50%;
  width: 8px;
  height: 20px;
  background: white;
  border: 2px solid white;
  border-radius: 4px;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.lightness-slider {
  position: relative;
  flex: 1;
  height: 16px;
  border-radius: 8px;
  cursor: pointer;
}

.light-cursor {
  position: absolute;
  left: 0;
  width: 100%;
  height: 20px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 3px solid white;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
}

.color-picker-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 8px;
}

.native-color-picker {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: $border-radius;
  cursor: pointer;
  padding: 0;
  background: transparent;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: 2px solid rgba($primary, 0.12);
    border-radius: $border-radius;
  }
}

.hex-input {
  flex: 1;
  padding: 10px 14px;
  @include glass-card;
  border-radius: $border-radius;
  color: $text-primary;
  font-size: 1rem;
  font-weight: 600;
  border: 1px solid transparent;
  transition: $transition-normal;

  &:focus {
    border-color: $primary;
  }

  &::placeholder {
    color: $text-muted;
  }
}

.preset-colors {
  @include glass-card;
  border-radius: $border-radius-lg;
  padding: 20px;
}

.preset-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 8px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(5, 1fr);
  }
}

.preset-btn {
  aspect-ratio: 1;
  border-radius: $border-radius;
  border: 2px solid transparent;
  cursor: pointer;
  transition: $transition-bounce;

  &:hover {
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &.active {
    border-color: white;
    box-shadow: 0 0 0 2px $primary;
  }
}

.format-tabs {
  display: flex;
  gap: 8px;
  padding: 4px;
  @include glass-card;
  border-radius: $border-radius-lg;
}

.tab {
  flex: 1;
  padding: 10px 16px;
  background: transparent;
  border-radius: $border-radius;
  color: $text-secondary;
  font-weight: 600;
  font-size: 0.875rem;
  transition: $transition-bounce;

  &:hover {
    color: $text-primary;
  }

  &.active {
    background: $gradient-primary;
    color: white;
  }
}

.input-section {
  @include glass-card;
  border-radius: $border-radius-lg;
  padding: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

.input-wrapper {
  display: flex;
  gap: 12px;

  input {
    flex: 1;
    padding: 12px 16px;
    @include glass-card;
    border-radius: $border-radius;
    color: $text-primary;
    font-size: 1rem;
    font-weight: 600;
    border: 1px solid transparent;
    transition: $transition-normal;

    &:focus {
      border-color: $primary;
    }

    &::placeholder {
      color: $text-muted;
    }
  }
}

.copy-btn {
  padding: 12px 16px;
  @include glass-card;
  border-radius: $border-radius;
  color: $text-secondary;
  font-weight: 600;
  font-size: 1rem;
  transition: $transition-bounce;

  &:hover {
    @include glass-card-hover;
    color: $text-primary;
  }

  &.full-width {
    width: 100%;
    margin-top: 8px;
  }
}

.rgb-grid, .hsl-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.rgb-item, .hsl-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .rgb-label, .hsl-label {
    font-size: 0.625rem;
    font-weight: 600;
    color: $text-muted;
    text-transform: uppercase;
  }

  input {
    padding: 10px 12px;
    @include glass-card;
    border-radius: $border-radius;
    color: $text-primary;
    font-size: 0.875rem;
    font-weight: 600;
    border: 1px solid transparent;
    transition: $transition-normal;
    width: 100%;

    &:focus {
      border-color: $primary;
    }

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
}

.hsl-unit {
  font-size: 0.75rem;
  color: $text-muted;
  margin-top: -4px;
}

.color-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.value-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  @include glass-card;
  border-radius: $border-radius;
  cursor: pointer;
  transition: $transition-bounce;

  &:hover {
    @include glass-card-hover;
    transform: translateX(4px);
  }
}

.value-label {
  font-size: 0.625rem;
  font-weight: 600;
  color: $text-muted;
  text-transform: uppercase;
}

.value-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: $text-primary;
  font-family: 'Monaco', 'Menlo', monospace;
}

@include respond-to-down('sm') {
  .color-preview {
    width: 80px;
    height: 80px;
  }
  .color-picker-row {
    flex-wrap: wrap;
    gap: 8px;
  }
  .slider-row {
    flex-wrap: wrap;
  }
  .copy-btn {
    font-size: 0.8rem;
    padding: 6px 12px;
  }
}
</style>
