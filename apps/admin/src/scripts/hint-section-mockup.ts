const HINT_ONE = "En gacha, terme pour les unités ou items distribués gratuitement aux joueurs.";
const HINT_TWO = "Souvent lié au login bonus ou à une campagne limitée.";

type BeforeState = 0 | 1 | 2 | 3;
type AfterState = 0 | 1 | 3;

const beforeLabels: Record<BeforeState, string> = {
  0: "État : initial (bouton ? seul)",
  1: "État : zone indices visible (verrouillées)",
  2: "État : indice 1 révélé",
  3: "État : indices 1 et 2 révélés",
};

const afterLabels: Record<AfterState, string> = {
  0: "État : initial (puces 1 active, 2 bloquée)",
  1: "État : indice 1 révélé · puce 2 débloquée",
  3: "État : indices 1 et 2 révélés",
};

function initBeforePanel(root: ParentNode) {
  const panel = root.querySelector<HTMLElement>("[data-hs-play-panel]");
  if (!panel || panel.dataset.hsVariantBound === "before") return;

  panel.dataset.hsVariantBound = "before";
  let state: BeforeState = 0;

  const label = panel.closest(".hs-shot")?.querySelector<HTMLElement>("[data-hs-state-label]");
  const zone = panel.querySelector<HTMLElement>("[data-hs-before-zone]");
  const action = panel.querySelector<HTMLButtonElement>("[data-hs-before-action]");
  const copy1 = panel.querySelector<HTMLElement>("[data-hs-before-copy='1']");
  const copy2 = panel.querySelector<HTMLElement>("[data-hs-before-copy='2']");
  const card1 = panel.querySelector<HTMLElement>("[data-hs-before-card='1']");
  const card2 = panel.querySelector<HTMLElement>("[data-hs-before-card='2']");

  const render = () => {
    if (label) label.textContent = beforeLabels[state];

    if (state === 0) {
      zone?.setAttribute("hidden", "");
      const actionLabel = action?.querySelector(".hs-before-hint-label");
      if (actionLabel) actionLabel.textContent = "Révéler l'indice";
      return;
    }

    zone?.removeAttribute("hidden");

    if (state === 1) {
      card1?.classList.add("is-locked");
      card1?.classList.remove("is-revealed");
      card2?.classList.add("is-locked");
      card2?.classList.remove("is-revealed");
      if (copy1) copy1.textContent = "Verrouillé · -2 pts si révélé";
      if (copy2) copy2.textContent = "Verrouillé · -5 pts si révélé";
      const actionLabel = action?.querySelector(".hs-before-hint-label");
      if (actionLabel) actionLabel.textContent = "Révéler l'indice";
      return;
    }

    card1?.classList.remove("is-locked");
    card1?.classList.add("is-revealed");
    if (copy1) copy1.textContent = HINT_ONE;

    if (state === 2) {
      card2?.classList.add("is-locked");
      card2?.classList.remove("is-revealed");
      if (copy2) copy2.textContent = "Verrouillé · -5 pts si révélé";
      const actionLabel = action?.querySelector(".hs-before-hint-label");
      if (actionLabel) actionLabel.textContent = "Révéler l'indice 2";
      return;
    }

    card2?.classList.remove("is-locked");
    card2?.classList.add("is-revealed");
    if (copy2) copy2.textContent = HINT_TWO;
    action?.setAttribute("hidden", "");
  };

  const reset = () => {
    state = 0;
    action?.removeAttribute("hidden");
    render();
  };

  action?.addEventListener("click", () => {
    if (state < 3) state = (state + 1) as BeforeState;
    render();
  });

  panel.closest(".hs-shot")?.querySelector("[data-hs-reset]")?.addEventListener("click", reset);
  render();
}

function initAfterPanel(root: ParentNode, solo: boolean) {
  const selector = solo
    ? "[data-hs-play-panel][data-hs-solo='true']"
    : "[data-hs-play-panel]:not([data-hs-solo])";
  const panels = root.querySelectorAll<HTMLElement>(selector);

  panels.forEach((panel) => {
    const variant = panel.closest("[data-hs-variant='after'], [data-hs-variant='after-solo']");
    if (!variant) return;
    const boundKey = solo ? "after-solo" : "after";
    if (panel.dataset.hsVariantBound === boundKey) return;
    panel.dataset.hsVariantBound = boundKey;

    let state: AfterState = 0;
    const label = panel.closest(".hs-shot")?.querySelector<HTMLElement>("[data-hs-state-label]");
    const chip1 = panel.querySelector<HTMLButtonElement>("[data-hs-chip='1']");
    const chip2 = panel.querySelector<HTMLButtonElement>("[data-hs-chip='2']");
    const reveal1 = panel.querySelector<HTMLElement>("[data-hs-reveal='1']");
    const reveal2 = panel.querySelector<HTMLElement>("[data-hs-reveal='2']");

    const render = () => {
      const labelState: AfterState = state >= 3 ? 3 : state >= 1 ? 1 : 0;
      if (label) label.textContent = afterLabels[labelState];

      reveal1?.toggleAttribute("hidden", state < 1);
      reveal2?.toggleAttribute("hidden", state < 3);

      chip1?.classList.toggle("is-revealed", state >= 1);
      chip1?.setAttribute("aria-pressed", state >= 1 ? "true" : "false");

      if (!chip2) return;

      const chip2Ready = state >= 1;
      chip2.classList.toggle("is-locked", !chip2Ready);
      chip2.disabled = !chip2Ready;
      chip2.classList.toggle("is-revealed", state >= 3);
      chip2.setAttribute("aria-pressed", state >= 3 ? "true" : "false");
    };

    const reset = () => {
      state = 0;
      render();
    };

    chip1?.addEventListener("click", () => {
      if (state === 0) state = 1;
      render();
    });

    chip2?.addEventListener("click", () => {
      if (state === 1) state = 3;
      render();
    });

    panel.closest(".hs-shot")?.querySelector("[data-hs-reset]")?.addEventListener("click", reset);
    render();
  });
}

function bindModeTabs() {
  const tabs = document.querySelectorAll<HTMLButtonElement>("[data-hs-mode]");
  const panels = document.querySelectorAll<HTMLElement>("[data-hs-panel]");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const mode = tab.dataset.hsMode;
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach((panel) => {
        panel.toggleAttribute("hidden", panel.dataset.hsPanel !== mode);
      });
    });
  });
}

function initAll() {
  document.querySelectorAll(".hs-shot[data-hs-variant='before']").forEach((shot) => {
    initBeforePanel(shot);
  });
  document.querySelectorAll(".hs-compare, .hs-solo-view").forEach((root) => {
    initAfterPanel(root, false);
    initAfterPanel(root, true);
  });
  bindModeTabs();
}

initAll();
