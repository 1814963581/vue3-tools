import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockLocalStorage.store[key] = value }),
  removeItem: vi.fn((key: string) => { delete mockLocalStorage.store[key] }),
  clear: vi.fn(() => { mockLocalStorage.store = {} }),
}

vi.stubGlobal('localStorage', mockLocalStorage)

import { useLocalStorage } from '@/composables/useStorage'
import { nextTick } from 'vue'

beforeEach(() => {
  mockLocalStorage.clear()
})

describe('useLocalStorage', () => {
  it('should use default value when localStorage is empty', () => {
    const value = useLocalStorage('test-key', 'default-value')
    expect(value.value).toBe('default-value')
  })

  it('should save to localStorage when value changes', async () => {
    const value = useLocalStorage('test-key-3', 'initial')
    value.value = 'updated'
    await nextTick()
    await new Promise(r => setTimeout(r, 10))
    expect(mockLocalStorage.setItem).toHaveBeenCalled()
    expect(mockLocalStorage.store['test-key-3']).toBe('"updated"')
  })

  it('should load initial value from localStorage', () => {
    mockLocalStorage.store['test-key'] = '"hello"'
    const value = useLocalStorage('test-key', 'default')
    expect(value.value).toBe('hello')
  })
})
