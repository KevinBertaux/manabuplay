(function () {
  const mobileQuery = window.matchMedia("(max-width: 760px)");

  function syncDevToolbar() {
    document.querySelectorAll("astro-dev-toolbar").forEach(function (el) {
      if (mobileQuery.matches) {
        el.style.setProperty("display", "none", "important");
      } else {
        el.style.removeProperty("display");
      }
    });
  }

  syncDevToolbar();
  mobileQuery.addEventListener("change", syncDevToolbar);
  new MutationObserver(syncDevToolbar).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
