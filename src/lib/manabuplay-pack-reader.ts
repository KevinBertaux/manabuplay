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
    correct: string;
    distractors: string[];
    answers: string[];
    correctIndex: number;
  };
};

export type PackReaderPack = {
  id: string;
  slug: string;
  themeId: string;
  status: string;
  targetWordCount: number;
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

const packsRoot = path.join(process.cwd(), "src", "data", "manabuplay", "packs", "v0.1");

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

function shuffleAnswers(correct: string, distractors: string[], seedSource: string) {
  const entries = [
    { label: correct, correct: true },
    ...distractors.slice(0, 3).map((label) => ({ label, correct: false })),
  ];
  const random = mulberry32(hashSeed(seedSource));

  for (let index = entries.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [entries[index], entries[swapIndex]] = [entries[swapIndex], entries[index]];
  }

  return {
    answers: entries.map((entry) => entry.label),
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
    const correct = word.gloss?.fr || word.meaning?.fr || legacy?.correct.fr || "Réponse à écrire.";
    const distractors =
      word.quiz?.distractors?.fr?.slice(0, 3) ||
      pickGlossDistractors(packGlosses, correct, index * 2);
    const shuffled = shuffleAnswers(
      correct,
      distractors,
      `${pack.id}:${word.existingWordId || word.order}:${correct}`,
    );

    return {
      ...word,
      quizPreview: {
        correct,
        distractors,
        answers: shuffled.answers,
        correctIndex: shuffled.correctIndex,
      },
    };
  });

  return {
    ...pack,
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
