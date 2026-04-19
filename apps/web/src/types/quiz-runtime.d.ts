declare global {
  interface Window {
    setLang?: (lang: string) => void;
    launchQuiz?: () => void;
    revealHint?: (forceAll?: boolean) => void;
    nextQuestion?: () => void;
    replayDifficulty?: () => void;
    goToDiffPicker?: () => void;
    shareOnX?: () => void;
    copyShareLink?: () => void;
  }
}

export {};
