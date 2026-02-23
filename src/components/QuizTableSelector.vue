<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: 'Choisir les tables :',
  },
  values: {
    type: Array,
    default: () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },
});

const emit = defineEmits(['update:modelValue']);

function normalizeValues(values) {
  const seen = new Set();
  const normalized = [];

  for (const value of values) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || seen.has(parsed)) {
      continue;
    }
    seen.add(parsed);
    normalized.push(parsed);
  }

  return normalized;
}

const availableValues = computed(() => normalizeValues(props.values));
const selectedValues = computed(() => normalizeSelection(props.modelValue));

function normalizeSelection(rawValues) {
  const allowed = availableValues.value;
  const allowedSet = new Set(allowed);
  const orderMap = new Map(allowed.map((value, index) => [value, index]));
  const seen = new Set();
  const normalized = [];

  const source = Array.isArray(rawValues) ? rawValues : [];
  for (const value of source) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || !allowedSet.has(parsed) || seen.has(parsed)) {
      continue;
    }
    seen.add(parsed);
    normalized.push(parsed);
  }

  normalized.sort((a, b) => orderMap.get(a) - orderMap.get(b));
  return normalized;
}

function updateSelection(nextValues) {
  emit('update:modelValue', normalizeSelection(nextValues));
}

function hasSelected(value) {
  return selectedValues.value.includes(value);
}

function toggleValue(value) {
  if (hasSelected(value)) {
    updateSelection(selectedValues.value.filter((item) => item !== value));
    return;
  }
  updateSelection([...selectedValues.value, value]);
}

function applyPreset(preset) {
  if (preset === 'all') {
    updateSelection(availableValues.value);
    return;
  }

  if (preset === 'none') {
    updateSelection([]);
    return;
  }

  if (preset === 'even') {
    updateSelection(availableValues.value.filter((value) => value % 2 === 0));
    return;
  }

  if (preset === 'odd') {
    updateSelection(availableValues.value.filter((value) => value % 2 !== 0));
  }
}

const quickActions = [
  { id: 'all', label: 'Tout' },
  { id: 'none', label: 'Aucun' },
  { id: 'even', label: 'Pairs' },
  { id: 'odd', label: 'Impairs' },
];
</script>

<template>
  <div class="table-selector">
    <p class="selector-label">{{ label }}</p>
    <div class="table-grid" role="group" aria-label="Choix des tables">
      <button
        v-for="value in availableValues"
        :key="`table-${value}`"
        type="button"
        class="table-cell"
        :class="{ 'is-selected': hasSelected(value) }"
        @click="toggleValue(value)"
      >
        {{ value }}
      </button>

      <button
        v-for="action in quickActions"
        :key="`action-${action.id}`"
        type="button"
        class="table-cell table-action"
        @click="applyPreset(action.id)"
      >
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.selector-label {
  margin: 0 0 8px;
  font-weight: 700;
}

.table-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: min(320px, 100%);
  margin-inline: auto;
  gap: 0;
  border: 1px solid #9bb9d3;
  border-radius: 12px;
  overflow: hidden;
  background: #f3faff;
}

.table-cell {
  border: 0;
  border-right: 1px solid #9bb9d3;
  border-bottom: 1px solid #9bb9d3;
  border-radius: 0;
  min-height: 44px;
  font-size: 1rem;
  font-weight: 700;
  color: #1d4b6a;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.table-cell:hover,
.table-cell:focus-visible {
  background: #deefff;
}

.table-grid .table-cell:nth-child(4n) {
  border-right: 0;
}

.table-grid .table-cell:nth-child(n + 13) {
  border-bottom: 0;
}

.table-cell.is-selected {
  color: var(--ink-inverse);
  background: var(--btn-primary-grad);
}

.table-action {
  background: #ecf8ef;
  color: #1d5740;
}

.table-action:hover,
.table-action:focus-visible {
  background: #d8f0df;
}
</style>
