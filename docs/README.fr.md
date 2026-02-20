# ManabuPlay

Application web educative (SPA Vue 3 + Vite) pour aider les enfants a reviser les mathematiques et le vocabulaire.

[English version](README.en.md)

## Version

- Version en cours: `0.4.0-prep`
- Derniere modification: `19 février 2026` (fr-FR)

## Fonctionnalites actuelles

### Math (`/math`)
- Quiz de tables de multiplication (1-11 + mode toutes tables)
- Score, total de reponses et serie
- Validation clavier (`Entree`) avec protection anti multi-validation

### Vocabulaire anglais (`/vocab`)
- Flashcards fruits/legumes (25 mots chacune)
- Navigation fleches, clavier et swipe mobile
- TTS anglais avec accent US/UK

### Zone interne V1 (acces restreint)
- Edition locale des listes (nom, description, mots)
- Import JSON / export JSON / copie JSON
- Sauvegarde locale en `localStorage`
- Acces par URL privee `/-/studio-ops` (non exposee dans le menu)

## Installation locale

### Prerequis
- Node.js LTS (v24+ recommande)
- npm

### Demarrage
1. `npm install`
2. `npm run dev`
3. Ouvrir l'URL affichee (ex: `http://localhost:5173`)

### Qualite
- Tests unitaires/integration: `npm test`
- Tests E2E navigateur: `npm run test:e2e`
- Build production: `npm run build`

## Routes SPA

- `/`: Accueil
- `/math`: Module Math
- `/vocab`: Module vocabulaire
- `/-/studio-ops`: Zone interne (login)
- `/-/studio-ops/panel`: Zone interne (panel)
- `/aide/panel-interne`: Guide panel interne FR
- `/help/internal-panel`: Internal panel guide EN
- `/legal/mentions-legales`: Mentions legales
- `/legal/confidentialite`: Confidentialite
- `/cms/`: Decap CMS

## Documentation

- Checklist QA: `docs/QA-CHECKLIST.fr.md`
- Checklist release: `docs/RELEASE-CHECKLIST.fr.md`
- Setup GitHub/Netlify/CMS: `docs/SETUP-GITHUB-NETLIFY-CMS.fr.md`
- Securite secrets: `docs/SECURITY-SECRETS.fr.md`
- Git cheat sheet: `docs/GIT-CHEATSHEET.fr.md`
- Guide panel interne FR: `docs/PANEL-INTERNE.fr.md`
- Guide panel interne EN: `docs/PANEL-INTERNE.en.md`


