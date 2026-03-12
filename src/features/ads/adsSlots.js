import { ADS_SLOT_DEFINITIONS } from './adsConfig';

export function getAdSlots() {
  return ADS_SLOT_DEFINITIONS.map((slot) => ({ ...slot }));
}

export function getAdSlotById(slotId) {
  const slot = ADS_SLOT_DEFINITIONS.find((currentSlot) => currentSlot.id === slotId);
  return slot ? { ...slot } : null;
}

export function getEnabledAdSlots() {
  return getAdSlots().filter((slot) => slot.enabled);
}

export function getAdSlotsByRoute(routeName) {
  return getAdSlots().filter((slot) => slot.routeName === routeName);
}
