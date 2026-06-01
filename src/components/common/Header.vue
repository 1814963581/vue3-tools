<script setup lang="ts">
</script>

<template>
  <header class="header">
    <div class="container header-content">
      <a href="/" class="logo" role="banner" aria-label="首页">
        <span class="logo-icon" aria-hidden="true">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </span>
        <span class="logo-text"><span class="gradient-text">工具集</span></span>
      </a>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  padding: 16px 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 700;

  @include respond-to('sm') {
    font-size: 1.75rem;
  }
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  animation: float 4s ease-in-out infinite;
  filter: drop-shadow(0 2px 8px rgba($primary, 0.2));

  .icon-svg {
    width: 32px;
    height: 32px;
  }
}

@include respond-to-down('sm') {
  .header {
    padding: 12px 0;
  }

  .logo {
    font-size: 1.25rem;
  }

  .logo-icon .icon-svg {
    width: 28px;
    height: 28px;
  }
}
</style>