# English Documentation - ManabuPlay

English documentation hub. This file points to the right sources instead of duplicating the whole product scope.

[Documentation française](README.fr.md)

## Status

- Current product version: `0.6.0-prep`
- Active product branch: `feat/0.6.0-prep`
- Separate monetization line: `epic/ads-cmp`

## Documentation map

### Public-facing project docs

- Short GitHub overview: `README.md`
- Short planning summary: `ROADMAP.md`
- Latest published release notes: `docs/RELEASE-NOTES.0.5.0-prep.fr.md`

### Operations and quality

- Release checklist: `docs/RELEASE-CHECKLIST.fr.md`
- QA checklist: `docs/QA-CHECKLIST.fr.md`
- Netlify quota incident procedure: `docs/NETLIFY-RECOVERY-CHECKLIST.fr.md`

### Technical references

- UI rules: `docs/UI-RULES.fr.md`
- Secrets / security: `docs/SECURITY-SECRETS.fr.md`
- R2 / cache control: `docs/R2-CACHE-CONTROL.fr.md`
- Git cheat sheet: `docs/GIT-CHEATSHEET.fr.md`
- Monetization notes: `docs/MONETISATION-PUBLICITE.fr.md`

### Public in-app sources

- Legal notice: `/legal/legal-notice`
- Terms of use: `/legal/terms-of-use`
- Privacy policy: `/legal/privacy-policy`
- Cookie policy: `/legal/cookie-policy`

### Internal in-app sources

- Internal panel help: embedded in the panel itself
- Internal dashboard: restricted access, not documented publicly

## Sources of truth

### Product planning

- Detailed source of truth:
  - `src/content/roadmap/*.json`
- Consumer:
  - admin dashboard
- `ROADMAP.md` role:
  - short synthesis only, not full duplication

### Admin-only content

- `src/content/admin/*`
- Reserved for content that only exists for the internal panel
- Rule kept for the project:
  - if content makes sense outside admin, it stays in its business domain
  - if content exists only for internal operations, it belongs in `admin`

### Public legal content

- Source of truth: `/legal/*` site pages
- Markdown files must stay aligned with these public pages

## Active modules

- `Mathematics`
  - hub: `/math`
  - modules: `multiplications`, `symmetry`
- `Languages`
  - hub: `/languages`
  - module: `english`
- `Internal panel`
  - documentation and access reserved for internal use

## Local run

```bash
npm install
npm run dev
```

Main checks:

```bash
npm test
npm run test:e2e
npm run build
```

## Documentation convention

- `README.md`: short GitHub storefront
- `docs/README.fr.md` / `docs/README.en.md`: detailed hubs
- `ROADMAP.md`: short planning synthesis
- `src/content/roadmap/*.json`: product source of truth
- `src/content/admin/*`: internal admin source of truth
