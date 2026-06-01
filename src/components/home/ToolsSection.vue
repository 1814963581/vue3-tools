<script setup lang="ts">
import { ref, computed, onMounted, onActivated, onDeactivated, watch } from 'vue'
import ToolCard from './ToolCard.vue'
import { tools, type Tool, categories as allCategories } from '@/data/tools'

const STORAGE_KEY = 'vue3-tools-category'
const SCROLL_KEY = 'vue3-tools-scroll'

const activeCategory = ref('全部')
const categories = allCategories
const searchQuery = ref('')
const showScrollTop = ref(false)

const filteredTools = computed<Tool[]>(() => {
  let result = tools

  if (activeCategory.value !== '全部') {
    result = result.filter(tool => tool.category === activeCategory.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(tool => 
      tool.title.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return result
})

const filterByCategory = (category: string) => {
  activeCategory.value = category
  sessionStorage.setItem(STORAGE_KEY, category)
}

const restoreState = () => {
  const saved = sessionStorage.getItem(STORAGE_KEY)
  if (saved && categories.includes(saved)) {
    activeCategory.value = saved
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 400
}

onMounted(() => {
  restoreState()
  window.addEventListener('scroll', handleScroll)
})

onActivated(() => {
  const scrollY = sessionStorage.getItem(SCROLL_KEY)
  if (scrollY !== null) {
    requestAnimationFrame(() => {
      window.scrollTo(0, Number(scrollY))
    })
  }
})

onDeactivated(() => {
  sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))
})

watch(searchQuery, () => {
  activeCategory.value = '全部'
})
</script>

<template>
  <section id="tools" class="tools-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">探索全部工具</h2>
        <p class="section-subtitle">选择分类快速筛选你需要的工具</p>
      </div>

      <div class="search-wrapper">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input 
            v-model="searchQuery"
            type="text" 
            class="search-input" 
            placeholder="搜索工具..."
            aria-label="搜索工具"
          />
          <button 
            v-if="searchQuery"
            class="search-clear"
            @click="searchQuery = ''"
            aria-label="清除搜索"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="category-tabs">
        <button
          v-for="category in categories"
          :key="category"
          :class="['tab-btn', { active: activeCategory === category }]"
          @click="filterByCategory(category)"
        >
          {{ category }}
        </button>
      </div>

      <div class="tools-grid">
        <ToolCard
          v-for="tool in filteredTools"
          :key="tool.id"
          :tool="tool"
        />
      </div>

      <div v-if="filteredTools.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p class="empty-text">没有找到匹配的工具</p>
        <p class="empty-hint">试试其他关键词或分类</p>
      </div>
    </div>
  </section>

  <Transition name="slide-up">
    <button 
      v-show="showScrollTop"
      class="scroll-top-btn"
      @click="scrollToTop"
      aria-label="回到顶部"
    >
      <span class="btn-inner">
        <svg viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="arrowGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" style="stop-color:rgba(255,255,255,0.9)"/>
              <stop offset="100%" style="stop-color:rgba(255,255,255,1)"/>
            </linearGradient>
          </defs>
          <path 
            d="M12 4l-8 8h5v8h6v-8h5L12 4z" 
            fill="url(#arrowGradient)"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
          />
          <path 
            d="M12 6L6 12h4v6h4v-6h4L12 6z" 
            fill="rgba(255,255,255,0.3)"
          />
        </svg>
      </span>
      <span class="btn-glow"></span>
      <span class="btn-pulse"></span>
    </button>
  </Transition>
</template>

<style lang="scss" scoped>
.tools-section {
  padding: 40px 0 100px;
  position: relative;
}

.section-header {
  text-align: center;
  margin-bottom: 32px;
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
  color: $text-primary;
  margin-bottom: 8px;
  letter-spacing: -0.02em;

  @include respond-to('sm') {
    font-size: 2.5rem;
  }
}

.section-subtitle {
  font-size: 1rem;
  color: $text-secondary;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 48px;
  justify-content: center;
}

.tab-btn {
  padding: 10px 22px;
  font-size: 0.875rem;
  font-weight: 500;
  color: $text-secondary;
  background: $bg-white;
  border: 1px solid rgba($primary, 0.1);
  border-radius: $border-radius-full;
  cursor: pointer;
  transition: $transition-bounce;

  &:hover {
    background: rgba($primary, 0.04);
    border-color: rgba($primary, 0.2);
    color: $primary;
  }

  &.active {
    background: $gradient-primary;
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 16px rgba($primary, 0.25);
  }
}

.tools-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @include respond-to('sm') {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
}

.search-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 28px;
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba($primary, 0.1);
  border-radius: $border-radius-lg;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);

  &:focus-within {
    border-color: rgba($primary, 0.3);
    box-shadow: 0 4px 20px rgba($primary, 0.1);
  }
}

