import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useKeyboardShortcut, useDebounce } from './useKeyboard'

describe('useKeyboardShortcut', () => {
  it('should call callback when key pressed', async () => {
    const callback = vi.fn()
    const TestComponent = defineComponent({
      setup() {
        useKeyboardShortcut('a', callback)
      },
      template: '<div></div>',
    })
    mount(TestComponent)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    expect(callback).toHaveBeenCalled()
  })

  it('should not call callback for different key', async () => {
    const callback = vi.fn()
    const TestComponent = defineComponent({
      setup() {
        useKeyboardShortcut('a', callback)
      },
      template: '<div></div>',
    })
    mount(TestComponent)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }))
    expect(callback).not.toHaveBeenCalled()
  })

  it('should require ctrl key when specified', async () => {
    const callback = vi.fn()
    const TestComponent = defineComponent({
      setup() {
        useKeyboardShortcut('s', callback, true)
      },
      template: '<div></div>',
    })
    mount(TestComponent)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }))
    expect(callback).not.toHaveBeenCalled()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }))
    expect(callback).toHaveBeenCalled()
  })

  it('should support meta key as ctrl alternative', async () => {
    const callback = vi.fn()
    const TestComponent = defineComponent({
      setup() {
        useKeyboardShortcut('s', callback, true)
      },
      template: '<div></div>',
    })
    mount(TestComponent)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', metaKey: true }))
    expect(callback).toHaveBeenCalled()
  })

  it('should remove listener on unmount', async () => {
    const callback = vi.fn()
    const removeEventListener = vi.spyOn(window, 'removeEventListener')
    const TestComponent = defineComponent({
      setup() {
        useKeyboardShortcut('a', callback)
      },
      template: '<div></div>',
    })
    const wrapper = mount(TestComponent)
    wrapper.unmount()
    expect(removeEventListener).toHaveBeenCalled()
  })
})

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should debounce function calls', async () => {
    const fn = vi.fn()
    const TestComponent = defineComponent({
      setup() {
        const debounced = useDebounce(fn, 300)
        return { debounced }
      },
      template: '<div></div>',
    })
    const wrapper = mount(TestComponent)
    const vm = wrapper.vm as any
    vm.debounced()
    vm.debounced()
    vm.debounced()
    vi.advanceTimersByTime(350)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should delay execution by specified time', async () => {
    const fn = vi.fn()
    const TestComponent = defineComponent({
      setup() {
        const debounced = useDebounce(fn, 500)
        return { debounced }
      },
      template: '<div></div>',
    })
    const wrapper = mount(TestComponent)
    const vm = wrapper.vm as any
    vm.debounced()
    vi.advanceTimersByTime(400)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(200)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should reset timer on repeated calls', async () => {
    const fn = vi.fn()
    const TestComponent = defineComponent({
      setup() {
        const debounced = useDebounce(fn, 300)
        return { debounced }
      },
      template: '<div></div>',
    })
    const wrapper = mount(TestComponent)
    const vm = wrapper.vm as any
    vm.debounced()
    vi.advanceTimersByTime(200)
    vm.debounced()
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(150)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})