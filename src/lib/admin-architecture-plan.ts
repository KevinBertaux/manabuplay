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
    id: "landing-wording",
    rank: 1,
    title: {
      fr: "Wording landing",
      en: "Landing wording",
    },
    impact: {
      fr: "Très fort",
      en: "Very high",
    },
    effort: {
      fr: "Moyen",
      en: "Medium",
    },
    priority: 1,
    progress: 45,
    whyNow: {
      fr: "La promesse tete de page est maintenant bien mieux cadrée, mais il reste tout le corps de landing à finir.",
      en: "The top-of-page promise is now much clearer, but the rest of the landing still needs a full pass.",
    },
    note: {
      fr: "Head + hero largement avancés. Nav CTA, features, quiz public, waitlist et footer encore ouverts.",
      en: "Head + hero are well advanced. Nav CTA, features, public quiz, waitlist, and footer remain open.",
    },
  },
  {
    id: "metrics",
    rank: 2,
    title: {
      fr: "Métriques produit minimales",
      en: "Minimal product metrics",
    },
    impact: {
      fr: "Très fort",
      en: "Very high",
    },
    effort: {
      fr: "Moyen",
      en: "Medium",
    },
    priority: 2,
    progress: 10,
    whyNow: {
      fr: "Les outils sont choisis, mais rien n'est branché. Sans mesure, la landing et la waitlist avancent à l'aveugle.",
      en: "The tools are chosen, but nothing is wired yet. Without measurement, the landing and waitlist are still blind.",
    },
    note: {
      fr: "Attention Insight et Microsoft Clarity sont cadrés, pas encore intégrés.",
      en: "Attention Insight and Microsoft Clarity are framed, but not integrated.",
    },
  },
  {
    id: "pack-5",
    rank: 3,
    title: {
      fr: "Pack 5 : refonte vocab-first",
      en: "Pack 5: vocab-first rewrite",
    },
    impact: {
      fr: "Très fort",
      en: "Very high",
    },
    effort: {
      fr: "Moyen",
      en: "Medium",
    },
    priority: 3,
    progress: 12,
    whyNow: {
      fr: "Le problème éditorial est clair et documenté, mais le pack n'est toujours pas publiable.",
      en: "The editorial problem is clear and documented, but the pack is still not publishable.",
    },
    note: {
      fr: "Diagnostic fait : trop de cadeaux et ligne éditoriale hors produit. Refonte non commencée.",
      en: "Diagnosis is done: too many giveaways and the wrong editorial line. Rewrite not started.",
    },
  },
  {
    id: "quiz-hint2-explanation",
    rank: 4,
    title: {
      fr: "Hint2 + explanation dans le quiz public",
      en: "Hint2 + explanation in the public quiz",
    },
    impact: {
      fr: "Fort",
      en: "High",
    },
    effort: {
      fr: "Moyen",
      en: "Medium",
    },
    priority: 4,
    progress: 0,
    whyNow: {
      fr: "Le modèle de données le permet déjà, mais l'UI publique ne l'exploite toujours pas.",
      en: "The data model already supports it, but the public UI still does not use it.",
    },
    note: {
      fr: "Aucun branchement visible côté joueur pour l'instant.",
      en: "No player-facing wiring yet.",
    },
  },
  {
    id: "mobile-qa",
    rank: 5,
    title: {
      fr: "QA mobile réelle du site public",
      en: "Real mobile QA of the public site",
    },
    impact: {
      fr: "Très fort",
      en: "Very high",
    },
    effort: {
      fr: "Moyen",
      en: "Medium",
    },
    priority: 5,
    progress: 0,
    whyNow: {
      fr: "Le site public a grossi, mais il n'y a pas encore eu de passe mobile dédiée.",
      en: "The public site has grown, but there has not been a dedicated mobile QA pass yet.",
    },
    note: {
      fr: "Travail entièrement à faire.",
      en: "Still entirely to do.",
    },
  },
  {
    id: "playwright",
    rank: 6,
    title: {
      fr: "Playwright E2E fin de v0.1",
      en: "Playwright E2E for the end of v0.1",
    },
    impact: {
      fr: "Fort",
      en: "High",
    },
    effort: {
      fr: "Moyen",
      en: "Medium",
    },
    priority: 6,
    progress: 20,
    whyNow: {
      fr: "Il y a déjà des gardes-fous UI et quelques smoke tests, mais pas encore de couverture critique des parcours publics.",
      en: "There are already UI guards and a few smoke tests, but the critical public flows are not covered yet.",
    },
    note: {
      fr: "Base de test existante, objectif produit encore ouvert.",
      en: "A test base exists, but the product goal remains open.",
    },
  },
  {
    id: "default-locale",
    rank: 7,
    title: {
      fr: "Langue locale par défaut",
      en: "Default locale by user language",
    },
    impact: {
      fr: "Moyen",
      en: "Medium",
    },
    effort: {
      fr: "Faible",
      en: "Low",
    },
    priority: 7,
    progress: 5,
    whyNow: {
      fr: "Le switch existe, mais l'architecture locale est encore client-side et fragile.",
      en: "The switch exists, but the locale architecture is still client-side and fragile.",
    },
    note: {
      fr: "Préférence locale seulement en localStorage, pas de vraie locale par URL.",
      en: "Locale preference only lives in localStorage, with no real locale-by-URL yet.",
    },
  },
  {
    id: "waitlist",
    rank: 8,
    title: {
      fr: "Waitlist : stabilité + wording",
      en: "Waitlist: stability + wording",
    },
    impact: {
      fr: "Fort",
      en: "High",
    },
    effort: {
      fr: "Faible à moyen",
      en: "Low to medium",
    },
    priority: 8,
    progress: 25,
    whyNow: {
      fr: "Le flux existe déjà, mais il n'est pas encore traité comme une vraie surface de prod.",
      en: "The flow already exists, but it is not treated as a real production surface yet.",
    },
    note: {
      fr: "Formulaire présent, wording et robustesse encore à finir.",
      en: "The form exists, but wording and robustness are still unfinished.",
    },
  },
  {
    id: "landing-placement",
    rank: 9,
    title: {
      fr: "Placement des blocs landing",
      en: "Landing block placement",
    },
    impact: {
      fr: "Moyen",
      en: "Medium",
    },
    effort: {
      fr: "Moyen",
      en: "Medium",
    },
    priority: 9,
    progress: 40,
    whyNow: {
      fr: "Le macro-placement hero -> quiz -> features -> waitlist est fait, mais la passe fine sur hero/nav et le couloir d'action reste à faire.",
      en: "The macro placement hero -> quiz -> features -> waitlist is done, but the fine pass on hero/nav and the action corridor is still missing.",
    },
    note: {
      fr: "La hiérarchie générale est meilleure, la micro-hiérarchie ne l'est pas encore.",
      en: "The overall hierarchy is better, but the micro hierarchy is not there yet.",
    },
  },
  {
    id: "hint-score-gameplay",
    rank: 10,
    title: {
      fr: "Score / gameplay liés aux hints",
      en: "Score / gameplay tied to hints",
    },
    impact: {
      fr: "Moyen",
      en: "Medium",
    },
    effort: {
      fr: "Moyen",
      en: "Medium",
    },
    priority: 10,
    progress: 0,
    whyNow: {
      fr: "Le produit n'a pas encore relié l'aide fournie et la logique de score.",
      en: "The product still does not connect the help system and the scoring logic.",
    },
    note: {
      fr: "Sujet entièrement en attente.",
      en: "Still fully pending.",
    },
  },
  {
    id: "tts",
    rank: 11,
    title: {
      fr: "TTS au clic",
      en: "Click-to-play TTS",
    },
    impact: {
      fr: "Fort",
      en: "High",
    },
    effort: {
      fr: "Moyen",
      en: "Medium",
    },
    priority: 11,
    progress: 0,
    whyNow: {
      fr: "Bonne valeur pédagogique, mais hors chemin critique tant que le coeur Daily / Practice / Archives n'est pas posé.",
      en: "Strong learning value, but off the critical path until the Daily / Practice / Archives core exists.",
    },
    note: {
      fr: "Aucun travail engagé.",
      en: "No work started.",
    },
  },
  {
    id: "pack-loaders",
    rank: 12,
    title: {
      fr: "Résilience loaders packs",
      en: "Pack loader resilience",
    },
    impact: {
      fr: "Moyen",
      en: "Medium",
    },
    effort: {
      fr: "Moyen",
      en: "Medium",
    },
    priority: 12,
    progress: 15,
    whyNow: {
      fr: "Le catalogue et la lecture admin existent, mais le fallback produit n'est pas encore traité.",
      en: "The catalog and admin reading flows exist, but product-grade fallback behavior is still missing.",
    },
    note: {
      fr: "Le besoin est cadré dans l'atlas, pas encore dans le code runtime.",
      en: "The need is framed in the atlas, but not yet in runtime code.",
    },
  },
  {
    id: "home-components",
    rank: 13,
    title: {
      fr: "Découpage home en composants",
      en: "Split home into components",
    },
    impact: {
      fr: "Moyen",
      en: "Medium",
    },
    effort: {
      fr: "Moyen",
      en: "Medium",
    },
    priority: 13,
    progress: 0,
    whyNow: {
      fr: "La home reste monolithique, ce qui bloque la future navigation produit et la vraie architecture locale.",
      en: "The home page is still monolithic, which blocks future product navigation and real locale architecture.",
    },
    note: {
      fr: "Chantier pas encore ouvert dans le code.",
      en: "No code work started yet.",
    },
  },
  {
    id: "seo-packs",
    rank: 14,
    title: {
      fr: "Packs SEO réels",
      en: "Real SEO packs",
    },
    impact: {
      fr: "Très fort",
      en: "Very high",
    },
    effort: {
      fr: "Élevé",
      en: "High",
    },
    priority: 14,
    progress: 0,
    whyNow: {
      fr: "Le coeur public n'est pas encore assez stable pour ouvrir une vraie couche d'acquisition organique.",
      en: "The public core is not stable enough yet to open a true organic acquisition layer.",
    },
    note: {
      fr: "À garder hors du chemin critique tant que v0.1 n'est pas propre.",
      en: "Keep it out of the critical path until v0.1 is clean.",
    },
  },
];

