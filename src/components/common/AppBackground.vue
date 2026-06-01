<template>
  <div class="app-background">
    <div class="bg-base"></div>
    <div class="bg-gradient"></div>
    <div class="bg-dots"></div>
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>
    <div class="bg-orb bg-orb-3"></div>
  </div>
</template>

<style lang="scss" scoped>
.bg-base {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: $bg-page;
  pointer-events: none;
  z-index: 0;
}

.bg-gradient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(ellipse 70% 60% at 15% 20%, rgba($primary, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse 50% 50% at 75% 60%, rgba($secondary, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse 40% 40% at 50% 90%, rgba($accent, 0.04) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.bg-dots {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(rgba($primary, 0.06) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
  z-index: 0;
}

.bg-orb {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(80px);
  animation: orbFloat 12s ease-in-out infinite;
}

.bg-orb-1 {
  width: 500px;
  height: 500px;
  top: -10%;
  left: -5%;
  background: rgba($primary, 0.06);
  animation-delay: 0s;
}

.bg-orb-2 {
  width: 400px;
  height: 400px;
  top: 40%;
  right: -10%;
  background: rgba($secondary, 0.05);
  animation-delay: -4s;
}

.bg-orb-3 {
  width: 350px;
  height: 350px;
  bottom: -10%;
  left: 40%;
  background: rgba($accent, 0.04);
  animation-delay: -8s;
}

@keyframes orbFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.05);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.95);
  }
}
</style>