# ManabuPlay

Application web éducative (SPA Vue 3 + Vite) pour aider les enfants à réviser les mathématiques et le vocabulaire.

[English version](README.en.md)

## Version

- Version en cours: `0.5.0-prep`
- Dernière modification: `22 février 2026` (fr-FR)

## Fonctionnalités actuelles

### Math (`/math`)
- Quiz de tables de multiplication (0-11 + mode toutes tables)
- Score, total de réponses, série en cours et meilleure série (localStorage)
- Validation clavier (`Entrée`) avec protection anti multi-validation
- Aucune table sélectionnée par défaut

### Vocabulaire anglais (`/vocab`)
- Listes JSON externes avec titre, description et mots
- Dropdown avec compteur dynamique de mots (`xx mots`)
- Aucune liste sélectionnée par défaut
- Flashcards: navigation flèches, clavier et swipe mobile
- TTS anglais: accent US/UK + vitesse de lecture (3 niveaux)
- Sens de carte: Anglais -> Français ou Français -> Anglais
- Bouton TTS masqué en mode FR -> EN avant révélation

### Zone interne V1 (accès restreint)
- Édition locale des listes (nom, description, mots)
- Dropdown admin avec compteur dynamique de mots
- Import JSON / export JSON / copie JSON
- Sauvegarde locale en `localStorage`
- Accès par URL privée `/-/studio-ops` (non exposée dans le menu)

## Installation locale

### Prérequis
- Node.js LTS (v24+ recommandé)
- npm

### Démarrage
1. `npm install`
2. `npm run dev`
3. Ouvrir l'URL affichée (ex: `http://localhost:5173`)

### Qualité
- Tests unitaires/intégration: `npm test`
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
- `/legal/mentions-legales`: Mentions légales
- `/legal/cgu`: Conditions générales d'utilisation
- `/legal/confidentialite`: Politique de confidentialité

## Documentation

- Checklist QA: `docs/QA-CHECKLIST.fr.md`
- Checklist release: `docs/RELEASE-CHECKLIST.fr.md`
- Sécurité secrets: `docs/SECURITY-SECRETS.fr.md`
- Git cheat sheet: `docs/GIT-CHEATSHEET.fr.md`
- Guide panel interne FR: `docs/PANEL-INTERNE.fr.md`
- Guide panel interne EN: `docs/PANEL-INTERNE.en.md`



