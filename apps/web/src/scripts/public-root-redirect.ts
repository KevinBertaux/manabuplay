type RedirectPayload = {
  supportedLocales?: string[];
  fallbackLocale?: string;
};

const payloadElement = document.getElementById("public-root-redirect-data");

if (payloadElement instanceof HTMLTemplateElement) {
  try {
    const payload = JSON.parse(payloadElement.innerHTML || "{}") as RedirectPayload;
    const supported = Array.isArray(payload.supportedLocales) ? payload.supportedLocales : ["en"];
    const fallback = typeof payload.fallbackLocale === "string" ? payload.fallbackLocale : "en";
    const preferred =
      (navigator.languages || [navigator.language || fallback])
        .map(
          (lang) =>
            String(lang || "")
              .toLowerCase()
              .split("-")[0],
        )
        .find((lang) => supported.includes(lang)) || fallback;

    window.location.replace(`/${preferred}/${window.location.search}${window.location.hash}`);
  } catch (error) {
    console.error("Public locale redirect payload is invalid.", error);
  }
}
