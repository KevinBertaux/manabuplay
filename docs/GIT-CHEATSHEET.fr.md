# Git Cheat Sheet (ManabuPlay)

Objectif: eviter le bazar en travaillant avec des branches courtes et claires.

## Regle simple

- `main` = branche stable.
- `feat/0.4.0-prep` = branche de preparation release.
- `feat/<sujet>` = une branche par sujet (ex: `feat/studio-security-v2`).

## Commandes essentielles

```bash
# Voir l'etat courant
git branch --show-current
git status -sb

# Se mettre a jour
git checkout <branche>
git pull

# Creer une branche de travail
git checkout -b feat/<nom>
git push -u origin feat/<nom>

# Commit
git add -A
git commit -m "feat(scope): message"

# Historique visuel
git log --oneline --graph --decorate -20
```

## Workflow recommande

```bash
# 1) partir de la base release
git checkout feat/0.4.0-prep
git pull

# 2) creer la branche feature
git checkout -b feat/studio-security-v2

# 3) coder + commits
git add -A
git commit -m "feat(security): ..."

# 4) publier la branche
git push -u origin feat/studio-security-v2

# 5) merger dans la branche release
git checkout feat/0.4.0-prep
git pull
git merge --no-ff feat/studio-security-v2
git push
```

## Schema mental rapide

```text
main:                A---B
                        \
feat/0.4.0-prep:         C---D---E
                              \
feat/studio-security-v2:        F---G
```

## Anti-bazar

- Toujours verifier la branche avant commit.
- Un sujet = une branche.
- Commits petits et explicites.
- Ne pas developper directement sur `main`.

