import roadmapIndex from '@/content/roadmap/roadmap-index.json';
import backlog from '@/content/roadmap/backlog.json';
import scope010 from '@/content/roadmap/scope-0.1.0.json';
import scope020 from '@/content/roadmap/scope-0.2.0.json';
import scope030 from '@/content/roadmap/scope-0.3.0.json';
import scope040 from '@/content/roadmap/scope-0.4.0.json';
import scope050 from '@/content/roadmap/scope-0.5.0.json';
import scope060 from '@/content/roadmap/scope-0.6.0.json';

export const ROADMAP_PRIORITY_ORDER = Object.freeze(['Crit', 'High', 'Med', 'Low']);

const sourceMap = Object.freeze({
  backlog,
  'scope-0.1.0': scope010,
  'scope-0.2.0': scope020,
  'scope-0.3.0': scope030,
  'scope-0.4.0': scope040,
  'scope-0.5.0': scope050,
  'scope-0.6.0': scope060,
});

function normalizeEntry(entry, fallbackIndex) {
  const source = sourceMap[entry?.sourceKey] || { version: 'n/a', items: [] };
  const sourceItems = Array.isArray(source.items) ? source.items : [];

  const items = sourceItems
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const safePriority = ROADMAP_PRIORITY_ORDER.includes(item.priority) ? item.priority : 'Low';
      return {
        id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `roadmap-item-${fallbackIndex}-${index}`,
        priority: safePriority,
        domain: typeof item.domain === 'string' ? item.domain : 'ui',
        feature: typeof item.feature === 'string' ? item.feature : 'general',
        label: typeof item.label === 'string' ? item.label : '',
        done: Boolean(item.done),
      };
    })
    .filter((item) => item.label.length > 0);

  return {
    id: typeof entry?.id === 'string' ? entry.id : `scope-${fallbackIndex}`,
    title: typeof entry?.title === 'string' ? entry.title : `Scope ${fallbackIndex}`,
    type: entry?.type === 'backlog' ? 'backlog' : 'scope',
    version: typeof source.version === 'string' ? source.version : '',
    startDate: typeof entry?.startDate === 'string' ? entry.startDate : '',
    endDate: typeof entry?.endDate === 'string' ? entry.endDate : '',
    items,
  };
}

export function getRoadmapEntries() {
  const entries = Array.isArray(roadmapIndex?.entries) ? roadmapIndex.entries : [];
  return entries.map((entry, index) => normalizeEntry(entry, index + 1));
}

export function getRoadmapEntryById(id) {
  return getRoadmapEntries().find((entry) => entry.id === id) || null;
}
