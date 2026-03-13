# Regles UI - ManabuPlay

Document de reference UI/UX. Il sert a garder une interface coherente entre les modules eleve, le panneau interne et les evolutions futures.

## 1. Principes

- mobile-first
- interface lisible pour enfant
- composants simples et reutilisables
- contrastes visibles
- hierarchie visuelle nette
- pas d effet decoratif gratuit

## 2. Structure des ecrans eleve

### Ecran standard

1. titre clair
2. bloc de configuration ou de selection
3. bloc d etat / score si necessaire
4. zone d exercice principale
5. actions principales
6. feedback ou aide contextuelle

### Etats obligatoires

- etat vide
- etat actif
- succes
- erreur
- loading si necessaire

## 3. Regles d espacement

- privilegier des valeurs paires
- echelle de base recommandee :
  - `4`
  - `8`
  - `12`
  - `16`
  - `24`
  - `32`
- eviter les valeurs impaires hors cas ponctuel tres justifie
- eviter les valeurs a virgule

## 4. Rayons et formes

- petits controles :
  - `4px` a `8px`
- cartes / panneaux :
  - `8px` a `12px`
- pas de multiplication des gros radius
- les pills restent des exceptions volontaires

## 5. Largeurs et conteneurs

- contenu recentre
- conteneurs stables
- largeur suffisante pour eviter l impression de blocs etroits ou perdus
- pas de reservations vides dans le layout en production

## 6. Couleurs et etats

- actif principal :
  - turquoise / bleu clair de la palette ManabuPlay
- secondaire :
  - violet
- succes :
  - vert lisible
- erreur :
  - rouge doux lisible
- neutre :
  - gris / bleu clair

### Regles

- ne pas utiliser la seule couleur pour transmettre l information
- etat hover plus visible que l etat normal
- focus clavier visible
- ne pas confondre une couleur d etat avec une couleur de priorite projet

## 7. Responsive

### Contrat principal

- mobile : `< 768px`
- tablette / small desktop : `768px` a `1279px`
- desktop large : `>= 1280px`

### Regles

- pas de breakpoints ad-hoc hors exception documentee
- cibles tactiles minimales :
  - `44px`
- pas de fonctionnalite clee inaccessible sur mobile
- si un comportement differe par breakpoint, il doit etre volontaire et documente

## 8. Texte et microcopy

- texte simple
- pas de jargon dans le flux enfant
- consignes courtes
- formulation coherente sur tout le site
- le technique reste dans l aide ou l admin

## 9. Admin

- l admin peut etre plus dense que les modules eleve
- mais il doit rester lisible et hierarchise
- tableaux : privilegier badges, filtres, statuts
- ne pas surcharger avec des boutons decoratifs

## 10. Verification avant merge UI

- [ ] structure de page coherente
- [ ] espacement conforme
- [ ] etats hover / focus / disabled visibles
- [ ] responsive verifie
- [ ] aucun bloc vide ou reserve sans raison
- [ ] labels clairs
- [ ] aucun texte technique inutile dans le parcours enfant

## 11. Relation avec Tailwind

- Tailwind fournit l outillage
- les regles du projet priment sur les classes prises au hasard
- une utilitaire Tailwind n excuse pas une incoherence visuelle

## 12. Evolution future

- passe typographique propre
- tokens de design plus explicites
- harmonisation finale eleve / admin / legal
