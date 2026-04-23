import { buildCatalogBootData, buildCatalogQuizData } from "../data/manabuplay/catalog";

const ARCHIVE_START_DATE = "2026-01-01";
const ARCHIVE_QUESTION_COUNT = 10;
const ARCHIVE_TIER_TARGETS = {
  1: 4,
  2: 3,
  3: 2,
  4: 1,
} as const;

const ARCHIVE_DIFFICULTY = [
  {
    id: "archive",
    icon: "🗂",
    words: ARCHIVE_QUESTION_COUNT,
    color: "#a78bfa",
    cls: "diff-normal",
  },
];

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

export function getLatestArchiveDateKey(referenceDate = new Date()) {
  return shiftDateKey(formatDateKey(referenceDate), -1);
}

export function getArchiveDateKeys(referenceDate = new Date()) {
  const dates: string[] = [];
  let current = getLatestArchiveDateKey(referenceDate);

  while (current >= ARCHIVE_START_DATE) {
    dates.push(current);
    current = shiftDateKey(current, -1);
  }

  return dates;
}

export function buildArchivesBootData(selectedDate = getLatestArchiveDateKey()) {
  const base = buildCatalogBootData();
  const latestDate = getLatestArchiveDateKey();

  return {
    ...base,
    mode: "archives",
    daily: {
      questionCount: ARCHIVE_QUESTION_COUNT,
      startDate: ARCHIVE_START_DATE,
      tierTargets: ARCHIVE_TIER_TARGETS,
    },
    archive: {
      startDate: ARCHIVE_START_DATE,
      latestDate,
      selectedDate,
      questionCount: ARCHIVE_QUESTION_COUNT,
    },
    difficulties: ARCHIVE_DIFFICULTY,
    lang: {
      ...base.lang,
      en: {
        ...base.lang.en,
        quiz_label: "// ARCHIVE RUN",
        quiz_title: `Archive Japanese<br/><span style="color:var(--fuchsia)">Vocab Quiz</span>`,
        quiz_sub: "Replay a past 10-question daily run. No sharing in archives.",
        diff_title: "SELECTED ARCHIVE",
        diff_archive: "ARCHIVE",
        diff_start: "▶ PLAY THIS ARCHIVE",
        result_change_diff: "BACK TO ARCHIVES",
      },
      fr: {
        ...base.lang.fr,
        quiz_label: "// ARCHIVE",
        quiz_title: `Archive<br/><span style="color:var(--fuchsia)">Vocab japonais</span>`,
        quiz_sub: "Rejoue un ancien quotidien en 10 questions. Pas de partage dans les archives.",
        diff_title: "ARCHIVE SÉLECTIONNÉE",
        diff_archive: "ARCHIVE",
        diff_start: "▶ JOUER CETTE ARCHIVE",
        result_change_diff: "RETOUR AUX ARCHIVES",
      },
    },
    quizData: buildCatalogQuizData(),
  };
}
