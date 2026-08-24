import { db } from "@/db";
import { friendships, users, watched } from "@/db/schema";
import { and, eq, or, inArray } from "drizzle-orm";

export type FriendshipStatus = "none" | "pending_outgoing" | "pending_incoming" | "friends";

export async function getFriendshipStatus(
  currentUserId: string,
  otherUserId: string
): Promise<FriendshipStatus> {
  if (currentUserId === otherUserId) return "none";

  const row = await db.query.friendships.findFirst({
    where: or(
      and(eq(friendships.userId, currentUserId), eq(friendships.friendId, otherUserId)),
      and(eq(friendships.userId, otherUserId), eq(friendships.friendId, currentUserId))
    ),
  });

  if (!row) return "none";
  if (row.status === "accepted") return "friends";
  // pending — direction determines outgoing vs incoming from currentUserId's POV
  return row.userId === currentUserId ? "pending_outgoing" : "pending_incoming";
}

export async function getFriendsList(userId: string) {
  const rows = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(eq(friendships.userId, userId), eq(friendships.friendId, userId))
      )
    );

  const friendIds = rows.map((r) => (r.userId === userId ? r.friendId : r.userId));
  if (friendIds.length === 0) return [];

  return db.query.users.findMany({
    where: inArray(users.id, friendIds),
  });
}

export async function getIncomingRequests(userId: string) {
  const rows = await db
    .select()
    .from(friendships)
    .where(and(eq(friendships.friendId, userId), eq(friendships.status, "pending")));

  const requesterIds = rows.map((r) => r.userId);
  if (requesterIds.length === 0) return [];

  return db.query.users.findMany({
    where: inArray(users.id, requesterIds),
  });
}

export async function getOutgoingRequests(userId: string) {
  const rows = await db
    .select()
    .from(friendships)
    .where(and(eq(friendships.userId, userId), eq(friendships.status, "pending")));

  const recipientIds = rows.map((r) => r.friendId);
  if (recipientIds.length === 0) return [];

  return db.query.users.findMany({
    where: inArray(users.id, recipientIds),
  });
}

export async function getFriendsWhoWatched(userId: string, movieId: string) {
  const friends = await getFriendsList(userId);
  if (friends.length === 0) return [];

  const friendIds = friends.map((f) => f.id);

  const watchedRows = await db
    .select({ userId: watched.userId })
    .from(watched)
    .where(and(eq(watched.movieId, movieId), inArray(watched.userId, friendIds)));

  const watchedIds = new Set(watchedRows.map((w) => w.userId));
  return friends.filter((f) => watchedIds.has(f.id));
}