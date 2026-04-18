(function () {
  function boot() {
    const FX = window.ManabuPlayFX;
    if (!FX) {
      return;
    }

    const form = document.querySelector("[data-fx-form]");
    const resetButton = document.querySelector("[data-fx-reset]");
    const undoButton = document.querySelector("[data-fx-undo]");
    const redoButton = document.querySelector("[data-fx-redo]");
    const status = document.querySelector("[data-fx-status]");

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    hydrateIsoPreviews();
    initResponseDemo();

    const valueInputs = Object.fromEntries(
      FX.PRESET_KEYS.map((key) => [key, form.querySelector(`[name="${key}"]`)]),
    );
    const enabledInputs = Object.fromEntries(
      FX.PRESET_KEYS.map((key) => [key, form.querySelector(`[data-fx-enabled="${key}"]`)]),
    );
    const editInputs = Object.fromEntries(
      FX.PRESET_KEYS.map((key) => [key, form.querySelector(`[data-fx-edit="${key}"]`)]),
    );
    const rangeRows = Object.fromEntries(
      FX.PRESET_KEYS.map((key) => [key, form.querySelector(`[data-fx-key="${key}"]`)]),
    );

    let history = [];
    let historyIndex = -1;

    function snapshot() {
      const values = {};
      const enabled = {};

      for (const key of FX.PRESET_KEYS) {
        const valueInput = valueInputs[key];
        const enabledInput = enabledInputs[key];
        values[key] =
          valueInput instanceof HTMLInputElement ? Number(valueInput.value) : FX.DEFAULT_VALUES[key];
        enabled[key] =
          enabledInput instanceof HTMLInputElement ? enabledInput.checked : FX.DEFAULT_ENABLED[key];
      }

      return FX.normalizeState({ values, enabled });
    }

    function updateUndoRedoButtons() {
      if (undoButton instanceof HTMLButtonElement) {
        undoButton.disabled = historyIndex <= 0;
      }
      if (redoButton instanceof HTMLButtonElement) {
        redoButton.disabled = historyIndex >= history.length - 1;
      }
    }

    function closeEditors() {
      for (const key of FX.PRESET_KEYS) {
        const row = rangeRows[key];
        if (row instanceof HTMLElement) {
          row.dataset.editing = "false";
        }
      }
    }

    function render(state, options = {}) {
      const normalized = FX.normalizeState(state);

      for (const key of FX.PRESET_KEYS) {
        const row = rangeRows[key];
        const valueInput = valueInputs[key];
        const enabledInput = enabledInputs[key];
        const editInput = editInputs[key];

        if (valueInput instanceof HTMLInputElement) {
          valueInput.value = String(normalized.values[key]);
        }
        if (enabledInput instanceof HTMLInputElement) {
          enabledInput.checked = normalized.enabled[key];
        }
        if (editInput instanceof HTMLInputElement) {
          editInput.value = String(normalized.values[key]);
        }
        if (row instanceof HTMLElement) {
          row.dataset.disabled = normalized.enabled[key] ? "false" : "true";
          if (row.dataset.editing !== "true") {
            row.dataset.editing = "false";
          }
        }
      }

      FX.writeState(normalized);
      FX.syncDocument(normalized);

      if (!options.keepStatus && status instanceof HTMLElement) {
        status.textContent = "";
      }
    }

    function pushHistory(state) {
      const normalized = FX.normalizeState(state);
      const current = history[historyIndex];
      if (current && JSON.stringify(current) === JSON.stringify(normalized)) {
        return;
      }
      history = history.slice(0, historyIndex + 1);
      history.push(normalized);
      historyIndex = history.length - 1;
      updateUndoRedoButtons();
    }

    function commit(state, options = {}) {
      render(state, options);
      if (!options.skipHistory) {
        pushHistory(state);
      }
    }

    function updateFromControls() {
      commit(snapshot());
    }

    function previewFromControls() {
      render(snapshot(), { keepStatus: true });
    }

    function openEditor(key) {
      closeEditors();
      const row = rangeRows[key];
      const editInput = editInputs[key];
      if (row instanceof HTMLElement) {
        row.dataset.editing = "true";
      }
      if (editInput instanceof HTMLInputElement) {
        editInput.focus();
        editInput.select();
      }
    }

    function closeEditor(key) {
      const row = rangeRows[key];
      if (row instanceof HTMLElement) {
        row.dataset.editing = "false";
      }
    }

    function applyEditorValue(key, { cancel = false } = {}) {
      const editInput = editInputs[key];
      const valueInput = valueInputs[key];

      if (!(editInput instanceof HTMLInputElement) || !(valueInput instanceof HTMLInputElement)) {
        return;
      }

      if (!cancel) {
        const normalized = FX.normalizeState({
          values: { [key]: editInput.value },
          enabled: {},
        });
        valueInput.value = String(normalized.values[key]);
        updateFromControls();
      } else {
        editInput.value = valueInput.value;
      }

      closeEditor(key);
    }

    FX.PRESET_KEYS.forEach((key) => {
      const valueInput = valueInputs[key];
      const enabledInput = enabledInputs[key];
      const editInput = editInputs[key];
      const editToggle = form.querySelector(`[data-fx-edit-toggle="${key}"]`);

      if (valueInput instanceof HTMLInputElement) {
        valueInput.addEventListener("input", previewFromControls);
        valueInput.addEventListener("change", updateFromControls);
      }
      if (enabledInput instanceof HTMLInputElement) {
        enabledInput.addEventListener("change", updateFromControls);
      }
      if (editToggle instanceof HTMLButtonElement) {
        editToggle.addEventListener("click", () => openEditor(key));
      }
      if (editInput instanceof HTMLInputElement) {
        editInput.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            applyEditorValue(key);
          }
          if (event.key === "Escape") {
            event.preventDefault();
            applyEditorValue(key, { cancel: true });
          }
        });
        editInput.addEventListener("blur", () => applyEditorValue(key));
      }
    });

    if (undoButton instanceof HTMLButtonElement) {
      undoButton.addEventListener("click", () => {
        if (historyIndex <= 0) {
          return;
        }
        historyIndex -= 1;
        render(history[historyIndex], { keepStatus: true, skipHistory: true });
        updateUndoRedoButtons();
      });
    }

    if (redoButton instanceof HTMLButtonElement) {
      redoButton.addEventListener("click", () => {
        if (historyIndex >= history.length - 1) {
          return;
        }
        historyIndex += 1;
        render(history[historyIndex], { keepStatus: true, skipHistory: true });
        updateUndoRedoButtons();
      });
    }

    if (resetButton instanceof HTMLButtonElement) {
      resetButton.addEventListener("click", () => {
        closeEditors();
        commit({ values: FX.DEFAULT_VALUES, enabled: FX.DEFAULT_ENABLED });
      });
    }

    const initial = FX.readState();
    render(initial, { keepStatus: true, skipHistory: true });
    history = [FX.normalizeState(initial)];
    historyIndex = 0;
    updateUndoRedoButtons();
  }

  function getIsoPreviewBase() {
    if (window.location.protocol === "file:") {
      return "http://127.0.0.1:4174";
    }

    const origin = window.location.origin;
    return origin === "null" ? "http://127.0.0.1:4174" : origin;
  }

  function hydrateIsoPreviews() {
    const base = getIsoPreviewBase();

    document.querySelectorAll("[data-iso-src]").forEach((node) => {
      if (node instanceof HTMLIFrameElement) {
        const path = node.dataset.isoSrc;
        if (path) {
          node.src = `${base}${path}`;
        }
      }
    });

    document.querySelectorAll("[data-iso-link]").forEach((node) => {
      if (node instanceof HTMLAnchorElement) {
        const path = node.dataset.isoLink;
        if (path) {
          node.href = `${base}${path}`;
        }
      }
    });
  }

  function initResponseDemo() {
    const root = document.querySelector("[data-response-demo]");
    if (!(root instanceof HTMLElement)) {
      return;
    }

    const scoreNode = root.querySelector("[data-demo-score]");
    const streakNode = root.querySelector("[data-demo-streak]");
    const popNode = root.querySelector("[data-demo-pop]");
    const feedbackNode = root.querySelector("[data-demo-feedback]");
    const hintText = root.querySelector("[data-demo-hint-text]");
    const correctButton = root.querySelector('[data-demo-answer="correct"]');
    const wrongButton = root.querySelector('[data-demo-answer="wrong"]');
    const hintButton = root.querySelector("[data-demo-hint]");
    const resetButton = root.querySelector("[data-demo-reset]");
    const particleZone = root.querySelector(".fx-demo-shell");

    if (
      !(scoreNode instanceof HTMLElement) ||
      !(streakNode instanceof HTMLElement) ||
      !(popNode instanceof HTMLElement) ||
      !(feedbackNode instanceof HTMLElement) ||
      !(hintText instanceof HTMLElement) ||
      !(correctButton instanceof HTMLButtonElement) ||
      !(wrongButton instanceof HTMLButtonElement) ||
      !(hintButton instanceof HTMLButtonElement) ||
      !(resetButton instanceof HTMLButtonElement) ||
      !(particleZone instanceof HTMLElement)
    ) {
      return;
    }

    let score = 0;
    let streak = 0;

    function renderHud() {
      scoreNode.textContent = String(score);
      streakNode.textContent = streak >= 2 ? `x${streak}` : String(streak);
    }

    function clearAnswerState() {
      correctButton.classList.remove("correct", "wrong");
      wrongButton.classList.remove("correct", "wrong");
      feedbackNode.classList.remove("is-good", "is-bad");
    }

    function pulseScore(text, color) {
      popNode.textContent = text;
      popNode.style.color = color;
      popNode.classList.remove("score-pop");
      void popNode.offsetWidth;
      popNode.classList.add("score-pop");
    }

    function spawnParticles(button, color) {
      const buttonRect = button.getBoundingClientRect();
      const zoneRect = particleZone.getBoundingClientRect();
      const cx = buttonRect.left - zoneRect.left + buttonRect.width / 2;
      const cy = buttonRect.top - zoneRect.top + buttonRect.height / 2;

      for (let index = 0; index < 8; index += 1) {
        const particle = document.createElement("div");
        particle.className = "fx-demo-particle";
        particle.style.left = `${cx}px`;
        particle.style.top = `${cy}px`;
        particle.style.background = color;
        particle.style.setProperty("--tx", `${(Math.random() - 0.5) * 120}px`);
        particle.style.setProperty("--ty", `${(Math.random() - 0.8) * 100}px`);
        particleZone.appendChild(particle);
        particle.addEventListener("animationend", () => particle.remove(), { once: true });
      }
    }

    function revealHint() {
      hintText.hidden = false;
      hintText.classList.remove("hint-revealed");
      void hintText.offsetWidth;
      hintText.classList.add("hint-revealed");
    }

    function resetDemo() {
      score = 0;
      streak = 0;
      clearAnswerState();
      feedbackNode.textContent = "Choisis une action pour previsualiser le feedback.";
      popNode.textContent = "";
      popNode.classList.remove("score-pop");
      hintText.hidden = true;
      hintText.classList.remove("hint-revealed");
      particleZone.querySelectorAll(".fx-demo-particle").forEach((node) => node.remove());
      renderHud();
    }

    correctButton.addEventListener("click", () => {
      clearAnswerState();
      revealHint();
      streak += 1;
      const bonus = streak >= 3 ? 15 : streak >= 2 ? 12 : 10;
      score += bonus;
      correctButton.classList.add("correct");
      feedbackNode.classList.add("is-good");
      feedbackNode.textContent =
        streak >= 3
          ? `Correct +${bonus} pts · combo x${streak}`
          : `Correct +${bonus} pts`;
      pulseScore(`+${bonus}`, "#22d3ee");
      spawnParticles(correctButton, "#4ade80");
      renderHud();
    });

    wrongButton.addEventListener("click", () => {
      clearAnswerState();
      revealHint();
      streak = 0;
      wrongButton.classList.add("wrong");
      correctButton.classList.add("correct");
      feedbackNode.classList.add("is-bad");
      feedbackNode.textContent = "Wrong · la bonne reponse est la premiere carte.";
      pulseScore("MISS", "#f87171");
      renderHud();
    });

    hintButton.addEventListener("click", revealHint);
    resetButton.addEventListener("click", resetDemo);

    resetDemo();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
