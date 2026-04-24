import {
  buildExistingWordQuizLookup,
  getCanonicalPackFiles,
  getCanonicalPackIndex,
} from "../data/manabuplay/pack-source";

export type PackReaderWord = {
  order: number;
  difficultyTier?: 1 | 2 | 3 | 4;
  existingWordId?: string;
  jp:
    | string
    | {
        term: string;
        reading?: string;
        romaji?: string;
      };
  assist?: string;
  gloss?: {
    fr?: string;
    en?: string;
  };
  definition?: {
    fr?: string;
    en?: string;
  };
  meaning?: {
    fr?: string;
    en?: string;
  };
  hints?: {
    hint1?: {
      fr?: string;
      en?: string;
    };
    hint2?: {
      fr?: string;
      en?: string;
    };
  };
  explanation?: {
    fr?: string;
    en?: string;
  };
  quiz?: {
    distractors?: {
      fr?: string[];
      en?: string[];
    };
  };
  quizPreview?: {
    correct: {
      fr: string;
      en: string;
    };
    distractors: {
      fr: string[];
      en: string[];
    };
    answers: {
      fr: string[];
      en: string[];
    };
    correctIndex: {
      fr: number;
      en: number;
    };
  };
};

export type PackReaderPack = {
  id: string;
  slug: string;
  themeId: string;
  status: string;
  targetWordCount: number;
  tierBreakdown?: {
    total: number;
    counts: {
      1: number;
      2: number;
      3: number;
      4: number;
    };
    percents: {
      1: number;
      2: number;
      3: number;
      4: number;
    };
  };
  transparentBreakdown?: {
    strictCount: number;
    editorialCount: number;
    fillerCount: number;
    weightedScore: number;
    weightedPercent: number;
    watchThreshold: number;
    actThreshold: number;
    tone: "ok" | "watch" | "act";
    entries: Array<{
      id: string;
      order: number;
      label: string;
      level: "strict" | "editorial" | "filler";
      weight: number;
    }>;
  };
  score?: {
    readiness?: {
      value: number;
      minProdScore?: number;
      readyForProd: boolean;
      reviewStatus?: "non-relue" | "partielle" | "faite" | "validee";
      reviewProgress?: {
        reviewedWords: number;
        totalWords: number;
      };
      releaseStatus?: "dev" | "preprod" | "prod";
      breakdown: {
        packSize: number;
        tierFit: number;
        contentCompleteness: number;
        quizQuality: number;
        editorialReview: number;
      };
    };
    depth?: {
      value: number;
    };
  };
  locales: {
    fr: {
      name: string;
      description: string;
    };
    en: {
      name: string;
      description: string;
    };
  };
  quiz?: {
    transparentWordIds?: string[];
    fillerWordIds?: string[];
  };
  words: PackReaderWord[];
};

const existingQuizById = buildExistingWordQuizLookup();

function buildTierBreakdown(words: PackReaderWord[]) {
  const counts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };

  for (const word of words) {
    if (word.difficultyTier && word.difficultyTier >= 1 && word.difficultyTier <= 4) {
      counts[word.difficultyTier] += 1;
    }
  }

  const total = words.length;
  const percents = {
    1: total ? Math.round((counts[1] / total) * 100) : 0,
    2: total ? Math.round((counts[2] / total) * 100) : 0,
    3: total ? Math.round((counts[3] / total) * 100) : 0,
    4: total ? Math.round((counts[4] / total) * 100) : 0,
  };

  return {
    total,
    counts,
    percents,
  };
}

