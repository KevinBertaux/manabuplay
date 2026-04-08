# MANABUPLAY ATLAS
Doc de référence du projet.

Ce fichier sert à fixer les règles lentes :
- vision produit
- structure packs / mots / quiz
- logique éditoriale
- score
- cible data après `v0.1`

Le `DEVLOG.md` reste un journal de bord.

---

## 1. Positionnement

### Ce que ManabuPlay veut devenir
ManabuPlay n'est pas pensé comme un clone de Duolingo, Babbel ou Rosetta Stone.

Le projet vise plutôt :
- une porte d'entrée émotionnelle vers le japonais
- via la pop culture, le gaming, l'anime, le manga et le Japon du quotidien
- avec des packs courts, désirables et relisibles

La bonne phrase de travail est :

> ManabuPlay = apprendre du vocabulaire japonais en entrant dans un imaginaire pop japonais.

### Ce que ManabuPlay n'est pas, surtout au début
- pas un cours complet de grammaire / syntaxe / écriture
- pas une encyclopédie de franchises
- pas une app généraliste qui veut battre Duolingo sur son terrain

Le wedge produit retenu est :
- vocabulaire
- packs thématiques
- ambiance forte
- progression courte

---

## 2. Public cible

Public visé en priorité :
- ados et jeunes adultes
- fans d'anime, manga, JRPG, culture pop japonaise
- niveau débutant ou faux débutant

Conséquences éditoriales :
- vocabulaire simple
- pas de jargon critique inutile
- pas de mots “savants” si une formulation courante existe
- on évite de supposer que l'utilisateur sait déjà lire le japonais

Exemples :
- préférer `codes d'anime` à `tropes`
- éviter `archétypes` si une formulation plus directe suffit

---

## 3. Structure produit publique

### Niveaux retenus
- `theme`
- `pack`
- `word`

### Ce que voit le public
Au début, le public voit surtout les packs.

Règle :
- `1 pack public = 1 promesse claire`

Les thèmes existent pour structurer le catalogue, mais ne doivent pas compliquer l'interface publique au début.

### Ce que l'on évite
On évite d'exposer trop tôt :
- catégories floues
- sous-catégories partout
- relations trop abstraites entre univers, catégories et types de packs

### Cas des franchises connues
Une franchise comme `One Piece` ne doit pas être pensée comme une catégorie simple.

La hiérarchie correcte serait plutôt :
- thème / univers : `One Piece`
- packs : `personnages`, `attaques`, `lieux`, `objets`, etc.

Mais ce n'est pas une priorité `v0.1`, notamment pour :
- le scope
- la clarté
- les sujets de licence / IP

---

## 4. Plus petit produit crédible

Le plus petit produit qui exprime déjà la vision est :
- une landing page
- une série de packs de vocabulaire japonais
- un quiz court
- des hints
- une ambiance visuelle forte

Pas :
- une plateforme d'apprentissage complète
- un cours de japonais généraliste
- un musée de franchises

Pour `v0.1`, la cible retenue est :
- `5 packs`
- `30 mots par pack`
- soit `150 mots`

Les 5 premiers packs retenus :
- `JRPG essentiels`
- `Combat & Boss`
- `Classes, armes & équipement`
- `Codes d'anime`
- `Japon pop : ville & quotidien`

---

## 5. Modèle pack-first actuel

### Principe
La `v0.1` travaille encore avec des JSON pack-first.

Un pack contient ses mots et leur contenu éditorial.

### Schéma mot retenu
Chaque mot pack-first repose sur :
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

### Pourquoi `gloss / definition / explanation`
`meaning` surchargeait trop de rôles.

La séparation retenue est :
- `gloss` : réponse courte du quiz
- `definition` : sens précis
- `explanation` : contexte, usage, nuance

### Distracteurs
Les distracteurs peuvent être :
- de vrais mots
- ou des distracteurs purs

Règle importante :
- un vrai mot peut servir de distracteur pour un autre mot
- le problème n'est pas la réutilisation
- le problème est la collision pédagogique trop plate

---

## 6. Difficulté, tirage et sessions

