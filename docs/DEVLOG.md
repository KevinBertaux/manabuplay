# DEVLOG — ManabuPlay 🇯🇵
**Vision :** apprendre le japonais via la pop culture anime, manga et gaming.

---

## v0.1 — Base produit

### Fait
- [x] Le MVP est porté sur Astro.
- [x] Tailwind CSS v4 en place.
- [x] HTML / CSS / JS séparés.
- [x] Le rendu Astro est aligné sur le MVP legacy.
- [x] 50 mots de base en JP / EN / FR.
- [x] 4 niveaux de difficulté + bascule EN / FR.
- [x] localStorage pour les meilleurs scores.
- [x] Reveal Hint + feedback visuel + particules.
- [x] Polices locales.
- [x] Charte graphique + FX Lab dans `docs/`.
- [x] Règles UI et garde-fous visuels outillés.

### Socle technique retenu
- [x] Catalogue évolutif basé sur `words`, `packs`, `packEntries`, `releases`.
- [x] Les packs peuvent partager les mêmes mots sans duplication.
- [x] `meaning` court + `explanation` plus riche.
- [x] 2 hints max par mot / pack.

### À finir avant une vraie 0.1
- [ ] Passer réellement à 2 polices max sur le site.
  `Joystix` pour la marque, `Chakra Petch` pour le produit.
- [ ] Refaire une grosse passe de wording sur la landing page.
- [ ] Revoir le placement de certains éléments de la landing page.
- [ ] Intégrer les métriques produit et marketing essentielles.
- [ ] Choisir la langue locale par défaut si elle est disponible.
- [ ] Garantir une vraie qualité mobile first.
- [ ] Découper la home en sections / composants propres.
- [ ] Corriger les bugs restants du MVP.
- [ ] Brancher visiblement les 2 hints dans l'interface.
- [ ] Ajouter le score dépendant des hints.
- [ ] Ajouter le TTS au clic.
- [ ] Stabiliser le formulaire waitlist pour le déploiement cible.
- [ ] Faire une vraie passe QA + tests + Playwright avant la prod.
- [ ] Préparer la branche de prod et la sortie `v0.1.0`.

---

## v0.2 — Rétention
- [ ] Streak quotidien.
- [ ] Partage social du score.
- [ ] OG images statiques.
- [ ] Audit responsive petits écrans.

---

## v0.3 — SEO Packs
- [ ] Routes `/{locale}/pack/[slug]`.
- [ ] Premiers vrais packs SEO FR / EN.
- [ ] Maillage interne entre packs.
- [ ] Schéma JSON-LD + sitemap.
- [ ] Monter le catalogue au-delà des 50 mots.

---

## v0.4 — Gamification
- [ ] Badges.
- [ ] Profil léger.
- [ ] Mode Blitz 60 secondes.
- [ ] Leaderboard hebdo.

---

## v0.5 — Monétisation
- [ ] AdSense active.
- [ ] Pack premium Stripe OTP.
- [ ] Séquence email onboarding.

---

## v0.6 — Cloud Sync
- [ ] Supabase pour comptes, scores et sync.
- [ ] Auth magic link.
- [ ] Migration des données locales vers le cloud.
- [ ] Préférences utilisateur persistées.

---

## v0.x — Confort Utilisateur
- [ ] Option `romaji simplifié` / `romaji strict`.
- [ ] Stocker cette préférence côté compte quand le cloud sera en place.

---

## v1.0 — Produit mature
- [ ] 500 à 1000 mots dans le catalogue.
- [ ] PWA.
- [ ] Parcours guidé 30 jours.
- [ ] 3e langue.
- [ ] 10 contenus SEO.
- [ ] Évaluer un scorer typographique maison si le besoin revient.

---

## Notes à garder
- [ ] Les mots pourront être générés par IA, puis relus avant publication.
- [ ] `normalizeAssistForDisplay` est une béquille temporaire.
- [ ] Objectif : afficher une romanisation propre sans dégrader la donnée source.
- [ ] Les release notes devront pouvoir annoncer :
  nombre de nouveaux mots,
  nombre d’ajouts de mots dans les packs,
  nombre de nouveaux packs.
