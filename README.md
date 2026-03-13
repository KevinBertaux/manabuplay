# ManabuPlay

Application web éducative pour faire réviser les enfants en autonomie, avec une base Vue 3 + Vite orientée modules, contenu versionné et déploiement statique.

## Statut

- Version produit en cours : `0.6.0-prep`
- Branche produit active : `feat/0.6.0-prep`
- Ligne monétisation séparée : `epic/ads-cmp`

## Modules actuellement disponibles

- `Mathématiques`
  - Multiplications
  - Symétrie
- `Langues`
  - Anglais
- `Panneau interne`
  - édition locale, import/export JSON, maintenance locale

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

## Documentation

- Documentation FR détaillée : `docs/README.fr.md`
- Detailed English documentation : `docs/README.en.md`
- Checklist release : `docs/RELEASE-CHECKLIST.fr.md`
- Checklist QA : `docs/QA-CHECKLIST.fr.md`
- Règles UI : `docs/UI-RULES.fr.md`
- Sécurité / secrets : `docs/SECURITY-SECRETS.fr.md`
- R2 / cache : `docs/R2-CACHE-CONTROL.fr.md`
- Git cheat sheet : `docs/GIT-CHEATSHEET.fr.md`
- Dernières notes de version publiées : `docs/RELEASE-NOTES.0.5.0-prep.fr.md`

## Sources de vérité

- Pilotage produit, scopes et backlog :
  - `src/content/roadmap/*.json`
  - panneau d’administration
- Contenus strictement internes au panneau :
  - `src/content/admin/*`
- Informations légales publiques :
  - pages du site `/legal/*`
- Manuel d'usage du panneau interne :
  - intégré au panneau lui-même, non référencé publiquement

`ROADMAP.md` reste une synthèse courte de pilotage. Il ne doit pas re-dupliquer l'intégralité des scopes JSON.
