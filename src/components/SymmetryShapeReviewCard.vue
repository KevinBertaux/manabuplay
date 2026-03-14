<script setup>
import { computed, ref } from 'vue';
import SymmetryShapePreview from '@/components/SymmetryShapePreview.vue';

const props = defineProps({
  entry: {
    type: Object,
    required: true,
  },
  gridSize: {
    type: Number,
    required: true,
  },
});

const previewAxis = ref('vertical');

const statusLabels = Object.freeze({
  accepted: 'Acceptée',
  review: 'À revoir',
  rejected: 'Rejetée',
});
const issueLabels = Object.freeze({
  moins_de_3_points: 'Moins de 3 points',
  point_invalide: 'Point invalide',
  hors_grille: 'Point hors grille',
  points_dupliques: 'Points dupliqués',
  tous_alignes: 'Tous les points sont alignés',
  forme_trop_petite: 'Forme trop petite',
  trop_de_points_sur_axe: 'Trop de points sur l’axe',
  doublon_exact: 'Doublon exact',
  doublon_normalise: 'Doublon après normalisation',
  axe_charge: 'Axe trop chargé',
  silhouette_peu_variee: 'Silhouette peu variée',
  peu_de_changements_de_direction: 'Peu de changements de direction',
  bon_potentiel_pedagogique: 'Bon potentiel pédagogique',
  forme_correcte: 'Forme correcte',
});

function labelForIssue(code) {
  return issueLabels[code] || code;
}

const cardStatusLabel = computed(() => statusLabels[props.entry.autoStatus] || 'À revoir');
const issueCount = computed(() => props.entry.hardFailures.length + props.entry.warnings.length);
const hardFailureLabels = computed(() => props.entry.hardFailures.map(labelForIssue));
const warningLabels = computed(() => props.entry.warnings.map(labelForIssue));
const noteLabels = computed(() => props.entry.notes.map(labelForIssue));
const truncatedWarnings = computed(() => warningLabels.value.slice(0, 2));
const hiddenWarningsCount = computed(() => Math.max(0, warningLabels.value.length - truncatedWarnings.value.length));
const hardFailureCount = computed(() => hardFailureLabels.value.length);
const warningCount = computed(() => warningLabels.value.length);

function pluralize(count, singular, plural = `${singular}s`) {
  return count > 1 ? plural : singular;
}

const reviewSummary = computed(() => {
  const parts = [];

  if (hardFailureCount.value > 0) {
    parts.push(`${hardFailureCount.value} ${pluralize(hardFailureCount.value, 'blocage')}`);
  }

  if (warningCount.value > 0) {
    parts.push(`${warningCount.value} ${pluralize(warningCount.value, "point d'attention", "points d'attention")}`);
  }

  if (parts.length === 0) {
    return 'Aucun signal détecté';
  }

  return parts.join(' · ');
});
</script>

<template>
  <article class="sym-review-card" :class="`is-${entry.autoStatus}`">
    <header class="sym-review-card__head">
      <div class="sym-review-card__identity">
        <p class="sym-review-card__id">{{ entry.id }}</p>
        <p class="sym-review-card__meta">{{ entry.pointCount }} points · score {{ entry.score }}/100</p>
      </div>
      <span class="sym-review-card__status" :class="`is-${entry.autoStatus}`">{{ cardStatusLabel }}</span>
    </header>

    <div class="axis-toggle" role="group" aria-label="Choix de l’axe d’aperçu">
      <button
        class="axis-toggle__btn"
        :class="{ 'is-active': previewAxis === 'vertical' }"
        :aria-pressed="previewAxis === 'vertical' ? 'true' : 'false'"
        type="button"
        title="Aperçu vertical"
        @click="previewAxis = 'vertical'"
      >
        Vertical
      </button>
      <button
        class="axis-toggle__btn"
        :class="{ 'is-active': previewAxis === 'horizontal' }"
        :aria-pressed="previewAxis === 'horizontal' ? 'true' : 'false'"
        type="button"
        title="Aperçu horizontal"
        @click="previewAxis = 'horizontal'"
      >
        Horizontal
      </button>
    </div>

    <div class="sym-review-card__preview-frame">
      <SymmetryShapePreview
        :points="entry.points"
        :grid-size="gridSize"
        :axis="previewAxis"
        :axis-overflow="6"
        :size="120"
        :padding="12"
        :point-radius="3.2"
        :stroke-width="2.4"
        :filled="true"
        :transform-for-axis="true"
        class="sym-review-card__preview"
      />
    </div>

    <div class="sym-review-card__summary">
      <p class="sym-review-card__summary-main">{{ reviewSummary }}</p>
      <p v-if="noteLabels.length" class="sym-review-card__summary-note">{{ noteLabels[0] }}</p>
    </div>

    <div class="sym-review-card__issues-stack">
      <div v-if="hardFailureLabels.length" class="sym-review-card__issues is-hard">
        <p class="sym-review-card__issues-title">Blocages</p>
        <ul>
          <li v-for="failure in hardFailureLabels" :key="failure">{{ failure }}</li>
        </ul>
      </div>

      <div v-if="truncatedWarnings.length" class="sym-review-card__issues is-warning">
        <p class="sym-review-card__issues-title">Points d'attention</p>
        <ul>
          <li v-for="warning in truncatedWarnings" :key="warning">{{ warning }}</li>
          <li v-if="hiddenWarningsCount > 0">+ {{ hiddenWarningsCount }} autre(s)</li>
        </ul>
      </div>
    </div>
  </article>
</template>

<style scoped>
.axis-toggle {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  height: 40px;
  gap: 4px;
  padding: 4px;
  border: 1px solid #cfdae6;
  border-radius: 10px;
  background: linear-gradient(180deg, #f7fafc 0%, #eef4fa 100%);
}

.axis-toggle__btn {
  min-width: 0;
  height: 100%;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #35516e;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.axis-toggle__btn:hover,
.axis-toggle__btn:focus-visible {
  background: #e8f1fb;
  border-color: #a8c4dd;
  color: #123b5f;
  outline: none;
}

.axis-toggle__btn.is-active {
  background: #dcecff;
  border-color: #67a5d6;
  color: #123b5f;
  box-shadow: inset 0 0 0 1px rgba(18, 59, 95, 0.12);
}
</style>
