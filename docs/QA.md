# QA Locale

Objectif : tester assez tot pour eviter les regressions, sans lancer la suite lourde pour une modification qui ne touche pas l'UX.

## Regle De Base

Les E2E sont reserves aux changements qui touchent l'UX/UI visible, la navigation, les formulaires, le stockage navigateur, le bridge web/admin, le responsive ou une integration navigateur.

Par défaut, l'admin ne déclenche plus de grosse QA Playwright bloquante. C'est un outil interne : on garde `check:admin`, lint, format, build et unit tests, puis on lance Playwright admin seulement quand la modification touche une interaction admin critique.

Pour les donnees, le scoring, le catalogue, les packs, les helpers TypeScript et la logique shared, utiliser d'abord les tests standards : unit tests cibles, `check:web`, `check:admin` ou `check`.

## Niveaux

| Niveau      | Quand                                           | Commande                     |
| ----------- | ----------------------------------------------- | ---------------------------- |
| Light web   | Modif web non UI ou controle rapide             | `npm run verify:web:light`   |
| Light admin | Modif admin non UI ou controle rapide           | `npm run verify:admin:light` |
| Quick repo  | Lint + format sans Astro check complet          | `npm run check:quick`        |
| Pre-push    | Hook adaptatif selon fichiers pousses           | `npm run check:pre-push`     |
| E2E web     | UX/UI web, navigation web, responsive web       | `npm run verify:web:e2e`     |
| E2E admin   | Manuel, seulement si interaction admin critique | `npm run verify:admin:e2e`   |
| Bridge      | Waitlist, localStorage, bridge web/admin        | `npm run verify:bridge`      |
| Merge       | Avant merge ou gros lot sensible                | `npm run verify:merge`       |

## Matrice D'Impact

| Changement                 | Pendant dev                                                                     | Avant push                                | Avant merge            |
| -------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------- |
| Donnees, packs, catalogue  | Unit tests cibles                                                               | `npm run check` + unit tests cibles       | `npm run verify:merge` |
| Logique `shared`           | Unit tests cibles                                                               | `npm run check` + unit tests cibles       | `npm run verify:merge` |
| Astro sans impact visuel   | `npm run verify:web:light` ou `npm run verify:admin:light`                      | `npm run check`                           | `npm run verify:merge` |
| UX/UI web                  | E2E web cible                                                                   | `npm run check` + E2E cible               | `npm run verify:merge` |
| UX/UI admin                | `npm run verify:admin:light`, E2E admin cible seulement si interaction critique | `npm run check`                           | `npm run verify:merge` |
| Bridge, waitlist, stockage | `npm run verify:bridge`                                                         | `npm run check` + `npm run verify:bridge` | `npm run verify:merge` |
| CSS, layout, responsive    | E2E ou screenshot cible                                                         | `npm run check` + E2E cible               | `npm run verify:merge` |

## Pre-Push Adaptatif

Le hook versionne dans `.githooks/pre-push` appelle `scripts/check-pre-push.mjs`.

Il lit les fichiers reellement pousses :

| Impact detecte                          | Validation pre-push                                                     |
| --------------------------------------- | ----------------------------------------------------------------------- |
| Docs uniquement                         | `npm run check:quick`                                                   |
| Web uniquement                          | `npm run check:web` + `npm run check:quick` + audits inline/canonical   |
| Admin uniquement                        | `npm run check:admin` + `npm run check:quick` + audits inline/canonical |
| `shared`, scripts, config, hooks, mixte | `npm run check`                                                         |

Le hook reste volontairement plus leger qu'un `verify:merge`. Les E2E restent a lancer explicitement quand le lot touche l'UX/UI, la navigation, le stockage navigateur ou le responsive.

Pour l'admin seul, le pre-push ne lance plus l'audit inline global. Le garde-fou inline strict est maintenant public : `apps/web/src` doit rester a zero inline via `npm run check:web-inline-zero`.

## Ports De Test

Les tests web servent `dist/web` sur `4174`.

Les tests admin servent `dist/admin` sur `4175` et `dist/web` sur `4176`.

Les ports dev restent separes : web `4321`, admin `4322`. Les E2E admin ne doivent plus obliger a tuer le serveur admin local.

## Admin Playwright

Playwright admin reste disponible, mais n'est plus appele par `check:feature`, `qa:release` ni `verify:merge`.

On le lance explicitement seulement pour :

- waitlist / bridge web-admin
- maintenance locale et stockage navigateur
- navigation admin ou drawers si on les modifie directement
- reader pack / reserve editoriale si l'affichage manipule des donnees critiques

Le reste de l'admin est protege par `check:admin`, les tests unitaires et le build.
