import { db } from "@/db";
import { lists, listMovies, movies, watched } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function getAllLists() {
  return db.select().from(lists).orderBy(asc(lists.title));
}

export async function getListWithMovies(listId: string, userId?: string) {
  const list = await db.query.lists.findFirst({
    where: eq(lists.id, listId),
  });
  if (!list) return null;

  const items = await db
    .select({
      movieId: movies.id,
      title: movies.title,
      posterUrl: movies.posterUrl,
      releaseDate: movies.releaseDate,
      rank: listMovies.rank,
    })
    .from(listMovies)
    .innerJoin(movies, eq(listMovies.movieId, movies.id))
    .where(eq(listMovies.listId, listId))
    .orderBy(asc(listMovies.rank));

  let watchedMovieIds = new Set<string>();
  if (userId) {
    const userWatched = await db
      .select({ movieId: watched.movieId })
      .from(watched)
      .where(eq(watched.userId, userId));
    watchedMovieIds = new Set(userWatched.map((w) => w.movieId));
  }

  const itemsWithProgress = items.map((item) => ({
    ...item,
    isWatched: watchedMovieIds.has(item.movieId),
  }));

  const watchedCount = itemsWithProgress.filter((i) => i.isWatched).length;

  return {
    ...list,
    items: itemsWithProgress,
    watchedCount,
    totalCount: items.length,
  };
}