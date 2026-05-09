const bootElement = document.getElementById("manabuplay-boot");

if (bootElement instanceof HTMLTemplateElement) {
  try {
    const encodedPayload = bootElement.dataset.payload || "";
    const jsonPayload = encodedPayload
      ? new TextDecoder().decode(
          Uint8Array.from(window.atob(encodedPayload), (char) => char.charCodeAt(0)),
        )
      : "{}";
    const payload = JSON.parse(jsonPayload);
    window.__MANABUPLAY_DATA__ = payload.data;
    if (typeof payload.locale === "string") {
      window.__MANABUPLAY_LOCALE__ = payload.locale;
    }
    if (typeof payload.mode === "string") {
      window.__MANABUPLAY_MODE__ = payload.mode;
    }
  } catch (error) {
    console.error("ManabuPlay boot payload is invalid.", error);
  }
}
