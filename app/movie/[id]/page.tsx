import { getMovieById } from "@/lib/data/movies";
import { notFound } from "next/navigation";
import Image from "next/image";
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
        <div className="mx-auto max-w-4xl space-y-8 py-12">

            {/* Movie hero */}
            <div className="relative">

                {/* Backdrop */}
                {movie.backdropUrl && (
                    <div className="absolute inset-x-0 top-0 -z-10 h-80 overflow-hidden">
                        <Image
                            src={movie.backdropUrl}
                            alt=""
                            fill
                            sizes="100vw"
                            unoptimized
                            className="object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
                    </div>
                )}

                <div className="flex flex-col gap-6 sm:flex-row">

                    {/* POSTER */}
                    <div className="relative h-[420px] w-[280px] shrink-0 overflow-hidden rounded-lg bg-muted">

                        {movie.posterUrl ? (
                            <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                No poster
                            </div>
                        )}

                    </div>

                    {/* Movie information */}
                    <div className="flex-1 space-y-3">

                        <h1 className="font-display text-4xl font-semibold italic">
                            {movie.title}
                        </h1>

                        {movie.originalTitle &&
                            movie.originalTitle !== movie.title && (
                                <p className="text-sm text-muted-foreground">
                                    {movie.originalTitle}
                                </p>
                            )}

                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">

                            {year && (
                                <span>
                                    {year}
                                </span>
                            )}

                            {movie.runtimeMinutes && (
                                <div>
                                    <p className="font-mono text-sm">
                                        {Math.floor(
                                            movie.runtimeMinutes / 60
                                        )}
                                        :
                                        {String(
                                            movie.runtimeMinutes % 60
                                        ).padStart(2, "0")}
                                        :00
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        runtime
                                    </p>
                                </div>
                            )}

                            {movie.language && (
                                <span>
                                    {movie.language}
                                </span>
                            )}

                            {movie.countries.length > 0 && (
                                <span>
                                    {movie.countries.join(", ")}
                                </span>
                            )}

                        </div>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-2">
                            {movie.genres.map((genre) => (
                                <span
                                    key={genre}
                                    className="rounded-full border px-3 py-1 text-xs"
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>

                        {/* Tracking buttons */}
                        {user && (
                            <TrackingButtons
                                movieId={movie.id}
                                initialOnWatchlist={onWatchlist}
                                initialWatched={isWatched}
                            />
                        )}

                        {/* Rating */}
                        {user && (
                            <div>
                                <p className="mb-1 text-sm font-medium">
                                    Your rating
                                </p>

                                <RatingWidget
                                    movieId={movie.id}
                                    initialScore={userRating}
                                />
                            </div>
                        )}

                        {/* Scores */}
                        <div className="flex gap-6 pt-2">

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
                            <p className="text-sm leading-relaxed">
                                {movie.description}
                            </p>
                        )}

                    </div>
                </div>
            </div>

            {/* Director / Writers */}
            {(movie.directors.length > 0 ||
                movie.writers.length > 0) && (
                <div className="flex flex-wrap gap-8 text-sm">

                    {movie.directors.length > 0 && (
                        <div>
                            <p className="font-medium">
                                Director
                            </p>

                            <p className="text-muted-foreground">
                                {movie.directors
                                    .map((director) => director.name)
                                    .join(", ")}
                            </p>
                        </div>
                    )}

                    {movie.writers.length > 0 && (
                        <div>
                            <p className="font-medium">
                                Writers
                            </p>

                            <p className="text-muted-foreground">
                                {movie.writers
                                    .map((writer) => writer.name)
                                    .join(", ")}
                            </p>
                        </div>
                    )}

                </div>
            )}

            {/* Cast */}
            {movie.cast.length > 0 && (
                <div>
                    <h2 className="mb-3 text-lg font-medium">
                        Cast
                    </h2>

                    <div className="flex flex-wrap gap-4">

                        {movie.cast.map((person) => (
                            <div
                                key={person.personId}
                                className="w-24 text-center text-xs"
                            >
                                <div className="mb-1 h-24 w-24 overflow-hidden rounded-full bg-muted">

                                    {person.photoUrl ? (
                                        <img
                                            src={person.photoUrl}
                                            alt={person.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : null}

                                </div>

                                <p className="font-medium">
                                    {person.name}
                                </p>

                                {person.characterName && (
                                    <p className="text-muted-foreground">
                                        {person.characterName}
                                    </p>
                                )}
                            </div>
                        ))}

                    </div>
                </div>
            )}

            {/* Friends */}
            {user && (
                <div>
                    <p className="font-medium text-foreground">
                        Friends who watched this
                    </p>

                    {friendsWhoWatched.length > 0 ? (
                        <p className="text-muted-foreground">
                            {friendsWhoWatched
                                .map((friend) => friend.username)
                                .join(", ")}
                        </p>
                    ) : (
                        <p className="text-muted-foreground">
                            None of your friends have watched this yet.
                        </p>
                    )}
                </div>
            )}

            {/* Similar movies */}
            {similarMovies.length > 0 && (
                <div>
                    <p className="mb-2 font-medium text-foreground">
                        Similar movies
                    </p>

                    <MoviePosterGrid movies={similarMovies} />
                </div>
            )}

            {/* Placeholder */}
            <div className="space-y-2 border-t pt-6 text-sm text-muted-foreground">
                <p>
                    Lists containing this movie — coming in Phase 9
                </p>
            </div>

        </div>
    );
}