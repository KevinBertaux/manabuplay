# Organisation du dépôt

Règle simple : **produit** à la racine, **doc** dans `docs/`, **résidus locaux** dans `tmp/`.

## Produit (versionné)

- `apps/web` — site public
- `apps/admin` — admin local (mockups, pilotage, contenu)
- `shared/` — données packs, logique quiz, styles
- `scripts/` — build, checks, captures
- `tests/` — Vitest + Playwright

## Documentation (versionnée)

- `docs/` — référence active (atlas, roadmap, business, QA, déploiement…)
- `docs/archive/` — snapshots figés, **pas** source de vérité

## Parité legacy (versionné, minimal)

- `legacy/reference-landing.html` — HTML de référence pour comparaisons visuelles (`compare-legacy-reference.mjs`, Playwright)

## Résidus locaux (ignorés par git)

- `tmp/` — tout ce qui se régénère ou sert à l’exploration
  - `tmp/captures/insight/` — PNG Insight (`npm run insight:capture`)
  - `tmp/compare/visual-compare/` — diffs parité legacy
  - audits, brouillons, essais FX, etc.
- `dist/`, `.astro/`, `node_modules/`, rapports Playwright, `coverage/`

## IDE

- `.cursor/rules/` — règles agent (petit, versionné volontairement)

Captures agent / one-off : **`tmp/captures/`** uniquement (pas dans `apps/*/public/`).
