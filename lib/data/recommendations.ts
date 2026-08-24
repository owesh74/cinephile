import { db } from "@/db";
import { ratings, watched, movies, movieGenres, movieCast } from "@/db/schema";
import { eq, inArray, and, gte, notInArray, ne, sql } from "drizzle-orm";
import { getFriendsList } from "@/lib/data/friends";

// ── Shared helpers ───────────────────────────────────────

async function getWatchedIds(userId: string) {
  const rows = await db
    .select({ movieId: watched.movieId })
    .from(watched)
    .where(eq(watched.userId, userId));
  return rows.map((r) => r.movieId);
}

// notInArray with an empty array is never true in Postgres — same gotcha
// flagged in Phase 13's compare helper. Branch instead of passing [] straight through.
function excludeWatched<T extends { movieId: any }>(
  query: any,
  watchedIds: string[],
  column: any
) {
  return watchedIds.length > 0 ? and(query, notInArray(column, watchedIds)) : query;
}

// ── "Because you liked X" — content-based, from the user's own high ratings ──

export async function getPersonalizedRecommendations(userId: string, limit = 12) {
  const watchedIds = await getWatchedIds(userId);

  const highRatedMovieIds = (
    await db
      .select({ movieId: ratings.movieId })
      .from(ratings)
      .where(and(eq(ratings.userId, userId), gte(ratings.score, 7)))
  ).map((r) => r.movieId);

  if (highRatedMovieIds.length === 0) {
    return [];
  }

  const [likedGenreRows, likedDirectorRows] = await Promise.all([
    db
      .selectDistinct({ genreId: movieGenres.genreId })
      .from(movieGenres)
      .where(inArray(movieGenres.movieId, highRatedMovieIds)),
    db
      .selectDistinct({ personId: movieCast.personId })
      .from(movieCast)
      .where(
        and(inArray(movieCast.movieId, highRatedMovieIds), eq(movieCast.role, "director"))
      ),
  ]);

  const genreIds = likedGenreRows.map((g) => g.genreId);
  const directorIds = likedDirectorRows.map((d) => d.personId);

  if (genreIds.length === 0 && directorIds.length === 0) {
    return [];
  }

  // score candidate movies by how many liked genres/directors they overlap with
  const genreMatches = genreIds.length
    ? db
        .select({ movieId: movieGenres.movieId, weight: sql<number>`count(*)`.mapWith(Number) })
        .from(movieGenres)
        .where(inArray(movieGenres.genreId, genreIds))
        .groupBy(movieGenres.movieId)
    : Promise.resolve([]);

  const directorMatches = directorIds.length
    ? db
        .select({ movieId: movieCast.movieId, weight: sql<number>`count(*)`.mapWith(Number) })
        .from(movieCast)
        .where(and(inArray(movieCast.personId, directorIds), eq(movieCast.role, "director")))
        .groupBy(movieCast.movieId)
    : Promise.resolve([]);

  const [genreScores, directorScores] = await Promise.all([genreMatches, directorMatches]);

  const scoreMap = new Map<string, number>();
  for (const row of genreScores) {
    scoreMap.set(row.movieId, (scoreMap.get(row.movieId) ?? 0) + row.weight);
  }
  for (const row of directorScores) {
    // director overlap counts double a genre overlap — a shared director is a
    // stronger signal than a shared genre tag
    scoreMap.set(row.movieId, (scoreMap.get(row.movieId) ?? 0) + row.weight * 2);
  }

  const excludeIds = new Set([...watchedIds, ...highRatedMovieIds]);
  const ranked = [...scoreMap.entries()]
    .filter(([movieId]) => !excludeIds.has(movieId))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  if (ranked.length === 0) return [];

  const movieRows = await db
    .select({ id: movies.id, title: movies.title, posterUrl: movies.posterUrl })
    .from(movies)
    .where(
      inArray(
        movies.id,
        ranked.map(([id]) => id)
      )
    );

  const orderIndex = new Map(ranked.map(([id], i) => [id, i]));
  return movieRows.sort(
    (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0)
  );
}

