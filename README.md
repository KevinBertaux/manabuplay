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
npm run dev
npm run check:quick
npm run check:feature
npm run qa:release
npm run build
npm run preview
```

Validation levels:

- `npm run check:quick`: fast static checks for small patches
- `npm run check:feature`: unit tests + build + critical public Playwright flows
- `npm run qa:release`: feature checks + coverage + admin E2E + legacy parity

## Project Notes

- Product roadmap source: `docs/ROADMAP.json`
- Product atlas: `docs/MANABUPLAY_ATLAS.md`
- Business strategy: `docs/BUSINESS.md`
- Target domain: `https://manabuplay.com`
