import { resolveAdminLang, updateAdminLocalizedNodes } from "./admin-i18n";

const scrollTopButton = document.querySelector(".reader-scrolltop");
const bulkToggle = document.querySelector("[data-toggle-all]");
const cartouche = document.querySelector("[data-reader-cartouche]");
const giftToggle = document.querySelector("[data-toggle-gifts]");
const giftList = document.querySelector("[data-gift-list]");
const cards = Array.from(document.querySelectorAll("[data-admin-card]")).filter(
  (card): card is HTMLElement => card instanceof HTMLElement,
);
const paginationBars = Array.from(document.querySelectorAll("[data-reader-pagination]")).filter(
  (bar): bar is HTMLElement => bar instanceof HTMLElement,
);
const wordsPerPage = 10;
const totalPages = Math.max(1, Math.ceil(cards.length / wordsPerPage));
let activeCard: HTMLElement | null = null;
let adminLang = resolveAdminLang(document.documentElement.lang);
let activeGiftFlashTimeout: number | null = null;
let currentPage = 1;

function getCorrectIndex(card: HTMLElement): number {
  return Number(card.dataset[`correctIndex${adminLang === "fr" ? "Fr" : "En"}`] ?? "-1");
}

function getSelectedIndex(card: HTMLElement): number {
  return Number(card.dataset[`selectedIndex${adminLang === "fr" ? "Fr" : "En"}`] ?? "-1");
}

function setSelectedIndex(card: HTMLElement, value: string): void {
  card.dataset[`selectedIndex${adminLang === "fr" ? "Fr" : "En"}`] = String(value);
}

function applyAdminLang(nextLang: unknown): void {
  adminLang = resolveAdminLang(nextLang);
  updateAdminLocalizedNodes(adminLang);
  document.querySelectorAll("[data-admin-card]").forEach((card) => {
    if (card instanceof HTMLElement) {
      syncAnswerState(card);
    }
  });
}

function syncBulkToggle(): void {
  if (!(bulkToggle instanceof HTMLButtonElement)) {
    return;
  }

  const allPristine = cards.every((card) => card.dataset.state === "pristine");
  bulkToggle.textContent = allPristine ? "Tout révéler" : "Tout replier";
}

function syncCartoucheCompact(): void {
  if (!(cartouche instanceof HTMLElement)) {
    return;
  }

  cartouche.classList.toggle("compact", window.scrollY > 180);
}

function toggleGiftList(forceOpen?: boolean): void {
  if (!(giftToggle instanceof HTMLButtonElement) || !(giftList instanceof HTMLElement)) {
    return;
  }

  const nextState = typeof forceOpen === "boolean" ? forceOpen : giftList.hidden;
  giftList.hidden = !nextState;
  giftToggle.setAttribute("aria-expanded", nextState ? "true" : "false");
}

function flashCard(card: HTMLElement): void {
  card.classList.remove("flash-target");
  void card.offsetWidth;
  card.classList.add("flash-target");

  if (activeGiftFlashTimeout) {
    window.clearTimeout(activeGiftFlashTimeout);
  }

  activeGiftFlashTimeout = window.setTimeout(() => {
    card.classList.remove("flash-target");
  }, 2200);
}

function setActiveCard(nextCard: HTMLElement): void {
  document.querySelectorAll("[data-admin-card][data-active='true']").forEach((card) => {
    if (card instanceof HTMLElement) {
      delete card.dataset.active;
    }
  });

  nextCard.dataset.active = "true";
  activeCard = nextCard;
}

function getPageFromUrl(): number {
  const url = new URL(window.location.href);
  const page = Number(url.searchParams.get("page") || "1");
  return Number.isFinite(page) && page >= 1 && page <= totalPages ? page : 1;
}

