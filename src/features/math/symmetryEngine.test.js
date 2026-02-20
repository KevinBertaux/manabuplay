import { describe, expect, it } from 'vitest';
import {
  evaluateSymmetryAnswer,
  generateSymmetryQuestion,
  mirrorPointVertical,
  mirrorShapeVertical,
} from './symmetryEngine';

describe('mirror helpers', () => {
  it('mirrors one point on vertical axis', () => {
    expect(mirrorPointVertical({ x: 0, y: 2 }, 5)).toEqual({ x: 4, y: 2 });
    expect(mirrorPointVertical({ x: 1, y: 4 }, 5)).toEqual({ x: 3, y: 4 });
  });

  it('mirrors a whole shape', () => {
    const shape = [
      { x: 0, y: 1 },
      { x: 1, y: 2 },
      { x: 0, y: 3 },
    ];

    expect(mirrorShapeVertical(shape, 5)).toEqual([
      { x: 4, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 3 },
    ]);
  });
});

describe('generateSymmetryQuestion', () => {
  it('creates one vertical-axis question with 4 options', () => {
    const question = generateSymmetryQuestion(() => 0);

    expect(question.axis).toBe('vertical');
    expect(question.gridSize).toBe(5);
    expect(question.options).toHaveLength(4);
    expect(question.correctOptionId).toBeTruthy();
  });

  it('keeps options unique and inside the grid', () => {
    const question = generateSymmetryQuestion(() => 0.42);
    const unique = new Set(
      question.options.map((option) =>
        option.points
          .slice()
          .sort((a, b) => a.y - b.y || a.x - b.x)
          .map((point) => `${point.x}:${point.y}`)
          .join('|')
      )
    );

    expect(unique.size).toBe(4);

    for (const option of question.options) {
      expect(option.points.length).toBeGreaterThanOrEqual(3);
      for (const point of option.points) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThan(5);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThan(5);
      }
    }
  });
});

describe('evaluateSymmetryAnswer', () => {
  const question = {
    correctOptionId: 'correct',
  };

  it('rejects empty selection', () => {
    const result = evaluateSymmetryAnswer(question, '');
    expect(result.isValid).toBe(false);
    expect(result.isCorrect).toBe(false);
  });

  it('validates correct answer', () => {
    const result = evaluateSymmetryAnswer(question, 'correct');
    expect(result.isValid).toBe(true);
    expect(result.isCorrect).toBe(true);
  });

  it('returns incorrect for wrong answer', () => {
    const result = evaluateSymmetryAnswer(question, 'wrong-1');
    expect(result.isValid).toBe(true);
    expect(result.isCorrect).toBe(false);
  });
});
