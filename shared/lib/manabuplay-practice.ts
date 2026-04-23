import { buildCatalogBootData, buildCatalogQuizData } from "../data/manabuplay/catalog";

const PRACTICE_QUESTION_COUNT = 10;
const PRACTICE_COOLDOWN_SESSIONS = 2;

const PRACTICE_DIFFICULTIES = [
  {
    id: "easy",
    icon: "🌱",
    words: PRACTICE_QUESTION_COUNT,
    color: "#4ade80",
    cls: "diff-easy",
    tierTargets: { 1: 6, 2: 3, 3: 1, 4: 0 },
  },
  {
    id: "normal",
    icon: "⚔️",
    words: PRACTICE_QUESTION_COUNT,
    color: "#22d3ee",
    cls: "diff-normal",
    tierTargets: { 1: 4, 2: 3, 3: 2, 4: 1 },
  },
  {
    id: "hard",
    icon: "🔥",
    words: PRACTICE_QUESTION_COUNT,
    color: "#e879f9",
    cls: "diff-hard",
    tierTargets: { 1: 2, 2: 3, 3: 3, 4: 2 },
  },
  {
    id: "expert",
    icon: "💀",
    words: PRACTICE_QUESTION_COUNT,
    color: "#f87171",
    cls: "diff-expert",
    tierTargets: { 1: 1, 2: 1, 3: 4, 4: 4 },
  },
] as const;

export function buildPracticeBootData() {
  const base = buildCatalogBootData();

  return {
    ...base,
    mode: "practice",
    practice: {
      questionCount: PRACTICE_QUESTION_COUNT,
      cooldownSessions: PRACTICE_COOLDOWN_SESSIONS,
      recipes: Object.fromEntries(
        PRACTICE_DIFFICULTIES.map((difficulty) => [difficulty.id, difficulty.tierTargets]),
      ),
    },
    difficulties: PRACTICE_DIFFICULTIES,
    lang: {
      ...base.lang,
      en: {
        ...base.lang.en,
        quiz_label: "// PRACTICE MODE",
        quiz_title: `Practice Japanese<br/><span style="color:var(--fuchsia)">Vocab Quiz</span>`,
        quiz_sub: "Four recipes, 10 questions each, with a 2-session cooldown per word.",
        diff_title: "SELECT A PRACTICE RUN",
        diff_normal: "STANDARD",
        diff_start: "▶ START TRAINING",
        result_change_diff: "CHANGE PRACTICE",
      },
      fr: {
        ...base.lang.fr,
        quiz_label: "// MODE LIBRE",
        quiz_title: `Entraînement<br/><span style="color:var(--fuchsia)">Vocab japonais</span>`,
        quiz_sub: "Quatre recettes, 10 questions chacune, avec un cooldown de 2 sessions par mot.",
        diff_title: "CHOISIS TA RUN LIBRE",
        diff_normal: "STANDARD",
        diff_start: "▶ LANCER L'ENTRAÎNEMENT",
        result_change_diff: "CHANGER DE RUN",
      },
    },
    quizData: buildCatalogQuizData(),
  };
}
