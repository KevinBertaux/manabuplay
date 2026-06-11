import { mountQuizApp } from "./quiz-app";

function whenBootReady(): Promise<void> {
  if (window.__MANABUPLAY_DATA__) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 200;

    const checkBoot = () => {
      if (window.__MANABUPLAY_DATA__) {
        resolve();
        return;
      }

      attempts += 1;
      if (attempts >= maxAttempts) {
        reject(new Error("ManabuPlay boot data is missing."));
        return;
      }

      window.requestAnimationFrame(checkBoot);
    };

    checkBoot();
  });
}

async function bootQuizIsland() {
  const island = document.querySelector<HTMLElement>("[data-quiz-island]");
  if (!(island instanceof HTMLElement)) {
    return;
  }

  await whenBootReady();
  mountQuizApp(island);
}

void bootQuizIsland();
