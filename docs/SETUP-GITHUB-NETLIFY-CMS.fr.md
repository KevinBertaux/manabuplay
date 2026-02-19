# Guide pas-à-pas : GitHub -> Netlify -> Identity -> Decap CMS

Ce guide part de zéro, jusqu'à un CMS fonctionnel sur `/cms/`.

## 1. Créer le repository GitHub

1. Connecte-toi à GitHub.
2. Clique `New repository`.
3. Nom recommandé: `manabuplay`.
4. Visibilité: `Private` ou `Public` selon ton choix.
5. Ne coche pas `Initialize this repository with a README` si ton projet local existe déjà.
6. Clique `Create repository`.

## 2. Pousser le projet local vers GitHub

Dans le terminal du projet:

```bash
git init
git add .
git commit -m "chore: initial Vue/Vite migration + cms setup"
git branch -M main
git remote add origin https://github.com/<ton-user>/<ton-repo>.git
git push -u origin main
```

Si un remote existe déjà:

```bash
git remote -v
git remote set-url origin https://github.com/<ton-user>/<ton-repo>.git
git push -u origin main
```

## 3. Connecter Netlify au repo GitHub

1. Va sur Netlify.
2. `Add new site` -> `Import an existing project`.
3. Choisis `GitHub`.
4. Autorise Netlify à accéder à ton repo.
5. Sélectionne le repo `manabuplay`.
6. Paramètres de build:
   - `Branch to deploy`: `main`
   - `Build command`: `npm run build`
   - `Publish directory`: `dist`
7. Clique `Deploy site`.

## 4. Vérifier le premier déploiement

1. Ouvre l'URL Netlify fournie.
2. Vérifie que les routes SPA répondent:
   - `/`
   - `/math`
   - `/vocab`
   - zone interne protegee (acces prive)
3. Vérifie que `public/_redirects` est bien pris en compte (`/* /index.html 200`).

## 5. Activer Netlify Identity

1. Netlify -> `Site configuration` -> `Identity`.
2. Clique `Enable Identity`.
3. Dans `Registration preferences`, choisis `Invite only` (recommandé).

## 6. Activer Git Gateway

1. Netlify -> `Identity` -> `Services`.
2. Active `Git Gateway`.

Important:
- Cette étape exige un site connecté en déploiement continu via GitHub/GitLab.
- Si ton site vient d'un drag & drop, Git Gateway ne fonctionne pas.

## 7. Inviter un utilisateur CMS

1. Netlify -> `Identity` -> `Users`.
2. Clique `Invite users`.
3. Entre ton email.
4. Ouvre l'email reçu et finalise ton compte.

## 8. Vérifier la configuration CMS

Vérifie `public/cms/config.yml`:

- `backend.name: git-gateway`
- `backend.branch: main` (ou `master` si ton repo est en master)
- fichiers ciblés:
  - `src/content/vocab/en/fruits.json`
  - `src/content/vocab/en/legumes.json`

## 9. Tester le CMS

1. Ouvre `https://<ton-site>.netlify.app/cms/`.
2. Connecte-toi.
3. Modifie un mot dans `Fruits`.
4. Clique `Publish`.

## 10. Vérifier le cycle complet

1. Dans GitHub, vérifie le commit automatique créé par CMS.
2. Dans Netlify, vérifie qu'un nouveau deploy est lancé.
3. Ouvre `/vocab` après deploy, confirme que la modification apparaît.

## 11. Dépannage rapide

### Message: "Git Gateway requires continuous deployment with GitHub or GitLab"
- Cause: site non connecté à GitHub/GitLab en CD.
- Fix: recréer/reconnecter le site Netlify via `Import from Git`.

### `/cms/` affiche 404
- Vérifie que `public/cms/index.html` existe.
- Refais un deploy.

### Publish CMS ne crée pas de commit
- Vérifie:
  - `Identity` activé
  - `Git Gateway` activé
  - utilisateur connecté et accepté
  - branche `config.yml` correcte

### Les changements CMS n'apparaissent pas sur `/vocab`
- Attendre la fin du redeploy Netlify.
- Verifier qu'aucun override local (zone interne en localStorage) ne masque la source versionnee.

## 12. Bonnes pratiques

1. Utiliser `Invite only` pour limiter l'accès CMS.
2. Sauvegarder une branche stable (`main`) et faire les évolutions en PR.
3. Garder les changements de contenu dans `src/content/...`.
4. Conserver la zone interne pour tests locaux uniquement.



