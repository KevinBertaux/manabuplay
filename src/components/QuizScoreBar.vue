<script setup>
defineProps({
  score: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  streak: {
    type: Number,
    required: true,
  },
  bestStreak: {
    type: Number,
    required: true,
  },
  extras: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <div class="mp-panel-info">
    <span>Score : {{ score }} / {{ total }}</span>
    <span>🏆 Série : {{ streak }}</span>
    <span>🥇 Meilleure série : {{ bestStreak }}</span>
    <span v-for="extra in extras" :key="extra">{{ extra }}</span>
  </div>
</template>
