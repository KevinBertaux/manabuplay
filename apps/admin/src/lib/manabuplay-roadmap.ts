import { getEditorialReserve } from "../../../../shared/data/manabuplay/editorial-reserve";
import type { EditorialReserveEntry } from "../../../../shared/data/manabuplay/editorial-reserve";

export type RoadmapCandidateWord = {
  id: string;
  status:
    | "candidate-word"
    | "seed-legacy"
    | "removed-from-pack"
    | "retired-pack-source"
    | "to-write";
  source: string;
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
  candidatePackIds: string[];
};

export type RoadmapPack = {
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

export type RoadmapCatalog = {
  version: string;
  status: string;
  notes: string[];
  candidateWords: RoadmapCandidateWord[];
  packs: RoadmapPack[];
  rejectedDistractors: string[];
};

function isReserveWord(
  entry: EditorialReserveEntry,
): entry is EditorialReserveEntry & { status: Exclude<EditorialReserveEntry["status"], "active"> } {
  return entry.status !== "active";
}

export function getRoadmapCatalog() {
  const reserve = getEditorialReserve();
  return {
    version: reserve.version,
    status: "editorial-reserve",
    notes: reserve.notes,
    candidateWords: reserve.entries.filter(isReserveWord).map((entry) => ({
      id: entry.id,
      status: entry.status === "candidate" ? "candidate-word" : entry.status,
      source:
        entry.sources?.map((source) => String(source.type || "unknown")).join(", ") || entry.status,
      jp: entry.jp?.term,
      assist: entry.jp?.romaji,
      locales: {
        fr: {
          label: entry.gloss.fr,
        },
        en: {
          label: entry.gloss.en,
        },
      },
      candidatePackIds: entry.targetPackIds,
    })),
    packs: reserve.futurePacks.map((pack) => ({
      targetVersion: pack.targetVersion,
      id: pack.id,
      themeId: pack.themeId,
      locales: {
        fr: {
          name: pack.name.fr,
        },
        en: {
          name: pack.name.en,
        },
      },
      candidateWordIds: pack.candidateWordIds,
      plannedWords: pack.plannedWords,
    })),
    rejectedDistractors: reserve.rejectedDistractors,
  } satisfies RoadmapCatalog;
}
