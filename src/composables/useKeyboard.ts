import { onMounted, onBeforeUnmount } from 'vue'

export function useDebounce(fn: (...args: any[]) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: any[]) => {
    if (timer !== null) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }

  onBeforeUnmount(() => {
    if (timer !== null) {
      clearTimeout(timer)
    }
  })

  return debounced
}

export function useKeyboardShortcut(key: string, callback: () => void, ctrlKey = false) {
  const handler = (e: KeyboardEvent) => {
    if (e.key === key && (!ctrlKey || e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      callback()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handler)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handler)
  })
}
