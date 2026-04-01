# DEVLOG — ManabuPlay 🇯🇵
**Vision :** Apprendre le japonais via la Pop-Culture (Anime/Gaming).
**Objectif ROI :** 50€/mois (AdSense v0.5) -> 500€/mois (Premium v1.0).

---

## 🚀 ROADMAP DES VERSIONS

### v0.1 — MVP (Focus Actuel)
- [x] 50 mots de base (Japonais/Anglais/Français).
- [x] 4 niveaux de difficulté + i18n complète (Switch EN/FR).
- [ ] **Gameplay :** Implémenter localStorage pour les scores, bouton "Reveal Hint", effets de particules.
- [ ] **Marketing :** Formulaire de capture email (Newsletter) + Emplacements AdSense réservés dans le layout.
- [ ] **Déploiement :** Mise en ligne sur Netlify avec le domaine `manabuplay.com`.

### v0.2 — Rétention & Social Proof
- [ ] **Daily Streak :** Système "X jours de suite 🔥" stocké en localStorage.
- [ ] **Social Share :** Bouton de partage Twitter/X avec score dynamique et URL pré-remplie.
- [ ] **Branding :** Création de Meta OG Images statiques (pour les aperçus sur réseaux sociaux).
- [ ] **Tech :** Audit et fix du rendu responsive (focus iPhone SE et petits écrans).

### v0.3 — SEO Engine (Levier de Croissance)
- [ ] **Scale :** Passage à 150 mots via génération automatisée par IA.
- [ ] **Architecture :** Mise en place de routes dynamiques `/pack/[slug]` (ex: Combat, Anime, RPG, Food).
- [ ] **SEO :** Implémentation Schéma JSON-LD (Quiz) + Génération automatique du Sitemap.
- [ ] **Metric :** Viser un palier de 50 visites organiques par jour.

### v0.4 — Gamification & Identité
- [ ] **Badges :** Système de trophées débloqués par performance (stockage localStorage).
- [ ] **Profil :** Personnalisation légère (choix d'un pseudo et d'un avatar emoji).
- [ ] **Challenge :** Mode "Blitz" (Contre-la-montre de 60 secondes).
- [ ] **Leaderboard :** Affichage du Top 10 hebdomadaire (basé sur le partage communautaire).

### v0.5 — Monétisation (Pivot Business)
- [ ] **AdSense :** Activation réelle et optimisation des revenus (placements entre les rounds).
- [ ] **Stripe (OTP) :** Lancement du pack "Sensei Lifetime" (500+ mots, No-Ads, Stats).
    * *Prix conseillé : 14,90€ (Lancement) ou 19,00€.*
- [ ] **Emailing :** Mise en place d'une séquence d'onboarding automatique via Brevo.

### v0.6 — Cloud Sync (Backend léger)
- [ ] **Base de données :** Intégration de **Supabase (Free Tier)** pour les scores et users.
- [ ] **Auth :** Système de connexion par Magic Link (Email sans mot de passe).
- [ ] **Cloud :** Sauvegarde de la progression synchronisée sur tous les appareils.

### v1.0 — Produit Mature
- [ ] **PWA :** Application installable sur mobile (Web App Manifest + Service Worker).
- [ ] **Curriculum :** Mode "Défi du Samouraï" (Parcours guidé sur 30 jours).
- [ ] **International :** Ajout d'une 3ème langue (Espagnol ou Allemand).
- [ ] **Content :** Rédaction de 10 articles de blog SEO-friendly (ex: "Vocabulaire JRPG").

### v1.x — Scale & Expansion
- [ ] **API :** Ouverture d'une API publique pour intégrations tierces.
- [ ] **Affiliation :** Partenariats avec des plateformes de cours (JapanesePod101, etc.).
- [ ] **Education :** Version "Teacher" permettant de créer ses propres packs de mots.

---

## 🛠 NOTES TECHNIQUES & BACKLOG
- [ ] **Prompt IA :** Générer le fichier JSON structuré pour les 100 mots additionnels (v0.3).
- [ ] **Design :** Création du logo 512x512 propre pour l'icône PWA.
- [ ] **Legal :** Rédiger la Privacy Policy (nécessaire pour AdSense, Stripe et Supabase).

---

### Rappel du Protocole de Nommage
* **Dossiers / Repos :** `manabuplay` (minuscules).
* **UI / Marque :** ManabuPlay (TitleCase).
* **Versions :** Incrémenter de 0.1 à chaque étape fonctionnelle majeure.
