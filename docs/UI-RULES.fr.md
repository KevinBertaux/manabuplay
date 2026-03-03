# Charte UI/UX V1 (Modules)

## Objectif
Avoir une interface homogène entre les modules (Math, Langues, suivants) avec des regles simples et reutilisables.

## Structure standard d'un module
1. Titre du module (`h1`).
2. Panneau d'information (score, serie, etat) sur une ligne, compact.
3. Zone d'exercice principale (flashcard, QCM, grille, etc.).
4. Zone d'actions (Verifier, Suivant, Melanger, etc.).
5. Feedback (correct / incorrect / message utile).

## Regles de mise en page
- Echelle d'espacement: `8 / 12 / 16 / 24 px` uniquement.
- Largeur module: centree, max stable (`~760-820px` selon besoin module).
- Radius:
  - controles petits: `8-10px`
  - panneaux/cartes: `12-14px`
- Eviter les blocs trop hauts qui obligent a scroller avant l'action principale.

## Regles de composants
- Bouton primaire: palette turquoise (gradient autorise).
- Bouton secondaire: palette violette (gradient autorise).
- Etats de bouton obligatoires: normal, hover, disabled.
- Feedback:
  - succes: vert/turquoise
  - erreur: rouge doux
- Etat vide obligatoire (ex: "Choisir une liste pour commencer").

## Regles de texte
- Texte court, lisible pour enfant.
- Verbes conjugues et consignes claires.
- Pas de jargon technique dans le flux principal.
- Les aides techniques (raccourcis clavier, details) restent secondaires.

## Regles responsive
- Contrat unique (mobile-first) base sur Tailwind:
  - Mobile: `<= 767px`
  - Tablette: `768px -> 1023px`
  - Desktop: `>= 1024px`
- Cibles tactiles min: `44px`.
- Navigation et actions accessibles sans zoom.
- Eviter tout breakpoint ad-hoc (ex: 700, 820, 860) hors cas exceptionnel documente.
- Guardrail obligatoire: `npm run check:breakpoints` doit rester vert.

## Regles accessibilite minimales
- Chaque controle a un label explicite.
- Focus visible clavier sur boutons/liens/champs.
- Contraste texte/fond suffisant.
- Les erreurs doivent etre comprehensibles sans code technique.

## Palette d'etats recommandee
- Actif: turquoise
- Secondaire: violet
- Succes: vert
- Erreur: rouge
- Neutre: gris/bleu clair

## Checklist pre-merge UI
- [ ] Structure module en 5 blocs respectee.
- [ ] Espacements conformes (8/12/16/24).
- [ ] Boutons primaire/secondaire conformes.
- [ ] Etat vide present.
- [ ] Feedback succes/erreur present.
- [ ] Responsive mobile valide (1 colonne + cibles 44px).
- [ ] Focus clavier visible et labels presents.
- [ ] Aucun texte technique expose a l'enfant dans le flux principal.

## Evolution prevue (V2)
- Extraire des composants UI communs:
  1. `ModuleHeaderStats`
  2. `ModuleActions`
  3. `ModuleFeedback`
- Documenter des tokens de design (couleurs, radius, espacements) dans un fichier dedie.
