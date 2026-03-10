<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useConsentStore } from '@/features/consent/useConsentStore';
import { CONSENT_CATEGORIES, CONSENT_VERSION } from '@/features/consent/consentConfig';

const consentStore = useConsentStore();
const { panelOpen, selections, nonEssentialAllowed, summary } = storeToRefs(consentStore);

function onToggle(categoryId, event) {
  consentStore.setCategory(categoryId, event.target.checked);
}

const formattedUpdatedAt = computed(() => {
  if (!summary.value.updatedAt) {
    return 'jamais définie';
  }
  try {
    return new Date(summary.value.updatedAt).toLocaleDateString('fr-FR');
  } catch {
    return summary.value.updatedAt;
  }
});
</script>

<template>
  <teleport to="body">
    <div v-if="panelOpen" class="consent-panel__backdrop" role="presentation">
      <section class="consent-panel" role="dialog" aria-modal="true" aria-labelledby="consent-panel-title">
        <header class="consent-panel__header">
          <div>
            <h2 id="consent-panel-title">Préférences cookies</h2>
            <p>Version {{ CONSENT_VERSION }} • Dernière mise à jour {{ formattedUpdatedAt }}</p>
          </div>
          <button class="mp-btn mp-btn-ghost" type="button" @click="consentStore.closePanel">Fermer</button>
        </header>

        <div class="consent-panel__content">
          <article v-for="category in CONSENT_CATEGORIES" :key="category.id" class="consent-panel__card">
            <div class="consent-panel__card-header">
              <div>
                <p class="consent-panel__card-title">{{ category.label }}</p>
                <p class="consent-panel__card-description">{{ category.description }}</p>
              </div>
              <label class="switch-field">
                <input
                  :id="`consent-${category.id}`"
                  type="checkbox"
                  :checked="selections[category.id]"
                  :disabled="category.locked"
                  @change="onToggle(category.id, $event)"
                />
                <span aria-hidden="true"></span>
              </label>
            </div>
          </article>
        </div>

        <footer class="consent-panel__footer">
          <p v-if="nonEssentialAllowed">Les cookies non essentiels seront chargés.</p>
          <p v-else>Aucun cookie non essentiel ne sera activé.</p>
          <div class="consent-panel__footer-actions">
            <button class="mp-btn mp-btn-ghost" type="button" @click="consentStore.rejectAll">Tout refuser</button>
            <button class="mp-btn mp-btn-secondary" type="button" @click="consentStore.acceptAll">Tout accepter</button>
            <button class="mp-btn mp-btn-primary" type="button" @click="consentStore.saveCustom">Enregistrer</button>
          </div>
        </footer>
      </section>
    </div>
  </teleport>
</template>
