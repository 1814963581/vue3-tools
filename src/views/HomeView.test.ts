import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from './HomeView.vue'

describe('HomeView', () => {
  it('should mount successfully', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render HeroSection', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.findComponent({ name: 'HeroSection' }).exists()).toBe(true)
  })

  it('should render ToolsSection', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.findComponent({ name: 'ToolsSection' }).exists()).toBe(true)
  })

  it('should render Footer', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.findComponent({ name: 'Footer' }).exists()).toBe(true)
  })

  it('should render AppBackground', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.findComponent({ name: 'AppBackground' }).exists()).toBe(true)
  })

  it('should have main element', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.find('main').exists()).toBe(true)
  })
})