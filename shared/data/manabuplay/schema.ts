export type Locale = "en" | "fr";

export type LocalizedText = Record<Locale, string>;

export interface ReleaseNote {
  id: string;
  date: string;
  title: string;
  summary: string;
}

export interface DifficultyConfig {
  id: string;
  icon: string;
  words: number;
  color: string;
  cls: string;
}

export interface WordAudioConfig {
  mode: "tts" | "file";
  text: string;
  normalRate: number;
  slowRate: number;
  src: string | null;
}

export interface WordEntry {
  id: string;
  jp: {
    term: string;
    assist: string;
    reading: string | null;
    romaji: string | null;
  };
  meaning: LocalizedText;
  introducedIn: string;
  tags: string[];
  audio: WordAudioConfig;
}

export interface PackSeoCopy {
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}

export interface PackDefinition {
  id: string;
  slug: string;
  introducedIn: string;
  locales: Record<Locale, PackSeoCopy>;
  sharedWords: boolean;
}

export interface PackEntryDistractors {
  wordIds: string[];
  overrides: Record<Locale, string[]>;
}

export interface PackEntry {
  id: string;
  packId: string;
  wordId: string;
  order: number;
  introducedIn: string;
  category: LocalizedText;
  hints: {
    primary: LocalizedText;
    secondary: LocalizedText | null;
  };
  explanation: LocalizedText | null;
  distractors: PackEntryDistractors;
}

export interface ManabuCatalog {
  releases: ReleaseNote[];
  difficulties: DifficultyConfig[];
  packs: PackDefinition[];
  words: WordEntry[];
  packEntries: PackEntry[];
  defaultPackId: string;
}
