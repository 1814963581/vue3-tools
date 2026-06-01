<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <p class="footer-text">
          使用 Vue 3 + Vite + TypeScript 构建
          <svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </p>
        <p class="footer-copy">
          &copy; {{ currentYear }} 保留所有权利
        </p>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  padding: 32px 0;
  text-align: center;
  border-top: 1px solid rgba($primary, 0.06);
}

.footer-text {
  font-size: 0.8125rem;
  color: $text-muted;
  margin-bottom: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .inline-icon {
    width: 16px;
    height: 16px;
    vertical-align: middle;
  }
}

.footer-copy {
  font-size: 0.75rem;
  color: $text-muted;
}
</style>