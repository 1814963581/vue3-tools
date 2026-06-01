import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useCopyToClipboard } from './useCopyToClipboard'

const TestComponent = defineComponent({
  setup() {
    return useCopyToClipboard()
  },
  template: '<div></div>',
})

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
    vi.stubGlobal('window', {
      ...window,
      isSecureContext: true,
    })
  })

  it('should set isCopied to true after copy', async () => {
    const wrapper = mount(TestComponent)
    const vm = wrapper.vm as any
    await vm.copy('test text')
    expect(vm.isCopied).toBe(true)
  })

  it('should reset isCopied after timeout', async () => {
    const wrapper = mount(TestComponent)
    const vm = wrapper.vm as any
    await vm.copy('test text')
    expect(vm.isCopied).toBe(true)
    vi.advanceTimersByTime(2100)
    await nextTick()
    expect(vm.isCopied).toBe(false)
  })

  it('should use clipboard API in secure context', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      clipboard: { writeText },
    })
    vi.stubGlobal('window', { ...window, isSecureContext: true })
    const wrapper = mount(TestComponent)
    const vm = wrapper.vm as any
    await vm.copy('hello')
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('should handle clipboard API not available', async () => {
    vi.stubGlobal('navigator', { clipboard: undefined })
    document.execCommand = vi.fn().mockReturnValue(true)
    const wrapper = mount(TestComponent)
    const vm = wrapper.vm as any
    await vm.copy('fallback text')
    expect(vm.isCopied).toBe(true)
  })
})