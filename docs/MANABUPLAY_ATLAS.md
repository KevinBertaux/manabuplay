# MANABUPLAY ATLAS

Doc de référence lente du projet.

Ce fichier sert à fixer :

- la vision produit
- les frontières du produit
- les règles éditoriales
- les règles de structure des packs et des quiz
- la cible data après `v0.1`

Il ne sert pas à porter :

- le backlog
- les scopes par version
- le suivi du travail au jour le jour

Le suivi du travail vit désormais dans :

- `docs/ROADMAP.json`
- `/admin/backlog`

---

## 1. Positionnement

ManabuPlay n'est pas pensé comme :

- un clone de Duolingo
- un cours complet de japonais
- une encyclopédie de franchises
- un site de trivia Japon au coeur du produit

Le coeur retenu est :

- apprendre du vocabulaire japonais
- par des packs courts
- via le jeu vidéo, les anime, les JRPG et la pop culture japonaise

Phrase de travail :

> ManabuPlay = apprendre du vocabulaire japonais à partir d'un imaginaire pop japonais déjà familier.

Distinction retenue :

- coeur éditorial :
  - apprendre du vocabulaire japonais
  - via un imaginaire pop japonais déjà familier
- coeur produit :
  - `Quotidien`
  - `Libre` en `4` difficultés
  - `Archives`

---

## 2. Public et promesse

Public prioritaire :

- ados et jeunes adultes
- fans d'anime, de manga, de JRPG et de culture pop japonaise
- débutants et quasi débutants

Conséquences :

- vocabulaire clair
- formulations naturelles
- pas de jargon critique inutile
- pas de dépendance à la lecture du japonais

La promesse publique doit rester :

- simple
- désirable
- compréhensible en quelques secondes

---

## 3. Frontières produit

### Ce que ManabuPlay fait

- packs de vocabulaire japonais
- quiz courts
- hints, définitions et explications
- entrée émotionnelle par des univers pop japonais

### Ce que ManabuPlay ne fait pas au coeur

- cours de grammaire
- système scolaire complet
- quiz de culture générale pure
- app de franchise officielle

Nuance importante :

- des extensions plus larges sont possibles après `v1.0`
- mais le vocabulaire reste le coeur du produit

---

## 4. Structure publique

Niveaux retenus :

- `theme`
- `pack`
- `word`

Au début, le public doit surtout voir :

- les packs

Règle :

- `1 pack public = 1 promesse claire`

Les thèmes existent pour structurer le catalogue, mais ne doivent pas compliquer l'interface publique au début.

---

## 5. Modèle pack-first actuel

La `v0.1` reste en JSON pack-first.

Un mot s'appuie sur :

- `jp.term`
- `jp.reading`
- `jp.romaji`
- `gloss`
- `definition`
- `explanation`
- `hints.hint1`
- `hints.hint2`
- `difficultyTier`
- `quiz.distractors`

Rôle des trois couches de sens :

- `gloss` = réponse courte du quiz
- `definition` = sens précis
- `explanation` = contexte, usage, nuance

---

## 6. Difficulté et structure des packs

Le modèle garde `4 tiers` :

- `T1` facile
- `T2` moyen
- `T3` difficile
- `T4` expert

Répartition de référence pour un pack de `30` mots :

- `10` T1
- `8` T2
- `7` T3
- `5` T4

Cette répartition n'est plus seulement une règle pack `v0.1`.
Avec le cadrage actuel :

- `Quotidien` : `4 / 3 / 2 / 1`
- `Libre facile` : `6 / 3 / 1 / 0`
- `Libre standard` : `4 / 3 / 2 / 1`
- `Libre difficile` : `2 / 3 / 3 / 2`
- `Libre expert` : `1 / 1 / 4 / 4`

Le ratio théorique moyen devient :

- `34%` T1
- `26%` T2
- `24%` T3
- `16%` T4

Ce qui donne comme répartitions de pack de référence :

- pack `30` mots : `10 / 8 / 7 / 5`
- pack `34` mots : `12 / 9 / 8 / 5`

Taille de référence actuelle :

- `34 mots`

Cadre plus général :

- `30` = base de départ
- `30 à 40` = zone normale
- `40 à 50` = pack riche
- `50+` = seuil d'attention
- `60+` = split à envisager sérieusement

---

## 7. Règles éditoriales

Ton général :

- simple
- concret
- naturel
- sans jargon gratuit

