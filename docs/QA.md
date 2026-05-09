# QA Locale

Objectif : tester assez tot pour eviter les regressions, sans lancer la suite lourde pour une modification qui ne touche pas l'UX.

## Regle De Base

Les E2E sont reserves aux changements qui touchent l'UX/UI visible, la navigation, les formulaires, le stockage navigateur, le bridge web/admin, le responsive ou une integration navigateur.

Pour les donnees, le scoring, le catalogue, les packs, les helpers TypeScript et la logique shared, utiliser d'abord les tests standards : unit tests cibles, `check:web`, `check:admin` ou `check`.

## Niveaux

| Niveau      | Quand                                     | Commande                     |
| ----------- | ----------------------------------------- | ---------------------------- |
| Light web   | Modif web non UI ou controle rapide       | `npm run verify:web:light`   |
| Light admin | Modif admin non UI ou controle rapide     | `npm run verify:admin:light` |
| Quick repo  | Lint + format sans Astro check complet    | `npm run check:quick`        |
| Pre-push    | Hook adaptatif selon fichiers pousses     | `npm run check:pre-push`     |
| E2E web     | UX/UI web, navigation web, responsive web | `npm run verify:web:e2e`     |
| E2E admin   | UX/UI admin, navigation admin, dashboard  | `npm run verify:admin:e2e`   |
| Bridge      | Waitlist, localStorage, bridge web/admin  | `npm run verify:bridge`      |
| Merge       | Avant merge ou gros lot sensible          | `npm run verify:merge`       |

## Matrice D'Impact

| Changement                 | Pendant dev                                                | Avant push                                | Avant merge            |
| -------------------------- | ---------------------------------------------------------- | ----------------------------------------- | ---------------------- |
| Donnees, packs, catalogue  | Unit tests cibles                                          | `npm run check` + unit tests cibles       | `npm run verify:merge` |
| Logique `shared`           | Unit tests cibles                                          | `npm run check` + unit tests cibles       | `npm run verify:merge` |
| Astro sans impact visuel   | `npm run verify:web:light` ou `npm run verify:admin:light` | `npm run check`                           | `npm run verify:merge` |
| UX/UI web                  | E2E web cible                                              | `npm run check` + E2E cible               | `npm run verify:merge` |
| UX/UI admin                | E2E admin cible                                            | `npm run check` + E2E cible               | `npm run verify:merge` |
| Bridge, waitlist, stockage | `npm run verify:bridge`                                    | `npm run check` + `npm run verify:bridge` | `npm run verify:merge` |
| CSS, layout, responsive    | E2E ou screenshot cible                                    | `npm run check` + E2E cible               | `npm run verify:merge` |

## Lab FX

Le FX Lab reste consultable pour du reglage interne, mais il n'est plus un contrat bloquant de
transition MVP vers Astro. Les checks de CI ne doivent pas dependre de `test:fx-lab` ni de
`test:fx-lab-iso` tant que les pages de reference ne sont pas explicitement recadrees comme source
ISO maintenue.

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

## Ports De Test

Les tests web servent `dist/web` sur `4174`.

Les tests admin servent `dist/admin` sur `4175` et `dist/web` sur `4176`.

Les ports dev restent separes : web `4321`, admin `4322`. Les E2E admin ne doivent plus obliger a tuer le serveur admin local.
