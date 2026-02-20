# Monétisation par publicité - Guide de décision (FR)

Date de référence: 20 février 2026.

## Résumé exécutif

Recommandation principale: **mettre la publicité en priorité 0.6.0**, pas en 0.5.0.

Pourquoi:
- Le site vise majoritairement des mineurs, donc le niveau d'exigence juridique et éthique est élevé.
- La pub implique généralement cookies/traceurs, CMP, consentement, preuves de consentement, retrait, et mises à jour légales.
- Le risque de dégrader l'expérience enfant (distraction) est réel si c'est fait trop tôt.
- Le gain financier est souvent faible au début si le trafic n'est pas encore solide.

## Décision 0.5.0 vs 0.6.0

### Option A - Mettre la pub en 0.5.0
Avantages:
- Commencer plus tôt les tests de revenus.

Inconvénients:
- Complexité légale forte immédiatement.
- Risque de non-conformité cookies/consentement si implémentation précipitée.
- Risque UX pour un produit éducatif destiné aux mineurs.

Verdict: possible mais risqué pour une 0.5.0 déjà chargée.

### Option B - Préparer en 0.5.0, activer en 0.6.0 (recommandé)
En 0.5.0:
- Finaliser le produit (Math + Symétrie + UX + qualité).
- Poser la base conformité (textes, politique traceurs, gouvernance).
- Préparer un plan de pub "low-risk".

En 0.6.0:
- Lancer un pilote pub limité, mesuré, réversible.

Verdict: meilleur ratio risque/valeur.

## Implications légales et RGPD (France, mineurs)

## 1) Cookies et traceurs
Pour la pub en ligne, des traceurs sont souvent utilisés.
Conséquences:
- Consentement préalable requis pour traceurs non essentiels.
- Le refus doit être aussi simple que l'acceptation.
- Le retrait du consentement doit être facile et permanent.
- Il faut conserver une preuve du consentement.

## 2) Mineurs et consentement en France
- À partir de 15 ans: un mineur peut consentir seul pour un service en ligne fondé sur le consentement.
- Moins de 15 ans: consentement conjoint mineur + titulaire de l'autorité parentale.

Implication pratique:
- Si ton modèle pub repose sur le consentement, il faut traiter ce point sérieusement dès la conception.

## 3) Publicité ciblée / profilage
- La publicité ciblée repose sur des profils individuels.
- Pour un public mineur, la prudence maximale est recommandée.
- En tendance réglementaire UE, la protection des mineurs contre la pub profilée est renforcée.

## 4) Contrats et responsabilités
- Vérifier les politiques du partenaire pub (Google ou autre).
- Documenter les rôles RGPD (responsable/sous-traitant selon cas).
- Mettre à jour la politique de confidentialité et les mentions.

## Position produit recommandée pour ManabuPlay

Pour un site éducatif mineurs-first:
- **Pas de pub personnalisée** au lancement.
- Prioriser **contexte/non-personnalisé** si partenaire compatible.
- Limiter le nombre d'emplacements publicitaires.
- Bannir formats intrusifs (interstitiels agressifs, auto-play sonore, etc.).

## Plan proposé

## Plan 0.5.0 (préparation sans activation pub)
- [ ] Définir une politique interne "mineurs d'abord".
- [ ] Écrire une section "traceurs/publicité" claire dans la politique de confidentialité.
- [ ] Définir un mode de consentement cible (CMP et UX de refus).
- [ ] Préparer un "kill switch" pour couper la pub en un clic (feature flag).
- [ ] Définir KPI de décision (trafic minimal, taux de rebond, stabilité produit).

## Plan 0.6.0 (pilote monétisation)
- [ ] Pilote sur 1 seul emplacement publicitaire non intrusif.
- [ ] Mesure hebdomadaire: revenus, rebond, temps/session, retours parent/enfant.
- [ ] Revue conformité post-lancement (cookies, consentement, docs).
- [ ] Décision go/no-go après 2 à 4 semaines.

## Checklist conformité minimale avant activation pub

- [ ] Bandeau/CMP conforme (accepter/refuser au même niveau).
- [ ] Aucun traceur pub activé avant consentement valide.
- [ ] Retrait du consentement accessible facilement.
- [ ] Politique de confidentialité et mentions légales à jour.
- [ ] Registre interne des partenaires et finalités.
- [ ] Vérification spécifique du traitement des mineurs.
- [ ] Tests complets desktop/mobile + navigateurs principaux.

## Réalisme business (ordre de grandeur)

La pub devient généralement intéressante avec un trafic déjà régulier.
Formule simple:

Revenu mensuel approximatif = (pages vues / 1000) x RPM.

Sans trafic significatif, la priorité doit rester: qualité produit, rétention, recommandation bouche-à-oreille.

## Alternatives de monétisation à faible risque (en parallèle)

- Soutien volontaire (don / "buy me a coffee").
- Version "parent" sans pub avec mini-abonnement futur.
- Partenariats locaux (tuteurs, associations, soutien scolaire) sans tracking.

## Questions de décision (à trancher avant 0.6.0)

1. Acceptes-tu d'exclure totalement la pub personnalisée pour les mineurs?
2. Souhaites-tu un mode "sans pub" garanti pour les enfants connectés via un lien parent?
3. Quel seuil de trafic mensuel déclenche le pilote pub (ex: 20k ou 50k pages vues/mois)?
4. Quel niveau de baisse UX est acceptable (ex: rebond +3% max)?

## Sources officielles (référence)

- CNIL - Cookies et traceurs: que dit la loi?
  https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi

- CNIL - Lignes directrices et recommandation cookies (29 septembre 2020)
  https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/lignes-directrices-modificatives-et-recommandation

- CNIL - La loi Informatique et Libertés (article 45, mineurs 15 ans)
  https://www.cnil.fr/fr/le-cadre-national/la-loi-informatique-et-libertes

- CNIL - Recommandation 4 (consentement parental pour moins de 15 ans)
  https://www.cnil.fr/fr/recommandation-4-rechercher-le-consentement-dun-parent-pour-les-mineurs-de-moins-de-15-ans

- CNIL - Définition publicité ciblée
  https://www.cnil.fr/fr/definition/publicite-ciblee

- Commission européenne - DSA et protection des mineurs (profiling ads)
  https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/rights-child/digital-and-information-society_en

- Google - EU User Consent Policy
  https://www.google.com/about/company/user-consent-policy.html

- Google - EU User Consent Policy Help
  https://www.google.com/about/company/user-consent-policy-help/

## Note

Ce document est un guide opérationnel, pas un avis juridique.
Pour un lancement publicitaire à destination d'un public mineur, une validation par un juriste RGPD est fortement recommandée.