### Tiers retenus
Le modèle garde `4 tiers` :
- `1` facile
- `2` moyen
- `3` difficile
- `4` expert

### Répartition de base pour un pack de 30 mots
- `10` mots tier 1
- `8` mots tier 2
- `7` mots tier 3
- `5` mots tier 4

### Rôle du pack et du quiz
Le pack ne porte pas à lui seul la courbe de difficulté.

Le partage correct est :
- le pack fournit la matière
- le quiz compose la session

### Tirage retenu
Le quiz doit faire un tirage structuré :
- choix d'un mode
- quotas par tiers
- tirage aléatoire dans chaque pool
- mélange final

### Aléatoire et stabilité
Pour le quiz user :
- randomisation au lancement de session
- ordre stable pendant la session
- nouvelle session = nouveau tirage possible

Pour le reader admin :
- ordre stable
- lecture sans bruit

---

## 7. Règles éditoriales

### Ton général
- simple
- concret
- pas de jargon gratuit
- pas de phrase “de dictionnaire” si une phrase naturelle marche mieux

### FR / EN
Les deux langues doivent être travaillées :
- pas seulement le FR
- pas de gloss naturel en FR et bancal en EN

### Lecture utilisateur
On n'écrit pas les définitions et explications comme si l'utilisateur lisait déjà couramment le japonais.

Conséquence :
- pas de script japonais brut dans une explication sans aide immédiate
- si on mentionne un mot japonais, il faut que la phrase reste compréhensible sans le lire

### Distracteurs
Ordre de priorité :
1. proches et plausibles
2. bon mélange sans absurdité

On évite :
- les distracteurs trop éloignés
- les quasi synonymes paresseux
- les libellés utilitaires qui sentent le placeholder

### Mots “cadeaux”
Certains mots sont trop transparents pour créer une vraie difficulté de traduction.

Exemples typiques :
- mot repris presque tel quel
- mot international très peu transformé

Pour `v0.1`, on ne crée pas de logique runtime spéciale.

Détection retenue :
- un mot entre dans `transparentWordIds` si `romaji == gloss.fr`
- ou si `romaji == gloss.en`
- la comparaison est mécanique, après `trim()` et passage en minuscules
- sans exception éditoriale supplémentaire

On suit plutôt un ratio pack-level :
- objectif qualité : `<= 5%`
- seuil de vigilance : `> 10%`
- seuil d'action : `> 15%`

Si un pack dépasse ces seuils :
- on le relève
- puis on dilue en ajoutant ou remplaçant quelques mots si nécessaire

---

## 8. Workflow éditorial pack

Ordre de travail retenu :
- `écriture`
- `harmonisation pack-wide`
- `score provisoire`
- `relecture humaine`
- `stabilisation finale`
- `score final`
- `extraction catalogue`

### Pourquoi l'extraction est à la fin
Les distracteurs candidats doivent être extraits :
- après harmonisation
- après relecture
- après stabilisation

Sinon on promeut des distracteurs encore instables.

---

## 9. Score pack

Le score principal est le `readiness score`, sur `100`.

Barème retenu :
- `Taille` : `15`
- `Tiers` : `15`
- `Contenu` : `40`
- `Qualité quiz` : `15`
- `Relecture` : `15`

Dans `Qualité quiz`, le taux de mots cadeaux applique un malus :
- `0% à 10%` : `0`
- `>10% à 15%` : `-1`
- `>15% à 25%` : `-2`
- `>25% à 35%` : `-3`
- `>35% à 50%` : `-4`
- `>50%` : `-5`

### Seuil retenu
- `90/100` = seuil minimum prod

### Statuts utiles
- `reviewStatus: non-relue`
- `reviewStatus: partielle`
- `reviewStatus: faite`
- `reviewStatus: validée`

Lecture retenue :
- `faite` = bon et publiable
- `validée` = figé éditorialement sauf bug réel

---

## 10. Politique de taille des packs

### Règle actuelle
Pour `v0.1`, la cible est :
- `30 mots`

### Règle plus générale
`30` n'est pas un plafond éternel.

