import { db } from "@/db";

import {
    friendships,
    users,
    watched,
} from "@/db/schema";

import {
    and,
    eq,
    or,
    inArray,
    ilike,
    ne,
} from "drizzle-orm";

export type FriendshipStatus =
    | "none"
    | "pending_outgoing"
    | "pending_incoming"
    | "friends";

export async function getFriendshipStatus(
    currentUserId: string,
    otherUserId: string
): Promise<FriendshipStatus> {
    if (currentUserId === otherUserId) return "none";

    const row = await db.query.friendships.findFirst({
        where: or(
            and(
                eq(friendships.userId, currentUserId),
                eq(friendships.friendId, otherUserId)
            ),
            and(
                eq(friendships.userId, otherUserId),
                eq(friendships.friendId, currentUserId)
            )
        ),
    });

    if (!row) return "none";

    if (row.status === "accepted") {
        return "friends";
    }

    return row.userId === currentUserId
        ? "pending_outgoing"
        : "pending_incoming";
}

/* ------------------------------------------------ */
/* SEARCH USERS                                    */
/* ------------------------------------------------ */

export async function searchUsers(
    currentUserId: string,
    query: string
) {
    const trimmed = query.trim();

    if (!trimmed) return [];

    return db
        .select({
            id: users.id,
            username: users.username,
            avatarUrl: users.avatarUrl,
            bio: users.bio,
        })
        .from(users)
        .where(
            and(
                ne(users.id, currentUserId),
                ilike(
                    users.username,
                    `%${trimmed}%`
                )
            )
        )
        .limit(12);
}

/* ------------------------------------------------ */
/* FRIENDS                                         */
/* ------------------------------------------------ */

export async function getFriendsList(userId: string) {
    const rows = await db
        .select()
        .from(friendships)
        .where(
            and(
                eq(friendships.status, "accepted"),
                or(
                    eq(friendships.userId, userId),
                    eq(friendships.friendId, userId)
                )
            )
        );

    const friendIds = rows.map((r) =>
        r.userId === userId
            ? r.friendId
            : r.userId
    );

    if (friendIds.length === 0) return [];

    return db.query.users.findMany({
        where: inArray(users.id, friendIds),
    });
}

/* ------------------------------------------------ */
/* INCOMING                                       */
/* ------------------------------------------------ */

export async function getIncomingRequests(
    userId: string
) {
    const rows = await db
        .select()
        .from(friendships)
        .where(
            and(
                eq(friendships.friendId, userId),
                eq(friendships.status, "pending")
            )
        );

    const requesterIds = rows.map(
        (r) => r.userId
    );

    if (requesterIds.length === 0) return [];

    return db.query.users.findMany({
        where: inArray(users.id, requesterIds),
    });
}

/* ------------------------------------------------ */
/* OUTGOING                                       */
/* ------------------------------------------------ */

export async function getOutgoingRequests(
    userId: string
) {
    const rows = await db
        .select()
        .from(friendships)
        .where(
            and(
                eq(friendships.userId, userId),
                eq(friendships.status, "pending")
            )
        );

    const recipientIds = rows.map(
        (r) => r.friendId
    );

    if (recipientIds.length === 0) return [];

    return db.query.users.findMany({
        where: inArray(users.id, recipientIds),
    });
}

/* ------------------------------------------------ */
/* FRIENDS WHO WATCHED A MOVIE                     */
/* ------------------------------------------------ */

export async function getFriendsWhoWatched(
    userId: string,
    movieId: string
) {
    const friends = await getFriendsList(userId);

    if (friends.length === 0) return [];

    const friendIds = friends.map(
        (f) => f.id
    );

    const watchedRows = await db
        .select({
            userId: watched.userId,
        })
        .from(watched)
        .where(
            and(
                eq(watched.movieId, movieId),
                inArray(
                    watched.userId,
                    friendIds
                )
            )
        );

    const watchedIds = new Set(
        watchedRows.map((w) => w.userId)
    );

    return friends.filter((f) =>
        watchedIds.has(f.id)
    );
}