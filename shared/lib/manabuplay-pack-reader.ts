import fs from "node:fs";
import path from "node:path";
import { MVP_QUIZ_DATA } from "../data/manabuplay/raw.generated.js";

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
    count: number;
    percent: number;
    watchThreshold: number;
    actThreshold: number;
    tone: "ok" | "watch" | "act";
  };
  score?: {
    readiness?: {
      value: number;
      minProdScore?: number;
      readyForProd: boolean;
      reviewStatus?: "non-relue" | "partielle" | "faite" | "validee";
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
  };
  words: PackReaderWord[];
};

type PackIndex = {
  packs: Array<{
    id: string;
    path: string;
    existingWords: number;
    plannedWords: number;
  }>;
};

const packsRoot = path.join(process.cwd(), "shared", "data", "manabuplay", "packs", "v0.1");

function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildLegacyLookup() {
  const wordIds = new Set<string>();
  const lookup = new Map<
    string,
    {
      correct: { fr: string; en: string };
      wrong: { fr: string[]; en: string[] };
    }
  >();

  for (const [index, entry] of MVP_QUIZ_DATA.entries()) {
    const seed = slugify(entry.kana) || slugify(entry.word) || `word-${index + 1}`;
    let candidate = seed;
    let suffix = 2;
    while (wordIds.has(candidate)) {
      candidate = `${seed}-${suffix}`;
      suffix += 1;
    }
    wordIds.add(candidate);
    lookup.set(candidate, {
      correct: entry.correct,
      wrong: entry.wrong,
    });
  }

  return lookup;
}

const legacyQuizById = buildLegacyLookup();

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

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

function buildTransparentBreakdown(words: PackReaderWord[], transparentWordIds: string[] = []) {
  const ids = new Set(transparentWordIds);
  const count = words.filter((word) => {
    const romaji = typeof word.jp === "string" ? undefined : word.jp?.romaji;
    const wordId = word.existingWordId || romaji || `word-${word.order}`;
    return ids.has(wordId);
  }).length;
  const total = words.length;
  const percent = total ? Math.round((count / total) * 100) : 0;
  const watchThreshold = 10;
  const actThreshold = 15;
  const tone: NonNullable<PackReaderPack["transparentBreakdown"]>["tone"] =
    percent > actThreshold ? "act" : percent > watchThreshold ? "watch" : "ok";

  return {
    count,
    percent,
    watchThreshold,
    actThreshold,
    tone,
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
  return readJson<PackIndex>(path.join(packsRoot, "index.json"));
}

export function getPackById(packId: string) {
  const index = getPackIndex();
  const match = index.packs.find((pack) => pack.id === packId);
  if (!match) {
    return null;
  }

  const pack = readJson<PackReaderPack>(path.join(packsRoot, path.basename(match.path)));
  const packGlosses = pack.words
    .map((word) => word.gloss?.fr || word.meaning?.fr)
    .filter((gloss): gloss is string => Boolean(gloss));

  const words = pack.words.map((word, index) => {
    const legacy = word.existingWordId ? legacyQuizById.get(word.existingWordId) : null;
    const correctFr = word.gloss?.fr || word.meaning?.fr || legacy?.correct.fr || "Réponse à écrire.";
    const correctEn = word.gloss?.en || word.meaning?.en || legacy?.correct.en || "Answer to write.";
    const distractorsFr =
      word.quiz?.distractors?.fr?.slice(0, 3) ||
      pickGlossDistractors(packGlosses, correctFr, index * 2);
    const distractorsEn =
      word.quiz?.distractors?.en?.slice(0, 3) ||
      legacy?.wrong.en?.slice(0, 3) ||
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
    transparentBreakdown: buildTransparentBreakdown(words, pack.quiz?.transparentWordIds || []),
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
