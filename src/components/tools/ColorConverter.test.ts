import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ColorConverter from './ColorConverter.vue'
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from '@/utils/color'

describe('ColorConverter', () => {
  it('should mount successfully', () => {
    const wrapper = mount(ColorConverter)
    expect(wrapper.exists()).toBe(true)
  })

  it('should have default color #6366f1', () => {
    const wrapper = mount(ColorConverter)
    const vm = wrapper.vm as any
    expect(vm.hexColor).toBe('#6366f1')
  })

  it('should convert hex to rgb', () => {
    const result = hexToRgb('#6366f1')
    expect(result).toEqual({ r: 99, g: 102, b: 241 })
  })

  it('should convert hex without hash', () => {
    const result = hexToRgb('6366f1')
    expect(result).toEqual({ r: 99, g: 102, b: 241 })
  })

  it('should return null for invalid hex', () => {
    expect(hexToRgb('invalid')).toBeNull()
  })

  it('should convert black hex to rgb', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('should convert white hex to rgb', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('should convert rgb to hex', () => {
    expect(rgbToHex(99, 102, 241)).toBe('#6366f1')
  })

  it('should convert rgb to hex with zero padding', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000')
  })

  it('should pad single-digit hex values', () => {
    const result = rgbToHex(15, 15, 15)
    expect(result).toBe('#0f0f0f')
  })

  it('should convert rgb to hsl', () => {
    const result = rgbToHsl(99, 102, 241)
    expect(result.h).toBe(239)
    expect(result.s).toBeGreaterThanOrEqual(75)
    expect(result.l).toBeGreaterThanOrEqual(60)
  })

  it('should convert hsl to rgb', () => {
    const result = hslToRgb(239, 84, 67)
    expect(result.r).toBeCloseTo(102, -1)
    expect(result.g).toBeCloseTo(105, -1)
  })

  it('should handle black color conversion', () => {
    const rgb = rgbToHsl(0, 0, 0)
    expect(rgb.l).toBe(0)
  })

  it('should handle white color conversion', () => {
    const rgb = rgbToHsl(255, 255, 255)
    expect(rgb.l).toBe(100)
  })

  it('should handle pure red color conversion', () => {
    const result = rgbToHsl(255, 0, 0)
    expect(result.h).toBe(0)
    expect(result.s).toBe(100)
  })

  it('should handle pure green color conversion', () => {
    const result = rgbToHsl(0, 255, 0)
    expect(result.h).toBe(120)
    expect(result.s).toBe(100)
  })

  it('should handle pure blue color conversion', () => {
    const result = rgbToHsl(0, 0, 255)
    expect(result.h).toBe(240)
    expect(result.s).toBe(100)
  })

  it('should convert gray rgb to hsl', () => {
    const result = rgbToHsl(128, 128, 128)
    expect(result.s).toBe(0)
    expect(result.l).toBe(50)
  })

  it('should roundtrip rgb -> hsl -> rgb', () => {
    const original = { r: 100, g: 150, b: 200 }
    const hsl = rgbToHsl(original.r, original.g, original.b)
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l)
    expect(Math.abs(rgb.r - original.r)).toBeLessThanOrEqual(1)
    expect(Math.abs(rgb.g - original.g)).toBeLessThanOrEqual(1)
    expect(Math.abs(rgb.b - original.b)).toBeLessThanOrEqual(1)
  })
})