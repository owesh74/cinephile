"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/db";
import { ratings } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { emitActivity } from "@/lib/data/activity-emit";
import { checkAndAwardAchievements } from "@/lib/data/achievements-check";

const rateSchema = z.object({
  movieId: z.string().uuid(),
  score: z.number().int().min(1).max(10),
});

export async function rateMovieAction(
  movieId: string,
  score: number
) {
  const user = await requireUser();

  const parsed = rateSchema.safeParse({ movieId, score });

  if (!parsed.success) {
    return { error: "Invalid rating" };
  }

  await db
    .insert(ratings)
    .values({
      userId: user.id,
      movieId,
      score,
    })
    .onConflictDoUpdate({
      target: [ratings.userId, ratings.movieId],
      set: {
        score,
        ratedAt: new Date(),
      },
    });

  await emitActivity({
    userId: user.id,
    type: "rated",
    movieId,
    metadata: { score },
  });

  await checkAndAwardAchievements(user.id);

  revalidatePath(`/movie/${movieId}`);
  revalidatePath("/ratings");
}

export async function removeRatingAction(movieId: string) {
  const user = await requireUser();

  await db
    .delete(ratings)
    .where(
      and(
        eq(ratings.userId, user.id),
        eq(ratings.movieId, movieId)
      )
    );

  revalidatePath(`/movie/${movieId}`);
  revalidatePath("/ratings");
}