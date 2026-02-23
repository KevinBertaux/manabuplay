<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="empty-list-state">{{ message }}</div>
</template>

<style scoped>
.empty-list-state {
  text-align: center;
  font-weight: 700;
  color: #3a4b61;
  background: rgba(78, 205, 196, 0.12);
  border: 1px dashed #7ab8c3;
  border-radius: 12px;
  padding: 16px;
}
</style>
