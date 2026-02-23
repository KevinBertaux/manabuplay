import { describe, expect, it } from 'vitest';
import {
  createMultiplicationQuestionBag,
  createMultiplicationQuizSession,
  evaluateAnswer,
  generateQuestion,
  normalizeTablesInput,
} from './quizEngine';

function withRandomSequence(sequence) {
  let index = 0;
  return () => {
    const value = sequence[index] ?? sequence[sequence.length - 1] ?? 0;
    index += 1;
    return value;
  };
}

describe('generateQuestion', () => {
  it('generates valid ranges for all tables including zero', () => {
    const low = generateQuestion('all', () => 0);
    expect(low.num1).toBe(0);
    expect(low.num2).toBe(0);
    expect(low.answer).toBe(0);

    const high = generateQuestion('all', () => 0.999);
    expect(high.num1).toBe(11);
    expect(high.num2).toBe(11);
    expect(high.answer).toBe(121);
  });

  it('uses selected table when table is fixed', () => {
    const question = generateQuestion('7', () => 0.4);
    expect(question.num1).toBe(7);
    expect(question.num2).toBe(4);
    expect(question.answer).toBe(28);
  });

  it('supports zero table when table is fixed', () => {
    const question = generateQuestion('0', () => 0.75);
    expect(question.num1).toBe(0);
    expect(question.num2).toBe(9);
    expect(question.answer).toBe(0);
  });
});

