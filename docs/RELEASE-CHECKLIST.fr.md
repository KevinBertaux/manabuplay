# Checklist Release Hebdo (quota Netlify contraint)

Objectif: limiter a **1 deploy production par semaine** jusqu'au **9 mars 2026**.

## Regles

- Pas de deploy production hors fenetre hebdomadaire validee.
- Les commits peuvent continuer sur le repo sans deploy prod systematique.
- Un seul responsable valide le Go/No-Go final.

## Fenetres de deploy cibles

- Semaine du 16 fevrier 2026 (1 deploy max)
- Semaine du 23 fevrier 2026 (1 deploy max)
- Semaine du 2 mars 2026 (1 deploy max)
- Revue du quota apres reset du 9 mars 2026

## Pre-check local (obligatoire)

- [ ] `npm install` OK
- [ ] `npm test` OK
- [ ] `npm run build` OK
- [ ] Verification rapide routes: `/`, `/math`, `/vocab`, `/legal/mentions-legales`, `/legal/confidentialite`
- [ ] Verification acces `/admin` par URL + mot de passe
- [ ] Verification que le menu n'expose pas `Admin`
- [ ] Verification favicon/logo/header
- [ ] Verification captures/docs mises a jour si necessaire

## Go/No-Go contenu

- [ ] Changelog/notes de version prets (meme format court)
- [ ] Version cible confirmee (ex: `0.4.0`)
- [ ] Aucun secret dans le repo (`.env` non commit)
- [ ] Mentions legales et confidentialite coherentes avec le comportement reel
- [ ] Aucune regression critique ouverte

## Check Netlify avant publication

- [ ] Builds auto geres selon la strategie budget (pause/reprise)
- [ ] Branche cible confirmee (`main`)
- [ ] Variables d'environnement prod verifiees
- [ ] Deploy preview valide si budget disponible (optionnel)

## Publication

- [ ] Push final sur branche de publication
- [ ] Deploy Netlify lance et termine avec succes
- [ ] Verification post-deploy sur URL publique
- [ ] Badge Netlify status vert dans la doc

## Post-release

- [ ] Tag Git cree (ex: `v0.4.0`)
- [ ] `ROADMAP.md` mis a jour (fait/reste a faire)
- [ ] Prochaine fenetre hebdo planifiee
