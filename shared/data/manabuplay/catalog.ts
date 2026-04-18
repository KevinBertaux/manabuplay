import { MVP_DIFFICULTIES, MVP_LANG, MVP_QUIZ_DATA } from "./raw.generated.js";
import type {
  DifficultyConfig,
  LocalizedText,
  ManabuCatalog,
  PackDefinition,
  PackEntry,
  ReleaseNote,
  WordEntry,
} from "./schema";

const CURRENT_RELEASE_ID = "v0.1.0";
const DEFAULT_PACK_ID = "gaming-core";

export const RELEASES: ReleaseNote[] = [
  {
    id: CURRENT_RELEASE_ID,
    date: "2026-04-02",
    title: "Pack-first catalog foundation",
    summary:
      "Freeze the scalable content schema in code and migrate the 50-word MVP into a shared catalog.",
  },
];

export const DIFFICULTIES: DifficultyConfig[] = MVP_DIFFICULTIES.map((difficulty) => ({
  ...difficulty,
}));

export const PACKS: PackDefinition[] = [
  {
    id: DEFAULT_PACK_ID,
    slug: DEFAULT_PACK_ID,
    introducedIn: CURRENT_RELEASE_ID,
    sharedWords: true,
    locales: {
      en: {
        name: "Gaming Core",
        description:
          "The original 50-word ManabuPlay MVP pack covering core gaming and anime vocabulary.",
        seoTitle: "Japanese Gaming Vocabulary Quiz | ManabuPlay",
        seoDescription:
          "Train on the original 50-word ManabuPlay MVP pack and learn core Japanese gaming vocabulary.",
      },
      fr: {
        name: "Gaming Core",
        description:
          "Le pack MVP original de 50 mots ManabuPlay autour du vocabulaire gaming et anime.",
        seoTitle: "Quiz de vocabulaire japonais gaming | ManabuPlay",
        seoDescription:
          "Travaille le pack MVP original de 50 mots ManabuPlay et apprends le vocabulaire japonais gaming essentiel.",
      },
    },
  },
];

type RawQuizEntry = (typeof MVP_QUIZ_DATA)[number];

const wordIds = new Set<string>();

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createWordId(entry: RawQuizEntry, index: number): string {
  const seed = slugify(entry.kana) || slugify(entry.word) || `word-${index + 1}`;
  let candidate = seed;
  let suffix = 2;
  while (wordIds.has(candidate)) {
    candidate = `${seed}-${suffix}`;
    suffix += 1;
  }
  wordIds.add(candidate);
  return candidate;
}

function categoryTag(label: string): string {
  return slugify(label.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "").trim()) || "general";
}

function normalizeAssistForDisplay(value: string): string {
  return value
    .replace(/ā/g, "aa")
    .replace(/ē/g, "ei")
    .replace(/ī/g, "ii")
    .replace(/ō/g, "ou")
    .replace(/ū/g, "uu")
    .replace(/Ā/g, "Aa")
    .replace(/Ē/g, "Ei")
    .replace(/Ī/g, "Ii")
    .replace(/Ō/g, "Ou")
    .replace(/Ū/g, "Uu")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

type CatalogSeed = {
  words: WordEntry[];
  packEntries: PackEntry[];
};

function buildCatalogSeed(): CatalogSeed {
  const words: WordEntry[] = [];
  const packEntries: PackEntry[] = [];

  MVP_QUIZ_DATA.forEach((entry, index) => {
    const wordId = createWordId(entry, index);

    words.push({
      id: wordId,
      jp: {
        term: entry.word,
        assist: normalizeAssistForDisplay(entry.kana),
        reading: null,
        romaji: null,
      },
      meaning: entry.correct as LocalizedText,
      introducedIn: CURRENT_RELEASE_ID,
      tags: [categoryTag(entry.cat.en)],
      audio: {
        mode: "tts",
        text: entry.word,
        normalRate: 0.85,
        slowRate: 0.6,
        src: null,
      },
    });

    packEntries.push({
      id: `${DEFAULT_PACK_ID}:${wordId}`,
      packId: DEFAULT_PACK_ID,
      wordId,
      order: index + 1,
      introducedIn: CURRENT_RELEASE_ID,
      category: entry.cat as LocalizedText,
      hints: {
        primary: entry.hint as LocalizedText,
        secondary: null,
      },
      explanation: null,
      distractors: {
        wordIds: [],
        overrides: entry.wrong as Record<"en" | "fr", string[]>,
      },
    });
  });

  return { words, packEntries };
}

const catalogSeed = buildCatalogSeed();

export const WORDS: WordEntry[] = catalogSeed.words;
export const PACK_ENTRIES: PackEntry[] = catalogSeed.packEntries;

export const MANABU_CATALOG: ManabuCatalog = {
  releases: RELEASES,
  difficulties: DIFFICULTIES,
  packs: PACKS,
  words: WORDS,
  packEntries: PACK_ENTRIES,
  defaultPackId: DEFAULT_PACK_ID,
};

const wordsById = new Map(WORDS.map((word) => [word.id, word]));

export function buildLegacyQuizData(packId = DEFAULT_PACK_ID): RawQuizEntry[] {
  return PACK_ENTRIES.filter((entry) => entry.packId === packId)
    .sort((left, right) => left.order - right.order)
    .map((entry) => {
      const word = wordsById.get(entry.wordId);
      if (!word) {
        throw new Error(`Unknown wordId "${entry.wordId}" in pack "${entry.packId}".`);
      }

      return {
        word: word.jp.term,
        kana: word.jp.assist,
        cat: entry.category,
        hint: entry.hints.primary,
        correct: word.meaning,
        wrong: entry.distractors.overrides,
      };
    });
}

export function buildMvpBootData() {
  return {
    catalog: MANABU_CATALOG,
    defaultPackId: DEFAULT_PACK_ID,
    difficulties: DIFFICULTIES,
    lang: MVP_LANG,
    quizData: buildLegacyQuizData(DEFAULT_PACK_ID),
  };
}
