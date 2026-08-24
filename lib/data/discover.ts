import { db } from "@/db";
import { movies, watched, watchlist, movieGenres, genres } from "@/db/schema";
import { eq, and, desc, sql, notInArray } from "drizzle-orm";

export async function getPopularMovies(limit = 10) {
  // "Popular" proxy: most-watched movies across all users.
  // Revisit once real view/interaction tracking exists.
  return db
    .select({
      id: movies.id,
      title: movies.title,
      posterUrl: movies.posterUrl,
      releaseDate: movies.releaseDate,
      watchedCount: sql<number>`count(${watched.userId})`.as("watched_count"),
    })
    .from(movies)
    .leftJoin(watched, eq(watched.movieId, movies.id))
    .groupBy(movies.id)
    .orderBy(desc(sql`watched_count`))
    .limit(limit);
}

export async function getRecentlyAddedMovies(limit = 10) {
  return db
    .select({
      id: movies.id,
      title: movies.title,
      posterUrl: movies.posterUrl,
      releaseDate: movies.releaseDate,
    })
    .from(movies)
    .orderBy(desc(movies.createdAt))
    .limit(limit);
}

export async function getGenreSections(genreLimit = 6, moviesPerGenre = 6) {
  const genreRows = await db.select().from(genres).limit(genreLimit);

  const sections = await Promise.all(
    genreRows.map(async (genre) => {
      const movieRows = await db
        .select({
          id: movies.id,
          title: movies.title,
          posterUrl: movies.posterUrl,
        })
        .from(movieGenres)
        .innerJoin(movies, eq(movieGenres.movieId, movies.id))
        .where(eq(movieGenres.genreId, genre.id))
        .limit(moviesPerGenre);

      return { genre: genre.name, movies: movieRows };
    })
  );

  // drop genres with nothing in them yet
  return sections.filter((s) => s.movies.length > 0);
}

export async function getContinueWatching(userId: string, limit = 6) {
  // Watchlist items not yet marked watched.
  const watchedSubquery = db
    .select({ movieId: watched.movieId })
    .from(watched)
    .where(eq(watched.userId, userId));

  return db
    .select({
      id: movies.id,
      title: movies.title,
      posterUrl: movies.posterUrl,
    })
    .from(watchlist)
    .innerJoin(movies, eq(watchlist.movieId, movies.id))
    .where(
      and(eq(watchlist.userId, userId), notInArray(watchlist.movieId, watchedSubquery))
    )
    .orderBy(desc(watchlist.addedAt))
    .limit(limit);
}