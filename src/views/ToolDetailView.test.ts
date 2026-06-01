import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ToolDetailView from './ToolDetailView.vue'
import { tools } from '@/data/tools'

async function createWrapper(toolId: number = 1) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
      { path: '/tool/:id', name: 'tool', component: ToolDetailView },
    ],
  })
  await router.push(`/tool/${toolId}`)
  await router.isReady()
  return { wrapper: mount(ToolDetailView, { global: { plugins: [router] } }), router }
}

describe('ToolDetailView', () => {
  it('should mount successfully for valid tool id', async () => {
    const { wrapper } = await createWrapper(1)
    await wrapper.vm.$nextTick()
    expect(wrapper.exists()).toBe(true)
  })

  it('should show not-found for invalid id', async () => {
    const { wrapper } = await createWrapper(99999)
    await wrapper.vm.$nextTick()
    const notFound = wrapper.find('.not-found')
    expect(notFound.exists()).toBe(true)
  })

  it('should display tool title', async () => {
    const tool = tools[0]
    const { wrapper } = await createWrapper(tool.id)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain(tool.title)
  })

  it('should display tool description', async () => {
    const tool = tools[0]
    const { wrapper } = await createWrapper(tool.id)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain(tool.description)
  })

  it('should render back button', async () => {
    const { wrapper } = await createWrapper(1)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.back-btn').exists()).toBe(true)
  })

  it('should render ToolIcons component', async () => {
    const { wrapper } = await createWrapper(1)
    await wrapper.vm.$nextTick()
    const icon = wrapper.findComponent({ name: 'ToolIcons' })
    expect(icon.exists()).toBe(true)
  })

  it('should have tool-hero section', async () => {
    const { wrapper } = await createWrapper(1)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.tool-hero').exists()).toBe(true)
  })

  it('should have tool-tags displayed', async () => {
    const { wrapper } = await createWrapper(1)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    const tags = wrapper.findAll('.tag')
    expect(tags.length).toBeGreaterThan(0)
  })

  it('should show workspace section', async () => {
    const { wrapper } = await createWrapper(1)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    const workspace = wrapper.find('.workspace-section')
    expect(workspace.exists()).toBe(true)
  })
})