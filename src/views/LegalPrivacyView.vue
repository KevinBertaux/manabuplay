<template>
  <section class="page-block legal">
    <h1>Politique de confidentialité</h1>
    <p class="updated">Dernière mise à jour : 15 février 2026</p>

    <h2>1. Responsable du traitement</h2>
    <p>
      Le site <strong>ManabuPlay</strong> est exploité par un éditeur non professionnel.
      Contact vie privée :
      <a href="mailto:kevinbertaux+manabuplay@gmail.com">kevinbertaux+manabuplay@gmail.com</a>
    </p>

    <h2>2. Données traitées</h2>
    <p>
      À ce jour, le site ne propose pas de création de compte, newsletter ni formulaire de collecte.
      Aucune donnée d'identité (nom, prénom, email de l'utilisateur) n'est demandée dans les parcours standards.
    </p>

    <h3>2.1 Données stockées localement sur votre appareil</h3>
    <ul>
      <li>Préférences d'accent de prononciation (module langues)</li>
      <li>Listes de vocabulaire modifiees localement via l'espace interne (localStorage)</li>
      <li>Etat de session d'acces a l'espace interne dans l'onglet en cours (sessionStorage)</li>
    </ul>
    <p>
      Ces données restent dans votre navigateur et ne sont pas transmises automatiquement à l'éditeur.
    </p>

    <h3>2.2 Données techniques d'hébergement</h3>
    <p>
      Lors de l'accès au site, l'hébergeur peut traiter des journaux techniques
      (ex. adresse IP, date/heure, requêtes, sécurité) nécessaires au fonctionnement et à la protection du service.
    </p>

    <h2>3. Finalités et bases légales</h2>
    <ul>
      <li>Fourniture du service (fonctionnement du site et de ses modules)</li>
      <li>Sécurisation technique de la plateforme</li>
      <li>Conservation locale des préférences utilisateur</li>
    </ul>
    <p>
      Bases légales principales : intérêt légitime (article 6, 1, f RGPD)
      et, selon les cas, obligations légales de sécurité et de traçabilité de l'hébergeur.
    </p>

    <h2>4. Cookies et traceurs</h2>
    <p>
      Le site n'utilise pas, à ce jour, de cookies non essentiels de mesure d'audience,
      de publicité ou de traçage marketing.
    </p>

    <h2>5. Destinataires des données</h2>
    <p>
      Les données techniques d'hébergement sont traitées par l'hébergeur Netlify, Inc.
      Les données stockées localement (localStorage/sessionStorage) sont accessibles depuis votre navigateur.
    </p>

    <h2>6. Durées de conservation</h2>
    <ul>
      <li>Données locales (localStorage) : jusqu'à suppression par l'utilisateur ou réinitialisation</li>
      <li>Session espace interne (sessionStorage) : supprimee a la fermeture de l'onglet/navigateur</li>
      <li>Journaux techniques d'hébergement : selon la politique de l'hébergeur</li>
    </ul>

    <h2>7. Transferts hors Union européenne</h2>
    <p>
      L'hébergeur étant une société américaine, des traitements peuvent impliquer des transferts hors UE.
      Ces traitements relèvent des mécanismes de conformité et engagements contractuels de l'hébergeur.
    </p>

    <h2>8. Vos droits</h2>
    <p>
      Conformément au RGPD et à la loi Informatique et Libertés, vous disposez notamment des droits
      d'accès, de rectification, d'effacement, de limitation, d'opposition et, selon les cas, de portabilité.
    </p>
    <p>
      Pour exercer vos droits :
      <a href="mailto:kevinbertaux+manabuplay@gmail.com">kevinbertaux+manabuplay@gmail.com</a>
    </p>
    <p>
      Vous pouvez également introduire une réclamation auprès de la CNIL :
      <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">cnil.fr</a>
    </p>

    <h2>9. Mineurs</h2>
    <p>
      Le site est conçu pour un usage éducatif, y compris par des mineurs.
      Aucune collecte directe de données personnelles d'élèves n'est recherchée dans les parcours standards.
    </p>
    <p>
      En cas de futur traitement reposant sur le consentement,
      pour les mineurs de moins de 15 ans en France,
      le consentement conjoint du mineur et du titulaire de l'autorité parentale sera requis.
    </p>

    <h2>10. Évolution de la politique</h2>
    <p>
      Cette politique peut être mise à jour pour refléter les évolutions du site, de la loi
      ou des recommandations des autorités compétentes.
    </p>
  </section>
</template>

<style scoped>
.legal {
  max-width: 900px;
  margin-inline: auto;
}

.updated {
  color: #4b5f79;
  font-weight: 600;
  margin-top: -4px;
}

h2 {
  margin-top: 18px;
  margin-bottom: 8px;
}

h3 {
  margin-top: 14px;
  margin-bottom: 6px;
}

p,
li {
  line-height: 1.55;
}

ul {
  margin-top: 0;
  padding-left: 20px;
}

a {
  text-decoration: underline;
}
</style>

