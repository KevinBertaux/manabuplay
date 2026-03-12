// @vitest-environment jsdom
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import StudyAdsShell from './StudyAdsShell.vue';

describe('StudyAdsShell', () => {
  it('renders the four reserved study slots around its content', () => {
    const wrapper = mount(StudyAdsShell, {
      slots: {
        default: '<div data-test="study-content">Contenu du cours</div>',
      },
    });

    expect(wrapper.text()).toContain('Rail gauche');
    expect(wrapper.text()).toContain('Rail droit');
    expect(wrapper.text()).toContain('Bandeau haut');
    expect(wrapper.text()).toContain('Bandeau bas');
    expect(wrapper.find('[data-test="study-content"]').exists()).toBe(true);
  });
});
