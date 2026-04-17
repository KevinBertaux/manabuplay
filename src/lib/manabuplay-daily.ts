import { buildMvpBootData } from "../data/manabuplay/catalog";
import { getAllPacks, type PackReaderWord } from "./manabuplay-pack-reader";

const DAILY_QUESTION_COUNT = 10;
const DAILY_START_DATE = "2026-01-01";
const DAILY_TIER_TARGETS = {
  1: 4,
  2: 3,
  3: 2,
  4: 1,
} as const;

const DAILY_DIFFICULTY = [
  {
    id: "daily",
    icon: "日",
    words: DAILY_QUESTION_COUNT,
    color: "#22d3ee",
    cls: "diff-normal",
  },
];

function getJapaneseTerm(word: PackReaderWord) {
  return typeof word.jp === "string" ? word.jp : word.jp.term;
}

function getJapaneseAssist(word: PackReaderWord) {
  if (word.assist) return word.assist;
  if (typeof word.jp === "string") return word.jp;
  return word.jp.reading || word.jp.romaji || word.jp.term;
}

function buildDailyPool() {
  return getAllPacks().flatMap((pack) =>
    pack.words.map((word) => ({
      id: `${pack.id}:${word.order}`,
      packId: pack.id,
      tier: word.difficultyTier || 1,
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

export function buildDailyBootData() {
  const base = buildMvpBootData();

  return {
    ...base,
    mode: "daily",
    daily: {
      questionCount: DAILY_QUESTION_COUNT,
      startDate: DAILY_START_DATE,
      tierTargets: DAILY_TIER_TARGETS,
    },
    difficulties: DAILY_DIFFICULTY,
    lang: {
      ...base.lang,
      en: {
        ...base.lang.en,
        quiz_label: "// DAILY CHALLENGE",
        quiz_title: `Daily Japanese<br/><span style="color:var(--fuchsia)">Vocab Quiz</span>`,
        quiz_sub: "One shared 10-word run, refreshed every day.",
        diff_title: "TODAY'S RUN",
        diff_daily: "DAILY",
        diff_start: "▶ START DAILY",
        result_change_diff: "BACK TO DAILY",
      },
      fr: {
        ...base.lang.fr,
        quiz_label: "// DÉFI QUOTIDIEN",
        quiz_title: `Quiz quotidien<br/><span style="color:var(--fuchsia)">Vocab japonais</span>`,
        quiz_sub: "Une run commune de 10 mots, renouvelée chaque jour.",
        diff_title: "RUN DU JOUR",
        diff_daily: "QUOTIDIEN",
        diff_start: "▶ LANCER LE QUOTIDIEN",
        result_change_diff: "RETOUR AU QUOTIDIEN",
      },
    },
    quizData: buildDailyPool(),
  };
}
