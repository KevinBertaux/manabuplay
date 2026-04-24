import fs from "node:fs";
import path from "node:path";
import { getCanonicalPackFiles, type CanonicalPackWord } from "./pack-source";

export type EditorialReserveStatus = "active" | "candidate" | "archived" | "removed-from-pack";
export type EditorialReserveTransparencyLevel = "none" | "strict" | "editorial" | "filler";

export type EditorialReserveEntry = {
  id: string;
  status: EditorialReserveStatus;
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
    archived: number;
    removedFromPack: number;
    needsSorting: number;
  };
};

type RoadmapCandidateWord = {
  id: string;
  status: "existing-word" | "candidate-word";
  source: string;
  existingWordId?: string;
  jp?: string;
  assist?: string;
  locales: {
    fr: {
      label: string;
    };
    en: {
      label: string;
    };
  };
  candidatePackIds?: string[];
};

type RoadmapPack = {
  targetVersion: string;
  id: string;
  themeId: string;
  locales: {
    fr: {
      name: string;
    };
    en: {
      name: string;
    };
  };
  candidateWordIds: string[];
  plannedWords: string[];
};

type RoadmapCatalog = {
  notes: string[];
  candidateWords: RoadmapCandidateWord[];
  packs: RoadmapPack[];
  rejectedDistractors: string[];
};

type RoadmapWordMetadata = {
  term: string;
  romaji: string;
  tier: 1 | 2 | 3 | 4;
  transparency?: Exclude<EditorialReserveTransparencyLevel, "none" | "strict">;
};

const roadmapPath = path.join(
  process.cwd(),
  "shared",
  "data",
  "manabuplay",
  "packs",
  "roadmap",
  "future-packs.json",
);

const ROADMAP_WORD_METADATA: Record<string, RoadmapWordMetadata> = {
  gacha: { term: "ガチャ", romaji: "Gacha", tier: 1 },
  "free-to-play": { term: "フリープレイ", romaji: "Free-to-play", tier: 1 },
  cheat: { term: "チート", romaji: "Chito", tier: 1, transparency: "editorial" },
  "lives-stock": { term: "残機", romaji: "Zanki", tier: 3 },
  "hidden-character": { term: "隠しキャラ", romaji: "Kakushi Kyara", tier: 3 },
  curse: { term: "呪い", romaji: "Noroi", tier: 2 },
  legend: { term: "伝説", romaji: "Densetsu", tier: 2 },
  stealth: { term: "隠密", romaji: "Onmitsu", tier: 4 },
  spell: { term: "魔法", romaji: "Maho", tier: 1 },
  equipment: { term: "装備", romaji: "Sobi", tier: 1 },
  summon: { term: "召喚", romaji: "Shokan", tier: 3 },
  strategy: { term: "戦略", romaji: "Senryaku", tier: 3 },
  reward: { term: "報酬", romaji: "Hoshu", tier: 2 },
  guild: { term: "ギルド", romaji: "Girudo", tier: 1, transparency: "editorial" },
  ambush: { term: "不意打ち", romaji: "Fuiuchi", tier: 3 },
  "key-item": { term: "キーアイテム", romaji: "Ki Aitemu", tier: 1, transparency: "editorial" },
  nation: { term: "国", romaji: "Kuni", tier: 1 },
  fortress: { term: "砦", romaji: "Toride", tier: 3 },
  hero: { term: "勇者", romaji: "Yusha", tier: 1 },
  "elite-enemy": { term: "強敵", romaji: "Kyoteki", tier: 2 },
  berserk: { term: "バーサク", romaji: "Basaku", tier: 1, transparency: "editorial" },
  transformation: { term: "変身", romaji: "Henshin", tier: 2 },
  "dark-lord": { term: "魔王", romaji: "Mao", tier: 2 },
  fury: { term: "怒り", romaji: "Ikari", tier: 2 },
  shadow: { term: "影", romaji: "Kage", tier: 1 },
  immunity: { term: "免疫", romaji: "Meneki", tier: 4 },
  poison: { term: "毒", romaji: "Doku", tier: 1 },
  guard: { term: "ガード", romaji: "Gado", tier: 1, transparency: "editorial" },
  blaze: { term: "業火", romaji: "Goka", tier: 4 },
  annihilation: { term: "殲滅", romaji: "Senmetsu", tier: 4 },
  accessory: { term: "アクセサリー", romaji: "Akusesari", tier: 1, transparency: "editorial" },
  assassin: { term: "アサシン", romaji: "Asashin", tier: 1, transparency: "editorial" },
  paladin: { term: "パラディン", romaji: "Paradin", tier: 1, transparency: "editorial" },
  lancer: { term: "ランサー", romaji: "Ransa", tier: 1, transparency: "editorial" },
  ranger: { term: "レンジャー", romaji: "Renja", tier: 1, transparency: "editorial" },
  healer: { term: "ヒーラー", romaji: "Hira", tier: 1, transparency: "editorial" },
  wand: { term: "杖", romaji: "Tsue", tier: 2 },
  crossbow: { term: "クロスボウ", romaji: "Kurosubo", tier: 1, transparency: "editorial" },
  hammer: { term: "ハンマー", romaji: "Hanma", tier: 1, transparency: "editorial" },
  mace: { term: "メイス", romaji: "Meisu", tier: 1, transparency: "editorial" },
  halberd: { term: "ハルバード", romaji: "Harubado", tier: 1, transparency: "editorial" },
  relic: { term: "遺物", romaji: "Ibutsu", tier: 3 },
  talisman: { term: "タリスマン", romaji: "Tarisuman", tier: 1, transparency: "editorial" },
  scholar: { term: "学者", romaji: "Gakusha", tier: 2 },
} satisfies Record<string, RoadmapWordMetadata>;

