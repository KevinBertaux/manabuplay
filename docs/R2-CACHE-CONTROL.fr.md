# Cache-Control R2 (ManabuPlay)

## Objectif
Configurer des headers de cache cohérents sur Cloudflare R2 pour:
- mettre à jour rapidement la liste des fichiers (`manifest.json`)
- limiter les requêtes inutiles sur les listes de mots
- éviter les incohérences entre versions

## Arborescence cible
- `en/manifest.json`
- `en/*.json` (listes de vocabulaire)
- `es/manifest.json` (préparation)

## Valeurs recommandées
- `manifest.json`: `Cache-Control: public, max-age=60`
- fichiers de listes (`en/*.json`, `es/*.json`): `Cache-Control: public, max-age=3600`

Pourquoi:
- `manifest.json` doit être rafraîchi vite (1 minute) car il référence l’état courant.
- Les listes peuvent rester en cache plus longtemps (1 heure) sans gêner la mise à jour.

## Mise en place dans Cloudflare R2
1. Ouvrir le bucket R2.
2. Pour chaque objet, définir le metadata `Cache-Control`.
3. Appliquer:
- `en/manifest.json` et `es/manifest.json` -> `public, max-age=60`
- autres JSON (`en/*.json`, `es/*.json`) -> `public, max-age=3600`
4. Sauvegarder.

## Process de mise à jour contenu
1. Modifier/ajouter les JSON localement.
2. Uploader les fichiers JSON vers R2.
3. Mettre à jour `manifest.json` (liste des `{ key, file }`).
4. Réuploader `manifest.json`.
5. Attendre ~60s max pour propagation naturelle du manifest.

## Vérification rapide
Tester les URLs:
- `https://<r2-base>/en/manifest.json`
- `https://<r2-base>/en/<fichier>.json`

Contrôler:
- HTTP `200`
- contenu JSON valide
- header `Cache-Control` attendu

## Dépannage
- Manifest non à jour:
  - vérifier upload du bon fichier
  - vérifier `Cache-Control` du manifest (max-age trop long)
- Liste manquante:
  - vérifier qu’elle est présente dans `manifest.json`
  - vérifier le nom exact du fichier (casse incluse)
- Différence local / distant:
  - la fallback locale peut masquer une erreur distante: vérifier les URLs R2 directement
