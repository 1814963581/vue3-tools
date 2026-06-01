<script lang="ts">
export default {
  name: 'HomeView'
}
</script>

<script setup lang="ts">
import AppBackground from '@/components/common/AppBackground.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import ToolsSection from '@/components/home/ToolsSection.vue'
import Footer from '@/components/common/Footer.vue'
</script>

<template>
  <div class="home-view">
    <AppBackground />

    <main>
      <HeroSection />
      <ToolsSection />
    </main>
    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.home-view {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

main {
  position: relative;
  z-index: 1;
}
</style>
