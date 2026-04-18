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
    id: "local-email-collection",
    rank: 1,
    title: { fr: "Collecte mail locale", en: "Local email collection" },
    impact: { fr: "Très fort", en: "Very high" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 1,
    progress: 75,
    whyNow: {
      fr: "La waitlist est le prochain vrai levier business. Elle doit fonctionner localement avant toute couche légale ou RGPD.",
      en: "The waitlist is the next real business lever. It must work locally before any legal or GDPR layer.",
    },
    note: {
      fr: "Local validé : saisie multi-utilisateur, validation email, feedback, admin, export CSV. Reste à vérifier Netlify Forms sur un déploiement réel.",
      en: "Local flow validated: multi-user input, email validation, feedback, admin, CSV export. Netlify Forms still needs a real-deploy smoke test.",
    },
  },
  {
    id: "public-architecture",
    rank: 2,
    title: { fr: "Architecture publique FR/EN", en: "FR/EN public architecture" },
    impact: { fr: "Très fort", en: "Very high" },
    effort: { fr: "Élevé", en: "High" },
    priority: 2,
    progress: 100,
    whyNow: {
      fr: "Le produit ne peut plus rester une landing avec une ancre quiz. Les modes ont besoin de vraies routes.",
      en: "The product can no longer stay as a landing with a quiz anchor. Modes need real routes.",
    },
    note: {
      fr: "Shell public, locale par URL, routes Daily / Practice / Archives en vrai et switch de langue cohérent sont en place. ES reste prévu côté architecture pour v1.0+, mais invisible en v0.1.",
      en: "Public shell, locale-by-URL, real Daily / Practice / Archives routes, and coherent language switching are in place. ES remains planned in the architecture for v1.0+, but hidden in v0.1.",
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
    title: { fr: "Lancer le mode Libre", en: "Launch Practice mode" },
    impact: { fr: "Très fort", en: "Very high" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 4,
    progress: 100,
    whyNow: {
      fr: "Le Libre donne de la profondeur de session et évite que le produit soit seulement un rendez-vous quotidien.",
      en: "Practice adds session depth and prevents the product from being only a daily rendezvous.",
    },
    note: {
      fr: "Le mode Libre est branché : 4 difficultés, 10 questions par session et cooldown de 2 sessions par mot.",
      en: "Practice mode is wired: 4 difficulties, 10 questions per session, and a 2-session cooldown per word.",
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
      fr: "Les Archives sont jouables par date passée, sans partage. Pas de snapshot permanent pour l'instant ; JSON de sauvegarde plus tard si nécessaire.",
      en: "Archives are playable by past date, without sharing. No permanent snapshot for now; JSON backups later if needed.",
    },
  },
  {
    id: "pack-5",
    rank: 6,
    title: { fr: "Refaire le pack 5", en: "Rewrite pack 5" },
    impact: { fr: "Très fort", en: "Very high" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 6,
    progress: 12,
    whyNow: {
      fr: "Le pack 5 existe, mais il n'est pas publiable : trop de mots cadeaux et ligne éditoriale trop hors produit.",
      en: "Pack 5 exists, but is not publishable: too many giveaways and an editorial line too far from the product.",
    },
    note: {
      fr: "Refonte vocab-first, puis réalignement sur le ratio cible.",
      en: "Vocab-first rewrite, then realign with the target ratio.",
    },
  },
  {
    id: "pack-ratio-34",
    rank: 7,
    title: { fr: "Passer les packs à 34 mots", en: "Move packs to 34 words" },
    impact: { fr: "Fort", en: "High" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 7,
    progress: 0,
    whyNow: {
      fr: "Le ratio cible est validé, mais pas encore appliqué aux packs initiaux.",
      en: "The target ratio is validated, but not yet applied to the initial packs.",
    },
    note: {
      fr: "Packs 1 à 4 : +2 T1, +1 T2, +1 T3, +0 T4. Pack 5 après refonte.",
      en: "Packs 1 to 4: +2 T1, +1 T2, +1 T3, +0 T4. Pack 5 after rewrite.",
    },
  },
  {
    id: "quiz-hint2-explanation",
    rank: 8,
    title: { fr: "Hint2 + explanation", en: "Hint2 + explanation" },
    impact: { fr: "Fort", en: "High" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 8,
    progress: 100,
    whyNow: {
      fr: "Le contenu existe déjà dans les packs, mais le quiz public ne l'exploite pas encore.",
      en: "The content already exists in packs, but the public quiz does not use it yet.",
    },
    note: {
      fr: "Branché côté joueur : hint1, hint2 et explanation sont maintenant visibles dans le quiz public.",
      en: "Wired player-side: hint1, hint2, and explanation are now visible in the public quiz.",
    },
  },
  {
    id: "hint-score-gameplay",
    rank: 9,
    title: { fr: "Score lié aux hints", en: "Score tied to hints" },
    impact: { fr: "Moyen", en: "Medium" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 9,
    progress: 0,
    whyNow: {
      fr: "Si les hints aident, le score doit refléter l'aide consommée sans punir brutalement l'apprentissage.",
      en: "If hints help, scoring should reflect consumed help without harshly punishing learning.",
    },
    note: {
      fr: "Sujet à traiter après le branchement visible des hints.",
      en: "Handle after the hints are visibly wired.",
    },
  },
  {
    id: "landing-body-wording",
    rank: 10,
    title: { fr: "Wording du corps de landing", en: "Landing body wording" },
    impact: { fr: "Moyen", en: "Medium" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 10,
    progress: 25,
    whyNow: {
      fr: "Head, nav et hero sont traités. Le reste de la page doit attendre que les modes réels soient mieux posés.",
      en: "Head, nav, and hero are handled. The rest should wait until the real modes are better in place.",
    },
    note: {
      fr: "A reprendre après l'implémentation de la suite, car le wording changera avec les vrais modes.",
      en: "Revisit after implementing the next product layer, because wording will change with real modes.",
    },
  },
  {
    id: "metrics",
    rank: 11,
    title: { fr: "Métriques produit minimales", en: "Minimal product metrics" },
    impact: { fr: "Fort", en: "High" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 11,
    progress: 10,
    whyNow: {
      fr: "Les outils sont choisis, mais l'intégration vient après les surfaces produit importantes.",
      en: "Tools are chosen, but integration comes after the important product surfaces.",
    },
    note: {
      fr: "Attention Insight avant release, Clarity pour les premiers visiteurs.",
      en: "Attention Insight before release, Clarity for first visitors.",
    },
  },
  {
    id: "mobile-qa",
    rank: 12,
    title: { fr: "QA mobile réelle", en: "Real mobile QA" },
    impact: { fr: "Très fort", en: "Very high" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 12,
    progress: 0,
    whyNow: {
      fr: "A faire quand les routes et le coeur produit seront assez stables pour que la QA ne parte pas dans le vide.",
      en: "Do it when routes and product core are stable enough for QA to matter.",
    },
    note: {
      fr: "Chantier de fin de v0.1, pas premier chantier.",
      en: "End-of-v0.1 work, not the first task.",
    },
  },
  {
    id: "playwright",
    rank: 13,
    title: { fr: "Playwright fin de v0.1", en: "End-of-v0.1 Playwright" },
    impact: { fr: "Fort", en: "High" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 13,
    progress: 100,
    whyNow: {
      fr: "La suite est maintenant stabilisée, mais les futurs parcours Daily / Practice / Archives devront être ajoutés.",
      en: "The suite is now stable, but future Daily / Practice / Archives flows must be added.",
    },
    note: {
      fr: "Base solide : tests admin/public couvrent maintenant Daily, Libre et Archives.",
      en: "Solid base: admin/public tests now cover Daily, Practice, and Archives.",
    },
  },
  {
    id: "legal-rgpd",
    rank: 14,
    title: { fr: "Mentions légales / RGPD", en: "Legal / GDPR" },
    impact: { fr: "Très fort", en: "Very high" },
    effort: { fr: "Moyen", en: "Medium" },
    priority: 14,
    progress: 0,
    whyNow: {
      fr: "Indispensable avant livraison si on collecte des emails, mais à poser autour d'un flux mail déjà fonctionnel.",
      en: "Required before shipping if emails are collected, but it should wrap an already-working email flow.",
    },
    note: {
      fr: "A traiter en fin de v0.1 : mentions, privacy, consentement explicite.",
      en: "Handle toward the end of v0.1: legal notice, privacy, explicit consent.",
    },
  },
];

const IMPLEMENTATION_PHASES: ArchitecturePlanPhase[] = [
  {
    id: "local-email",
    order: 1,
    progress: 75,
    title: { fr: "Faire marcher la collecte mail locale", en: "Make local email collection work" },
    goal: {
      fr: "Waitlist locale testable et exploitable via admin, avant smoke test Netlify.",
      en: "Local waitlist is testable and usable through admin, before the Netlify smoke test.",
    },
    guardrail: {
      fr: "Ne pas marquer terminé tant que Netlify Forms n'a pas été testé sur un deploy.",
      en: "Do not mark complete until Netlify Forms has been tested on a deploy.",
    },
    risk: { fr: "Faible à moyen : périmètre local et isolable.", en: "Low to medium: local and isolatable scope." },
    files: [
      {
        path: "apps/web/src/pages/[locale]/index.astro",
        action: "update",
        note: { fr: "Stabiliser le formulaire waitlist et ses états visibles.", en: "Stabilize the waitlist form and visible states." },
      },
      {
        path: "apps/web/public/scripts/quiz-app.js",
        action: "update",
        note: { fr: "Isoler la logique de soumission email / état submitted.", en: "Isolate email submission / submitted state logic." },
      },
      {
        path: "apps/admin/src/pages/ops/waitlist.astro",
        action: "create",
        note: { fr: "Lire les emails locaux, rafraîchir, effacer et exporter un CSV daté.", en: "Read local emails, refresh, clear, and export a dated CSV." },
      },
      {
        path: "tests/web/public-flow.spec.ts",
        action: "update",
        note: { fr: "Couvrir validation email, soumission et état déjà inscrit.", en: "Cover email validation, submission, and already-subscribed state." },
      },
    ],
  },
  {
    id: "public-shell-locale",
    order: 2,
    progress: 100,
    title: { fr: "Poser le shell public et la locale par URL", en: "Introduce public shell and locale-by-URL" },
    goal: {
      fr: "Avoir un shell public localisé, des URLs stables par langue et une racine `/` qui redirige correctement.",
      en: "Have a localized public shell, stable per-language URLs, and a `/` root that redirects correctly.",
    },
    guardrail: {
      fr: "La racine `/` résout la locale navigateur vers `/fr/` ou `/en/`, avec fallback anglais.",
      en: "Root `/` resolves the browser locale to `/fr/` or `/en/`, with English fallback.",
    },
    risk: { fr: "Moyen : changement de contrat i18n et SEO.", en: "Medium: changes the i18n and SEO contract." },
    files: [
      {
        path: "apps/web/src/lib/public-locales.ts",
        action: "create",
        note: { fr: "Définir locales publiques FR / EN et locales prévues plus tard.", en: "Define public FR / EN locales and later planned locales." },
      },
      {
        path: "apps/web/src/lib/public-routes.ts",
        action: "create",
        note: { fr: "Centraliser les routes publiques et les routes produit.", en: "Centralize public and product routes." },
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
    title: { fr: "Créer Daily / Practice / Archives", en: "Create Daily / Practice / Archives" },
    goal: {
      fr: "Donner une route réelle à chaque mode du coeur produit.",
      en: "Give each core product mode a real route.",
    },
    guardrail: {
      fr: "Les routes vivent d'abord en parallèle de l'ancien flux `#quiz`.",
      en: "Routes first live alongside the old `#quiz` flow.",
    },
    risk: { fr: "Fort : première vraie mutation de l'IA publique.", en: "High: first real public IA mutation." },
    files: [
      { path: "apps/web/src/pages/[locale]/[mode].astro", action: "create", note: { fr: "Entrées Daily / Practice / Archives pour FR / EN.", en: "Daily / Practice / Archives entries for FR / EN." } },
    ],
  },
  {
    id: "session-builders",
    order: 4,
    progress: 100,
    title: { fr: "Séparer les payloads de session", en: "Split session payloads" },
    goal: {
      fr: "Remplacer le boot mono-pack par des builders Daily / Practice / Archives.",
      en: "Replace the single-pack boot with Daily / Practice / Archives builders.",
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
        note: { fr: "Tirage Libre + 4 difficultés + cooldown sessions.", en: "Practice draw + 4 difficulties + session cooldown." },
      },
      {
        path: "shared/lib/manabuplay-archives.ts",
        action: "create",
        note: { fr: "Archives par date passée.", en: "Archives by past date." },
      },
      {
        path: "apps/web/public/scripts/quiz-app.js",
        action: "update",
        note: { fr: "Consommer un payload injecté au lieu du quiz legacy unique.", en: "Consume injected payload instead of unique legacy quiz." },
      },
    ],
  },
  {
    id: "content-readiness",
    order: 5,
    progress: 4,
    title: { fr: "Rendre le contenu v0.1 publiable", en: "Make v0.1 content publishable" },
    goal: {
      fr: "Avoir assez de contenu propre pour soutenir Daily, Libre et Archives.",
      en: "Have enough clean content to support Daily, Practice, and Archives.",
    },
    guardrail: {
      fr: "Ne pas gonfler les packs avec des mots cadeaux juste pour atteindre un chiffre.",
      en: "Do not pad packs with giveaway words just to hit a number.",
    },
    risk: { fr: "Moyen : qualité éditoriale plus lente que code.", en: "Medium: editorial quality is slower than code." },
    files: [
      {
        path: "shared/data/manabuplay/packs/v0.1/*.json",
        action: "update",
        note: { fr: "Packs 1 à 4 vers 34 mots, pack 5 refondu.", en: "Packs 1 to 4 to 34 words, pack 5 rewritten." },
      },
      {
        path: "shared/data/manabuplay/catalog.ts",
        action: "update",
        note: { fr: "Exposer le contenu nécessaire aux builders de mode.", en: "Expose content needed by mode builders." },
      },
      {
        path: "tests/unit",
        action: "update",
        note: { fr: "Couvrir ratios, cooldown et tirages de session.", en: "Cover ratios, cooldown, and session draws." },
      },
    ],
  },
  {
    id: "release-hardening",
    order: 6,
    progress: 0,
    title: { fr: "Durcir la fin de v0.1", en: "Harden the end of v0.1" },
    goal: {
      fr: "Fermer release, QA, métriques et légal une fois le produit presque en place.",
      en: "Close release, QA, metrics, and legal once the product is nearly in place.",
    },
    guardrail: {
      fr: "RGPD et mentions légales arrivent ici, pas avant la collecte mail fonctionnelle.",
      en: "GDPR and legal notices arrive here, not before the email collection works.",
    },
    risk: { fr: "Moyen : dernière ligne droite avec beaucoup de petites surfaces.", en: "Medium: final stretch with many small surfaces." },
    files: [
      {
        path: "src/pages/index.astro",
        action: "update",
        note: { fr: "Wording final du corps de landing après les vrais modes.", en: "Final landing body wording after real modes." },
      },
      {
        path: "tests/web/public-flow.spec.ts",
        action: "update",
        note: { fr: "Couvrir Daily / Practice / Archives + waitlist.", en: "Cover Daily / Practice / Archives + waitlist." },
      },
      {
        path: "src/pages/legal/*.astro",
        action: "create",
        note: { fr: "Mentions légales, privacy et consentement email explicite.", en: "Legal notice, privacy, and explicit email consent." },
      },
      {
        path: "public/scripts/analytics*.js",
        action: "create",
        note: { fr: "Clarity et métriques minimales.", en: "Clarity and minimal metrics." },
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
    advanced: EXECUTION_STEPS.filter((step) => getExecutionStatus(step.progress) === "advanced").length,
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
    done: IMPLEMENTATION_PHASES.filter((phase) => getExecutionStatus(phase.progress) === "done").length,
    advanced: IMPLEMENTATION_PHASES.filter((phase) => getExecutionStatus(phase.progress) === "advanced").length,
    active: IMPLEMENTATION_PHASES.filter((phase) => getExecutionStatus(phase.progress) === "active").length,
    framed: IMPLEMENTATION_PHASES.filter((phase) => getExecutionStatus(phase.progress) === "framed").length,
    cold: IMPLEMENTATION_PHASES.filter((phase) => getExecutionStatus(phase.progress) === "cold").length,
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
      return { fr: "Prêt", en: "Ready" };
    default:
      return { fr: "Backlog", en: "Backlog" };
  }
}

export function getArchitectureStatusTone(progress: number) {
  return getExecutionStatus(progress);
}

export function getArchitectureFileActionLabel(action: ArchitecturePlanFile["action"]): LocalizedText {
  switch (action) {
    case "create":
      return { fr: "créer", en: "create" };
    case "split":
      return { fr: "découper", en: "split" };
    default:
      return { fr: "mettre à jour", en: "update" };
  }
}
