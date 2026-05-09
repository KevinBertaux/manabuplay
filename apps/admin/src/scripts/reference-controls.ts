document.querySelectorAll<HTMLButtonElement>("[data-reference-lang]").forEach((button) => {
  button.addEventListener("click", () => {
    const lang = button.dataset.referenceLang;
    if (lang !== "en" && lang !== "fr") return;

    localStorage.setItem("mp_lang", JSON.stringify(lang));
    window.location.reload();
  });
});

export {};
