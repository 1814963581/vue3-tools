import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RegexTester from './RegexTester.vue'

describe('RegexTester', () => {
  it('should mount successfully', () => {
    const wrapper = mount(RegexTester)
    expect(wrapper.exists()).toBe(true)
  })

  it('should have default test string', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    expect(vm.testString).toContain('zhangsan@example.com')
  })

  it('should match email pattern', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    vm.pattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'
    expect(vm.isValidRegex).toBe(true)
    expect(vm.matches.length).toBeGreaterThan(0)
  })

  it('should return null for empty pattern', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    vm.pattern = ''
    expect(vm.regex).toBeNull()
    expect(vm.isValidRegex).toBe(true)
  })

  it('should detect invalid regex', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    vm.pattern = '['
    expect(vm.isValidRegex).toBe(false)
    expect(vm.regex).toBeNull()
  })

  it('should match with global flag', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    vm.pattern = '\\d+'
    vm.flags = { g: true, i: false, m: false }
    expect(vm.matches.length).toBeGreaterThan(1)
  })

  it('should match without global flag', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    vm.pattern = '\\d+'
    vm.flags = { g: false, i: false, m: false }
    expect(vm.matches.length).toBe(1)
  })

  it('should support capture groups', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    vm.pattern = '(\\d{3})-(\\d{4})-(\\d{4})'
    vm.flags = { g: true, i: false, m: false }
    const match = vm.matches[0]
    expect(match.text).toBe('138-1234-5678')
  })

  it('should highlight matched text', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    vm.pattern = '\\d+'
    expect(vm.highlightedText).toContain('<mark class="highlight">')
  })

  it('should escape HTML in output', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    vm.testString = '<script>alert(1)</script>'
    vm.pattern = ''
    expect(vm.highlightedText).not.toContain('<script>')
    expect(vm.highlightedText).toContain('&lt;script&gt;')
  })

  it('should handle empty test string', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    vm.testString = ''
    vm.pattern = '\\d+'
    expect(vm.matches).toEqual([])
  })

  it('should use common patterns for email', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    vm.usePattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')
    expect(vm.pattern).toBeTruthy()
  })

  it('should use common patterns for phone', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    vm.usePattern('1[3-9]\\d{9}')
    expect(vm.pattern).toBe('1[3-9]\\d{9}')
  })

  it('should use common patterns for Chinese', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    vm.usePattern('[\\u4e00-\\u9fa5]+')
    expect(vm.pattern).toBe('[\\u4e00-\\u9fa5]+')
  })

  it('should use case-insensitive flag', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    vm.pattern = 'test'
    vm.flags = { g: true, i: true, m: false }
    expect(vm.regex.ignoreCase).toBe(true)
  })

  it('should use multiline flag', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    vm.pattern = '^test'
    vm.flags = { g: true, i: false, m: true }
    expect(vm.regex.multiline).toBe(true)
  })

  it('should render common patterns list', () => {
    const wrapper = mount(RegexTester)
    const chips = wrapper.findAll('.pattern-btn')
    expect(chips.length).toBe(8)
  })

  it('should get correct match index', () => {
    const wrapper = mount(RegexTester)
    const vm = wrapper.vm as any
    vm.pattern = 'example'
    const match = vm.matches[0]
    expect(match.index).toBeGreaterThan(0)
  })
})