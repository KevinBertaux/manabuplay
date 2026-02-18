# 🎓 ManabuPlay

Application web éducative (SPA Vue 3 + Vite) pour aider les enfants à réviser les mathématiques et le vocabulaire.

[🇬🇧 English version](README.en.md)

## 🏷️ Version

- Version actuelle : `0.3.0` (13 février 2026)

## ✨ Fonctionnalités actuelles

### 📊 Math (`/math`)
- Quiz de tables de multiplication (1-11 + mode toutes tables)
- Score, total de réponses et série (streak)
- Validation clavier (`Entrée`) avec protection anti multi-validation

### 🇬🇧 Vocabulaire anglais (`/vocab`)
- Flashcards fruits/légumes (25 mots chacune)
- Navigation par flèches, clavier et swipe mobile
- TTS anglais avec accent 🇺🇸/🇬🇧

### 🛠️ Admin local V1 (`/admin`)
- Édition locale des listes (nom, description, mots)
- Ajout/suppression de mots
- Import JSON / export JSON / copie JSON
- Sauvegarde locale en `localStorage` (visible immédiatement sur `/vocab`)

### 🧾 CMS Netlify/Decap (`/cms/`)
- Édition collaborative des fichiers contenus versionnés
- Commit Git automatique via Git Gateway (quand activé sur Netlify)

## 🚀 Installation locale

### Prérequis
- Node.js LTS (v24+ recommandé)
- npm

### Démarrage
1. `npm install`
2. `npm run dev`
3. Ouvrir l'URL affichée (ex: `http://localhost:5173`)

### Qualité
- Tests unitaires: `npm test`
- Build production: `npm run build`

## 📁 Structure du projet

```text
manabuplay/
├── index.html
├── package.json
├── public/
│   ├── _redirects
│   └── cms/
│       ├── index.html
│       └── config.yml
├── src/
│   ├── App.vue
│   ├── main.js
│   ├── router/
│   │   └── index.js
│   ├── styles/
│   │   └── base.css
│   ├── content/
│   │   └── vocab/
│   │       └── en/
│   │           ├── fruits.json
│   │           └── legumes.json
│   ├── features/
│   │   ├── math/
│   │   │   ├── quizEngine.js
│   │   │   └── quizEngine.test.js
│   │   └── vocab/
│   │       ├── adminPayload.js
│   │       ├── adminPayload.test.js
│   │       └── vocabLists.js
│   └── views/
│       ├── HomeView.vue
│       ├── MathView.vue
│       ├── VocabView.vue
│       ├── AdminView.vue
│       ├── LegalMentionsView.vue
│       └── LegalPrivacyView.vue
└── docs/
    ├── README.fr.md
    ├── README.en.md
    └── QA-CHECKLIST.fr.md
```

## 🧭 Routes SPA

- `/` : Accueil
- `/math` : Module Math
- `/vocab` : Module vocabulaire
- `/admin` : Admin local V1
- `/legal/mentions-legales` : Mentions légales (placeholder)
- `/legal/confidentialite` : Confidentialité (placeholder)

Routes statiques:
- `/cms/` : Decap CMS

## ✍️ Modifier le contenu vocabulaire

### Option A (recommandée équipe) : CMS
1. Ouvrir `/cms/`
2. Se connecter (Netlify Identity)
3. Éditer les listes
4. Publier (commit Git auto)

### Option B (développeur)
1. Modifier `src/content/vocab/en/*.json`
2. Commit/push

### Option C (test local rapide)
1. Utiliser `/admin`
2. Sauvegarder localement (localStorage)

## 🌐 Déploiement Netlify (Vue SPA)

### Paramètres recommandés
- Build command : `npm run build`
- Publish directory : `dist`

### Redirection SPA
`public/_redirects` contient :
```text
/* /index.html 200
```

### Activation CMS (une fois sur Netlify)
1. Activer **Identity**
2. Activer **Git Gateway**
3. Inviter les éditeurs CMS

Guide détaillé pas-à-pas :
- `docs/SETUP-GITHUB-NETLIFY-CMS.fr.md`

## 📱 Compatibilité

- ✅ Chrome / Edge / Brave
- ✅ Firefox
- ✅ Safari (iOS/macOS récents)
- ✅ Desktop + mobile
- ✅ Connexion internet requise (pas de mode hors ligne PWA)

## ⚠️ Limites actuelles

- `/admin` reste local à l'appareil (localStorage)
- Pas encore de workflow de rôles avancé (RBAC) côté CMS
- Pages légales encore en placeholders dans l'app

## 📄 Licence

Projet libre d'utilisation pour usage personnel et éducatif.

## 🔀 Workflow Git

- Cheat sheet Git du projet: `docs/GIT-CHEATSHEET.fr.md`

## Backend Laravel V2

- Guide backend V2: `docs/BACKEND-LARAVEL-V2.fr.md`
