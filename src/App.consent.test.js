// @vitest-environment jsdom
import { reactive, nextTick } from 'vue';
import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.vue';

const route = reactive({
  path: '/',
  fullPath: '/',
});

const initMock = vi.fn();

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRoute: () => route,
  };
});

vi.mock('@/features/consent/useConsentStore', () => ({
  useConsentStore: () => ({
    init: initMock,
  }),
}));

describe('App consent gating', () => {
  beforeEach(() => {
    route.path = '/';
    route.fullPath = '/';
    initMock.mockClear();
  });

  it('initializes consent and renders consent UI on public routes', () => {
    const wrapper = shallowMount(App, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          RouterView: true,
          ConsentBanner: true,
          ConsentPreferencesPanel: true,
        },
      },
    });

    expect(initMock).toHaveBeenCalledTimes(1);
    expect(wrapper.findComponent({ name: 'ConsentBanner' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'ConsentPreferencesPanel' }).exists()).toBe(true);
  });

  it('hides consent UI and does not initialize consent on studio ops routes', () => {
    route.path = '/-/studio-ops/panel';
    route.fullPath = '/-/studio-ops/panel';

    const wrapper = shallowMount(App, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          RouterView: true,
          ConsentBanner: true,
          ConsentPreferencesPanel: true,
        },
      },
    });

    expect(initMock).not.toHaveBeenCalled();
    expect(wrapper.findComponent({ name: 'ConsentBanner' }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'ConsentPreferencesPanel' }).exists()).toBe(false);
  });

  it('initializes consent when navigating from studio ops to a public route', async () => {
    route.path = '/-/studio-ops/panel';
    route.fullPath = '/-/studio-ops/panel';

    const wrapper = shallowMount(App, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          RouterView: true,
          ConsentBanner: true,
          ConsentPreferencesPanel: true,
        },
      },
    });

    initMock.mockClear();
    route.path = '/legal/cookie-policy';
    route.fullPath = '/legal/cookie-policy';
    await nextTick();

    expect(initMock).toHaveBeenCalled();
    expect(wrapper.findComponent({ name: 'ConsentBanner' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'ConsentPreferencesPanel' }).exists()).toBe(true);
  });
});
