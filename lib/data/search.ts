import { db } from "@/db";
import { movies } from "@/db/schema";
import { ilike, or } from "drizzle-orm";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function words(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function levenshtein(a: string, b: string) {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }

  return matrix[b.length][a.length];
}

function similarity(a: string, b: string) {
  if (!a || !b) return 0;

  const distance = levenshtein(a, b);

  return 1 - distance / Math.max(a.length, b.length);
}

export async function searchMovies(query: string) {
  const trimmed = query.trim();

  if (!trimmed) return [];

  const normalizedQuery = normalize(trimmed);
  const queryWords = words(trimmed);

  /*
   * First get reasonable candidates from PostgreSQL.
   *
   * This means we don't download the entire movie database.
   */
  const patterns = [
    `%${trimmed}%`,
    ...queryWords.map((word) => `%${word}%`),
  ];

  const candidates = await db
    .select({
      id: movies.id,
      title: movies.title,
      posterUrl: movies.posterUrl,
      releaseDate: movies.releaseDate,
    })
    .from(movies)
    .where(
      or(
        ...patterns.map((pattern) => ilike(movies.title, pattern))
      )
    )
    .limit(200);

  const ranked = candidates
    .map((movie) => {
      const title = normalize(movie.title);
      const titleWords = words(movie.title);

      let score = 0;

      // Exact normalized match
      if (title === normalizedQuery) {
        score += 1000;
      }

      // "antman" -> "Ant-Man"
      if (title.includes(normalizedQuery)) {
        score += 700;
      }

      // "spiderman" -> "Spider-Man"
      if (title.startsWith(normalizedQuery)) {
        score += 500;
      }

      // Word matching
      for (const queryWord of queryWords) {
        const bestWordSimilarity = Math.max(
          ...titleWords.map((titleWord) =>
            similarity(normalize(queryWord), normalize(titleWord))
          )
        );

        if (bestWordSimilarity >= 0.9) {
          score += 150;
        } else if (bestWordSimilarity >= 0.75) {
          score += 80;
        }
      }

      // Fuzzy whole-title matching
      const titleSimilarity = similarity(normalizedQuery, title);

      if (titleSimilarity >= 0.85) {
        score += 300;
      } else if (titleSimilarity >= 0.7) {
        score += 100;
      }

      return {
        ...movie,
        score,
      };
    })
    .filter((movie) => movie.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, 20);
}

/**
 * Used when there isn't a strong direct result.
 * Returns the closest movie title that we can confidently suggest.
 */
export async function getSearchSuggestion(query: string) {
  const trimmed = query.trim();

  if (!trimmed) return null;

  const normalizedQuery = normalize(trimmed);
  const queryWords = words(trimmed);

  const candidates = await db
    .select({
      id: movies.id,
      title: movies.title,
      posterUrl: movies.posterUrl,
      releaseDate: movies.releaseDate,
    })
    .from(movies)
    .limit(1000);

  let bestMovie: (typeof candidates)[number] | null = null;
  let bestScore = 0;

  for (const movie of candidates) {
    const normalizedTitle = normalize(movie.title);
    const titleWords = words(movie.title);

    let score = similarity(normalizedQuery, normalizedTitle);

    // Very useful for:
    // "wolf of the" -> "The Wolf of Wall Street"
    const matchingWords = queryWords.filter((queryWord) =>
      titleWords.some(
        (titleWord) =>
          similarity(
            normalize(queryWord),
            normalize(titleWord)
          ) >= 0.75
      )
    ).length;

    if (queryWords.length > 0) {
      score +=
        (matchingWords / queryWords.length) * 0.5;
    }

    // Give a bonus when the query appears as a continuous part
    // of the movie title.
    if (normalizedTitle.includes(normalizedQuery)) {
      score += 0.4;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMovie = movie;
    }
  }

  /*
   * Don't show ridiculous suggestions.
   * The match needs to be reasonably close.
   */
  if (!bestMovie || bestScore < 0.65) {
    return null;
  }

  return bestMovie;
}