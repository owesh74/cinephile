import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
    users,
    watched,
    ratings,
    watchlist,
    movies,
    lists,
    likedPeople,
    people,
} from "@/db/schema";

import { createClient } from "@/lib/supabase/server";
import { getFriendshipStatus } from "@/lib/data/friends";

import { FriendActionButton } from "@/components/friend-action-button";
import { FriendComparison } from "@/components/friend-comparison";
import { ScoreBadge } from "@/components/score-badge";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

export default async function PublicProfilePage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;

    const profile = await db.query.users.findFirst({
        where: eq(users.username, username),
    });

    if (!profile) {
        notFound();
    }

    const supabase = await createClient();

    const {
        data: { user: currentUser },
    } = await supabase.auth.getUser();

    const isOwnProfile = currentUser?.id === profile.id;

    const friendshipStatus =
        currentUser && !isOwnProfile
            ? await getFriendshipStatus(
                  currentUser.id,
                  profile.id
              )
            : null;

    /* ----------------------------- */
    /* STATS                          */
    /* ----------------------------- */

    const watchedRows = await db
        .select({
            movieId: watched.movieId,
        })
        .from(watched)
        .where(eq(watched.userId, profile.id));

    const ratingRows = await db
        .select({
            movieId: ratings.movieId,
            score: ratings.score,
        })
        .from(ratings)
        .where(eq(ratings.userId, profile.id));

    const watchlistRows = await db
        .select({
            movieId: watchlist.movieId,
        })
        .from(watchlist)
        .where(eq(watchlist.userId, profile.id));

    const listRows = await db
        .select({
            id: lists.id,
            title: lists.title,
            description: lists.description,
            size: lists.size,
        })
        .from(lists)
        .where(eq(lists.ownerId, profile.id))
        .orderBy(desc(lists.createdAt))
        .limit(6);

    /* ----------------------------- */
    /* RECENTLY WATCHED               */
    /* ----------------------------- */

    const recentWatched = await db
        .select({
            movieId: movies.id,
            title: movies.title,
            posterUrl: movies.posterUrl,
            releaseDate: movies.releaseDate,
            watchedAt: watched.watchedAt,
        })
        .from(watched)
        .innerJoin(
            movies,
            eq(watched.movieId, movies.id)
        )
        .where(eq(watched.userId, profile.id))
        .orderBy(desc(watched.watchedAt))
        .limit(6);

    /* ----------------------------- */
    /* HIGHLY RATED                   */
    /* ----------------------------- */

    const highlyRated = await db
        .select({
            movieId: movies.id,
            title: movies.title,
            posterUrl: movies.posterUrl,
            releaseDate: movies.releaseDate,
            score: ratings.score,
        })
        .from(ratings)
        .innerJoin(
            movies,
            eq(ratings.movieId, movies.id)
        )
        .where(eq(ratings.userId, profile.id))
        .orderBy(
            desc(ratings.score),
            desc(ratings.ratedAt)
        )
        .limit(6);

    /* ----------------------------- */
    /* LIKED PEOPLE                   */
    /* ----------------------------- */

    const likedPeopleRows = await db
        .select({
            id: people.id,
            name: people.name,
            photoUrl: people.photoUrl,
        })
        .from(likedPeople)
        .innerJoin(
            people,
            eq(likedPeople.personId, people.id)
        )
        .where(eq(likedPeople.userId, profile.id))
        .orderBy(people.name)
        .limit(8);

    return (
        <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:py-14">

            {/* ============================= */}
            {/* PROFILE HEADER                */}
            {/* ============================= */}

            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-5">
                        <Avatar className="h-24 w-24 border border-border sm:h-28 sm:w-28">
                            <AvatarImage
                                src={profile.avatarUrl ?? undefined}
                                alt={profile.username}
                            />

                            <AvatarFallback className="text-3xl">
                                {profile.username
                                    .charAt(0)
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                            <h1 className="text-3xl font-semibold tracking-tight">
                                {profile.username}
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Joined{" "}
                                {profile.createdAt.toLocaleDateString(
                                    undefined,
                                    {
                                        month: "long",
                                        year: "numeric",
                                    }
                                )}
                            </p>

                            {profile.bio && (
                                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                                    {profile.bio}
                                </p>
                            )}
                        </div>
                    </div>

                    {friendshipStatus && (
                        <div className="shrink-0">
                            <FriendActionButton
                                targetUserId={profile.id}
                                initialStatus={friendshipStatus}
                            />
                        </div>
                    )}
                </div>

                <div className="mt-7 border-t border-border pt-6">
                    <ScoreBadge userId={profile.id} />
                </div>
            </section>

            {/* ============================= */}
            {/* CINEMA STATS                  */}
            {/* ============================= */}

            <section>
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">
                        {profile.username}'s cinema
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        A quick look at their movie activity.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatCard
                        value={watchedRows.length}
                        label="Watched"
                    />

                    <StatCard
                        value={ratingRows.length}
                        label="Ratings"
                    />

                    <StatCard
                        value={watchlistRows.length}
                        label="Watchlist"
                    />

                    <StatCard
                        value={listRows.length}
                        label="Lists"
                    />
                </div>
            </section>

            {/* ============================= */}
            {/* FRIEND COMPARISON             */}
            {/* ============================= */}

            {friendshipStatus === "friends" && currentUser && (
                <section>
                    <FriendComparison
                        userId={currentUser.id}
                        friendId={profile.id}
                        friendUsername={profile.username}
                    />
                </section>
            )}

            {/* ============================= */}
            {/* RECENTLY WATCHED              */}
            {/* ============================= */}

            <MovieSection
                title="Recently watched"
                subtitle={`Movies ${profile.username} has recently logged.`}
                movies={recentWatched.map((movie) => ({
                    id: movie.movieId,
                    title: movie.title,
                    posterUrl: movie.posterUrl,
                    releaseDate: movie.releaseDate,
                }))}
                emptyText="They haven't watched any movies yet."
            />

            {/* ============================= */}
            {/* HIGHLY RATED                  */}
            {/* ============================= */}

            <section>
                <div className="mb-5">
                    <h2 className="text-xl font-semibold">
                        Highly rated
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Movies {profile.username} rated highest.
                    </p>
                </div>

                {highlyRated.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                        No ratings yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {highlyRated.map((movie) => (
                            <Link
                                key={movie.movieId}
                                href={`/movie/${movie.movieId}`}
                                className="group"
                            >
                                <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border bg-muted">
                                    {movie.posterUrl ? (
                                        <img
                                            src={movie.posterUrl}
                                            alt={movie.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center p-3 text-center text-xs text-muted-foreground">
                                            No poster
                                        </div>
                                    )}

                                    <div className="absolute right-2 top-2 rounded-md bg-black/80 px-2 py-1 text-xs font-semibold text-white">
                                        {movie.score}/10
                                    </div>
                                </div>

                                <p className="mt-2 line-clamp-2 text-sm font-medium">
                                    {movie.title}
                                </p>

                                {movie.releaseDate && (
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(
                                            movie.releaseDate
                                        ).getFullYear()}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* ============================= */}
            {/* LISTS                         */}
            {/* ============================= */}

            <section>
                <div className="mb-5">
                    <h2 className="text-xl font-semibold">
                        Lists
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Collections created by{" "}
                        {profile.username}.
                    </p>
                </div>

                {listRows.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                        No public lists yet.
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {listRows.map((list) => (
                            <Link
                                key={list.id}
                                href={`/lists/${list.id}`}
                                className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
                            >
                                <h3 className="font-medium">
                                    {list.title}
                                </h3>

                                {list.description && (
                                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                        {list.description}
                                    </p>
                                )}

                                <p className="mt-4 text-xs text-muted-foreground">
                                    {list.size} movies
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* ============================= */}
            {/* LIKED PEOPLE                  */}
            {/* ============================= */}

            <section>
                <div className="mb-5">
                    <h2 className="text-xl font-semibold">
                        Liked people
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Actors, directors and filmmakers{" "}
                        {profile.username} likes.
                    </p>
                </div>

                {likedPeopleRows.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                        {profile.username} hasn't liked any people yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                        {likedPeopleRows.map((person) => (
                            <Link
                                key={person.id}
                                href={`/people/${person.id}`}
                                className="group text-center"
                            >
                                <div className="mx-auto aspect-square w-full max-w-28 overflow-hidden rounded-full border border-border bg-muted">
                                    {person.photoUrl ? (
                                        <img
                                            src={person.photoUrl}
                                            alt={person.name}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                                            {person.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <p className="mt-2 line-clamp-2 text-sm font-medium group-hover:underline">
                                    {person.name}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

/* ========================================== */
/* STAT CARD                                  */
/* ========================================== */

function StatCard({
    value,
    label,
}: {
    value: number;
    label: string;
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-2xl font-semibold">
                {value}
            </div>

            <div className="mt-1 text-sm text-muted-foreground">
                {label}
            </div>
        </div>
    );
}

/* ========================================== */
/* MOVIE SECTION                              */
/* ========================================== */

function MovieSection({
    title,
    subtitle,
    movies,
    emptyText,
}: {
    title: string;
    subtitle: string;
    movies: {
        id: string;
        title: string;
        posterUrl: string | null;
        releaseDate: string | null;
    }[];
    emptyText: string;
}) {
    return (
        <section>
            <div className="mb-5">
                <h2 className="text-xl font-semibold">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    {subtitle}
                </p>
            </div>

            {movies.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
                    {emptyText}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {movies.map((movie) => (
                        <Link
                            key={movie.id}
                            href={`/movie/${movie.id}`}
                            className="group"
                        >
                            <div className="aspect-[2/3] overflow-hidden rounded-lg border border-border bg-muted">
                                {movie.posterUrl ? (
                                    <img
                                        src={movie.posterUrl}
                                        alt={movie.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center p-3 text-center text-xs text-muted-foreground">
                                        No poster
                                    </div>
                                )}
                            </div>

                            <p className="mt-2 line-clamp-2 text-sm font-medium">
                                {movie.title}
                            </p>

                            {movie.releaseDate && (
                                <p className="text-xs text-muted-foreground">
                                    {new Date(
                                        movie.releaseDate
                                    ).getFullYear()}
                                </p>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}