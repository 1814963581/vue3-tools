import { ref } from 'vue'

export function useCopyToClipboard() {
  const isCopied = ref(false)
  const copyStatus = ref('')
  const error = ref<string | null>(null)

  const copyText = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : '复制失败'
      return false
    }
  }

  const copy = async (text: string) => {
    const success = await copyText(text)
    if (success) {
      isCopied.value = true
      setTimeout(() => {
        isCopied.value = false
      }, 2000)
    }
  }

  const copyWithStatus = async (text: string, status: string) => {
    const success = await copyText(text)
    if (success) {
      copyStatus.value = status
      setTimeout(() => {
        copyStatus.value = ''
      }, 2000)
    }
  }

  return { isCopied, copyStatus, error, copy, copyText, copyWithStatus }
}