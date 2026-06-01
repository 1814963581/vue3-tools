import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonFormatter from './JsonFormatter.vue'

describe('JsonFormatter', () => {
  const createWrapper = () => mount(JsonFormatter)

  it('should mount successfully', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('should have default JSON input', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    expect(vm.inputJson).toContain('"name"')
    expect(vm.isValid).toBe(true)
  })

  it('should validate valid JSON', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.inputJson = '{"a": 1}'
    vm.formatJson()
    expect(vm.isValid).toBe(true)
    expect(vm.errorMessage).toBe('')
  })

  it('should detect invalid JSON', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.inputJson = '{invalid'
    vm.formatJson()
    expect(vm.isValid).toBe(false)
    expect(vm.errorMessage).toBeTruthy()
  })

  it('should format JSON with indentation', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.indentSize = 4
    vm.inputJson = '{"a":1,"b":2}'
    vm.formatJson()
    expect(vm.outputJson).toContain('\n')
    expect(vm.outputJson).toContain('    ')
  })

  it('should minify JSON', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.inputJson = '{\n  "a": 1\n}'
    vm.minifyJson()
    expect(vm.outputJson).toBe('{"a":1}')
  })

  it('should sort keys when enabled', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.sortKeys = true
    vm.inputJson = '{"c": 3, "a": 1, "b": 2}'
    vm.formatJson()
    const parsed = JSON.parse(vm.outputJson)
    const keys = Object.keys(parsed)
    expect(keys).toEqual(['a', 'b', 'c'])
  })

  it('should handle nested object key sorting', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.sortKeys = true
    vm.inputJson = '{"b": {"c": 3, "a": 1}}'
    vm.formatJson()
    const parsed = JSON.parse(vm.outputJson)
    expect(Object.keys(parsed)).toEqual(['b'])
    expect(Object.keys(parsed.b)).toEqual(['a', 'c'])
  })

  it('should handle array with sortKeys', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.sortKeys = true
    vm.inputJson = '[{"c": 3, "a": 1}]'
    vm.formatJson()
    const parsed = JSON.parse(vm.outputJson)
    expect(Object.keys(parsed[0])).toEqual(['a', 'c'])
  })

  it('should handle empty input', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.inputJson = ''
    vm.formatJson()
    expect(vm.outputJson).toBe('')
  })

  it('should handle whitespace-only input', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.inputJson = '   '
    vm.formatJson()
    expect(vm.outputJson).toBe('')
  })

  it('should clear all fields', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.inputJson = '{"test": true}'
    vm.outputJson = 'formatted'
    vm.errorMessage = 'error'
    vm.clearAll()
    expect(vm.inputJson).toBe('')
    expect(vm.outputJson).toBe('')
    expect(vm.errorMessage).toBe('')
    expect(vm.isValid).toBe(true)
  })

  it('should compute stats for output', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.inputJson = '{"a": 1, "b": 2}'
    vm.formatJson()
    expect(vm.stats.lines).toBeGreaterThan(0)
    expect(vm.stats.chars).toBeGreaterThan(0)
    expect(vm.stats.size).toBeTruthy()
  })

  it('should compute zero stats for empty output', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.inputJson = ''
    vm.formatJson()
    expect(vm.stats.lines).toBe(0)
    expect(vm.stats.chars).toBe(0)
    expect(vm.stats.size).toBe('0 B')
  })

  it('should validate special JSON values', () => {
    const wrapper = createWrapper()
    const vm = wrapper.vm as any
    vm.inputJson = '{"null": null, "bool": true, "num": 3.14}'
    vm.formatJson()
    expect(vm.isValid).toBe(true)
    expect(vm.outputJson).toContain('null')
    expect(vm.outputJson).toContain('true')
  })
})