const MANABUPLAY_TOOLBAR_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5.5 6.25h13c1.66 0 3 1.34 3 3v5.5c0 1.66-1.34 3-3 3h-13c-1.66 0-3-1.34-3-3v-5.5c0-1.66 1.34-3 3-3Zm.75 4.5v2.5h1.75v1.75h2.5v-1.75h1.75v-2.5h-1.75V9h-2.5v1.75H6.25Zm9.75 3.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm2.25-3.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/></svg>';

export function manabuplayDevToolbar() {
  return {
    name: "manabuplay-dev-toolbar",
    hooks: {
      "astro:config:setup": ({ addDevToolbarApp, command }) => {
        if (command !== "dev") return;

        addDevToolbarApp({
          id: "manabuplay:qa",
          name: "Manabu QA",
          icon: MANABUPLAY_TOOLBAR_ICON,
          entrypoint: new URL("./manabuplay-toolbar-app.js", import.meta.url),
        });
      },
    },
  };
}
