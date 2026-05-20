/**
 * Loads Microsoft Clarity when injected with data-project-id (production only).
 */
(function loadClarity() {
  const script = document.currentScript;
  const projectId = script?.getAttribute("data-project-id")?.trim();
  if (!projectId || typeof window.clarity === "function") {
    return;
  }

  (function (c, l, a, r, i, t, y) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = `https://www.clarity.ms/tag/${i}`;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", projectId);
})();
