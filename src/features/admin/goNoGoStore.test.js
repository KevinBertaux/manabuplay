import { describe, expect, it } from 'vitest';
import { getGoNoGoChecklists, getGoNoGoMeta } from './goNoGoStore';

describe('goNoGoStore', () => {
  it('returns normalized checklists with global status', () => {
    const checklists = getGoNoGoChecklists();

    expect(checklists.length).toBeGreaterThan(0);

    for (const checklist of checklists) {
      expect(['Go', 'NoGo']).toContain(checklist.status);
      expect(checklist.totalCount).toBeGreaterThan(0);
      expect(checklist.readyCount).toBeLessThanOrEqual(checklist.totalCount);
      expect(Array.isArray(checklist.blockers)).toBe(true);
      expect(Array.isArray(checklist.warnings)).toBe(true);
    }
  });

  it('returns metadata', () => {
    const meta = getGoNoGoMeta();

    expect(meta.version).toBe('go-nogo-v1');
    expect(meta.updatedAt).toBe('2026-03-13');
  });
});
