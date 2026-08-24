import { db } from "@/db";
import { activities } from "@/db/schema";

type ActivityInput = {
  userId: string;
  type: "watched" | "rated" | "watchlisted" | "list_completed";
  movieId?: string;
  listId?: string;
  metadata?: Record<string, unknown>;
};

export async function emitActivity(input: ActivityInput) {
  await db.insert(activities).values({
    userId: input.userId,
    type: input.type,
    movieId: input.movieId ?? null,
    listId: input.listId ?? null,
    metadata: input.metadata ?? null,
  });
}