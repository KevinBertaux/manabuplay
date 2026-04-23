import fs from "node:fs";
import path from "node:path";

export type RoadmapCandidateWord = {
  id: string;
  status: "existing-word" | "candidate-word";
  source: "seed-legacy" | `pack-${number}-distractor`;
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
  candidatePackIds: string[];
};

export type RoadmapPack = {
  targetVersion: string;
  id: string;
  slug: string;
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

const roadmapPath = path.join(
  process.cwd(),
  "shared",
  "data",
  "manabuplay",
  "packs",
  "roadmap",
  "future-packs.json",
);

export function getRoadmapCatalog() {
  return JSON.parse(fs.readFileSync(roadmapPath, "utf8")) as RoadmapCatalog;
}
