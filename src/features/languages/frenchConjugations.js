import presentCoreVerbs from '@/content/languages/fr/present-core-verbs.json';

const moduleData = sanitizeModule(presentCoreVerbs);
const pronounsByKey = new Map(moduleData.pronouns.map((pronoun) => [pronoun.key, pronoun]));
const verbsByKey = new Map(moduleData.verbs.map((verb) => [verb.key, verb]));

function sanitizeString(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function sanitizeForms(forms, pronouns) {
  const source = forms && typeof forms === 'object' ? forms : {};
  return Object.fromEntries(
    pronouns.map((pronoun) => [pronoun.key, sanitizeString(source[pronoun.key])])
  );
}

function sanitizeModule(payload) {
  const pronouns = Array.isArray(payload?.pronouns)
    ? payload.pronouns
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
          key: sanitizeString(item.key),
          label: sanitizeString(item.label),
        }))
        .filter((item) => item.key && item.label)
    : [];

  const rows = Array.isArray(payload?.rows)
    ? payload.rows
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
          key: sanitizeString(item.key),
          label: sanitizeString(item.label),
          pronouns: Array.isArray(item.pronouns)
            ? item.pronouns.map((value) => sanitizeString(value)).filter(Boolean)
            : [],
        }))
        .filter((item) => item.key && item.label && item.pronouns.length > 0)
    : [];

  const verbs = Array.isArray(payload?.verbs)
    ? payload.verbs
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
          key: sanitizeString(item.key),
          infinitive: sanitizeString(item.infinitive),
          label: sanitizeString(item.label || item.infinitive),
          forms: sanitizeForms(item.forms, pronouns),
        }))
        .filter(
          (item) =>
            item.key &&
            item.infinitive &&
            pronouns.every((pronoun) => typeof item.forms[pronoun.key] === 'string' && item.forms[pronoun.key])
        )
    : [];

  return {
    name: sanitizeString(payload?.name, 'Conjugaison française'),
    label: sanitizeString(payload?.label, 'Français'),
    description: sanitizeString(payload?.description),
    pronouns,
    rows,
    verbs,
  };
}

export function getFrenchConjugationModule() {
  return moduleData;
}

export function listFrenchVerbOptions() {
  return moduleData.verbs.map((verb) => ({
    value: verb.key,
    label: verb.label,
  }));
}

export function getFrenchVerb(verbKey) {
  return verbsByKey.get(verbKey) || null;
}

export function listFrenchPronouns() {
  return moduleData.pronouns.map((pronoun) => ({ ...pronoun }));
}

export function buildFrenchVerbRows(verbKey) {
  const verb = getFrenchVerb(verbKey);
  if (!verb) {
    return [];
  }

  return moduleData.rows.map((row) => ({
    key: row.key,
    label: row.label,
    values: row.pronouns
      .map((pronounKey) => {
        const pronoun = pronounsByKey.get(pronounKey);
        return pronoun ? `${pronoun.label} ${verb.forms[pronounKey]}` : '';
      })
      .filter(Boolean),
  }));
}

export function buildFrenchVerbCards(verbKey) {
  const verb = getFrenchVerb(verbKey);
  if (!verb) {
    return [];
  }

  return moduleData.pronouns.map((pronoun) => ({
    id: `${verb.key}-${pronoun.key}`,
    pronounKey: pronoun.key,
    pronounLabel: pronoun.label,
    prompt: `${pronoun.label} + ${verb.infinitive}`,
    answer: verb.forms[pronoun.key],
    infinitive: verb.infinitive,
    label: verb.label,
  }));
}

export function createFrenchExercise(verbKey, randomFn = Math.random, previousPronounKey = '') {
  const verb = getFrenchVerb(verbKey);
  if (!verb || !moduleData.pronouns.length) {
    return null;
  }

  const choices = moduleData.pronouns.filter((pronoun) => pronoun.key !== previousPronounKey);
  const pool = choices.length ? choices : moduleData.pronouns;
  const index = Math.floor(randomFn() * pool.length);
  const pronoun = pool[index] || pool[0];

  return {
    id: `${verb.key}-${pronoun.key}`,
    verbKey: verb.key,
    verbLabel: verb.label,
    infinitive: verb.infinitive,
    pronounKey: pronoun.key,
    pronounLabel: pronoun.label,
    expectedAnswer: verb.forms[pronoun.key],
  };
}

export function normalizeFrenchAnswer(value) {
  return sanitizeString(value).toLowerCase();
}

export function isFrenchExerciseAnswerCorrect(exercise, answer) {
  if (!exercise || typeof exercise.expectedAnswer !== 'string') {
    return false;
  }

  return normalizeFrenchAnswer(answer) === normalizeFrenchAnswer(exercise.expectedAnswer);
}
