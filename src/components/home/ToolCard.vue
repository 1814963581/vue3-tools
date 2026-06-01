<script setup lang="ts">
import { useRouter } from 'vue-router'
import ToolIcons from '@/components/icons/ToolIcons.vue'

interface Tool {
  id: number
  iconName: string
  title: string
  description: string
  tags: string[]
  category: string
}

const props = defineProps<{
  tool: Tool
}>()

const router = useRouter()

const handleUseTool = () => {
  router.push(`/tool/${props.tool.id}`)
}
</script>

<template>
  <div
    class="tool-card"
    @click="handleUseTool"
    @keydown.enter="handleUseTool"
    @keydown.space.prevent="handleUseTool"
    role="button"
    tabindex="0"
    :aria-label="`${tool.title} - ${tool.description}`"
  >
    <div class="card-bg"></div>
    <div class="card-glow"></div>
    <div class="card-content">
      <div class="card-header">
        <div class="icon-wrapper">
          <ToolIcons :name="tool.iconName" :size="48" class="tool-icon" />
        </div>
        <span class="tool-category">{{ tool.category }}</span>
      </div>

      <h3 class="tool-title">{{ tool.title }}</h3>
      <p class="tool-description">{{ tool.description }}</p>

      <div class="tool-tags">
        <span v-for="tag in tool.tags" :key="tag" class="tag">
          {{ tag }}
        </span>
      </div>

      <div class="card-footer">
        <span class="use-text">立即使用</span>
        <span class="arrow-wrapper">
          <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tool-card {
  position: relative;
  border-radius: 28px;
  padding: 32px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 252, 0.88) 100%);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  overflow: hidden;

  &:hover {
    transform: translateY(-8px) scale(1.01);
    box-shadow: 
      0 20px 48px rgba(79, 124, 255, 0.15),
      0 8px 24px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);
    border-color: rgba(79, 124, 255, 0.2);

    .card-bg {
      opacity: 1;
      transform: scale(1.1);
    }

    .card-glow {
      opacity: 0.6;
    }

    .icon-wrapper {
      transform: scale(1.08) translateY(-4px);
      box-shadow: 0 12px 40px rgba(79, 124, 255, 0.25);
    }

    .arrow-wrapper {
      transform: translateX(8px);
    }
  }
}

.card-bg {
  position: absolute;
  inset: -50%;
  background: linear-gradient(135deg, rgba(79, 124, 255, 0.03) 0%, rgba(20, 184, 166, 0.03) 50%, rgba(251, 146, 60, 0.03) 100%);
  opacity: 0;
  transition: all 0.4s ease;
}

.card-glow {
  position: absolute;
  top: -20%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(79, 124, 255, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.card-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 16px rgba(79, 124, 255, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tool-icon {
  transition: transform 0.3s ease;
}

.tool-category {
  font-size: 0.75rem;
  font-weight: 600;
  color: $primary;
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(79, 124, 255, 0.08) 0%, rgba(79, 124, 255, 0.04) 100%);
  border-radius: $border-radius-full;
  border: 1px solid rgba(79, 124, 255, 0.15);
  backdrop-filter: blur(10px);
}

.tool-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 12px;
  color: $text-primary;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.tool-description {
  font-size: 0.9375rem;
  color: $text-secondary;
  line-height: 1.7;
  margin-bottom: 20px;
  flex: 1;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.tag {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(20, 184, 166, 0.04) 100%);
  border: 1px solid rgba(20, 184, 166, 0.15);
  border-radius: $border-radius-full;
  color: $secondary;
  backdrop-filter: blur(10px);
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid rgba(79, 124, 255, 0.08);
}

.use-text {
  font-size: 0.9375rem;
  font-weight: 700;
  background: linear-gradient(135deg, $primary 0%, $secondary 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.arrow-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(79, 124, 255, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.arrow {
  width: 18px;
  height: 18px;
  color: $primary;
}

@include respond-to-down('sm') {
  .tool-card {
    padding: 24px;
    min-height: 260px;
    border-radius: 22px;
  }

  .card-header {
    margin-bottom: 18px;
  }

  .icon-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 18px;
  }

  .tool-title {
    font-size: 1.25rem;
  }

  .tool-description {
    font-size: 0.875rem;
    margin-bottom: 16px;
  }

  .tool-tags {
    gap: 8px;
    margin-bottom: 20px;
  }

  .tag {
    font-size: 0.7rem;
    padding: 4px 10px;
  }

  .card-footer {
    padding-top: 16px;
  }

  .use-text {
    font-size: 0.875rem;
  }

  .arrow-wrapper {
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }

  .arrow {
    width: 16px;
    height: 16px;
  }

  .tool-category {
    font-size: 0.7rem;
    padding: 4px 10px;
  }
}
</style>