import { db } from "@/db";
import { watched, movies, movieGenres, movieCountries, movieCast, ratings, activities } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";

const LEVELS = [
  { name: "Newcomer", minScore: 0 },
  { name: "Casual Viewer", minScore: 50 },
  { name: "Film Buff", minScore: 150 },
  { name: "Cinephile", minScore: 350 },
  { name: "Auteur", minScore: 700 },
  { name: "Living Archive", minScore: 1200 },
] as const;

export function getLevelForScore(score: number) {
  let current: (typeof LEVELS)[number] = LEVELS[0];
  for (const level of LEVELS) {
    if (score >= level.minScore) current = level;
  }
  const idx = LEVELS.indexOf(current);
  const next = LEVELS[idx + 1] ?? null;

  return {
    name: current.name,
    next: next ? { name: next.name, pointsAway: next.minScore - score } : null,
  };
}

export async function getUserScore(userId: string) {
  const watchedRows = await db
    .select({ movieId: watched.movieId })
    .from(watched)
    .where(eq(watched.userId, userId));
  const watchedIds = watchedRows.map((r) => r.movieId);

  const [ratingCount] = await db
    .select({ movieId: ratings.movieId })
    .from(ratings)
    .where(eq(ratings.userId, userId))
    .then((rows) => [rows.length]);

  const completedLists = await db
    .selectDistinct({ listId: activities.listId })
    .from(activities)
    .where(and(eq(activities.userId, userId), eq(activities.type, "list_completed")));

  if (watchedIds.length === 0) {
    const breakdown = {
      moviesWatched: 0,
      genresExplored: 0,
      countriesExplored: 0,
      languagesExplored: 0,
      decadesExplored: 0,
      directorsExplored: 0,
      ratingsGiven: ratingCount,
      listsCompleted: completedLists.length,
    };
    const score = breakdown.ratingsGiven * 2 + breakdown.listsCompleted * 20;
    return { score, breakdown, level: getLevelForScore(score) };
  }

  const [watchedMovies, genreRows, countryRows, directorRows] = await Promise.all([
    db
      .select({ language: movies.language, releaseDate: movies.releaseDate })
      .from(movies)
      .where(inArray(movies.id, watchedIds)),
    db
      .selectDistinct({ genreId: movieGenres.genreId })
      .from(movieGenres)
      .where(inArray(movieGenres.movieId, watchedIds)),
    db
      .selectDistinct({ countryId: movieCountries.countryId })
      .from(movieCountries)
      .where(inArray(movieCountries.movieId, watchedIds)),
    db
      .selectDistinct({ personId: movieCast.personId })
      .from(movieCast)
      .where(and(inArray(movieCast.movieId, watchedIds), eq(movieCast.role, "director"))),
  ]);

  const languages = new Set(watchedMovies.map((m) => m.language).filter(Boolean));
  const decades = new Set(
    watchedMovies
      .map((m) => m.releaseDate)
      .filter(Boolean)
      .map((d) => Math.floor(new Date(d as string).getFullYear() / 10) * 10)
  );

  const breakdown = {
    moviesWatched: watchedIds.length,
    genresExplored: genreRows.length,
    countriesExplored: countryRows.length,
    languagesExplored: languages.size,
    decadesExplored: decades.size,
    directorsExplored: directorRows.length,
    ratingsGiven: ratingCount,
    listsCompleted: completedLists.length,
  };

  const score =
    breakdown.moviesWatched * 1 +
    breakdown.genresExplored * 5 +
    breakdown.countriesExplored * 5 +
    breakdown.languagesExplored * 5 +
    breakdown.decadesExplored * 5 +
    breakdown.directorsExplored * 3 +
    breakdown.ratingsGiven * 2 +
    breakdown.listsCompleted * 20;

  return { score, breakdown, level: getLevelForScore(score) };
}