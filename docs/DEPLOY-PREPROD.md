# Déploiement — pré-prod sans brûler les crédits Netlify

## Ce qui n’était pas encore noté

Avant ce doc, seul le **preview local** (`npm run preview`) et le déploiement **prod** étaient évoqués (Atlas, Clarity, smoke Netlify Forms).  
Il n’y avait **pas** de branche deploy ni de règles Netlify écrites dans le repo.

## Principe retenu

| Environnement                     | Où                                                                                  | Coût Netlify                     | Usage                                             |
| --------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------- |
| **Dev**                           | `npm run dev`                                                                       | 0                                | Quotidien                                         |
| **Pré-prod locale**               | `npm run build` + `npm run preview`                                                 | 0                                | Relecture légal, UI, Playwright, Insight captures |
| **Pré-prod en ligne** (optionnel) | Branche `deploy/preprod-v01` → **un** build Netlify quand tu pousses volontairement | 1 build / push sur cette branche | Partage URL, test mobile réel, smoke léger        |
| **Production**                    | `main` (2 branches, pas de 3ᵉ branche prod)                                         | 1 build / deploy prod manuel     | Domaine public, Netlify Forms, Clarity            |

**Économie de crédits :**

1. Ne pas activer les **Deploy Previews** sur chaque PR (gros poste de builds).
2. Ne pas auto-déployer **toutes** les branches — seulement la branche deploy prévue ci-dessous (+ `main` quand tu passes en prod).
3. Faire la majorité des vérifs en **preview local** (port 4321 web, 4322 admin).

## Workflow Git (2 branches — validé)

| Branche | Rôle | Statut |
| ------- | ---- | ------ |
| `main` | Production Netlify (`PUBLIC_CLARITY_PROJECT_ID`, Clarity actif, rapports reçus) | OK — auto-deploy off recommandé |
| `deploy/preprod-v01` | Pré-prod en ligne (branch deploy) | OK — push volontaire |

Pas de 3ᵉ branche « prod » : `main` = prod, `deploy/preprod-v01` = pré-prod.

## Branche `deploy/preprod-v01`

- Tu merges ou pousses dessus **uniquement** quand tu veux une URL Netlify de pré-prod.
- `main` peut rester sans deploy auto (réglage Netlify UI) : deploy prod **manuel** = 0 crédit tant que tu ne déclenches pas.

## Réglages Netlify recommandés (UI)

À faire une fois sur le site Netlify ManabuPlay :

1. **Build & deploy → Continuous deployment → Branches**
   - Limiter aux branches : `deploy/preprod-v01` et (plus tard) `main` pour la prod.
   - Ou : désactiver l’auto-publish sur `main` et ne garder que `deploy/preprod-v01` jusqu’au lancement.

2. **Build & deploy → Deploy Previews**
   - **Désactivé** (évite un build par PR).

3. **Build settings** (monorepo)
   - **`netlify.toml` à la racine** impose `base = "."` (écrase l’UI si elle met `apps/web`)
   - **Ne pas** mettre Base directory = `apps/web` dans l’UI : sinon `Missing script: build:web` (le script est au **root**, pas dans `apps/web/package.json`)
   - Publish : `dist/web` (pas `apps/web/dist`)
   - `shared/` est inclus automatiquement au build (imports depuis `apps/web`)

4. **Environment variables**
   - **Production** (`main`) : `PUBLIC_CLARITY_PROJECT_ID` = id Clarity — **fait** (rapports de visites reçus).
   - **Branch deploy `deploy/preprod-v01`** : ne pas définir `PUBLIC_CLARITY_PROJECT_ID` (pas de bannière / pas de Clarity sur la pré-prod en ligne sauf test volontaire).
   - Waitlist : sur URL Netlify de pré-prod, le formulaire reste en mode **localStorage** (hostname ≠ prod) — normal pour ne pas polluer Netlify Forms.

5. **Deploys**
   - Préférer **Trigger deploy** manuel si tu veux un build seulement sur demande.

## DNS et SSL — Infomaniak → Netlify (à faire, P0 v0.1)

Le domaine **manabuplay.com** est détenu chez **Infomaniak**. Le site est aussi ajouté côté **Netlify**, mais les deux ne sont pas encore reliés par la DNS publique.

**État observé (mai 2026)** : zone Infomaniak avec SOA seulement — pas d’enregistrement **A** / **AAAA** / **CNAME** vers Netlify. Conséquence : `https://manabuplay.com` et `https://www.manabuplay.com` ne répondent pas.

### Option recommandée (garder Infomaniak comme registrar)

1. Netlify → **Domain management** → `manabuplay.com` → noter les cibles DNS proposées (souvent load balancer Netlify pour l’apex, CNAME pour `www`).
2. Infomaniak → DNS du domaine → créer les enregistrements indiqués par Netlify (apex + `www`).
3. Attendre la propagation (quelques minutes à 48 h).
4. Netlify : vérifier **HTTPS** / certificat Let’s Encrypt pour apex et `www`.
5. Netlify : redirection `www` ↔ apex (ou l’inverse) selon l’URL canonique choisie.
6. Tester : `https://manabuplay.com` et `https://www.manabuplay.com` servent le deploy prod.

### Alternative

Déléguer la zone DNS entière à Netlify (changer les nameservers chez Infomaniak) — plus simple côté Netlify, moins de panneaux.

## Checklist avant go-live public

- [x] Workflow 2 branches Netlify (`main` + `deploy/preprod-v01`)
- [x] Clarity en prod (`PUBLIC_CLARITY_PROJECT_ID`, rapports reçus)
- [x] Waitlist validée (pré-prod ; prod = même wiring au domaine public)
- [ ] **DNS + SSL** Infomaniak → Netlify (`manabuplay.com` + `www`)
- [ ] Smoke **Netlify Forms** sur le domaine prod (hostname public)
- [ ] QA mobile sur l’URL pré-prod ou prod
- [ ] Smoke pass finale v0.1

## Commandes locales (0 crédit Netlify)

```bash
npm run build
npm run preview          # web — équivalent “site en ligne” sans Netlify
npm run preview:admin    # admin
```
