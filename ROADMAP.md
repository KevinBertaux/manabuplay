# ROADMAP - ManabuPlay

Document de synthèse. Les scopes détaillés, historiques de version et backlogs restent pilotés par les fichiers JSON dans `src/content/roadmap/*.json` et par le panneau interne.

## Lignes de travail

### Ligne produit

- branche active actuelle : `feat/0.6.0-prep`
- but :
  - lancer la `0.6.0`
  - garder la monétisation sur `epic/ads-cmp`, hors ligne produit

### Ligne monétisation

- branche épique dédiée : `epic/ads-cmp`
- but :
  - faire avancer AdSense, CMP Google et emplacements pub sans bloquer les releases produit

## Cadre de version

- `0.1.0` : prototype HTML/CSS/JS
- `0.2.0` : stabilisation fonctionnelle initiale
- `0.3.0` : migration vers Vue 3 + Vite
- `0.4.0` : release stable sans backend
- `0.5.0` : release produit sortie le 13 mars 2026
- `0.6.0-prep` : ligne produit active

## Sources de vérité

### Produit

- scopes par version :
  - `src/content/roadmap/scope-*.json`
- backlog :
  - `src/content/roadmap/backlog.json`
- index de roadmap :
  - `src/content/roadmap/roadmap-index.json`

### Admin interne

- contenus spécifiques au panneau :
  - `src/content/admin/*`
- règle retenue :
  - `roadmap` reste un domaine produit global
  - `admin` reste réservé au pilotage strictement interne

## Règles de merge

### Produit

- `feature/*` -> `feat/0.6.0-prep`
- `feat/0.6.0-prep` -> `main` quand release validée

### Monétisation

- `feature/*` liés à la pub -> `epic/ads-cmp`
- `epic/ads-cmp` -> branche produit active quand la monétisation est prête

## Pré-requis AdSense à conserver

Ces éléments doivent survivre sur toutes les branches produit actives :

- `index.html`
  - meta `google-adsense-account`
- `public/ads.txt`

Ils sont considérés comme des prérequis site-level, pas comme une feature pub optionnelle.

## Références utiles

- documentation projet :
  - `README.md`
  - `docs/README.fr.md`
  - `docs/README.en.md`
- release :
  - `docs/RELEASE-CHECKLIST.fr.md`
  - `docs/QA-CHECKLIST.fr.md`
- notes de version :
  - `docs/RELEASE-NOTES.0.5.0-prep.fr.md`
