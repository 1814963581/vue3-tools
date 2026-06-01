import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ToolCard from './ToolCard.vue'

const mockTool = {
  id: 1,
  iconName: 'camera',
  title: '测试工具',
  description: '这是一个测试工具的描述',
  tags: ['测试', '工具'],
  category: '生活工具',
}

function createWrapper() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
      { path: '/tool/:id', name: 'tool', component: { template: '<div>Tool</div>' } },
    ],
  })
  return mount(ToolCard, {
    props: { tool: mockTool },
    global: {
      plugins: [router],
    },
  })
}

describe('ToolCard', () => {
  it('should mount successfully', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('should display tool title', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('测试工具')
  })

  it('should display tool description', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('这是一个测试工具的描述')
  })

  it('should display tool category', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('生活工具')
  })

  it('should display tags', () => {
    const wrapper = createWrapper()
    const tags = wrapper.findAll('.tag')
    expect(tags.length).toBe(2)
    expect(tags[0].text()).toBe('测试')
    expect(tags[1].text()).toBe('工具')
  })

  it('should have "立即使用" text', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('立即使用')
  })

  it('should render ToolIcons component', () => {
    const wrapper = createWrapper()
    const icon = wrapper.findComponent({ name: 'ToolIcons' })
    expect(icon.exists()).toBe(true)
  })

  it('should have role button and tabindex', () => {
    const wrapper = createWrapper()
    const card = wrapper.find('.tool-card')
    expect(card.attributes('role')).toBe('button')
    expect(card.attributes('tabindex')).toBe('0')
  })
})