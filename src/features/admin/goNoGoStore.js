import checklistsSource from '@/content/admin/go-nogo-checklists.json';

const ALLOWED_TYPES = Object.freeze(['auto', 'manual']);
const ALLOWED_SEVERITIES = Object.freeze(['blocker', 'warning']);
const ALLOWED_STATUSES = Object.freeze(['pending', 'ready', 'nogo']);

function normalizeItem(item, index) {
  return {
    id: typeof item?.id === 'string' && item.id.trim() ? item.id.trim() : `go-nogo-item-${index + 1}`,
    label: typeof item?.label === 'string' ? item.label : '',
    type: ALLOWED_TYPES.includes(item?.type) ? item.type : 'manual',
    severity: ALLOWED_SEVERITIES.includes(item?.severity) ? item.severity : 'warning',
    status: ALLOWED_STATUSES.includes(item?.status) ? item.status : 'pending',
    note: typeof item?.note === 'string' ? item.note : '',
  };
}

function normalizeChecklist(checklist, index) {
  const items = Array.isArray(checklist?.items) ? checklist.items.map(normalizeItem) : [];
  const blockers = items.filter((item) => item.severity === 'blocker' && item.status !== 'ready');
  const warnings = items.filter((item) => item.severity === 'warning' && item.status !== 'ready');

  return {
    id: typeof checklist?.id === 'string' && checklist.id.trim() ? checklist.id.trim() : `go-nogo-${index + 1}`,
    label: typeof checklist?.label === 'string' ? checklist.label : `Checklist ${index + 1}`,
    appliesTo: typeof checklist?.appliesTo === 'string' ? checklist.appliesTo : '',
    items,
    blockers,
    warnings,
    totalCount: items.length,
    readyCount: items.filter((item) => item.status === 'ready').length,
    status: blockers.length === 0 ? 'Go' : 'NoGo',
  };
}

export function getGoNoGoChecklists() {
  const checklists = Array.isArray(checklistsSource?.checklists) ? checklistsSource.checklists : [];
  return checklists.map(normalizeChecklist);
}

export function getGoNoGoMeta() {
  return {
    version: typeof checklistsSource?.version === 'string' ? checklistsSource.version : '',
    updatedAt: typeof checklistsSource?.updatedAt === 'string' ? checklistsSource.updatedAt : '',
  };
}
