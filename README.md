# ManabuPlay - GitHub Showcase

![Version](https://img.shields.io/badge/version-0.3.0-2ea44f) ![Vue](https://img.shields.io/badge/Vue-3-42b883) ![Vite](https://img.shields.io/badge/Vite-5-646cff) ![Status](https://img.shields.io/badge/status-active-1f6feb) ![Education](https://img.shields.io/badge/usage-education-blue) [![Netlify Status](https://api.netlify.com/api/v1/badges/b27a59fb-1456-4320-92ac-c4c4e02786c4/deploy-status)](https://app.netlify.com/projects/manabuplay/deploys)

ManabuPlay est une SPA educative pour enfants (Vue 3 + Vite) orientee revision scolaire: maths, vocabulaire, et edition de contenu simple.

[📘 Documentation FR](docs/README.fr.md) | [📗 Documentation EN](docs/README.en.md)


## Demo rapide

- Local: `npm run dev`
- Build: `npm run build`
- Tests: `npm test`
- CMS: `/cms/` (Netlify Identity + Git Gateway)

## Points forts

- Module **Math**: quiz tables de multiplication (1-11 + mode toutes tables)
- Module **Langues**: flashcards anglais (25 mots par liste), TTS en-US/en-GB
- **Zone interne V1**: edition locale des listes JSON (acces restreint)
- Architecture SPA evolutive vers nouveaux modules (ex: symetrie, division, espagnol)

## Captures

### Accueil
![Accueil ManabuPlay](docs/captures/home.png)

### Module Math
![Math ManabuPlay](docs/captures/math.png)

### Module Vocab
![Vocab ManabuPlay](docs/captures/vocab.png)

## Stack

- Vue 3
- Vue Router
- Vite
- Vitest
- Netlify + Decap CMS

## Structure

```text
manabuplay/
  src/
  public/
  docs/
```

## Protection Zone Interne

- L'acces interne est protege par identifiant + mot de passe (hash cote front).
- Configure `.env` avec `VITE_ADMIN_USERNAME`, `VITE_ADMIN_PASSWORD_HASH`, `VITE_ADMIN_MAX_ATTEMPTS`, `VITE_ADMIN_BLOCK_MS`, `VITE_ADMIN_SESSION_TTL_MS`.
- Le mode front-only reste une protection legere (pas equivalente a une auth serveur).

## Documentation

- README principal: `README.md`
- Documentation FR detaillee: `docs/README.fr.md`
- Documentation EN detaillee: `docs/README.en.md`
- Setup GitHub/Netlify/CMS: `docs/SETUP-GITHUB-NETLIFY-CMS.fr.md`
- Checklist release hebdo: `docs/RELEASE-CHECKLIST.fr.md`
- Securite secrets (ggshield): `docs/SECURITY-SECRETS.fr.md`
- Git cheat sheet: `docs/GIT-CHEATSHEET.fr.md`
- Backend Laravel V2: `docs/BACKEND-LARAVEL-V2.fr.md`

## Securite secrets

- Scan GitGuardian active en CI via `.github/workflows/ggshield.yml`.
- Ajouter le secret GitHub `GITGUARDIAN_API_KEY` pour activer le scan.
- Guide rapide: `docs/SECURITY-SECRETS.fr.md`.

## Version

- `0.3.0` - 13 fevrier 2026