// ── "Your friends recommend" — social, aggregated across all friends ────────

export async function getFriendsRecommendations(userId: string, limit = 12) {
  const [friends, watchedIds] = await Promise.all([
    getFriendsList(userId),
    getWatchedIds(userId),
  ]);

  if (friends.length === 0) return [];

  const friendIds = friends.map((f) => f.id);

  const whereClause = excludeWatched(
    and(inArray(ratings.userId, friendIds), gte(ratings.score, 7)),
    watchedIds,
    ratings.movieId
  );

  const highRatings = await db
    .select({
      movieId: ratings.movieId,
      score: ratings.score,
      title: movies.title,
      posterUrl: movies.posterUrl,
    })
    .from(ratings)
    .innerJoin(movies, eq(ratings.movieId, movies.id))
    .where(whereClause);

  // aggregate: how many friends recommend it, and their average score
  const grouped = new Map<
    string,
    { movieId: string; title: string; posterUrl: string | null; count: number; total: number }
  >();
  for (const row of highRatings) {
    const existing = grouped.get(row.movieId);
    if (existing) {
      existing.count += 1;
      existing.total += row.score;
    } else {
      grouped.set(row.movieId, {
        movieId: row.movieId,
        title: row.title,
        posterUrl: row.posterUrl,
        count: 1,
        total: row.score,
      });
    }
  }

  return [...grouped.values()]
    .map((g) => ({
      id: g.movieId,
      title: g.title,
      posterUrl: g.posterUrl,
      friendCount: g.count,
      avgScore: (g.total / g.count).toFixed(1),
    }))
    .sort((a, b) => b.friendCount - a.friendCount || Number(b.avgScore) - Number(a.avgScore))
    .slice(0, limit);
}

// ── "Similar movies" — for the movie detail page, no user context needed ────

export async function getSimilarMovies(movieId: string, limit = 8) {
  const [genreRows, directorRows] = await Promise.all([
    db
      .select({ genreId: movieGenres.genreId })
      .from(movieGenres)
      .where(eq(movieGenres.movieId, movieId)),
    db
      .select({ personId: movieCast.personId })
      .from(movieCast)
      .where(and(eq(movieCast.movieId, movieId), eq(movieCast.role, "director"))),
  ]);

  const genreIds = genreRows.map((g) => g.genreId);
  const directorIds = directorRows.map((d) => d.personId);

  if (genreIds.length === 0 && directorIds.length === 0) return [];

  const [genreMatches, directorMatches] = await Promise.all([
    genreIds.length
      ? db
          .select({ movieId: movieGenres.movieId, weight: sql<number>`count(*)`.mapWith(Number) })
          .from(movieGenres)
          .where(and(inArray(movieGenres.genreId, genreIds), ne(movieGenres.movieId, movieId)))
          .groupBy(movieGenres.movieId)
      : [],
    directorIds.length
      ? db
          .select({ movieId: movieCast.movieId, weight: sql<number>`count(*)`.mapWith(Number) })
          .from(movieCast)
          .where(
            and(
              inArray(movieCast.personId, directorIds),
              eq(movieCast.role, "director"),
              ne(movieCast.movieId, movieId)
            )
          )
          .groupBy(movieCast.movieId)
      : [],
  ]);

  const scoreMap = new Map<string, number>();
  for (const row of genreMatches) {
    scoreMap.set(row.movieId, (scoreMap.get(row.movieId) ?? 0) + row.weight);
  }
  for (const row of directorMatches) {
    scoreMap.set(row.movieId, (scoreMap.get(row.movieId) ?? 0) + row.weight * 2);
  }

  const ranked = [...scoreMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  if (ranked.length === 0) return [];

  const movieRows = await db
    .select({ id: movies.id, title: movies.title, posterUrl: movies.posterUrl })
    .from(movies)
    .where(
      inArray(
        movies.id,
        ranked.map(([id]) => id)
      )
    );

  const orderIndex = new Map(ranked.map(([id], i) => [id, i]));
  return movieRows.sort(
    (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0)
  );
}