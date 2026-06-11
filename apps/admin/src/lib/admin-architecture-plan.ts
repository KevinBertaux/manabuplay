type LocalizedText = {
  fr: string;
  en: string;
};

export type ArchitectureExecutionStep = {
  id: string;
  rank: number;
  title: LocalizedText;
  impact: LocalizedText;
  effort: LocalizedText;
  priority: number;
  progress: number;
  whyNow: LocalizedText;
  note: LocalizedText;
};

export type ArchitecturePlanFile = {
  path: string;
  action: "create" | "update" | "split";
  note: LocalizedText;
};

export type ArchitecturePlanPhase = {
  id: string;
  order: number;
  progress: number;
  title: LocalizedText;
  goal: LocalizedText;
  guardrail: LocalizedText;
  risk: LocalizedText;
  files: ArchitecturePlanFile[];
};

const EXECUTION_STEPS: ArchitectureExecutionStep[] = [
  {
    id: "public-quiz-core",
    rank: 1,
    title: { fr: "Stabiliser le quiz public", en: "Stabilize the public quiz" },
    impact: { fr: "Critique", en: "Critical" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 1,
    progress: 100,
    whyNow: {
      fr: "C'est le coeur métier : sans quiz jouable, distracteurs fiables, hints masqués/révélés au bon moment et feedback clair, le reste ne sert à rien.",
      en: "This is the product core: without a playable quiz, reliable distractors, correctly hidden/revealed hints, and clear feedback, the rest does not matter.",
    },
    note: {
      fr: "Refacto lots 1–4 mergée preprod : landing sans quiz embarqué, shell viewport 100dvh, resolveQuizDataset, QuizIsland + mountQuizApp. HUD D, toast flottant, puces indices, archives agenda mobile.",
      en: "Refactor lots 1–4 merged to preprod: landing without embedded quiz, 100dvh viewport shell, resolveQuizDataset, QuizIsland + mountQuizApp. HUD D, floating toast, hint chips, mobile archives agenda.",
    },
  },
  {
    id: "hint-score-gameplay",
    rank: 2,
    title: { fr: "Score lié aux hints", en: "Score tied to hints" },
    impact: { fr: "Fort", en: "High" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 2,
    progress: 100,
    whyNow: {
      fr: "Les hints font partie du gameplay. Si l'aide est consommée, le score doit le refléter sans punir brutalement l'apprentissage.",
      en: "Hints are part of the gameplay. If help is consumed, scoring must reflect it without harshly punishing learning.",
    },
    note: {
      fr: "Branché : 10 / 8 / 5 / 0 points base selon les hints, multiplicateur combo final 1 + meilleure série / 10, score parfait à 200 pts avec animation arcade.",
      en: "Wired: 10 / 8 / 5 / 0 base points depending on hints, final combo multiplier 1 + best streak / 10, perfect score at 200 pts with arcade feedback.",
    },
  },
  {
    id: "daily",
    rank: 3,
    title: { fr: "Lancer le Quotidien", en: "Launch Daily" },
    impact: { fr: "Très fort", en: "Very high" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 3,
    progress: 100,
    whyNow: {
      fr: "C'est le moteur de retour principal. Sans lui, v0.1 présente surtout une fondation.",
      en: "It is the main return loop. Without it, v0.1 mostly presents a foundation.",
    },
    note: {
      fr: "Le Quotidien est branché : 10 questions, ratio 4/3/2/1 et tirage déterministe par date locale.",
      en: "Daily is wired: 10 questions, a 4/3/2/1 mix, and deterministic local-date selection.",
    },
  },
  {
    id: "practice",
    rank: 4,
    title: { fr: "Lancer le mode Arcade", en: "Launch Arcade mode" },
    impact: { fr: "Très fort", en: "Very high" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 4,
    progress: 100,
    whyNow: {
      fr: "L'Arcade donne de la profondeur de session et évite que le produit soit seulement un rendez-vous quotidien.",
      en: "Arcade adds session depth and prevents the product from being only a daily rendezvous.",
    },
    note: {
      fr: "Route publique /arcade/ en place : 4 difficultés, 10 questions par session et cooldown de 2 sessions par mot.",
      en: "Public /arcade/ route is live: 4 difficulties, 10 questions per session, and a 2-session cooldown per word.",
    },
  },
  {
    id: "archives",
    rank: 5,
    title: { fr: "Ouvrir les Archives", en: "Open Archives" },
    impact: { fr: "Fort", en: "High" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 5,
    progress: 100,
    whyNow: {
      fr: "Les archives rendent le Quotidien durable et donnent du contenu accessible sans inventer un nouveau mode.",
      en: "Archives make Daily durable and add accessible content without inventing another mode.",
    },
    note: {
      fr: "Calendrier 7 colonnes localisé, scores xxx/200, sélection sans reload, agenda mobile + panneau focus, CTA « Jouer » sur jour sélectionné. Mode quiz-focus archives (#quiz).",
      en: "Localized 7-column calendar, xxx/200 scores, no-reload selection, mobile agenda + focus panel, Play CTA on selected day. Archives quiz-focus mode (#quiz).",
    },
  },
  {
    id: "quiz-hint2-explanation",
    rank: 6,
    title: { fr: "Hint2 + explanation", en: "Hint2 + explanation" },
    impact: { fr: "Fort", en: "High" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 6,
    progress: 100,
    whyNow: {
      fr: "Le contenu existe déjà dans les packs, mais le quiz public ne l'exploite pas encore.",
      en: "The content already exists in packs, but the public quiz does not use it yet.",
    },
    note: {
      fr: "Branché côté joueur : hint1, hint2 et explanation sont maintenant visibles dans le quiz public uniquement au bon moment.",
      en: "Wired player-side: hint1, hint2, and explanation are now visible in the public quiz only at the right time.",
    },
  },
  {
    id: "pack-5",
    rank: 7,
    title: { fr: "Stabiliser Gacha & Rewards", en: "Stabilize Gacha & Rewards" },
    impact: { fr: "Très fort", en: "Very high" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 7,
    progress: 100,
    whyNow: {
      fr: "Le pack 5 est refondu en Gacha & Rewards : 34 mots, ratio cible, transparence sous seuil et relecture faite.",
      en: "Pack 5 has been rebuilt as Gacha & Rewards: 34 words, target ratio, transparency under threshold and review complete.",
    },
    note: {
      fr: "Score actuel : 96/100, transparence 9%, relecture faite 34/34.",
      en: "Current score: 96/100, 9% transparency, review complete 34/34.",
    },
  },
  {
    id: "pack-ratio-34",
    rank: 8,
    title: { fr: "Passer les packs à 34 mots", en: "Move packs to 34 words" },
    impact: { fr: "Fort", en: "High" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 8,
    progress: 100,
    whyNow: {
      fr: "Le ratio cible est maintenant appliqué aux 5 packs initiaux : 34 mots chacun, avec la même structure Daily / Libre.",
      en: "The target ratio is now applied to all 5 initial packs: 34 words each, with the same Daily / Practice structure.",
    },
    note: {
      fr: "État v0.1 : 5 packs actifs, 170 mots, ratio 12 / 9 / 8 / 5, relecture faite et transparence sous seuil.",
      en: "v0.1 state: 5 active packs, 170 words, 12 / 9 / 8 / 5 ratio, review complete and transparency under threshold.",
    },
  },
  {
    id: "mobile-qa",
    rank: 9,
    title: { fr: "QA mobile réelle", en: "Real mobile QA" },
    impact: { fr: "Très fort", en: "Very high" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 9,
    progress: 30,
    whyNow: {
      fr: "Le quiz est le produit. Il doit être réellement jouable sur iOS et Android avant toute priorité business secondaire.",
      en: "The quiz is the product. It must be truly playable on iOS and Android before any secondary business priority.",
    },
    note: {
      fr: "Polish mobile livré (viewport, HUD, toast, indices, archives). Reste la validation terrain iOS/Android sur l’URL preprod deploy/preprod-v01.",
      en: "Mobile polish shipped (viewport, HUD, toast, hints, archives). Remaining: real iOS/Android validation on deploy/preprod-v01 preprod URL.",
    },
  },
  {
    id: "landing-body-wording",
    rank: 10,
    title: { fr: "Wording du corps de landing", en: "Landing body wording" },
    impact: { fr: "Moyen", en: "Medium" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 10,
    progress: 100,
    whyNow: {
      fr: "Head, nav et hero sont traités. Le reste de la page doit maintenant soutenir les vrais modes, pas vendre un prototype.",
      en: "Head, nav, and hero are handled. The rest should now support the real modes instead of selling a prototype.",
    },
    note: {
      fr: "Landing pass 2 + lot 1 mergés : copy features/quiz, CTA hero vers /daily/, quiz runtime retiré de la home. Preprod à jour (deb2c42).",
      en: "Landing pass 2 + lot 1 merged: features/quiz copy, hero CTA to /daily/, quiz runtime removed from home. Preprod updated (deb2c42).",
    },
  },
  {
    id: "local-email-collection",
    rank: 11,
    title: { fr: "Collecte mail locale", en: "Local email collection" },
    impact: { fr: "Très fort", en: "Very high" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 11,
    progress: 100,
    whyNow: {
      fr: "Important business, mais secondaire tant que le quiz public n'est pas irréprochable.",
      en: "Important business work, but secondary until the public quiz is solid.",
    },
    note: {
      fr: "Terminé : local + RGPD (consent + privacy) + Netlify Forms validé en pré-prod (mail OK).",
      en: "Done: local flow + GDPR (consent + privacy) + Netlify Forms validated on pre-production (email OK).",
    },
  },
  {
    id: "public-architecture",
    rank: 12,
    title: { fr: "Architecture publique FR/EN", en: "FR/EN public architecture" },
    impact: { fr: "Très fort", en: "Very high" },
    effort: { fr: "Élevé", en: "High" },
    priority: 12,
    progress: 100,
    whyNow: {
      fr: "Le produit ne peut plus rester une landing avec une ancre quiz. Les modes ont besoin de vraies routes.",
      en: "The product can no longer stay as a landing with a quiz anchor. Modes need real routes.",
    },
    note: {
      fr: "Shell public, locale par URL, routes Daily / Arcade / Archives, switch FR/EN, landing marketing séparée du jeu (lot 1). ES prévu v1.0+, invisible v0.1.",
      en: "Public shell, locale-by-URL, Daily / Arcade / Archives routes, FR/EN switch, marketing landing separated from play (lot 1). ES planned v1.0+, hidden in v0.1.",
    },
  },
  {
    id: "attention-insight",
    rank: 13,
    title: { fr: "Passe Attention Insight", en: "Attention Insight pass" },
    impact: { fr: "Fort", en: "High" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 13,
    progress: 100,
    whyNow: {
      fr: "Valider clarté et CTA de la landing avant release, sans attendre du trafic réel.",
      en: "Validate landing clarity and CTAs before release, without waiting for real traffic.",
    },
    note: {
      fr: "Terminé : hero + quiz FR desktop (go release). Outil : npm run insight:capture + /pilotage/insight/.",
      en: "Done: FR desktop hero + quiz (release go). Tooling: npm run insight:capture + /pilotage/insight/.",
    },
  },
  {
    id: "clarity",
    rank: 14,
    title: { fr: "Microsoft Clarity", en: "Microsoft Clarity" },
    impact: { fr: "Fort", en: "High" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 14,
    progress: 100,
    whyNow: {
      fr: "Mesure d'audience utile dès les premiers visiteurs réels sur le domaine prod.",
      en: "Audience measurement is useful from the first real visitors on the production domain.",
    },
    note: {
      fr: "Actif : PUBLIC_CLARITY_PROJECT_ID sur Netlify (main), rapports Clarity reçus. Code : analytics-clarity.js, public-analytics.ts, bannière consentement.",
      en: "Active: PUBLIC_CLARITY_PROJECT_ID on Netlify (main), Clarity reports received. Code: analytics-clarity.js, public-analytics.ts, consent banner.",
    },
  },
  {
    id: "playwright",
    rank: 15,
    title: { fr: "Playwright fin de v0.1", en: "End-of-v0.1 Playwright" },
    impact: { fr: "Fort", en: "High" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 15,
    progress: 100,
    whyNow: {
      fr: "La suite est maintenant stabilisée, mais les futurs parcours Daily / Practice / Archives devront être ajoutés.",
      en: "The suite is now stable, but future Daily / Practice / Archives flows must be added.",
    },
    note: {
      fr: "Suite stabilisée (Daily, Arcade, Archives, waitlist). CI : plus de Playwright auto sur push/PR — workflow GitHub « E2E (manual) » sur demande.",
      en: "Stable suite (Daily, Arcade, Archives, waitlist). CI: no automatic Playwright on push/PR — GitHub « E2E (manual) » workflow on request.",
    },
  },
  {
    id: "legal-rgpd",
    rank: 16,
    title: { fr: "Mentions légales / RGPD", en: "Legal / GDPR" },
    impact: { fr: "Très fort", en: "Very high" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 16,
    progress: 100,
    whyNow: {
      fr: "Mentions et privacy doivent être publiables telles quelles avant deploy prod (Clarity et waitlist décrits comme en production).",
      en: "Legal and privacy must be publishable as-is before production deploy (Clarity and waitlist described as in production).",
    },
    note: {
      fr: "Copy FR/EN : EI Senpai Surprise, Netlify Forms, Clarity + bannière consentement, waitlist locale vs prod. Smoke Netlify (mail) OK en pré-prod.",
      en: "FR/EN copy: Senpai Surprise business, Netlify Forms, Clarity + consent banner, local vs production waitlist. Netlify smoke (email) passed on pre-production.",
    },
  },
];

const IMPLEMENTATION_PHASES: ArchitecturePlanPhase[] = [
  {
    id: "local-email",
    order: 1,
    progress: 100,
    title: { fr: "Faire marcher la collecte mail locale", en: "Make local email collection work" },
    goal: {
      fr: "Waitlist locale + Netlify Forms + RGPD : validé (pré-prod OK).",
      en: "Local waitlist + Netlify Forms + GDPR: validated (pre-production OK).",
    },
    guardrail: {
      fr: "Go-live prod : même formulaire Netlify ; re-smoke optionnel.",
      en: "Production go-live: same Netlify form; optional re-smoke.",
    },
    risk: {
      fr: "Faible à moyen : périmètre local et isolable.",
      en: "Low to medium: local and isolatable scope.",
    },
    files: [
      {
        path: "apps/web/src/pages/[locale]/index.astro",
        action: "update",
        note: {
          fr: "Stabiliser le formulaire waitlist et ses états visibles.",
          en: "Stabilize the waitlist form and visible states.",
        },
      },
      {
        path: "apps/web/src/scripts/quiz-app.ts",
        action: "update",
        note: {
          fr: "Isoler la logique de soumission email / état submitted.",
          en: "Isolate email submission / submitted state logic.",
        },
      },
      {
        path: "apps/admin/src/pages/ops/waitlist.astro",
        action: "create",
        note: {
          fr: "Lire les emails locaux, rafraîchir, effacer et exporter un CSV daté.",
          en: "Read local emails, refresh, clear, and export a dated CSV.",
        },
      },
      {
        path: "tests/web/public-flow.spec.ts",
        action: "update",
        note: {
          fr: "Couvrir validation email, soumission et état déjà inscrit.",
          en: "Cover email validation, submission, and already-subscribed state.",
        },
      },
    ],
  },
  {
    id: "public-shell-locale",
    order: 2,
    progress: 100,
    title: {
      fr: "Poser le shell public et la locale par URL",
      en: "Introduce public shell and locale-by-URL",
    },
    goal: {
      fr: "Avoir un shell public localisé, des URLs stables par langue et une racine `/` qui redirige correctement.",
      en: "Have a localized public shell, stable per-language URLs, and a `/` root that redirects correctly.",
    },
    guardrail: {
      fr: "La racine `/` résout la locale navigateur vers `/fr/` ou `/en/`, avec fallback anglais.",
      en: "Root `/` resolves the browser locale to `/fr/` or `/en/`, with English fallback.",
    },
    risk: {
      fr: "Moyen : changement de contrat i18n et SEO.",
      en: "Medium: changes the i18n and SEO contract.",
    },
    files: [
      {
        path: "apps/web/src/lib/public-locales.ts",
        action: "create",
        note: {
          fr: "Définir locales publiques FR / EN et locales prévues plus tard.",
          en: "Define public FR / EN locales and later planned locales.",
        },
      },
      {
        path: "apps/web/src/lib/public-routes.ts",
        action: "create",
        note: {
          fr: "Centraliser les routes publiques et les routes produit.",
          en: "Centralize public and product routes.",
        },
      },
      {
        path: "apps/web/src/pages/[locale]/index.astro",
        action: "create",
        note: { fr: "Entrée landing localisée FR / EN.", en: "Localized FR / EN landing entry." },
      },
    ],
  },
  {
    id: "product-routes",
    order: 3,
    progress: 100,
    title: { fr: "Créer Daily / Arcade / Archives", en: "Create Daily / Arcade / Archives" },
    goal: {
      fr: "Donner une route réelle à chaque mode du coeur produit.",
      en: "Give each core product mode a real route.",
    },
    guardrail: {
      fr: "Les routes vivent d'abord en parallèle de l'ancien flux `#quiz`.",
      en: "Routes first live alongside the old `#quiz` flow.",
    },
    risk: {
      fr: "Fort : première vraie mutation de l'IA publique.",
      en: "High: first real public IA mutation.",
    },
    files: [
      {
        path: "apps/web/src/pages/[locale]/[mode].astro",
        action: "create",
        note: {
          fr: "Entrées Daily / Arcade / Archives pour FR / EN.",
          en: "Daily / Arcade / Archives entries for FR / EN.",
        },
      },
    ],
  },
  {
    id: "session-builders",
    order: 4,
    progress: 100,
    title: { fr: "Séparer les payloads de session", en: "Split session payloads" },
    goal: {
      fr: "Remplacer le boot mono-pack par des builders Daily / Arcade / Archives.",
      en: "Replace the single-pack boot with Daily / Arcade / Archives builders.",
    },
    guardrail: {
      fr: "Un seul moteur de quiz, mais des payloads explicites par mode.",
      en: "One quiz engine, but explicit payloads per mode.",
    },
    risk: { fr: "Fort : mutation du runtime quiz.", en: "High: quiz runtime mutation." },
    files: [
      {
        path: "shared/lib/manabuplay-daily.ts",
        action: "create",
        note: { fr: "Générer le Quotidien par date/seed.", en: "Generate Daily by date/seed." },
      },
      {
        path: "shared/lib/manabuplay-practice.ts",
        action: "create",
        note: {
          fr: "Tirage Arcade + 4 difficultés + cooldown sessions.",
          en: "Arcade draw + 4 difficulties + session cooldown.",
        },
      },
      {
        path: "shared/lib/manabuplay-archives.ts",
        action: "create",
        note: { fr: "Archives par date passée.", en: "Archives by past date." },
      },
      {
        path: "apps/web/src/scripts/quiz-app.ts",
        action: "update",
        note: {
          fr: "Consommer un payload injecté au lieu du quiz legacy unique.",
          en: "Consume injected payload instead of unique legacy quiz.",
        },
      },
    ],
  },
  {
    id: "content-readiness",
    order: 5,
    progress: 100,
    title: { fr: "Rendre le contenu v0.1 publiable", en: "Make v0.1 content publishable" },
    goal: {
      fr: "Conserver la trace de la stabilisation éditoriale des 5 packs actifs.",
      en: "Keep a record of the editorial stabilization of the 5 active packs.",
    },
    guardrail: {
      fr: "Ne pas gonfler les packs avec du filler juste pour atteindre un chiffre.",
      en: "Do not pad packs with filler just to hit a number.",
    },
    risk: {
      fr: "Faible sur v0.1 : le risque restant est surtout de ne pas maintenir les docs et surfaces admin à jour.",
      en: "Low for v0.1: the remaining risk is mostly failing to keep docs and admin surfaces updated.",
    },
    files: [
      {
        path: "shared/data/manabuplay/packs/*.json",
        action: "update",
        note: {
          fr: "5 packs actifs à 34 mots, relus 34/34, scorés et sous le seuil de transparence.",
          en: "5 active packs at 34 words, reviewed 34/34, scored and under the transparency threshold.",
        },
      },
      {
        path: "shared/data/manabuplay/catalog.ts",
        action: "update",
        note: {
          fr: "Exposer le contenu nécessaire aux builders de mode.",
          en: "Expose content needed by mode builders.",
        },
      },
      {
        path: "tests/unit",
        action: "update",
        note: {
          fr: "Couvrir ratios, cooldown et tirages de session.",
          en: "Cover ratios, cooldown, and session draws.",
        },
      },
    ],
  },
  {
    id: "release-hardening",
    order: 6,
    progress: 92,
    title: { fr: "Durcir la fin de v0.1", en: "Harden the end of v0.1" },
    goal: {
      fr: "Fermer release v0.1 : manabuplay.com en ligne, QA mobile device, smoke finale, cog drawer langue.",
      en: "Close v0.1 release: manabuplay.com live, device mobile QA, final smoke pass, language settings drawer.",
    },
    guardrail: {
      fr: "Ne pas considérer le go-live public terminé tant que manabuplay.com et www ne résolvent pas vers Netlify en HTTPS.",
      en: "Do not treat public go-live as complete until manabuplay.com and www resolve to Netlify over HTTPS.",
    },
    risk: {
      fr: "Moyen : dernière ligne droite avec beaucoup de petites surfaces.",
      en: "Medium: final stretch with many small surfaces.",
    },
    files: [
      {
        path: "apps/web/src/pages/[locale]/index.astro",
        action: "update",
        note: {
          fr: "Wording final du corps de landing après les vrais modes.",
          en: "Final landing body wording after real modes.",
        },
      },
      {
        path: "tests/web/public-flow.spec.ts",
        action: "update",
        note: {
          fr: "Couvrir Daily / Arcade / Archives + waitlist.",
          en: "Cover Daily / Arcade / Archives + waitlist.",
        },
      },
      {
        path: "shared/data/manabuplay/legal-copy.ts",
        action: "update",
        note: {
          fr: "Copy FR/EN EI Senpai Surprise + hébergeur Netlify.",
          en: "FR/EN copy for Senpai Surprise business + Netlify hosting.",
        },
      },
      {
        path: "apps/web/src/pages/[locale]/legal.astro",
        action: "update",
        note: {
          fr: "Mentions légales ; lien inline vers la politique de confidentialité.",
          en: "Legal notice; inline link to the privacy policy.",
        },
      },
      {
        path: "apps/web/src/pages/[locale]/privacy.astro",
        action: "update",
        note: {
          fr: "Politique de confidentialité (waitlist, localStorage, logs).",
          en: "Privacy policy (waitlist, localStorage, logs).",
        },
      },
      {
        path: "apps/web/src/components/PublicFooter.astro",
        action: "update",
        note: {
          fr: "Footer minimal : ManabuPlay · Kxis · liens légaux.",
          en: "Minimal footer: ManabuPlay · Kxis · legal links.",
        },
      },
      {
        path: "scripts/capture-insight-landing.mjs",
        action: "update",
        note: {
          fr: "Captures landing FR/EN pour Attention Insight.",
          en: "FR/EN landing captures for Attention Insight.",
        },
      },
      {
        path: "apps/admin/src/pages/pilotage/insight.astro",
        action: "update",
        note: {
          fr: "Hub admin : commande, liens Insight, prévisualisation PNG.",
          en: "Admin hub: command, Insight links, PNG preview.",
        },
      },
      {
        path: "apps/web/public/scripts/analytics*.js",
        action: "create",
        note: {
          fr: "Clarity actif en prod (main). Pré-prod sans Clarity sauf test volontaire.",
          en: "Clarity active in production (main). Pre-production without Clarity unless tested on purpose.",
        },
      },
    ],
  },
  {
    id: "quiz-client-refacto",
    order: 7,
    progress: 100,
    title: {
      fr: "Refacto quiz client-side (lots 1–4)",
      en: "Client-side quiz refactor (lots 1–4)",
    },
    goal: {
      fr: "Séparer landing et jeu, unifier le shell viewport, centraliser le dataset session et isoler le boot quiz.",
      en: "Separate landing and play, unify viewport shell, centralize session dataset, and isolate quiz boot.",
    },
    guardrail: {
      fr: "Génération quiz côté client uniquement — jamais de SSG par date. Runtime TS conservé (pas de framework Island pour l’instant).",
      en: "Client-side quiz generation only — never date-based SSG. TS runtime kept (no framework Island for now).",
    },
    risk: {
      fr: "Moyen : gros diff sur quiz-app et pages modes, mais merge preprod validé (CI verte).",
      en: "Medium: large diff on quiz-app and mode pages, but preprod merge validated (green CI).",
    },
    files: [
      {
        path: "apps/web/src/pages/[locale]/index.astro",
        action: "update",
        note: {
          fr: "Lot 1 : landing marketing, CTA vers /daily/, public-landing.ts.",
          en: "Lot 1: marketing landing, CTA to /daily/, public-landing.ts.",
        },
      },
      {
        path: "apps/web/src/components/QuizModeShell.astro",
        action: "create",
        note: {
          fr: "Lot 2 : shell viewport unifié Daily / Arcade / Archives.",
          en: "Lot 2: unified viewport shell for Daily / Arcade / Archives.",
        },
      },
      {
        path: "shared/lib/quiz-dataset.ts",
        action: "create",
        note: {
          fr: "Lot 3 : resolveQuizDataset, buildDailyQuizData, contrat session.",
          en: "Lot 3: resolveQuizDataset, buildDailyQuizData, session contract.",
        },
      },
      {
        path: "apps/web/src/components/QuizIsland.astro",
        action: "create",
        note: {
          fr: "Lot 4 : wrapper [data-quiz-island] + boot après public-boot.",
          en: "Lot 4: [data-quiz-island] wrapper + boot after public-boot.",
        },
      },
      {
        path: "apps/web/src/scripts/quiz-app.ts",
        action: "update",
        note: {
          fr: "mountQuizApp exporté, DOM scopé à l’island, polish HUD/toast/indices.",
          en: "mountQuizApp exported, DOM scoped to island, HUD/toast/hints polish.",
        },
      },
      {
        path: "shared/data/manabuplay/repo-root.ts",
        action: "create",
        note: {
          fr: "Fix chemins shared/ pour build admin depuis le workspace.",
          en: "Fix shared/ paths for admin build from workspace.",
        },
      },
    ],
  },
];

function getExecutionStatus(progress: number) {
  if (progress >= 100) return "done";
  if (progress >= 60) return "advanced";
  if (progress >= 25) return "active";
  if (progress > 0) return "framed";
  return "cold";
}

export function getArchitectureExecutionSteps() {
  return EXECUTION_STEPS;
}

export function getArchitectureExecutionSummary() {
  const total = EXECUTION_STEPS.length;
  const average = Math.round(
    EXECUTION_STEPS.reduce((sum, step) => sum + step.progress, 0) / Math.max(total, 1),
  );

  return {
    total,
    average,
    done: EXECUTION_STEPS.filter((step) => getExecutionStatus(step.progress) === "done").length,
    advanced: EXECUTION_STEPS.filter((step) => getExecutionStatus(step.progress) === "advanced")
      .length,
    active: EXECUTION_STEPS.filter((step) => getExecutionStatus(step.progress) === "active").length,
    framed: EXECUTION_STEPS.filter((step) => getExecutionStatus(step.progress) === "framed").length,
    cold: EXECUTION_STEPS.filter((step) => getExecutionStatus(step.progress) === "cold").length,
  };
}

export function getArchitectureImplementationPhases() {
  return IMPLEMENTATION_PHASES;
}

export function getArchitectureImplementationSummary() {
  const total = IMPLEMENTATION_PHASES.length;
  const average = Math.round(
    IMPLEMENTATION_PHASES.reduce((sum, phase) => sum + phase.progress, 0) / Math.max(total, 1),
  );

  return {
    total,
    average,
    done: IMPLEMENTATION_PHASES.filter((phase) => getExecutionStatus(phase.progress) === "done")
      .length,
    advanced: IMPLEMENTATION_PHASES.filter(
      (phase) => getExecutionStatus(phase.progress) === "advanced",
    ).length,
    active: IMPLEMENTATION_PHASES.filter((phase) => getExecutionStatus(phase.progress) === "active")
      .length,
    framed: IMPLEMENTATION_PHASES.filter((phase) => getExecutionStatus(phase.progress) === "framed")
      .length,
    cold: IMPLEMENTATION_PHASES.filter((phase) => getExecutionStatus(phase.progress) === "cold")
      .length,
  };
}

export function getArchitectureStatusLabel(progress: number): LocalizedText {
  switch (getExecutionStatus(progress)) {
    case "done":
      return { fr: "Terminé", en: "Done" };
    case "advanced":
      return { fr: "En validation", en: "In validation" };
    case "active":
      return { fr: "En cours", en: "In progress" };
    case "framed":
      return { fr: "Amorcé", en: "Started" };
    default:
      return { fr: "Backlog", en: "Backlog" };
  }
}

export function getArchitectureStatusTone(progress: number) {
  return getExecutionStatus(progress);
}

export function getArchitectureFileActionLabel(
  action: ArchitecturePlanFile["action"],
): LocalizedText {
  switch (action) {
    case "create":
      return { fr: "créer", en: "create" };
    case "split":
      return { fr: "découper", en: "split" };
    default:
      return { fr: "mettre à jour", en: "update" };
  }
}
