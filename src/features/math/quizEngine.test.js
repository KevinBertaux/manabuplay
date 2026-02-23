import { describe, expect, it } from 'vitest';
import { createMultiplicationQuestionBag, evaluateAnswer, generateQuestion } from './quizEngine';

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
