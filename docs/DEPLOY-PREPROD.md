# Déploiement — pré-prod sans brûler les crédits Netlify

## Ce qui n’était pas encore noté

Avant ce doc, seul le **preview local** (`npm run preview`) et le déploiement **prod** étaient évoqués (Atlas, Clarity, smoke Netlify Forms).  
Il n’y avait **pas** de branche deploy ni de règles Netlify écrites dans le repo.

## Principe retenu

| Environnement | Où | Coût Netlify | Usage |
|---------------|-----|--------------|--------|
| **Dev** | `npm run dev` | 0 | Quotidien |
| **Pré-prod locale** | `npm run build` + `npm run preview` | 0 | Relecture légal, UI, Playwright, Insight captures |
| **Pré-prod en ligne** (optionnel) | Branche `deploy/preprod-v01` → **un** build Netlify quand tu pousses volontairement | 1 build / push sur cette branche | Partage URL, test mobile réel, smoke léger |
| **Production** | `main` (ou branche prod dédiée) | 1 build / deploy prod | Domaine public, Netlify Forms, Clarity |

**Économie de crédits :**

1. Ne pas activer les **Deploy Previews** sur chaque PR (gros poste de builds).
2. Ne pas auto-déployer **toutes** les branches — seulement la branche deploy prévue ci-dessous (+ `main` quand tu passes en prod).
3. Faire la majorité des vérifs en **preview local** (port 4321 web, 4322 admin).

## Branche `deploy/preprod-v01`

- Créée à partir de `main` après merge du chantier légal / Clarity.
- Tu merges ou pousses dessus **uniquement** quand tu veux une URL Netlify de pré-prod.
- `main` peut rester sans deploy auto jusqu’au go release (réglage Netlify UI).

## Réglages Netlify recommandés (UI)

À faire une fois sur le site Netlify ManabuPlay :

1. **Build & deploy → Continuous deployment → Branches**
   - Limiter aux branches : `deploy/preprod-v01` et (plus tard) `main` pour la prod.
   - Ou : désactiver l’auto-publish sur `main` et ne garder que `deploy/preprod-v01` jusqu’au lancement.

2. **Build & deploy → Deploy Previews**
   - **Désactivé** (évite un build par PR).

3. **Build settings** (si pas déjà fait)
   - Build command : `npm run build` (ou `npm run build:web` si un seul site public)
   - Publish directory : sortie Astro web (souvent `apps/web/dist` — vérifier dans Netlify après premier build)

4. **Environment variables**
   - **Production** (`main`) : `PUBLIC_CLARITY_PROJECT_ID` = id Clarity quand tu actives la mesure.
   - **Branch deploy `deploy/preprod-v01`** : ne pas définir `PUBLIC_CLARITY_PROJECT_ID` (pas de bannière / pas de Clarity sur la pré-prod en ligne sauf test volontaire).
   - Waitlist : sur URL Netlify de pré-prod, le formulaire reste en mode **localStorage** (hostname ≠ prod) — normal pour ne pas polluer Netlify Forms.

5. **Deploys**
   - Préférer **Trigger deploy** manuel si tu veux un build seulement sur demande.

## Checklist avant prod

- [ ] Merge `deploy/preprod-v01` → `main` (ou deploy prod depuis `main`)
- [ ] Smoke **Netlify Forms** sur le domaine prod
- [ ] `PUBLIC_CLARITY_PROJECT_ID` en prod + test bannière + sessions Clarity
- [ ] QA mobile sur l’URL pré-prod ou prod

## Commandes locales (0 crédit Netlify)

```bash
npm run build
npm run preview          # web — équivalent “site en ligne” sans Netlify
npm run preview:admin    # admin
```
