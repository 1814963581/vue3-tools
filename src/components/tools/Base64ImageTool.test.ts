import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { truncate } from '@/utils/format'
import Base64ImageTool from './Base64ImageTool.vue'

describe('Base64ImageTool', () => {
  it('should mount successfully', () => {
    const wrapper = mount(Base64ImageTool)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render tab bar with two tabs', () => {
    const wrapper = mount(Base64ImageTool)
    const tabs = wrapper.findAll('.tab-btn')
    expect(tabs.length).toBe(2)
    expect(tabs[0].text()).toContain('图片转')
    expect(tabs[1].text()).toContain('Base64 转图片')
  })

  it('should default to imageToBase64 tab', () => {
    const wrapper = mount(Base64ImageTool)
    const vm = wrapper.vm as any
    expect(vm.activeTab).toBe('imageToBase64')
    expect(wrapper.find('.upload-zone').exists()).toBe(true)
  })

  it('should switch to base64ToImage tab', async () => {
    const wrapper = mount(Base64ImageTool)
    const tabs = wrapper.findAll('.tab-btn')
    await tabs[1].trigger('click')
    const vm = wrapper.vm as any
    expect(vm.activeTab).toBe('base64ToImage')
    expect(wrapper.find('.base64-input').exists()).toBe(true)
  })

  it('should show upload zone in imageToBase64 tab', () => {
    const wrapper = mount(Base64ImageTool)
    expect(wrapper.find('.upload-zone').exists()).toBe(true)
    expect(wrapper.text()).toContain('拖拽图片到此处或点击选择')
  })

  it('should show input area in base64ToImage tab', async () => {
    const wrapper = mount(Base64ImageTool)
    const tabs = wrapper.findAll('.tab-btn')
    await tabs[1].trigger('click')
    expect(wrapper.find('.base64-input').exists()).toBe(true)
    expect(wrapper.find('.tool-btn.primary').text()).toContain('解码预览')
  })

  it('should show error when decoding empty input', async () => {
    const wrapper = mount(Base64ImageTool)
    const vm = wrapper.vm as any
    vm.activeTab = 'base64ToImage'
    vm.base64Input = ''
    vm.decodeBase64()
    await wrapper.vm.$nextTick()
    expect(vm.errorMsg).toBe('请输入 Base64 编码内容')
  })

  it('should show error for invalid base64 input', async () => {
    const wrapper = mount(Base64ImageTool)
    const vm = wrapper.vm as any
    vm.activeTab = 'base64ToImage'
    vm.base64Input = 'not valid base64!!!'
    vm.decodeBase64()
    await wrapper.vm.$nextTick()
    expect(vm.errorMsg).toContain('有效的 Base64')
  })

  it('should decode valid base64 data URI', async () => {
    const wrapper = mount(Base64ImageTool)
    const vm = wrapper.vm as any
    vm.activeTab = 'base64ToImage'
    vm.base64Input = 'data:image/png;base64,iVBORw0KGgo='
    vm.decodeBase64()
    await wrapper.vm.$nextTick()
    expect(vm.decodedPreview).toBe('data:image/png;base64,iVBORw0KGgo=')
    expect(vm.errorMsg).toBe('')
  })

  it('should decode valid plain base64 string', async () => {
    const wrapper = mount(Base64ImageTool)
    const vm = wrapper.vm as any
    vm.activeTab = 'base64ToImage'
    vm.base64Input = 'iVBORw0KGgo='
    vm.decodeBase64()
    await wrapper.vm.$nextTick()
    expect(vm.decodedPreview).toContain('data:image/png;base64,iVBORw0KGgo=')
  })

  it('should truncate long strings', () => {
    const longStr = 'A'.repeat(300)
    const result = truncate(longStr, 200)
    expect(result.length).toBeLessThan(300)
    expect(result).toContain('...')
  })

  it('should not truncate short strings', () => {
    const shortStr = 'hello'
    const result = truncate(shortStr, 200)
    expect(result).toBe('hello')
  })

  it('should clear image when clearImage called', async () => {
    const wrapper = mount(Base64ImageTool)
    const vm = wrapper.vm as any
    vm.imagePreview = 'data:image/png;base64,abc'
    vm.base64Output = 'data:image/png;base64,abc'
    vm.imageFile = {}
    vm.clearImage()
    await wrapper.vm.$nextTick()
    expect(vm.imagePreview).toBe('')
    expect(vm.base64Output).toBe('')
    expect(vm.imageFile).toBeNull()
  })

  it('should clear decoded when clearDecoded called', async () => {
    const wrapper = mount(Base64ImageTool)
    const vm = wrapper.vm as any
    vm.base64Input = 'test'
    vm.decodedPreview = 'data:image/png;base64,abc'
    vm.clearDecoded()
    await wrapper.vm.$nextTick()
    expect(vm.base64Input).toBe('')
    expect(vm.decodedPreview).toBe('')
  })

  it('should show error for non-image file type', () => {
    const wrapper = mount(Base64ImageTool)
    const vm = wrapper.vm as any
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    vm.processFile(file)
    expect(vm.errorMsg).toBe('请选择图片文件')
    expect(vm.imageFile).toBeNull()
  })

  it('should compute image info correctly', () => {
    const wrapper = mount(Base64ImageTool)
    const vm = wrapper.vm as any
    vm.imageFile = new File(['test content'], 'photo.png', { type: 'image/png' })
    const info = vm.imageInfo
    expect(info.name).toBe('photo.png')
    expect(info.type).toBe('image/png')
    expect(info.size).toContain('B')
  })

  it('should return null imageInfo when no file', () => {
    const wrapper = mount(Base64ImageTool)
    const vm = wrapper.vm as any
    vm.imageFile = null
    expect(vm.imageInfo).toBeNull()
  })
})