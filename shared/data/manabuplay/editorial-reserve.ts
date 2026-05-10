import fs from "node:fs";
import path from "node:path";
import { getCanonicalPackFiles, type CanonicalPackWord } from "./pack-source";

export type EditorialReserveStatus =
  | "active"
  | "candidate"
  | "seed-legacy"
  | "removed-from-pack"
  | "retired-pack-source"
  | "to-write";
export type EditorialReserveTransparencyLevel = "none" | "strict" | "editorial" | "filler";

export type EditorialReserveEntry = {
  id: string;
  status: EditorialReserveStatus;
  sources?: Array<Record<string, unknown>>;
  sourcePackId?: string;
  sourceWordId?: string;
  targetPackIds: string[];
  tier: 1 | 2 | 3 | 4 | null;
  transparency: {
    level: EditorialReserveTransparencyLevel;
    weight: number;
  };
  jp?: {
    term?: string;
    reading?: string;
    romaji: string;
  };
  gloss: {
    fr: string;
    en: string;
  };
  definition?: {
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
  needsSorting: string[];
};

export type EditorialReserveFuturePack = {
  id: string;
  targetVersion: string;
  themeId: string;
  name: {
    fr: string;
    en: string;
  };
  candidateWordIds: string[];
  plannedWords: string[];
};

export type EditorialReserve = {
  version: string;
  notes: string[];
  entries: EditorialReserveEntry[];
  futurePacks: EditorialReserveFuturePack[];
  rejectedDistractors: string[];
  stats: {
    total: number;
    active: number;
    candidate: number;
    seedLegacy: number;
    removedFromPack: number;
    retiredPackSource: number;
    toWrite: number;
    needsSorting: number;
  };
};

type WordReserveFile = {
  id: string;
  version: string;
  status: "editorial-reserve";
  notes: string[];
  words: EditorialReserveEntry[];
  futurePacks: EditorialReserveFuturePack[];
  rejectedDistractors: Array<string | { label: string }>;
};

const reservePath = path.join(
  process.cwd(),
  "shared",
  "data",
  "manabuplay",
  "reserve",
  "word-reserve.json",
);

function readWordReserve() {
  return JSON.parse(fs.readFileSync(reservePath, "utf8")) as WordReserveFile;
}

function normalizeTransparencyValue(value?: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getWordRomaji(word: CanonicalPackWord) {
  return typeof word.jp === "string" ? word.assist : word.jp?.romaji;
}

function getWordId(word: CanonicalPackWord) {
  return word.existingWordId || getWordRomaji(word) || `word-${word.order}`;
}

function getTransparency(
  word: CanonicalPackWord,
  transparentWordIds: Set<string>,
  fillerWordIds: Set<string>,
): EditorialReserveEntry["transparency"] {
  const id = getWordId(word);
  const romaji = normalizeTransparencyValue(getWordRomaji(word));
  const strict = [word.gloss?.fr || word.meaning?.fr, word.gloss?.en || word.meaning?.en].some(
    (gloss) => romaji && normalizeTransparencyValue(gloss) === romaji,
  );

  if (fillerWordIds.has(id)) {
    return { level: "filler", weight: 2 };
  }

  if (strict) {
    return { level: "strict", weight: 1 };
  }

  if (transparentWordIds.has(id)) {
    return { level: "editorial", weight: 0.5 };
  }

  return { level: "none", weight: 0 };
}

function getActiveEntry(packId: string, word: CanonicalPackWord): EditorialReserveEntry {
  const romaji = getWordRomaji(word);
  const term = typeof word.jp === "string" ? word.jp : word.jp?.term;
  const reading = typeof word.jp === "string" ? undefined : word.jp?.reading;
  const gloss = word.gloss || word.meaning;

  return {
    id: `${packId}:${getWordId(word)}`,
    status: "active",
    sourcePackId: packId,
    sourceWordId: getWordId(word),
    targetPackIds: [],
    tier: word.difficultyTier || null,
    transparency: { level: "none", weight: 0 },
    jp: romaji
      ? {
          term,
          reading,
          romaji,
        }
      : undefined,
    gloss: {
      fr: gloss?.fr || "",
      en: gloss?.en || "",
    },
    definition: word.definition,
    hints: word.hints,
    explanation: word.explanation,
    quiz: word.quiz,
    needsSorting: [],
  };
}

function getRejectedLabel(entry: string | { label: string }) {
  return typeof entry === "string" ? entry : entry.label;
}

export function getEditorialReserve(): EditorialReserve {
  const reserve = readWordReserve();
  const activeEntries: EditorialReserveEntry[] = [];

  for (const pack of getCanonicalPackFiles()) {
    const transparentWordIds = new Set(pack.quiz?.transparentWordIds || []);
    const fillerWordIds = new Set(pack.quiz?.fillerWordIds || []);

    for (const word of pack.words) {
      const entry = getActiveEntry(pack.id, word);
      entry.transparency = getTransparency(word, transparentWordIds, fillerWordIds);
      if (!entry.tier) {
        entry.needsSorting.push("tier");
      }
      if (!entry.jp?.romaji) {
        entry.needsSorting.push("romaji");
      }
      if (!entry.gloss.fr || !entry.gloss.en) {
        entry.needsSorting.push("gloss");
      }
      activeEntries.push(entry);
    }
  }

  const entries = [...activeEntries, ...reserve.words];

  return {
    version: reserve.version,
    notes: reserve.notes,
    entries,
    futurePacks: reserve.futurePacks,
    rejectedDistractors: reserve.rejectedDistractors.map(getRejectedLabel),
    stats: {
      total: entries.length,
      active: activeEntries.length,
      candidate: entries.filter((entry) => entry.status === "candidate").length,
      seedLegacy: entries.filter((entry) => entry.status === "seed-legacy").length,
      removedFromPack: entries.filter((entry) => entry.status === "removed-from-pack").length,
      retiredPackSource: entries.filter((entry) => entry.status === "retired-pack-source").length,
      toWrite: entries.filter((entry) => entry.status === "to-write").length,
      needsSorting: entries.filter((entry) => entry.needsSorting.length > 0).length,
    },
  };
}