function normalizeTransparencyValue(value?: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getWordId(word: PackReaderWord) {
  const romaji = typeof word.jp === "string" ? word.assist : word.jp?.romaji;
  return word.existingWordId || romaji || `word-${word.order}`;
}

function getWordRomaji(word: PackReaderWord) {
  return typeof word.jp === "string" ? word.assist : word.jp?.romaji;
}

function isStrictTransparent(word: PackReaderWord) {
  const romaji = normalizeTransparencyValue(getWordRomaji(word));
  if (!romaji) {
    return false;
  }

  const glosses = [word.gloss?.fr || word.meaning?.fr, word.gloss?.en || word.meaning?.en];
  return glosses.some((gloss) => normalizeTransparencyValue(gloss) === romaji);
}

function buildTransparentBreakdown(
  words: PackReaderWord[],
  transparentWordIds: string[] = [],
  fillerWordIds: string[] = [],
) {
  const editorialIds = new Set(transparentWordIds);
  const fillerIds = new Set(fillerWordIds);
  const entries: NonNullable<PackReaderPack["transparentBreakdown"]>["entries"] = [];
  let strictCount = 0;
  let editorialCount = 0;
  let fillerCount = 0;
  let weightedScore = 0;

  for (const word of words) {
    const id = getWordId(word);
    const label = getWordRomaji(word) || word.existingWordId || `mot-${word.order}`;
    const isFiller = fillerIds.has(id);
    const isStrict = isStrictTransparent(word);
    const isEditorial = editorialIds.has(id);

    if (isFiller) {
      fillerCount += 1;
      weightedScore += 2;
      entries.push({ id, order: word.order, label, level: "filler", weight: 2 });
      continue;
    }

    if (isStrict) {
      strictCount += 1;
      weightedScore += 1;
      entries.push({ id, order: word.order, label, level: "strict", weight: 1 });
      continue;
    }

    if (isEditorial) {
      editorialCount += 1;
      weightedScore += 0.5;
      entries.push({ id, order: word.order, label, level: "editorial", weight: 0.5 });
    }
  }

  const total = words.length;
  const weightedPercent = total ? Math.round((weightedScore / total) * 100) : 0;
  const watchThreshold = 10;
  const actThreshold = 18;
  const tone: NonNullable<PackReaderPack["transparentBreakdown"]>["tone"] =
    weightedPercent > actThreshold ? "act" : weightedPercent > watchThreshold ? "watch" : "ok";

  return {
    strictCount,
    editorialCount,
    fillerCount,
    weightedScore,
    weightedPercent,
    watchThreshold,
    actThreshold,
    tone,
    entries,
  };
}

function pickGlossDistractors(glosses: string[], correct: string, seed: number) {
  const candidates = glosses.filter((gloss) => gloss !== correct);
  const distractors: string[] = [];

  for (let step = 0; step < candidates.length && distractors.length < 3; step += 1) {
    const candidate = candidates[(seed + step) % candidates.length];
    if (!distractors.includes(candidate)) {
      distractors.push(candidate);
    }
  }

  while (distractors.length < 3) {
    distractors.push("Distracteur à écrire.");
  }

  return distractors;
}

function hashSeed(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let result = Math.imul(value ^ (value >>> 15), value | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleParallelAnswers(
  correctFr: string,
  distractorsFr: string[],
  correctEn: string,
  distractorsEn: string[],
  seedSource: string,
) {
  const entries = [
    {
      fr: correctFr,
      en: correctEn,
      correct: true,
    },
    ...distractorsFr.slice(0, 3).map((fr, index) => ({
      fr,
      en: distractorsEn[index] || distractorsEn[0] || "Distractor to write.",
      correct: false,
    })),
  ];
  const random = mulberry32(hashSeed(seedSource));

  for (let index = entries.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [entries[index], entries[swapIndex]] = [entries[swapIndex], entries[index]];
  }

  return {
    answers: {
      fr: entries.map((entry) => entry.fr),
      en: entries.map((entry) => entry.en),
    },
    correctIndex: entries.findIndex((entry) => entry.correct),
  };
}

export function getPackIndex() {
  return getCanonicalPackIndex();
}

export function getPackById(packId: string) {
  const pack = getCanonicalPackFiles().find((candidate) => candidate.id === packId);
  if (!pack) {
    return null;
  }

  const packGlosses = pack.words
    .map((word) => word.gloss?.fr || word.meaning?.fr)
    .filter((gloss): gloss is string => Boolean(gloss));

  const words = pack.words.map((word, index) => {
    const existing = word.existingWordId ? existingQuizById.get(word.existingWordId) : null;
    const correctFr =
      word.gloss?.fr || word.meaning?.fr || existing?.correct.fr || "Réponse à écrire.";
    const correctEn =
      word.gloss?.en || word.meaning?.en || existing?.correct.en || "Answer to write.";
    const distractorsFr =
      word.quiz?.distractors?.fr?.slice(0, 3) ||
      pickGlossDistractors(packGlosses, correctFr, index * 2);
    const distractorsEn =
      word.quiz?.distractors?.en?.slice(0, 3) ||
      existing?.wrong.en?.slice(0, 3) ||
      pickGlossDistractors(
        pack.words
          .map((candidate) => candidate.gloss?.en || candidate.meaning?.en)
          .filter((gloss): gloss is string => Boolean(gloss)),
        correctEn,
        index * 3,
      );
    const shuffled = shuffleParallelAnswers(
      correctFr,
      distractorsFr,
      correctEn,
      distractorsEn,
      `${pack.id}:${word.existingWordId || word.order}:${correctFr}:${correctEn}`,
    );

    return {
      ...word,
      quizPreview: {
        correct: {
          fr: correctFr,
          en: correctEn,
        },
        distractors: {
          fr: distractorsFr,
          en: distractorsEn,
        },
        answers: shuffled.answers,
        correctIndex: {
          fr: shuffled.correctIndex,
          en: shuffled.correctIndex,
        },
      },
    };
  });

  return {
    ...pack,
    tierBreakdown: buildTierBreakdown(words),
    transparentBreakdown: buildTransparentBreakdown(
      words,
      pack.quiz?.transparentWordIds || [],
      pack.quiz?.fillerWordIds || [],
    ),
    words,
  };
}

export function getAllPacks() {
  const packs: PackReaderPack[] = [];

  for (const item of getPackIndex().packs) {
    const pack = getPackById(item.id);
    if (pack) {
      packs.push(pack);
    }
  }

  return packs;
}
