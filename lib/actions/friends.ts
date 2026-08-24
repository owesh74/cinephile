"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/db";
import { friendships } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";

export async function sendFriendRequestAction(targetUserId: string) {
  const user = await requireUser();
  if (user.id === targetUserId) {
    return { error: "You can't friend yourself" };
  }

  const existing = await db.query.friendships.findFirst({
    where: or(
      and(eq(friendships.userId, user.id), eq(friendships.friendId, targetUserId)),
      and(eq(friendships.userId, targetUserId), eq(friendships.friendId, user.id))
    ),
  });
  if (existing) {
    return { error: "A request already exists between you two" };
  }

  await db.insert(friendships).values({
    userId: user.id,
    friendId: targetUserId,
    status: "pending",
  });

  revalidatePath("/friends");
  return { success: true };
}

export async function acceptFriendRequestAction(requesterId: string) {
  const user = await requireUser();

  await db
    .update(friendships)
    .set({ status: "accepted" })
    .where(and(eq(friendships.userId, requesterId), eq(friendships.friendId, user.id)));

  revalidatePath("/friends");
  return { success: true };
}

export async function rejectFriendRequestAction(requesterId: string) {
  const user = await requireUser();

  await db
    .delete(friendships)
    .where(and(eq(friendships.userId, requesterId), eq(friendships.friendId, user.id)));

  revalidatePath("/friends");
  return { success: true };
}

export async function removeFriendAction(otherUserId: string) {
  const user = await requireUser();

  await db
    .delete(friendships)
    .where(
      or(
        and(eq(friendships.userId, user.id), eq(friendships.friendId, otherUserId)),
        and(eq(friendships.userId, otherUserId), eq(friendships.friendId, user.id))
      )
    );

  revalidatePath("/friends");
  return { success: true };
}