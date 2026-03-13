# Règles UI - ManabuPlay

Document de référence UI/UX. Il sert à garder une interface cohérente entre les modules élève, le panneau interne et les évolutions futures.

## 1. Principes

- mobile-first
- interface lisible pour enfant
- composants simples et réutilisables
- contrastes visibles
- hiérarchie visuelle nette
- pas d’effet décoratif gratuit

## 2. Structure des écrans élève

### Écran standard

1. titre clair
2. bloc de configuration ou de sélection
3. bloc d’état / score si nécessaire
4. zone d’exercice principale
5. actions principales
6. feedback ou aide contextuelle

### États obligatoires

- état vide
- état actif
- succès
- erreur
- loading si nécessaire

## 3. Règles d’espacement

- privilégier des valeurs paires
- échelle de base recommandée :
  - `4`
  - `8`
  - `12`
  - `16`
  - `24`
  - `32`
- éviter les valeurs impaires hors cas ponctuel très justifié
- éviter les valeurs à virgule

## 4. Rayons et formes

- petits contrôles :
  - `4px` à `8px`
- cartes / panneaux :
  - `8px` à `12px`
- pas de multiplication des gros radius
- les pills restent des exceptions volontaires

## 5. Largeurs et conteneurs

- contenu recentré
- conteneurs stables
- largeur suffisante pour éviter l’impression de blocs étroits ou perdus
- pas de réservations vides dans le layout en production

## 6. Couleurs et états

- actif principal :
  - turquoise / bleu clair de la palette ManabuPlay
- secondaire :
  - violet
- succès :
  - vert lisible
- erreur :
  - rouge doux lisible
- neutre :
  - gris / bleu clair

### Règles

- ne pas utiliser la seule couleur pour transmettre l’information
- état hover plus visible que l’état normal
- focus clavier visible
- ne pas confondre une couleur d’état avec une couleur de priorité projet

## 7. Responsive

### Contrat principal

- mobile : `< 768px`
- tablette / small desktop : `768px` à `1279px`
- desktop large : `>= 1280px`

### Règles

- pas de breakpoints ad-hoc hors exception documentée
- cibles tactiles minimales :
  - `44px`
- pas de fonctionnalité clé inaccessible sur mobile
- si un comportement diffère par breakpoint, il doit être volontaire et documenté

## 8. Texte et microcopy

- texte simple
- pas de jargon dans le flux enfant
- consignes courtes
- formulation cohérente sur tout le site
- le technique reste dans l’aide ou l’admin

## 9. Admin

- l’admin peut être plus dense que les modules élève
- mais il doit rester lisible et hiérarchisé
- tableaux : privilégier badges, filtres, statuts
- ne pas surcharger avec des boutons décoratifs

## 10. Vérification avant merge UI

- [ ] structure de page cohérente
- [ ] espacement conforme
- [ ] états hover / focus / disabled visibles
- [ ] responsive vérifié
- [ ] aucun bloc vide ou réservé sans raison
- [ ] labels clairs
- [ ] aucun texte technique inutile dans le parcours enfant

## 11. Relation avec Tailwind

- Tailwind fournit l’outillage
- les règles du projet priment sur les classes prises au hasard
- une utilitaire Tailwind n’excuse pas une incohérence visuelle

## 12. Évolution future

- passe typographique propre
- tokens de design plus explicites
- harmonisation finale élève / admin / legal
