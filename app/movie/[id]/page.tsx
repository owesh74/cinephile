export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getMovieById } from "@/lib/data/movies";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { watchlist, watched } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { TrackingButtons } from "@/components/tracking-buttons";
import {
    getMovieRatingStats,
    getUserRatingForMovie,
} from "@/lib/data/ratings";
import { RatingWidget } from "@/components/rating-widget";
import { getFriendsWhoWatched } from "@/lib/data/friends";
import { getSimilarMovies } from "@/lib/data/recommendations";
import { MoviePosterGrid } from "@/components/movie-poster-grid";
import Link from "next/link";

export default async function MoviePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const movie = await getMovieById(id);

    if (!movie) {
        notFound();
    }

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    let onWatchlist = false;
    let isWatched = false;

    if (user) {
        const [wl, w] = await Promise.all([
            db.query.watchlist.findFirst({
                where: and(
                    eq(watchlist.userId, user.id),
                    eq(watchlist.movieId, id)
                ),
            }),

            db.query.watched.findFirst({
                where: and(
                    eq(watched.userId, user.id),
                    eq(watched.movieId, id)
                ),
            }),
        ]);

        onWatchlist = !!wl;
        isWatched = !!w;
    }

    const friendsWhoWatched = user
        ? await getFriendsWhoWatched(user.id, id)
        : [];

    const similarMovies = await getSimilarMovies(id);

    const { cinephileScore, ratingCount } =
        await getMovieRatingStats(id);

    const userRating = user
        ? await getUserRatingForMovie(user.id, id)
        : null;

    const year = movie.releaseDate
        ? new Date(movie.releaseDate).getFullYear()
        : null;

    return (
        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="space-y-10">
                {/* =====================================================
                    MOVIE HERO
                ====================================================== */}
                <section className="relative">
                    {/* Backdrop */}
                    {movie.backdropUrl && (
                        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 overflow-hidden rounded-b-3xl sm:h-80">
                            <img
                                src={movie.backdropUrl}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
                        </div>
                    )}

                    <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-8">
                        {/* =================================================
                            POSTER
                        ================================================== */}
                        <div className="relative mx-auto aspect-[2/3] w-full max-w-[240px] shrink-0 overflow-hidden rounded-xl bg-muted shadow-lg sm:mx-0 sm:max-w-[280px]">
                            {movie.posterUrl ? (
                                <img
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                    No poster
                                </div>
                            )}
                        </div>

                        {/* =================================================
                            MOVIE INFORMATION
                        ================================================== */}
                        <div className="min-w-0 flex-1 space-y-4">
                            <div>
                                <h1 className="break-words font-display text-3xl font-semibold italic leading-tight sm:text-4xl">
                                    {movie.title}
                                </h1>

                                {movie.originalTitle &&
                                    movie.originalTitle !== movie.title && (
                                        <p className="mt-1 break-words text-sm text-muted-foreground">
                                            {movie.originalTitle}
                                        </p>
                                    )}
                            </div>

                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
                                {year && <span>{year}</span>}

                                {movie.runtimeMinutes && (
                                    <>
                                        <span className="text-border">
                                            •
                                        </span>

                                        <span>
                                            {Math.floor(
                                                movie.runtimeMinutes / 60
                                            )}
                                            :
                                            {String(
                                                movie.runtimeMinutes % 60
                                            ).padStart(2, "0")}{" "}
                                            runtime
                                        </span>
                                    </>
                                )}

                                {movie.language && (
                                    <>
                                        <span className="text-border">
                                            •
                                        </span>

                                        <span>{movie.language}</span>
                                    </>
                                )}

                                {movie.countries.length > 0 && (
                                    <>
                                        <span className="text-border">
                                            •
                                        </span>

                                        <span className="break-words">
                                            {movie.countries.join(", ")}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Genres */}
                            {movie.genres.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {movie.genres.map((genre) => (
                                        <span
                                            key={genre}
                                            className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium"
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Tracking */}
                            {user && (
                                <div className="pt-1">
                                    <TrackingButtons
                                        movieId={movie.id}
                                        initialOnWatchlist={onWatchlist}
                                        initialWatched={isWatched}
                                    />
                                </div>
                            )}

                            {/* Rating */}
                            {user && (
                                <div className="rounded-lg border border-border/60 bg-background/50 p-3 sm:p-4">
                                    <p className="mb-2 text-sm font-medium">
                                        Your rating
                                    </p>

                                    <RatingWidget
                                        movieId={movie.id}
                                        initialScore={userRating}
                                    />
                                </div>
                            )}

                            {/* Scores */}
                            <div className="flex flex-wrap gap-x-8 gap-y-4 border-y border-border/60 py-4">
                                <div>
                                    <p className="text-2xl font-semibold text-foreground">
                                        {movie.imdbScore ?? "—"}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        IMDb Score
                                    </p>
                                </div>

                                <div>
                                    <p className="font-mono text-2xl font-semibold text-secondary">
                                        {cinephileScore ?? "—"}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        Cinephile Score{" "}
                                        {ratingCount > 0 &&
                                            `(${ratingCount} rating${
                                                ratingCount === 1
                                                    ? ""
                                                    : "s"
                                            })`}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            {movie.description && (
                                <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                                    {movie.description}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    DIRECTOR / WRITERS
                ====================================================== */}
                {(movie.directors.length > 0 ||
                    movie.writers.length > 0) && (
                    <section className="space-y-8">
                        {/* Director */}
                        {movie.directors.length > 0 && (
                            <div>
                                <h2 className="mb-4 text-lg font-semibold">
                                    Director
                                </h2>

                                <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:flex sm:flex-wrap sm:gap-5">
                                    {movie.directors.map((person) => (
                                        <Link
                                            key={person.personId}
                                            href={`/people/${person.personId}`}
                                            className="min-w-0 text-center text-xs transition-opacity hover:opacity-80 sm:w-24"
                                        >
                                            <div className="mx-auto mb-2 aspect-square w-full max-w-[72px] overflow-hidden rounded-full bg-muted sm:h-24 sm:w-24 sm:max-w-none">
                                                {person.photoUrl ? (
                                                    <img
                                                        src={person.photoUrl}
                                                        alt={person.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted-foreground sm:text-2xl">
                                                        {person.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                )}
                                            </div>

                                            <p className="break-words font-medium">
                                                {person.name}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Writers */}
                        {movie.writers.length > 0 && (
                            <div>
                                <h2 className="mb-4 text-lg font-semibold">
                                    Writers
                                </h2>

                                <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:flex sm:flex-wrap sm:gap-5">
                                    {movie.writers.map((person) => (
                                        <Link
                                            key={person.personId}
                                            href={`/people/${person.personId}`}
                                            className="min-w-0 text-center text-xs transition-opacity hover:opacity-80 sm:w-24"
                                        >
                                            <div className="mx-auto mb-2 aspect-square w-full max-w-[72px] overflow-hidden rounded-full bg-muted sm:h-24 sm:w-24 sm:max-w-none">
                                                {person.photoUrl ? (
                                                    <img
                                                        src={person.photoUrl}
                                                        alt={person.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted-foreground sm:text-2xl">
                                                        {person.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                )}
                                            </div>

                                            <p className="break-words font-medium">
                                                {person.name}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* =====================================================
                    CAST
                ====================================================== */}
                {movie.cast.length > 0 && (
                    <section>
                        <h2 className="mb-4 text-lg font-semibold">
                            Cast
                        </h2>

                        <div className="grid grid-cols-3 gap-x-3 gap-y-7 sm:flex sm:flex-wrap sm:gap-5">
                            {movie.cast.map((person) => (
                                <Link
                                    key={person.personId}
                                    href={`/people/${person.personId}`}
                                    className="min-w-0 text-center text-xs transition-opacity hover:opacity-80 sm:w-24"
                                >
                                    <div className="mx-auto mb-2 aspect-square w-full max-w-[72px] overflow-hidden rounded-full bg-muted sm:h-24 sm:w-24 sm:max-w-none">
                                        {person.photoUrl ? (
                                            <img
                                                src={person.photoUrl}
                                                alt={person.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted-foreground sm:text-2xl">
                                                {person.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <p className="break-words font-medium">
                                        {person.name}
                                    </p>

                                    {person.characterName && (
                                        <p className="mt-0.5 break-words text-muted-foreground">
                                            {person.characterName}
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* =====================================================
                    FRIENDS
                ====================================================== */}
                {user && (
                    <section className="rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5">
                        <p className="font-medium text-foreground">
                            Friends who watched this
                        </p>

                        {friendsWhoWatched.length > 0 ? (
                            <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">
                                {friendsWhoWatched
                                    .map((friend) => friend.username)
                                    .join(", ")}
                            </p>
                        ) : (
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                None of your friends have watched this yet.
                            </p>
                        )}
                    </section>
                )}

                {/* =====================================================
                    SIMILAR MOVIES
                ====================================================== */}
                {similarMovies.length > 0 && (
                    <section>
                        <h2 className="mb-4 text-lg font-semibold">
                            Similar movies
                        </h2>

                        <MoviePosterGrid movies={similarMovies} />
                    </section>
                )}

                {/* =====================================================
                    PLACEHOLDER
                ====================================================== */}
                
            </div>
        </main>
    );
}