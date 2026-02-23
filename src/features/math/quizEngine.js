import { createRefillBag, randomIndex, shuffleList } from '../common/questionBag';

const FACTOR_VALUES = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
const DEFAULT_MODE = 'mixed';

function toQuestion(num1, num2) {
  return {
    num1,
    num2,
    answer: num1 * num2,
  };
}

function questionKey(question) {
  return `${question.num1}x${question.num2}`;
}

function normalizeTableValue(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 11) {
    return null;
  }
  return parsed;
}

export function normalizeTablesInput(input = 'all') {
  if (input === 'all') {
    return [...FACTOR_VALUES];
  }

  const values = Array.isArray(input) ? input : [input];
  const seen = new Set();
  const normalized = [];

  for (const value of values) {
    const table = normalizeTableValue(value);
    if (table === null || seen.has(table)) {
      continue;
    }
    seen.add(table);
    normalized.push(table);
  }

  return normalized.sort((a, b) => a - b);
}

function createQuestionsForTables(tables) {
  const questions = [];
  for (const num1 of tables) {
    for (const num2 of FACTOR_VALUES) {
      questions.push(toQuestion(num1, num2));
    }
  }
  return questions;
}

function buildOrderedQuestions(tables, randomFn) {
  const questions = [];
  for (const table of tables) {
    const factors = shuffleList(FACTOR_VALUES, randomFn);
    for (const num2 of factors) {
      questions.push(toQuestion(table, num2));
    }
  }
  return questions;
}

function buildRoundQuestions(tables, mode, randomFn) {
  if (mode === 'ordered') {
    return buildOrderedQuestions(tables, randomFn);
  }
  return shuffleList(createQuestionsForTables(tables), randomFn);
}

function avoidImmediateRepeat(questions, lastKey) {
  if (!lastKey || questions.length <= 1) {
    return questions;
  }
  const nextIndex = questions.findIndex((question) => questionKey(question) !== lastKey);
  if (nextIndex > 0) {
    const [nextQuestion] = questions.splice(nextIndex, 1);
    questions.unshift(nextQuestion);
  }
  return questions;
}

function randomQuestionFromTables(tables, randomFn = Math.random) {
  const safeTables = tables.length > 0 ? tables : [...FACTOR_VALUES];
  const num1 = safeTables[randomIndex(safeTables.length, randomFn)];
  const num2 = FACTOR_VALUES[randomIndex(FACTOR_VALUES.length, randomFn)];
  return toQuestion(num1, num2);
}

export function generateQuestion(tableSelect = 'all', randomFn = Math.random) {
  const tables = normalizeTablesInput(tableSelect);
  return randomQuestionFromTables(tables, randomFn);
}

function createRoundQueue({ tables, mode, randomFn = Math.random }) {
  let queue = [];
  let lastKey = '';

  function refill() {
    queue = avoidImmediateRepeat(buildRoundQuestions(tables, mode, randomFn), lastKey);
  }

  return {
    next() {
      if (queue.length === 0) {
        refill();
      }
      const question = queue.shift() || null;
      if (question) {
        lastKey = questionKey(question);
      }
      return question;
    },
    get size() {
      return queue.length;
    },
  };
}

export function createMultiplicationQuestionBag(tableSelect = 'all', randomFn = Math.random) {
  const tables = normalizeTablesInput(tableSelect);
  const safeTables = tables.length > 0 ? tables : [...FACTOR_VALUES];
  const baseQuestions = createQuestionsForTables(safeTables);
  let lastKey = '';

  const bag = createRefillBag({
    refill: () => {
      const shuffled = shuffleList(baseQuestions, randomFn);
      return avoidImmediateRepeat(shuffled, lastKey);
    },
    fallback: () => randomQuestionFromTables(safeTables, randomFn),
  });

  return {
    next() {
      const question = bag.next();
      if (!question) {
        return generateQuestion(tableSelect, randomFn);
      }
      lastKey = questionKey(question);
      return question;
    },
  };
}

export function createMultiplicationQuizSession({
  tables = [],
  mode = DEFAULT_MODE,
  reviewErrorsEnabled = true,
  randomFn = Math.random,
} = {}) {
  const normalizedTables = normalizeTablesInput(tables);
  const safeMode = mode === 'ordered' ? 'ordered' : 'mixed';
  const mainRound = createRoundQueue({
    tables: normalizedTables,
    mode: safeMode,
    randomFn,
  });

  let reviewQueue = [];
  let reviewPool = new Map();
  let phase = 'main';

  function startReviewPhaseIfNeeded() {
    if (!reviewErrorsEnabled || reviewPool.size === 0) {
      return false;
    }
    reviewQueue = shuffleList([...reviewPool.values()], randomFn);
    reviewPool = new Map();
    phase = 'review';
    return reviewQueue.length > 0;
  }

  function next() {
    if (normalizedTables.length === 0) {
      return null;
    }

    if (phase === 'review' && reviewQueue.length === 0) {
      phase = 'main';
    }

    if (phase === 'main' && mainRound.size === 0) {
      startReviewPhaseIfNeeded();
    }

    if (phase === 'review') {
      const question = reviewQueue.shift() || null;
      if (!question) {
        phase = 'main';
        return mainRound.next();
      }
      return {
        ...question,
        source: 'review',
        reviewRemaining: reviewQueue.length,
      };
    }

    const question = mainRound.next();
    if (!question) {
      return randomQuestionFromTables(normalizedTables, randomFn);
    }
    return {
      ...question,
      source: 'main',
      reviewRemaining: 0,
    };
  }

  function markAnswer({ question, isCorrect }) {
    if (!reviewErrorsEnabled || !question || isCorrect) {
      return;
    }
    const key = questionKey(question);
    if (!reviewPool.has(key)) {
      reviewPool.set(key, toQuestion(question.num1, question.num2));
    }
  }

  return {
    next,
    markAnswer,
    getState() {
      return {
        phase,
        pendingReviewCount: reviewPool.size,
        reviewRemaining: phase === 'review' ? reviewQueue.length : 0,
      };
    },
  };
}

export function evaluateAnswer({ answerInput, question, score, total, streak }) {
  const parsed = Number.parseInt(answerInput, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return {
      isValid: false,
      feedbackType: 'incorrect',
      feedbackMain: '⚠️ Entrer un nombre positif.',
      feedbackExtra: '',
      nextScore: score,
      nextTotal: total,
      nextStreak: streak,
    };
  }

  const nextTotal = total + 1;
  if (parsed === question.answer) {
    const nextScore = score + 1;
    const nextStreak = streak + 1;
    return {
      isValid: true,
      feedbackType: 'correct',
      feedbackMain: 'Bonne réponse.',
      feedbackExtra: '',
      nextScore,
      nextTotal,
      nextStreak,
    };
  }

  return {
    isValid: true,
    feedbackType: 'incorrect',
    feedbackMain: '❌ Mauvaise réponse.',
    feedbackExtra: `Bonne réponse : ${question.answer}.`,
    nextScore: score,
    nextTotal,
    nextStreak: 0,
  };
}