FR / EN :

- les deux langues doivent être réellement travaillées
- pas de FR bon et d'EN bricolé

Distracteurs :

- plausibles
- lisibles
- pas absurdes
- pas de collision pédagogique trop plate

Signal de transparence pondéré :

- `strict` : détection automatique si `romaji == gloss.fr` ou `romaji == gloss.en`
- `editorial` : mot listé dans `transparentWordIds`, emprunt évident mais légitime
- `filler` : mot listé dans `fillerWordIds`, ajouté surtout pour remplir ou trop faible
- un mot prend le poids le plus fort applicable

Seuils pack-level retenus :

- poids `strict` : `1`
- poids `editorial` : `0.5`
- poids `filler` : `2`
- ok : `<= 10%`
- vigilance : `> 10%`
- action : `> 18%`

Readiness score pack :

- score sur `100`
- seuil minimum prod : `90/100`
- `contentReady` est calculé : score >= seuil, relecture complète et transparence sous contrôle
- `releaseApproved` reste manuel : il représente le go final, pas la qualité du contenu

Workflow pack retenu :

- écriture
- harmonisation
- score provisoire
- relecture
- stabilisation
- score final
- extraction catalogue

---

## 8. Landing `v0.1`

Règles retenues pour la landing :

- elle vend d'abord la valeur
- elle montre ensuite le produit
- l'upgrade premium vient plus tard
- aucune pub display sur la landing `v0.1`

Ordre cible actuel (lot 1 refacto) :

- `hero` — CTA principal vers `/{locale}/daily/` (jeu hors landing)
- `stats`
- `features`
- `waitlist`

Le quiz live n’est plus embarqué sur la home : une seule surface de jeu (`/daily/`, puis island). Génération des questions toujours **côté client** (pool embarqué, date locale).

**Option notée (si la home paraît trop vide)** — teaser / démo **sans runtime quiz** : carte statique ou capture (HUD, toast, grille), copy « 10 questions », lien Daily. Voir `v01-landing-quiz-teaser` dans [ROADMAP.json](./ROADMAP.json).

Validation retenue :

- avant release `v0.1` : `Attention Insight` — captures viewport par section (`fr-desktop-hero.png`, etc.), pas de PNG pleine page (surcoût Insight)
- au premier deploy prod : `Microsoft Clarity` — privacy + bannière consentement prêtes ; activer via `PUBLIC_CLARITY_PROJECT_ID` sur Netlify, puis smoke waitlist + dashboard Clarity
- pré-prod sans crédits Netlify : preview local (`npm run preview`) ; URL en ligne optionnelle via branche `deploy/preprod-v01` — voir [DEPLOY-PREPROD.md](./DEPLOY-PREPROD.md)

---

## 9. Quotidien, Libre, Archives

### Quotidien

Le `Quotidien` est :

- un quiz commun à tous
- généré par date
- à tentative comptée unique
- partageable sans spoiler

Nom retenu :

- `Quotidien #xxx du 10 avril 2026`

Répartition de travail actuelle :

- `10 questions`
- `4 T1`
- `3 T2`
- `2 T3`
- `1 T4`

#### Date du quotidien et fuseau (décision actuelle)

Règle retenue pour l’instant : **minuit local du visiteur** (modèle proche de Wordle), pas une heure serveur Netlify ni un reset worldwide unique.

Implémentation actuelle :

- clé du jour : `YYYY-MM-DD` via `getLocalDateKey()` dans le navigateur (`apps/web/src/scripts/quiz-app/session.ts`) ;
- libellé affiché (« Quotidien · … ») : formaté côté client à partir de cette clé ;
- verrou « déjà joué aujourd’hui » et `localStorage` : même clé locale ;
- génération déterministe du quiz : seedée par cette date.

Ce n’est **pas** :

- l’heure du déploiement Netlify au moment du jeu ;
- un flip global à heure fixe pour tous (ex. minuit Pacific sur LinkedIn Games).

Comparaison utile :

| Modèle                    | Référence                        | Effet                                                                                                      |
| ------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Minuit **local visiteur** | Wordle (NYT)                     | Chaque joueur change de jour à 00h chez lui ; même contenu global, pas le même instant calendaire partout. |
| Minuit **Pacific** global | LinkedIn Games (aide officielle) | Un seul instant worldwide ; en France le nouveau puzzle arrive le matin, à Los Angeles à minuit.           |
| Minuit **UTC**            | Jeux serveur classiques          | Déterministe côté ops ; moins intuitif pour le joueur.                                                     |