function setPageInUrl(page: number): void {
  const url = new URL(window.location.href);
  if (page <= 1) {
    url.searchParams.delete("page");
  } else {
    url.searchParams.set("page", String(page));
  }
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function renderPagination(): void {
  const start = (currentPage - 1) * wordsPerPage;
  const end = Math.min(cards.length, start + wordsPerPage);

  cards.forEach((card, index) => {
    card.hidden = index < start || index >= end;
  });

  paginationBars.forEach((bar) => {
    const info = bar.querySelector("[data-page-info]");
    const prev = bar.querySelector("[data-page-prev]");
    const next = bar.querySelector("[data-page-next]");
    const numbers = bar.querySelector("[data-page-numbers]");

    if (info instanceof HTMLElement) {
      info.textContent = `Page ${currentPage}/${totalPages} · mots ${start + 1}-${end}`;
    }

    if (prev instanceof HTMLButtonElement) {
      prev.disabled = currentPage === 1;
    }

    if (next instanceof HTMLButtonElement) {
      next.disabled = currentPage === totalPages;
    }

    if (numbers instanceof HTMLElement) {
      numbers.innerHTML = "";
      for (let page = 1; page <= totalPages; page += 1) {
        const button = document.createElement("button");
        button.type = "button";
        button.className =
          "reader-pagination-btn page-num" + (page === currentPage ? " is-active" : "");
        button.textContent = String(page);
        button.dataset.page = String(page);
        numbers.appendChild(button);
      }
    }
  });
}

function setPage(page: number, options: { silentScroll?: boolean } = {}): void {
  const nextPage = Math.min(totalPages, Math.max(1, page));
  currentPage = nextPage;
  renderPagination();
  setPageInUrl(nextPage);

  if (!options.silentScroll) {
    requestAnimationFrame(() => {
      syncCartoucheCompact();
      const firstVisibleCard = cards.find((card) => !card.hidden);
      if (!(firstVisibleCard instanceof HTMLElement)) {
        return;
      }

      const topNav = document.querySelector(".admin-topnav");
      const topNavHeight =
        topNav instanceof HTMLElement ? topNav.getBoundingClientRect().height : 0;
      const cartoucheHeight =
        cartouche instanceof HTMLElement ? cartouche.getBoundingClientRect().height : 0;
      const stickyOffset = topNavHeight + cartoucheHeight + 28;
      const top = window.scrollY + firstVisibleCard.getBoundingClientRect().top - stickyOffset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  }
}

function revealCardPage(card: HTMLElement, options: { silentScroll?: boolean } = {}): void {
  const index = cards.indexOf(card);
  if (index === -1) {
    return;
  }
  const page = Math.floor(index / wordsPerPage) + 1;
  setPage(page, options);
}

function syncAnswerState(card: HTMLElement): void {
  const pristine = card.dataset.state === "pristine";
  const selectedIndex = pristine ? -1 : getSelectedIndex(card);
  const correctIndex = getCorrectIndex(card);

  card.querySelectorAll("[data-answer-index]").forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const answerIndex = Number(button.dataset.answerIndex ?? "-1");
    button.classList.remove("selected", "correct", "wrong");

    if (pristine) {
      return;
    }

    if (answerIndex === correctIndex) {
      button.classList.add("correct");
    }

    if (answerIndex === selectedIndex) {
      button.classList.add("selected");
      if (answerIndex !== correctIndex) {
        button.classList.add("wrong");
      }
    }
  });
}

function applyCardState(card: HTMLElement, state: "pristine" | "revealed"): void {
  card.dataset.state = state;
  if (state === "pristine") {
    delete card.dataset.selectedIndexFr;
    delete card.dataset.selectedIndexEn;
  } else {
    if (!card.dataset.selectedIndexFr) {
      card.dataset.selectedIndexFr = card.dataset.correctIndexFr || "0";
    }
    if (!card.dataset.selectedIndexEn) {
      card.dataset.selectedIndexEn = card.dataset.correctIndexEn || "0";
    }
  }
  syncCardState(card);
  syncAnswerState(card);
  const toggle = card.querySelector("[data-toggle-card]");
  if (toggle instanceof HTMLButtonElement) {
    toggle.textContent = state === "pristine" ? "Voir correction" : "Avant réponse";
  }
  syncBulkToggle();
}

function syncCardState(card: HTMLElement): void {
  const pristine = card.dataset.state === "pristine";
  card.querySelectorAll("[data-revealed-only]").forEach((section) => {
    if (section instanceof HTMLElement) {
      section.hidden = pristine;
    }
  });
}

cards.forEach((card) => {
  syncCardState(card);
  syncAnswerState(card);
  card.addEventListener("mouseenter", () => setActiveCard(card));
  card.addEventListener("focusin", () => setActiveCard(card));
  card.addEventListener("click", () => setActiveCard(card));
});

document.querySelectorAll("[data-toggle-card]").forEach((button) => {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  button.addEventListener("click", () => {
    const card = button.closest("[data-admin-card]");
    if (!(card instanceof HTMLElement)) {
      return;
    }

    const nextState = card.dataset.state === "pristine" ? "revealed" : "pristine";
    applyCardState(card, nextState);
  });
});

document.querySelectorAll("[data-answer-index]").forEach((button) => {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  button.addEventListener("click", () => {
    const card = button.closest("[data-admin-card]");
    if (!(card instanceof HTMLElement)) {
      return;
    }

    setActiveCard(card);
    card.dataset.state = "revealed";
    setSelectedIndex(card, button.dataset.answerIndex || "0");
    syncCardState(card);
    syncAnswerState(card);
    const toggle = card.querySelector("[data-toggle-card]");
    if (toggle instanceof HTMLButtonElement) {
      toggle.textContent = "Avant réponse";
    }
    syncBulkToggle();
  });
});

if (giftToggle instanceof HTMLButtonElement) {
  giftToggle.addEventListener("click", () => {
    toggleGiftList();
  });
}

if (giftList instanceof HTMLElement) {
  giftList.querySelectorAll("[data-gift-word]").forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) {
      return;
    }

    link.addEventListener("click", (event) => {
      event.preventDefault();
      const order = link.dataset.giftOrder;
      const card = order ? document.getElementById(`word-${order}`) : null;
      if (!(card instanceof HTMLElement)) {
        return;
      }

      revealCardPage(card, { silentScroll: true });
      setActiveCard(card);
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      flashCard(card);
    });
  });
}

