"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/db";
import {
  watchlist,
  watched,
  listMovies,
  activities,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { emitActivity } from "@/lib/data/activity-emit";
import { getListWithMovies } from "@/lib/data/lists";
import { checkAndAwardAchievements } from "@/lib/data/achievements-check";

export async function toggleWatchlistAction(
  movieId: string,
  currentlyOn: boolean
) {
  const user = await requireUser();

  if (currentlyOn) {
    await db
      .delete(watchlist)
      .where(
        and(
          eq(watchlist.userId, user.id),
          eq(watchlist.movieId, movieId)
        )
      );
  } else {
    await db
      .insert(watchlist)
      .values({ userId: user.id, movieId })
      .onConflictDoNothing();

    await emitActivity({
      userId: user.id,
      type: "watchlisted",
      movieId,
    });
  }

  revalidatePath(`/movie/${movieId}`);
  revalidatePath("/watchlist");
  revalidatePath("/activity");
}

export async function toggleWatchedAction(
  movieId: string,
  currentlyOn: boolean
) {
  const user = await requireUser();

  if (currentlyOn) {
    await db
      .delete(watched)
      .where(
        and(
          eq(watched.userId, user.id),
          eq(watched.movieId, movieId)
        )
      );
  } else {
    await db
      .insert(watched)
      .values({ userId: user.id, movieId })
      .onConflictDoNothing();

    await emitActivity({
      userId: user.id,
      type: "watched",
      movieId,
    });

    await checkAndEmitListCompletions(user.id, movieId);
    await checkAndAwardAchievements(user.id);
  }

  revalidatePath(`/movie/${movieId}`);
  revalidatePath("/watched");
  revalidatePath("/activity");
}

async function checkAndEmitListCompletions(
  userId: string,
  movieId: string
) {
  const containingLists = await db
    .select({ listId: listMovies.listId })
    .from(listMovies)
    .where(eq(listMovies.movieId, movieId));

  for (const { listId } of containingLists) {
    const list = await getListWithMovies(listId, userId);

    if (!list || list.totalCount === 0) continue;
    if (list.watchedCount !== list.totalCount) continue;

    const alreadyEmitted = await db.query.activities.findFirst({
      where: and(
        eq(activities.userId, userId),
        eq(activities.listId, listId),
        eq(activities.type, "list_completed")
      ),
    });

    if (alreadyEmitted) continue;

    await emitActivity({
      userId,
      type: "list_completed",
      listId,
    });
  }
}