.search-icon {
  width: 20px;
  height: 20px;
  color: $text-muted;
  margin-left: 14px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  padding: 12px 14px;
  font-size: 0.9375rem;
  background: transparent;
  border: none;
  outline: none;
  color: $text-primary;

  &::placeholder {
    color: $text-muted;
  }
}

.search-clear {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  background: rgba($danger, 0.1);
  border: none;
  border-radius: $border-radius;
  color: $danger;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: rgba($danger, 0.15);
    transform: scale(1.05);
  }
}

.empty-state {
  text-align: center;
  padding: 80px 0;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: $text-muted;
  display: block;
  margin: 0 auto 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 1.25rem;
  color: $text-secondary;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 0.9375rem;
  color: $text-muted;
}

.scroll-top-btn {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 60px;
  height: 60px;
  background: transparent;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 100;
  overflow: visible;

  .btn-inner {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, $primary 0%, $secondary 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      0 8px 28px rgba($primary, 0.35),
      0 2px 8px rgba($primary, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

    svg {
      width: 24px;
      height: 24px;
      color: white;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
      transition: transform 0.3s ease;
    }
  }

  .btn-glow {
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba($primary, 0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s ease;
    animation: glow-pulse 3s ease-in-out infinite;
  }

  .btn-pulse {
    position: absolute;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, $primary 0%, $secondary 100%);
    opacity: 0;
    animation: ring-pulse 2s ease-out infinite;
  }

  &:hover {
    transform: translateY(-6px);

    .btn-inner {
      transform: scale(1.1);
      box-shadow: 
        0 14px 40px rgba($primary, 0.45),
        0 4px 16px rgba($primary, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);

      svg {
        transform: translateY(-2px);
      }
    }

    .btn-glow {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(-3px);

    .btn-inner {
      transform: scale(0.96);
    }
  }
}

@keyframes glow-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

@keyframes ring-pulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.8);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

@include respond-to-down('sm') {
  .section-title {
    font-size: 1.6rem;
  }

  .section-subtitle {
    font-size: 0.9rem;
  }

  .category-tabs {
    gap: 6px;
    margin-bottom: 32px;
  }

  .tab-btn {
    padding: 8px 16px;
    font-size: 0.8rem;
  }

  .search-box {
    max-width: 100%;
  }

  .empty-state {
    padding: 48px 0;
  }

  .empty-icon {
    width: 48px;
    height: 48px;
  }

  .empty-text {
    font-size: 1.1rem;
  }

  .scroll-top-btn {
    right: 16px;
    bottom: 16px;
    width: 48px;
    height: 48px;

    .btn-inner {
      width: 48px;
      height: 48px;

      svg {
        width: 20px;
        height: 20px;
      }
    }

    .btn-glow {
      width: 64px;
      height: 64px;
    }

    .btn-pulse {
      width: 48px;
      height: 48px;
    }
  }
}

@include respond-to-down('md') {
  .section-title {
    font-size: 2rem;
  }
}
</style>