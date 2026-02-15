# ROADMAP - ManabuPlay

## Cadre de version interne

- `0.1.0` Prototype initial HTML/CSS/JS
- `0.2.0` Migration architecture vers Vue 3 + Vite (SPA)
- `0.3.0` Stabilisation fonctionnelle (Math/Vocab/Admin V1 + TTS + docs)
- `0.4.0` Prochaine release cible: consolidation produit + pipeline deploy sobre + backlog prioritaire

## Strategie "1 deploy/semaine max" jusqu'au 9 mars 2026

- Contrainte budget identifiee: cout deploy Netlify eleve, quota limite avant reset.
- Geler les deploiements automatiques non essentiels (pause builds sur Netlify).
- Fenetres cibles: semaine du 16 fevrier, 23 fevrier, 2 mars 2026.
- Reprise cadence normale apres reset quota du 9 mars 2026.

## Livre (historique consolide)

### Produit et architecture
- Migration SPA vers Vue 3 + Vite
- Routage principal (`/`, `/math`, `/vocab`, `/admin`, pages legales)
- Redirection SPA Netlify (`public/_redirects`)
- Renommage global du projet en **ManabuPlay**
- README racine oriente GitHub vitrine

### Module Math
- Quiz tables 1 a 11 + mode toutes tables
- Correction multi-validation clavier (`Entree` maintenue)
- Mise a jour immediate de la question lors du changement de table
- Blocage des reponses negatives
- Score / total / serie stabilises

### Module Langues (anglais)
- Source vocabulaire JSON externe (single source of truth)
- Flashcards fruits/legumes (25 mots)
- Navigation clavier/fleches/swipe mobile
- Refonte UI carte (centrage, hierarchie texte, etats)
- Integration TTS V1 (clic uniquement, pas d'autoplay)
- Choix accent anglais US/UK
- Bouton Play/Stop unique
- Masquage bouton TTS si non supporte
- Correction messages parasites TTS sur interruption/changement de carte
- Compatibilite de migration des cles `localStorage` legacy -> nouvelles cles

### Admin V1
- Migration admin local dans `/admin`
- Edition listes JSON (nom, description, mots)
- Ajout/suppression/import/export/copie JSON
- Amelioration UX ajout de mots (bouton flottant, focus)
- Aucune liste prechargee par defaut
- Protection par mot de passe de la route `/admin`
- Mot de passe configurable via `.env` (`VITE_ADMIN_PASSWORD`)
- Retrait des acces visuels `Admin` dans l'interface (acces URL direct uniquement)

### CMS / Netlify
- Structure Decap CMS en place (`/cms`)
- Documentation pas-a-pas GitHub -> Netlify -> Identity -> Git Gateway
- Clarification blocage Git Gateway si site non connecte en CD GitHub/GitLab

### Conformite et documentation
- Mentions legales redigees (editeur non-professionnel, anonymisation publique)
- Politique de confidentialite redigee (RGPD + mineurs + stockage local)
- Mention explicite du cadre mineurs (<15 ans pour consentement futur)
- Documentation alignee avec le comportement reel
- Favicon pack complet integre (`favicon_io`)

### UX / Navigation
- Remplacement boutons precedent/suivant vocab par fleches type carrousel
- Deplacement bouton melanger (iterations UI)
- Logo de marque en header cliquable
- Capture doc d'accueil mise a jour sans bloc Admin

## References operationnelles

- Checklist release hebdo: `docs/RELEASE-CHECKLIST.fr.md`

## A faire (priorise)

### Priorite haute
- [ ] Remplacer la protection front `/admin` par une protection serveur reelle (auth robuste)
- [ ] Finaliser Identity + Git Gateway en production avec workflow test complet
- [x] Ecrire une checklist release legere (Go/No-Go avant deploy hebdo)
- [ ] Mettre en place un `CHANGELOG.md` versionne

### Priorite produit
- [ ] Ajouter module Math: divisions
- [ ] Ajouter module Math: symetrie
- [ ] Ajouter base module Langues: espagnol
- [ ] Definir structure de contenu multi-langue (`src/content/vocab/en`, `es`, ...)

### Priorite qualite
- [ ] Ajouter tests E2E parcours critiques (nav, admin protege, tts, math)
- [ ] Ajouter tests unitaires route guard admin
- [ ] Ajouter controle QA mobile systematique avant chaque deploy

### Priorite conformite
- [ ] Verification juridique finale par professionnel (mentions/confidentialite)
- [ ] Formaliser procedure d'exercice des droits RGPD (reponse sous delai)
- [ ] Preparer registre simplifie des traitements (meme minimal)

### Priorite ops
- [ ] Documenter strategie branches (`main`, `feature/*`, `fix/*`, `docs/*`)
- [ ] Definir convention commits (`feat`, `fix`, `docs`, `chore`)
- [ ] Ajouter tags release (`v0.4.0`, etc.)

## Definition de version recommandee

- Regle active: SemVer en phase pre-1.0 (`0.MINOR.PATCH`)
- `MINOR` pour feature/changement visible
- `PATCH` pour correctif sans nouvelle capacite
- Passage en `1.0.0` quand produit + process de release + conformite sont stabilises

## Cible de la prochaine version

- [ ] Proposition: preparer `0.4.0` juste avant le prochain deploy hebdomadaire valide
