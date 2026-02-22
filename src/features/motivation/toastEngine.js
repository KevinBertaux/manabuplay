export const MOTIVATION_TOAST_DURATION_MS = 2200;

const BASE_MILESTONES = [5, 10, 15, 20];

function isMilestone(streak) {
  if (!Number.isInteger(streak) || streak <= 0) {
    return false;
  }
  if (BASE_MILESTONES.includes(streak)) {
    return true;
  }
  return streak > 20 && streak % 10 === 0;
}

function milestoneMessage(streak) {
  if (streak === 5) {
    return '🔥 Série x5 !';
  }
  if (streak === 10) {
    return '🚀 Série x10 !';
  }
  if (streak === 15) {
    return '💥 Série x15 !';
  }
  if (streak === 20) {
    return '🏅 Série x20 !';
  }
  return `🌟 Série x${streak} !`;
}

function baseState(state = {}) {
  return {
    hasShownX3InSession: Boolean(state.hasShownX3InSession),
    hasShownRecordInRun: Boolean(state.hasShownRecordInRun),
  };
}

export function resetMotivationRunState(state = {}) {
  return {
    ...baseState(state),
    hasShownRecordInRun: false,
  };
}

export function buildMotivationToast({ streak, bestStreakBefore = 0, state = {} } = {}) {
  const nextState = baseState(state);

  if (!Number.isInteger(streak) || streak <= 0) {
    return {
      toast: null,
      state: nextState,
    };
  }

  if (streak === 3 && !nextState.hasShownX3InSession) {
    nextState.hasShownX3InSession = true;
    return {
      toast: {
        tone: 'streak',
        message: '✨ Série x3 !',
      },
      state: nextState,
    };
  }

  if (streak > bestStreakBefore && !nextState.hasShownRecordInRun) {
    nextState.hasShownRecordInRun = true;
    return {
      toast: {
        tone: 'record',
        message: `🏆 Nouveau record : série x${streak} !`,
      },
      state: nextState,
    };
  }

  if (!isMilestone(streak)) {
    return {
      toast: null,
      state: nextState,
    };
  }

  return {
    toast: {
      tone: 'streak',
      message: milestoneMessage(streak),
    },
    state: nextState,
  };
}
