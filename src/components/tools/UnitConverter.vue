<script setup lang="ts">
import { ref, computed } from 'vue'

type UnitCategory = 'length' | 'area' | 'volume' | 'weight' | 'temperature' | 'speed' | 'data'

interface UnitDef {
  name: string
  toBase: (v: number) => number
  fromBase: (v: number) => number
}

const categoryIcons: Record<string, string> = {
  ruler: 'M21 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-2 7h-2v-2h2v2zm-4 0h-2v-2h2v2zm-4 0H9v-2h2v2zm-4 0H5v-2h2v2z',
  triangle: 'M3 21L12 3L21 21H3ZM12 7L7.5 17H16.5L12 7Z',
  cube: 'M21 16.5C21 16.5 21 16.5 21 16.5L12.875 21.125C12.375 21.375 11.625 21.375 11.125 21.125L3 16.5M12 2.875L21 8.25V16.5L12 21.125L3 16.5V8.25L12 2.875ZM12 12L21 8.25M12 12V21.125M12 12L3 8.25',
  scale: 'M12 3V3.01M8 7H16L12 3L8 7ZM3 12H6L12 7L18 12H21L12 21L3 12ZM6 15L12 9L18 15',
  thermometer: 'M14 14.76V3.5C14 2.12 12.88 1 11.5 1C10.12 1 9 2.12 9 3.5V14.76C7.22 15.98 6.5 18.24 7.62 20.28C8.74 22.32 11.24 23.04 13.28 21.92C15.32 20.8 16.04 18.24 14.92 16.2C14.54 15.52 14 14.76 14 14.76ZM11.5 18C10.67 18 10 17.33 10 16.5C10 15.67 10.67 15 11.5 15C12.33 15 13 15.67 13 16.5C13 17.33 12.33 18 11.5 18Z',
  gauge: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v4.35l3.4 2.05-1 1.7L11 11.5V6z',
  database: 'M12 2C6.48 2 2 4.02 2 6.5S6.48 11 12 11s10-2.02 10-4.5S17.52 2 12 2zM2 17.5C2 20 6.48 22 12 22s10-2 10-4.5V14c0 2.5-4.48 4.5-10 4.5S2 16.5 2 14v3.5zM2 14c0 2.5 4.48 4.5 10 4.5s10-2 10-4.5v-3.5C22 13 17.52 15 12 15S2 13 2 10.5V14z'
}

const categories: { key: UnitCategory; label: string; icon: string }[] = [
  { key: 'length', label: '长度', icon: 'ruler' },
  { key: 'area', label: '面积', icon: 'triangle' },
  { key: 'volume', label: '体积', icon: 'cube' },
  { key: 'weight', label: '重量', icon: 'scale' },
  { key: 'temperature', label: '温度', icon: 'thermometer' },
  { key: 'speed', label: '速度', icon: 'gauge' },
  { key: 'data', label: '数据', icon: 'database' },
]

