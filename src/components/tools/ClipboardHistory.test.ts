import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ClipboardHistory from './ClipboardHistory.vue'
import { formatRelativeTime } from '@/utils/format'

describe('ClipboardHistory', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    const mockStore: Record<string, string> = {}
    vi.stubGlobal('navigator', {
      clipboard: {
        readText: vi.fn().mockRejectedValue(new Error('Not allowed')),
        writeText: vi.fn().mockImplementation((text: string) => {
          mockStore['clipboard'] = text
          return Promise.resolve()
        }),
      },
    })
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    })
  })

  it('should mount successfully', () => {
    const wrapper = mount(ClipboardHistory)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render search input', () => {
    const wrapper = mount(ClipboardHistory)
    expect(wrapper.find('.search-input').exists()).toBe(true)
  })

  it('should render toolbar buttons', () => {
    const wrapper = mount(ClipboardHistory)
    const buttons = wrapper.findAll('.tool-btn')
    expect(buttons.length).toBe(2)
  })

  it('should add item to history', () => {
    const wrapper = mount(ClipboardHistory)
    const vm = wrapper.vm as any
    vm.addToHistory('test text')
    expect(vm.clipboardHistory.length).toBe(1)
    expect(vm.clipboardHistory[0].text).toBe('test text')
  })

  it('should not add empty text to history', () => {
    const wrapper = mount(ClipboardHistory)
    const vm = wrapper.vm as any
    vm.addToHistory('   ')
    expect(vm.clipboardHistory.length).toBe(0)
  })

  it('should move duplicate to top', () => {
    const wrapper = mount(ClipboardHistory)
    const vm = wrapper.vm as any
    vm.addToHistory('first')
    vi.advanceTimersByTime(1000)
    vm.addToHistory('second')
    vi.advanceTimersByTime(1000)
    vm.addToHistory('first')
    expect(vm.clipboardHistory.length).toBe(2)
    expect(vm.clipboardHistory[0].text).toBe('first')
  })

  it('should remove items when maxItems exceeded', () => {
    const wrapper = mount(ClipboardHistory)
    const vm = wrapper.vm as any
    for (let i = 0; i < 51; i++) {
      vm.addToHistory('item ' + i)
    }
    expect(vm.clipboardHistory.length).toBe(50)
  })

  it('should delete item by id', () => {
    const wrapper = mount(ClipboardHistory)
    const vm = wrapper.vm as any
    vm.clipboardHistory = [
      { id: '1', text: 'first', time: new Date(), copied: false },
      { id: '2', text: 'second', time: new Date(), copied: false },
    ]
    vm.deleteItem('1')
    expect(vm.clipboardHistory.length).toBe(1)
    expect(vm.clipboardHistory[0].text).toBe('second')
  })

  it('should clear all items', () => {
    const wrapper = mount(ClipboardHistory)
    const vm = wrapper.vm as any
    vm.addToHistory('item1')
    vm.addToHistory('item2')
    vm.clearAll()
    expect(vm.clipboardHistory.length).toBe(0)
  })

  it('should filter items by search query', () => {
    const wrapper = mount(ClipboardHistory)
    const vm = wrapper.vm as any
    vm.clipboardHistory = [
      { id: '1', text: 'apple', time: new Date(), copied: false },
      { id: '2', text: 'banana', time: new Date(), copied: false },
      { id: '3', text: 'apple pie', time: new Date(), copied: false },
    ]
    vm.searchQuery = 'apple'
    const filtered = vm.filteredHistory()
    expect(filtered.length).toBe(2)
  })

  it('should return all items when search is empty', () => {
    const wrapper = mount(ClipboardHistory)
    const vm = wrapper.vm as any
    vm.clipboardHistory = [
      { id: '1', text: 'test', time: new Date(), copied: false },
    ]
    vm.searchQuery = ''
    expect(vm.filteredHistory().length).toBe(1)
  })

  it('should case-insensitive search', () => {
    const wrapper = mount(ClipboardHistory)
    const vm = wrapper.vm as any
    vm.clipboardHistory = [
      { id: '1', text: 'HELLO', time: new Date(), copied: false },
    ]
    vm.searchQuery = 'hello'
    expect(vm.filteredHistory().length).toBe(1)
  })

  it('should format time correctly for "刚刚"', () => {
    const result = formatRelativeTime(new Date())
    expect(result).toBe('刚刚')
  })

  it('should format time correctly for minutes ago', () => {
    const past = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(past)).toBe('5 分钟前')
  })

  it('should format time correctly for hours ago', () => {
    const past = new Date(Date.now() - 3 * 3600 * 1000)
    expect(formatRelativeTime(past)).toBe('3 小时前')
  })

  it('should format time correctly for days ago', () => {
    const past = new Date(Date.now() - 2 * 86400 * 1000)
    const result = formatRelativeTime(past)
    expect(result).toContain('/')
  })

  it('should mark item as copied when copying', async () => {
    const wrapper = mount(ClipboardHistory)
    const vm = wrapper.vm as any
    const item = { id: 'test', text: 'copy this', time: new Date(), copied: false }
    await vm.copyItem(item)
    expect(item.copied).toBe(true)
  })

  it('should reset copied status after timeout', async () => {
    const wrapper = mount(ClipboardHistory)
    const vm = wrapper.vm as any
    const item = { id: 'test', text: 'copy this', time: new Date(), copied: false }
    await vm.copyItem(item)
    vi.advanceTimersByTime(2100)
    expect(item.copied).toBe(false)
  })
})