import { buildCatalogQuizData, type CatalogQuizEntry } from "../data/manabuplay/catalog";

export type QuizPoolEntry = CatalogQuizEntry;

export function buildV01QuizPool(): QuizPoolEntry[] {
  return buildCatalogQuizData();
}
