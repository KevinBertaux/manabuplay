# Plan canonical fonts ManabuPlay

Date : 2026-05-07

## Règle canon

- Joystix : titres courts, logo, signature arcade, accents de marque.
- Chakra Petch : corps, romaji, kana, kanji, boutons, hints, réponses, admin, docs produit.
- Rajdhani : supprimée du rendu produit. Elle peut rester uniquement comme mention historique dans une page de décision, si elle n'est pas chargée ni utilisée comme fonte active.

## Lot 1 - Inventaire et garde-fou

- Lister toutes les occurrences `Rajdhani`, `font-family`, `font-body`, `font-pixel`, imports Google Fonts.
- Ajouter un check qui échoue si `Rajdhani` revient dans du code rendu.
- Clarifier dans l'admin la règle Joystix / Chakra Petch.

Statut :

- Fait sur `main` avant cette branche : `tailwind.config.cjs` mappe déjà `font-body` sur Chakra Petch, et le panneau quiz public utilise Chakra Petch pour romaji, kana et kanji.
- Fait au lot 1 : ajout du check `npm run check:canonical-fonts`, intégré à `npm run check`.
- Fait au lot 2 : la page Typo ne charge plus l'ancienne candidate rejetée ; elle compare uniquement Chakra Petch et Joystix. Le check `check:canonical-fonts` n'a plus d'allowlist temporaire.

## Lot 2 - Tokens Tailwind et shared

- Corriger `tailwind.config.cjs` : `font-body` doit pointer sur `Chakra Petch`.
- Garder `font-pixel` sur `Joystix`.
- Harmoniser `shared/styles/typography.css`, `foundation.css`, `controls.css`, `quiz.css`.

Statut :

- Fait avant cette branche : Tailwind et shared pointent déjà sur Chakra Petch / Joystix.
- Fait au lot 2 : page Typo alignée sur les deux fontes canon, import Google réduit à Chakra Petch, garde-fou Rajdhani durci sans exception temporaire.

## Lot 3 - App web publique

- Repasser toutes les pages web.
- Supprimer les usages artisanaux de `font-['Joystix',sans-serif]` quand une classe canon suffit.
- S'assurer que romaji, kana et kanji utilisent Chakra Petch sauf vrai titre décoratif.
- Corriger les débordements du panneau mot.

Statut :

- Fait au lot 3 : les wordmarks web utilisent maintenant `font-pixel` au lieu de classes Tailwind artisanales.
- Vérifié au lot 3 : plus aucun `font-['...']` dans `apps/web/src` et `shared/styles`.
- Vérifié au lot 3 : le quiz quotidien affiche romaji, kana et kanji en Chakra Petch sans débordement horizontal sur le cas testé.

## Lot 4 - App admin

- Repasser layout, nav, pages contenu, packs, backlog, architecture, mockups.
- Supprimer Rajdhani de la page typo ou la limiter à une mention historique non active.
- Retirer les `font-family` inline quand ils concernent ces fontes.

Statut :

- Fait au lot 4 : ajout des variables canoniques `--font-body` et `--font-pixel` dans `shared/styles/foundation.css`.
- Fait au lot 4 : les `font-family` explicites de `admin-pages.css` utilisent les variables canoniques au lieu de répéter les familles.
- Fait au lot 4 : les mockups actifs `quiz-chantiers` et `tier-breakdown` s'appuient sur `--font-body`.
- Traité au lot 5 : les pages design legacy `brand-system`, `references/hero` et `references/quiz` ont été alignées sur les variables canoniques.

## Lot 5 - Pages design legacy

- Repasser `brand-system`, `references/hero`, `references/quiz`.
- Sortir les fontes inline vers CSS/classes propres si nécessaire.
- Aligner ces pages sur la même charte que le reste.

Statut :

- Fait au lot 5 : `brand-system` ne charge plus ses propres imports Google Fonts ni son propre `@font-face` Joystix.
- Fait au lot 5 : les alias legacy `--brand` et `--ui` pointent maintenant vers `--font-pixel` et `--font-body`.
- Fait au lot 5 : les wordmarks des références `hero` et `quiz` utilisent `font-pixel` au lieu d'un `font-family` inline.
- Vérifié au lot 5 : plus de `font-family` inline ni de définition locale de fonte dans les quatre pages legacy ciblées.

## Lot 6 - Validation visuelle

- Screenshots web : home, quotidien, libre, archives.
- Screenshots admin : accueil, packs, reader pack, architecture, brand system, typo/mockups.
- Relever les régressions visibles : débordements, fonte incorrecte, titre trop pixelisé, texte illisible.

Statut :

- Fait au lot 6 : build complet web + admin, puis captures depuis `dist/web` et `dist/admin`.
- Fait au lot 6 : captures générées dans `tmp/canonical-fonts-lot6`.
- Vérifié au lot 6 : pas de débordement horizontal détecté sur les pages capturées.
- Vérifié au lot 6 : le corps reste en Chakra Petch, les wordmarks/titres courts restent en Joystix via `font-pixel`.
- Relevé au lot 6 : aucune régression visuelle bloquante liée aux fontes canoniques sur les pages auditées.

## Lot 7 - Checks finaux

- `npm run check`
- `npm run build:web`
- `npm run build:admin`
- Tests ciblés si impact quiz visible.
- `rg Rajdhani` ne doit plus trouver d'usage rendu.

Statut :

- Fait au lot 7 : `npm run build:web` et `npm run build:admin` passent.
- Fait au lot 7 : `npm run check` passe.
- Fait au lot 7 : `npm run test:e2e:ui-guards` passe, soit 2 tests web et 4 tests admin.
- Vérifié au lot 7 : aucun `Rajdhani` dans `apps`, `shared` ou `tailwind.config.cjs`.
- Vérifié au lot 7 : aucune classe artisanale `font-['...']` dans `apps` ou `shared`.
