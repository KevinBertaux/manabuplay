// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CMP_PRIVACY_OPTIONS_RESULT,
  getCmpRuntimeState,
  initCmpRuntime,
  openCmpPrivacyOptions,
  resetCmpRuntimeForTests,
} from './cmpRuntime';

describe('cmpRuntime', () => {
  beforeEach(() => {
    resetCmpRuntimeForTests();
  });

  it('stays inert when no CMP provider is configured', () => {
    const state = initCmpRuntime({ provider: 'none' });

    expect(state).toMatchObject({
      provider: 'none',
      enabled: false,
      managedConsent: false,
      consentMode: 'none',
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
      consentMode: 'advanced',
    });
    expect(Array.isArray(window.googlefc?.callbackQueue)).toBe(true);
    expect(window.googlefc?.callbackQueue).toHaveLength(3);
    expect(getCmpRuntimeState()?.provider).toBe('google_privacy_messaging');
  });

  it('opens the Google privacy manager when the revocation entrypoint exists', () => {
    const showRevocationMessage = vi.fn();
    window.googlefc = {
      showRevocationMessage,
    };

    expect(openCmpPrivacyOptions()).toBe(CMP_PRIVACY_OPTIONS_RESULT.OPENED);
    expect(showRevocationMessage).toHaveBeenCalledTimes(1);
    expect(getCmpRuntimeState()?.revocationSupported).toBe(true);
  });

  it('returns unavailable when no CMP privacy manager is available', () => {
    expect(openCmpPrivacyOptions()).toBe(CMP_PRIVACY_OPTIONS_RESULT.UNAVAILABLE);
  });

  it('queues a revocation request when Googlefc exists but the API is not ready yet', () => {
    window.googlefc = {
      callbackQueue: [],
    };

    expect(openCmpPrivacyOptions()).toBe(CMP_PRIVACY_OPTIONS_RESULT.QUEUED);
    expect(window.googlefc.callbackQueue).toHaveLength(1);
    expect(getCmpRuntimeState()?.revocationRequested).toBe(true);
  });
});
