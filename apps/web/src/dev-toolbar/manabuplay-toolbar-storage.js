const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAILY_RUN_RECORDS_KEY = "mp_daily_runs";
const DAILY_EXACT_KEYS = ["mp_best_daily"];
const ARCHIVE_EXACT_KEYS = ["mp_best_archive"];
const PRACTICE_SCORE_KEYS = ["mp_best_easy", "mp_best_normal", "mp_best_hard", "mp_best_expert"];

function getStorage(storage) {
  return storage || localStorage;
}

export function listManabuKeys(storage) {
  const target = getStorage(storage);
  return Object.keys(target)
    .filter((key) => key.startsWith("mp_"))
    .sort((left, right) => left.localeCompare(right));
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStorageJson(key, storage) {
  try {
    return JSON.parse(getStorage(storage).getItem(key) || "null");
  } catch {
    return null;
  }
}

function writeStorageJson(key, value, storage) {
  getStorage(storage).setItem(key, JSON.stringify(value));
}

function isDailyKey(key) {
  return (
    DAILY_EXACT_KEYS.includes(key) || key.startsWith("mp_daily") || key.startsWith("mp_best_daily")
  );
}

function isArchiveKey(key) {
  return (
    ARCHIVE_EXACT_KEYS.includes(key) ||
    key.startsWith("mp_archive") ||
    key.startsWith("mp_best_archive")
  );
}

export function getDailyKeys(storage) {
  return listManabuKeys(storage).filter(isDailyKey);
}

export function getArchiveKeys(storage) {
  return listManabuKeys(storage).filter(isArchiveKey);
}

function removeKeys(keys, storage) {
  const target = getStorage(storage);
  let removed = 0;
  for (const key of keys) {
    if (target.getItem(key) === null) continue;
    target.removeItem(key);
    removed += 1;
  }
  return removed;
}

function removeDateEntryFromObjectKey(key, date, storage) {
  const value = readStorageJson(key, storage);
  if (!isPlainObject(value) || !(date in value)) return 0;

  delete value[date];
  if (Object.keys(value).length === 0) {
    getStorage(storage).removeItem(key);
  } else {
    writeStorageJson(key, value, storage);
  }
  return 1;
}

function removeArchiveEntriesFromDailyRunRecords(scope, date, today, storage) {
  const value = readStorageJson(DAILY_RUN_RECORDS_KEY, storage);
  if (!isPlainObject(value)) return 0;

  let removed = 0;

  for (const recordDate of Object.keys(value)) {
    const shouldRemove =
      scope === "all" ? DATE_PATTERN.test(recordDate) && recordDate < today : recordDate === date;

    if (!shouldRemove) continue;

    delete value[recordDate];
    removed += 1;
  }

  if (removed === 0) return 0;

  if (Object.keys(value).length === 0) {
    getStorage(storage).removeItem(DAILY_RUN_RECORDS_KEY);
  } else {
    writeStorageJson(DAILY_RUN_RECORDS_KEY, value, storage);
  }

  return removed;
}

function removeDateScopedKeys(keyPredicate, date, storage) {
  const keys = listManabuKeys(storage).filter((key) => keyPredicate(key) && key.includes(date));
  return removeKeys(keys, storage);
}

export function resetDaily(date, storage) {
  let removed = removeKeys(DAILY_EXACT_KEYS, storage);
  removed += removeDateScopedKeys(isDailyKey, date, storage);

  for (const key of getDailyKeys(storage)) {
    removed += removeDateEntryFromObjectKey(key, date, storage);
  }

  return removed;
}

export function resetArchives(scope, date, today, storage) {
  if (scope === "all") {
    return (
      removeKeys(getArchiveKeys(storage), storage) +
      removeArchiveEntriesFromDailyRunRecords(scope, date, today, storage)
    );
  }

  let removed = removeDateScopedKeys(isArchiveKey, date, storage);
  for (const key of getArchiveKeys(storage)) {
    removed += removeDateEntryFromObjectKey(key, date, storage);
  }
  removed += removeArchiveEntriesFromDailyRunRecords(scope, date, today, storage);

  return removed;
}

export function resetPractice(storage) {
  return removeKeys([...PRACTICE_SCORE_KEYS, "mp_practice_sessions"], storage);
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getArchiveDates(storage) {
  const dates = new Set();
  const today = getLocalDateKey();

  for (const key of getArchiveKeys(storage)) {
    const keyDates = key.match(/\d{4}-\d{2}-\d{2}/g) || [];
    keyDates.forEach((date) => dates.add(date));

    const value = readStorageJson(key, storage);
    if (isPlainObject(value)) {
      Object.keys(value)
        .filter((date) => DATE_PATTERN.test(date))
        .forEach((date) => dates.add(date));
    }
  }

  const dailyRunRecords = readStorageJson(DAILY_RUN_RECORDS_KEY, storage);
  if (isPlainObject(dailyRunRecords)) {
    Object.keys(dailyRunRecords)
      .filter((date) => DATE_PATTERN.test(date) && date < today)
      .forEach((date) => dates.add(date));
  }

  const queryDate =
    typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("date");
  if (queryDate && DATE_PATTERN.test(queryDate)) dates.add(queryDate);

  return [...dates].sort().reverse();
}

export function getDefaultArchiveDate(storage) {
  return getArchiveDates(storage)[0] || getLocalDateKey();
}
