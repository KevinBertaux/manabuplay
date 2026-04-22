import type {
  Difficulty,
  ResultTier,
  RuntimeState,
  StorageAdapter,
  WaitlistSubmission,
} from "./runtime-types";

const WAITLIST_EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;

type TranslateFn = (key: string) => string | ResultTier[] | undefined;

export function createRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  return {
    observeAll(selector: string) {
      document.querySelectorAll(selector).forEach((element) => observer.observe(element));
    },
  };
}

function normalizeEmail(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isValidWaitlistEmail(email: string): boolean {
  if (!WAITLIST_EMAIL_RE.test(email)) return false;
  const [local, domain] = email.split("@");
  if (!local || !domain) return false;
  if (/[/:<>"\s]/.test(email)) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  const labels = domain.split(".");
  if (labels.some((label) => !label || label.startsWith("-") || label.endsWith("-"))) return false;
  const tld = labels[labels.length - 1];
  return /^[a-z]{2,}$/i.test(tld);
}

function isLocalWaitlistMode(): boolean {
  return (
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname) ||
    window.location.protocol === "file:"
  );
}

export function createWaitlistController({
  storage,
  currentLangRef,
  t,
  waitlistStorageKey,
  waitlistFormName,
  successButtonDelay,
  successMessageDelay,
}: {
  storage: StorageAdapter;
  currentLangRef: () => string;
  t: TranslateFn;
  waitlistStorageKey: string;
  waitlistFormName: string;
  successButtonDelay: number;
  successMessageDelay: number;
}) {
  let waitlistButtonTimer: number | null = null;
  let waitlistMessageTimer: number | null = null;

  function readWaitlistSubmissions(): WaitlistSubmission[] {
    const submissions = storage.get(waitlistStorageKey);
    return Array.isArray(submissions) ? (submissions as WaitlistSubmission[]) : [];
  }

  function saveLocalWaitlistSubmission(email: string) {
    const normalizedEmail = normalizeEmail(email);
    const submissions = readWaitlistSubmissions();
    const existing = submissions.find((entry) => normalizeEmail(entry.email) === normalizedEmail);

    if (existing) {
      return { submission: existing, duplicate: true };
    }

    const submission: WaitlistSubmission = {
      email: normalizedEmail,
      lang: currentLangRef(),
      source: "localStorage",
      formName: waitlistFormName,
      createdAt: new Date().toISOString(),
      page: `${window.location.pathname}${window.location.hash || ""}`,
    };
    storage.set(waitlistStorageKey, [submission, ...submissions]);
    return { submission, duplicate: false };
  }

  function showWaitlistSuccess(
    form: HTMLFormElement,
    input: HTMLInputElement,
    success: HTMLElement,
  ) {
    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const successText = success.querySelector<HTMLSpanElement>("span");
    if (waitlistButtonTimer) window.clearTimeout(waitlistButtonTimer);
    if (waitlistMessageTimer) window.clearTimeout(waitlistMessageTimer);

    success.style.display = "block";
    success.classList.remove("waitlist-success-pop", "waitlist-success-fade");
    void success.offsetWidth;
    success.classList.add("waitlist-success-pop");
    if (successText) {
      const okText = t("email_ok");
      successText.textContent = typeof okText === "string" ? okText : "";
    }

    input.value = "";
    window.setTimeout(() => input.focus(), 150);

    if (submitButton) {
      submitButton.disabled = false;
      const savedLabel = t("email_saved_cta");
      submitButton.textContent = typeof savedLabel === "string" ? savedLabel : "Saved";
      submitButton.classList.add("waitlist-submit-saved");
      waitlistButtonTimer = window.setTimeout(() => {
        const idleLabel = t("email_cta");
        submitButton.textContent = typeof idleLabel === "string" ? idleLabel : "Submit";
        submitButton.classList.remove("waitlist-submit-saved");
      }, successButtonDelay);
    }

    waitlistMessageTimer = window.setTimeout(() => {
      success.classList.remove("waitlist-success-pop");
      success.classList.add("waitlist-success-fade");
      success.addEventListener(
        "animationend",
        () => {
          if (success.classList.contains("waitlist-success-fade")) {
            success.style.display = "none";
            success.classList.remove("waitlist-success-fade");
          }
        },
        { once: true },
      );
    }, successMessageDelay);
  }

  async function handleEmailSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;

    const input = document.getElementById("emailInput");
    const success = document.getElementById("emailSuccess");
    if (!(input instanceof HTMLInputElement) || !(success instanceof HTMLElement)) return;

    const email = normalizeEmail(input.value);
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');

    input.setCustomValidity("");
    if (!input.validity.valid || !isValidWaitlistEmail(email)) {
      input.setCustomValidity(
        currentLangRef() === "fr"
          ? "Entre une adresse email valide."
          : "Enter a valid email address.",
      );
      input.reportValidity();
      return;
    }

    if (isLocalWaitlistMode()) {
      saveLocalWaitlistSubmission(email);
      showWaitlistSuccess(form, input, success);
      return;
    }

    const originalText = button?.textContent || "";
    if (button) {
      button.disabled = true;
      button.textContent = "...";
    }

    try {
      const body = new URLSearchParams({
        "form-name": waitlistFormName,
        email,
        lang: currentLangRef(),
      });

      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (response.ok) {
        showWaitlistSuccess(form, input, success);
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.warn("Netlify form submit error:", error);
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
      success.style.display = "block";
      const span = success.querySelector<HTMLSpanElement>("span");
      if (span) {
        span.textContent =
          currentLangRef() === "fr"
            ? "⚠ Réessaie dans un instant…"
            : "⚠ Something went wrong, please retry.";
      }
    }
  }

  return { handleEmailSubmit };
}

export function createShareController({
  state,
  getCurrentDiff,
  getCurrentLang,
  getResults,
  t,
}: {
  state: RuntimeState;
  getCurrentDiff: () => Difficulty | null;
  getCurrentLang: () => string;
  getResults: () => ResultTier[];
  t: TranslateFn;
}) {
  function buildShareText(): string {
    const total = state.questions.length;
    const pct = Math.round((state.score / (total * 15)) * 100);
    const currentDiff = getCurrentDiff();
    const diffKey = currentDiff ? `diff_${currentDiff.id}` : "diff_normal";
    const diffLabel = t(diffKey);
    const results = getResults();
    const tier = results.find((result) => pct >= result.min) || results[results.length - 1];
    const filled = Math.round(pct / 10);
    const bar = "🟪".repeat(filled) + "⬛".repeat(10 - filled);
    const safeDiffLabel = typeof diffLabel === "string" ? diffLabel : currentDiff?.id || "normal";

    return getCurrentLang() === "fr"
      ? `${tier.emoji} ManabuPlay — Quiz Gaming Japonais\nDifficulté : ${safeDiffLabel} | ${state.correct}/${total} réponses justes\nScore : ${state.score} pts (${pct}%)\n${bar}\nTeste ton niveau 👇`
      : `${tier.emoji} ManabuPlay — Japanese Gaming Quiz\nDifficulty: ${safeDiffLabel} | ${state.correct}/${total} correct\nScore: ${state.score} pts (${pct}%)\n${bar}\nTest your level 👇`;
  }

  function shareOnX() {
    const text = buildShareText();
    const url = encodeURIComponent(window.location.href.split("#")[0]);
    const tweet = encodeURIComponent(`${text}\n${decodeURIComponent(url)}`);
    window.open(
      `https://x.com/intent/tweet?text=${tweet}`,
      "_blank",
      "noopener,width=600,height=500",
    );
  }

  function copyShareLink() {
    const text = `${buildShareText()}\n${window.location.href.split("#")[0]}`;
    const button = document.getElementById("shareBtnCopy");
    const label = document.getElementById("copyBtnLabel");

    if (!(button instanceof HTMLButtonElement) || !(label instanceof HTMLElement)) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        button.classList.add("copied");
        const copiedText = t("result_share_copied");
        label.textContent = typeof copiedText === "string" ? copiedText : "Copied!";
        setTimeout(() => {
          button.classList.remove("copied");
          const idleText = t("result_share_copy");
          label.textContent = typeof idleText === "string" ? idleText : "Copy Link";
        }, 2200);
      })
      .catch(() => {
        window.prompt(
          getCurrentLang() === "fr" ? "Copie ce texte manuellement :" : "Copy this text manually:",
          text,
        );
      });
  }

  return { shareOnX, copyShareLink };
}
