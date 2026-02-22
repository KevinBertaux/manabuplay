# Checklist Release Hebdo (quota Netlify contraint)

Objectif: limiter a **1 deploy production par semaine** jusqu'au reset quota.

## Regles

- Pas de deploy production hors fenetre hebdomadaire validee.
- Les merges `feature/*` se font vers `feat/0.5.0-prep`.
- La branche `main` ne recoit que des merges de release valides.

## Pre-check local (obligatoire)

- [ ] `npm install` OK
- [ ] `npm test` OK
- [ ] `npm run test:e2e` OK
- [ ] `npm run build` OK
- [ ] Verification routes publiques: `/`, `/math`, `/vocab`, `/legal/mentions-legales`, `/legal/confidentialite`
- [ ] Verification acces zone interne via URL privee `/-/studio-ops`
- [ ] Verification menu public: aucun acces admin visible
- [ ] Verification favicon/logo/header

## Go/No-Go contenu

- [ ] Version cible confirmee (ex: `0.5.0`)
- [ ] Notes de version courtes preparees
- [ ] Aucun secret commite (`.env` local uniquement)
- [ ] Mentions legales/confidentialite coherentes avec le comportement reel
- [ ] Aucune regression critique ouverte

## Check Netlify avant publication

- [ ] Branche de publication confirmee (`main`)
- [ ] Variables d'environnement production verifiees
- [ ] Build preview valide (si budget deploy disponible)
- [ ] Budget deploy encore suffisant

## Publication

- [ ] Merge `feat/0.5.0-prep` -> `main`
- [ ] Push final sur `main`
- [ ] Deploy Netlify lance et termine avec succes
- [ ] Verification post-deploy sur URL publique

## Post-release

- [ ] Tag Git cree (ex: `v0.5.0`)
- [ ] `ROADMAP.md` mis a jour
- [ ] Prochaine fenetre hebdo planifiee

