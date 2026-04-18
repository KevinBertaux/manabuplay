# ManabuPlay

Repository for `v0.1`, now split into two Astro apps.

## Workspace

- `apps/web`: public ManabuPlay site
- `apps/admin`: local admin dashboard
- `shared`: shared quiz data and business logic
- `docs`: roadmap, atlas, business notes
- `legacy`: original MVP kept for migration and parity checks

## Stack

- Astro 6
- TypeScript
- Tailwind CSS 4
- Shared CSS layers in `shared/styles`
- Current styling mode: hybrid Tailwind utilities + dedicated CSS layers

## Commands

```sh
npm install
npm run dev -- --host 0.0.0.0
npm run dev -- --host 0.0.0.0 --app web
npm run dev -- --host 0.0.0.0 --app admin
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
