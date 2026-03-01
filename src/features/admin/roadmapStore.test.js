import { describe, expect, it } from 'vitest';
import { getRoadmapEntries, getRoadmapEntryById, ROADMAP_PRIORITY_ORDER } from './roadmapStore';

describe('roadmapStore', () => {
  it('returns normalized roadmap entries with valid priorities', () => {
    const entries = getRoadmapEntries();

    expect(entries.length).toBeGreaterThan(0);

    for (const entry of entries) {
      expect(Array.isArray(entry.items)).toBe(true);
      for (const item of entry.items) {
        expect(ROADMAP_PRIORITY_ORDER.includes(item.priority)).toBe(true);
        expect(typeof item.label).toBe('string');
        expect(item.label.length).toBeGreaterThan(0);
      }
    }
  });

  it('returns scope by id and null for unknown ids', () => {
    const scope050 = getRoadmapEntryById('0.5.0-prep');
    expect(scope050).not.toBeNull();
    expect(scope050?.id).toBe('0.5.0-prep');
    expect(scope050?.items.length).toBeGreaterThan(0);

    expect(getRoadmapEntryById('unknown-scope-id')).toBeNull();
  });
});
