import { requireUser } from "@/lib/auth/require-user";

import {
    getFriendsList,
    getIncomingRequests,
    getOutgoingRequests,
} from "@/lib/data/friends";

import { FriendActionButton } from "@/components/friend-action-button";
import { FriendUserSearch } from "@/components/friend-user-search";

import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";

import Link from "next/link";

export default async function FriendsPage() {
    const user = await requireUser();

    const [
        friends,
        incoming,
        outgoing,
    ] = await Promise.all([
        getFriendsList(user.id),
        getIncomingRequests(user.id),
        getOutgoingRequests(user.id),
    ]);

    return (
        <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 lg:py-14">

            {/* HEADER */}

            <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Friends
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    Find other movie lovers, connect with friends,
                    and compare your cinema tastes.
                </p>
            </div>

            {/* SEARCH */}

            <FriendUserSearch />

            {/* REQUESTS */}

            {(incoming.length > 0 ||
                outgoing.length > 0) && (
                <div className="grid gap-6 md:grid-cols-2">

                    {/* INCOMING */}

                    <section className="rounded-2xl border border-border bg-card p-5">
                        <div className="mb-5">
                            <h2 className="font-semibold">
                                Incoming requests
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                People who want to connect with you.
                            </p>
                        </div>

                        {incoming.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No incoming requests.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {incoming.map((person) => (
                                    <div
                                        key={person.id}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                                    >
                                        <UserRow
                                            username={person.username}
                                            avatarUrl={person.avatarUrl}
                                        />

                                        <FriendActionButton
                                            targetUserId={person.id}
                                            initialStatus="pending_incoming"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* OUTGOING */}

                    <section className="rounded-2xl border border-border bg-card p-5">
                        <div className="mb-5">
                            <h2 className="font-semibold">
                                Sent requests
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Requests waiting for a response.
                            </p>
                        </div>

                        {outgoing.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No pending requests.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {outgoing.map((person) => (
                                    <div
                                        key={person.id}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                                    >
                                        <UserRow
                                            username={person.username}
                                            avatarUrl={person.avatarUrl}
                                        />

                                        <FriendActionButton
                                            targetUserId={person.id}
                                            initialStatus="pending_outgoing"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* FRIENDS */}

            <section>
                <div className="mb-5">
                    <h2 className="text-xl font-semibold">
                        Your friends
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {friends.length === 0
                            ? "Your Cinephile network starts here."
                            : `${friends.length} ${
                                  friends.length === 1
                                      ? "friend"
                                      : "friends"
                              }`}
                    </p>
                </div>

                {friends.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                        <p className="font-medium">
                            No friends yet
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Search for another Cinephile above
                            to send your first friend request.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {friends.map((person) => (
                            <div
                                key={person.id}
                                className="rounded-2xl border border-border bg-card p-5"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <UserRow
                                        username={person.username}
                                        avatarUrl={person.avatarUrl}
                                    />

                                    <Link
                                        href={`/user/${person.username}`}
                                        className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                                    >
                                        View
                                    </Link>
                                </div>

                                <div className="mt-5 border-t border-border pt-4">
                                    <FriendActionButton
                                        targetUserId={person.id}
                                        initialStatus="friends"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function UserRow({
    username,
    avatarUrl,
}: {
    username: string;
    avatarUrl: string | null;
}) {
    return (
        <Link
            href={`/user/${username}`}
            className="flex min-w-0 items-center gap-3"
        >
            <Avatar className="h-11 w-11 shrink-0">
                <AvatarImage
                    src={avatarUrl ?? undefined}
                    alt={username}
                />

                <AvatarFallback>
                    {username.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <span className="truncate text-sm font-medium">
                {username}
            </span>
        </Link>
    );
}