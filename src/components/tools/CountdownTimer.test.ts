import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CountdownTimer from './CountdownTimer.vue'

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should mount successfully', () => {
    const wrapper = mount(CountdownTimer)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render mode buttons', () => {
    const wrapper = mount(CountdownTimer)
    expect(wrapper.find('.mode-tab').exists()).toBe(true)
  })

  it('should default to countdown mode', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    expect(vm.mode).toBe('countdown')
  })

  it('should start countdown with total seconds', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.inputHours = 0
    vm.inputMinutes = 1
    vm.inputSeconds = 0
    vm.startCountdown()
    expect(vm.isRunning).toBe(true)
    expect(vm.countdownTime).toBe(60)
  })

  it('should not start countdown with zero time', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.inputHours = 0
    vm.inputMinutes = 0
    vm.inputSeconds = 0
    vm.startCountdown()
    expect(vm.isRunning).toBe(false)
  })

  it('should decrement countdown on each tick', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.inputHours = 0
    vm.inputMinutes = 1
    vm.inputSeconds = 0
    vm.startCountdown()
    vi.advanceTimersByTime(1000)
    expect(vm.countdownTime).toBe(59)
  })

  it('should stop when countdown reaches zero', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.inputHours = 0
    vm.inputMinutes = 0
    vm.inputSeconds = 1
    vm.startCountdown()
    vi.advanceTimersByTime(2000)
    expect(vm.isRunning).toBe(false)
    expect(vm.countdownTime).toBe(0)
  })

  it('should start stopwatch', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.mode = 'stopwatch'
    vm.startStopwatch()
    expect(vm.isRunning).toBe(true)
  })

  it('should increment stopwatch on each tick', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.mode = 'stopwatch'
    vm.startStopwatch()
    vi.advanceTimersByTime(3000)
    expect(vm.stopwatchTime).toBe(3)
  })

  it('should pause timer', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.startStopwatch()
    vi.advanceTimersByTime(2000)
    vm.pauseTimer()
    expect(vm.isPaused).toBe(true)
    const currentTime = vm.stopwatchTime
    vi.advanceTimersByTime(2000)
    expect(vm.stopwatchTime).toBe(currentTime)
  })

  it('should resume paused timer', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.mode = 'stopwatch'
    vm.startStopwatch()
    vi.advanceTimersByTime(2000)
    vm.pauseTimer()
    vm.resumeTimer()
    expect(vm.isPaused).toBe(false)
    vi.advanceTimersByTime(2000)
    expect(vm.stopwatchTime).toBe(4)
  })

  it('should stop timer', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.startStopwatch()
    vm.stopTimer()
    expect(vm.isRunning).toBe(false)
    expect(vm.isPaused).toBe(false)
  })

  it('should reset timer', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.startStopwatch()
    vi.advanceTimersByTime(5000)
    vm.resetTimer()
    expect(vm.stopwatchTime).toBe(0)
    expect(vm.countdownTime).toBe(0)
    expect(vm.isRunning).toBe(false)
  })

  it('should switch mode and reset', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.mode = 'countdown'
    vm.inputMinutes = 5
    vm.startCountdown()
    vi.advanceTimersByTime(2000)
    vm.switchMode('stopwatch')
    expect(vm.mode).toBe('stopwatch')
    expect(vm.isRunning).toBe(false)
    expect(vm.countdownTime).toBe(0)
  })

  it('should format display time correctly', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.inputHours = 1
    vm.inputMinutes = 30
    vm.inputSeconds = 45
    vm.startCountdown()
    expect(vm.displayTime.hours).toBe('01')
    expect(vm.displayTime.minutes).toBe('30')
    expect(vm.displayTime.seconds).toBe('45')
    expect(vm.displayTime.total).toBe(5445)
  })

  it('should compute progress for countdown', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.inputHours = 0
    vm.inputMinutes = 0
    vm.inputSeconds = 100
    vm.countdownTime = 50
    expect(vm.progress).toBeCloseTo(50, 0)
  })

  it('should compute zero progress for stopwatch mode', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.mode = 'stopwatch'
    expect(vm.progress).toBe(0)
  })

  it('should handle zero total seconds for progress', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.inputHours = 0
    vm.inputMinutes = 0
    vm.inputSeconds = 0
    expect(vm.progress).toBe(0)
  })

  it('should resume paused countdown', () => {
    const wrapper = mount(CountdownTimer)
    const vm = wrapper.vm as any
    vm.inputMinutes = 1
    vm.mode = 'countdown'
    vm.startCountdown()
    vi.advanceTimersByTime(1000)
    vm.pauseTimer()
    vm.resumeTimer()
    vi.advanceTimersByTime(1000)
    expect(vm.countdownTime).toBe(58)
  })
})