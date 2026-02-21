import { describe, expect, it } from 'vitest';
import {
  evaluateSymmetryAnswer,
  generateSymmetryQuestion,
  mirrorPointHorizontal,
  mirrorPointVertical,
  mirrorShapeHorizontal,
  mirrorShapeVertical,
  SYMMETRY_BASE_SHAPE_COUNT,
} from './symmetryEngine';

function sequenceRandom(values) {
  let index = 0;
  return () => {
    const value = values[Math.min(index, values.length - 1)];
    index += 1;
    return value;
  };
}

describe('mirror helpers', () => {
  it('mirrors one point on vertical axis', () => {
    expect(mirrorPointVertical({ x: 0, y: 2 }, 5)).toEqual({ x: 4, y: 2 });
    expect(mirrorPointVertical({ x: 1, y: 4 }, 5)).toEqual({ x: 3, y: 4 });
  });

  it('mirrors one point on horizontal axis', () => {
    expect(mirrorPointHorizontal({ x: 2, y: 0 }, 5)).toEqual({ x: 2, y: 4 });
    expect(mirrorPointHorizontal({ x: 4, y: 1 }, 5)).toEqual({ x: 4, y: 3 });
  });

  it('mirrors a whole shape on vertical axis', () => {
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

  it('mirrors a whole shape on horizontal axis', () => {
    const shape = [
      { x: 0, y: 1 },
      { x: 1, y: 2 },
      { x: 0, y: 3 },
    ];

    expect(mirrorShapeHorizontal(shape, 5)).toEqual([
      { x: 0, y: 3 },
      { x: 1, y: 2 },
      { x: 0, y: 1 },
    ]);
  });
});

describe('generateSymmetryQuestion', () => {
  it('exposes more than 6 base shapes', () => {
    expect(SYMMETRY_BASE_SHAPE_COUNT).toBeGreaterThan(6);
  });

  it('creates a vertical-axis question with 4 options', () => {
    const random = sequenceRandom([0.01, 0.01, 0.3, 0.5, 0.7, 0.9]);
    const question = generateSymmetryQuestion(random);

    expect(question.axis).toBe('vertical');
    expect(question.prompt).toContain('axe vertical');
    expect(question.gridSize).toBe(5);
    expect(question.options).toHaveLength(4);
    expect(question.correctOptionId).toBeTruthy();
  });

  it('creates a horizontal-axis question with 4 options', () => {
    const random = sequenceRandom([0.99, 0.2, 0.3, 0.5, 0.7, 0.9]);
    const question = generateSymmetryQuestion(random);

    expect(question.axis).toBe('horizontal');
    expect(question.prompt).toContain('axe horizontal');
    expect(question.options).toHaveLength(4);
  });

  it('keeps options unique and inside the grid', () => {
    const vertical = generateSymmetryQuestion(sequenceRandom([0.01, 0.42, 0.2, 0.4, 0.6, 0.8]));
    const horizontal = generateSymmetryQuestion(sequenceRandom([0.99, 0.42, 0.2, 0.4, 0.6, 0.8]));

    for (const question of [vertical, horizontal]) {
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
    }
  });
});

describe('evaluateSymmetryAnswer', () => {
  it('rejects empty selection', () => {
    const result = evaluateSymmetryAnswer({ axis: 'vertical', correctOptionId: 'correct' }, '');
    expect(result.isValid).toBe(false);
    expect(result.isCorrect).toBe(false);
  });

  it('validates correct answer', () => {
    const result = evaluateSymmetryAnswer({ axis: 'vertical', correctOptionId: 'correct' }, 'correct');
    expect(result.isValid).toBe(true);
    expect(result.isCorrect).toBe(true);
  });

  it('returns incorrect for wrong answer with axis hint', () => {
    const result = evaluateSymmetryAnswer({ axis: 'horizontal', correctOptionId: 'correct' }, 'wrong-1');
    expect(result.isValid).toBe(true);
    expect(result.isCorrect).toBe(false);
    expect(result.message).toContain('axe horizontal');
  });
});
