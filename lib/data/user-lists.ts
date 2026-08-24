import { db } from "@/db";
import { lists, listMovies } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";

export async function getUserCreatedLists(userId: string) {
  return db
    .select()
    .from(lists)
    .where(and(eq(lists.ownerId, userId), eq(lists.isSystem, false)))
    .orderBy(asc(lists.title));
}

export async function isListOwner(listId: string, userId: string) {
  const list = await db.query.lists.findFirst({
    where: and(eq(lists.id, listId), eq(lists.ownerId, userId)),
  });
  return !!list;
}

// Re-numbers rank 1..N in current order — called after any add/remove/reorder
// so ranks never end up with gaps or duplicates, regardless of what came before.
export async function renumberListRanks(listId: string) {
  const items = await db
    .select({ movieId: listMovies.movieId })
    .from(listMovies)
    .where(eq(listMovies.listId, listId))
    .orderBy(asc(listMovies.rank));

  for (let i = 0; i < items.length; i++) {
    await db
      .update(listMovies)
      .set({ rank: i + 1 })
      .where(and(eq(listMovies.listId, listId), eq(listMovies.movieId, items[i].movieId)));
  }
}

export async function getListMovieCount(listId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(listMovies)
    .where(eq(listMovies.listId, listId));
  return row?.count ?? 0;
}