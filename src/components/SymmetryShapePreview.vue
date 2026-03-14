<script setup>
import { computed } from 'vue';

const props = defineProps({
  points: {
    type: Array,
    required: true,
  },
  axis: {
    type: String,
    default: 'vertical',
  },
  renderMode: {
    type: String,
    default: 'open',
  },
  gridSize: {
    type: Number,
    default: 5,
  },
  size: {
    type: Number,
    default: 120,
  },
  padding: {
    type: Number,
    default: 12,
  },
  axisOverflow: {
    type: Number,
    default: 10,
  },
  pointRadius: {
    type: Number,
    default: 3.2,
  },
  strokeWidth: {
    type: Number,
    default: 2.4,
  },
  showGrid: {
    type: Boolean,
    default: true,
  },
  filled: {
    type: Boolean,
    default: false,
  },
  transformForAxis: {
    type: Boolean,
    default: false,
  },
});

function pointToPixel(point, gridSize, size, padding) {
  const step = (size - padding * 2) / (gridSize - 1);
  return {
    x: padding + point.x * step,
    y: padding + point.y * step,
  };
}

function transposeShape(points) {
  return points.map((point) => ({ x: point.y, y: point.x }));
}

function shapeForAxis(points, axis) {
  return axis === 'horizontal' ? transposeShape(points) : points.map((point) => ({ ...point }));
}

function buildShapePoints(points, gridSize, size, padding) {
  return points
    .map((point) => pointToPixel(point, gridSize, size, padding))
    .map((point) => `${point.x},${point.y}`)
    .join(' ');
}

function buildAxisLine(axis, gridSize, size, padding, overflow) {
  const step = (size - padding * 2) / (gridSize - 1);

  if (axis === 'horizontal') {
    const axisY = padding + ((gridSize - 1) / 2) * step;
    return {
      x1: padding - overflow,
      y1: axisY,
      x2: size - padding + overflow,
      y2: axisY,
    };
  }

  const axisX = padding + ((gridSize - 1) / 2) * step;
  return {
    x1: axisX,
    y1: padding - overflow,
    x2: axisX,
    y2: size - padding + overflow,
  };
}

function buildGridLines(gridSize, size, padding) {
  const lines = [];
  const step = (size - padding * 2) / (gridSize - 1);

  for (let index = 0; index < gridSize; index += 1) {
    const position = padding + index * step;
    lines.push({ x1: padding, y1: position, x2: size - padding, y2: position });
    lines.push({ x1: position, y1: padding, x2: position, y2: size - padding });
  }

  return lines;
}

const displayPoints = computed(() =>
  props.transformForAxis ? shapeForAxis(props.points, props.axis) : props.points.map((point) => ({ ...point }))
);
const shapePoints = computed(() => buildShapePoints(displayPoints.value, props.gridSize, props.size, props.padding));
const axisLine = computed(() =>
  buildAxisLine(props.axis, props.gridSize, props.size, props.padding, props.axisOverflow)
);
const gridLines = computed(() => buildGridLines(props.gridSize, props.size, props.padding));
const shouldCloseShape = computed(() => props.renderMode === 'closed' && displayPoints.value.length >= 3);
</script>

<template>
  <svg
    class="symmetry-shape-preview"
    :viewBox="`0 0 ${size} ${size}`"
    role="img"
    aria-label="Aperçu d'une forme de symétrie"
  >
    <line
      v-for="(line, index) in showGrid ? gridLines : []"
      :key="`grid-${index}`"
      :x1="line.x1"
      :y1="line.y1"
      :x2="line.x2"
      :y2="line.y2"
      class="symmetry-shape-preview__grid"
    />
    <line
      :x1="axisLine.x1"
      :y1="axisLine.y1"
      :x2="axisLine.x2"
      :y2="axisLine.y2"
      class="symmetry-shape-preview__axis"
    />
    <polygon v-if="shouldCloseShape" :points="shapePoints" class="symmetry-shape-preview__shape" :class="{ 'is-filled': filled }" />
    <polyline v-else :points="shapePoints" class="symmetry-shape-preview__shape" :class="{ 'is-filled': filled }" />
    <circle
      v-for="(point, index) in displayPoints"
      :key="`point-${index}`"
      :cx="pointToPixel(point, gridSize, size, padding).x"
      :cy="pointToPixel(point, gridSize, size, padding).y"
      :r="pointRadius"
      class="symmetry-shape-preview__point"
    />
  </svg>
</template>

<style scoped>
.symmetry-shape-preview {
  width: 100%;
  height: auto;
  display: block;
}

.symmetry-shape-preview__grid {
  stroke: #e6edf6;
  stroke-width: 1;
}

.symmetry-shape-preview__axis {
  stroke: #0f766e;
  stroke-width: 2;
  stroke-dasharray: 4 3;
  stroke-linecap: round;
}

.symmetry-shape-preview__shape {
  fill: none;
  stroke: #243041;
  stroke-width: v-bind(strokeWidth);
  stroke-linecap: round;
  stroke-linejoin: round;
}

.symmetry-shape-preview__shape.is-filled {
  fill: rgba(88, 128, 196, 0.12);
}

.symmetry-shape-preview__point {
  fill: #243041;
}
</style>
