import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Base64Codec from './Base64Codec.vue'

describe('Base64Codec', () => {
  it('should mount successfully', () => {
    const wrapper = mount(Base64Codec)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render encode and decode buttons', () => {
    const wrapper = mount(Base64Codec)
    const buttons = wrapper.findAll('.tool-btn')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('should encode text to base64 using exposed encode function', () => {
    const wrapper = mount(Base64Codec)
    const vm = wrapper.vm as any
    vm.inputText = 'Hello World'
    vm.encode()
    expect(vm.outputText).toBe('SGVsbG8gV29ybGQ=')
  })

  it('should decode base64 to text using exposed decode function', () => {
    const wrapper = mount(Base64Codec)
    const vm = wrapper.vm as any
    vm.inputText = 'SGVsbG8gV29ybGQ='
    vm.decode()
    expect(vm.outputText).toBe('Hello World')
  })

  it('should handle Chinese characters encoding', () => {
    const wrapper = mount(Base64Codec)
    const vm = wrapper.vm as any
    vm.inputText = '你好世界'
    vm.encode()
    expect(vm.outputText).not.toBe('')
    vm.inputText = vm.outputText
    vm.decode()
    expect(vm.outputText).toBe('你好世界')
  })

  it('should show error for invalid decode input', () => {
    const wrapper = mount(Base64Codec)
    const vm = wrapper.vm as any
    vm.inputText = 'not-valid-base64!!!'
    vm.decode()
    expect(vm.outputText).toContain('解码失败')
  })

  it('should clear input and output', () => {
    const wrapper = mount(Base64Codec)
    const vm = wrapper.vm as any
    vm.inputText = 'test'
    vm.outputText = 'result'
    vm.clearAll()
    expect(vm.inputText).toBe('')
    expect(vm.outputText).toBe('')
  })

  it('should swap input and output', () => {
    const wrapper = mount(Base64Codec)
    const vm = wrapper.vm as any
    vm.inputText = 'Hello'
    vm.encode()
    vm.swapIO()
    expect(vm.inputText).toBe('SGVsbG8=')
    expect(vm.outputText).toBe('')
  })

  it('should not swap when output is error', () => {
    const wrapper = mount(Base64Codec)
    const vm = wrapper.vm as any
    vm.inputText = 'none'
    vm.outputText = '✗ 解码失败：test'
    vm.swapIO()
    expect(vm.inputText).toBe('none')
  })

  it('should encode empty string gracefully', () => {
    const wrapper = mount(Base64Codec)
    const vm = wrapper.vm as any
    vm.inputText = ''
    vm.encode()
    expect(vm.outputText).toBe('')
  })

  it('should decode empty string gracefully', () => {
    const wrapper = mount(Base64Codec)
    const vm = wrapper.vm as any
    vm.inputText = ''
    vm.decode()
    expect(vm.outputText).toBe('')
  })
})