<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <section class="page-block legal legal-page">
    <h1>{{ title }}</h1>
    <p class="updated">Dernière mise à jour : {{ updatedAt }}</p>
    <slot />
  </section>
</template>

<style scoped>
.legal-page {
  max-width: 900px;
  margin-inline: auto;
}

.updated {
  color: #4b5f79;
  font-weight: 600;
  margin-top: -4px;
}

.legal-page h1 {
  font-size: clamp(1.9rem, 2.8vw, 2.35rem);
  line-height: 1.2;
  margin-bottom: 10px;
}

:slotted(h2) {
  margin-top: 18px;
  margin-bottom: 8px;
}

:slotted(h3) {
  margin-top: 14px;
  margin-bottom: 6px;
}

:slotted(p),
:slotted(li) {
  line-height: 1.55;
}

:slotted(p) {
  margin: 0 0 10px;
}

:slotted(ul) {
  margin-top: 0;
  padding-left: 20px;
}

:slotted(a) {
  text-decoration: underline;
}
</style>
