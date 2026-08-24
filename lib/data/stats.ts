import { db } from "@/db";
import {
  watched,
  ratings,
  movies,
  movieGenres,
  genres,
  movieCountries,
  countries,
  movieCast,
  people,
} from "@/db/schema";
import { eq, inArray, avg, sql } from "drizzle-orm";

type CountRow = { name: string; count: number };

function topOf(rows: CountRow[]): CountRow | null {
  if (rows.length === 0) return null;
  return rows.reduce((best, r) => (r.count > best.count ? r : best), rows[0]);
}

export async function getUserStats(userId: string) {
  const watchedRows = await db
    .select({ movieId: watched.movieId, watchedAt: watched.watchedAt })
    .from(watched)
    .where(eq(watched.userId, userId));

  const watchedIds = watchedRows.map((r) => r.movieId);

  if (watchedIds.length === 0) {
    return {
      moviesWatched: 0,
      countries: [] as CountRow[],
      languages: [] as CountRow[],
      genres: [] as CountRow[],
      decades: [] as CountRow[],
      directors: [] as CountRow[],
      favoriteCountry: null as CountRow | null,
      favoriteGenre: null as CountRow | null,
      favoriteDecade: null as CountRow | null,
      avgRatingGiven: null as string | null,
      moviesPerYear: [] as { year: number; count: number }[],
    };
  }

  const [genreCounts, countryCounts, directorCounts, watchedMovies, ratingAvgRow] =
    await Promise.all([
      db
        .select({ name: genres.name, count: sql<number>`count(*)`.mapWith(Number) })
        .from(movieGenres)
        .innerJoin(genres, eq(movieGenres.genreId, genres.id))
        .where(inArray(movieGenres.movieId, watchedIds))
        .groupBy(genres.name),

      db
        .select({ name: countries.name, count: sql<number>`count(*)`.mapWith(Number) })
        .from(movieCountries)
        .innerJoin(countries, eq(movieCountries.countryId, countries.id))
        .where(inArray(movieCountries.movieId, watchedIds))
        .groupBy(countries.name),

      db
        .select({ name: people.name, count: sql<number>`count(*)`.mapWith(Number) })
        .from(movieCast)
        .innerJoin(people, eq(movieCast.personId, people.id))
        .where(
          sql`${movieCast.movieId} in ${watchedIds} and ${movieCast.role} = 'director'`
        )
        .groupBy(people.name),

      db
        .select({ language: movies.language, releaseDate: movies.releaseDate })
        .from(movies)
        .where(inArray(movies.id, watchedIds)),

      db
        .select({ average: avg(ratings.score) })
        .from(ratings)
        .where(eq(ratings.userId, userId)),
    ]);

  // languages: bucket manually (no join table for this one — it's a flat column on movies)
  const languageMap = new Map<string, number>();
  for (const m of watchedMovies) {
    if (!m.language) continue;
    languageMap.set(m.language, (languageMap.get(m.language) ?? 0) + 1);
  }
  const languageCounts: CountRow[] = [...languageMap.entries()].map(([name, count]) => ({
    name,
    count,
  }));

  // decades: same deal — derived from releaseDate, not a stored column
  const decadeMap = new Map<string, number>();
  for (const m of watchedMovies) {
    if (!m.releaseDate) continue;
    const decade = Math.floor(new Date(m.releaseDate).getFullYear() / 10) * 10;
    const label = `${decade}s`;
    decadeMap.set(label, (decadeMap.get(label) ?? 0) + 1);
  }
  const decadeCounts: CountRow[] = [...decadeMap.entries()].map(([name, count]) => ({
    name,
    count,
  }));

  // movies watched per year, keyed off watchedAt (when the user logged it), not releaseDate
  const perYearMap = new Map<number, number>();
  for (const r of watchedRows) {
    const year = r.watchedAt.getFullYear();
    perYearMap.set(year, (perYearMap.get(year) ?? 0) + 1);
  }
  const moviesPerYear = [...perYearMap.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);

  return {
    moviesWatched: watchedIds.length,
    countries: countryCounts,
    languages: languageCounts,
    genres: genreCounts,
    decades: decadeCounts,
    directors: directorCounts,
    favoriteCountry: topOf(countryCounts),
    favoriteGenre: topOf(genreCounts),
    favoriteDecade: topOf(decadeCounts),
    avgRatingGiven: ratingAvgRow[0]?.average
      ? parseFloat(ratingAvgRow[0].average).toFixed(1)
      : null,
    moviesPerYear,
  };
}