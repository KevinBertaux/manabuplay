# Protection secrets avec ggshield (GitGuardian)

## Ce qui est en place

- Workflow GitHub Actions: `.github/workflows/ggshield.yml`
- Scan automatique sur `push` et `pull_request`

## Configuration obligatoire (1 fois)

1. Creer une API key GitGuardian (dashboard GitGuardian).
2. Ouvrir GitHub > Repo > Settings > Secrets and variables > Actions.
3. Ajouter un secret nomme `GITGUARDIAN_API_KEY`.
4. Pousser un commit pour verifier que le job passe.

## Option locale (recommandee)

Si `ggshield` est installe en local, activer le hook Git:

```bash
ggshield auth login
ggshield install -m local
```

Ensuite, chaque commit sera scanne avant creation.

## Notes

- `.env` doit rester ignore par Git.
- `.env.example` ne doit contenir que des placeholders.
- Un secret detecte doit etre immediatement revoque/regenere.
