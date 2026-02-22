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
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  pointer-events: none;
  width: max-content;
  max-width: min(92vw, 520px);
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-weight: 800;
  font-size: 0.95rem;
  text-align: center;
  box-shadow: 0 8px 18px rgba(36, 48, 65, 0.18);
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
  transform: translate(-50%, -12px);
}
</style>
