import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface AppSettings {
  theme: 'dark' | 'light'
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large'
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  reducedMotion: false,
  fontSize: 'medium',
}

const STORAGE_KEY = 'vue3-tools-settings'

function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) }
    }
  } catch {
    // ignore
  }
  return { ...defaultSettings }
}

function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

export const useAppStore = defineStore('app', () => {
  const settings = ref<AppSettings>(loadSettings())

  const theme = computed({
    get: () => settings.value.theme,
    set: (val: 'dark' | 'light') => {
      settings.value.theme = val
      saveSettings(settings.value)
    },
  })

  const reducedMotion = computed({
    get: () => settings.value.reducedMotion,
    set: (val: boolean) => {
      settings.value.reducedMotion = val
      saveSettings(settings.value)
    },
  })

  const fontSize = computed({
    get: () => settings.value.fontSize,
    set: (val: 'small' | 'medium' | 'large') => {
      settings.value.fontSize = val
      saveSettings(settings.value)
    },
  })

  const fontSizeValue = computed(() => {
    const map = { small: '14px', medium: '16px', large: '18px' }
    return map[settings.value.fontSize]
  })

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return {
    settings,
    theme,
    reducedMotion,
    fontSize,
    fontSizeValue,
    toggleTheme,
  }
})
