# Checklist QA - ManabuPlay

Document qualité cible. Il sert à préparer et exécuter la validation fonctionnelle et technique avant une release ou un lot sensible.

## 1. Préparation

- [ ] `npm install`
- [ ] `npm run dev`
- [ ] application ouverte sur desktop
- [ ] application ouverte sur mobile ou viewport mobile crédible

## 2. Contrôles automatisés

- [ ] `npm run check:breakpoints`
- [ ] `npm run check:spacing`
- [ ] `npm test`
- [ ] `npm run test:e2e`
- [ ] `npm test -- --coverage`
- [ ] `npm run build`

## 3. Couverture

- [ ] branches >= `70%`
- [ ] functions >= `80%`
- [ ] statements >= `55%`
- [ ] lines >= `55%`
- [ ] règle ratchet only respectée

## 4. Smoke tests produit

### Navigation publique

- [ ] accueil OK
- [ ] hub Math OK
- [ ] hub Langues OK
- [ ] menu responsive OK
- [ ] pages légales OK

### Multiplications

- [ ] aucune table pré-sélectionnée
- [ ] changement de sélection immédiat
- [ ] bonne réponse : score / total / série cohérents
- [ ] mauvaise réponse : feedback cohérent
- [ ] meilleure série persistante
- [ ] clavier et pavé numérique cohérents

### Symétrie

- [ ] sélection et validation cohérentes
- [ ] score / série / meilleure série cohérents
- [ ] passage à la question suivante sans régression UX

### Anglais

- [ ] aucune liste pré-sélectionnée
- [ ] titre et compteur de mots cohérents
- [ ] description de liste cohérente
- [ ] navigation cartes OK
- [ ] révélation traduction OK
- [ ] TTS OK
- [ ] sens de carte OK

## 5. Zone interne

- [ ] accès interne non visible dans le menu public
- [ ] connexion valide -> accès panneau
- [ ] connexion invalide -> message générique cohérent
- [ ] blocage temporaire cohérent
- [ ] expiration de session cohérente
- [ ] édition locale / import / export / copie OK

## 6. Régression transverse

- [ ] aucun crash JS en console
- [ ] rechargement page sans perte inattendue d’état
- [ ] localStorage cohérent
- [ ] responsive cohérent sur les vues critiques