Cadre retenu :
- `30` = taille de départ
- `30 à 40` = zone normale
- `40 à 50` = pack riche, encore acceptable
- `50+` = seuil d'attention
- `60+` = split à envisager sérieusement

Le split ne dépend pas seulement du volume :
- un pack peut aussi être coupé parce qu'il contient deux sous-promesses éditoriales naturelles

---

## 11. Politique de release contenu

### Point de départ
- `0.1` = `5 x 30` mots

### Principe pour la suite
Une release doit apporter une nouveauté lisible :
- soit `1 nouveau pack`
- soit un enrichissement visible d'un pack existant
- soit les deux si c'est léger

### Avant `1.0`
Priorité :
- ouvrir le catalogue
- tester plusieurs promesses de packs
- enrichir les packs existants quand cela améliore vraiment la rejouabilité

### Après `1.0`
On peut ralentir :
- moins de volume brut
- plus de qualité, métriques et profondeur

---

## 12. Catalogue futur

Le catalogue roadmap sert à :
- garder des mots legacy mis de côté
- promouvoir des distracteurs suffisamment solides
- rattacher chaque candidat à un ou plusieurs packs possibles

Le catalogue n'est pas un pack final.

Il décrit un réservoir de matière.

Conséquence :
- un pack roadmap peut avoir plus de matière candidate que sa taille cible finale

---

## 13. Cible data après `v0.1`

### Décision
Ne pas lancer la grosse refacto avant la sortie `v0.1`.

### Modèle cible
Après `v0.1`, la cible propre devient :
- `pack`
- `word`
- `pack_word`
- `distractor`
- `quiz_session`
- `quiz_question`

### Séparation recherchée
Il faut séparer :
- le mot canonique
- le mot tel qu'il vit dans un pack
- les distracteurs
- les questions de quiz

### Multilingue
La cible SQL doit être multilingue par tables de traduction :
- `locale`
- `pack_locale`
- `word_locale`
- `pack_word_locale`

Et non par :
- colonnes `name_fr`, `name_en`, `name_it`, etc.

### Résilience loaders
À terme :
- un JSON dégradé ne doit pas rendre l'admin ou le site indisponibles
- il faut pouvoir isoler le pack fautif
- garder le reste lisible

### Pack sandbox
Prévoir plus tard un pack `easter-egg / sandbox` :
- valide
- sacrifiable
- utile pour tester :
  - résilience
  - migration de schéma
  - passage JSON -> Supabase -> Postgres

---

## 14. Rôle des docs

### `DEVLOG.md`
Journal de bord :
- état réel
- ce qui est fait
- ce qui est ouvert
- ce qui est repoussé

### `MANABUPLAY_ATLAS.md`
Référence lente :
- vision
- doctrine produit
- modèle contenu
- règles de travail
- cible data

---

## 15. Élargissement produit après `v0.1`

### Point de départ
Le coeur de ManabuPlay reste :
- quiz de vocabulaire japonais
- packs courts
- apprentissage par imaginaire pop japonais

### Ce que cela n'interdit pas
À plus long terme, ManabuPlay peut devenir un site de quiz plus large, avec plusieurs pôles.

Exemples possibles :
- `vocabulaire`
- `culture pop japonaise`
- `quotidiens`
- plus tard éventuellement :
  - `trivia Japon`
  - `micro-jeux`
  - `packs spéciaux`

### Condition importante
Cet élargissement n'a de sens que si le coeur vocabulaire est déjà solide.

Conditions minimales :
- la boucle quiz vocabulaire marche
- les packs sont compris et désirables
- les métriques montrent une vraie traction
- la rétention existe
- le produit ne devient pas confus

### Règle de marque
ManabuPlay ne doit pas devenir un fourre-tout de quiz.

Règle retenue :
- le vocabulaire japonais reste le coeur
- les autres modes éventuels deviennent des extensions
- pas l'inverse

### Lecture produit
Donc :
- en `0.1`, on reste strictement pack-first vocabulaire
- en `1.0+`, une extension vers des quiz culturels ou quotidiens est probable
- mais seulement si elle renforce la marque au lieu de diluer la promesse
