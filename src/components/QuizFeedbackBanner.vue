<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: '',
  },
  main: {
    type: String,
    default: '',
  },
  extra: {
    type: String,
    default: '',
  },
});

const feedbackClass = computed(() =>
  props.type === 'correct' ? 'mp-feedback-success' : 'mp-feedback-error'
);
</script>

<template>
  <div v-if="main" class="mp-feedback" :class="feedbackClass">
    <div>{{ main }}</div>
    <div v-if="extra" class="feedback-extra">{{ extra }}</div>
  </div>
</template>

<style scoped>
.feedback-extra {
  margin-top: 6px;
}
</style>