LinkedIn ne publie pas « à 9h partout » : c’est **00:00 PT pour tout le monde**. À 9h en France, le puzzle du jour global est déjà actif depuis plusieurs heures.

Wordle fait l’inverse : à 9h en France tu es sur le puzzle du jour français ; à 3h du matin à New York tu peux encore être sur la veille.

Conséquence produit ManabuPlay :

- on garde le **local** tant qu’on n’a pas besoin que deux joueurs qui partagent à la même heure wall-clock aient **obligatoirement** la même date affichée ;
- un passage futur à PT ou UTC serait un **choix produit explicite** (copy utilisateur + éventuelle logique serveur).

Nuance archives :

- le **jeu** archive / quotidien côté runtime suit le local du navigateur ;
- le **calendrier** HTML statique des archives est encore figé à la date du **build** (`getArchiveMonthGroups` au build Astro) — à hydrater côté client si la case « aujourd’hui » doit être live sans redeploy.

Questions ouvertes (non bloquantes) :

- faut-il un jour aligner le partage social sur un fuseau global (PT / UTC) ?
- hydrate-t-on le calendrier archives au chargement pour refléter le « aujourd’hui » du visiteur ?

### Archives

Les `Archives` :

- rejouent les anciens quotidiens
- sont séparées du Quotidien courant
- n'ont pas de partage
- sont un `Quotidien` généré avec une date passée

Conséquence :

- les `Archives` n'ajoutent pas une nouvelle recette de tiers
- elles réutilisent la recette du `Quotidien`

Pour l'instant :

- pas de snapshot permanent stocké en continu
- génération déterministe d'abord
- sauvegardes JSON par année ou par mois si besoin plus tard

### Libre

Le `Libre` est :

- le mode d'entraînement rejouable
- distinct du Quotidien et des Archives

Ce qui est déjà fixé :

- rôle produit du Libre
- `4` difficultés
- `10` questions par session
- cooldown en `2` sessions

Recettes de travail retenues :

- `Facile` : `6 T1 / 3 T2 / 1 T3 / 0 T4`
- `Standard` : `4 T1 / 3 T2 / 2 T3 / 1 T4`
- `Difficile` : `2 T1 / 3 T2 / 3 T3 / 2 T4`
- `Expert` : `1 T1 / 1 T2 / 4 T3 / 4 T4`

### Règles minimales de fraîcheur

- quota fixe par tiers
- signature canonique pour éviter les doublons réels
- cooldown par mot
- cap de transparence pondérée par session
- éviter les collisions trop jumelles dans une même session
- dominante éditoriale contrôlée si un quiz mélange plusieurs packs

Unités de cooldown retenues :

- `Quotidien` : en `jours`
- `Libre` : en `sessions`

---

## 10. Leviers produit

Hiérarchie actuelle des leviers les plus utiles :

1. `Quotidien`
2. `partage sans spoiler`
3. `Libre`
4. `streak`
5. `progression visible`
6. `Archives`
7. `compte user`
8. `badges`

Lecture produit :

- le retour vient d'abord du rendez-vous
- la qualité de session vient d'abord du gameplay
- la viralité vient du partage
- les badges ne sont pas un levier coeur

---

## 11. Cible data après `v0.1`

Ne pas lancer la grosse refonte avant la sortie `v0.1`.

Modèle cible après `v0.1` :

- `pack`
- `word`
- `pack_word`
- `distractor`
- `quiz_session`
- `quiz_question`

Multilingue cible :

- tables de traduction dédiées
- pas de colonnes `name_fr`, `name_en`, etc.

Résilience cible :

- un pack dégradé ne doit pas rendre l'app indisponible
- le pack fautif doit pouvoir être isolé

Pack sandbox plus tard :

- valide
- sacrifiable
- utile pour tester migrations et résilience

---

## 12. Rôle des sources

### `docs/ROADMAP.json`

Source de vérité pour :

- scopes par version
- backlog
- historique de livraison

### `/admin/backlog`

Surface de lecture principale du backlog.

### `MANABUPLAY_ATLAS.md`

Source de vérité pour :

- vision
- règles produit
- règles éditoriales
- modèles et décisions lentes

### `BUSINESS.md`

Source de vérité pour :

- pricing
- croissance
- logique commerciale
