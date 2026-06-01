<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { tools } from '@/data/tools'
import ToolIcons from '@/components/icons/ToolIcons.vue'

const toolModuleMap: Record<string, any> = import.meta.glob('../components/tools/*.vue')

const componentCache: Record<string, any> = {}

function resolveComponent(name: string) {
  if (!componentCache[name]) {
    const key = `../components/tools/${name}.vue`
    const loader = toolModuleMap[key]
    if (loader) {
      componentCache[name] = defineAsyncComponent(loader)
    }
  }
  return componentCache[name] || null
}

const route = useRoute()
const router = useRouter()

const toolId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? Number(id[0]) : Number(id)
})

const currentTool = computed(() => {
  return tools.find(tool => tool.id === toolId.value)
})

const activeComponent = computed(() => {
  if (currentTool.value?.component) {
    return resolveComponent(currentTool.value.component)
  }
  return null
})

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  if (!currentTool.value) {
    console.warn('Tool not found:', toolId.value)
  }
})
</script>

<template>
  <div class="tool-detail-view">
    <main v-if="currentTool" class="main-content">
      <!-- 工具头部区域 -->
      <div class="tool-hero">
        <div class="hero-bg-pattern"></div>
        <div class="hero-bg-gradient"></div>
        
        <div class="container hero-container">
          <button class="back-btn" @click="goBack" aria-label="返回">
            <div class="btn-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 3L5 9L11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span>返回工具列表</span>
          </button>

          <div class="hero-content">
            <div class="icon-section">
              <div class="icon-ring"></div>
              <div class="icon-wrapper">
                <div class="icon-glow"></div>
                <ToolIcons :name="currentTool.iconName" :size="72" class="hero-icon" />
              </div>
              <div class="icon-sparkles">
                <span class="sparkle sparkle-1"></span>
                <span class="sparkle sparkle-2"></span>
                <span class="sparkle sparkle-3"></span>
              </div>
            </div>
            
            <div class="hero-info">
              <div class="title-badge">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L9 5H13L10 8L11 12L7 10L3 12L4 8L1 5H5L7 1Z" fill="currentColor"/>
                </svg>
                <span>在线工具</span>
              </div>
              
              <h1 class="tool-title">{{ currentTool.title }}</h1>
              <p class="tool-description">{{ currentTool.description }}</p>
              
              <div class="hero-footer">
                <div class="tool-tags">
                  <span v-for="tag in currentTool.tags" :key="tag" class="tag">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="3" fill="currentColor"/>
                    </svg>
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工作区 -->
      <div class="workspace-section">
        <div class="container">
          <div class="workspace-wrapper">
            <div class="workspace-header">
              <div class="workspace-title">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="2" width="16" height="16" rx="4" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M6 7H14M6 10H14M6 13H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span>工作区</span>
              </div>
              <div class="workspace-actions">
                <span class="hint-text desktop-only">拖拽文件到此处或点击上方上传</span>
              </div>
            </div>

            <div class="workspace-card">
              <component v-if="activeComponent" :is="activeComponent" />
              <div v-else class="workspace-placeholder">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect x="8" y="8" width="48" height="48" rx="12" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/>
                  <path d="M32 24V40M24 32H40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <p>{{ currentTool.title }} 工具开发中...</p>
                <p class="placeholder-hint">敬请期待更多功能</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <main v-else class="main-content">
      <div class="container">
        <button class="back-btn" @click="goBack" aria-label="返回">
          <div class="btn-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 3L5 9L11 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span>返回工具列表</span>
        </button>
        <div class="not-found">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="36" stroke="currentColor" stroke-width="2"/>
            <path d="M40 28V44M40 52V54" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <h1 class="not-found-title">工具未找到</h1>
          <p class="not-found-desc">请检查 URL 是否正确</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
.tool-detail-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

