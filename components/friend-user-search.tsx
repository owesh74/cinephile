"use client";

import { useEffect, useState, useTransition } from "react";

import Link from "next/link";

import {
    searchUsersAction,
} from "@/lib/actions/friends";

import { FriendActionButton } from "@/components/friend-action-button";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import type { FriendshipStatus } from "@/lib/data/friends";

type SearchUser = {
    id: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    friendshipStatus: FriendshipStatus;
};
export function FriendUserSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] =
        useState<SearchUser[]>([]);
    const [pending, startTransition] =
        useTransition();

    useEffect(() => {
        const value = query.trim();

        if (!value) {
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            startTransition(async () => {
                const result =
                    await searchUsersAction(value);

                setResults(result);
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="mb-5">
                <h2 className="text-lg font-semibold">
                    Find people
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Search Cinephile users and add them as friends.
                </p>
            </div>

            <div className="relative">
                <input
                    value={query}
                    onChange={(event) =>
                        setQuery(event.target.value)
                    }
                    placeholder="Search by username..."
                    className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />

                {pending && (
                    <span className="absolute right-4 top-3 text-xs text-muted-foreground">
                        Searching...
                    </span>
                )}
            </div>

            {query.trim() && !pending && (
                <div className="mt-3 overflow-hidden rounded-xl border border-border">
                    {results.length === 0 ? (
                        <div className="p-5 text-center text-sm text-muted-foreground">
                            No Cinephile users found.
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {results.map((person) => (
                                <div
                                    key={person.id}
                                    className="flex items-center justify-between gap-4 p-4"
                                >
                                    <Link
                                        href={`/user/${person.username}`}
                                        className="flex min-w-0 items-center gap-3"
                                    >
                                        <Avatar className="h-11 w-11 shrink-0">
                                            <AvatarImage
                                                src={
                                                    person.avatarUrl ??
                                                    undefined
                                                }
                                                alt={person.username}
                                            />

                                            <AvatarFallback>
                                                {person.username
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {person.username}
                                            </p>

                                            {person.bio && (
                                                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                                    {person.bio}
                                                </p>
                                            )}
                                        </div>
                                    </Link>

                                    <FriendActionButton
                                        targetUserId={person.id}
                                        initialStatus={person.friendshipStatus}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}