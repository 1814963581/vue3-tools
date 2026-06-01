import { ref, type Ref } from 'vue'
import { logger } from '@/services/logger'

export interface ToolErrorState {
  message: Ref<string>
  set: (msg: string, context?: string) => void
  clear: () => void
  hasError: () => boolean
}

export function useToolError(moduleName: string): ToolErrorState {
  const message = ref('')

  function set(msg: string, context?: string) {
    message.value = msg
    if (context) {
      logger.warn(moduleName, context, { error: msg })
    }
  }

  function clear() {
    message.value = ''
  }

  function hasError(): boolean {
    return message.value !== ''
  }

  return {
    message,
    set,
    clear,
    hasError,
  }
}