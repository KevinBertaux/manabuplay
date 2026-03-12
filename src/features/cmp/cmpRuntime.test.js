// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCmpRuntimeState, initCmpRuntime, openCmpPrivacyOptions, resetCmpRuntimeForTests } from './cmpRuntime';

describe('cmpRuntime', () => {
  beforeEach(() => {
    resetCmpRuntimeForTests();
  });

  it('stays inert when no CMP provider is configured', () => {
    const state = initCmpRuntime();

    expect(state).toMatchObject({
      provider: 'none',
      enabled: false,
      managedConsent: false,
      revocationSupported: false,
    });
    expect(window.googlefc).toBeUndefined();
  });

  it('bootstraps googlefc globals when Google Privacy & Messaging is enabled', () => {
    const state = initCmpRuntime({ provider: 'google_privacy_messaging' });

    expect(state).toMatchObject({
      provider: 'google_privacy_messaging',
      enabled: true,
      managedConsent: true,
    });
    expect(Array.isArray(window.googlefc?.callbackQueue)).toBe(true);
    expect(getCmpRuntimeState()?.provider).toBe('google_privacy_messaging');
  });

  it('opens the Google privacy manager when the revocation entrypoint exists', () => {
    const showRevocationMessage = vi.fn();
    window.googlefc = {
      showRevocationMessage,
    };

    expect(openCmpPrivacyOptions()).toBe(true);
    expect(showRevocationMessage).toHaveBeenCalledTimes(1);
    expect(getCmpRuntimeState()?.revocationSupported).toBe(true);
  });

  it('returns false when no CMP privacy manager is available', () => {
    expect(openCmpPrivacyOptions()).toBe(false);
  });
});
