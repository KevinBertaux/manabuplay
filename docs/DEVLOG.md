# DEVLOG — ManabuPlay 🇯🇵
**Vision :** Apprendre le japonais via la Pop-Culture (Anime/Gaming).
**Objectif ROI :** 50€/mois (AdSense v0.5) -> 500€/mois (Premium v1.0).

---

## Etat Actuel

### v0.1 — Base MVP Stabilisee
- [x] MVP legacy porte sur Astro et rendu visuel ISO valide par comparaison automatique.
- [x] HTML / CSS / JS separes.
- [x] Fonts locales, plus aucune dependance CDN critique pour le rendu.
- [x] 50 mots de base (JP/EN/FR).
- [x] 4 niveaux de difficulte + i18n EN/FR.
- [x] localStorage pour les meilleurs scores.
- [x] Reveal Hint + effets de particules.
- [x] Formulaire waitlist et emplacements AdSense reserves dans le layout.
- [x] Tests visuels Playwright + script de comparaison legacy vs Astro.
- [x] Schema de donnees scalable fige dans le code sur `refactor/data-v0.1`.
- [x] Migration des 50 mots actuels vers un catalogue canonique.
- [ ] Fixes produit du MVP avant ouverture publique.
- [ ] Mise en ligne sur `manabuplay.com`.

---

## Decisions D'Architecture

### Catalogue
- [x] `words` = lexique canonique partage entre les packs.
- [x] `packs` = pages SEO editoriales.
- [x] `packEntries` = relation pack <-> mot avec ordre, hints, explication, distracteurs et version d'introduction.
- [x] `releases` = source de verite pour release notes et newsletters.
- [x] `introducedIn` conserve sur les mots, packs et pack entries.

### Pedagogie
- [x] `meaning` court et canonique.
- [x] `explanation` depliable et specifique au pack.
- [x] 2 hints max par mot/pack.
- [ ] Score adapte selon 0 / 1 / 2 hints.
- [ ] TTS au clic.
  Premier clic : vitesse 0.85.
  Deuxieme clic : vitesse 0.60.

### Scalabilite
- [x] Les packs peuvent partager les memes mots.
- [x] Le modele vise 500 a 1000 mots sans duplication.
- [ ] Migration progressive du contenu vers une structure SEO pack-first complete.
- [ ] Future sync : localStorage d'abord, migration vers Supabase / Postgres a la creation de compte.

---

## Roadmap

### Maintenant — refactor/data-v0.1
- [x] Sortir les donnees du script monolithique.
- [x] Definir le schema canonique `releases / packs / words / packEntries`.
- [x] Brancher le quiz actuel sur un adaptateur legacy sans changer le rendu.
- [x] Ajouter les premiers champs prevus pour la suite produit : `explanation`, `hint2`, `audio`.
- [x] Preparer le pack par defaut `gaming-core`.

### Ensuite — refactor/components-v0.1
- [ ] Decouper la home Astro en sections/composants sans changer le rendu.
- [ ] Garder les tests visuels comme filet de securite.

### Ensuite — fix/mvp-v0.1
- [ ] Corriger les bugs de logique identifies sur le MVP.
- [ ] Stabiliser le formulaire waitlist pour le deploy cible.
- [ ] Ajouter l'explication depliable apres reponse.
- [ ] Ajouter le scoring dependant des hints.
- [ ] Ajouter le TTS au clic.

### v0.2 — Retention & Social Proof
- [ ] Daily Streak en localStorage.
- [ ] Partage social X avec score dynamique.
- [ ] OG images statiques.
- [ ] Audit responsive (focus petits ecrans).

### v0.3 — SEO Engine
- [ ] Routes `/{locale}/pack/[slug]`.
- [ ] Packs SEO editoriaux en FR et EN.
- [ ] Maillage interne entre packs.
- [ ] Schema JSON-LD + sitemap.
- [ ] 150+ mots valides dans le catalogue.
- [ ] Premier objectif : 50 visites organiques / jour.

### v0.4 — Gamification & Identite
- [ ] Badges.
- [ ] Profil leger (pseudo + avatar emoji).
- [ ] Mode Blitz 60 secondes.
- [ ] Leaderboard hebdo.

### v0.5 — Monetisation
- [ ] AdSense active et optimisee.
- [ ] Pack premium Stripe OTP.
- [ ] Sequence email onboarding.

### v0.6 — Cloud Sync
- [ ] Supabase pour users, scores et sync.
- [ ] Auth magic link.
- [ ] Migration des donnees locales vers le cloud.

### v1.0 — Produit Mature
- [ ] Catalogue 500 a 1000 mots.
- [ ] PWA.
- [ ] Parcours guide 30 jours.
- [ ] 3eme langue.
- [ ] 10 articles SEO.

---

## Notes Techniques
- [ ] Les mots seront probablement generes par IA puis valides avant publication.
- [ ] Les packs doivent rester reutilisables et partageables sans duplication de mots.
- [ ] Les release notes doivent pouvoir compter :
  nombre de nouveaux mots,
  nombre d'integrations de mots dans les packs,
  nombre de nouveaux packs.
- [ ] Conserver une base de contenu compatible avec une future edition via backoffice.

---

## Rappel du Protocole de Nommage
- **Dossiers / Repos :** `manabuplay`
- **UI / Marque :** `ManabuPlay`
- **Branche de travail :** courte, une seule active a la fois
- **Versions :** incrementer a chaque etape fonctionnelle majeure