describe('normalizeTablesInput', () => {
  it('deduplicates and sorts valid table values', () => {
    expect(normalizeTablesInput(['5', 2, '2', 11, -1, 12])).toEqual([2, 5, 11]);
  });

  it('returns all tables for "all"', () => {
    expect(normalizeTablesInput('all')).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
});

describe('createMultiplicationQuestionBag', () => {
  it('cycles through 12 unique questions for a fixed table before repeating', () => {
    const bag = createMultiplicationQuestionBag('7', () => 0.5);
    const seen = new Set();

    for (let i = 0; i < 12; i += 1) {
      const question = bag.next();
      seen.add(`${question.num1}x${question.num2}`);
      expect(question.num1).toBe(7);
    }

    expect(seen.size).toBe(12);
  });

  it('cycles through 144 unique questions for all tables before repeating', () => {
    const bag = createMultiplicationQuestionBag('all', () => 0.5);
    const seen = new Set();

    for (let i = 0; i < 144; i += 1) {
      const question = bag.next();
      seen.add(`${question.num1}x${question.num2}`);
    }

    expect(seen.size).toBe(144);
  });

  it('avoids immediate repeats across bag refill boundary when possible', () => {
    const bag = createMultiplicationQuestionBag('3', () => 0.999);
    let previous = null;

    for (let i = 0; i < 24; i += 1) {
      const question = bag.next();
      const current = `${question.num1}x${question.num2}`;
      if (previous) {
        expect(current).not.toBe(previous);
      }
      previous = current;
    }
  });
});

describe('createMultiplicationQuizSession', () => {
  it('serves selected tables in order mode by table blocks', () => {
    const session = createMultiplicationQuizSession({
      tables: [7, 3],
      mode: 'ordered',
      reviewErrorsEnabled: false,
      randomFn: () => 0.5,
    });

    const firstRound = [];
    for (let i = 0; i < 24; i += 1) {
      firstRound.push(session.next());
    }

    expect(firstRound.slice(0, 12).every((q) => q.num1 === 3)).toBe(true);
    expect(firstRound.slice(12).every((q) => q.num1 === 7)).toBe(true);
  });

  it('serves mixed mode as one pooled bag across selected tables', () => {
    const session = createMultiplicationQuizSession({
      tables: [2, 9],
      mode: 'mixed',
      reviewErrorsEnabled: false,
      randomFn: () => 0.5,
    });

    const seen = new Set();
    for (let i = 0; i < 24; i += 1) {
      const question = session.next();
      seen.add(`${question.num1}x${question.num2}`);
    }

    expect(seen.size).toBe(24);
  });

  it('enters review phase after a round when review mode is enabled', () => {
    const session = createMultiplicationQuizSession({
      tables: [4],
      mode: 'ordered',
      reviewErrorsEnabled: true,
      randomFn: withRandomSequence([0.05, 0.12, 0.19, 0.26, 0.33, 0.4, 0.47, 0.54, 0.61, 0.68, 0.75, 0.82]),
    });

    const first = session.next();
    session.markAnswer({ question: first, isCorrect: false });

    for (let i = 0; i < 11; i += 1) {
      const question = session.next();
      session.markAnswer({ question, isCorrect: true });
    }

    const reviewQuestion = session.next();
    expect(reviewQuestion.source).toBe('review');
    expect(reviewQuestion.num1).toBe(first.num1);
    expect(reviewQuestion.num2).toBe(first.num2);
  });

  it('avoids immediate repeat when review starts right after last main question', () => {
    const session = createMultiplicationQuizSession({
      tables: [6],
      mode: 'ordered',
      reviewErrorsEnabled: true,
      randomFn: () => 0.5,
    });

    let lastMain = null;
    for (let i = 0; i < 12; i += 1) {
      const question = session.next();
      if (i === 11) {
        session.markAnswer({ question, isCorrect: false });
        lastMain = question;
      } else {
        session.markAnswer({ question, isCorrect: true });
      }
    }

    const afterLastMain = session.next();
    expect(`${afterLastMain.num1}x${afterLastMain.num2}`).not.toBe(`${lastMain.num1}x${lastMain.num2}`);

    const reviewQuestion = session.next();
    expect(reviewQuestion.source).toBe('review');
    expect(`${reviewQuestion.num1}x${reviewQuestion.num2}`).toBe(`${lastMain.num1}x${lastMain.num2}`);
  });

  it('does not enter review phase when review mode is disabled', () => {
    const session = createMultiplicationQuizSession({
      tables: [4],
      mode: 'ordered',
      reviewErrorsEnabled: false,
      randomFn: () => 0.5,
    });

    const first = session.next();
    session.markAnswer({ question: first, isCorrect: false });

    for (let i = 0; i < 11; i += 1) {
      session.next();
    }

    const next = session.next();
    expect(next.source).toBe('main');
  });
});

describe('evaluateAnswer', () => {
  it('rejects negative values', () => {
    const result = evaluateAnswer({
      answerInput: '-2',
      question: { num1: 3, num2: 4, answer: 12 },
      score: 0,
      total: 0,
      streak: 0,
    });

    expect(result.isValid).toBe(false);
    expect(result.feedbackMain).toBe('⚠️ Entrer un nombre positif.');
    expect(result.feedbackExtra).toBe('');
    expect(result.nextScore).toBe(0);
    expect(result.nextTotal).toBe(0);
  });

  it('increments score and streak on correct answer', () => {
    const result = evaluateAnswer({
      answerInput: '12',
      question: { num1: 3, num2: 4, answer: 12 },
      score: 2,
      total: 4,
      streak: 1,
    });

    expect(result.isValid).toBe(true);
    expect(result.nextScore).toBe(3);
    expect(result.nextTotal).toBe(5);
    expect(result.nextStreak).toBe(2);
    expect(result.feedbackType).toBe('correct');
    expect(result.feedbackMain).toBe('Bonne réponse.');
    expect(result.feedbackExtra).toBe('');
  });

  it('resets streak on incorrect answer', () => {
    const result = evaluateAnswer({
      answerInput: '10',
      question: { num1: 3, num2: 4, answer: 12 },
      score: 2,
      total: 4,
      streak: 3,
    });

    expect(result.isValid).toBe(true);
    expect(result.nextScore).toBe(2);
    expect(result.nextTotal).toBe(5);
    expect(result.nextStreak).toBe(0);
    expect(result.feedbackType).toBe('incorrect');
    expect(result.feedbackMain).toBe('❌ Mauvaise réponse.');
    expect(result.feedbackExtra).toBe('Bonne réponse : 12.');
  });
});
