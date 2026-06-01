import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ToolIcons from './ToolIcons.vue'

describe('ToolIcons', () => {
  it('should mount successfully', () => {
    const wrapper = mount(ToolIcons, { props: { name: 'camera' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('should render SVG element', () => {
    const wrapper = mount(ToolIcons, { props: { name: 'camera' } })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('should use default size of 24', () => {
    const wrapper = mount(ToolIcons, { props: { name: 'camera' } })
    const svg = wrapper.find('svg')
    expect(svg.attributes('width')).toBe('24')
    expect(svg.attributes('height')).toBe('24')
  })

  it('should accept custom size prop', () => {
    const wrapper = mount(ToolIcons, { props: { name: 'camera', size: 48 } })
    const svg = wrapper.find('svg')
    expect(svg.attributes('width')).toBe('48')
    expect(svg.attributes('height')).toBe('48')
  })

  it('should render different icons by name', () => {
    const cameraWrapper = mount(ToolIcons, { props: { name: 'camera' } })
    const lockWrapper = mount(ToolIcons, { props: { name: 'lock' } })
    expect(cameraWrapper.find('svg').html()).not.toBe(lockWrapper.find('svg').html())
  })

  it('should render known icon names', () => {
    const icons = ['camera', 'convert', 'document', 'image', 'palette', 'edit',
      'lock', 'file', 'target', 'clipboard', 'clock', 'ruler', 'shield', 'barChart']
    for (const name of icons) {
      const wrapper = mount(ToolIcons, { props: { name } })
      expect(wrapper.find('svg').exists()).toBe(true)
    }
  })

  it('should handle unknown icon name gracefully', () => {
    const wrapper = mount(ToolIcons, { props: { name: 'nonexistent' } })
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})