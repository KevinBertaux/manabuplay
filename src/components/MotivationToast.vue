<script setup>
defineProps({
  message: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: 'streak',
  },
});
</script>

<template>
  <transition name="motivation-toast-slide">
    <div
      v-if="message"
      class="motivation-toast"
      :class="tone === 'record' ? 'motivation-toast-record' : 'motivation-toast-streak'"
      role="status"
      aria-live="polite"
    >
      {{ message }}
    </div>
  </transition>
</template>

<style scoped>
.motivation-toast {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  pointer-events: none;
  min-width: min(86vw, 320px);
  max-width: min(92vw, 620px);
  padding: 12px 18px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 800;
  font-size: 1.02rem;
  text-align: center;
  box-shadow: 0 10px 22px rgba(36, 48, 65, 0.2);
}

.motivation-toast-streak {
  color: #133b2b;
  background: linear-gradient(135deg, #ddf8eb, #c9f4df);
  border-color: #9fd8bf;
}

.motivation-toast-record {
  color: #3b2b12;
  background: linear-gradient(135deg, #fff3d4, #ffe9b0);
  border-color: #f0d388;
}

.motivation-toast-slide-enter-active,
.motivation-toast-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.motivation-toast-slide-enter-from,
.motivation-toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -26px);
}
</style>
