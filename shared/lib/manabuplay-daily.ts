import { buildCatalogBootData, buildCatalogQuizData } from "../data/manabuplay/catalog";

const DAILY_QUESTION_COUNT = 10;
const DAILY_START_DATE = "2026-01-01";
const DAILY_WORD_COOLDOWN_DAYS = 7;
const DAILY_PACK_COOLDOWN_DAYS = 1;
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

export function buildDailyBootData() {
  const base = buildCatalogBootData();

  return {
    ...base,
    mode: "daily",
    daily: {
      questionCount: DAILY_QUESTION_COUNT,
      startDate: DAILY_START_DATE,
      wordCooldownDays: DAILY_WORD_COOLDOWN_DAYS,
      packCooldownDays: DAILY_PACK_COOLDOWN_DAYS,
      tierTargets: DAILY_TIER_TARGETS,
    },
    difficulties: DAILY_DIFFICULTY,
    lang: {
      ...base.lang,
      en: {
        ...base.lang.en,
        quiz_label: "// 10 QUESTIONS",
        quiz_title: "Daily Quiz",
        quiz_sub: "One shared 10-word run, refreshed every day.",
        diff_title: "TODAY'S RUN",
        diff_daily: "DAILY",
        diff_start: "▶ START DAILY",
        result_change_diff: "BACK TO DAILY",
      },
      fr: {
        ...base.lang.fr,
        quiz_label: "// 10 QUESTIONS",
        quiz_title: "Quiz du jour",
        quiz_sub: "Une run commune de 10 mots, renouvelée chaque jour.",
        diff_title: "RUN DU JOUR",
        diff_daily: "QUOTIDIEN",
        diff_start: "▶ LANCER LE QUOTIDIEN",
        result_change_diff: "RETOUR AU QUOTIDIEN",
      },
    },
    quizData: buildCatalogQuizData(),
  };
}