const IMPLEMENTATION_PHASES: ArchitecturePlanPhase[] = [
  {
    id: "landing-cleanup",
    order: 1,
    progress: 38,
    title: {
      fr: "Nettoyer la page publique actuelle avant la scission",
      en: "Clean up the current public page before the split",
    },
    goal: {
      fr: "Corriger les incohérences déjà visibles sans changer encore l'architecture publique.",
      en: "Fix the visible inconsistencies first, without changing the public architecture yet.",
    },
    guardrail: {
      fr: "On garde le MVP mono-page vivant pendant cette phase. Aucun cutover de route.",
      en: "Keep the single-page MVP alive during this phase. No route cutover yet.",
    },
    risk: {
      fr: "Faible : corrections locales, pas de migration d'URL.",
      en: "Low risk: local corrections, no URL migration.",
    },
    files: [
      {
        path: "src/pages/index.astro",
        action: "update",
        note: {
          fr: "Corriger le CTA hero en lien sémantique, retirer ou neutraliser le faux CTA nav, mettre les vraies stats hero, préparer des liens propres.",
          en: "Fix the hero CTA as a semantic link, remove or neutralize the fake nav CTA, ship the real hero stats, and prepare clean links.",
        },
      },
      {
        path: "public/scripts/quiz-app.js",
        action: "update",
        note: {
          fr: "Empêcher le rerandom au changement de langue et sortir la logique i18n la plus fragile du flux de quiz.",
          en: "Stop rerandomization on language change and remove the most fragile i18n behavior from the quiz flow.",
        },
      },
      {
        path: "src/data/manabuplay/raw.generated.js",
        action: "update",
        note: {
          fr: "Aligner les labels nav et hero avec la future IA Daily / Practice / Archives.",
          en: "Align nav and hero labels with the future Daily / Practice / Archives IA.",
        },
      },
      {
        path: "src/styles/app.css",
        action: "update",
        note: {
          fr: "Créer un socle de styles pour liens de nav, actions secondaires et CTA de lien sans bouton imbriqué.",
          en: "Create base styles for nav links, secondary actions, and link-style CTAs without nested buttons.",
        },
      },
      {
        path: "tests/home-layout.spec.ts",
        action: "update",
        note: {
          fr: "Verrouiller le shell public actuel avant la migration de routes.",
          en: "Lock the current public shell before the route migration.",
        },
      },
    ],
  },
  {
    id: "locale-foundation",
    order: 2,
    progress: 14,
    title: {
      fr: "Poser la locale par URL sans casser l'existant",
      en: "Introduce locale-by-URL without breaking the current site",
    },
    goal: {
      fr: "Sortir du toggle client-side et rendre chaque page adressable en FR et EN.",
      en: "Move away from the client-side toggle and make each page addressable in FR and EN.",
    },
    guardrail: {
      fr: "Le `/` actuel reste un filet de sécurité tant que `/fr` et `/en` ne sont pas stables.",
      en: "The current `/` stays as a safety net until `/fr` and `/en` are stable.",
    },
    risk: {
      fr: "Moyen : changement de contrat SEO et i18n, mais sans toucher encore aux modes produit.",
      en: "Medium risk: this changes the SEO and i18n contract, but not the product modes yet.",
    },
    files: [
      {
        path: "src/lib/site-locale.ts",
        action: "create",
        note: {
          fr: "Définir les locales autorisées, la locale inverse et le fallback.",
          en: "Define allowed locales, the inverse locale, and fallback behavior.",
        },
      },
      {
        path: "src/lib/site-routes.ts",
        action: "create",
        note: {
          fr: "Centraliser la construction des routes landing, daily, practice et archives.",
          en: "Centralize route building for landing, daily, practice, and archives.",
        },
      },
      {
        path: "src/pages/fr/index.astro",
        action: "create",
        note: {
          fr: "Nouvelle landing FR à URL stable.",
          en: "New FR landing with a stable URL.",
        },
      },
      {
        path: "src/pages/en/index.astro",
        action: "create",
        note: {
          fr: "Nouvelle landing EN à URL stable.",
          en: "New EN landing with a stable URL.",
        },
      },
      {
        path: "src/pages/index.astro",
        action: "update",
        note: {
          fr: "Le garder comme fallback temporaire ou point d'entrée neutre pendant la migration.",
          en: "Keep it as a temporary fallback or neutral entry point during the migration.",
        },
      },
    ],
  },
  {
    id: "shared-public-shell",
    order: 3,
    progress: 6,
    title: {
      fr: "Extraire le shell public partagé",
      en: "Extract the shared public shell",
    },
    goal: {
      fr: "Arrêter le monolithe home et préparer une vraie navigation produit.",
      en: "Stop the home-page monolith and prepare a real product navigation shell.",
    },
    guardrail: {
      fr: "On factorise d'abord l'habillage, pas la logique Daily / Practice / Archives.",
      en: "Factorize the shell first, not the Daily / Practice / Archives logic yet.",
    },
    risk: {
      fr: "Moyen : beaucoup de déplacement de markup, peu de changement fonctionnel.",
      en: "Medium risk: lots of markup movement, little functional change.",
    },
    files: [
      {
        path: "src/components/public/PublicHeader.astro",
        action: "create",
        note: {
          fr: "Header public avec zone utilitaire + nav produit, sans faux CTA nav.",
          en: "Public header with a utility area + product nav, without the fake nav CTA.",
        },
      },
      {
        path: "src/components/public/ProductNav.astro",
        action: "create",
        note: {
          fr: "Nav Daily / Practice / Archives avec état actif et liens propres.",
          en: "Daily / Practice / Archives nav with active state and clean links.",
        },
      },
      {
        path: "src/components/public/LocaleSwitch.astro",
        action: "create",
        note: {
          fr: "Switch de langue vers la page équivalente, pas un toggle JS de surface.",
          en: "Language switch to the equivalent page, not a superficial JS toggle.",
        },
      },
      {
        path: "src/components/public/PublicFooter.astro",
        action: "create",
        note: {
          fr: "Footer partagé entre landing et futures pages produit.",
          en: "Shared footer for landing and future product pages.",
        },
      },
      {
        path: "src/pages/fr/index.astro",
        action: "split",
        note: {
          fr: "Brancher la landing FR sur le shell partagé.",
          en: "Wire the FR landing to the shared shell.",
        },
      },
      {
        path: "src/pages/en/index.astro",
        action: "split",
        note: {
          fr: "Brancher la landing EN sur le shell partagé.",
          en: "Wire the EN landing to the shared shell.",
        },
      },
    ],
  },
  {
    id: "product-routes",
    order: 4,
    progress: 0,
    title: {
      fr: "Créer les vraies routes produit",
      en: "Create the real product routes",
    },
    goal: {
      fr: "Faire disparaître la logique \"landing + ancre quiz\" et donner une vraie destination à chaque mode.",
      en: "Remove the \"landing + quiz anchor\" logic and give each mode a real destination.",
    },
    guardrail: {
      fr: "Les nouvelles routes vivent en parallèle avant que la landing ne bascule complètement dessus.",
      en: "The new routes live in parallel before the landing fully switches to them.",
    },
    risk: {
      fr: "Moyen à fort : première vraie mutation d'IA publique.",
      en: "Medium to high risk: the first real public IA mutation.",
    },
    files: [
      {
        path: "src/pages/fr/daily.astro",
        action: "create",
        note: {
          fr: "Entrée Quotidien FR.",
          en: "FR Daily entry point.",
        },
      },
      {
        path: "src/pages/en/daily.astro",
        action: "create",
        note: {
          fr: "Entrée Quotidien EN.",
          en: "EN Daily entry point.",
        },
      },
      {
        path: "src/pages/fr/practice.astro",
        action: "create",
        note: {
          fr: "Entrée Entraînement FR.",
          en: "FR Practice entry point.",
        },
      },
      {
        path: "src/pages/en/practice.astro",
        action: "create",
        note: {
          fr: "Entrée Entraînement EN.",
          en: "EN Practice entry point.",
        },
      },
      {
        path: "src/pages/fr/archives.astro",
        action: "create",
        note: {
          fr: "Hub Archives FR.",
          en: "FR Archives hub.",
        },
      },
      {
        path: "src/pages/en/archives.astro",
        action: "create",
        note: {
          fr: "Hub Archives EN.",
          en: "EN Archives hub.",
        },
      },
      {
        path: "src/components/public/ModeShell.astro",
        action: "create",
        note: {
          fr: "Socle commun pour les pages quiz Daily / Practice / Archives.",
          en: "Shared shell for Daily / Practice / Archives quiz pages.",
        },
      },
    ],
  },
  {
    id: "mode-boot-data",
    order: 5,
    progress: 0,
    title: {
      fr: "Séparer les payloads Daily / Practice / Archives",
      en: "Split the Daily / Practice / Archives payloads",
    },
    goal: {
      fr: "Sortir du boot legacy mono-pack et donner à chaque route son contrat de données.",
      en: "Move away from the legacy single-pack boot contract and give each route its own data contract.",
    },
    guardrail: {
      fr: "Le moteur de quiz reste unique, mais il reçoit enfin un mode et un payload explicites.",
      en: "Keep a single quiz engine, but finally feed it an explicit mode and payload.",
    },
    risk: {
      fr: "Fort : c'est la vraie bascule de modèle côté runtime.",
      en: "High risk: this is the real runtime model shift.",
    },
    files: [
      {
        path: "src/data/manabuplay/catalog.ts",
        action: "update",
        note: {
          fr: "Remplacer le contrat `DEFAULT_PACK_ID` / `buildMvpBootData()` par des builders par mode.",
          en: "Replace the `DEFAULT_PACK_ID` / `buildMvpBootData()` contract with mode-specific builders.",
        },
      },
      {
        path: "src/lib/manabuplay-daily.ts",
        action: "create",
        note: {
          fr: "Génération et lecture du Quotidien.",
          en: "Daily generation and reading logic.",
        },
      },
      {
        path: "src/lib/manabuplay-practice.ts",
        action: "create",
        note: {
          fr: "Tirage du mode Entraînement et gestion des 4 difficultés.",
          en: "Practice-mode draws and the 4-difficulty contract.",
        },
      },
      {
        path: "src/lib/manabuplay-archives.ts",
        action: "create",
        note: {
          fr: "Accès aux archives par date passée et mapping de route.",
          en: "Archive access by past date and route mapping.",
        },
      },
      {
        path: "src/lib/manabuplay-session.ts",
        action: "create",
        note: {
          fr: "Normaliser le payload de session consommé par le front.",
          en: "Normalize the session payload consumed by the front-end.",
        },
      },
      {
        path: "public/scripts/quiz-app.js",
        action: "update",
        note: {
          fr: "Consommer un payload de session injecté par page au lieu d'inférer un seul quiz legacy.",
          en: "Consume a page-injected session payload instead of inferring a single legacy quiz.",
        },
      },
    ],
  },
  {
    id: "cutover-cleanup",
    order: 6,
    progress: 0,
    title: {
      fr: "Brancher la nav finale et couper l'ancien flux ancré",
      en: "Wire the final nav and remove the old anchor-only flow",
    },
    goal: {
      fr: "Faire du hero un vrai point d'entrée Daily et du header une vraie nav produit.",
      en: "Make the hero a real Daily entry point and the header a real product nav.",
    },
    guardrail: {
      fr: "On ne coupe `#quiz` qu'une fois les routes produit, la locale par URL et le moteur unifié validés.",
      en: "Do not remove `#quiz` until product routes, locale-by-URL, and the unified engine are all validated.",
    },
    risk: {
      fr: "Fort : c'est la bascule visible pour l'utilisateur.",
      en: "High risk: this is the user-facing cutover.",
    },
    files: [
      {
        path: "src/pages/fr/index.astro",
        action: "update",
        note: {
          fr: "Faire pointer le CTA hero vers `/fr/daily` et ajuster le lien secondaire selon la nouvelle hiérarchie.",
          en: "Point the hero CTA to `/fr/daily` and adjust the secondary link to the new hierarchy.",
        },
      },
      {
        path: "src/pages/en/index.astro",
        action: "update",
        note: {
          fr: "Faire pointer le CTA hero vers `/en/daily` et aligner la nav EN.",
          en: "Point the hero CTA to `/en/daily` and align the EN nav.",
        },
      },
      {
        path: "src/components/public/PublicHeader.astro",
        action: "update",
        note: {
          fr: "Activer la nav définitive Daily / Practice / Archives et retirer le faux CTA nav.",
          en: "Enable the final Daily / Practice / Archives nav and remove the fake nav CTA.",
        },
      },
      {
        path: "src/pages/index.astro",
        action: "update",
        note: {
          fr: "Le transformer en fallback propre ou en redirection maîtrisée vers la locale voulue.",
          en: "Turn it into a clean fallback or a controlled redirect to the desired locale.",
        },
      },
      {
        path: "tests/home-layout.spec.ts",
        action: "update",
        note: {
          fr: "Mettre à jour la smoke du shell landing final.",
          en: "Update the smoke coverage for the final landing shell.",
        },
      },
      {
        path: "tests/public-routes.spec.ts",
        action: "create",
        note: {
          fr: "Vérifier Daily / Practice / Archives + switch FR/EN + CTA de landing.",
          en: "Verify Daily / Practice / Archives + FR/EN switch + landing CTA.",
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
      return { fr: "fait", en: "done" };
    case "advanced":
      return { fr: "bien avancé", en: "well advanced" };
    case "active":
      return { fr: "en cours", en: "in progress" };
    case "framed":
      return { fr: "cadré", en: "framed" };
    default:
      return { fr: "froid", en: "cold" };
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
