import { describe, expect, it } from 'vitest';
import {
  areSymmetryShapePointsCollinear,
  buildSymmetryShapeReviewReport,
  evaluateSymmetryShape,
  scoreSymmetryShape,
} from '@/features/math/symmetryShapeReview';

describe('symmetry shape validator helpers', () => {
  it('detects collinear shapes', () => {
    expect(
      areSymmetryShapePointsCollinear([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ])
    ).toBe(true);

    expect(
      areSymmetryShapePointsCollinear([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ])
    ).toBe(false);
  });

  it('scores balanced shapes higher than tiny flat ones', () => {
    const balanced = scoreSymmetryShape([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 3 },
    ]);

    const poor = scoreSymmetryShape([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ]);

    expect(balanced).toBeGreaterThan(poor);
  });

  it('rejects hard failures immediately', () => {
    const result = evaluateSymmetryShape({
      id: 'bad-shape',
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
    });

    expect(result.status).toBe('rejected');
    expect(result.hardFailures).toContain('tous_alignes');
  });

  it('flags normalized duplicates for review', () => {
    const report = buildSymmetryShapeReviewReport([
      {
        file: 'test.json',
        shapes: [
          {
            id: 'shape-a',
            points: [
              { x: 0, y: 0 },
              { x: 1, y: 1 },
              { x: 0, y: 2 },
            ],
          },
          {
            id: 'shape-b',
            points: [
              { x: 1, y: 1 },
              { x: 2, y: 2 },
              { x: 1, y: 3 },
            ],
          },
        ],
      },
    ]);

    const second = report.results.find((item) => item.id === 'shape-b');
    expect(second.warnings).toContain('doublon_normalise');
    expect(second.status).toBe('review');
  });
});
