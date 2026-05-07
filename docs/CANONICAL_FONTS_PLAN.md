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

## Lot 2 - Tokens Tailwind et shared

- Corriger `tailwind.config.cjs` : `font-body` doit pointer sur `Chakra Petch`.
- Garder `font-pixel` sur `Joystix`.
- Harmoniser `shared/styles/typography.css`, `foundation.css`, `controls.css`, `quiz.css`.

## Lot 3 - App web publique

- Repasser toutes les pages web.
- Supprimer les usages artisanaux de `font-['Joystix',sans-serif]` quand une classe canon suffit.
- S'assurer que romaji, kana et kanji utilisent Chakra Petch sauf vrai titre décoratif.
- Corriger les débordements du panneau mot.

## Lot 4 - App admin

- Repasser layout, nav, pages contenu, packs, backlog, architecture, mockups.
- Supprimer Rajdhani de la page typo ou la limiter à une mention historique non active.
- Retirer les `font-family` inline quand ils concernent ces fontes.

## Lot 5 - Pages design legacy

- Repasser `brand-system`, `fx`, `references/hero`, `references/quiz`.
- Sortir les fontes inline vers CSS/classes propres si nécessaire.
- Aligner ces pages sur la même charte que le reste.

## Lot 6 - Validation visuelle

- Screenshots web : home, quotidien, libre, archives.
- Screenshots admin : accueil, packs, reader pack, architecture, brand system, typo/mockups.
- Relever les régressions visibles : débordements, fonte incorrecte, titre trop pixelisé, texte illisible.

## Lot 7 - Checks finaux

- `npm run check`
- `npm run build:web`
- `npm run build:admin`
- Tests ciblés si impact quiz visible.
- `rg Rajdhani` ne doit plus trouver d'usage rendu.
