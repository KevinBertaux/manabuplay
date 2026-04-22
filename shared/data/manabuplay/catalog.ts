import { CURRENT_PRODUCT_COPY } from "./product-copy";
import { CURRENT_DIFFICULTIES, getCanonicalPackFiles } from "./pack-source";
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
const CANONICAL_PACKS = getCanonicalPackFiles();
const DEFAULT_PACK_ID = CANONICAL_PACKS[0]?.id || "";

export const RELEASES: ReleaseNote[] = [
  {
    id: CURRENT_RELEASE_ID,
    date: "2026-04-02",
    title: "Pack-first catalog baseline",
    summary:
      "Freeze the v0.1 five-pack catalog and serve the active boot payload from canonical pack data.",
  },
];

export const DIFFICULTIES: DifficultyConfig[] = CURRENT_DIFFICULTIES.map((difficulty) => ({
  ...difficulty,
}));

export type CatalogQuizEntry = {
  word: string;
  kana: string;
  cat: LocalizedText;
  hint: LocalizedText;
  correct: LocalizedText;
  wrong: Record<"en" | "fr", string[]>;
};

export const PACKS: PackDefinition[] = CANONICAL_PACKS.map((pack) => ({
  id: pack.id,
  slug: pack.slug,
  introducedIn: CURRENT_RELEASE_ID,
  sharedWords: true,
  locales: {
    en: {
      name: pack.locales.en.name,
      description: pack.locales.en.description,
      seoTitle: `${pack.locales.en.name} | ManabuPlay`,
      seoDescription: pack.locales.en.description,
    },
    fr: {
      name: pack.locales.fr.name,
      description: pack.locales.fr.description,
      seoTitle: `${pack.locales.fr.name} | ManabuPlay`,
      seoDescription: pack.locales.fr.description,
    },
  },
}));

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

function getJapaneseTerm(
  value:
    | string
    | {
        term: string;
        reading?: string;
        romaji?: string;
      },
) {
  return typeof value === "string" ? value : value.term;
}

function getJapaneseAssist(
  word:
    | {
        jp:
          | string
          | {
              term: string;
              reading?: string;
              romaji?: string;
            };
        assist?: string;
      }
    | undefined,
) {
  if (!word) return "";
  if (word.assist) return word.assist;
  if (typeof word.jp === "string") return word.jp;
  return word.jp.reading || word.jp.romaji || word.jp.term;
}

function createCatalogWordId(
  packId: string,
  index: number,
  word: {
    existingWordId?: string;
    jp:
      | string
      | {
          term: string;
          reading?: string;
          romaji?: string;
        };
    gloss?: LocalizedText;
  },
) {
  if (word.existingWordId) {
    return word.existingWordId;
  }

  const seed =
    slugify(getJapaneseAssist(word)) ||
    slugify(getJapaneseTerm(word.jp)) ||
    slugify(word.gloss?.en || word.gloss?.fr || "") ||
    `${packId}-word-${index + 1}`;
  const base = `${packId}-${seed}`;
  let candidate = base;
  let suffix = 2;

  while (wordIds.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  wordIds.add(candidate);
  return candidate;
}

function buildCatalogSeed() {
  const words: WordEntry[] = [];
  const packEntries: PackEntry[] = [];

  for (const pack of CANONICAL_PACKS) {
    pack.words.forEach((word, index) => {
      const wordId = createCatalogWordId(pack.id, index, word);
      const term = getJapaneseTerm(word.jp);
      const assist = normalizeAssistForDisplay(getJapaneseAssist(word));
      const meaning = (word.gloss || word.meaning) as LocalizedText | undefined;
      if (!meaning?.fr || !meaning.en) {
        throw new Error(`Pack "${pack.id}" word #${word.order} is missing a localized meaning.`);
      }

      words.push({
        id: wordId,
        jp: {
          term,
          assist,
          reading: typeof word.jp === "string" ? null : word.jp.reading || null,
          romaji: typeof word.jp === "string" ? null : word.jp.romaji || null,
        },
        meaning,
        introducedIn: CURRENT_RELEASE_ID,
        tags: [categoryTag(pack.locales.en.name), categoryTag(pack.themeId)],
        audio: {
          mode: "tts",
          text: term,
          normalRate: 0.85,
          slowRate: 0.6,
          src: null,
        },
      });

      packEntries.push({
        id: `${pack.id}:${wordId}`,
        packId: pack.id,
        wordId,
        order: word.order,
        introducedIn: CURRENT_RELEASE_ID,
        category: {
          fr: pack.locales.fr.name,
          en: pack.locales.en.name,
        },
        hints: {
          primary: (word.hints?.hint1 ||
            word.definition ||
            word.explanation ||
            meaning) as LocalizedText,
          secondary: word.hints?.hint2 || null,
        },
        explanation: word.explanation || null,
        distractors: {
          wordIds: [],
          overrides: {
            fr: word.quiz?.distractors?.fr?.slice(0, 3) || [],
            en: word.quiz?.distractors?.en?.slice(0, 3) || [],
          },
        },
      });
    });
  }

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

export function buildCatalogQuizData(packId = DEFAULT_PACK_ID): CatalogQuizEntry[] {
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
        cat: entry.category as LocalizedText,
        hint: entry.hints.primary as LocalizedText,
        correct: word.meaning,
        wrong: entry.distractors.overrides,
      };
    });
}

export function buildCatalogBootData() {
  return {
    catalog: MANABU_CATALOG,
    defaultPackId: DEFAULT_PACK_ID,
    difficulties: DIFFICULTIES,
    lang: CURRENT_PRODUCT_COPY,
    quizData: buildCatalogQuizData(DEFAULT_PACK_ID),
  };
}

export const buildLegacyQuizData = buildCatalogQuizData;
export const buildMvpBootData = buildCatalogBootData;
