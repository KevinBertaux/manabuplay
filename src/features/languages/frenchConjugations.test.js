import { describe, expect, it } from 'vitest';
import {
  buildFrenchVerbCards,
  buildFrenchVerbRows,
  createFrenchExercise,
  getFrenchVerb,
  isFrenchExerciseAnswerCorrect,
  listFrenchVerbOptions,
} from './frenchConjugations';

describe('frenchConjugations', () => {
  it('expose les cinq verbes ciblés', () => {
    expect(listFrenchVerbOptions()).toHaveLength(5);
    expect(getFrenchVerb('etre')?.forms.nous).toBe('sommes');
    expect(getFrenchVerb('venir')?.forms.ils).toBe('viennent');
  });

  it('construit 6 lignes de tableau pour un verbe', () => {
    const rows = buildFrenchVerbRows('avoir');
    expect(rows).toHaveLength(6);
    expect(rows[2].values).toEqual(['Il a', 'Elle a', 'On a']);
    expect(rows[5].values).toEqual(['Ils ont', 'Elles ont']);
  });

  it('construit 9 flashcards par verbe', () => {
    const cards = buildFrenchVerbCards('aller');
    expect(cards).toHaveLength(9);
    expect(cards[0].prompt).toBe('Je + aller');
    expect(cards[0].answer).toBe('vais');
  });

  it('crée un exercice en évitant le même pronom immédiat si possible', () => {
    const exercise = createFrenchExercise('etre', () => 0, 'je');
    expect(exercise?.pronounKey).toBe('tu');
    expect(exercise?.expectedAnswer).toBe('es');
  });

  it('valide une réponse sans sensibilité à la casse', () => {
    const exercise = createFrenchExercise('prendre', () => 0);
    expect(isFrenchExerciseAnswerCorrect(exercise, exercise.expectedAnswer.toUpperCase())).toBe(true);
    expect(isFrenchExerciseAnswerCorrect(exercise, 'xxx')).toBe(false);
  });
});
