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
- [x] Routes admin Astro pour la charte, le FX Lab, le lecteur et les mockups.
- [x] Lecteur de pack admin avec vue continue, réponses, hints, définition et explication.
- [x] Switch EN / FR branché sur le lecteur admin.
- [x] Mockup admin pour comparer les variantes de cartes réponses.

### Socle technique retenu
- [x] Catalogue évolutif basé sur `words`, `packs`, `packEntries`, `releases`.
- [x] Les packs peuvent partager les mêmes mots sans duplication.
- [x] `gloss` court + `definition` + `explanation`.
- [x] 2 hints max par mot / pack.
- [x] `difficultyTier` sur 4 niveaux par mot.
- [x] Répartition pack cible par défaut pour `30` mots : `10 / 8 / 7 / 5`.
- [x] Le quiz tirera les mots par tiers. Le pack fournit la matière, le quiz compose la session.

### Contenu pack-first
- [x] Pack `JRPG essentiels` monté à `30` mots.
- [x] Pack `JRPG essentiels` relu en FR / EN.
- [x] Distracteurs du pack 1 repris avec une logique plus homogène.
- [x] Score pack 1 mis à `94/100`.
- [x] Catalogue roadmap séparé pour les mots existants mis de côté et les distracteurs promus.

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
- [ ] Introduire plus tard un statut de validation par usage réel des mots si les métriques quiz le justifient.

---

## Après v0.1 — Cible data / SQL
- [ ] Ne pas lancer la grosse refacto avant la sortie `v0.1`.
- [ ] Garder les JSON `v0.1` comme source de travail jusqu'à la prod.
- [ ] Préparer ensuite une cible plus propre :
  `pack`
  `word`
  `pack_word`
  `distractor`
  `quiz_session`
  `quiz_question`
- [ ] Séparer clairement :
  le mot canonique,
  le mot dans un pack,
  les distracteurs,
  les questions de quiz.
- [ ] Viser une relation `n-n` entre `packs` et `words` via `pack_word`.
- [ ] Laisser le quiz composer les questions à partir du pack, pas l'inverse.
- [ ] Penser multilingue dès la cible SQL :
  une table `locale`,
  des tables de traduction du type `pack_locale`, `word_locale`, `pack_word_locale`,
  pas une colonne par langue.
- [ ] Faire dériver le futur MCD / MLD SQL des JSON une fois la `v0.1` en prod, pas avant.
- [ ] Rendre le chargement des packs résilient :
  un JSON dégradé ne doit pas rendre l’admin ni le site indisponibles,
  il faut pouvoir isoler le pack fautif et garder le reste accessible.

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
- [ ] `1 pack public = 1 promesse claire`. La réutilisation multi-pack reste possible en interne, mais pas comme complexité visible au début.
- [ ] Les thèmes sont gardés en arrière-plan. Le public voit surtout les packs.
- [ ] `30` mots par pack est la cible de base retenue pour éviter un produit trop pauvre.
- [ ] Les release notes devront pouvoir annoncer :
  nombre de nouveaux mots,
  nombre d’ajouts de mots dans les packs,
  nombre de nouveaux packs.
- [ ] Prévoir plus tard un pack `easter-egg / sandbox` :
  pack cobaye valide mais sacrifiable,
  utile pour tester la résilience des loaders,
  les migrations de schéma JSON,
  puis les migrations JSON -> Supabase -> Postgres,
  sans risquer les vrais packs publics.
