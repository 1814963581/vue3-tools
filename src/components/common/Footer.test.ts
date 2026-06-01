import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Footer from './Footer.vue'

describe('Footer', () => {
  it('should mount successfully', () => {
    const wrapper = mount(Footer)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display current year', () => {
    const wrapper = mount(Footer)
    const currentYear = new Date().getFullYear()
    expect(wrapper.text()).toContain(currentYear.toString())
  })

  it('should display Vue 3 build text', () => {
    const wrapper = mount(Footer)
    expect(wrapper.text()).toContain('Vue 3')
    expect(wrapper.text()).toContain('TypeScript')
  })

  it('should render copyright text', () => {
    const wrapper = mount(Footer)
    expect(wrapper.text()).toContain('保留所有权利')
  })
})