# Checklist Release - ManabuPlay

Document opérationnel de sortie. Il sert à décider si une branche produit peut passer vers `main`, puis être déployée.

## Périmètre

- branche produit cible : `feat/0.5.0-prep`
- branche de publication : `main`
- la ligne monétisation (`epic/ads-cmp`) suit son propre cycle et ne bloque pas la release produit

## 1. Go / No-Go release

### Produit

- [ ] version cible confirmée
- [ ] périmètre de release figé
- [ ] aucune régression critique ouverte
- [ ] notes de version prêtes

### Technique

- [ ] `npm install` OK
- [ ] `npm run check:breakpoints` OK
- [ ] `npm run check:spacing` OK
- [ ] `npm test` OK
- [ ] `npm run test:e2e` OK
- [ ] `npm test -- --coverage` OK
- [ ] `npm run build` OK

### CI

- [ ] workflow release vert sur la branche cible
- [ ] matrix E2E verte
- [ ] QA Visual Regression vérifiée si le lot la concerne
- [ ] aucun écart de seuil coverage non validé

### Conformité documentaire

- [ ] `README.md` cohérent avec l’état réel du projet
- [ ] hubs `docs/README.fr.md` et `docs/README.en.md` cohérents
- [ ] `ROADMAP.md` cohérent avec les sources JSON
- [ ] pages légales cohérentes avec le comportement réel

## 2. Pré-checks de publication

- [ ] branche de publication confirmée : `main`
- [ ] quota Netlify vérifié juste avant le déploiement
- [ ] crédit disponible >= `15.0`
- [ ] site Netlify non suspendu
- [ ] variables d’environnement de production vérifiées

Si un de ces points est faux : **NO-GO déploiement**.

## 3. Publication

- [ ] merge `feat/0.5.0-prep` -> `main`
- [ ] push final sur `main`
- [ ] déploiement Netlify lancé
- [ ] déploiement Netlify terminé avec succès

## 4. Vérifications post-déploiement

- [ ] accueil accessible
- [ ] hubs Math et Langues accessibles
- [ ] modules publics critiques accessibles et fonctionnels
- [ ] pages légales accessibles
- [ ] favicon / logo / assets critiques OK
- [ ] `ads.txt` accessible si présent dans la release
- [ ] meta site-level attendue présente si concernée

## 5. Post-release

- [ ] tag Git créé
- [ ] notes de version archivées / validées
- [ ] prochaine branche produit planifiée si besoin
