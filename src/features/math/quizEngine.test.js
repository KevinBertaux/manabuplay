import { describe, expect, it } from 'vitest';
import { evaluateAnswer, generateQuestion } from './quizEngine';

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
