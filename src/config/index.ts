export const APP_NAME = '效率工具'

export const APP_DESCRIPTION = '一站式效率工具平台'

export const CATEGORY_MAP: Record<string, string> = {
  image: '图片工具',
  text: '文本工具',
  converter: '转换工具',
  dev: '开发工具',
  security: '安全工具',
  utility: '实用工具',
  life: '生活工具',
}

export const FILE_SIZE_LIMIT = 50 * 1024 * 1024

export const COPY_FEEDBACK_DURATION = 2000

export const SCROLL_THRESHOLD = 300

export const STORAGE_KEYS = {
  CATEGORY: 'vue3-tools-category',
  SCROLL: 'vue3-tools-scroll',
  CLIPBOARD_HISTORY: 'vue3-tools-clipboard',
  COUNTDOWN_PRESETS: 'vue3-tools-countdown',
  PASSWORD_HISTORY: 'vue3-tools-password-history',
  THEME: 'vue3-tools-theme',
  FONT_SIZE: 'vue3-tools-font-size',
} as const

export const ROUTE_NAMES = {
  HOME: 'home',
  TOOL_DETAIL: 'tool-detail',
} as const