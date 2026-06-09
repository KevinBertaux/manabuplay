# DEVLOG — ManabuPlay

Ce fichier sert de journal de bord.

Il doit rester :

- concret
- précis
- centré sur l'état du projet

La doctrine produit, contenu et data vit désormais dans :

- [MANABUPLAY_ATLAS.md](./MANABUPLAY_ATLAS.md)

---

## Snapshot

### Produit

- MVP Astro en place.
- Site quiz multilingue FR / EN en place.
- Admin Astro en place pour :
  - lecteur de packs
  - charte
  - références design
  - mockups
  - catalogue futur

### Cible v0.1

- `5 packs`
- `30 mots par pack`
- soit `150 mots`

### État contenu v0.1

- `JRPG essentiels` : relu, stabilisé, `94/100`, `preprod`
- `Combat & Boss` : relu, stabilisé, `93/100`, `preprod`
- `Classes, armes & équipement` : relu, harmonisé, `93/100`, `preprod`
- `Codes d'anime` : relu, noté, `92/100`, `preprod`
- `Japon pop : ville & quotidien` : rédigé, harmonisé avant lecture, `82/100`, `dev`

### Catalogue futur

- catalogue roadmap séparé dans `future-packs.json`
- mots legacy mis de côté + distracteurs promus
- extraction faite à partir des packs 1, 2 et 3

---

## Fait

### Socle app

- [x] MVP porté sur Astro
- [x] Tailwind CSS v4 en place
- [x] HTML / CSS / JS séparés
- [x] rendu Astro aligné sur le MVP legacy
- [x] polices locales branchées
- [x] localStorage pour les meilleurs scores
- [x] bascule FR / EN en place
- [x] Reveal Hint + feedback visuel + particules

### Admin

- [x] routes admin Astro pour la charte, le lecteur, les mockups, les références design et le catalogue
- [x] lecteur de pack avec vue continue des cartes
- [x] réponses, hints, définition et explication visibles
- [x] état “avant réponse” / “corrigé”
- [x] navigation admin commune
- [x] switch FR / EN branché sur le lecteur admin
- [x] mockups admin pour cartes réponses et breakdown des tiers

### Modèle pack-first actuel

- [x] `gloss` + `definition` + `explanation`
- [x] `hint1` + `hint2`
- [x] `difficultyTier` sur `4` niveaux
- [x] score `readiness` avec breakdown
- [x] seuil minimum prod fixé à `90/100`
- [x] répartition cible pack `30 mots` : `10 / 8 / 7 / 5`
- [x] workflow pack retenu :
      `écriture`
      `harmonisation`
      `score provisoire`
      `relecture`
      `stabilisation`
      `score final`
      `extraction catalogue`

### Packs v0.1

- [x] pack 1 rédigé, relu, harmonisé, noté
- [x] pack 2 rédigé, relu, noté
- [x] pack 3 rédigé, harmonisé, relu, noté
- [x] pack 4 rédigé
- [x] pack 5 rédigé
- [x] packs 4 et 5 passés en harmonisation pré-lecture

### Roadmap / catalogue

- [x] fichier `future-packs.json` restructuré en vrai catalogue candidat
- [x] promotion de distracteurs solides issus du pack 1
- [x] promotion de distracteurs solides issus des packs 2 et 3
- [x] roadmap packs recalculée depuis les `candidatePackIds`

---

## À finir avant une vraie `0.1`

### Contenu

- [ ] relire `Codes d'anime`
- [ ] noter `Codes d'anime`
- [ ] relire `Japon pop : ville & quotidien`
- [ ] noter `Japon pop : ville & quotidien`

### Quiz public

- [ ] brancher visiblement les `2` hints dans l'interface publique
- [ ] ajouter un score dépendant des hints
- [ ] ajouter le TTS au clic
- [ ] vérifier les largeurs et retours à la ligne dans le vrai quiz public

### Produit / UX

- [ ] refaire une grosse passe de wording sur la landing page
- [ ] revoir le placement de certains éléments de la landing page
- [ ] cadrer le mode `Libre`
- [ ] décider si le `Quotidien` doit remonter en `v0.1` ou rester après
- [ ] garantir une vraie qualité mobile first
- [ ] découper la home en sections / composants propres
- [ ] corriger les bugs restants du MVP

### Déploiement / mesure

- [ ] intégrer les métriques produit et marketing essentielles
- [ ] choisir la langue locale par défaut si elle est disponible
- [ ] stabiliser le formulaire waitlist pour le déploiement cible
- [ ] faire une vraie passe QA + tests + Playwright avant la prod
- [ ] préparer la branche de prod et la sortie `v0.1.0`

---

## Après `v0.1`

### À traiter après la sortie, pas avant

- [ ] refonte data vers :
      `pack`
      `word`
      `pack_word`
      `distractor`
      `quiz_session`
      `quiz_question`
- [ ] modèle multilingue par tables de traduction
- [ ] loaders résilients :
      un pack dégradé ne doit pas rendre l'admin ou le site indisponibles
- [ ] pack `sandbox / easter-egg` pour tester migrations et résilience

### Chantiers déjà identifiés

- [ ] cloud sync avec Supabase
- [ ] auth magic link
- [ ] préférences persistées
- [ ] option `romaji simplifié / romaji strict`
- [ ] si besoin réel : sauvegardes JSON d'archives quotidiennes par année ou par mois
- [ ] validation future des mots par usage réel si les métriques quiz le justifient

---

## Notes de fonctionnement

- `normalizeAssistForDisplay` reste une béquille temporaire.
- L'objectif reste d'afficher une romanisation propre sans dégrader la donnée source.
- Le public doit voir surtout des packs ; les thèmes restent secondaires.
- `Quotidien` / `Libre` / `Archives` sont désormais cadrés conceptuellement dans l'atlas.
- en l'état, les archives n'ont pas de partage.
- en l'état, pas de snapshot quotidien permanent ; la piste retenue plus tard est la sauvegarde JSON par année ou par mois si le besoin apparaît.
- Les release notes devront pouvoir annoncer :
  - nouveaux mots
  - ajouts de mots dans les packs
  - nouveaux packs
