(function () {
  const STORAGE_KEY = "manabuplay_fx_preset_v1";
  const BRAND_PREVIEW_STORAGE_KEY = "manabuplay_fx_brand_preview_enabled_v1";
  const DEFAULT_VALUES = {
    crt: 72,
    scanlines: 64,
    noise: 38,
    glow: 62,
    glitch: 28,
    ambient: 48,
  };
  const PRESET_KEYS = Object.keys(DEFAULT_VALUES);
  const DEFAULT_ENABLED = Object.fromEntries(PRESET_KEYS.map((key) => [key, true]));

  function clamp(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, Math.round(number)));
  }

  function toEvenPx(value) {
    const rounded = Math.max(0, Math.round(value / 2) * 2);
    return `${rounded}px`;
  }

  function toPx(value, min = 0) {
    return `${Math.max(min, value).toFixed(2)}px`;
  }

  function normalizeValues(input) {
    const source = input && typeof input === "object" ? input : {};
    const values = {};

    for (const key of PRESET_KEYS) {
      values[key] = clamp(source[key], 0, 100, DEFAULT_VALUES[key]);
    }

    return values;
  }

  function normalizeEnabled(input) {
    const source = input && typeof input === "object" ? input : {};
    const enabled = {};

    for (const key of PRESET_KEYS) {
      enabled[key] = typeof source[key] === "boolean" ? source[key] : DEFAULT_ENABLED[key];
    }

    return enabled;
  }

  function normalizeState(input) {
    if (input && typeof input === "object" && "values" in input) {
      return {
        values: normalizeValues(input.values),
        enabled: normalizeEnabled(input.enabled),
      };
    }

    return {
      values: normalizeValues(input),
      enabled: { ...DEFAULT_ENABLED },
    };
  }

  function readState() {
    try {
      return normalizeState(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch {
      return normalizeState();
    }
  }

  function writeState(input) {
    const state = normalizeState(input);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }

  function readBrandPreviewEnabled() {
    try {
      const raw = window.localStorage.getItem(BRAND_PREVIEW_STORAGE_KEY);
      if (raw === null) {
        return true;
      }
      return raw === "true";
    } catch {
      return true;
    }
  }

  function writeBrandPreviewEnabled(enabled) {
    const normalized = Boolean(enabled);
    window.localStorage.setItem(BRAND_PREVIEW_STORAGE_KEY, String(normalized));
    return normalized;
  }

  function getEffectiveValues(state) {
    const normalized = normalizeState(state);
    const effective = {};

    for (const key of PRESET_KEYS) {
      effective[key] = normalized.enabled[key] ? normalized.values[key] : 0;
    }

    return effective;
  }

  function computeVars(state) {
    const preset = getEffectiveValues(state);
    const master = preset.crt / 100;
    const scanlines = preset.scanlines / 100;
    const noise = preset.noise / 100;
    const glow = preset.glow / 100;
    const glitch = preset.glitch / 100;
    const ambient = preset.ambient / 100;

    return {
      "--fx-crt-master": master.toFixed(3),
      "--fx-scanline-opacity": (0.24 * master + 0.16 * master * scanlines).toFixed(3),
      "--fx-scanline-step": toPx(11 - scanlines * 4.5, 6),
      "--fx-scanline-thickness": toPx(0.8 + scanlines * 0.6, 0.8),
      "--fx-scanline-gap-start": toPx(1.6 + scanlines * 0.8, 1.6),
      "--fx-scanline-darkness": (0.02 + scanlines * 0.1).toFixed(3),
      "--fx-scanline-light-opacity": (0.02 + scanlines * 0.12).toFixed(3),
      "--fx-noise-opacity": (0.24 * master * noise).toFixed(3),
      "--fx-noise-size": toEvenPx(192 - noise * 96),
      "--fx-glow-factor": (0.48 + glow * 1.04).toFixed(3),
      "--fx-glitch-opacity": (master * glitch).toFixed(3),
      "--fx-glitch-shift-x": toEvenPx(master * glitch * 8),
      "--fx-glitch-shift-y": toEvenPx(master * glitch * 4),
      "--fx-glitch-duration": `${(3.6 - glitch * 2).toFixed(2)}s`,
      "--fx-ambient-travel": toEvenPx(ambient * 16),
      "--fx-float-duration-a": `${(8 - ambient * 3).toFixed(2)}s`,
      "--fx-float-duration-b": `${(10 - ambient * 3.2).toFixed(2)}s`,
      "--fx-panel-glow-alpha": (0.04 + glow * 0.32).toFixed(3),
      "--fx-panel-glow-blur": toEvenPx(4 + glow * 44),
      "--fx-title-glow-alpha": (0.08 + glow * 0.28).toFixed(3),
      "--fx-title-glow-alpha-strong": (0.12 + glow * 0.42).toFixed(3),
      "--fx-chip-bg-alpha": (0.02 + glow * 0.22).toFixed(3),
      "--fx-chip-border-alpha": (0.08 + glow * 0.28).toFixed(3),
      "--fx-good-answer-alpha": (0.06 + glow * 0.26).toFixed(3),
      "--fx-stage-saturation": (0.84 + master * 0.28 + glow * 0.2).toFixed(3),
      "--fx-stage-contrast": (0.88 + master * 0.24).toFixed(3),
      "--fx-stage-brightness": (0.86 + glow * 0.16).toFixed(3),
      "--fx-stage-violet-alpha": (0.08 + master * 0.22 + glow * 0.08).toFixed(3),
      "--fx-stage-cyan-alpha": (0.04 + master * 0.18).toFixed(3),
      "--fx-orb-opacity": (0.08 + master * 0.2 + ambient * 0.16).toFixed(3),
      "--fx-orb-blur": toEvenPx(16 + glow * 28),
      "--fx-glitch-shadow-alpha": (glitch * 0.9).toFixed(3),
      "--fx-badge-pulse-scale": (1 + ambient * 0.12).toFixed(3),
    };
  }

  function formatState(state) {
    return JSON.stringify(normalizeState(state));
  }

  function createCodexPrompt(state) {
    return `ManabuPlay FX preset: ${formatState(state)}`;
  }

  function applyStateToRoot(root, state) {
    const vars = computeVars(state);
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
  }

  function getStatusNode(trigger) {
    if (!(trigger instanceof HTMLElement)) {
      return null;
    }

    return (
      trigger.closest("[data-fx-copy-scope]")?.querySelector("[data-fx-status]") ||
      trigger.closest(".fx-copy-box")?.querySelector("[data-fx-status]") ||
      trigger.closest(".card")?.querySelector("[data-fx-status]") ||
      null
    );
  }

  async function copyCurrentPreset(trigger) {
    const text = createCodexPrompt(readState());
    const status = getStatusNode(trigger);

    try {
      await navigator.clipboard.writeText(text);
      if (status) {
        status.textContent = "Preset copied. Paste it into Codex.";
      }
      return true;
    } catch {
      if (status) {
        status.textContent = "Preset ready. Copy it from the box below.";
      }
      if (!navigator.webdriver) {
        window.prompt("Copy this ManabuPlay FX preset:", text);
      }
      return false;
    }
  }

  function syncDocument(state) {
    const normalized = normalizeState(state);

    document.querySelectorAll("[data-fx-root]").forEach((root) => {
      applyStateToRoot(root, normalized);
    });

    document.querySelectorAll("[data-fx-json]").forEach((node) => {
      node.textContent = formatState(normalized);
    });

    document.querySelectorAll("[data-fx-value]").forEach((node) => {
      const key = node.getAttribute("data-fx-value");
      if (key && key in normalized.values) {
        node.textContent = String(normalized.values[key]);
      }
    });

    document.querySelectorAll("[data-fx-enabled-indicator]").forEach((node) => {
      const key = node.getAttribute("data-fx-enabled-indicator");
      if (key && key in normalized.enabled) {
        node.textContent = normalized.enabled[key] ? "on" : "off";
      }
    });
  }

  function syncBrandPreview(enabled = readBrandPreviewEnabled()) {
    const normalized = Boolean(enabled);

    document.querySelectorAll("[data-fx-brand-preview]").forEach((node) => {
      if (node instanceof HTMLElement) {
        node.dataset.fxEnabled = normalized ? "true" : "false";
      }
    });

    document.querySelectorAll("[data-fx-brand-toggle]").forEach((node) => {
      if (node instanceof HTMLInputElement) {
        node.checked = normalized;
      }
    });

    document.querySelectorAll("[data-fx-brand-state]").forEach((node) => {
      node.textContent = normalized ? "FX on" : "FX off";
    });
  }

  function hydrateDocument() {
    syncDocument(readState());
    syncBrandPreview(readBrandPreviewEnabled());
  }

  window.ManabuPlayFX = {
    STORAGE_KEY,
    PRESET_KEYS,
    DEFAULT_VALUES,
    DEFAULT_ENABLED,
    normalizeState,
    readState,
    writeState,
    BRAND_PREVIEW_STORAGE_KEY,
    readBrandPreviewEnabled,
    writeBrandPreviewEnabled,
    getEffectiveValues,
    computeVars,
    formatState,
    createCodexPrompt,
    syncDocument,
    syncBrandPreview,
    hydrateDocument,
    copyCurrentPreset,
  };

  document.addEventListener("DOMContentLoaded", hydrateDocument);
  document.addEventListener("click", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-fx-copy]") : null;
    if (trigger instanceof HTMLElement) {
      event.preventDefault();
      copyCurrentPreset(trigger);
    }
  });
  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.matches("[data-fx-brand-toggle]")) {
      syncBrandPreview(writeBrandPreviewEnabled(target.checked));
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      hydrateDocument();
    }
    if (event.key === BRAND_PREVIEW_STORAGE_KEY) {
      syncBrandPreview(readBrandPreviewEnabled());
    }
  });
})();
