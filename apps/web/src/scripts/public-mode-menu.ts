const trigger = document.getElementById("public-mode-menu-trigger");
const panel = document.getElementById("public-mode-menu-panel");

if (trigger instanceof HTMLButtonElement && panel instanceof HTMLElement) {
  const menuTrigger = trigger;
  const menuPanel = panel;

  function setOpen(nextOpen: boolean) {
    menuPanel.hidden = !nextOpen;
    menuTrigger.setAttribute("aria-expanded", String(nextOpen));
  }

  function close() {
    setOpen(false);
  }

  menuTrigger.addEventListener("click", () => {
    setOpen(menuPanel.hidden);
  });

  document.addEventListener("click", (event) => {
    if (menuPanel.hidden || !(event.target instanceof Node)) return;
    if (menuPanel.contains(event.target) || menuTrigger.contains(event.target)) return;
    close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}
