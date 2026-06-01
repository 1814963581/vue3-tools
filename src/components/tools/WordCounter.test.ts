import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WordCounter from './WordCounter.vue'

describe('WordCounter', () => {
  it('should mount successfully', () => {
    const wrapper = mount(WordCounter)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render toolbar with clear and copy buttons', () => {
    const wrapper = mount(WordCounter)
    const buttons = wrapper.findAll('.tool-btn')
    expect(buttons.length).toBe(2)
  })

  it('should count characters correctly', () => {
    const wrapper = mount(WordCounter)
    const vm = wrapper.vm as any
    vm.inputText = 'Hello World'
    expect(vm.stats.chars).toBe(11)
  })

  it('should count characters without spaces', () => {
    const wrapper = mount(WordCounter)
    const vm = wrapper.vm as any
    vm.inputText = 'Hello World'
    expect(vm.stats.charsNoSpace).toBe(10)
  })

  it('should count words correctly', () => {
    const wrapper = mount(WordCounter)
    const vm = wrapper.vm as any
    vm.inputText = 'Hello World Vue'
    expect(vm.stats.words).toBe(3)
  })

  it('should count Chinese characters', () => {
    const wrapper = mount(WordCounter)
    const vm = wrapper.vm as any
    vm.inputText = '你好世界 Hello'
    expect(vm.stats.chineseChars).toBe(4)
  })

  it('should count English words', () => {
    const wrapper = mount(WordCounter)
    const vm = wrapper.vm as any
    vm.inputText = 'Hello World 你好'
    expect(vm.stats.englishWords).toBe(2)
  })

  it('should count sentences', () => {
    const wrapper = mount(WordCounter)
    const vm = wrapper.vm as any
    vm.inputText = 'Hello. World! How?'
    expect(vm.stats.sentences).toBe(3)
  })

  it('should count paragraphs', () => {
    const wrapper = mount(WordCounter)
    const vm = wrapper.vm as any
    vm.inputText = 'Para1\n\nPara2\n\nPara3'
    expect(vm.stats.paragraphs).toBe(3)
  })

  it('should count lines', () => {
    const wrapper = mount(WordCounter)
    const vm = wrapper.vm as any
    vm.inputText = 'Line1\nLine2\nLine3'
    expect(vm.stats.lines).toBe(3)
  })

  it('should count numbers', () => {
    const wrapper = mount(WordCounter)
    const vm = wrapper.vm as any
    vm.inputText = 'abc 123 def 456'
    expect(vm.stats.numbers).toBe(2)
  })

  it('should count punctuation', () => {
    const wrapper = mount(WordCounter)
    const vm = wrapper.vm as any
    vm.inputText = 'Hello，World！'
    expect(vm.stats.punctuation).toBe(2)
  })

  it('should calculate reading time for Chinese', () => {
    const wrapper = mount(WordCounter)
    const vm = wrapper.vm as any
    vm.inputText = '测试'.repeat(400)
    expect(vm.readingTime).toBe(2)
  })

  it('should calculate reading time for English', () => {
    const wrapper = mount(WordCounter)
    const vm = wrapper.vm as any
    vm.inputText = 'word '.repeat(200)
    expect(vm.readingTime).toBe(1)
  })

  it('should handle empty text', () => {
    const wrapper = mount(WordCounter)
    const vm = wrapper.vm as any
    vm.inputText = ''
    expect(vm.stats.chars).toBe(0)
    expect(vm.stats.words).toBe(0)
    expect(vm.stats.lines).toBe(0)
    expect(vm.readingTime).toBe(0)
  })

  it('should clear text', () => {
    const wrapper = mount(WordCounter)
    const vm = wrapper.vm as any
    vm.inputText = 'test content'
    vm.clearText()
    expect(vm.inputText).toBe('')
  })
})