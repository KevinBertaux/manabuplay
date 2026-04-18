import { getAllPacks, type PackReaderWord } from "./manabuplay-pack-reader";

export type QuizPoolEntry = {
  id: string;
  packId: string;
  tier: 1 | 2 | 3 | 4;
  word: string;
  kana: string;
  cat: {
    en: string;
    fr: string;
  };
  hint: {
    en: string;
    fr: string;
  };
  hint2: {
    en: string;
    fr: string;
  };
  explanation: {
    en: string;
    fr: string;
  };
  correct: {
    en: string;
    fr: string;
  };
  wrong: {
    en: string[];
    fr: string[];
  };
};

function getJapaneseTerm(word: PackReaderWord) {
  return typeof word.jp === "string" ? word.jp : word.jp.term;
}

function getJapaneseAssist(word: PackReaderWord) {
  if (word.assist) return word.assist;
  if (typeof word.jp === "string") return word.jp;
  return word.jp.reading || word.jp.romaji || word.jp.term;
}

export function buildV01QuizPool(): QuizPoolEntry[] {
  return getAllPacks().flatMap((pack) =>
    pack.words.map((word) => ({
      id: `${pack.id}:${word.order}`,
      packId: pack.id,
      tier: (word.difficultyTier || 1) as 1 | 2 | 3 | 4,
      word: getJapaneseTerm(word),
      kana: getJapaneseAssist(word),
      cat: {
        en: pack.locales.en.name,
        fr: pack.locales.fr.name,
      },
      hint: {
        en: word.hints?.hint1?.en || word.definition?.en || word.explanation?.en || "",
        fr: word.hints?.hint1?.fr || word.definition?.fr || word.explanation?.fr || "",
      },
      hint2: {
        en: word.hints?.hint2?.en || "",
        fr: word.hints?.hint2?.fr || "",
      },
      explanation: {
        en: word.explanation?.en || "",
        fr: word.explanation?.fr || "",
      },
      correct: {
        en: word.quizPreview?.correct.en || word.gloss?.en || word.meaning?.en || "",
        fr: word.quizPreview?.correct.fr || word.gloss?.fr || word.meaning?.fr || "",
      },
      wrong: {
        en: word.quizPreview?.distractors.en || [],
        fr: word.quizPreview?.distractors.fr || [],
      },
    })),
  );
}
