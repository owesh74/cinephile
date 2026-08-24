import { db } from "@/db";
import { ratings } from "@/db/schema";
import { avg, count, eq } from "drizzle-orm";

export async function getMovieRatingStats(movieId: string) {
  const [result] = await db
    .select({
      average: avg(ratings.score),
      count: count(ratings.score),
    })
    .from(ratings)
    .where(eq(ratings.movieId, movieId));

  return {
    cinephileScore: result.average ? parseFloat(result.average).toFixed(1) : null,
    ratingCount: result.count,
  };
}

export async function getUserRatingForMovie(userId: string, movieId: string) {
  const rating = await db.query.ratings.findFirst({
    where: (r, { and, eq }) => and(eq(r.userId, userId), eq(r.movieId, movieId)),
  });
  return rating?.score ?? null;
}