if (bulkToggle instanceof HTMLButtonElement) {
  bulkToggle.addEventListener("click", () => {
    const shouldCollapse = cards.some((card) => card.dataset.state !== "pristine");
    const nextState = shouldCollapse ? "pristine" : "revealed";

    cards.forEach((card) => {
      applyCardState(card, nextState);
    });
  });
}

if (scrollTopButton instanceof HTMLButtonElement) {
  scrollTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

paginationBars.forEach((bar) => {
  bar.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    if (target.hasAttribute("data-page-prev")) {
      setPage(currentPage - 1);
      return;
    }

    if (target.hasAttribute("data-page-next")) {
      setPage(currentPage + 1);
      return;
    }

    const page = Number(target.dataset.page || "0");
    if (page) {
      setPage(page);
    }
  });
});

window.addEventListener("adminlangchange", (event) => {
  const detail = event instanceof CustomEvent ? event.detail : null;
  applyAdminLang(detail?.lang);
});

currentPage = getPageFromUrl();
renderPagination();
applyAdminLang(adminLang);
syncCartoucheCompact();
window.addEventListener("scroll", syncCartoucheCompact, { passive: true });

document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  ) {
    return;
  }

  const keyMap: Record<string, number> = {
    Digit1: 0,
    Digit2: 1,
    Digit3: 2,
    Digit4: 3,
    Numpad1: 0,
    Numpad2: 1,
    Numpad3: 2,
    Numpad4: 3,
  };

  const answerIndex = keyMap[event.code];
  if (answerIndex === undefined) {
    return;
  }

  const card =
    activeCard instanceof HTMLElement
      ? activeCard
      : cards.find((candidate) => !candidate.hidden) || cards[0];
  if (!(card instanceof HTMLElement)) {
    return;
  }

  const button = card.querySelector(`[data-answer-index="${answerIndex}"]`);
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  event.preventDefault();
  button.click();
});

const firstCard = document.querySelector("[data-admin-card]");
if (firstCard instanceof HTMLElement) {
  setActiveCard(firstCard);
}

syncBulkToggle();
