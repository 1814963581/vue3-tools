import { describe, it, expect } from 'vitest'
import { tools, categories } from '@/data/tools'

describe('tools data', () => {
  it('should have at least one tool', () => {
    expect(tools.length).toBeGreaterThan(0)
  })

  it('should have unique IDs', () => {
    const ids = tools.map(t => t.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should have valid categories', () => {
    const validCategories = categories.slice(1)
    tools.forEach(tool => {
      expect(validCategories).toContain(tool.category)
    })
  })

  it('should have valid properties for each tool', () => {
    tools.forEach(tool => {
      expect(tool.id).toBeTypeOf('number')
      expect(tool.title).toBeTypeOf('string')
      expect(tool.description).toBeTypeOf('string')
      expect(tool.iconName).toBeTypeOf('string')
      expect(Array.isArray(tool.tags)).toBe(true)
      expect(tool.component).toBeTypeOf('string')
    })
  })
})
