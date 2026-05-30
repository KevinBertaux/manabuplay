function hideAdminDevToolbar() {
  document.querySelectorAll("astro-dev-toolbar").forEach((el) => {
    el.style.setProperty("display", "none", "important");
  });
}

hideAdminDevToolbar();
new MutationObserver(hideAdminDevToolbar).observe(document.documentElement, {
  childList: true,
  subtree: true,
});

const localeButtons = document.querySelectorAll("[data-preview-locale]");
const frames = document.querySelectorAll(".mobile-mockup-frame");
const viewports = document.querySelectorAll(".mobile-mockup-viewport");

function forwardWheelToFrame(viewport: Element, event: WheelEvent) {
  const frame = viewport.querySelector("iframe");
  if (!(frame instanceof HTMLIFrameElement) || !frame.contentWindow) return;
  try {
    frame.contentWindow.scrollBy({ top: event.deltaY, left: event.deltaX, behavior: "auto" });
    event.preventDefault();
  } catch {
    /* cross-origin */
  }
}

viewports.forEach((viewport) => {
  viewport.addEventListener(
    "wheel",
    (event) => {
      if (!(event instanceof WheelEvent)) return;
      forwardWheelToFrame(viewport, event);
    },
    { passive: false },
  );
});

function setLocale(nextLocale: string) {
  localeButtons.forEach((button) => {
    button.classList.toggle(
      "is-active",
      button instanceof HTMLButtonElement && button.dataset.previewLocale === nextLocale,
    );
  });

  frames.forEach((frame) => {
    if (!(frame instanceof HTMLIFrameElement)) return;
    const template = frame.dataset.previewSrcTemplate;
    if (!template) return;
    frame.src = template.replace("__LOCALE__", nextLocale);
  });
}

localeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!(button instanceof HTMLButtonElement)) return;
    const locale = button.dataset.previewLocale;
    if (locale === "fr" || locale === "en") setLocale(locale);
  });
});
