<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ROUTE_NAMES } from "@/router/routes";
import ConsentBanner from "@/components/ConsentBanner.vue";
import ConsentPreferencesPanel from "@/components/ConsentPreferencesPanel.vue";
import StudyAdsShell from "@/components/StudyAdsShell.vue";
import { initAdsRuntime, syncAdsConsent } from "@/features/ads/adsRuntime";
import { useConsentStore } from "@/features/consent/useConsentStore";

const navOpen = ref(false);
const openGroup = ref("");
const route = useRoute();
const consentStore = useConsentStore();

const isMathRoute = computed(() => route.path.startsWith("/math"));
const isLangRoute = computed(() => route.path.startsWith("/languages"));
const isLegalRoute = computed(() => route.path.startsWith("/legal"));
const isAdminPanelRoute = computed(() => route.path.startsWith("/-/studio-ops/panel"));
const isStudioOpsRoute = computed(() => route.path.startsWith("/-/studio-ops"));
const showConsentUi = computed(() => !isStudioOpsRoute.value);
const showStudyAds = computed(
  () => route.path === "/" || route.path.startsWith("/math") || route.path.startsWith("/languages")
);
const shouldEnableStudyAdsRuntime = computed(() => showConsentUi.value && showStudyAds.value);

watch(
  () => route.fullPath,
  () => {
    navOpen.value = false;
    openGroup.value = "";
  }
);

watch(
  () => showConsentUi.value,
  (showConsent) => {
    if (showConsent) {
      consentStore.init();
    }
  },
  { immediate: true }
);

watch(
  () => shouldEnableStudyAdsRuntime.value,
  (enabled) => {
    if (enabled) {
      initAdsRuntime();
      syncAdsConsent(consentStore.selections);
    }
  },
  { immediate: true }
);

watch(
  () => consentStore.selections,
  (selections) => {
    if (shouldEnableStudyAdsRuntime.value) {
      syncAdsConsent(selections);
    }
  },
  { deep: true }
);

function toggleMenu() {
  navOpen.value = !navOpen.value;
  if (!navOpen.value) {
    openGroup.value = "";
  }
}

function toggleGroup(groupName) {
  openGroup.value = openGroup.value === groupName ? "" : groupName;
}

function closeNav() {
  navOpen.value = false;
  openGroup.value = "";
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <router-link :to="{ name: ROUTE_NAMES.HOME }" class="brand" aria-label="Accueil" @click="closeNav">
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
            <router-link class="submenu-link" :to="{ name: ROUTE_NAMES.MATH_HUB }" @click="closeNav">
              Mathématiques
            </router-link>
            <router-link class="submenu-link" :to="{ name: ROUTE_NAMES.MATH_MULTIPLICATIONS }" @click="closeNav">
              Multiplications
            </router-link>
            <router-link class="submenu-link" :to="{ name: ROUTE_NAMES.MATH_SYMMETRY }" @click="closeNav">
              Symétrie
            </router-link>
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
            <router-link class="submenu-link" :to="{ name: ROUTE_NAMES.LANGUAGES_HUB }" @click="closeNav">
              Langues
            </router-link>
            <router-link class="submenu-link" :to="{ name: ROUTE_NAMES.LANGUAGES_ENGLISH }" @click="closeNav">
              Anglais
            </router-link>
          </div>
        </div>

        <div class="nav-group nav-group--legal" :class="{ open: openGroup === 'info' }">
          <button
            class="nav-trigger"
            type="button"
            :class="{ active: isLegalRoute }"
            :aria-expanded="openGroup === 'info' ? 'true' : 'false'"
            @click="toggleGroup('info')"
          >
            Informations
          </button>
          <div class="submenu">
            <router-link class="submenu-link" :to="{ name: ROUTE_NAMES.LEGAL_NOTICE }" @click="closeNav">
              Mentions légales
            </router-link>
            <router-link class="submenu-link" :to="{ name: ROUTE_NAMES.LEGAL_TERMS }" @click="closeNav">
              CGU
            </router-link>
            <router-link class="submenu-link" :to="{ name: ROUTE_NAMES.LEGAL_PRIVACY }" @click="closeNav">
              Politique de confidentialité
            </router-link>
            <router-link class="submenu-link" :to="{ name: ROUTE_NAMES.LEGAL_COOKIES }" @click="closeNav">
              Cookies
            </router-link>
          </div>
        </div>
      </nav>
    </header>

    <StudyAdsShell v-if="showStudyAds">
      <main class="page-container">
        <router-view />
      </main>
    </StudyAdsShell>
    <main v-else class="page-container" :class="{ 'admin-shell-container': isAdminPanelRoute }">
      <router-view />
    </main>

    <ConsentBanner v-if="showConsentUi" />
    <ConsentPreferencesPanel v-if="showConsentUi" />

    <footer class="site-footer" :class="{ 'site-footer--study-ads': showStudyAds }">
      <div class="footer-links">
        <router-link :to="{ name: ROUTE_NAMES.LEGAL_NOTICE }">Mentions légales</router-link>
        <router-link :to="{ name: ROUTE_NAMES.LEGAL_TERMS }">CGU</router-link>
        <router-link :to="{ name: ROUTE_NAMES.LEGAL_PRIVACY }">Politique de confidentialité</router-link>
        <router-link :to="{ name: ROUTE_NAMES.LEGAL_COOKIES }">Cookies</router-link>
      </div>
    </footer>
  </div>
</template>
