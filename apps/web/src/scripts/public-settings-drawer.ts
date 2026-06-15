const trigger = document.getElementById("public-settings-trigger");
const root = document.getElementById("public-settings-root");
const drawer = document.getElementById("public-settings-drawer");

if (
  trigger instanceof HTMLButtonElement &&
  root instanceof HTMLElement &&
  drawer instanceof HTMLElement
) {
  const settingsTrigger = trigger;
  const settingsRoot = root;
  const settingsDrawer = drawer;

  function getFocusableElements() {
    return Array.from(
      settingsDrawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute("hidden") && element.offsetParent !== null);
  }

  function setOpen(nextOpen: boolean) {
    settingsRoot.hidden = !nextOpen;
    settingsTrigger.setAttribute("aria-expanded", String(nextOpen));
    document.body.classList.toggle("public-settings-open", nextOpen);

    if (nextOpen) {
      const focusable = getFocusableElements();
      (focusable[0] ?? settingsDrawer.querySelector<HTMLElement>("[data-settings-close]"))?.focus();
      return;
    }

    settingsTrigger.focus();
  }

  function close() {
    if (settingsRoot.hidden) return;
    setOpen(false);
  }

  settingsTrigger.addEventListener("click", () => {
    setOpen(settingsRoot.hidden);
  });

  settingsRoot.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-settings-dismiss]") || target.closest("[data-settings-close]")) {
      close();
    }
  });

  settingsDrawer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !settingsRoot.hidden) {
      close();
    }
  });

  settingsDrawer.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-open-analytics-consent]")) {
      close();
    }
  });
}

export {};
