declare global {
  interface Window {
    __MANABUPLAY_DATA__?: unknown;
    __MANABUPLAY_LOCALE__?: string;
    __MANABUPLAY_MODE__?: string;
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
