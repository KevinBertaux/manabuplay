import { describe, expect, it } from 'vitest';
import { getAdsPubBacklog, getAdsPubBacklogMeta } from './adsBacklogStore';
import { ROADMAP_PRIORITY_ORDER } from './roadmapStore';

describe('adsBacklogStore', () => {
  it('returns normalized ads backlog items', () => {
    const items = getAdsPubBacklog();

    expect(items.length).toBeGreaterThan(0);

    for (const item of items) {
      expect(ROADMAP_PRIORITY_ORDER.includes(item.priority)).toBe(true);
      expect(typeof item.status).toBe('string');
      expect(item.status.length).toBeGreaterThan(0);
      expect(typeof item.label).toBe('string');
      expect(item.label.length).toBeGreaterThan(0);
    }
  });

  it('returns backlog metadata', () => {
    const meta = getAdsPubBacklogMeta();

    expect(meta.version).toBe('ads-pub-backlog-v1');
    expect(meta.updatedAt).toBe('2026-03-13');
  });
});
