# MANABUPLAY BUSINESS

Fichier de logique business.

Ce fichier sert à fixer :

- le modèle de monétisation
- la logique de pricing
- les cibles de croissance
- les hypothèses business déjà retenues

Il ne sert pas à porter :

- le backlog produit
- la doctrine éditoriale
- les détails techniques

---

## 1. Ordre de valeur

Ordre retenu :

1. prouver la valeur du produit
2. installer une boucle free crédible
3. lancer un premium ensuite

Conséquence :

- pas de pub display sur la landing `v0.1`
- les ads ne sont pas un axe validé à ce stade
- le premium reste la piste business principale après validation du coeur produit

---

## 2. Pricing de lancement

Prix de base de lancement retenu :

- `14,90 €`

Cadre d'interprétation :

### Monter à `19,90 €`

- si le taux de conversion dépasse `2%`
- logique : la valeur perçue est assez haute pour augmenter la marge

### Rester à `14,90 €`

- si le taux de conversion se situe entre `1%` et `1,5%`
- logique : point d'équilibre à stabiliser

### Descendre à `9,90 €`

- si le taux de conversion tombe sous `0,5%`
- logique : le prix freine trop l'essai

---

## 3. Hypothèses de croissance

Repères déjà retenus :

- première validation SEO : `50 visites organiques / jour`
- conversion minimale liste email -> achat OTP : `1%`

Rappels :

- le Quotidien doit devenir un vrai moteur de retour
- la waitlist doit vendre une promesse régulière, pas une page figée
- le partage sans spoiler est un levier de bouche à oreille plus fort que les badges

---

## 4. Ancrage marketing

Règles retenues :

- afficher un prix final barré à côté du prix de lancement si la stratégie l'exige
- utiliser l'urgence avec retenue :
  - fenêtre de lancement
  - quota d'early bird
  - prix qui évolue

Le marketing doit renforcer :

- la clarté
- la désirabilité
- la valeur perçue

Pas :

- un faux sentiment de rareté permanent
- une landing chargée de bruit commercial

---

## 5. Questions ouvertes

Restent ouvertes pour plus tard :

- moment exact du passage au premium
- forme de l'offre premium
- rôle éventuel des ads hors landing
- arbitrage entre OTP, abonnement, ou hybride

---

## 6. Modèle économique retenu

### Problème de base

Le risque actuel est simple :

- si `Quotidien`
- `Archives`
- et un `Libre` complet en `4` difficultés
  sont gratuits,

alors le free contient déjà l'essentiel de la valeur d'usage.

Conséquence :

- Stripe ne doit pas arriver comme un simple checkout ajouté sur le même produit
- il faut d'abord définir ce que le premium vend réellement

### Direction retenue : Bibliothèque premium

Free :

- Quotidien complet
- Libre complet en 4 difficultés
- Archives récentes
- 170 mots accessibles en `v0.1`
- 5 packs accessibles
- 2 thèmes de packs gratuits à terme

Payant :

- bibliothèque complète
- tous les packs premium
- toutes les archives
- thèmes premium
- progression détaillée
- historique complet
- TTS
- révision ciblée
- fonctions compte étendues

Lecture :

- meilleur fit pour ManabuPlay
- valeur payante visible
- compatible avec un Stripe OTP plus tard
- ne casse pas le moteur de retour du Quotidien

### Découpage Free / Premium

Free doit rester un vrai produit :

- `Quotidien`
- `Libre`
- `Archives récentes`
- `5 packs`
- `170 mots`

Premium doit vendre la profondeur :

- plus de contenu
- meilleure organisation du catalogue
- mémoire produit
- confort d'apprentissage
- progression avancée

### Timing Stripe

- pas de Stripe en `v0.1`
- Stripe devient crédible quand :
  - la boucle free tient
  - la collecte email fonctionne
  - le volume premium est visible
  - 8 à 12 packs solides existent

Fenêtre plausible :

- `v0.6 -> v1.0`
