const label = document.getElementById("archiveSelectedLabel");
const params = new URLSearchParams(window.location.search);
const selectedDate = params.get("date");
const fallbackDate = label?.getAttribute("data-default-date") || "";
const activeDate =
  selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate) ? selectedDate : fallbackDate;

if (label && activeDate) {
  const langCode = document.documentElement.lang === "fr" ? "fr-FR" : "en-US";
  const prefix =
    document.documentElement.lang === "fr"
      ? label.getAttribute("data-prefix-fr")
      : label.getAttribute("data-prefix-en");
  const formatted = new Intl.DateTimeFormat(langCode, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${activeDate}T12:00:00`));
  label.textContent = `${prefix}: ${formatted}`;
}

document.querySelectorAll("[data-archive-date]").forEach((chip) => {
  if (!(chip instanceof HTMLElement)) {
    return;
  }

  const isActive = chip.getAttribute("data-archive-date") === activeDate;
  chip.classList.toggle("is-active", isActive);
  chip.classList.toggle("border-[rgba(232,121,249,.42)]", isActive);
  chip.classList.toggle("bg-[rgba(232,121,249,.12)]", isActive);
  chip.classList.toggle("text-white", isActive);
  chip.classList.toggle(
    "shadow-[0_0_0_1px_rgba(232,121,249,.18),0_0_18px_rgba(232,121,249,.14)]",
    isActive,
  );
  chip.classList.toggle("border-[rgba(139,92,246,.22)]", !isActive);
  chip.classList.toggle("bg-[rgba(26,22,48,.54)]", !isActive);
  chip.classList.toggle("text-[rgba(226,217,243,.78)]", !isActive);
});
