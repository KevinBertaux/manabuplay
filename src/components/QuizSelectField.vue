<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  selectId: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  placeholderDisabled: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="quiz-select-field">
    <label class="quiz-select-label" :for="selectId">{{ label }}</label>
    <select
      :id="selectId"
      class="quiz-select-control"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-if="placeholder" value="" :disabled="placeholderDisabled">{{ placeholder }}</option>
      <option v-for="option in options" :key="String(option.value)" :value="option.value" :disabled="option.disabled">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.quiz-select-label {
  display: block;
  margin: 0 0 8px;
  font-weight: 700;
}

.quiz-select-control {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #9ab0c8;
  background: #fbfdff;
}

.quiz-select-control:focus-visible {
  border-color: #1d4ed8;
  box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.16);
  outline: none;
}
</style>
