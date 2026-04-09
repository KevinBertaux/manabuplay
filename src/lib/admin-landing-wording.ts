type LocalizedText = {
  en: string;
  fr: string;
};

type WordingVariant = {
  score: number;
  note: string;
  text: LocalizedText;
};

export type LandingWordingCard = {
  id: string;
  label: LocalizedText;
  status: "todo" | "done";
  zone: "head" | "body";
  current: {
    score: number;
    verdict: string;
    text: LocalizedText;
    notes: string;
  };
  variants: {
    A?: WordingVariant;
    B?: WordingVariant;
    C?: WordingVariant;
  };
  isSummary?: boolean;
};

const BASE_CARDS: LandingWordingCard[] = [
  {
    id: "title",
    label: { fr: "Titre SEO", en: "SEO title" },
    status: "done",
    zone: "head",
    current: {
      score: 94,
      verdict: "faite",
      text: {
        en: "ManabuPlay — Learn Japanese Vocabulary Through Gaming & Pop Culture",
        fr: "ManabuPlay — Apprendre du vocabulaire japonais via le jeu vidéo et la pop culture",
      },
      notes: "title par langue validé, plus clair sur le territoire culturel que sur le format produit.",
    },
    variants: {
      A: {
        score: 87,
        note: "plus humaine",
        text: {
          en: "ManabuPlay — Learn Japanese Through Anime, JRPGs & Pop Culture",
          fr: "ManabuPlay — Apprendre le japonais via les anime, les JRPG et la pop culture",
        },
      },
      B: {
        score: 81,
        note: "plus engageante",
        text: {
          en: "ManabuPlay — The Japanese Quiz for Anime & JRPG Fans",
          fr: "ManabuPlay — Le quiz japonais pour fans d’anime et de JRPG",
        },
      },
      C: {
        score: 92,
        note: "meilleur équilibre",
        text: {
          en: "ManabuPlay — Learn Japanese Vocabulary Through Anime, JRPGs & Pop Culture",
          fr: "ManabuPlay — Apprendre du vocabulaire japonais via les anime, les JRPG et la pop culture",
        },
      },
    },
  },
  {
    id: "meta_description",
    label: { fr: "Méta description", en: "Meta description" },
    status: "done",
    zone: "head",
    current: {
      score: 94,
      verdict: "faite",
      text: {
        en: "A daily Japanese vocabulary quiz for gaming and pop culture fans who want to turn familiar words into real understanding.",
        fr: "Un quiz quotidien de vocabulaire japonais pour les fans de jeu vidéo et de pop culture qui veulent transformer des mots familiers en vraie compréhension.",
      },
      notes: "version C validée, plus claire sur la promesse quotidienne sans retomber dans le vieux MVP gaming.",
    },
    variants: {
      A: {
        score: 90,
        note: "plus large",
        text: {
          en: "A daily Japanese vocabulary quiz built for beginners, curious fans and anyone who wants to stop guessing familiar gaming and pop culture words.",
          fr: "Un quiz quotidien de vocabulaire japonais pour les débutants, les curieux et tous ceux qui veulent arrêter de deviner des mots déjà familiers du jeu vidéo et de la pop culture.",
        },
      },
      B: {
        score: 88,
        note: "plus pédagogique",
        text: {
          en: "Learn Japanese vocabulary every day through gaming and pop culture. A daily quiz for beginners and curious fans who want to understand familiar words.",
          fr: "Apprends chaque jour du vocabulaire japonais via le jeu vidéo et la pop culture. Un quiz quotidien pour les débutants et les curieux qui veulent enfin comprendre des mots familiers.",
        },
      },
      C: {
        score: 94,
        note: "validée",
        text: {
          en: "A daily Japanese vocabulary quiz for gaming and pop culture fans who want to turn familiar words into real understanding.",
          fr: "Un quiz quotidien de vocabulaire japonais pour les fans de jeu vidéo et de pop culture qui veulent transformer des mots familiers en vraie compréhension.",
        },
      },
    },
  },
  {
    id: "og_description",
    label: { fr: "Description OG", en: "OG description" },
    status: "done",
    zone: "head",
    current: {
      score: 93,
      verdict: "faite",
      text: {
        en: "A daily Japanese quiz for gaming and pop culture fans who want to understand the words they already recognize.",
        fr: "Un quiz quotidien de japonais pour les fans de jeu vidéo et de pop culture qui veulent enfin comprendre des mots qu’ils reconnaissent déjà.",
      },
      notes: "version C validée, plus naturelle pour un aperçu de partage et mieux alignée avec le hero.",
    },
    variants: {
      A: {
        score: 90,
        note: "plus directe",
        text: {
          en: "A daily Japanese vocabulary quiz for gaming and pop culture fans who want to stop guessing familiar words.",
          fr: "Un quiz quotidien de vocabulaire japonais pour les fans de jeu vidéo et de pop culture qui veulent arrêter de deviner des mots familiers.",
        },
      },
      B: {
        score: 88,
        note: "plus copy",
        text: {
          en: "Turn familiar gaming and pop culture words into real Japanese understanding with a daily quiz.",
          fr: "Transforme des mots familiers du jeu vidéo et de la pop culture en vraie compréhension du japonais avec un quiz quotidien.",
        },
      },
      C: {
        score: 93,
        note: "validée",
        text: {
          en: "A daily Japanese quiz for gaming and pop culture fans who want to understand the words they already recognize.",
          fr: "Un quiz quotidien de japonais pour les fans de jeu vidéo et de pop culture qui veulent enfin comprendre des mots qu’ils reconnaissent déjà.",
        },
      },
    },
  },
  {
    id: "nav_cta",
    label: { fr: "CTA nav", en: "Nav CTA" },
    status: "todo",
    zone: "body",
    current: {
      score: 74,
      verdict: "retouche légère",
      text: {
        en: "Play Quiz →",
        fr: "Jouer au Quiz →",
      },
      notes: "EN correct, FR un peu moins naturel",
    },
    variants: {
      A: {
        score: 90,
        note: "plus humaine",
        text: {
          en: "Start Quiz →",
          fr: "Lancer le quiz →",
        },
      },
      B: {
        score: 79,
        note: "plus engageante",
        text: {
          en: "Play Now →",
          fr: "Jouer maintenant →",
        },
      },
      C: {
        score: 91,
        note: "meilleur équilibre",
        text: {
          en: "Start the Quiz →",
          fr: "Lancer le quiz →",
        },
      },
    },
  },
  {
    id: "hero_badge",
    label: { fr: "Badge hero", en: "Hero badge" },
    status: "todo",
    zone: "body",
    current: {
      score: 62,
      verdict: "à reprendre",
      text: {
        en: "FREE · No sign-up · 50 words · 4 difficulties",
        fr: "GRATUIT · Sans inscription · 50 mots · 4 difficultés",
      },
      notes: "50 mots est fragile et bientôt faux",
    },
    variants: {
      A: {
        score: 89,
        note: "plus humaine",
        text: {
          en: "Free · No sign-up · 4 difficulty levels",
          fr: "Gratuit · Sans inscription · 4 niveaux",
        },
      },
      B: {
        score: 82,
        note: "plus engageante",
        text: {
          en: "Free quiz · Instant play · 4 levels",
          fr: "Quiz gratuit · Démarrage immédiat · 4 niveaux",
        },
      },
      C: {
        score: 89,
        note: "meilleur équilibre",
        text: {
          en: "Free · No sign-up · Instant play · 4 levels",
          fr: "Gratuit · Sans inscription · Démarrage immédiat · 4 niveaux",
        },
      },
    },
  },
  {
    id: "hero_tagline",
    label: { fr: "Tagline hero", en: "Hero tagline" },
    status: "todo",
    zone: "body",
    current: {
      score: 55,
      verdict: "à reprendre",
      text: {
        en: "Learn Japanese like a true gamer. Master the words behind your favorite anime & JRPGs.",
        fr: "Apprends le japonais comme un vrai gamer. Maîtrise les mots de tes anime & JRPGs préférés.",
      },
      notes: "like a true gamer est la ligne la moins humaine du lot",
    },
    variants: {
      A: {
        score: 94,
        note: "plus humaine",
        text: {
          en: "Learn Japanese through anime, JRPGs and Japanese pop culture.",
          fr: "Apprends du vocabulaire japonais à travers les anime, les JRPG et la culture pop japonaise.",
        },
      },
      B: {
        score: 83,
        note: "plus engageante",
        text: {
          en: "Turn your anime and JRPG obsession into real Japanese vocabulary.",
          fr: "Transforme ton obsession anime et JRPG en vrai vocabulaire japonais.",
        },
      },
      C: {
        score: 95,
        note: "meilleur équilibre",
        text: {
          en: "Learn Japanese vocabulary through anime, JRPGs and Japanese pop culture.",
          fr: "Apprends du vocabulaire japonais via les anime, les JRPG et la culture pop japonaise.",
        },
      },
    },
  },
  {
    id: "hero_sub",
    label: { fr: "Sous-texte hero", en: "Hero sub copy" },
    status: "done",
    zone: "body",
    current: {
      score: 95,
      verdict: "faite",
      text: {
        en: "You already know these anime and JRPG words. Start understanding them.",
        fr: "Tu connais déjà ces mots d’anime et de JRPG. Commence à les comprendre.",
      },
      notes: "option 2 validée et appliquée sur la landing",
    },
    variants: {
      A: {
        score: 92,
        note: "plus humaine",
        text: {
          en: "Start with familiar words, then learn what they really mean in Japanese.",
          fr: "Commence par des mots qui te semblent familiers, puis découvre ce qu’ils veulent vraiment dire en japonais.",
        },
      },
      B: {
        score: 77,
        note: "plus engageante",
        text: {
          en: "Boss, isekai, senpai: stop guessing, start understanding.",
          fr: "Boss, isekai, senpai : arrête de deviner, commence à comprendre.",
        },
      },
      C: {
        score: 93,
        note: "meilleur équilibre",
        text: {
          en: "Start with words that already feel familiar, then understand how they work in Japanese.",
          fr: "Pars de mots qui te semblent déjà familiers, puis comprends comment ils fonctionnent vraiment en japonais.",
        },
      },
    },
  },
  {
    id: "hero_cta",
    label: { fr: "CTA hero", en: "Hero CTA" },
    status: "todo",
    zone: "body",
    current: {
      score: 72,
      verdict: "retouche légère",
      text: {
        en: "▶ START QUIZ — FREE",
        fr: "▶ COMMENCER — GRATUIT",
      },
      notes: "énergique mais un peu crié",
    },
    variants: {
      A: {
        score: 91,
        note: "plus humaine",
        text: {
          en: "Start the free quiz",
          fr: "Lancer le quiz gratuit",
        },
      },
      B: {
        score: 83,
        note: "plus engageante",
        text: {
          en: "Play Free Now",
          fr: "Jouer gratuitement",
        },
      },
      C: {
        score: 91,
        note: "meilleur équilibre",
        text: {
          en: "Start the free quiz",
          fr: "Lancer le quiz gratuit",
        },
      },
    },
  },
  {
    id: "hero_how",
    label: { fr: "Lien hero", en: "Hero secondary link" },
    status: "todo",
    zone: "body",
    current: {
      score: 88,
      verdict: "garder",
      text: {
        en: "How it works ↓",
        fr: "Comment ça marche ↓",
      },
      notes: "déjà bon, la flèche peut rester ou non",
    },
    variants: {
      A: {
        score: 90,
        note: "plus humaine",
        text: {
          en: "How it works",
          fr: "Comment ça marche",
        },
      },
      B: {
        score: 87,
        note: "plus engageante",
        text: {
          en: "See how it works",
          fr: "Voir comment ça marche",
        },
      },
      C: {
        score: 90,
        note: "meilleur équilibre",
        text: {
          en: "How it works",
          fr: "Comment ça marche",
        },
      },
    },
  },
  {
    id: "hero_stats",
    label: { fr: "Stats hero", en: "Hero stats" },
    status: "todo",
    zone: "body",
    current: {
      score: 59,
      verdict: "à reprendre",
      text: {
        en: "50 / 4 / 0¥ + WORDS / DIFFICULTIES / ALWAYS FREE",
        fr: "50 / 4 / 0¥ + MOTS / DIFFICULTÉS / TOUJOURS GRATUIT",
      },
      notes: "lisible, mais 50 et 0¥ font gadget ou daté",
    },
    variants: {
      A: {
        score: 87,
        note: "plus humaine",
        text: {
          en: "150 words / 5 packs / Free",
          fr: "150 mots / 5 packs / Gratuit",
        },
      },
      B: {
        score: 84,
        note: "plus engageante",
        text: {
          en: "5 packs / 4 levels / Free",
          fr: "5 packs / 4 niveaux / Gratuit",
        },
      },
      C: {
        score: 90,
        note: "meilleur équilibre",
        text: {
          en: "5 packs / 150 words / Free",
          fr: "5 packs / 150 mots / Gratuit",
        },
      },
    },
  },
];

