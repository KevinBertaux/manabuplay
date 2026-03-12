// @vitest-environment jsdom
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LegalCookiesView from './LegalCookiesView.vue';

const { CMP_PRIVACY_OPTIONS_RESULT } = vi.hoisted(() => ({
  CMP_PRIVACY_OPTIONS_RESULT: {
    OPENED: 'opened',
    QUEUED: 'queued',
    UNAVAILABLE: 'unavailable',
  },
}));

const cmpRuntimeMocks = vi.hoisted(() => ({
  openCmpPrivacyOptionsMock: vi.fn(),
}));

const consentStoreMocks = vi.hoisted(() => ({
  openPanelMock: vi.fn(),
}));

const cmpConfigMocks = vi.hoisted(() => ({
  isCmpManagedConsentEnabledMock: vi.fn(),
}));

const openPanelMock = consentStoreMocks.openPanelMock;
const openCmpPrivacyOptionsMock = cmpRuntimeMocks.openCmpPrivacyOptionsMock;
const isCmpManagedConsentEnabledMock = cmpConfigMocks.isCmpManagedConsentEnabledMock;

vi.mock('@/features/consent/useConsentStore', () => ({
  useConsentStore: () => ({
    openPanel: openPanelMock,
  }),
}));

vi.mock('@/features/cmp/cmpRuntime', () => ({
  CMP_PRIVACY_OPTIONS_RESULT,
  openCmpPrivacyOptions: () => openCmpPrivacyOptionsMock(),
}));

vi.mock('@/features/cmp/cmpConfig', () => ({
  isCmpManagedConsentEnabled: () => isCmpManagedConsentEnabledMock(),
}));

describe('LegalCookiesView', () => {
  beforeEach(() => {
    openPanelMock.mockClear();
    openCmpPrivacyOptionsMock.mockReset();
    openCmpPrivacyOptionsMock.mockReturnValue(CMP_PRIVACY_OPTIONS_RESULT.UNAVAILABLE);
    isCmpManagedConsentEnabledMock.mockReset();
    isCmpManagedConsentEnabledMock.mockReturnValue(false);
  });

  it('opens the consent manager from the dedicated button', async () => {
    const wrapper = mount(LegalCookiesView, {
      global: {
        stubs: {
          LegalPageLayout: {
            template: '<section><slot /></section>',
          },
        },
      },
    });

    expect(wrapper.text()).toContain('Gérer mes cookies');

    await wrapper.get('button').trigger('click');

    expect(openPanelMock).toHaveBeenCalledTimes(1);
  });

  it('delegates to the CMP privacy manager when available', async () => {
    openCmpPrivacyOptionsMock.mockReturnValue(CMP_PRIVACY_OPTIONS_RESULT.OPENED);

    const wrapper = mount(LegalCookiesView, {
      global: {
        stubs: {
          LegalPageLayout: {
            template: '<section><slot /></section>',
          },
        },
      },
    });

    await wrapper.get('button').trigger('click');

    expect(openCmpPrivacyOptionsMock).toHaveBeenCalledTimes(1);
    expect(openPanelMock).not.toHaveBeenCalled();
  });

  it('shows a local notice when managed CMP is queued but not available on localhost', async () => {
    isCmpManagedConsentEnabledMock.mockReturnValue(true);
    openCmpPrivacyOptionsMock.mockReturnValue(CMP_PRIVACY_OPTIONS_RESULT.QUEUED);

    const wrapper = mount(LegalCookiesView, {
      global: {
        stubs: {
          LegalPageLayout: {
            template: '<section><slot /></section>',
          },
        },
      },
    });

    await wrapper.get('button').trigger('click');

    expect(openCmpPrivacyOptionsMock).toHaveBeenCalledTimes(1);
    expect(openPanelMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Indisponible en local. Tester sur le site public.');
  });
});
