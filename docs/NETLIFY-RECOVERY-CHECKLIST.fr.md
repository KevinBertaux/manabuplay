# Netlify - Procédure de reprise après incident quota

Annexe incident. Ce document ne remplace pas la checklist release.

## Objectif

Reprendre un déploiement propre après suspension ou tension forte sur le quota Netlify.

## Go / No-Go incident

- [ ] date de reset atteinte si le site a été suspendu
- [ ] site Netlify non marqué comme suspendu
- [ ] crédits disponibles >= `15.0`
- [ ] preuve du quota et du statut relevée avant décision

Si un point est faux : **NO-GO**.

## Contrôles minimaux après reprise

- [ ] page d’accueil répond en `200`
- [ ] assets critiques répondent en `200`
- [ ] modules publics critiques chargent sans erreur majeure
- [ ] pages légales accessibles
- [ ] assets statiques critiques présents (`logo`, favicon, `ads.txt` si concerné)

## Décision

- [ ] décision finale tracée : `GO PROD` ou `NO-GO`
- [ ] cause de l’incident notée dans le suivi de release
- [ ] prochain déploiement planifié avec budget explicite
