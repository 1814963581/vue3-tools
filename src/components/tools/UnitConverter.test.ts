import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UnitConverter from './UnitConverter.vue'

describe('UnitConverter', () => {
  it('should mount successfully', () => {
    const wrapper = mount(UnitConverter)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render category tabs', () => {
    const wrapper = mount(UnitConverter)
    const tabs = wrapper.findAll('.cat-btn')
    expect(tabs.length).toBe(7)
  })

  it('should convert meters to centimeters', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    vm.activeCategory = 'length'
    vm.fromUnit = 1
    vm.toUnit = 3
    vm.inputValue = 1
    expect(vm.result).toBeCloseTo(100, 1)
  })

  it('should convert kilometers to miles', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    vm.activeCategory = 'length'
    vm.fromUnit = 0
    vm.toUnit = 5
    vm.inputValue = 1
    expect(vm.result).toBeCloseTo(0.62137, 3)
  })

  it('should convert Celsius to Fahrenheit', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    vm.activeCategory = 'temperature'
    vm.fromUnit = 0
    vm.toUnit = 1
    vm.inputValue = 0
    expect(vm.result).toBe(32)
  })

  it('should convert Celsius to Kelvin', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    vm.activeCategory = 'temperature'
    vm.fromUnit = 0
    vm.toUnit = 2
    vm.inputValue = 0
    expect(vm.result).toBeCloseTo(273.15, 1)
  })

  it('should convert Fahrenheit to Celsius', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    vm.activeCategory = 'temperature'
    vm.fromUnit = 1
    vm.toUnit = 0
    vm.inputValue = 212
    expect(vm.result).toBeCloseTo(100, 1)
  })

  it('should convert kilograms to pounds', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    vm.activeCategory = 'weight'
    vm.fromUnit = 1
    vm.toUnit = 4
    vm.inputValue = 1
    expect(vm.result).toBeCloseTo(2.2046, 3)
  })

  it('should convert square kilometers to square meters', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    vm.activeCategory = 'area'
    vm.fromUnit = 0
    vm.toUnit = 3
    vm.inputValue = 1
    expect(vm.result).toBeCloseTo(1000000, 0)
  })

  it('should convert cubic meters to liters', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    vm.activeCategory = 'volume'
    vm.fromUnit = 0
    vm.toUnit = 1
    vm.inputValue = 1
    expect(vm.result).toBeCloseTo(1000, 0)
  })

  it('should convert km/h to m/s', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    vm.activeCategory = 'speed'
    vm.fromUnit = 1
    vm.toUnit = 0
    vm.inputValue = 36
    expect(vm.result).toBeCloseTo(10, 0)
  })

  it('should convert GB to MB', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    vm.activeCategory = 'data'
    vm.fromUnit = 1
    vm.toUnit = 2
    vm.inputValue = 1
    expect(vm.result).toBeCloseTo(1024, 0)
  })

  it('should convert TB to KB', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    vm.activeCategory = 'data'
    vm.fromUnit = 0
    vm.toUnit = 3
    vm.inputValue = 1
    expect(vm.result).toBeCloseTo(1073741824, -3)
  })

  it('should switch units', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    vm.activeCategory = 'length'
    vm.fromUnit = 1
    vm.toUnit = 3
    vm.switchUnits()
    expect(vm.fromUnit).toBe(3)
    expect(vm.toUnit).toBe(1)
  })

  it('should reset units when switching category', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    vm.fromUnit = 3
    vm.toUnit = 5
    vm.setCategory('weight')
    expect(vm.fromUnit).toBe(0)
    expect(vm.toUnit).toBe(1)
  })

  it('should format result properly for large numbers', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    expect(vm.formatResult(0.0000001)).toBeTruthy()
    expect(vm.formatResult(1e13)).toBeTruthy()
    expect(vm.formatResult(NaN)).toBe('0')
    expect(vm.formatResult(Infinity)).toBe('0')
  })

  it('should convert jin to kg', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    vm.activeCategory = 'weight'
    vm.fromUnit = 6
    vm.toUnit = 1
    vm.inputValue = 2
    expect(vm.result).toBeCloseTo(1, 1)
  })

  it('should handle zero input value', () => {
    const wrapper = mount(UnitConverter)
    const vm = wrapper.vm as any
    vm.inputValue = 0
    expect(vm.result).toBe(0)
  })
})