<script setup>
</script>

<template>
  <section class="page-block help-page">
    <h1>Documentation du panel interne</h1>

    <p class="back-link top-back-link">
      <router-link :to="{ name: 'studio-ops-panel' }">Retour au panneau d'administration</router-link>
    </p>

    <p class="updated">Version: 0.5.0-prep (lite, Netlify 100% front)</p>

    <p>
      Cette page explique le fonctionnement du panel interne pour l'édition locale des listes de vocabulaire.
      Version anglaise: <router-link to="/help/internal-panel">Internal panel documentation</router-link>.
    </p>

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
      <li>Se connecter au panel interne.</li>
      <li>Choisir la liste à modifier.</li>
      <li>Éditer les mots (anglais/français) puis sauvegarder localement.</li>
      <li>Vérifier le rendu dans le module Langues.</li>
      <li>Exporter le JSON et commit/push dans le repo.</li>
    </ol>

    <h2 id="json-ops">Opérations JSON</h2>
    <ul>
      <li><strong>Copier JSON</strong>: utile pour audit rapide ou partage ponctuel.</li>
      <li><strong>Télécharger JSON</strong>: génère un fichier prêt à versionner.</li>
      <li><strong>Importer JSON</strong>: recharge une liste existante dans le panel.</li>
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

    <h2 id="glossary">Glossaire</h2>
    <dl>
      <dt id="glossary-localstorage">localStorage</dt>
      <dd>Stockage persistant dans le navigateur, propre à un domaine.</dd>

      <dt id="glossary-hash">Hash (SHA-256)</dt>
      <dd>Empreinte irréversible utilisée pour vérifier un mot de passe sans le stocker en clair.</dd>

      <dt id="glossary-timeout">Timeout de session</dt>
      <dd>Durée limite d'une session connectée avant déconnexion automatique.</dd>

      <dt id="glossary-front-only">Front-only security</dt>
      <dd>Protection implémentée uniquement côté navigateur, sans contrôle serveur.</dd>

      <dt id="glossary-json">JSON</dt>
      <dd>Format texte structuré pour stocker et échanger des données.</dd>
    </dl>
  </section>
</template>

<style scoped>
.help-page {
  max-width: 920px;
  margin-inline: auto;
}

.updated {
  color: #4b5f79;
  font-weight: 600;
}

.back-link {
  margin: 10px 0 14px;
}

.top-back-link {
  margin-top: 4px;
  margin-bottom: 12px;
}

.back-link a {
  text-decoration: underline;
  font-weight: 700;
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