// 工具头部区域
.tool-hero {
  position: relative;
  padding: 48px 0 56px;
  overflow: hidden;

  @include respond-to('sm') {
    padding: 64px 0 72px;
  }

  .hero-bg-pattern {
    position: absolute;
    inset: 0;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba($primary, 0.06) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba($primary, 0.04) 0%, transparent 40%),
      radial-gradient(circle at 60% 80%, rgba($primary, 0.03) 0%, transparent 40%);
    pointer-events: none;
  }

  .hero-bg-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.98) 0%, 
      rgba(248, 250, 252, 0.95) 50%, 
      rgba(241, 245, 249, 0.92) 100%
    );
    backdrop-filter: blur(20px);
    pointer-events: none;
  }

  .hero-container {
    position: relative;
    z-index: 1;
  }
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: $border-radius-full;
  color: $text-secondary;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-bottom: 32px;
  cursor: pointer;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.03);

  .btn-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba($primary, 0.08) 0%, rgba($primary, 0.12) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba($primary, 0.3);
    color: $primary;
    transform: translateX(-4px);
    box-shadow: 
      0 4px 12px rgba($primary, 0.12),
      0 2px 4px rgba(0, 0, 0, 0.04);

    .btn-icon {
      background: linear-gradient(135deg, $primary 0%, color.adjust($primary, $lightness: -10%) 100%);
      color: white;
      transform: scale(1.1);
    }
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateX(-1px);
  }
}

.hero-content {
  display: flex;
  align-items: flex-start;
  gap: 40px;

  @include respond-to('sm') {
    gap: 48px;
  }
}

// 图标区域
.icon-section {
  position: relative;
  width: 136px;
  height: 136px;
  flex-shrink: 0;

  @include respond-to('sm') {
    width: 152px;
    height: 152px;
  }

  .icon-ring {
    position: absolute;
    inset: -4px;
    border-radius: 40px;
    background: conic-gradient(
      from 0deg,
      $primary,
      color.adjust($primary, $lightness: 15%),
      $primary,
      color.adjust($primary, $lightness: -10%),
      $primary
    );
    opacity: 0.6;
    animation: ring-rotate 8s linear infinite;
    filter: blur(2px);
  }

  .icon-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      0 12px 40px rgba($primary, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

    .icon-glow {
      position: absolute;
      inset: -12px;
      background: radial-gradient(circle at center, rgba($primary, 0.2) 0%, transparent 70%);
      border-radius: 48px;
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .hero-icon {
      position: relative;
      z-index: 1;
      filter: drop-shadow(0 2px 8px rgba($primary, 0.2));
    }
  }

  .icon-sparkles {
    position: absolute;
    inset: 0;
    pointer-events: none;

    .sparkle {
      position: absolute;
      width: 6px;
      height: 6px;
      background: linear-gradient(135deg, $primary 0%, color.adjust($primary, $lightness: 20%) 100%);
      border-radius: 50%;
      animation: sparkle-float 3s ease-in-out infinite;

      &::before {
        content: '';
        position: absolute;
        inset: -3px;
        background: radial-gradient(circle, rgba($primary, 0.3) 0%, transparent 70%);
        border-radius: 50%;
      }

      &.sparkle-1 {
        top: 8px;
        right: 12px;
        animation-delay: 0s;
      }

      &.sparkle-2 {
        bottom: 16px;
        left: 4px;
        animation-delay: 1s;
      }

      &.sparkle-3 {
        top: 50%;
        right: -4px;
        animation-delay: 2s;
      }
    }
  }

  &:hover {
    .icon-wrapper {
      transform: scale(1.05);
      box-shadow: 
        0 16px 48px rgba($primary, 0.2),
        0 8px 20px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 1);

      .icon-glow {
        opacity: 1;
      }
    }

    .icon-ring {
      opacity: 0.9;
    }
  }
}

// 信息区域
.hero-info {
  flex: 1;
  min-width: 0;
  padding-top: 4px;

  .title-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: linear-gradient(135deg, rgba($primary, 0.06) 0%, rgba($primary, 0.1) 100%);
    border: 1px solid rgba($primary, 0.15);
    border-radius: $border-radius-full;
    color: $primary;
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    svg {
      animation: badge-twinkle 2s ease-in-out infinite;
    }
  }
}

