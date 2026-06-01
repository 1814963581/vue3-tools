<script setup lang="ts">
const scrollToTools = () => {
  document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          精选在线工具集合
        </div>
        <h1 class="hero-title">
          <span class="gradient-text">工具</span>让工作更高效
        </h1>
        <p class="hero-tagline">
          证件照制作 · JSON 格式化 · 图片压缩 · 密码生成 · 更多工具持续添加中
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary" @click="scrollToTools">
            探索工具
            <span class="btn-icon" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  min-height: 70vh;
  display: flex;
  align-items: center;
  padding-top: 100px;
  padding-bottom: 80px;
  position: relative;
}

.hero-content {
  text-align: center;
  max-width: 680px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 8px 20px;
  background: rgba($primary, 0.06);
  border: 1px solid rgba($primary, 0.1);
  border-radius: $border-radius-full;
  font-size: 0.875rem;
  font-weight: 500;
  color: $primary;
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $primary;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.3);
  }
}

.hero-title {
  font-size: 3.25rem;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 24px;
  letter-spacing: -0.03em;
  color: $text-primary;

  @include respond-to('sm') {
    font-size: 4.25rem;
  }
}

.hero-tagline {
  font-size: 1.0625rem;
  color: $text-secondary;
  margin-bottom: 48px;
  line-height: 1.7;

  @include respond-to('sm') {
    font-size: 1.1875rem;
  }
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 36px;
  font-size: 1.0625rem;
  font-weight: 600;
  border-radius: $border-radius-lg;
  transition: $transition-bounce;

  @include respond-to('sm') {
    padding: 18px 40px;
    font-size: 1.125rem;
  }
}

.btn-primary {
  background: $gradient-primary;
  color: white;
  @include glow($primary);

  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 32px rgba($primary, 0.35), 0 0 80px rgba($primary, 0.08);
  }

  &:active {
    transform: translateY(-1px) scale(0.98);
  }
}

.btn-icon {
  transition: $transition-bounce;
}

.btn:hover .btn-icon {
  transform: translateX(6px);
}

@include respond-to-down('sm') {
  .hero {
    min-height: 50vh;
    padding-top: 60px;
    padding-bottom: 60px;
  }

  .hero-content {
    max-width: 100%;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-tagline {
    font-size: 0.9rem;
  }

  .hero-badge {
    padding: 6px 16px;
    font-size: 0.8rem;
  }

  .btn {
    padding: 14px 28px;
    font-size: 0.95rem;
  }
}

@include respond-to-down('md') {
  .hero-title {
    font-size: 2.5rem;
  }
}
</style>