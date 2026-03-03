# Checklist QA V2

## Préparation

1. Lancer `npm install`
2. Lancer `npm run dev`
3. Ouvrir l'app sur desktop et mobile

## Smoke tests

1. Navigation:
   - Vérifier les routes `/`, `/math`, `/math/multiplications`, `/math/symmetry`, `/languages`, `/languages/english`
   - Vérifier menu burger sur mobile
2. Build:
   - Exécuter `npm run build` sans erreur
3. Tests:
   - Exécuter `npm run check:breakpoints` sans échec
   - Exécuter `npm test` sans échec
   - Exécuter `npm run test:e2e` sans échec
   - Exécuter `npm run qa:release` pour la passe automatisée complète release (hors snapshots visuels)
   - Lancer le workflow GitHub `QA Visual Regression` (mode `check`) pour les snapshots Playwright `desktop-chromium`
4. Couverture:
   - Exécuter `npm test -- --coverage`
   - Seuils minimaux (Vitest):
     - Branches >= 70%
     - Functions >= 80%
     - Statements >= 55%
     - Lines >= 55%
   - Règle ratchet only:
     - Ne jamais baisser les seuils dans la config
     - Ne jamais accepter une baisse de couverture globale sans justification explicite et ticket de suivi

## Math (`/math/multiplications`)

1. Vérifier qu'aucune table n'est sélectionnée par défaut
2. Changer de table et vérifier mise à jour immédiate de la question
3. Réponse correcte:
   - Score +1
   - Total +1
   - Série +1
4. Réponse incorrecte:
   - Score inchangé
   - Total +1
   - Série remise à 0
5. Réponse négative:
   - Message d'erreur
   - Total inchangé
6. Maintenir `Entrée`:
   - Pas de multi-incrément du score
7. Vérifier meilleure série:
   - Persistante au rechargement (localStorage)

## Anglais (`/languages/english`)

1. Vérifier qu'aucune liste n'est sélectionnée par défaut
2. Dropdown listes:
   - Affiche `Titre (xx mots)`
   - Nombre mis à jour si la liste est modifiée localement
3. Description de liste:
   - Visible et cohérente avec la liste choisie
4. Navigation cartes:
   - Flèches gauche/droite fonctionnent
   - `ArrowLeft`/`ArrowRight` changent de carte
   - Swipe mobile = un seul changement par geste
5. Flip carte:
   - Affiche/masque traduction correctement
6. TTS:
   - Bouton haut-parleur fonctionne (lecture/stop)
   - en-US forcé (pas de sélecteur d'accent visible)
   - Alternance vitesse au clic: `0.9x` puis `0.6x`
   - Cycle réinitialisé à `0.9x` quand la carte change
   - En mode FR -> EN, bouton TTS masqué avant révélation
7. Sens de carte:
   - Anglais -> Français
   - Français -> Anglais

## Zone interne (`/-/studio-ops`)

1. Connexion avec identifiants valides -> accès panel
2. Identifiants invalides:
   - Message générique
   - Affichage tentatives restantes
3. Blocage:
   - 3 échecs => blocage temporaire
   - Champs et bouton désactivés pendant blocage
4. Session:
   - Expiration de session => redirection login
5. Édition listes:
   - Dropdown affiche `Titre (xx mots)`
   - Import JSON valide/invalide
   - Copie JSON / téléchargement JSON
   - Sauvegarde locale visible dans `/languages/english`

## Régression

1. Recharger la page:
   - Sens de carte conservé
   - Overrides localStorage conservés
2. Vérifier qu'aucune erreur JS n'apparait dans la console
