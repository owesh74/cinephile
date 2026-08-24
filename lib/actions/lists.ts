"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/db";
import { lists, listMovies } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { createListSchema } from "@/lib/validations/list";
import { isListOwner, renumberListRanks, getListMovieCount } from "@/lib/data/user-lists";
import { searchMovies } from "@/lib/data/search";

export async function searchMoviesForListAction(query: string) {
  return searchMovies(query);
}

export async function createListAction(formData: FormData) {
  const user = await requireUser();

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    size: formData.get("size") as string,
  };

  const parsed = createListSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const [list] = await db
    .insert(lists)
    .values({
      title: parsed.data.title,
      description: parsed.data.description || null,
      size: parsed.data.size,
      isSystem: false,
      ownerId: user.id,
    })
    .returning();

  redirect(`/lists/${list.id}`);
}

export async function updateListDetailsAction(listId: string, formData: FormData) {
  const user = await requireUser();
  if (!(await isListOwner(listId, user.id))) {
    return { error: "You don't own this list" };
  }

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    size: formData.get("size") as string,
  };

  const parsed = createListSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db
    .update(lists)
    .set({
      title: parsed.data.title,
      description: parsed.data.description || null,
      size: parsed.data.size,
    })
    .where(eq(lists.id, listId));

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}

export async function deleteListAction(listId: string) {
  const user = await requireUser();
  if (!(await isListOwner(listId, user.id))) {
    return { error: "You don't own this list" };
  }

  await db.delete(lists).where(eq(lists.id, listId));

  revalidatePath("/lists");
  redirect("/lists");
}

export async function addMovieToListAction(listId: string, movieId: string) {
  const user = await requireUser();
  if (!(await isListOwner(listId, user.id))) {
    return { error: "You don't own this list" };
  }

  const list = await db.query.lists.findFirst({ where: eq(lists.id, listId) });
  if (!list) return { error: "List not found" };

  const currentCount = await getListMovieCount(listId);
  if (currentCount >= list.size) {
    return { error: `This list is capped at ${list.size} movies` };
  }

  const existing = await db.query.listMovies.findFirst({
    where: and(eq(listMovies.listId, listId), eq(listMovies.movieId, movieId)),
  });
  if (existing) {
    return { error: "Already on this list" };
  }

  await db.insert(listMovies).values({
    listId,
    movieId,
    rank: currentCount + 1,
  });

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}

export async function removeMovieFromListAction(listId: string, movieId: string) {
  const user = await requireUser();
  if (!(await isListOwner(listId, user.id))) {
    return { error: "You don't own this list" };
  }

  await db
    .delete(listMovies)
    .where(and(eq(listMovies.listId, listId), eq(listMovies.movieId, movieId)));

  await renumberListRanks(listId);

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}

export async function reorderListMovieAction(
  listId: string,
  movieId: string,
  direction: "up" | "down"
) {
  const user = await requireUser();
  if (!(await isListOwner(listId, user.id))) {
    return { error: "You don't own this list" };
  }

  const items = await db
    .select()
    .from(listMovies)
    .where(eq(listMovies.listId, listId))
    .orderBy(listMovies.rank);

  const index = items.findIndex((i) => i.movieId === movieId);
  if (index === -1) return { error: "Movie not on this list" };

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) {
    return { success: true }; // already at the edge — no-op, not an error
  }

  const current = items[index];
  const swapWith = items[swapIndex];

  // swap ranks — bump one to a temp value first to dodge the (listId, movieId)
  // primary key / potential rank-uniqueness collision mid-update
  await db
    .update(listMovies)
    .set({ rank: -1 })
    .where(and(eq(listMovies.listId, listId), eq(listMovies.movieId, current.movieId)));
  await db
    .update(listMovies)
    .set({ rank: current.rank })
    .where(and(eq(listMovies.listId, listId), eq(listMovies.movieId, swapWith.movieId)));
  await db
    .update(listMovies)
    .set({ rank: swapWith.rank })
    .where(and(eq(listMovies.listId, listId), eq(listMovies.movieId, current.movieId)));

  revalidatePath(`/lists/${listId}`);
  return { success: true };
}