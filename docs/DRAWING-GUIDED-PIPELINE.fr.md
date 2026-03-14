# Dessin guide - pipeline image vers SVG

## But

Construire plus tard un pipeline **d'outillage auteur** pour partir de fiches scannees ou photographiees et produire :

- des SVG propres
- des etapes de dessin plus fidelement decoupees
- des consignes texte recuperees si besoin

Le but n'est **pas** d'ajouter de l'IA dans le module enfant en runtime.

## Constat

Pour `Dessin guide`, l'OCR seul ne suffit pas.

Le vrai besoin est une chaine en 3 couches :

1. pretraitement image
2. vectorisation / extraction de contours
3. aide IA optionnelle pour structurer et verifier

## Stack recommandee

### 1. Vision classique : OpenCV

Usage cible :

- nettoyage de scans/photos
- passage en niveaux de gris
- seuillage
- detection de contours
- correction de perspective si la fiche est prise en photo

Pourquoi :

- mature
- robuste
- bien documente
- utile avant toute vectorisation

Documentation officielle :

- OpenCV thresholding :
  - `https://docs.opencv.org/4.x/db/d8e/tutorial_threshold.html`
- OpenCV contours :
  - `https://docs.opencv.org/master/d4/d73/tutorial_py_contours_begin.html`

### 2. Vectorisation : Potrace ou fork maintenu JS/TS

Usage cible :

- convertir un dessin noir/blanc nettoye en chemins SVG

Options serieuses :

- Potrace
  - site officiel :
    - `https://potrace.sourceforge.net/`
- `ts-potrace`
  - fork TypeScript plus simple a brancher dans une toolchain Node
  - GitHub :
    - `https://github.com/stacksjs/ts-potrace`
- `image-tracer-ts`
  - alternative TS/JS pour tracer vers SVG
  - GitHub :
    - `https://github.com/mringler/image-tracer-ts`

Recommandation :

- socle : **OpenCV + ts-potrace**
- alternative a tester : `image-tracer-ts` si la sortie SVG est plus simple a nettoyer

### 3. OCR : Tesseract

Usage cible :

- recuperer les consignes texte d'une fiche existante
- ex. `Draw a head`, `Add two ears`

Pourquoi :

- utile pour l'auteuring
- inutile pour le rendu enfant lui-meme

Documentation officielle :

- `https://tesseract-ocr.github.io/`

### 4. IA vision : option auteur, pas coeur du produit

Usage cible :

- aider a decrire une fiche
- proposer un decoupage en etapes
- verifier qu'une vectorisation colle bien a la source
- produire une structure JSON de travail a relire

Options pertinentes :

- OpenAI vision pour analyser une image et produire une sortie structuree
  - docs officielles :
    - `https://platform.openai.com/docs/guides/images-vision`
- OpenAI image editing / generation seulement pour experimentation d'atelier
  - docs officielles :
    - `https://platform.openai.com/docs/guides/images/image-generation`

Decision :

- **oui** pour assister la preparation et le controle qualite
- **non** comme source de verite finale sans validation humaine

### 5. Segmentation avancee : plus tard seulement

Si un jour les fiches sont sales, complexes ou tres heterogenes :

- Segment Anything (SAM) peut aider a isoler une tete, une oreille, une criniere, etc.
- GitHub officiel :
  - `https://github.com/facebookresearch/segment-anything`

Mais aujourd'hui :

- trop lourd
- trop recherche
- pas necessaire pour une V1 auteur

Donc :

- backlog technique, pas premier choix

## Pipeline conseille

### Pipeline V1 auteur

1. scan ou photo de la fiche
2. pretraitement OpenCV
   - recadrage
   - niveaux de gris
   - seuillage
   - nettoyage
3. extraction des contours / lignes principales
4. vectorisation via `ts-potrace`
5. OCR Tesseract pour recuperer les consignes si utile
6. IA vision optionnelle pour proposer :
   - titre
   - liste d'etapes
   - ordre des ajouts
7. validation humaine
8. export final vers :
   - SVG propres
   - ou JSON declaratif ManabuPlay

## Recommendation nette

Pour le futur module `Dessin guide`, la stack la plus solide sans overkill est :

- **OpenCV**
- **ts-potrace**
- **Tesseract**

Et en option auteur :

- **OpenAI vision**

Pas recommande tout de suite :

- OCR seul
- IA generative seule
- SAM / segmentation lourde

## Decision produit

Avant d'investir dans cette stack, il faudra trancher la cible finale :

### Option A

Produire des **SVG etapes par etape**

### Option B

Produire une **source declarative JSON** puis rendre les etapes depuis Vue

Mon avis :

- pour durer, **Option B** est meilleure
- pour un atelier d'extraction depuis fiches papier, **Option A** peut servir comme etape intermediaire
