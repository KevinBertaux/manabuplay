# Monetisation et publicite - ManabuPlay

Document de cadrage. Il decrit la ligne monetisation du projet, ses prerequis et ses garde-fous. Il ne doit plus etre interprete comme une feuille de route produit `0.5` / `0.6`.

## Position actuelle

La monetisation est maintenant decouplee des versions produit.

- ligne produit :
  - `feat/0.5.0-prep`
  - puis `feat/0.6.0-prep`
- ligne monetisation :
  - `epic/ads-cmp`

Consequence :
- la pub n a pas besoin d attendre une version particuliere
- la monetisation peut avancer en parallele
- l integration finale se merge dans la branche produit active quand elle est prete

## Etat actuel

### Deja fait

- meta AdSense site-level dans `index.html`
- `public/ads.txt`
- site ajoute dans AdSense
- validation de propriete demandee
- message Google `Privacy & messaging` publie
- branche de travail dediee :
  - `epic/ads-cmp`

### En attente

- approbation AdSense
- mise en production de la CMP Google reelle
- mise en production des premiers emplacements publicitaires reels

## Doctrine produit

### Priorite

1. ne pas casser l experience d apprentissage
2. rester conforme
3. limiter la pression publicitaire
4. n etendre la monetisation qu apres validation du premier lot

### Position enfants / mineurs

- prudence maximale
- formats intrusifs interdits
- pas d auto-play sonore
- pas de multiplication des emplacements sans mesure reelle

## Architecture Git retenue

### Produit

- `main` = branche stable
- `feat/0.5.0-prep` = ligne produit actuelle
- futures branches produit :
  - `feat/0.6.0-prep`
  - etc.

### Monetisation

- `epic/ads-cmp` = source de verite monetisation
- branches filles typiques :
  - `feature/cmp-consent-mode-v1`
  - `feature/ads-live-slots-v1`
  - `feature/ads-pub-backlog-v1`
  - `feature/go-nogo-checklists-v1`

### Regle

- les features produit partent de la branche produit active
- les features monetisation partent de `epic/ads-cmp`
- `epic/ads-cmp` se merge dans la branche produit active quand la monetisation est prete

## Pre requis permanents

Les elements suivants doivent survivre sur toutes les branches produit actives :

- meta AdSense dans `index.html`
- `public/ads.txt`

Ils sont consideres comme des prerequis site-level, pas comme une feature optionnelle.

## CMP et consentement

### Cible retenue

- CMP Google `Privacy & messaging`
- `Advanced Consent Mode`

### Regles

- pas de double banniere locale + Google en production
- la CMP Google devient la source de verite pour le consentement pub
- le panneau local cookies ne doit pas contredire la CMP

## Strategie de deploiement

### Lot 1

- CMP Google prete techniquement
- premiers slots reels limites :
  - hubs uniquement
  - pas de quiz
  - un seul emplacement par classe d ecran

### Extension plus tard

- rail gauche desktop
- extension a d autres pages non quiz
- nouvelles unites AdSense dediees

## Go / No-Go monetisation

La monetisation ne part en production que si :

- approbation AdSense obtenue ou etat compatible test public
- `ads.txt` verifie en production
- meta AdSense verifiee en production
- message Google publie
- CMP testee publiquement
- pas de doublon avec la banniere locale
- slots limites au perimetre decide
- feu vert produit explicite

## Ce que ce document n est plus

- ce n est plus une decision `pub en 0.5` ou `pub en 0.6`
- ce n est plus une roadmap produit
- ce n est pas un avis juridique

## References

- Google Privacy & messaging
- Google Consent Mode
- politique de l Union europeenne et cadre CNIL sur cookies / traceurs / mineurs

Les details operatoires restent dans :
- le panneau admin
- les checklists Go / No-Go
- la branche `epic/ads-cmp`