const units: Record<UnitCategory, UnitDef[]> = {
  length: [
    { name: '千米(km)', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { name: '米(m)', toBase: v => v, fromBase: v => v },
    { name: '分米(dm)', toBase: v => v / 10, fromBase: v => v * 10 },
    { name: '厘米(cm)', toBase: v => v / 100, fromBase: v => v * 100 },
    { name: '毫米(mm)', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { name: '英里(mi)', toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
    { name: '码(yd)', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
    { name: '英尺(ft)', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
    { name: '英寸(in)', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
    { name: '里', toBase: v => v * 500, fromBase: v => v / 500 },
    { name: '丈', toBase: v => v * 10 / 3, fromBase: v => v * 3 / 10 },
    { name: '尺', toBase: v => v / 3, fromBase: v => v * 3 },
    { name: '寸', toBase: v => v / 30, fromBase: v => v * 30 },
  ],
  area: [
    { name: '平方千米(km²)', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
    { name: '公顷(ha)', toBase: v => v * 1e4, fromBase: v => v / 1e4 },
    { name: '亩', toBase: v => v * 666.667, fromBase: v => v / 666.667 },
    { name: '平方米(m²)', toBase: v => v, fromBase: v => v },
    { name: '平方分米(dm²)', toBase: v => v / 100, fromBase: v => v * 100 },
    { name: '平方厘米(cm²)', toBase: v => v / 1e4, fromBase: v => v * 1e4 },
    { name: '英亩(ac)', toBase: v => v * 4046.856, fromBase: v => v / 4046.856 },
    { name: '平方英里(mi²)', toBase: v => v * 2589988.11, fromBase: v => v / 2589988.11 },
  ],
  volume: [
    { name: '立方米(m³)', toBase: v => v, fromBase: v => v },
    { name: '升(L)', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { name: '毫升(mL)', toBase: v => v / 1e6, fromBase: v => v * 1e6 },
    { name: '加仑(gal)', toBase: v => v * 0.003785, fromBase: v => v / 0.003785 },
    { name: '品脱(pt)', toBase: v => v * 0.000473, fromBase: v => v / 0.000473 },
    { name: '立方厘米(cm³)', toBase: v => v / 1e6, fromBase: v => v * 1e6 },
  ],
  weight: [
    { name: '吨(t)', toBase: v => v * 1000, fromBase: v => v / 1000 },
    { name: '千克(kg)', toBase: v => v, fromBase: v => v },
    { name: '克(g)', toBase: v => v / 1000, fromBase: v => v * 1000 },
    { name: '毫克(mg)', toBase: v => v / 1e6, fromBase: v => v * 1e6 },
    { name: '磅(lb)', toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
    { name: '盎司(oz)', toBase: v => v * 0.0283495, fromBase: v => v / 0.0283495 },
    { name: '斤', toBase: v => v * 0.5, fromBase: v => v / 0.5 },
    { name: '两', toBase: v => v * 0.05, fromBase: v => v / 0.05 },
  ],
  temperature: [
    { name: '摄氏度(°C)', toBase: v => v, fromBase: v => v },
    { name: '华氏度(°F)', toBase: v => (v - 32) * 5 / 9, fromBase: v => v * 9 / 5 + 32 },
    { name: '开尔文(K)', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
  ],
  speed: [
    { name: '米/秒(m/s)', toBase: v => v, fromBase: v => v },
    { name: '千米/时(km/h)', toBase: v => v / 3.6, fromBase: v => v * 3.6 },
    { name: '英里/时(mph)', toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
    { name: '节(kn)', toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
    { name: '马赫(Ma)', toBase: v => v * 340.29, fromBase: v => v / 340.29 },
  ],
  data: [
    { name: 'TB', toBase: v => v * 1099511627776, fromBase: v => v / 1099511627776 },
    { name: 'GB', toBase: v => v * 1073741824, fromBase: v => v / 1073741824 },
    { name: 'MB', toBase: v => v * 1048576, fromBase: v => v / 1048576 },
    { name: 'KB', toBase: v => v * 1024, fromBase: v => v / 1024 },
    { name: 'B', toBase: v => v, fromBase: v => v },
    { name: 'bit', toBase: v => v / 8, fromBase: v => v * 8 },
  ],
}

const activeCategory = ref<UnitCategory>('length')
const fromUnit = ref(0)
const toUnit = ref(1)
const inputValue = ref(1)

const currentUnits = computed(() => units[activeCategory.value])

const result = computed(() => {
  const unitList = currentUnits.value
  if (!unitList[fromUnit.value] || !unitList[toUnit.value]) return 0
  const base = unitList[fromUnit.value].toBase(inputValue.value)
  return unitList[toUnit.value].fromBase(base)
})

const switchUnits = () => {
  const temp = fromUnit.value
  fromUnit.value = toUnit.value
  toUnit.value = temp
}

const setCategory = (cat: UnitCategory) => {
  activeCategory.value = cat
  fromUnit.value = 0
  toUnit.value = 1
}

const formatResult = (val: number) => {
  if (Number.isNaN(val) || !Number.isFinite(val)) return '0'
  if (Math.abs(val) < 0.000001) return val.toExponential(6)
  if (Math.abs(val) > 1e12) return val.toExponential(6)
  const str = val.toPrecision(10)
  return parseFloat(str).toString()
}
</script>

<template>
  <div class="unit-converter">
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.key"
        :class="['cat-btn', { active: activeCategory === cat.key }]"
        @click="setCategory(cat.key)"
      >
        <span class="cat-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="categoryIcons[cat.icon]"/></svg>
        </span>
        <span class="cat-label">{{ cat.label }}</span>
      </button>
    </div>

    <div class="converter-card">
      <div class="converter-row">
        <div class="input-group">
          <select v-model.number="fromUnit" class="unit-select">
            <option v-for="(u, i) in currentUnits" :key="i" :value="i">{{ u.name }}</option>
          </select>
          <input
            v-model.number="inputValue"
            type="number"
            class="value-input"
          />
        </div>

        <button class="switch-btn" @click="switchUnits" aria-label="交换单位">
          ⇄
        </button>

        <div class="input-group">
          <select v-model.number="toUnit" class="unit-select">
            <option v-for="(u, i) in currentUnits" :key="i" :value="i">{{ u.name }}</option>
          </select>
          <div class="value-display">{{ formatResult(result) }}</div>
        </div>
      </div>
    </div>

    <div class="all-results">
      <div class="results-title">全部换算结果</div>
      <div class="results-grid">
        <div
          v-for="(u, i) in currentUnits"
          :key="i"
          :class="['result-item', { highlight: i === toUnit }]"
        >
          <span class="result-value">{{ formatResult(u.fromBase(currentUnits[fromUnit].toBase(inputValue))) }}</span>
          <span class="result-unit">{{ u.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.unit-converter {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 16px;
  @include glass-card;
  border-radius: $border-radius-lg;
}

.cat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid $bg-muted;
  border-radius: $border-radius;
  color: $text-secondary;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: $transition-fast;
  cursor: pointer;

  &:hover {
    background: $bg-muted;
  }

  &.active {
    background: rgba($primary, 0.15);
    border-color: $primary;
    color: $text-primary;
    box-shadow: 0 0 12px rgba($primary, 0.2);
  }
}

.cat-icon {
  font-size: 1rem;
}

.converter-card {
  padding: 24px;
  @include glass-card;
  border-radius: $border-radius-lg;
}

.converter-row {
  display: flex;
  align-items: center;
  gap: 16px;

  @include respond-to('sm') {
    flex-direction: column;
  }
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.unit-select {
  padding: 10px 14px;
  background: $bg-muted;
  border: 1px solid rgba($primary, 0.08);
  border-radius: $border-radius;
  color: $text-primary;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  option {
    background: #1a1b1e;
    color: white;
  }
}

.value-input {
  padding: 14px;
  background: $bg-muted;
  border: 1px solid rgba($primary, 0.08);
  border-radius: $border-radius;
  color: $text-primary;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;

  &:focus {
    border-color: $primary;
  }
}

.value-display {
  padding: 14px;
  background: rgba($primary, 0.06);
  border: 1px solid rgba($primary, 0.2);
  border-radius: $border-radius;
  color: $primary-light;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.switch-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: $gradient-primary;
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: $transition-bounce;

  &:hover {
    transform: scale(1.1);
  }
}

.all-results {
  @include glass-card;
  border-radius: $border-radius-lg;
  padding: 16px 20px;
}

.results-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 12px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.result-item {
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid $bg-muted;
  border-radius: $border-radius;
  transition: $transition-fast;

  &.highlight {
    background: rgba($primary, 0.06);
    border-color: rgba($primary, 0.3);
  }
}

.result-value {
  display: block;
  font-size: 0.9375rem;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 2px;
  word-break: break-all;
}

.result-unit {
  font-size: 0.75rem;
  color: $text-muted;
}

@include respond-to-down('sm') {
  .converter-row {
    flex-direction: column;
    gap: 12px;
  }
  .value-input {
    width: 100%;
  }
  .category-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 6px;
    padding-bottom: 4px;
  }
  .cat-btn {
    flex-shrink: 0;
    font-size: 0.8rem;
    padding: 8px 14px;
  }
  .value-display {
    font-size: 1.25rem;
    padding: 16px;
  }
}
</style>
