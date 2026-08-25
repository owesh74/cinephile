import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db";

import {
    people,
    movieCast,
    movies,
    likedPeople,
} from "@/db/schema";

import { eq, and, asc } from "drizzle-orm";

import { requireUser } from "@/lib/auth/require-user";
import { toggleLikedPersonAction } from "@/lib/actions/people";

export default async function PersonPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const person = await db.query.people.findFirst({
        where: eq(people.id, id),
    });

    if (!person) {
        notFound();
    }

    const movieRows = await db
        .select({
            id: movies.id,
            title: movies.title,
            posterUrl: movies.posterUrl,
            releaseDate: movies.releaseDate,
            role: movieCast.role,
            characterName: movieCast.characterName,
            billingOrder: movieCast.billingOrder,
        })
        .from(movieCast)
        .innerJoin(
            movies,
            eq(movieCast.movieId, movies.id)
        )
        .where(eq(movieCast.personId, id))
        .orderBy(asc(movieCast.billingOrder));

    let isLiked = false;
    let loggedIn = false;

    try {
        const user = await requireUser();

        loggedIn = true;

        const liked =
            await db.query.likedPeople.findFirst({
                where: and(
                    eq(likedPeople.userId, user.id),
                    eq(likedPeople.personId, id)
                ),
            });

        isLiked = !!liked;
    } catch {
        loggedIn = false;
        isLiked = false;
    }

    const directors = movieRows.filter(
        (movie) => movie.role === "director"
    );

    const writers = movieRows.filter(
        (movie) => movie.role === "writer"
    );

    const actors = movieRows.filter(
        (movie) => movie.role === "actor"
    );

    /*
     * Server Action wrapper.
     *
     * toggleLikedPersonAction returns an object,
     * while a <form action={...}> expects void /
     * Promise<void>.
     */
    async function handleLikePerson() {
        "use server";

        await toggleLikedPersonAction(id);
    }

    function MovieCard({
        movie,
        showCharacter = false,
    }: {
        movie: (typeof movieRows)[number];
        showCharacter?: boolean;
    }) {
        return (
            <Link
                href={`/movie/${movie.id}`}
                className="group block"
            >
                <div className="aspect-[2/3] overflow-hidden rounded-lg bg-muted">
                    {movie.posterUrl ? (
                        <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center p-3 text-center text-xs text-muted-foreground">
                            No poster
                        </div>
                    )}
                </div>

                <p className="mt-2 line-clamp-2 text-sm font-medium group-hover:underline">
                    {movie.title}
                </p>

                {movie.releaseDate && (
                    <p className="text-xs text-muted-foreground">
                        {new Date(
                            movie.releaseDate
                        ).getFullYear()}
                    </p>
                )}

                {showCharacter &&
                    movie.characterName && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {movie.characterName}
                        </p>
                    )}
            </Link>
        );
    }

    return (
        <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 sm:py-12">

            {/* BACK */}

            <Link
                href="/people/browse"
                className="inline-flex text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
                ← People
            </Link>

            {/* PERSON HEADER */}

            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                    {/* PHOTO */}

                    <div className="h-36 w-36 shrink-0 overflow-hidden rounded-full bg-muted sm:h-40 sm:w-40">
                        {person.photoUrl ? (
                            <img
                                src={person.photoUrl}
                                alt={person.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-5xl font-semibold text-muted-foreground">
                                {person.name
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* INFORMATION */}

                    <div className="flex-1">
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            {person.name}
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            {movieRows.length}{" "}
                            {movieRows.length === 1
                                ? "movie"
                                : "movies"}{" "}
                            in Cinephile
                        </p>

                        {/* ROLES */}

                        <div className="mt-4 flex flex-wrap gap-2">
                            {directors.length > 0 && (
                                <span className="rounded-full border border-border px-3 py-1 text-xs">
                                    Director
                                </span>
                            )}

                            {writers.length > 0 && (
                                <span className="rounded-full border border-border px-3 py-1 text-xs">
                                    Writer
                                </span>
                            )}

                            {actors.length > 0 && (
                                <span className="rounded-full border border-border px-3 py-1 text-xs">
                                    Actor
                                </span>
                            )}
                        </div>

                        {/* LIKE */}

                        {loggedIn ? (
                            <form
                                action={handleLikePerson}
                                className="mt-5"
                            >
                                <button
                                    type="submit"
                                    className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                                        isLiked
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border hover:bg-muted"
                                    }`}
                                >
                                    {isLiked
                                        ? "♥ Liked"
                                        : "♡ Like person"}
                                </button>
                            </form>
                        ) : (
                            <Link
                                href="/login"
                                className="mt-5 inline-block rounded-full border border-border px-5 py-2 text-sm font-medium hover:bg-muted"
                            >
                                Log in to like
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* DIRECTOR */}

            {directors.length > 0 && (
                <section className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">
                            As Director
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            {directors.length}{" "}
                            {directors.length === 1
                                ? "film"
                                : "films"}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
                        {directors.map((movie) => (
                            <MovieCard
                                key={`director-${movie.id}`}
                                movie={movie}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* WRITER */}

            {writers.length > 0 && (
                <section className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">
                            As Writer
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            {writers.length}{" "}
                            {writers.length === 1
                                ? "film"
                                : "films"}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
                        {writers.map((movie) => (
                            <MovieCard
                                key={`writer-${movie.id}`}
                                movie={movie}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* ACTOR */}

            {actors.length > 0 && (
                <section className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">
                            As Actor
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            {actors.length}{" "}
                            {actors.length === 1
                                ? "film"
                                : "films"}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
                        {actors.map((movie) => (
                            <MovieCard
                                key={`actor-${movie.id}`}
                                movie={movie}
                                showCharacter
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* EMPTY STATE */}

            {movieRows.length === 0 && (
                <section className="rounded-xl border border-border p-10 text-center">
                    <p className="font-medium">
                        No movies associated with this person yet.
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Their filmography will appear here when
                        they are added to a movie.
                    </p>
                </section>
            )}
        </div>
    );
}