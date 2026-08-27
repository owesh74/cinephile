import { db } from "@/db";

import {
  movies,
  watched,
  watchlist,
  movieGenres,
  genres,
} from "@/db/schema";

import {
  eq,
  and,
  desc,
  asc,
  gt,
  sql,
  inArray,
  notInArray,
} from "drizzle-orm";

export async function getPopularMovies(limit = 10) {
  // "Popular" proxy: most-watched movies across all users.
  // Revisit once real view/interaction tracking exists.

  return db
    .select({
      id: movies.id,
      title: movies.title,
      posterUrl: movies.posterUrl,
      backdropUrl: movies.backdropUrl,
      releaseDate: movies.releaseDate,
      runtimeMinutes: movies.runtimeMinutes,
      imdbScore: movies.imdbScore,
      description: movies.description,
      watchedCount: sql<number>`
        count(${watched.userId})
      `.as("watched_count"),
    })
    .from(movies)
    .leftJoin(
      watched,
      eq(watched.movieId, movies.id)
    )
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

export async function getGenreSections(
  genreLimit = 6,
  moviesPerGenre = 6
) {
  const genreRows = await db
    .select()
    .from(genres)
    .limit(genreLimit);

  const sections = [];

  for (const genre of genreRows) {
    const movieRows = await db
      .select({
        id: movies.id,
        title: movies.title,
        posterUrl: movies.posterUrl,
      })
      .from(movieGenres)
      .innerJoin(
        movies,
        eq(movieGenres.movieId, movies.id)
      )
      .where(eq(movieGenres.genreId, genre.id))
      .limit(moviesPerGenre);

    sections.push({
      genre: genre.name,
      movies: movieRows,
    });
  }

  return sections.filter(
    (section) => section.movies.length > 0
  );
}

export async function getContinueWatching(
  userId: string,
  limit = 6
) {
  // Watchlist items not yet marked watched.

  const watchedSubquery = db
    .select({
      movieId: watched.movieId,
    })
    .from(watched)
    .where(eq(watched.userId, userId));

  return db
    .select({
      id: movies.id,
      title: movies.title,
      posterUrl: movies.posterUrl,
    })
    .from(watchlist)
    .innerJoin(
      movies,
      eq(watchlist.movieId, movies.id)
    )
    .where(
      and(
        eq(watchlist.userId, userId),
        notInArray(
          watchlist.movieId,
          watchedSubquery
        )
      )
    )
    .orderBy(desc(watchlist.addedAt))
    .limit(limit);
}

// ── New: homepage redesign additions ──────────────────────
// Purely additive — no existing function above was changed
// beyond adding columns to getPopularMovies's SELECT list.

export async function getTopRatedMovies(limit = 5) {
  return db
    .select({
      id: movies.id,
      title: movies.title,
      posterUrl: movies.posterUrl,
      releaseDate: movies.releaseDate,
      runtimeMinutes: movies.runtimeMinutes,
      imdbScore: movies.imdbScore,
    })
    .from(movies)
    .where(sql`${movies.imdbScore} is not null`)
    .orderBy(desc(movies.imdbScore))
    .limit(limit);
}

export async function getUpcomingMovies(limit = 5) {
  return db
    .select({
      id: movies.id,
      title: movies.title,
      posterUrl: movies.posterUrl,
      releaseDate: movies.releaseDate,
    })
    .from(movies)
    .where(gt(movies.releaseDate, sql`now()`))
    .orderBy(asc(movies.releaseDate))
    .limit(limit);
}

export async function getMovieGenreNames(movieId: string) {
  const rows = await db
    .select({ name: genres.name })
    .from(movieGenres)
    .innerJoin(genres, eq(movieGenres.genreId, genres.id))
    .where(eq(movieGenres.movieId, movieId));

  return rows.map((row) => row.name);
}

export async function getUserMovieStatus(
  userId: string,
  movieId: string
) {
  const [watchlistRow] = await db
    .select({ movieId: watchlist.movieId })
    .from(watchlist)
    .where(
      and(
        eq(watchlist.userId, userId),
        eq(watchlist.movieId, movieId)
      )
    )
    .limit(1);

  const [watchedRow] = await db
    .select({ movieId: watched.movieId })
    .from(watched)
    .where(
      and(
        eq(watched.userId, userId),
        eq(watched.movieId, movieId)
      )
    )
    .limit(1);

  return {
    onWatchlist: Boolean(watchlistRow),
    watched: Boolean(watchedRow),
  };
}

export async function getMoviesByIds(ids: string[]) {
  if (ids.length === 0) return [];

  const rows = await db
    .select({
      id: movies.id,
      title: movies.title,
      posterUrl: movies.posterUrl,
      backdropUrl: movies.backdropUrl,
      releaseDate: movies.releaseDate,
      runtimeMinutes: movies.runtimeMinutes,
      imdbScore: movies.imdbScore,
      description: movies.description,
    })
    .from(movies)
    .where(inArray(movies.id, ids));

  // Preserve the order the caller specified (FEATURED_MOVIES order),
  // since inArray does not guarantee row order.
  const byId = new Map(rows.map((row) => [row.id, row]));

  return ids
    .map((id) => byId.get(id))
    .filter((row): row is (typeof rows)[number] => Boolean(row));
}