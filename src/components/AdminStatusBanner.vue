<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: 'info',
  },
});

const toneClass = computed(() => {
  if (props.tone === 'success') {
    return 'admin-status-success';
  }
  if (props.tone === 'error') {
    return 'admin-status-error';
  }
  return 'admin-status-info';
});
</script>

<template>
  <p v-if="message" class="admin-status" :class="toneClass">{{ message }}</p>
</template>

<style scoped>
.admin-status {
  margin: 12px 0 0;
  font-weight: 700;
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid transparent;
}

.admin-status-success {
  color: #175843;
  background: #e3f6ee;
  border-color: #9fd7c1;
}

.admin-status-error {
  color: #8e2b2b;
  background: #ffe9e9;
  border-color: #efb3b3;
}

.admin-status-info {
  color: #244161;
  background: #e9f2ff;
  border-color: #b8cde9;
}
</style>
