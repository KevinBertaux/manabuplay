const TOAST_DURATION_MS = 4000;

document.querySelectorAll<HTMLElement>("[data-ht-interactive='true']").forEach((stageRoot) => {
  const toast = stageRoot.querySelector<HTMLElement>("[data-ht-toast]");
  const simButton = stageRoot.querySelector<HTMLButtonElement>("[data-ht-sim]");
  if (!(toast instanceof HTMLElement) || !(simButton instanceof HTMLButtonElement)) return;

  let dismissTimer = 0;

  const hideToast = () => {
    window.clearTimeout(dismissTimer);
    toast.classList.remove("is-visible");
    window.setTimeout(() => {
      toast.hidden = true;
    }, 200);
  };

  simButton.addEventListener("click", () => {
    window.clearTimeout(dismissTimer);
    toast.classList.remove("is-visible");
    toast.hidden = false;
    void toast.offsetWidth;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    dismissTimer = window.setTimeout(hideToast, TOAST_DURATION_MS);
  });
});

const pulseWrap = document.querySelector<HTMLElement>("[data-ht-score-wrap='true']");
if (pulseWrap) {
  pulseWrap.classList.add("is-pulse-wrong");
  window.setTimeout(() => {
    pulseWrap.classList.remove("is-pulse-wrong");
    pulseWrap.classList.add("is-pulse-correct");
    const score = pulseWrap.querySelector("[data-ht-score]");
    if (score) score.textContent = "56";
  }, 1200);
}
