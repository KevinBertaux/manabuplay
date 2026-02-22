# ManabuPlay

Educational web app (Vue 3 + Vite SPA) to help children practice math and vocabulary.

[Version française](README.fr.md)

## Version

- Current version: `0.5.0-prep`
- Last update: `22 February 2026` (fr-FR date: 22 février 2026)

## Current features

### Math (`/math`)
- Multiplication tables quiz (0-11 + all tables mode)
- Score, total answers, current streak, and best streak (localStorage)
- Keyboard validation (`Enter`) with duplicate-submit prevention
- No table selected by default

### English vocabulary (`/vocab`)
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

## Documentation

- QA checklist: `docs/QA-CHECKLIST.fr.md`
- Release checklist: `docs/RELEASE-CHECKLIST.fr.md`
- Secrets security: `docs/SECURITY-SECRETS.fr.md`
- Git cheat sheet: `docs/GIT-CHEATSHEET.fr.md`
- Internal panel guide FR: `docs/PANEL-INTERNE.fr.md`
- Internal panel guide EN: `docs/PANEL-INTERNE.en.md`


