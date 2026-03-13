# Monétisation et publicité - ManabuPlay

Document de cadrage. Il décrit la ligne monétisation du projet, ses prérequis et ses garde-fous. Il ne doit plus être interprété comme une feuille de route produit `0.5` / `0.6`.

## Position actuelle

La monétisation est maintenant découplée des versions produit.

- ligne produit :
  - `feat/0.5.0-prep`
  - puis `feat/0.6.0-prep`
- ligne monétisation :
  - `epic/ads-cmp`

Conséquence :
- la pub n’a pas besoin d’attendre une version particulière
- la monétisation peut avancer en parallèle
- l’intégration finale se merge dans la branche produit active quand elle est prête

## État actuel

### Déjà fait

- meta AdSense site-level dans `index.html`
- `public/ads.txt`
- site ajouté dans AdSense
- validation de propriété demandée
- message Google `Privacy & messaging` publié
- branche de travail dédiée :
  - `epic/ads-cmp`

### En attente

- approbation AdSense
- mise en production de la CMP Google réelle
- mise en production des premiers emplacements publicitaires réels

## Doctrine produit

### Priorité

1. ne pas casser l’expérience d’apprentissage
2. rester conforme
3. limiter la pression publicitaire
4. n’étendre la monétisation qu’après validation du premier lot

### Position enfants / mineurs

- prudence maximale
- formats intrusifs interdits
- pas d’auto-play sonore
- pas de multiplication des emplacements sans mesure réelle

## Architecture Git retenue

### Produit

- `main` = branche stable
- `feat/0.5.0-prep` = ligne produit actuelle
- futures branches produit :
  - `feat/0.6.0-prep`
  - etc.

### Monétisation

- `epic/ads-cmp` = source de vérité monétisation
- branches filles typiques :
  - `feature/cmp-consent-mode-v1`
  - `feature/ads-live-slots-v1`
  - `feature/ads-pub-backlog-v1`
  - `feature/go-nogo-checklists-v1`

### Règle

- les features produit partent de la branche produit active
- les features monétisation partent de `epic/ads-cmp`
- `epic/ads-cmp` se merge dans la branche produit active quand la monétisation est prête

## Pré-requis permanents

Les éléments suivants doivent survivre sur toutes les branches produit actives :

- meta AdSense dans `index.html`
- `public/ads.txt`

Ils sont considérés comme des prérequis site-level, pas comme une feature optionnelle.

## CMP et consentement

### Cible retenue

- CMP Google `Privacy & messaging`
- `Advanced Consent Mode`

### Règles

- pas de double bannière locale + Google en production
- la CMP Google devient la source de vérité pour le consentement pub
- le panneau local cookies ne doit pas contredire la CMP

## Stratégie de déploiement

### Lot 1

- CMP Google prête techniquement
- premiers slots réels limités :
  - hubs uniquement
  - pas de quiz
  - un seul emplacement par classe d’écran

### Extension plus tard

- rail gauche desktop
- extension à d’autres pages non quiz
- nouvelles unités AdSense dédiées

## Go / No-Go monétisation

La monétisation ne part en production que si :

- approbation AdSense obtenue ou état compatible test public
- `ads.txt` vérifié en production
- meta AdSense vérifiée en production
- message Google publié
- CMP testée publiquement
- pas de doublon avec la bannière locale
- slots limités au périmètre décidé
- feu vert produit explicite

## Ce que ce document n’est plus

- ce n’est plus une décision `pub en 0.5` ou `pub en 0.6`
- ce n’est plus une roadmap produit
- ce n’est pas un avis juridique

## Références

- Google Privacy & messaging
- Google Consent Mode
- politique de l’Union européenne et cadre CNIL sur cookies / traceurs / mineurs

Les détails opératoires restent dans :
- le panneau admin
- les checklists Go / No-Go
- la branche `epic/ads-cmp`
