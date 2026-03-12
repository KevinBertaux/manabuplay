// @vitest-environment jsdom
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import LegalCookiesView from './LegalCookiesView.vue';

const openPanelMock = vi.fn();

vi.mock('@/features/consent/useConsentStore', () => ({
  useConsentStore: () => ({
    openPanel: openPanelMock,
  }),
}));

describe('LegalCookiesView', () => {
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
});
