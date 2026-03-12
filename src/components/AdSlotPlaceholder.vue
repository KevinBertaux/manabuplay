<script setup>
import { computed } from "vue";
import { getAdSlotById } from "@/features/ads/adsSlots";

const props = defineProps({
  slotId: {
    type: String,
    required: true,
  },
  hint: {
    type: String,
    default: "Aucun script publicitaire n'est chargé pour le moment.",
  },
});

const slot = computed(() => getAdSlotById(props.slotId));

const slotFormatClass = computed(() => {
  if (!slot.value) {
    return "";
  }

  if (slot.value.format === "vertical-rail") {
    return "ad-slot-placeholder--vertical";
  }

  if (slot.value.format === "top-banner") {
    return "ad-slot-placeholder--top";
  }

  if (slot.value.format === "mobile-banner") {
    return "ad-slot-placeholder--mobile";
  }

  return "ad-slot-placeholder--horizontal";
});

const slotSizeLabel = computed(() => {
  if (!slot.value) {
    return "";
  }

  if (slot.value.format === "vertical-rail") {
    return "160 x 600";
  }

  if (slot.value.format === "top-banner") {
    return "970 x 90";
  }

  if (slot.value.format === "mobile-banner") {
    return "728 x 90 · 320 x 50";
  }

  return "728 x 90";
});

const shouldShowPlaceholder = computed(() => {
  if (!slot.value) {
    return false;
  }

  if (slot.value.enabled) {
    return true;
  }

  return (
    import.meta.env.DEV ||
    import.meta.env.MODE === "test" ||
    import.meta.env.VITE_ADS_UI_PLACEHOLDERS === "true"
  );
});
</script>

<template>
  <aside
    v-if="shouldShowPlaceholder && slot"
    class="ad-slot-placeholder"
    :class="slotFormatClass"
    :aria-label="`Annonce réservée : ${slot.label}`"
  >
    <div class="ad-slot-placeholder__meta">
      <span class="ad-slot-placeholder__badge">Annonce réservée</span>
      <span class="ad-slot-placeholder__size">{{ slotSizeLabel }}</span>
    </div>
    <div class="ad-slot-placeholder__frame">
      <p class="ad-slot-placeholder__title">{{ slot.label }}</p>
      <p class="ad-slot-placeholder__hint">{{ hint }}</p>
    </div>
  </aside>
</template>

<style scoped>
.ad-slot-placeholder {
  width: 100%;
  margin: 16px auto 0;
}

.ad-slot-placeholder--horizontal {
  max-width: 760px;
}

.ad-slot-placeholder--vertical {
  max-width: 100%;
}

.ad-slot-placeholder--top {
  max-width: 1040px;
}

.ad-slot-placeholder--mobile {
  max-width: 728px;
}

.ad-slot-placeholder__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 700;
}

.ad-slot-placeholder__badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 4px 10px;
  border: 1px solid rgba(93, 108, 128, 0.2);
  border-radius: 999px;
  background: rgba(251, 253, 255, 0.96);
  color: #4b5969;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.ad-slot-placeholder__size {
  color: #5b6777;
  letter-spacing: 0.04em;
}

.ad-slot-placeholder__frame {
  display: flex;
  min-height: 108px;
  padding: 16px 18px;
  border: 1px solid rgba(185, 198, 214, 0.9);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 255, 0.96)),
    rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 18px rgba(36, 48, 65, 0.06);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.ad-slot-placeholder--vertical .ad-slot-placeholder__frame {
  min-height: 600px;
  padding: 18px 12px;
}

.ad-slot-placeholder--top .ad-slot-placeholder__frame {
  min-height: 92px;
}

.ad-slot-placeholder--mobile .ad-slot-placeholder__frame {
  min-height: 76px;
  padding: 12px 16px;
}

.ad-slot-placeholder__title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 800;
  color: var(--text);
}

.ad-slot-placeholder__hint {
  margin: 6px 0 0;
  max-width: 32ch;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.35;
}

.ad-slot-placeholder--vertical .ad-slot-placeholder__hint {
  max-width: 20ch;
}

.ad-slot-placeholder--mobile .ad-slot-placeholder__title,
.ad-slot-placeholder--mobile .ad-slot-placeholder__hint {
  font-size: 0.82rem;
}

@media (max-width: 767px) {
  .ad-slot-placeholder {
    margin-top: 12px;
  }

  .ad-slot-placeholder--mobile {
    max-width: 360px;
  }

  .ad-slot-placeholder__meta {
    margin-bottom: 6px;
    font-size: 0.75rem;
  }

  .ad-slot-placeholder__frame {
    min-height: 84px;
    padding: 14px;
  }

  .ad-slot-placeholder--mobile .ad-slot-placeholder__frame {
    min-height: 58px;
    padding: 10px 12px;
  }
}
</style>