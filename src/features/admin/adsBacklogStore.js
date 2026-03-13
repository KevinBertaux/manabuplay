import adsPubBacklog from '@/content/admin/ads-pub-backlog.json';
import { ROADMAP_PRIORITY_ORDER } from './roadmapStore';

const ALLOWED_STATUSES = Object.freeze([
  'Fait',
  'En cours',
  'En attente',
  'À faire',
  'À surveiller',
  'Plus tard',
]);

function normalizeItem(item, index) {
  const safePriority = ROADMAP_PRIORITY_ORDER.includes(item?.priority) ? item.priority : 'Low';
  const safeStatus = ALLOWED_STATUSES.includes(item?.status) ? item.status : 'À faire';

  return {
    id: typeof item?.id === 'string' && item.id.trim() ? item.id.trim() : `ads-backlog-${index + 1}`,
    priority: safePriority,
    status: safeStatus,
    timing: typeof item?.timing === 'string' ? item.timing : '',
    blocker: typeof item?.blocker === 'string' ? item.blocker : '',
    label: typeof item?.label === 'string' ? item.label : '',
  };
}

export function getAdsPubBacklog() {
  const items = Array.isArray(adsPubBacklog?.items) ? adsPubBacklog.items : [];
  return items.map(normalizeItem).filter((item) => item.label.length > 0);
}

export function getAdsPubBacklogMeta() {
  return {
    version: typeof adsPubBacklog?.version === 'string' ? adsPubBacklog.version : '',
    updatedAt: typeof adsPubBacklog?.updatedAt === 'string' ? adsPubBacklog.updatedAt : '',
  };
}
