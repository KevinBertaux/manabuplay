# ManabuPlay

Repository for `v0.1`, now split into two Astro apps.

## Workspace

- `apps/web`: public ManabuPlay site
- `apps/admin`: local admin dashboard
- `shared`: shared quiz data and business logic
- `docs`: roadmap, atlas, business notes
- `legacy`: only the parity reference and archived snapshots kept for migration memory

Current repo state:

- `apps/admin` now behaves as a real Astro app with dedicated layouts
- local `check` and CI now enforce the same base quality contract
- the critical quiz runtime now lives in typed source modules, not in a single legacy public JS file

## Stack

- Astro 6
- TypeScript
- Tailwind CSS 4
- Shared CSS layers in `shared/styles` via `shared/styles/shared.css`
- Current styling mode: hybrid Tailwind utilities + dedicated CSS layers

## Commands

```sh
npm install
npm run dev -- --host 0.0.0.0
npm run dev -- --host 0.0.0.0 --app web
npm run dev -- --host 0.0.0.0 --app admin
npm run lint
npm run format:check
npm run check
npm run check:feature
npm run qa:release
npm run build
npm run preview
```

Validation levels:

- `npm run check`: Astro diagnostics + px guard + ESLint + Prettier + inline-usage ratchet
- `npm run lint`: ESLint on repo sources
- `npm run format:check`: Prettier verification
- `npm run check:feature`: unit tests + build + critical public Playwright flows
- `npm run qa:release`: feature checks + coverage + admin E2E + legacy parity

Inline usage policy:

- the repo is moving away from inline `style=""`, inline handlers and inline scripts
- `npm run check:inline-usage` currently works as a ratchet: no regression is allowed while cleanup lots are in progress

Preview:

- `npm run preview` previews `apps/web`
- `npm run preview:web` and `npm run preview:admin` target one app explicitly

Ports:

- `4321` for `web`
- `4322` for `admin`

## Project Notes

- Product roadmap source: `docs/ROADMAP.json`
- Product atlas: `docs/MANABUPLAY_ATLAS.md`
- Business strategy: `docs/BUSINESS.md`
- Target domain: `https://manabuplay.com`
