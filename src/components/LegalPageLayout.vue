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
  <section class="page-block legal mx-auto max-w-[900px]">
    <h1 class="mb-[10px] text-[clamp(1.9rem,2.8vw,2.35rem)] leading-[1.2]">{{ title }}</h1>
    <p class="updated">Dernière mise à jour : {{ updatedAt }}</p>
    <slot />
  </section>
</template>

<style scoped>
.updated {
  color: #4b5f79;
  font-weight: 600;
  margin-top: -4px;
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
