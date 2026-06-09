function updateFocus(scope: HTMLElement, source: HTMLElement) {
  const focus = scope.querySelector<HTMLElement>("[data-ar-focus]");
  if (!focus) return;

  const title = focus.querySelector<HTMLElement>("[data-ar-focus-title]");
  const pack = focus.querySelector<HTMLElement>("[data-ar-focus-pack]");
  const status = focus.querySelector<HTMLElement>("[data-ar-focus-status]");
  const score = focus.querySelector<HTMLElement>("[data-ar-focus-score]");
  const attempts = focus.querySelector<HTMLElement>("[data-ar-focus-attempts]");
  const cta = focus.querySelector<HTMLElement>("[data-ar-focus-cta]");
  const tone = source.dataset.arTone ?? "open";

  if (title) title.textContent = source.dataset.arTitle ?? "";
  if (pack) pack.textContent = source.dataset.arPack ?? "";
  if (status) {
    status.textContent = source.dataset.arStatus ?? "";
    status.dataset.arTone = tone;
  }
  if (score) score.textContent = source.dataset.arScore ?? "";
  if (attempts) attempts.textContent = source.dataset.arAttempts ?? "";
  if (cta) {
    cta.textContent = source.dataset.arCta ?? "Jouer";
    cta.hidden = tone === "future";
  }

  focus.dataset.arTone = tone;
}

function initScope(scope: HTMLElement) {
  if (scope.dataset.arBound === "1") return;
  scope.dataset.arBound = "1";

  const days = scope.querySelectorAll<HTMLElement>("[data-ar-day]");
  const reset = scope.querySelector<HTMLButtonElement>("[data-ar-reset]");

  const select = (target: HTMLElement) => {
    const dayNum = target.dataset.arDayNum;
    days.forEach((day) => day.classList.toggle("is-selected", day.dataset.arDayNum === dayNum));
    updateFocus(scope, target);
  };

  days.forEach((day) => {
    day.addEventListener("click", () => {
      if (day.dataset.arDisabled === "true") return;
      select(day);
    });
  });

  reset?.addEventListener("click", () => {
    const fallback =
      scope.querySelector<HTMLElement>(`[data-ar-day][data-ar-day-num='04']`) ??
      scope.querySelector<HTMLElement>("[data-ar-day]:not([data-ar-disabled='true'])");
    if (fallback) select(fallback);
  });

  const initial =
    scope.querySelector<HTMLElement>("[data-ar-day].is-selected") ??
    scope.querySelector<HTMLElement>(`[data-ar-day][data-ar-day-num='04']`);
  if (initial) updateFocus(scope, initial);
}

function init() {
  document.querySelectorAll<HTMLElement>("[data-ar-scope]").forEach(initScope);
}

init();
