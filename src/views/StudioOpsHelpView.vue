<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const currentLang = computed(() => (route.query.lang === 'en' ? 'en' : 'fr'));
const isFr = computed(() => currentLang.value === 'fr');

function setLang(lang) {
  if (lang === currentLang.value) {
    return;
  }
  router.replace({ name: 'studio-ops-help', query: { lang } });
}
</script>

<template>
  <section class="page-block mx-auto max-w-[920px]">
    <div class="mb-3 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
      <router-link :to="{ name: 'studio-ops-panel' }">Retour au panneau d'administration</router-link>
      <div class="lang-switch" role="group" aria-label="Language switch">
        <button type="button" class="lang-btn" :class="{ active: isFr }" @click="setLang('fr')">FR</button>
        <button type="button" class="lang-btn" :class="{ active: !isFr }" @click="setLang('en')">EN</button>
      </div>
    </div>

    <template v-if="isFr">
      <h1>Manuel du panneau interne</h1>
      <p class="updated">Version : 0.6.0-prep • Révision du manuel : 13 mars 2026</p>
      <p>
        Cette page sert de manuel d'usage. Le pilotage produit reste visible dans le dashboard, via les sections
        roadmap, maintenance et suivi interne.
      </p>

      <h2 id="purpose">Rôle du panneau</h2>
      <ul>
        <li>Éditer localement les listes de vocabulaire.</li>
        <li>Tester rapidement un rendu avant export JSON.</li>
        <li>Gérer quelques opérations de maintenance locale.</li>
      </ul>

      <h2 id="workflow">Workflow conseillé</h2>
      <ol>
        <li>Se connecter au panneau interne.</li>
        <li>Choisir une liste ou une section à modifier.</li>
        <li>Sauvegarder localement, puis vérifier le rendu dans le module élève concerné.</li>
        <li>Exporter en JSON lorsque le contenu est prêt à être versionné.</li>
      </ol>

      <h2 id="json-ops">Opérations JSON</h2>
      <ul>
        <li><strong>Copier JSON</strong> : contrôle rapide ou partage ponctuel.</li>
        <li><strong>Télécharger JSON</strong> : fichier prêt à intégrer au repo.</li>
        <li><strong>Importer JSON</strong> : recharge une liste existante dans le panneau.</li>
        <li><strong>Réinitialiser</strong> : revient au contenu versionné par défaut.</li>
      </ul>

      <h2 id="data-scope">Portée des données</h2>
      <ul>
        <li>Les modifications locales restent liées à l'appareil et au navigateur en cours.</li>
        <li>Le panneau n'utilise pas de backend dans cette version.</li>
        <li>Un nettoyage navigateur peut supprimer les données locales et la session courante.</li>
      </ul>

      <h2 id="security">Position sécurité</h2>
      <ul>
        <li>Le panneau est protégé côté front, avec contrôle d'accès, limitation de tentatives et expiration de session.</li>
        <li>Cette protection n'équivaut pas à une sécurité serveur forte.</li>
        <li>Les réglages sensibles et la documentation publique doivent rester cohérents avec cette limite.</li>
      </ul>

      <h2 id="troubleshooting">Dépannage</h2>
      <ul>
        <li>Accès bloqué : attendre la fin du blocage affiché avant de réessayer.</li>
        <li>Session expirée : se reconnecter.</li>
        <li>Doute sur les données : réinitialiser puis réimporter un JSON de référence.</li>
      </ul>
    </template>

    <template v-else>
      <h1>Internal Panel Manual</h1>
      <p class="updated">Version: 0.6.0-prep • Manual revision: March 13, 2026</p>
      <p>
        This page is an operating manual. Product steering stays inside the dashboard through roadmap, maintenance and
        internal follow-up sections.
      </p>

      <h2 id="purpose">Panel purpose</h2>
      <ul>
        <li>Edit vocabulary lists locally.</li>
        <li>Quickly validate rendering before JSON export.</li>
        <li>Run a few local maintenance actions.</li>
      </ul>

      <h2 id="workflow">Recommended workflow</h2>
      <ol>
        <li>Log in to the internal panel.</li>
        <li>Select the list or section to edit.</li>
        <li>Save locally, then verify the result in the matching student module.</li>
        <li>Export JSON once the content is ready for versioning.</li>
      </ol>

      <h2 id="json-ops">JSON operations</h2>
      <ul>
        <li><strong>Copy JSON</strong>: quick review or ad hoc sharing.</li>
        <li><strong>Download JSON</strong>: file ready to commit.</li>
        <li><strong>Import JSON</strong>: reload an existing list into the panel.</li>
        <li><strong>Reset</strong>: restore the versioned default content.</li>
      </ul>

      <h2 id="data-scope">Data scope</h2>
      <ul>
        <li>Local changes stay tied to the current device and browser.</li>
        <li>No backend is used in this version.</li>
        <li>Browser cleanup may remove both local data and the current session.</li>
      </ul>

      <h2 id="security">Security position</h2>
      <ul>
        <li>The panel is protected client-side, with access control, attempt limiting and session expiration.</li>
        <li>This does not equal strong server-side security.</li>
        <li>Sensitive settings and public-facing documentation must stay aligned with that limit.</li>
      </ul>

      <h2 id="troubleshooting">Troubleshooting</h2>
      <ul>
        <li>Access blocked: wait until the displayed lock expires.</li>
        <li>Session expired: log in again.</li>
        <li>Data mismatch: reset and re-import a reference JSON file.</li>
      </ul>
    </template>

    <h2 id="glossary">Glossary</h2>
    <dl>
      <dt id="glossary-localstorage">localStorage</dt>
      <dd>Persistent browser storage scoped to one domain.</dd>

      <dt id="glossary-hash">Hash (SHA-256)</dt>
      <dd>One-way fingerprint used to verify a password without storing it in plain text.</dd>

      <dt id="glossary-timeout">Session timeout</dt>
      <dd>Maximum connected session duration before automatic logout.</dd>

      <dt id="glossary-front-only">Front-only security</dt>
      <dd>Protection implemented in browser code only, without server enforcement.</dd>

      <dt id="glossary-json">JSON</dt>
      <dd>Text format used to structure and exchange data.</dd>
    </dl>
  </section>
</template>

<style scoped>
.lang-switch {
  display: inline-flex;
  border: 1px solid #b6c8dd;
  border-radius: 8px;
  overflow: hidden;
}

.lang-btn {
  min-height: 34px;
  min-width: 48px;
  border: 0;
  background: #f1f6fd;
  color: #1b324e;
  font-weight: 700;
  cursor: pointer;
}

.lang-btn + .lang-btn {
  border-left: 1px solid #b6c8dd;
}

.lang-btn.active {
  background: #1d5f95;
  color: #ffffff;
}

.updated {
  color: #4b5f79;
  font-weight: 600;
}

h2 {
  margin-top: 18px;
  margin-bottom: 8px;
}

p,
li,
dd {
  line-height: 1.55;
}

ul,
ol {
  padding-left: 22px;
}

dl {
  margin: 0;
}

dt {
  margin-top: 10px;
  font-weight: 700;
}

dd {
  margin-left: 0;
}

a {
  text-decoration: underline;
}
</style>
