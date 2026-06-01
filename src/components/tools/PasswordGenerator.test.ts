import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordGenerator from './PasswordGenerator.vue'

describe('PasswordGenerator', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(PasswordGenerator)
  })

  it('should mount successfully', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('should render generate button', () => {
    expect(wrapper.find('.generate-btn').exists()).toBe(true)
  })

  it('should generate password with default length 16', () => {
    const vm = wrapper.vm as any
    vm.generatePassword()
    expect(vm.generatedPassword.length).toBe(16)
  })

  it('should generate password respecting length setting', () => {
    const vm = wrapper.vm as any
    vm.length = 8
    vm.generatePassword()
    expect(vm.generatedPassword.length).toBe(8)
  })

  it('should generate password respecting length setting (32 chars)', () => {
    const vm = wrapper.vm as any
    vm.length = 32
    vm.generatePassword()
    expect(vm.generatedPassword.length).toBe(32)
  })

  it('should add to history when generating', () => {
    const vm = wrapper.vm as any
    vm.generatePassword()
    expect(vm.passwordHistory.length).toBe(1)
    expect(vm.passwordHistory[0]).toBe(vm.generatedPassword)
  })

  it('should keep at most 10 history items', () => {
    const vm = wrapper.vm as any
    for (let i = 0; i < 15; i++) {
      vm.generatePassword()
    }
    expect(vm.passwordHistory.length).toBe(10)
  })

  it('should generate only lowercase when all other options disabled', () => {
    const vm = wrapper.vm as any
    vm.useUppercase = false
    vm.useNumbers = false
    vm.useSymbols = false
    vm.useLowercase = true
    vm.excludeAmbiguous = false
    vm.customExclude = ''
    vm.generatePassword()
    const password = vm.generatedPassword
    expect(/^[a-z]+$/.test(password)).toBe(true)
  })

  it('should fallback to lowercase when all disabled', () => {
    const vm = wrapper.vm as any
    vm.useUppercase = false
    vm.useLowercase = false
    vm.useNumbers = false
    vm.useSymbols = false
    vm.generatePassword()
    expect(vm.generatedPassword.length).toBeGreaterThan(0)
  })

  it('should exclude ambiguous characters when enabled', () => {
    const vm = wrapper.vm as any
    vm.excludeAmbiguous = true
    vm.useLowercase = true
    vm.useUppercase = false
    vm.useNumbers = false
    vm.useSymbols = false
    vm.generatePassword()
    const password = vm.generatedPassword
    expect(password).not.toContain('l')
    expect(password).not.toContain('I')
  })

  it('should exclude custom characters', () => {
    const vm = wrapper.vm as any
    vm.customExclude = 'abc'
    vm.useLowercase = true
    vm.useUppercase = false
    vm.useNumbers = false
    vm.useSymbols = false
    vm.excludeAmbiguous = false
    vm.generatePassword()
    const password = vm.generatedPassword
    expect(password).not.toContain('a')
    expect(password).not.toContain('b')
    expect(password).not.toContain('c')
  })

  it('should compute weak strength for short password', () => {
    const vm = wrapper.vm as any
    vm.length = 4
    vm.useUppercase = false
    vm.useLowercase = true
    vm.useNumbers = false
    vm.useSymbols = false
    expect(vm.strengthLevel.text).toBe('弱')
  })

  it('should compute strong strength for long complex password', () => {
    const vm = wrapper.vm as any
    vm.length = 20
    vm.useUppercase = true
    vm.useLowercase = true
    vm.useNumbers = true
    vm.useSymbols = true
    expect(vm.strengthLevel.level).toBeGreaterThanOrEqual(2)
  })

  it('should auto-regenerate when parameters change', async () => {
    const vm = wrapper.vm as any
    vm.generatePassword()
    vm.length = 20
    await wrapper.vm.$nextTick()
    const second = vm.generatedPassword
    expect(second.length).toBe(20)
  })

  it('should generate unique passwords', () => {
    const vm = wrapper.vm as any
    const passwords = new Set<string>()
    for (let i = 0; i < 10; i++) {
      vm.generatePassword()
      passwords.add(vm.generatedPassword)
    }
    expect(passwords.size).toBeGreaterThan(1)
  })
})