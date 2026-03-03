# ManabuPlay

Educational web app (Vue 3 + Vite SPA) to help children practice math and vocabulary.

[Version française](README.fr.md)

## Version

- Current version: `0.5.0-prep`
- Last update: `3 March 2026` (fr-FR date: 3 mars 2026)

## Current features

### Math (`/math/multiplications`, `/math/symmetry`)
- Multiplications: multi-table selection (0-11), difficulty modes, score/streak/best streak
- Multiplications: keyboard validation (`Enter`) + desktop/tablet numeric pad
- Symmetry V1: visual MCQ (vertical + horizontal axes), score/streak/best streak
- No implicit start: selection required before practice

### English vocabulary (`/languages/english`)
- External JSON lists with title, description, and words
- Dropdown with dynamic word count (`xx words`)
- No list selected by default
- Flashcards: arrows, keyboard, and mobile swipe navigation
- English TTS: US/UK accent + reading speed (3 levels)
- Card direction: English -> French or French -> English
- TTS button hidden in FR -> EN mode until translation is revealed

### Internal panel V1 (restricted access)
- Local edit of list name/description/words
- Admin dropdown with dynamic word count
- JSON import / export / copy
- Local `localStorage` save
- Accessed through private URL `/-/studio-ops` (not visible in public menu)

### Vocabulary data (R2 V1)
- Optional remote Cloudflare R2 loading via environment variables
- `index.json` list manifest + automatic local fallback on failure
- Goal: update lists without redeploying the app

## Local setup

### Prerequisites
- Node.js LTS (v24+ recommended)
- npm

### Run
1. `npm install`
2. `npm run dev`
3. Open printed URL (example: `http://localhost:5173`)

### Quality checks
- Unit/integration tests: `npm test`
- Browser E2E tests: `npm run test:e2e`
- Production build: `npm run build`

## SPA routes

- `/`: Home
- `/math`: Math hub
- `/math/multiplications`: Multiplications module
- `/math/symmetry`: Symmetry module
- `/languages`: Languages hub
- `/languages/english`: English vocabulary module
- `/-/studio-ops`: Internal login
- `/-/studio-ops/panel`: Internal panel
- `/-/studio-ops/help`: Internal panel guide (FR/EN switch)
- `/legal/legal-notice`: Legal notices
- `/legal/terms-of-use`: Terms of use
- `/legal/privacy-policy`: Privacy policy

## Documentation

- QA checklist: `docs/QA-CHECKLIST.fr.md`
- Release checklist: `docs/RELEASE-CHECKLIST.fr.md`
- Secrets security: `docs/SECURITY-SECRETS.fr.md`
- Git cheat sheet: `docs/GIT-CHEATSHEET.fr.md`
- Internal panel guide (in-app FR/EN): `/-/studio-ops/help`
- Release notes 0.5.0-prep: `docs/RELEASE-NOTES.0.5.0-prep.fr.md`
