# Règles UI - ManabuPlay

Document de référence pour garder une interface cohérente, compacte et lisible.

## 1. Direction générale

- interface plus rectangle que ronde
- densité visuelle maîtrisée
- pas de rendu mou type Bootstrap générique
- les effets servent l'ambiance, pas l'inverse

## 2. Règles de géométrie

Les règles ci-dessous sont pensées pour les valeurs fixes en `px`.

| Groupe         | Propriétés                                                                                        | Règle CI                              | Règle de conversion                                                        |
| -------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| `spacing`      | `margin*`, `padding*`, `gap`, `row-gap`, `column-gap`, `top`, `right`, `bottom`, `left`, `inset*` | `px` entier pair                      | arrondir au pair inférieur                                                 |
| `sizes`        | `width`, `height`, `min/max-width`, `min/max-height`, `inline/block-size`                         | `px` entier pair                      | arrondir au pair le plus proche                                            |
| `font-size px` | `font-size` quand la valeur est fixe en `px`                                                      | `px` entier pair                      | arrondir au pair supérieur                                                 |
| `radius`       | `border-radius*`                                                                                  | seulement `0 / 4 / 8 / 12 / 16 / 999` | prendre la valeur autorisée la plus proche, `999` seulement pour les pills |
| `border`       | `border-width*`, `outline-width`                                                                  | entier, pair ou impair autorisé       | inchangé si cohérent                                                       |

## 3. Typographie

- `font-size` fixe en `px` : pair obligatoire
- `line-height` : préférer une valeur unitless
- `letter-spacing` : exempt du guard
- `word-spacing` : exempt du guard
- `rem`, `em`, `%`, `clamp()` restent recommandés quand ils sont plus cohérents que du `px`

## 4. Effets visuels

Les propriétés optiques sont exemptées du guard géométrique :

- `box-shadow`
- `text-shadow`
- `filter`
- `backdrop-filter`
- `transform`
- `background-size`
- `background-position`
- `stroke-width`
- variables `--fx-*`

Règle pratique :

- layout strict
- optique plus souple

## 5. Largeurs et hauteurs HTML

Les attributs HTML fixes `width` et `height` doivent rester des entiers pairs.

## 6. Exceptions

- `legacy/` n'est pas concerné
- les pills peuvent utiliser `999px`
- un effet visuel peut utiliser des valeurs impaires ou à virgule si cela améliore réellement le rendu

## 7. Vérification avant push

- [ ] `npm run check:px-values`
- [ ] pas de nouvelle valeur fixe impaire ou décimale dans le layout
- [ ] aucun radius hors échelle autorisée
- [ ] les changements FX n'impactent pas la géométrie du produit
