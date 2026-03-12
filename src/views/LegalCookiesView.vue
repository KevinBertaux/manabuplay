<script setup>
import { ref } from 'vue';
import LegalPageLayout from '@/components/LegalPageLayout.vue';
import { isCmpManagedConsentEnabled } from '@/features/cmp/cmpConfig';
import { CMP_PRIVACY_OPTIONS_RESULT, openCmpPrivacyOptions } from '@/features/cmp/cmpRuntime';
import { useConsentStore } from '@/features/consent/useConsentStore';

const consentStore = useConsentStore();
const cmpManagedConsentEnabled = isCmpManagedConsentEnabled();
const consentManagerNotice = ref('');

function isLocalHost() {
  if (typeof window === 'undefined') {
    return false;
  }

  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

function openConsentManager() {
  consentManagerNotice.value = '';

  if (cmpManagedConsentEnabled) {
    const result = openCmpPrivacyOptions();

    if (result === CMP_PRIVACY_OPTIONS_RESULT.OPENED) {
      return;
    }

    consentManagerNotice.value =
      result === CMP_PRIVACY_OPTIONS_RESULT.QUEUED && isLocalHost()
        ? 'Indisponible en local. Tester sur le site public.'
        : 'Gestionnaire Google indisponible. Réessaie dans quelques secondes.';
    return;
  }

  if (openCmpPrivacyOptions() === CMP_PRIVACY_OPTIONS_RESULT.UNAVAILABLE) {
    consentStore.openPanel();
  }
}
</script>

<template>
  <LegalPageLayout title="Politique cookies" updated-at="5 mars 2026">
    <h2>1. Objet</h2>
    <p>
      Cette page explique l'usage des cookies et technologies similaires sur <strong>ManabuPlay</strong>, ainsi que
      vos choix.
    </p>

    <h2>2. Cookies strictement nécessaires</h2>
    <p>
      Le site peut utiliser des stockages techniques nécessaires au fonctionnement, par exemple des préférences locales
      dans le navigateur pour les modules d'apprentissage et l'accès au panneau interne.
    </p>
    <p>
      Ces éléments techniques sont utilisés pour fournir le service demandé et ne sont pas activés à des fins
      publicitaires.
    </p>

    <h2>3. Cookies non essentiels (mesure d'audience, publicité)</h2>
    <p>
      À ce jour, aucun script publicitaire n'est chargé avant consentement. En cas d'activation future de modules de
      publicité ou de mesure d'audience non exemptée, un bandeau de consentement sera affiché au préalable.
    </p>
    <p>Sans consentement, ces traceurs non essentiels resteront désactivés.</p>

    <h2 id="manage-cookies">4. Gérer mes cookies</h2>
    <p>Le lien "Cookies" du pied de page redirige vers cette page. Utilisez ce bouton pour ouvrir directement le panneau.</p>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <button type="button" class="mp-btn mp-btn-secondary w-fit" @click="openConsentManager">Gérer mes cookies</button>
      <p v-if="consentManagerNotice" class="text-sm font-semibold text-slate-600">
        {{ consentManagerNotice }}
      </p>
    </div>

    <h2>5. Durée de conservation des choix</h2>
    <p>
      Lors de l'activation du module de consentement, les choix cookies seront conservés pour une durée limitée, puis
      redemandés selon les exigences applicables.
    </p>

    <h2>6. Contact</h2>
    <p>Pour toute question sur les cookies et traceurs : kevinbertaux+manabuplay [at] gmail [dot] com</p>
  </LegalPageLayout>
</template>
