<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const navOpen = ref(false);
const openGroup = ref('');
const route = useRoute();

const isMathRoute = computed(() => route.path.startsWith('/math'));
const isLangRoute = computed(() => route.path.startsWith('/vocab'));
const isAdminPanelRoute = computed(() => route.path.startsWith('/-/studio-ops/panel'));

watch(
  () => route.fullPath,
  () => {
    navOpen.value = false;
    openGroup.value = '';
  }
);

function toggleMenu() {
  navOpen.value = !navOpen.value;
  if (!navOpen.value) {
    openGroup.value = '';
  }
}

function toggleGroup(groupName) {
  openGroup.value = openGroup.value === groupName ? '' : groupName;
}

function closeNav() {
  navOpen.value = false;
  openGroup.value = '';
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <router-link to="/" class="brand" aria-label="Accueil" @click="closeNav">
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
        <div class="nav-group" :class="{ open: openGroup === 'math' }">
          <button
            class="nav-trigger"
            type="button"
            :class="{ active: isMathRoute }"
            :aria-expanded="openGroup === 'math' ? 'true' : 'false'"
            @click="toggleGroup('math')"
          >
            Math
          </button>
          <div class="submenu">
            <router-link class="submenu-link" to="/math" @click="closeNav">Multiplications</router-link>
            <router-link class="submenu-link" to="/math/symetrie" @click="closeNav">Symétrie</router-link>
          </div>
        </div>

        <div class="nav-group" :class="{ open: openGroup === 'lang' }">
          <button
            class="nav-trigger"
            type="button"
            :class="{ active: isLangRoute }"
            :aria-expanded="openGroup === 'lang' ? 'true' : 'false'"
            @click="toggleGroup('lang')"
          >
            Langues
          </button>
          <div class="submenu">
            <router-link class="submenu-link" to="/vocab" @click="closeNav">Anglais</router-link>
          </div>
        </div>
      </nav>
    </header>

    <main class="page-container" :class="{ 'admin-shell-container': isAdminPanelRoute }">
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
