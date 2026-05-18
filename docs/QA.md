# QA Locale

Objectif : garder un feedback utile sans lancer toute la batterie pour une modification faible risque.

## Regle De Base

Les validations sont separees en quatre moments :

- Pendant le dev : lancer le plus petit check qui couvre le risque modifie.
- Avant push : laisser le hook adaptatif bloquer les erreurs probables.
- En PR : CI lisible par couche, avec statique, unit, build et E2E publics critiques separes.
- En release : coverage, visuels, parite legacy et suites lourdes.

Les E2E ne sont pas un reflexe automatique. Ils sont reserves aux changements qui touchent l'UX visible, la navigation, les formulaires, le stockage navigateur, le bridge web/admin, le responsive ou une integration navigateur.

## Commandes Utiles

- `npm run check:quick` : lint + format. Premier reflexe pour copy, docs, petits changements TypeScript.
- `npm run check:web` : Astro check web + garde px.
- `npm run check:admin` : Astro check admin + garde px.
- `npm run check` : socle statique complet, sans E2E ni coverage.
- `npm run test:unit` : tests unitaires shared/admin.
- `npm run test:e2e:critical` : parcours publics critiques.
- `npm run test:e2e:ui-guards` : garde layout web cible.
- `npm run verify:merge` : validation lourde avant merge sensible.
- `npm run qa:release` : validation release, incluant coverage et parite legacy.

## Pre-Push Adaptatif

Le hook versionne dans `.githooks/pre-push` appelle `scripts/check-pre-push.mjs`.

Il lit les fichiers reellement pousses :

- Docs uniquement : `npm run check:quick`.
- Web uniquement : `check:web`, `check:quick`, audits inline/canonical publics.
- Admin uniquement : `check:admin`, `check:quick`, audit canonical.
- `shared/data/**` : `check:web`, `check:quick`, audit canonical. Les changements copy/data ne declenchent plus le socle complet par defaut.
- `shared/lib/**` ou `tests/shared/**` : `check:web`, `check:admin`, `check:quick`, `test:unit`, audit canonical.
- Scripts, workflows, hooks, configs racine, lockfile ou mix web/admin : `npm run check`.

Quand un changement peut affecter le navigateur, le hook affiche une recommandation E2E au lieu de bloquer automatiquement sur Playwright.

Pour simuler la selection sans lancer les commandes :

```sh
node scripts/check-pre-push.mjs --dry-run --files=shared/data/manabuplay/product-copy.ts
```

## CI

La CI GitHub est volontairement decoupee :

- `static` : `npm run check`.
- `unit` : `npm run test:unit`.
- `build` : `npm run build`.
- `e2e-critical` : installation Playwright, `build:web`, `test:e2e:ui-guards`, `test:e2e:critical`.

Une CI rouge doit dire quelle couche est cassee. On evite les scripts monolithiques qui relancent les memes checks plusieurs fois.

## Admin Playwright

Playwright admin reste disponible, mais ne doit pas etre lance par defaut.

On le lance explicitement seulement pour :

- waitlist / bridge web-admin
- maintenance locale et stockage navigateur
- navigation admin ou drawers si on les modifie directement
- reader pack / reserve editoriale si l'affichage manipule des donnees critiques

Le reste de l'admin est protege par `check:admin`, les tests unitaires et le build.

## Ports De Test

Les tests web servent `dist/web` sur `4174`.

Les tests admin servent `dist/admin` sur `4175` et `dist/web` sur `4176`.

Les ports dev restent separes : web `4321`, admin `4322`.