.tool-title {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 14px;
  letter-spacing: -0.02em;
  color: $text-primary;
  line-height: 1.15;
  background: linear-gradient(135deg, $text-primary 0%, color.adjust($text-primary, $lightness: 15%) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @include respond-to('sm') {
    font-size: 2.75rem;
  }
}

.tool-description {
  font-size: 1.0625rem;
  color: $text-secondary;
  line-height: 1.65;
  margin-bottom: 20px;
  max-width: 560px;

  @include respond-to('sm') {
    font-size: 1.1875rem;
  }
}

.hero-footer {
  display: flex;
  align-items: center;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba($primary, 0.06) 0%, rgba($primary, 0.1) 100%);
  border: 1px solid rgba($primary, 0.18);
  border-radius: $border-radius-full;
  color: $primary;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  svg {
    opacity: 0.6;
    transition: all 0.3s ease;
  }

  &:hover {
    background: linear-gradient(135deg, rgba($primary, 0.1) 0%, rgba($primary, 0.16) 100%);
    border-color: rgba($primary, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($primary, 0.12);

    svg {
      opacity: 1;
      transform: scale(1.2);
    }
  }
}

// 动画
@keyframes ring-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes sparkle-float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-8px) scale(1.2);
    opacity: 1;
  }
}

@keyframes badge-twinkle {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

// 工作区
.workspace-section {
  padding: 40px 0 80px;
  flex: 1;

  @include respond-to('sm') {
    padding: 48px 0 100px;
  }
}

.workspace-wrapper {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);

  @include respond-to('sm') {
    padding: 16px 28px;
  }
}

.workspace-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: $text-primary;
  font-size: 0.9375rem;

  svg {
    color: $primary;
  }
}

.hint-text {
  font-size: 0.8125rem;
  color: $text-muted;
  font-style: italic;

  @include respond-to('sm') {
    display: block;
  }
  display: none;
}

.workspace-card {
  padding: 24px;
  min-height: 400px;

  @include respond-to('sm') {
    padding: 32px;
  }
}

.workspace-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: $text-secondary;

  svg {
    color: $primary;
    opacity: 0.4;
    margin-bottom: 24px;
  }

  p {
    font-size: 1.125rem;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .placeholder-hint {
    font-size: 0.875rem !important;
    color: $text-muted !important;
    font-weight: 400 !important;
  }
}

.not-found {
  text-align: center;
  padding: 80px 0;

  svg {
    color: $text-muted;
    opacity: 0.4;
    margin-bottom: 24px;
  }

  .not-found-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 12px;
    color: $text-primary;
  }

  .not-found-desc {
    font-size: 1rem;
    color: $text-muted;
  }
}

@include respond-to-down('md') {
  .tool-hero {
    padding: 32px 0 40px;
  }

  .hero-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 24px;
  }

  .icon-section {
    width: 100px;
    height: 100px;

    .icon-wrapper {
      border-radius: 24px;
    }

    .icon-ring {
      border-radius: 28px;
    }

    .icon-sparkles .sparkle {
      &.sparkle-1 {
        top: 4px;
        right: 6px;
      }

      &.sparkle-2 {
        bottom: 8px;
        left: 0;
      }

      &.sparkle-3 {
        top: 50%;
        right: -6px;
      }
    }
  }

  .hero-info {
    padding-top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .tool-title {
    font-size: 1.75rem;
  }

  .tool-description {
    font-size: 0.95rem;
    max-width: 100%;
  }

  .hero-footer {
    justify-content: center;
  }

  .tool-tags {
    justify-content: center;
    gap: 8px;
  }

  .tag {
    font-size: 0.75rem;
    padding: 6px 12px;
  }

  .back-btn {
    padding: 8px 14px;
    font-size: 0.8125rem;
    margin-bottom: 24px;

    .btn-icon {
      width: 24px;
      height: 24px;
    }
  }

  .workspace-section {
    padding: 24px 0 60px;
  }

  .workspace-header {
    padding: 12px 16px;
  }

  .workspace-card {
    padding: 16px;
    min-height: 300px;
  }

  .not-found {
    padding: 48px 0;

    .not-found-title {
      font-size: 1.5rem;
    }
  }
}

@include respond-to-down('sm') {
  .desktop-only {
    display: none;
  }

  .tool-hero {
    padding: 24px 0 32px;
  }

  .hero-content {
    gap: 16px;
  }

  .icon-section {
    width: 80px;
    height: 80px;

    .icon-wrapper {
      border-radius: 20px;
    }

    .icon-ring {
      border-radius: 24px;
    }
  }

  .tool-title {
    font-size: 1.5rem;
  }

  .tool-description {
    font-size: 0.875rem;
  }

  .workspace-card {
    padding: 12px;
    min-height: 250px;
  }

  .workspace-title {
    font-size: 0.875rem;
    gap: 6px;
  }

  .workspace-placeholder {
    padding: 40px 16px;
  }
}
</style>
