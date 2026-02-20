# ManabuPlay

Educational web app (Vue 3 + Vite SPA) to help children practice math and vocabulary.

[Version francaise](README.fr.md)

## Version

- Current version: `0.4.0-prep`
- Last update: `19 February 2026` (fr-FR date: 19 février 2026)

## Current features

### Math (`/math`)
- Multiplication tables quiz (1-11 + all tables mode)
- Score, total answers, and streak tracking
- Keyboard validation (`Enter`) with duplicate-submit prevention

### English vocabulary (`/vocab`)
- Fruit/vegetable flashcards (25 words each)
- Arrow, keyboard, and mobile swipe navigation
- English TTS with US/UK accent selection

### Internal panel V1 (restricted access)
- Local edit of list name/description/words
- JSON import / export / copy
- Local `localStorage` save
- Accessed through private URL `/-/studio-ops` (not visible in public menu)

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
- `/math`: Math module
- `/vocab`: Vocabulary module
- `/-/studio-ops`: Internal login
- `/-/studio-ops/panel`: Internal panel
- `/aide/panel-interne`: Internal panel guide (FR)
- `/help/internal-panel`: Internal panel guide (EN)
- `/legal/mentions-legales`: Legal notices
- `/legal/confidentialite`: Privacy policy
- `/cms/`: Decap CMS

## Documentation

- QA checklist: `docs/QA-CHECKLIST.fr.md`
- Release checklist: `docs/RELEASE-CHECKLIST.fr.md`
- GitHub/Netlify/CMS setup: `docs/SETUP-GITHUB-NETLIFY-CMS.fr.md`
- Secrets security: `docs/SECURITY-SECRETS.fr.md`
- Git cheat sheet: `docs/GIT-CHEATSHEET.fr.md`
- Internal panel guide FR: `docs/PANEL-INTERNE.fr.md`
- Internal panel guide EN: `docs/PANEL-INTERNE.en.md`

