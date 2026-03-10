// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useConsentStore } from './useConsentStore';
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from './consentConfig';

vi.mock('./scriptManager', () => ({
  bootConsentScriptRegistry: vi.fn(),
  applyConsentToScripts: vi.fn(),
}));

describe('useConsentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows banner when no consent stored', () => {
    const store = useConsentStore();
    expect(store.shouldDisplayBanner).toBe(true);
  });

  it('acceptAll persists a granted status', () => {
    const store = useConsentStore();
    store.acceptAll();
    expect(store.shouldDisplayBanner).toBe(false);
    const snapshot = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY));
    expect(snapshot.status).toBe('granted');
    expect(snapshot.version).toBe(CONSENT_VERSION);
    expect(Object.values(snapshot.selections).every((value) => value === true)).toBe(true);
  });

  it('rejectAll keeps locked categories enabled only', () => {
    const store = useConsentStore();
    store.acceptAll();
    store.rejectAll();
    const snapshot = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY));
    expect(snapshot.status).toBe('denied');
    expect(snapshot.selections.necessary).toBe(true);
    expect(snapshot.selections.analytics).toBe(false);
    expect(snapshot.selections.ads).toBe(false);
  });

  it('hydrates from valid storage and hides banner', () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: CONSENT_VERSION,
        status: 'custom',
        selections: { necessary: true, analytics: true, ads: false },
        updatedAt: '2026-03-05T10:00:00.000Z',
      })
    );
    const store = useConsentStore();
    expect(store.shouldDisplayBanner).toBe(false);
    expect(store.selections.analytics).toBe(true);
    expect(store.selections.ads).toBe(false);
  });

  it('ignores outdated storage and keeps banner visible', () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: '2026-02-01',
        status: 'granted',
        selections: { necessary: true, analytics: true, ads: true },
      })
    );
    const store = useConsentStore();
    expect(store.shouldDisplayBanner).toBe(true);
  });
});
