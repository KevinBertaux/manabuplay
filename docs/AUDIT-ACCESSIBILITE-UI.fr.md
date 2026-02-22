# Audit UI/Accessibilité - Navigation et Contrastes

Date: 22 février 2026
Version auditée: `0.5.0-prep` (branche `feature/ui-css-foundation`)
Périmètre: site complet, panneau interne inclus

## Objectif
Renforcer la lisibilité des états par défaut, hover, actif et focus sur toute l'interface, avec une base conforme aux bonnes pratiques WCAG et Opquast.

## Références consultées
- WCAG 2.2 (W3C): https://www.w3.org/TR/WCAG22/
- Contrast (Minimum) - Understanding WCAG: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- Non-text Contrast - Understanding WCAG: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- Focus Visible - Understanding WCAG: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
- Use of Color - Understanding WCAG: https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
- Opquast - Checklist qualité numérique: https://checklists.opquast.com/fr/qualite-numerique/
- Exemples de règles Opquast pertinentes (issues de la checklist):
  - Focus visible au clavier
  - Navigation cohérente
  - Éléments actifs distinguables
  - Cible cliquable/tactile de taille suffisante

## Constats initiaux
- Les boutons de navigation ressortaient peu à l'état par défaut.
- Des états actifs utilisaient du texte blanc sur fonds trop clairs (contraste insuffisant).
- Les styles focus n'étaient pas suffisamment homogènes entre les modules.
- Les boutons du panneau admin utilisaient des gradients clairs avec contraste variable.

## Mesures appliquées

### 1) Système de couleurs et états globaux
Fichier: `src/styles/base.css`
- Nouveaux gradients contrastés:
  - primaire: `#0f766e -> #115e59`
  - secondaire: `#5b4ad2 -> #4b3dc5`
  - danger: `#c2410c -> #9f1239`
- États de contrôle plus visibles:
  - fond par défaut contrôles: `--control-bg`
  - fond hover: `--control-bg-hover`
  - bordure visible: `--control-border`
- Anneau focus global: `--focus-ring` avec `outline` explicite.

### 2) Navigation (topbar)
Fichier: `src/styles/base.css`
- État par défaut des boutons `Math` / `Langues` renforcé (bordure + fond + ombre légère).
- État actif visuellement distinct et contrasté.
- Sous-menus avec cartes de liens plus lisibles en défaut/hover/actif.
- Burger harmonisé avec le même système d'états.

### 3) Boutons globaux des modules
Fichier: `src/styles/base.css`
- `mp-btn-primary` / `mp-btn-secondary` alignés sur les nouveaux gradients.
- `mp-feedback-error` aligné sur le gradient danger contrasté.
- Hover/focus/disabled homogénéisés.

### 4) Harmonisation module par module
- `src/views/AdminAccessView.vue`
  - inputs: bordure/focus plus visibles
  - bouton principal: gradient primaire contrasté
- `src/views/AdminView.vue`
  - inputs/select: focus et bordure renforcés
  - boutons primaire/secondaire/danger alignés sur les tokens globaux
- `src/views/MathView.vue`
  - select: état focus renforcé
  - champ réponse: focus visible et cohérent
- `src/views/VocabView.vue`
  - selects: focus renforcé
  - flèches carrousel + bouton mélanger: gradient secondaire contrasté
  - carte retournée: texte foncé sur fond turquoise clair
- `src/views/MathSymmetryView.vue`
  - axe de symétrie renforcé (couleur plus sombre)
  - état sélection des options renforcé
- `src/views/HomeView.vue`
  - cartes: hover/focus visibles et cohérents

## Vérifications effectuées
- Build complet: `npm run build` OK.
- Contrôles de contraste calculés sur les couleurs critiques:
  - nav actif blanc sur teal sombre: >= 5.47:1
  - sous-menu actif blanc sur violet sombre: >= 6.26:1
  - danger blanc sur rouge sombre: >= 5.18:1
  - focus ring bleu sur fond clair: 6.46:1

## Limites restantes (à traiter plus tard)
- Revue accessibilité complète composant par composant (tab order, aria détaillés, messages dynamiques) encore partielle.
- Audit automatique complémentaire recommandé (axe-core / Lighthouse / Playwright a11y checks).
- Vérification manuelle multi-appareils à finaliser (desktop, mobile, lecteurs d'écran).

## Recommandation de suivi
Avant chaque release:
1. Repasser `npm run build`.
2. Vérifier navigation clavier sur toutes les vues.
3. Vérifier contraste des nouveaux composants ajoutés.
4. Bloquer le merge si un état interactif est uniquement distingué par la couleur.

