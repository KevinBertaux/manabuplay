# ManabuPlay

Foundation branch for `v0.1`.

## Stack

- Astro 6
- TypeScript
- Tailwind CSS 4

## Purpose

This branch replaces the original single-file MVP with a maintainable foundation
for:

- quiz gameplay
- content packs
- SEO pages
- future monetization flows

The original static MVP is kept in `legacy/mvp-index.html` for migration.

## Commands

```sh
npm install
npm run dev -- --host 0.0.0.0
npm run check
npm run check:feature
npm run qa:release
npm run build
npm run preview
```

Validation levels:

- `npm run check`: quick local checks
- `npm run check:feature`: unit tests + build + critical public Playwright flows
- `npm run qa:release`: feature checks + coverage + admin E2E + legacy parity

Workspace notes:

- `npm run dev -- --host 0.0.0.0` is the canonical local command
- `npm run build` is the canonical full build command
- the repository still falls back to the current monolith app until the split is finished

## Project Notes

- Product roadmap source: `docs/ROADMAP.json`
- Product atlas: `docs/MANABUPLAY_ATLAS.md`
- Business strategy: `docs/BUSINESS.md`
- Target domain: `https://manabuplay.com`
