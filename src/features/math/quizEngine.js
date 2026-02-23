import { createRefillBag, shuffleList } from '../common/questionBag';

const FACTOR_VALUES = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

function toQuestion(num1, num2) {
  return {
    num1,
    num2,
    answer: num1 * num2,
  };
}

export function generateQuestion(tableSelect = 'all', randomFn = Math.random) {
  let num1;
  let num2;

  if (tableSelect === 'all') {
    num1 = Math.floor(randomFn() * 12);
    num2 = Math.floor(randomFn() * 12);
  } else {
    num1 = Number.parseInt(tableSelect, 10);
    num2 = Math.floor(randomFn() * 12);
  }

  return toQuestion(num1, num2);
}

function seedQuestions(tableSelect) {
  if (tableSelect === 'all') {
    const questions = [];
    for (const num1 of FACTOR_VALUES) {
      for (const num2 of FACTOR_VALUES) {
        questions.push(toQuestion(num1, num2));
      }
    }
    return questions;
  }

  const num1 = Number.parseInt(tableSelect, 10);
  return FACTOR_VALUES.map((num2) => toQuestion(num1, num2));
}

function questionKey(question) {
  return `${question.num1}x${question.num2}`;
}

export function createMultiplicationQuestionBag(tableSelect = 'all', randomFn = Math.random) {
  const baseQuestions = seedQuestions(tableSelect);
  let lastKey = '';

  const bag = createRefillBag({
    refill: () => {
      const shuffled = shuffleList(baseQuestions, randomFn);
      if (shuffled.length > 1 && lastKey) {
        const nextIndex = shuffled.findIndex((question) => questionKey(question) !== lastKey);
        if (nextIndex > 0) {
          const [nextQuestion] = shuffled.splice(nextIndex, 1);
          shuffled.unshift(nextQuestion);
        }
      }
      return shuffled;
    },
    fallback: () => generateQuestion(tableSelect, randomFn),
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
