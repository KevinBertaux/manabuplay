# Release Notes - 0.5.0-prep

Date: 3 mars 2026

## Résumé

Cette itération prépare la release `0.5.0` avec une base plus stable côté UX, QA et maintenabilité.

## Principales évolutions

- Math:
  - module Symétrie V1 (QCM visuel, axes vertical/horizontal);
  - Multiplications enrichies (sélection multi-tables, difficultés, pavé numérique desktop/tablette).
- Langues:
  - listes JSON enrichies (titre, description, compteur dynamique, sens de carte EN/FR ou FR/EN);
  - TTS avec accent US/UK et vitesse en 3 niveaux.
- Données:
  - R2 V1: chargement distant des listes avec fallback local.
- Zone interne:
  - dashboard renforcé (maintenance locale, suivi roadmap/scope, édition listes et formes).
- Qualité:
  - QA release automatisée renforcée (tests unitaires, E2E, a11y, Lighthouse);
  - non-régression visuelle déplacée dans un workflow CI dédié.

## Notes techniques

- Aucun backend requis pour la 0.5 (`Netlify static + localStorage`).
- Protection zone interne: front-only (légère), non équivalente à une auth serveur.
- Le workflow `QA Visual Regression` est séparé du workflow release principal pour limiter les faux échecs CI.
