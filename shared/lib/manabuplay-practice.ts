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
    mode: "arcade",
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
        quiz_label: "// ARCADE MODE",
        quiz_title: `Arcade Japanese<br/><span class="text-[var(--fuchsia)]">Vocab Quiz</span>`,
        quiz_sub: "Pick a difficulty and play another 10-question run.",
        diff_title: "CHOOSE YOUR RUN",
        diff_normal: "STANDARD",
        diff_start: "▶ START RUN",
        result_change_diff: "CHANGE RUN",
      },
      fr: {
        ...base.lang.fr,
        quiz_label: "// MODE ARCADE",
        quiz_title: `Mode Arcade<br/><span class="text-[var(--fuchsia)]">Vocab japonais</span>`,
        quiz_sub: "Choisis une difficulté et relance une run de 10 questions.",
        diff_title: "CHOISIS TA RUN",
        diff_normal: "STANDARD",
        diff_start: "▶ LANCER LA RUN",
        result_change_diff: "CHANGER DE RUN",
      },
    },
    quizData: buildCatalogQuizData(),
  };
}
