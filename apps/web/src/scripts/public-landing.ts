import { createRevealObserver, createWaitlistController } from "./quiz-app/engagement";
import type { BootTranslationValue, QuizBootData } from "./quiz-app/runtime-types";

const WAITLIST_STORAGE_KEY = "waitlist_submissions";
const WAITLIST_FORM_NAME = "manabuplay-waitlist";
const WAITLIST_SUCCESS_BUTTON_DELAY = 2800;
const WAITLIST_SUCCESS_MESSAGE_DELAY = 4000;
const SUPPORTED_LANGS = ["en", "fr"] as const;

const bootData = window.__MANABUPLAY_DATA__ as QuizBootData | undefined;
if (!bootData?.lang) {
  throw new Error("ManabuPlay boot data is missing.");
}

const LANG = bootData.lang;

const pageLocale = SUPPORTED_LANGS.includes(
  window.__MANABUPLAY_LOCALE__ as (typeof SUPPORTED_LANGS)[number],
)
  ? window.__MANABUPLAY_LOCALE__
  : null;

const storage = {
  get<T = unknown>(key: string): T | null {
    try {
      return JSON.parse(localStorage.getItem(`mp_${key}`) || "null") as T | null;
    } catch {
      return null;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(`mp_${key}`, JSON.stringify(value));
    } catch {
      // Ignore localStorage write failures in private mode or restricted browsers.
    }
  },
};

const currentLang =
  pageLocale ||
  (SUPPORTED_LANGS.includes(storage.get("lang") as (typeof SUPPORTED_LANGS)[number])
    ? (storage.get("lang") as string)
    : "en");

const t = (key: string): BootTranslationValue =>
  (LANG[currentLang as keyof typeof LANG]?.[key] ?? LANG.en?.[key]) as BootTranslationValue;

function applyLang() {
  const htmlRoot = document.getElementById("htmlRoot");
  if (htmlRoot) {
    htmlRoot.lang = currentLang;
  }

  const seoTitle = t("seo_title");
  if (typeof seoTitle === "string" && seoTitle) {
    document.title = seoTitle;
  }

  const seoDescription = t("seo_description");
  if (typeof seoDescription === "string" && seoDescription) {
    const metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", seoDescription);
    }
  }

  const ogDescription = t("og_description");
  if (typeof ogDescription === "string" && ogDescription) {
    const ogMetaDescription = document.querySelector<HTMLMetaElement>(
      'meta[property="og:description"]',
    );
    if (ogMetaDescription) {
      ogMetaDescription.setAttribute("content", ogDescription);
    }
  }

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    const value = t(element.dataset.i18n || "");
    if (typeof value === "string") element.innerHTML = value;
  });

  document.querySelectorAll<HTMLInputElement>("[data-i18n-ph]").forEach((element) => {
    const value = t(element.dataset.i18nPh || "");
    element.placeholder = typeof value === "string" ? value : "";
  });

  document.getElementById("btnEN")?.classList.toggle("active", currentLang === "en");
  document.getElementById("btnFR")?.classList.toggle("active", currentLang === "fr");
}

const waitlistController = createWaitlistController({
  storage,
  currentLangRef: () => currentLang,
  t,
  waitlistStorageKey: WAITLIST_STORAGE_KEY,
  waitlistFormName: WAITLIST_FORM_NAME,
  successButtonDelay: WAITLIST_SUCCESS_BUTTON_DELAY,
  successMessageDelay: WAITLIST_SUCCESS_MESSAGE_DELAY,
});

applyLang();
createRevealObserver().observeAll(".reveal");

const waitlistForm = document.querySelector('form[name="manabuplay-waitlist"]');
if (waitlistForm instanceof HTMLFormElement) {
  waitlistForm.addEventListener("submit", waitlistController.handleEmailSubmit);
}

export {};