function getAverage(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function getLandingWordingCards() {
  const summaryCard: LandingWordingCard = {
    id: "lot_1_summary",
    label: { fr: "Bilan lot 1", en: "Lot 1 summary" },
    status: "todo",
    zone: "body",
    isSummary: true,
    current: {
      score: getAverage(BASE_CARDS.map((card) => card.current.score)),
      verdict: "vue d'ensemble",
      text: {
        en: "Average score of the current wording across the whole lot.",
        fr: "Score moyen du wording actuel sur l’ensemble du lot.",
      },
      notes: "Permet de juger la direction globale avant de retoucher bloc par bloc.",
    },
    variants: {
      A: {
        score: getAverage(
          BASE_CARDS.map((card) => card.variants.A?.score ?? 0).filter((score) => score > 0),
        ),
        note: "plus humaine",
        text: {
          en: "Average score of version A across the whole lot.",
          fr: "Score moyen de la version A sur l’ensemble du lot.",
        },
      },
      B: {
        score: getAverage(
          BASE_CARDS.map((card) => card.variants.B?.score ?? 0).filter((score) => score > 0),
        ),
        note: "plus engageante",
        text: {
          en: "Average score of version B across the whole lot.",
          fr: "Score moyen de la version B sur l’ensemble du lot.",
        },
      },
      C: {
        score: getAverage(
          BASE_CARDS.map((card) => card.variants.C?.score ?? 0).filter((score) => score > 0),
        ),
        note: "meilleur équilibre",
        text: {
          en: "Average score of version C across the whole lot.",
          fr: "Score moyen de la version C sur l’ensemble du lot.",
        },
      },
    },
  };

  return [summaryCard, ...BASE_CARDS];
}

export function getLandingWordingProgress() {
  const total = BASE_CARDS.length;
  const done = BASE_CARDS.filter((card) => card.status === "done").length;
  return { done, total };
}
