import { describe, expect, it } from 'vitest';
import {
  buildMotivationToast,
  MOTIVATION_TOAST_DURATION_MS,
  resetMotivationRunState,
} from './toastEngine';

describe('motivation toast engine', () => {
  it('returns null toast when streak is invalid or not a milestone', () => {
    expect(buildMotivationToast({ streak: 0, bestStreakBefore: 0 })).toEqual({
      toast: null,
      state: {
        hasShownRecordInRun: false,
        hasShownX3InSession: false,
      },
    });
    expect(buildMotivationToast({ streak: 12, bestStreakBefore: 12 })).toEqual({
      toast: null,
      state: {
        hasShownRecordInRun: false,
        hasShownX3InSession: false,
      },
    });
  });

  it('triggers x3 only once per session', () => {
    const first = buildMotivationToast({
      streak: 3,
      bestStreakBefore: 2,
      state: {},
    });
    expect(first).toEqual({
      toast: {
        tone: 'streak',
        message: '✨ Série x3 !',
      },
      state: {
        hasShownRecordInRun: false,
        hasShownX3InSession: true,
      },
    });

    const second = buildMotivationToast({
      streak: 3,
      bestStreakBefore: 2,
      state: first.state,
    });
    expect(second).toEqual({
      toast: {
        tone: 'record',
        message: '🏆 Nouveau record : série x3 !',
      },
      state: {
        hasShownRecordInRun: true,
        hasShownX3InSession: true,
      },
    });
  });

  it('returns record toast when best streak is beaten outside milestones', () => {
    const result = buildMotivationToast({
      streak: 7,
      bestStreakBefore: 6,
      state: {
        hasShownRecordInRun: false,
        hasShownX3InSession: true,
      },
    });

    expect(result).toEqual({
      toast: {
        tone: 'record',
        message: '🏆 Nouveau record : série x7 !',
      },
      state: {
        hasShownRecordInRun: true,
        hasShownX3InSession: true,
      },
    });
  });

  it('does not repeat record toast in same run', () => {
    const result = buildMotivationToast({
      streak: 8,
      bestStreakBefore: 7,
      state: {
        hasShownRecordInRun: true,
        hasShownX3InSession: true,
      },
    });

    expect(result).toEqual({
      toast: null,
      state: {
        hasShownRecordInRun: true,
        hasShownX3InSession: true,
      },
    });
  });

  it('allows record toast again after run reset', () => {
    const reset = resetMotivationRunState({
      hasShownRecordInRun: true,
      hasShownX3InSession: true,
    });
    expect(reset).toEqual({
      hasShownRecordInRun: false,
      hasShownX3InSession: true,
    });

    const result = buildMotivationToast({
      streak: 8,
      bestStreakBefore: 7,
      state: reset,
    });

    expect(result).toEqual({
      toast: {
        tone: 'record',
        message: '🏆 Nouveau record : série x8 !',
      },
      state: {
        hasShownRecordInRun: true,
        hasShownX3InSession: true,
      },
    });
  });

  it('keeps milestone behavior for non-record streaks', () => {
    const result = buildMotivationToast({
      streak: 30,
      bestStreakBefore: 42,
      state: {
        hasShownRecordInRun: false,
        hasShownX3InSession: true,
      },
    });

    expect(result).toEqual({
      toast: {
        tone: 'streak',
        message: '🌟 Série x30 !',
      },
      state: {
        hasShownRecordInRun: false,
        hasShownX3InSession: true,
      },
    });
  });

  it('uses 2.2s toast duration', () => {
    expect(MOTIVATION_TOAST_DURATION_MS).toBe(2200);
  });
});
