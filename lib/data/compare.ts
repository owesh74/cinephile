import { db } from "@/db";
import { watched, ratings, movies } from "@/db/schema";
import { eq, inArray, and, gte, notInArray, desc } from "drizzle-orm";

export async function getComparisonStats(userId: string, friendId: string) {
  const [myWatchedRows, theirWatchedRows] = await Promise.all([
    db.select({ movieId: watched.movieId }).from(watched).where(eq(watched.userId, userId)),
    db.select({ movieId: watched.movieId }).from(watched).where(eq(watched.userId, friendId)),
  ]);

  const myWatchedIds = new Set(myWatchedRows.map((r) => r.movieId));
  const theirWatchedIds = new Set(theirWatchedRows.map((r) => r.movieId));

  const sharedIds = [...myWatchedIds].filter((id) => theirWatchedIds.has(id));
  const theyHaveYouDontIds = [...theirWatchedIds].filter((id) => !myWatchedIds.has(id));

  // "they watched that you haven't" — capped and hydrated with titles for display
  const theyHaveYouDontMovies = theyHaveYouDontIds.length
    ? await db
        .select({ id: movies.id, title: movies.title, posterUrl: movies.posterUrl })
        .from(movies)
        .where(inArray(movies.id, theyHaveYouDontIds.slice(0, 20)))
    : [];

  return {
    myTotal: myWatchedIds.size,
    theirTotal: theirWatchedIds.size,
    sharedCount: sharedIds.length,
    theyHaveYouDontCount: theyHaveYouDontIds.length,
    theyHaveYouDontMovies,
  };
}

// Movies the friend rated 7+ that the current user hasn't watched at all.
// Deliberately simple — real taste-matching logic is Phase 17's job.
export async function getFriendRecommendations(userId: string, friendId: string, limit = 6) {
  const myWatchedRows = await db
    .select({ movieId: watched.movieId })
    .from(watched)
    .where(eq(watched.userId, userId));
  const myWatchedIds = myWatchedRows.map((r) => r.movieId);

  const friendHighRatings = await db
    .select({
      movieId: ratings.movieId,
      score: ratings.score,
      title: movies.title,
      posterUrl: movies.posterUrl,
    })
    .from(ratings)
    .innerJoin(movies, eq(ratings.movieId, movies.id))
    .where(
      myWatchedIds.length > 0
        ? and(
            eq(ratings.userId, friendId),
            gte(ratings.score, 7),
            notInArray(ratings.movieId, myWatchedIds)
          )
        : and(eq(ratings.userId, friendId), gte(ratings.score, 7))
    )
    .orderBy(desc(ratings.score))
    .limit(limit);

  return friendHighRatings;
}