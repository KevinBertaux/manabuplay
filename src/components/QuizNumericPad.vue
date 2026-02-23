<script setup>
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  answerLocked: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['digit', 'backspace', 'enter']);

const keys = [
  { id: '1', kind: 'digit', label: '1' },
  { id: '2', kind: 'digit', label: '2' },
  { id: '3', kind: 'digit', label: '3' },
  { id: '4', kind: 'digit', label: '4' },
  { id: '5', kind: 'digit', label: '5' },
  { id: '6', kind: 'digit', label: '6' },
  { id: '7', kind: 'digit', label: '7' },
  { id: '8', kind: 'digit', label: '8' },
  { id: '9', kind: 'digit', label: '9' },
  { id: 'backspace', kind: 'backspace', label: '⌫' },
  { id: '0', kind: 'digit', label: '0' },
  { id: 'enter', kind: 'enter', label: '✓' },
];

function isDisabled(key) {
  if (props.disabled) {
    return true;
  }

  if (key.kind === 'enter') {
    return false;
  }

  return props.answerLocked;
}

function onPress(key) {
  if (isDisabled(key)) {
    return;
  }

  if (key.kind === 'digit') {
    emit('digit', key.label);
    return;
  }

  if (key.kind === 'backspace') {
    emit('backspace');
    return;
  }

  if (key.kind === 'enter') {
    emit('enter');
  }
}
</script>

<template>
  <div class="numeric-pad" role="group" aria-label="Pavé numérique">
    <button
      v-for="key in keys"
      :key="key.id"
      type="button"
      class="pad-key"
      :class="{
        'is-enter': key.kind === 'enter',
        'is-action': key.kind === 'backspace',
      }"
      :aria-label="key.kind === 'enter' ? 'Entrée' : key.kind === 'backspace' ? 'Retour arrière' : key.label"
      :disabled="isDisabled(key)"
      @click="onPress(key)"
    >
      {{ key.label }}
    </button>
  </div>
</template>

<style scoped>
.numeric-pad {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid #9bb9d3;
  border-radius: 12px;
  overflow: hidden;
  background: #f3faff;
  width: 100%;
  max-width: 228px;
}

.pad-key {
  border: 0;
  border-right: 1px solid #9bb9d3;
  border-bottom: 1px solid #9bb9d3;
  min-height: 46px;
  font-size: 1rem;
  font-weight: 800;
  color: #1d4b6a;
  background: transparent;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    filter 0.18s ease;
}

.pad-key:nth-child(3n) {
  border-right: 0;
}

.pad-key:nth-child(n + 10) {
  border-bottom: 0;
}

.pad-key:hover:not(:disabled),
.pad-key:focus-visible:not(:disabled) {
  background: #deefff;
}

.pad-key.is-action {
  color: #194665;
  background: #eaf4ff;
}

.pad-key.is-action:hover:not(:disabled),
.pad-key.is-action:focus-visible:not(:disabled) {
  background: #d7e9ff;
}

.pad-key.is-enter {
  color: #f7f9fc;
  background: var(--btn-primary-grad);
  filter: saturate(1);
}

.pad-key.is-enter:hover:not(:disabled),
.pad-key.is-enter:focus-visible:not(:disabled) {
  background: linear-gradient(135deg, #0f89b1, #118e98);
  filter: saturate(1.08);
}

.pad-key:disabled {
  opacity: 0.58;
  cursor: not-allowed;
}
</style>
