import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(key: string, initialValue: T): Ref<T> {
  let storedValue: T = initialValue
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      storedValue = JSON.parse(stored)
    }
  } catch {
    // ignore corrupted data
  }

  const value = ref<T>(storedValue) as Ref<T>

  watch(value, (newValue) => {
    try {
      localStorage.setItem(key, JSON.stringify(newValue))
    } catch {
      // ignore storage quota exceeded
    }
  }, { deep: true })

  return value
}

export function useSessionStorage<T>(key: string, initialValue: T): Ref<T> {
  let storedValue: T = initialValue
  try {
    const stored = sessionStorage.getItem(key)
    if (stored) {
      storedValue = JSON.parse(stored)
    }
  } catch {
    // ignore corrupted data
  }

  const value = ref<T>(storedValue) as Ref<T>

  watch(value, (newValue) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(newValue))
    } catch {
      // ignore storage quota exceeded
    }
  }, { deep: true })

  return value
}
