# Checklist QA V1

## Préparation

1. Lancer `npm install`
2. Lancer `npm run dev`
3. Ouvrir l'app sur desktop et mobile

## Smoke tests

1. Navigation:
   - Vérifier les routes `/`, `/math`, `/vocab`
   - Vérifier menu burger sur mobile
2. Build:
   - Exécuter `npm run build` sans erreur
3. Tests:
   - Exécuter `npm test` sans échec

## Math (`/math`)

1. Changer de table et vérifier mise à jour immédiate de la question
2. Réponse correcte:
   - Score +1
   - Total +1
   - Streak +1
3. Réponse incorrecte:
   - Score inchangé
   - Total +1
   - Streak remis à 0
4. Réponse négative:
   - Message d'erreur
   - Total inchangé
5. Maintenir `Entrée`:
   - Pas de multi-incrément du score

## Vocab (`/vocab`)

1. Flèches carrousel:
   - Gauche/droite fonctionnent
2. Clavier:
   - `ArrowLeft`/`ArrowRight` changent de carte
3. Swipe mobile:
   - Un seul changement par geste horizontal
4. Flip carte:
   - Affiche/masque traduction correctement
5. TTS:
   - Bouton play/stop fonctionne
   - Changement accent US/UK pris en compte
   - Pas de message parasite lors d'interruption volontaire

## Zone interne (acces restreint)

1. Acceder a la zone interne avec identifiants puis modifier une liste et sauvegarder (local)
2. Vérifier immédiatement le résultat dans `/vocab`
3. Tester import JSON valide/invalide
4. Tester copie JSON et téléchargement JSON
5. Réinitialiser la liste (retour défaut)

## CMS (`/cms/`) - si activé sur Netlify

1. Connexion Netlify Identity
2. Édition d'une liste (fruits/légumes)
3. Publication (commit Git auto)
4. Vérifier que `/vocab` reflète le contenu après redeploy

## ✅ Checklist Activation Netlify Identity + Decap CMS

- [ ] `Identity` activé dans Netlify  
      `Site configuration > Identity > Enable Identity`

- [ ] Inscription sécurisée configurée  
      `Registration preferences = Invite only`

- [ ] `Git Gateway` activé  
      `Identity > Services > Enable Git Gateway`

- [ ] Utilisateur invité et accepté  
      `Identity > Users > Invite users` puis acceptation email

- [ ] Branche CMS correcte dans `public/cms/config.yml`  
      `backend.branch` correspond à la branche par défaut du repo (`main` ou `master`)

- [ ] Accès CMS fonctionnel  
      Ouverture de `/cms/` et connexion réussie

- [ ] Édition test effectuée  
      Modification d'un mot dans une liste (ex: Fruits), puis `Publish`

- [ ] Commit automatique vérifié dans le repo Git  
      Un commit CMS est bien créé

- [ ] Déploiement Netlify déclenché  
      Un nouveau déploiement apparaît dans `Deploys`

- [ ] Donnée visible côté application  
      La modification apparaît sur `/vocab` après le redeploy

- [ ] Test retour arrière validé  
      Re-modification via CMS, re-publication, et vérification du nouveau résultat

- [ ] Contrôle d'accès validé  
      En navigation privée, `/cms/` demande bien une authentification

## Régression

1. Recharger la page:
   - Accent TTS conservé
   - Overrides admin conservés (localStorage)
2. Vérifier qu'aucune erreur JS n'apparaît dans la console


