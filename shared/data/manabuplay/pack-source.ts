import fs from "node:fs";
import path from "node:path";
import type { DifficultyConfig, Locale, LocalizedText } from "./schema";

export type ExistingWordQuizData = {
  correct: { fr: string; en: string };
  wrong: { fr: string[]; en: string[] };
};

export type CanonicalPackWord = {
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
  gloss?: LocalizedText;
  definition?: LocalizedText;
  meaning?: LocalizedText;
  hints?: {
    hint1?: LocalizedText;
    hint2?: LocalizedText;
  };
  explanation?: LocalizedText;
  editorialReview?: {
    status: "reviewed" | "needs-review";
  };
  quiz?: {
    distractors?: Record<Locale, string[]>;
    transparentWordIds?: string[];
  };
};

export type CanonicalPackFile = {
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
  words: CanonicalPackWord[];
};

type CanonicalPackIndex = {
  version: string;
  status: string;
  notes: string[];
  packCount: number;
  targetWordsPerPack: number;
  packs: Array<{
    id: string;
    path: string;
    existingWords: number;
    plannedWords: number;
  }>;
  overflowPath: string;
};

const packsRoot = path.join(process.cwd(), "shared", "data", "manabuplay", "packs", "v0.1");

let indexCache: CanonicalPackIndex | null = null;
let packsCache: CanonicalPackFile[] | null = null;
let existingWordLookupCache: Map<string, ExistingWordQuizData> | null = null;

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function getCanonicalPackIndex() {
  if (!indexCache) {
    indexCache = readJson<CanonicalPackIndex>(path.join(packsRoot, "index.json"));
  }
  return indexCache;
}

export function getCanonicalPackFiles() {
  if (!packsCache) {
    packsCache = getCanonicalPackIndex().packs.map((pack) =>
      readJson<CanonicalPackFile>(path.join(packsRoot, path.basename(pack.path))),
    );
  }
  return packsCache;
}

export function buildExistingWordQuizLookup() {
  if (existingWordLookupCache) {
    return existingWordLookupCache;
  }

  const lookup = new Map<string, ExistingWordQuizData>();

  for (const pack of getCanonicalPackFiles()) {
    for (const word of pack.words) {
      if (
        !word.existingWordId ||
        !word.gloss?.fr ||
        !word.gloss?.en ||
        !word.quiz?.distractors?.fr?.length ||
        !word.quiz?.distractors?.en?.length
      ) {
        continue;
      }

      lookup.set(word.existingWordId, {
        correct: {
          fr: word.gloss.fr,
          en: word.gloss.en,
        },
        wrong: {
          fr: word.quiz.distractors.fr.slice(0, 3),
          en: word.quiz.distractors.en.slice(0, 3),
        },
      });
    }
  }

  existingWordLookupCache = lookup;
  return lookup;
}

export const CURRENT_DIFFICULTIES: DifficultyConfig[] = [
  { id: "easy", icon: "🌱", words: 10, color: "#4ade80", cls: "diff-easy" },
  { id: "normal", icon: "⚔️", words: 20, color: "#22d3ee", cls: "diff-normal" },
  { id: "hard", icon: "🔥", words: 35, color: "#e879f9", cls: "diff-hard" },
  { id: "expert", icon: "💀", words: 50, color: "#f87171", cls: "diff-expert" },
];
