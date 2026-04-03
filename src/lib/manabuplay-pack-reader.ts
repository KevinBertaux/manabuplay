import fs from "node:fs";
import path from "node:path";
import { MVP_QUIZ_DATA } from "../data/manabuplay/raw.generated.js";

export type PackReaderWord = {
  order: number;
  existingWordId?: string;
  jp:
    | string
    | {
        term: string;
        reading?: string;
        romaji?: string;
      };
  assist?: string;
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
  const packMeanings = pack.words
    .map((word) => word.meaning?.fr)
    .filter((meaning): meaning is string => Boolean(meaning));

  const words = pack.words.map((word, index) => {
    const legacy = word.existingWordId ? legacyQuizById.get(word.existingWordId) : null;
    const correct = word.meaning?.fr || legacy?.correct.fr || "Réponse à écrire.";

    const fallbackDistractors = packMeanings
      .filter((meaning) => meaning !== correct)
      .slice(index % 3, (index % 3) + 3);

    while (fallbackDistractors.length < 3) {
      fallbackDistractors.push("Distracteur à écrire.");
    }

    const distractors = legacy?.wrong.fr?.slice(0, 3) || fallbackDistractors.slice(0, 3);
    const correctIndex = word.order % 4;
    const answers = [...distractors];
    answers.splice(correctIndex, 0, correct);

    return {
      ...word,
      quizPreview: {
        correct,
        distractors,
        answers,
        correctIndex,
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
