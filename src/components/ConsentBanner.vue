<script setup>
import { storeToRefs } from 'pinia';
import { useConsentStore } from '@/features/consent/useConsentStore';

const consentStore = useConsentStore();
const { shouldDisplayBanner } = storeToRefs(consentStore);
</script>

<template>
  <transition name="fade">
    <section
      v-if="shouldDisplayBanner"
      class="consent-banner"
      role="region"
      aria-label="Gestion des cookies"
      aria-live="polite"
    >
      <div class="consent-banner__text">
        <p class="consent-banner__title">Gestion des cookies</p>
        <p class="consent-banner__description">
          Nous utilisons des cookies essentiels pour faire fonctionner ManabuPlay et, sur consentement, des solutions de
          mesure d'audience et de monétisation. Vous pouvez modifier vos choix à tout moment.
        </p>
      </div>
      <div class="consent-banner__actions">
        <button class="mp-btn mp-btn-ghost" type="button" @click="consentStore.rejectAll">Tout refuser</button>
        <button class="mp-btn mp-btn-secondary" type="button" @click="consentStore.openPanel">
          Personnaliser
        </button>
        <button class="mp-btn mp-btn-primary" type="button" @click="consentStore.acceptAll">Tout accepter</button>
      </div>
    </section>
  </transition>
</template>
