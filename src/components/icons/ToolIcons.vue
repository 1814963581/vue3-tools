<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  size?: number
}>()

const iconSize = computed(() => props.size || 24)

const iconPaths: Record<string, { path: string; gradient?: string }> = {
  camera: {
    path: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-3 10H7v-2h10v2zm0-4H7V8h10v2zm3-5.5c-.83 0-1.5-.67-1.5-1.5S15.17 4 16 4s1.5.67 1.5 1.5S16.83 7 16 7z',
    gradient: 'url(#cameraGradient)'
  },
  convert: {
    path: 'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z',
    gradient: 'url(#convertGradient)'
  },
  document: {
    path: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
    gradient: 'url(#documentGradient)'
  },
  image: {
    path: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
    gradient: 'url(#imageGradient)'
  },
  palette: {
    path: 'M20 20H4V6h16v14zM17 8l-1.41-1.41-6.3 6.3L10 14l7-7z',
    gradient: 'url(#paletteGradient)'
  },
  edit: {
    path: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7l-3-4zM6 6h5v5H6V6zm13 12H6v-2h13v2zm0-4H6v-2h13v2zm-8-5l3 3-3 3',
    gradient: 'url(#editGradient)'
  },
  lock: {
    path: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.72 1.38-3.12 3.1-3.12 1.72 0 3.1 1.38 3.1 3.12v2z',
    gradient: 'url(#lockGradient)'
  },
  file: {
    path: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
    gradient: 'url(#fileGradient)'
  },
  target: {
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z',
    gradient: 'url(#targetGradient)'
  },
  clipboard: {
    path: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 16H9V7h9v14z',
    gradient: 'url(#clipboardGradient)'
  },
  clock: {
    path: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
    gradient: 'url(#clockGradient)'
  },
  ruler: {
    path: 'M3 17h2v-2H3v2zm4 4h2v-2H7v2zm4-8h2V7h-2v6zm8-10v2h2V3h-2zm-4 4h2V5h-2v2zm-4-4v2h2V3h-2zm-4 8h2V7h-2v6zm-4-4h2V5h-2v2zM3 5h2V3H3v2zm0 12h2v-2H3v2zm20 0h2v-2h-2v2zM5 21h2v-2H5v2zm4-4h2v-2H9v2zm4 4h2v-2h-2v2zm4-4h2v-2h-2v2zm4 4h2v-2h-2v2zM3 9h2V7H3v2zm16-4h2V3h-2v2zm0 16h2v-2h-2v2zm-4-4h2v-2h-2v2z',
    gradient: 'url(#rulerGradient)'
  },
  shield: {
    path: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 16.9c-2.97-.49-5.48-1.4-7.28-2.5l1.59-1.24c1.22.72 2.68 1.21 4.22 1.59 1.18-.31 2.3-.85 3.29-1.56l1.65 1.26c-1.85 1.16-4.4 2.12-7.48 2.51zM12 10.9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z',
    gradient: 'url(#shieldGradient)'
  },
  barChart: {
    path: 'M5 19h14V5H5v14zm2-2h10V7H7v10zm2-8h6v6H9v-6z',
    gradient: 'url(#barChartGradient)'
  },
  base64: {
    path: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-1 5h-2v2h2v2h-2v2h2v-2h2v2h2v-2h-2v-2h2v-2h-2v2h-2v-2zM6 12h2v2H6v-2zm0 4h2v2H6v-2z',
    gradient: 'url(#base64Gradient)'
  }
}

const getIconData = (name: string) => {
  return iconPaths[name] || iconPaths.camera
}
</script>

<template>
  <svg 
    :width="iconSize" 
    :height="iconSize" 
    viewBox="0 0 24 24" 
    fill="none"
    class="tool-svg-icon"
  >
    <defs>
      <linearGradient id="cameraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#667eea"/>
        <stop offset="100%" style="stop-color:#764ba2"/>
      </linearGradient>
      <linearGradient id="convertGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f093fb"/>
        <stop offset="100%" style="stop-color:#f5576c"/>
      </linearGradient>
      <linearGradient id="documentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#4facfe"/>
        <stop offset="100%" style="stop-color:#00f2fe"/>
      </linearGradient>
      <linearGradient id="imageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#43e97b"/>
        <stop offset="100%" style="stop-color:#38f9d7"/>
      </linearGradient>
      <linearGradient id="paletteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#fa709a"/>
        <stop offset="100%" style="stop-color:#fee140"/>
      </linearGradient>
      <linearGradient id="editGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#a8edea"/>
        <stop offset="100%" style="stop-color:#fed6e3"/>
      </linearGradient>
      <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ff9a9e"/>
        <stop offset="100%" style="stop-color:#fecfef"/>
      </linearGradient>
      <linearGradient id="fileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ffecd2"/>
        <stop offset="100%" style="stop-color:#fcb69f"/>
      </linearGradient>
      <linearGradient id="targetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ff758c"/>
        <stop offset="100%" style="stop-color:#ff7eb3"/>
      </linearGradient>
      <linearGradient id="clipboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#667eea"/>
        <stop offset="100%" style="stop-color:#764ba2"/>
      </linearGradient>
      <linearGradient id="clockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#4facfe"/>
        <stop offset="100%" style="stop-color:#00f2fe"/>
      </linearGradient>
      <linearGradient id="rulerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#43e97b"/>
        <stop offset="100%" style="stop-color:#38f9d7"/>
      </linearGradient>
      <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#fa709a"/>
        <stop offset="100%" style="stop-color:#fee140"/>
      </linearGradient>
      <linearGradient id="barChartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#a8edea"/>
        <stop offset="100%" style="stop-color:#fed6e3"/>
      </linearGradient>
      <linearGradient id="base64Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#667eea"/>
        <stop offset="100%" style="stop-color:#14b8a6"/>
      </linearGradient>
    </defs>
    <path 
      :d="getIconData(name).path" 
      :fill="getIconData(name).gradient"
    />
  </svg>
</template>

<style lang="scss" scoped>
.tool-svg-icon {
  filter: drop-shadow(0 4px 12px rgba(79, 124, 255, 0.15));
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
}

.tool-svg-icon:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 8px 20px rgba(79, 124, 255, 0.25));
}
</style>
