import type { Country } from "@/domain/types";

/**
 * Levenshtein distance between two strings.
 */
export function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Check if a guess matches a country (exact, alternate names, or fuzzy).
 */
export function matchesCountry(guess: string, country: Country): boolean {
  const g = guess.toLowerCase().trim();
  if (country.name.toLowerCase() === g) return true;
  if (country.officialName?.toLowerCase() === g) return true;
  if (country.alternateNames.some((alt) => alt.toLowerCase() === g))
    return true;

  const target = country.name.toLowerCase();
  if (target.length <= 4) return g === target;
  if (levenshtein(g, target) <= Math.min(2, Math.floor(target.length / 4)))
    return true;

  return false;
}

/**
 * Shuffle an array (Fisher-Yates).
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