function readRoadmapCatalog() {
  return JSON.parse(fs.readFileSync(roadmapPath, "utf8")) as RoadmapCatalog;
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

function getTransparencyWeight(level: EditorialReserveTransparencyLevel) {
  switch (level) {
    case "filler":
      return 2;
    case "strict":
      return 1;
    case "editorial":
      return 0.5;
    case "none":
      return 0;
  }
}

function getRoadmapTransparency(
  word: RoadmapCandidateWord,
  metadata?: RoadmapWordMetadata,
): EditorialReserveEntry["transparency"] {
  const romaji = normalizeTransparencyValue(metadata?.romaji || word.assist);
  const isStrict =
    Boolean(romaji) &&
    [word.locales.fr.label, word.locales.en.label].some(
      (gloss) => normalizeTransparencyValue(gloss) === romaji,
    );
  const level = isStrict ? "strict" : metadata?.transparency || "none";

  return {
    level,
    weight: getTransparencyWeight(level),
  };
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

function getRoadmapEntry(word: RoadmapCandidateWord): EditorialReserveEntry {
  const needsSorting: string[] = [];
  const metadata = ROADMAP_WORD_METADATA[word.id];
  const term = metadata?.term || word.jp;
  const romaji = metadata?.romaji || word.assist || "";
  const tier = metadata?.tier || null;
  const transparency = getRoadmapTransparency(word, metadata);

  if (!romaji) {
    needsSorting.push("romaji");
  }
  if (!tier) {
    needsSorting.push("tier");
  }

  return {
    id: `roadmap:${word.id}`,
    status: word.status === "existing-word" ? "archived" : "candidate",
    sourceWordId: word.existingWordId,
    targetPackIds: word.candidatePackIds || [],
    tier,
    transparency,
    jp: romaji
      ? {
          term,
          romaji,
        }
      : undefined,
    gloss: {
      fr: word.locales.fr.label,
      en: word.locales.en.label,
    },
    needsSorting,
  };
}

export function getEditorialReserve(): EditorialReserve {
  const roadmap = readRoadmapCatalog();
  const entries: EditorialReserveEntry[] = [];
  const existingIds = new Set<string>();

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
      entries.push(entry);
      existingIds.add(entry.sourceWordId || entry.id);
    }
  }

  for (const word of roadmap.candidateWords) {
    if (word.existingWordId && existingIds.has(word.existingWordId)) {
      continue;
    }
    entries.push(getRoadmapEntry(word));
  }

  return {
    version: "editorial-reserve-v0.1",
    notes: [
      "Réserve éditoriale unique : mots actifs, candidats, archivés et futures pistes au même endroit.",
      "Les mots actifs restent servis par les packs canoniques ; la réserve sert à trier, remplacer et réutiliser.",
      "Les champs obligatoires sont renseignés pour tous les mots de réserve : romaji, FR, EN, tier et transparence.",
    ],
    entries,
    futurePacks: roadmap.packs.map((pack) => ({
      id: pack.id,
      targetVersion: pack.targetVersion,
      themeId: pack.themeId,
      name: {
        fr: pack.locales.fr.name,
        en: pack.locales.en.name,
      },
      candidateWordIds: pack.candidateWordIds,
      plannedWords: pack.plannedWords,
    })),
    rejectedDistractors: roadmap.rejectedDistractors,
    stats: {
      total: entries.length,
      active: entries.filter((entry) => entry.status === "active").length,
      candidate: entries.filter((entry) => entry.status === "candidate").length,
      archived: entries.filter((entry) => entry.status === "archived").length,
      removedFromPack: entries.filter((entry) => entry.status === "removed-from-pack").length,
      needsSorting: entries.filter((entry) => entry.needsSorting.length > 0).length,
    },
  };
}
