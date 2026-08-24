import { db } from "@/db";
import { activities, movies, lists, users } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { getFriendsList } from "@/lib/data/friends";

export async function getFriendActivityFeed(userId: string, limit = 30) {
  const friends = await getFriendsList(userId);
  if (friends.length === 0) return [];

  const friendIds = friends.map((f) => f.id);

  return db
    .select({
      id: activities.id,
      username: users.username,
      avatarUrl: users.avatarUrl,
      type: activities.type,
      movieId: activities.movieId,
      movieTitle: movies.title,
      listId: activities.listId,
      listTitle: lists.title,
      metadata: activities.metadata,
      createdAt: activities.createdAt,
    })
    .from(activities)
    .innerJoin(users, eq(activities.userId, users.id))
    .leftJoin(movies, eq(activities.movieId, movies.id))
    .leftJoin(lists, eq(activities.listId, lists.id))
    .where(inArray(activities.userId, friendIds))
    .orderBy(desc(activities.createdAt))
    .limit(limit);
}