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

export type ArchiveCalendarTone = "archive" | "today" | "future" | "unavailable" | "empty";

export interface ArchiveCalendarCell {
  key: string;
  tone: ArchiveCalendarTone;
  dateKey?: string;
  day?: string;
  href?: string;
  disabled?: boolean;
  isSelected?: boolean;
}

export interface ArchiveMonthGroup {
  key: string;
  label: string;
  summary: string;
  weekdays: string[];
  open: boolean;
  cells: ArchiveCalendarCell[];
}

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

function getMonthKey(dateKey: string) {
  return dateKey.slice(0, 7);
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getLocaleCode(locale: string) {
  return locale === "fr" ? "fr-FR" : "en-US";
}

function getWeekStartsOn(locale: string) {
  return locale === "fr" ? 1 : 0;
}

function getLocalizedWeekdays(locale: string) {
  const formatter = new Intl.DateTimeFormat(getLocaleCode(locale), { weekday: "short" });
  const sunday = new Date("2026-02-01T12:00:00");
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + index);
    return formatter.format(date);
  });
  const weekStartsOn = getWeekStartsOn(locale);
  return [...days.slice(weekStartsOn), ...days.slice(0, weekStartsOn)];
}

function getMonthLabel(monthKey: string, locale: string) {
  return new Intl.DateTimeFormat(getLocaleCode(locale), {
    month: "long",
    year: "numeric",
  }).format(new Date(`${monthKey}-01T12:00:00`));
}

function getCalendarSummary({
  archiveCount,
  futureCount,
  locale,
}: {
  archiveCount: number;
  futureCount: number;
  locale: string;
}) {
  if (locale === "fr") {
    return `${archiveCount} archives · ${futureCount} à venir`;
  }
  return `${archiveCount} archives · ${futureCount} upcoming`;
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

export function getArchiveMonthGroups({
  locale = "en",
  selectedDate,
  referenceDate = new Date(),
}: {
  locale?: string;
  selectedDate?: string | null;
  referenceDate?: Date;
} = {}): ArchiveMonthGroup[] {
  const todayDateKey = formatDateKey(referenceDate);
  const latestArchiveDate = getLatestArchiveDateKey(referenceDate);
  const selectedDateKey =
    selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate) ? selectedDate : latestArchiveDate;
  const currentMonthKey = getMonthKey(todayDateKey);
  const selectedMonthKey = getMonthKey(selectedDateKey);
  const startMonthKey = getMonthKey(ARCHIVE_START_DATE);
  const weekdays = getLocalizedWeekdays(locale);
  const weekStartsOn = getWeekStartsOn(locale);
  const groups: ArchiveMonthGroup[] = [];

  let monthCursor = currentMonthKey;

  while (monthCursor >= startMonthKey) {
    const [year, month] = monthCursor.split("-").map(Number);
    const monthIndex = month - 1;
    const firstDay = new Date(year, monthIndex, 1, 12);
    const leadingCount = (firstDay.getDay() - weekStartsOn + 7) % 7;
    const leadingCells: ArchiveCalendarCell[] = Array.from(
      { length: leadingCount },
      (_, index) => ({
        key: `${monthCursor}-empty-start-${index}`,
        tone: "empty",
      }),
    );

    let archiveCount = 0;
    let futureCount = 0;
    const monthCells: ArchiveCalendarCell[] = Array.from(
      { length: getDaysInMonth(year, monthIndex) },
      (_, index) => {
        const day = String(index + 1).padStart(2, "0");
        const dateKey = `${monthCursor}-${day}`;
        const isSelected = dateKey === selectedDateKey;

        if (dateKey < ARCHIVE_START_DATE) {
          return {
            key: dateKey,
            tone: "unavailable",
            dateKey,
            day,
            disabled: true,
            isSelected,
          };
        }

        if (dateKey === todayDateKey) {
          return {
            key: dateKey,
            tone: "today",
            dateKey,
            day,
            href: `/${locale}/daily/`,
            isSelected,
          };
        }

        if (dateKey > latestArchiveDate) {
          futureCount += 1;
          return {
            key: dateKey,
            tone: "future",
            dateKey,
            day,
            disabled: true,
            isSelected,
          };
        }

        archiveCount += 1;
        return {
          key: dateKey,
          tone: "archive",
          dateKey,
          day,
          href: `/${locale}/archives/?date=${dateKey}`,
          isSelected,
        };
      },
    );

    const cells = [...leadingCells, ...monthCells];
    const trailingCount = (7 - (cells.length % 7)) % 7;
    const trailingCells: ArchiveCalendarCell[] = Array.from(
      { length: trailingCount },
      (_, index) => ({
        key: `${monthCursor}-empty-end-${index}`,
        tone: "empty",
      }),
    );

    groups.push({
      key: monthCursor,
      label: getMonthLabel(monthCursor, locale),
      summary: getCalendarSummary({ archiveCount, futureCount, locale }),
      weekdays,
      open: monthCursor === selectedMonthKey,
      cells: [...cells, ...trailingCells],
    });

    const previousMonth = new Date(year, monthIndex - 1, 1, 12);
    monthCursor = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}`;
  }

  return groups;
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
        quiz_title: `Archive Japanese<br/><span class="text-[var(--fuchsia)]">Vocab Quiz</span>`,
        quiz_sub: "Replay a past 10-question daily run. No sharing in archives.",
        diff_title: "SELECTED ARCHIVE",
        diff_archive: "ARCHIVE",
        diff_start: "▶ PLAY THIS ARCHIVE",
        result_change_diff: "BACK TO ARCHIVES",
      },
      fr: {
        ...base.lang.fr,
        quiz_label: "// ARCHIVE",
        quiz_title: `Archive<br/><span class="text-[var(--fuchsia)]">Vocab japonais</span>`,
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
