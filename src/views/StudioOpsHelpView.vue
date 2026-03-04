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
      <h1>Documentation du panneau interne</h1>
      <p class="updated">Version: 0.5.0-prep (lite, Netlify 100% front)</p>
      <p>Cette page explique le fonctionnement du panneau interne pour l'édition locale des listes de vocabulaire.</p>

      <h2 id="scope">Périmètre</h2>
      <ul>
        <li>Édition locale dans le navigateur (stockage <a href="#glossary-localstorage">localStorage</a>).</li>
        <li>Aucun backend requis pour cette version.</li>
        <li>Export JSON pour versionner les données dans le repo Git.</li>
      </ul>

      <h2 id="security">Accès et sécurité</h2>
      <ul>
        <li>Connexion par identifiant + mot de passe (vérification par hash côté client).</li>
        <li>Blocage niveau 1: 3 essais invalides puis 30 minutes.</li>
        <li>Blocage niveau 2: un nouvel essai invalide après niveau 1 déclenche 24 heures de blocage.</li>
        <li>Session temporaire: expiration automatique par timeout.</li>
      </ul>

      <h2 id="workflow">Workflow recommandé</h2>
      <ol>
        <li>Se connecter au panneau interne.</li>
        <li>Choisir la liste à modifier.</li>
        <li>Éditer les mots (anglais/français) puis sauvegarder localement.</li>
        <li>Vérifier le rendu dans le module Langues.</li>
        <li>Exporter le JSON et commit/push dans le repo.</li>
      </ol>

      <h2 id="json-ops">Opérations JSON</h2>
      <ul>
        <li><strong>Copier JSON</strong>: utile pour audit rapide ou partage ponctuel.</li>
        <li><strong>Télécharger JSON</strong>: génère un fichier prêt à versionner.</li>
        <li><strong>Importer JSON</strong>: recharge une liste existante dans le panneau.</li>
        <li><strong>Réinitialiser</strong>: revient à la version par défaut du projet.</li>
      </ul>

      <h2 id="limits">Limites connues</h2>
      <ul>
        <li>Protection front-only: ce n'est pas une sécurité serveur forte.</li>
        <li>Les données locales sont liées à l'appareil/navigateur en cours.</li>
        <li>Effacement navigateur peut supprimer les modifications locales.</li>
      </ul>

      <h2 id="troubleshooting">Dépannage</h2>
      <ul>
        <li>Accès bloqué: attendre la fin du compte à rebours affiché.</li>
        <li>Session expirée: se reconnecter.</li>
        <li>Doute sur les données: réinitialiser puis réimporter un JSON de référence.</li>
      </ul>
    </template>

    <template v-else>
      <h1>Internal Panel Documentation</h1>
      <p class="updated">Version: 0.5.0-prep (lite, Netlify front-only)</p>
      <p>This page describes how the internal panel works for local vocabulary list editing.</p>

      <h2 id="scope">Scope</h2>
      <ul>
        <li>Local browser editing (<a href="#glossary-localstorage">localStorage</a>).</li>
        <li>No backend required for this version.</li>
        <li>JSON export for Git versioning.</li>
      </ul>

      <h2 id="security">Access and Security</h2>
      <ul>
        <li>Username + password login (client-side hash verification).</li>
        <li>Level 1 lock: 3 invalid attempts then 30 minutes.</li>
        <li>Level 2 lock: one invalid attempt after level 1 triggers a 24-hour lock.</li>
        <li>Temporary session with timeout auto-expiration.</li>
      </ul>

      <h2 id="workflow">Recommended Workflow</h2>
      <ol>
        <li>Log in to the internal panel.</li>
        <li>Select the list to edit.</li>
        <li>Edit words (English/French) and save locally.</li>
        <li>Verify output in the Languages module.</li>
        <li>Export JSON and commit/push to the repository.</li>
      </ol>

      <h2 id="json-ops">JSON Operations</h2>
      <ul>
        <li><strong>Copy JSON</strong>: quick audit or ad hoc sharing.</li>
        <li><strong>Download JSON</strong>: generates a file ready for versioning.</li>
        <li><strong>Import JSON</strong>: loads an existing list into the panel.</li>
        <li><strong>Reset</strong>: restores project default content.</li>
      </ul>

      <h2 id="limits">Known Limits</h2>
      <ul>
        <li>Front-only protection: not equivalent to server-side security.</li>
        <li>Local data is tied to the current device/browser.</li>
        <li>Browser data cleanup can remove local edits.</li>
      </ul>

      <h2 id="troubleshooting">Troubleshooting</h2>
      <ul>
        <li>Access blocked: wait for the countdown to reach zero.</li>
        <li>Session expired: log in again.</li>
        <li>Data mismatch: reset then re-import a reference JSON file.</li>
      </ul>
    </template>

    <h2 id="glossary">Glossary</h2>
    <dl>
      <dt id="glossary-localstorage">localStorage</dt>
      <dd>Persistent browser storage scoped to one domain.</dd>

      <dt id="glossary-hash">Hash (SHA-256)</dt>
      <dd>One-way fingerprint used to verify a password without storing it as plain text.</dd>

      <dt id="glossary-timeout">Session timeout</dt>
      <dd>Maximum connected session duration before automatic logout.</dd>

      <dt id="glossary-front-only">Front-only security</dt>
      <dd>Protection implemented only in browser code, without server enforcement.</dd>

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
