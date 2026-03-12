<script setup>
import AdSlotPlaceholder from "@/components/AdSlotPlaceholder.vue";
</script>

<template>
  <div class="study-ads-shell">
    <div class="study-ads-shell__top">
      <AdSlotPlaceholder
        slot-id="study-top-banner"
        hint="Zone réservée visible seulement en local ou en test avant activation."
      />
    </div>

    <div class="study-ads-shell__row">
      <aside class="study-ads-shell__rail study-ads-shell__rail--left" aria-hidden="true">
        <AdSlotPlaceholder
          slot-id="study-rail-left"
          hint="Rail réservé pour un partenaire, sans script actif pour le moment."
        />
      </aside>

      <div class="study-ads-shell__content">
        <slot />
      </div>

      <aside class="study-ads-shell__rail study-ads-shell__rail--right" aria-hidden="true">
        <AdSlotPlaceholder
          slot-id="study-rail-right"
          hint="Rail réservé pour un partenaire, sans script actif pour le moment."
        />
      </aside>
    </div>

    <div class="study-ads-shell__bottom-spacer" aria-hidden="true"></div>

    <div class="study-ads-shell__bottom">
      <AdSlotPlaceholder
        slot-id="study-bottom-banner"
        hint="Bandeau réservé, non actif tant que la monétisation n'est pas branchée."
      />
    </div>
  </div>
</template>

<style scoped>
.study-ads-shell {
  width: min(100%, calc(100% - 16px));
  margin: 16px auto 0;
}

.study-ads-shell__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.study-ads-shell__content {
  min-width: 0;
}

.study-ads-shell__top,
.study-ads-shell__rail,
.study-ads-shell__bottom,
.study-ads-shell__bottom-spacer {
  display: none;
}

@media (min-width: 768px) and (max-width: 1279px) {
  .study-ads-shell {
    width: min(1200px, calc(100% - 32px));
    margin-top: 20px;
  }

  .study-ads-shell__top {
    display: block;
    position: sticky;
    top: 84px;
    z-index: 8;
    margin-bottom: 16px;
  }

  .study-ads-shell__bottom-spacer {
    display: block;
    height: 124px;
  }

  .study-ads-shell__bottom {
    display: flex;
    justify-content: center;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 18;
    padding: 0 16px 16px;
    pointer-events: none;
  }

  .study-ads-shell__bottom > * {
    width: 100%;
    pointer-events: auto;
  }
}

@media (min-width: 1280px) {
  .study-ads-shell {
    width: min(1600px, calc(100% - 32px));
    margin-top: 20px;
  }

  .study-ads-shell__row {
    grid-template-columns: 160px minmax(0, 1fr) 160px;
    gap: 24px;
    align-items: start;
  }

  .study-ads-shell__rail {
    display: block;
    position: sticky;
    top: 92px;
  }
}

@media (max-width: 767px) {
  .study-ads-shell__bottom-spacer {
    display: block;
    height: calc(96px + env(safe-area-inset-bottom));
  }

  .study-ads-shell__bottom {
    display: flex;
    justify-content: center;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 18;
    padding: 0 8px calc(12px + env(safe-area-inset-bottom));
    pointer-events: none;
  }

  .study-ads-shell__bottom > * {
    width: 100%;
    pointer-events: auto;
  }
}
</style>
