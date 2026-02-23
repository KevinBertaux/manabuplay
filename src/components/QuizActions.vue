<script setup>
defineProps({
  canCheck: {
    type: Boolean,
    default: true,
  },
  checkLabel: {
    type: String,
    default: 'Vérifier ✓',
  },
  nextLabel: {
    type: String,
    default: 'Question suivante →',
  },
});

defineEmits(['check', 'next']);
</script>

<template>
  <div class="mp-actions">
    <button class="mp-btn mp-btn-primary" type="button" :disabled="!canCheck" @click="$emit('check')">
      {{ checkLabel }}
    </button>
    <button class="mp-btn mp-btn-secondary" type="button" @click="$emit('next')">
      {{ nextLabel }}
    </button>
  </div>
</template>
