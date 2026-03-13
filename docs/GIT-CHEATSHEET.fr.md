# Git Cheat Sheet - ManabuPlay

Document court pour garder un workflow Git propre.

## 1. Lignes de travail

### Produit

- `main` = stable / deployable
- `feat/0.5.0-prep` = ligne produit actuelle
- futures lignes produit :
  - `feat/0.6.0-prep`
  - etc.

### Monetisation

- `epic/ads-cmp` = ligne monetisation

## 2. Regle simple

- une feature produit part de la branche produit active
- une feature pub/CMP part de `epic/ads-cmp`
- on ne melange pas les sujets

## 3. Commandes essentielles

```bash
git branch --show-current
git status -sb
git log --oneline --graph --decorate -20
```

## 4. Workflow feature produit

```bash
git checkout feat/0.5.0-prep
git pull
git checkout -b feature/mon-sujet-produit
git push -u origin feature/mon-sujet-produit
```

Puis :

```bash
git add -A
git commit -m "feat(scope): message"
git push
```

## 5. Workflow feature monetisation

```bash
git checkout epic/ads-cmp
git pull
git checkout -b feature/mon-sujet-pub
git push -u origin feature/mon-sujet-pub
```

## 6. Merge

### Produit

```bash
git checkout feat/0.5.0-prep
git pull
git merge --no-ff feature/mon-sujet-produit
git push
```

### Monetisation

```bash
git checkout epic/ads-cmp
git pull
git merge --no-ff feature/mon-sujet-pub
git push
```

## 7. Release

```bash
git checkout main
git pull
git merge --no-ff feat/0.5.0-prep
git push
```

## 8. Anti-bazar

- toujours verifier la branche avant de coder
- pas de commit sans validation du lot
- pas de developpement direct sur `main`
- pas de merge cross-sujet sans raison claire
- garder `ads.txt` et la meta AdSense sur toutes les branches produit actives

## 9. Quand creer une nouvelle branche produit

Quand une version est stabilisee :

```bash
git checkout main
git pull
git checkout -b feat/0.6.0-prep
git push -u origin feat/0.6.0-prep
```
