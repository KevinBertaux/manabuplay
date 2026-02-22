<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const navOpen = ref(false);
const route = useRoute();

watch(
  () => route.fullPath,
  () => {
    navOpen.value = false;
  }
);

function toggleMenu() {
  navOpen.value = !navOpen.value;
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <router-link to="/" class="brand" aria-label="Accueil">
        <img src="/brand-logo.png" alt="ManabuPlay" class="brand-logo" />
      </router-link>

      <button
        class="burger"
        type="button"
        :aria-expanded="navOpen ? 'true' : 'false'"
        aria-controls="main-nav"
        aria-label="Ouvrir le menu"
        @click="toggleMenu"
      >
        ☰
      </button>

      <nav id="main-nav" class="main-nav" :class="{ open: navOpen }">
        <router-link to="/math">Math</router-link>
        <router-link to="/vocab">Langues</router-link>

      </nav>
    </header>

    <main class="page-container">
      <router-view />
    </main>

    <footer class="site-footer">
      <div class="footer-links">
        <router-link to="/legal/mentions-legales">Mentions légales</router-link>
        <router-link to="/legal/cgu">CGU</router-link>
        <router-link to="/legal/confidentialite">Politique de confidentialité</router-link>
      </div>
    </footer>
  </div>
</template>


