// @vitest-environment jsdom
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AdSlotPlaceholder from './AdSlotPlaceholder.vue';

describe('AdSlotPlaceholder', () => {
  it('renders the reserved ad slot frame for a known slot in test mode', () => {
    const wrapper = mount(AdSlotPlaceholder, {
      props: {
        slotId: 'study-rail-left',
      },
    });

    expect(wrapper.text()).toContain('Annonce réservée');
    expect(wrapper.text()).toContain("Rail gauche d'étude");
    expect(wrapper.text()).toContain('160 x 600');
  });

  it('does not render anything for an unknown slot', () => {
    const wrapper = mount(AdSlotPlaceholder, {
      props: {
        slotId: 'unknown-slot',
      },
    });

    expect(wrapper.find('aside').exists()).toBe(false);
  });
});