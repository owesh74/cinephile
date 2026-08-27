"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, PlayCircle, Film } from "lucide-react";
import { TrackingButtons } from "@/components/tracking-buttons";
import { formatRuntime, formatYear, formatScore } from "@/lib/format";

export type SlideMovie = {
    id: string;
    title: string;
    image: string | null;
    releaseDate: string | Date | null;
    runtimeMinutes: number | null;
    imdbScore: string | number | null;
    description: string | null;
    genres: string[];
    trailerUrl?: string;
    badge?: string;
};

export function MovieHeroSlider({
    slides,
    loggedIn,
    statusByMovie,
}: {
    slides: SlideMovie[];
    loggedIn: boolean;
    statusByMovie: Record<string, { onWatchlist: boolean; watched: boolean }>;
}) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;

        const timer = setInterval(() => {
            setIndex((current) => (current + 1) % slides.length);
        }, 7000);

        return () => clearInterval(timer);
    }, [slides.length]);

    if (slides.length === 0) return null;

    const movie = slides[index];
    const year = formatYear(movie.releaseDate);
    const runtime = formatRuntime(movie.runtimeMinutes);
    const score = formatScore(movie.imdbScore);
    const status = statusByMovie[movie.id] ?? null;

    const isUpcoming = movie.releaseDate
        ? new Date(movie.releaseDate).getTime() > Date.now()
        : false;
    const badge = movie.badge ?? (isUpcoming ? "Coming Soon" : "Popular Now");

    return (
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
                {movie.image ? (
                    <Image
                        key={movie.id}
                        src={movie.image}
                        alt={movie.title}
                        fill
                        unoptimized
                        priority
                        className="object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-muted" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                <div className="absolute inset-0 hidden bg-gradient-to-r from-background/90 via-background/10 to-transparent sm:block" />

                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 sm:gap-4 sm:p-8 lg:p-10">
                    <span className="w-fit rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                        {badge}
                    </span>

                    <h1 className="max-w-2xl font-display text-2xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        {movie.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        {score && (
                            <span className="flex items-center gap-1 font-medium text-primary">
                                <Star className="h-4 w-4 fill-primary" />
                                {score}
                            </span>
                        )}
                        {year && <span>{year}</span>}
                        {runtime && <span>{runtime}</span>}
                        {movie.genres.length > 0 && (
                            <span className="truncate">{movie.genres.slice(0, 3).join(", ")}</span>
                        )}
                    </div>

                    {movie.description && (
                        <p className="hidden max-w-xl text-sm leading-6 text-muted-foreground sm:line-clamp-2 sm:block sm:text-base">
                            {movie.description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <Link
                            href={`/movie/${movie.id}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/80"
                        >
                            <PlayCircle className="h-4 w-4" />
                            View Details
                        </Link>

                        {movie.trailerUrl && (
                            <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/80 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                                <Film className="h-4 w-4" />
                                Watch Trailer
                            </a>
                        )}

                        {loggedIn && status && (
                            <TrackingButtons
                                key={movie.id}
                                movieId={movie.id}
                                initialOnWatchlist={status.onWatchlist}
                                initialWatched={status.watched}
                            />
                        )}
                    </div>

                    {slides.length > 1 && (
                        <div className="flex items-center gap-2 pt-2">
                            {slides.map((slide, i) => (
                                <button
                                    key={slide.id}
                                    type="button"
                                    aria-label={`Show ${slide.title}`}
                                    onClick={() => setIndex(i)}
                                    className={`h-1.5 rounded-full transition-all ${i === index
                                            ? "w-6 bg-primary"
                                            : "w-1.5 bg-foreground/30 hover:bg-foreground/50"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}