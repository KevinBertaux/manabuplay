# Documentation FR - ManabuPlay

Hub de documentation en français. Ce document détaille où trouver l’information utile sans re-dupliquer les sources de vérité métier.

[English documentation](README.en.md)

## Statut

- Version produit en cours : `0.5.0-prep`
- Branche produit active : `feat/0.5.0-prep`
- Ligne monétisation séparée : `epic/ads-cmp`

## Carte de la documentation

### Vitrine et navigation générale

- Présentation rapide du projet : `README.md`
- Synthèse de pilotage : `ROADMAP.md`
- Notes de version en cours : `docs/RELEASE-NOTES.0.5.0-prep.fr.md`

### Exploitation / qualité

- Checklist release : `docs/RELEASE-CHECKLIST.fr.md`
- Checklist QA : `docs/QA-CHECKLIST.fr.md`
- Procédure incident quota Netlify : `docs/NETLIFY-RECOVERY-CHECKLIST.fr.md`

### Référentiels techniques

- Règles UI : `docs/UI-RULES.fr.md`
- Sécurité / secrets : `docs/SECURITY-SECRETS.fr.md`
- R2 / cache : `docs/R2-CACHE-CONTROL.fr.md`
- Git cheat sheet : `docs/GIT-CHEATSHEET.fr.md`
- Réflexion monétisation : `docs/MONETISATION-PUBLICITE.fr.md`

### Sources publiques dans le site

- Mentions légales : `/legal/legal-notice`
- Conditions générales d’utilisation : `/legal/terms-of-use`
- Politique de confidentialité : `/legal/privacy-policy`
- Politique cookies : `/legal/cookie-policy`

### Sources internes dans le site

- Guide du panneau interne : `/-/studio-ops/help`
- Tableau de bord interne : `/-/studio-ops/panel`

## Sources de vérité

### Pilotage produit

- Source de vérité détaillée :
  - `src/content/roadmap/*.json`
- Consommation :
  - panneau d’administration
- Rôle de `ROADMAP.md` :
  - synthèse courte, pas duplication intégrale

### Contenus admin

- `src/content/admin/*`
- Réservé aux contenus strictement liés au panneau interne
- Règle retenue :
  - si le contenu a du sens hors admin, il reste dans son domaine métier
  - si le contenu n’existe que pour le pilotage interne, il va dans `admin`

### Juridique public

- Source de vérité : pages du site `/legal/*`
- Les fichiers Markdown ne doivent pas contredire ces pages

## Modules actuellement actifs

- `Mathématiques`
  - hub : `/math`
  - modules : `multiplications`, `symmetry`
- `Langues`
  - hub : `/languages`
  - module : `english`
- `Panneau interne`
  - accès : `/-/studio-ops`

## Démarrage local

```bash
npm install
npm run dev
```

Contrôles principaux :

```bash
npm test
npm run test:e2e
npm run build
```

## Convention documentaire

- `README.md` : vitrine courte GitHub
- `docs/README.fr.md` / `docs/README.en.md` : hubs détaillés
- `ROADMAP.md` : synthèse de pilotage
- `src/content/roadmap/*.json` : source de vérité produit
- `src/content/admin/*` : source de vérité admin interne
