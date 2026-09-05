"use client";

import { useState, useTransition } from "react";

import { updateMovieAction } from "@/lib/actions/movies";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MovieMetadataFields } from "@/components/movie-metadata-fields";

type MediaType = "movie" | "series" | "game";

type Person = {
    id: string;
    name: string;
    photoUrl: string | null;
};

type EditMovieFormProps = {
    movieId: string;
    title: string;
    originalTitle: string | null;
    posterUrl: string | null;
    mediaType: MediaType;
    releaseYear: string;
    runtimeMinutes: number | null;
    seasonCount: number;
    episodeCount: number;
    description: string | null;
    language: string | null;
    imdbScore: string | null;
    genres: string[];
    countries: string[];
    director: string;
    writers: string[];
    cast: string[];
    people: Person[];
};

export function EditMovieForm({
    movieId,
    title,
    originalTitle,
    posterUrl,
    mediaType: initialMediaType,
    releaseYear,
    runtimeMinutes,
    seasonCount,
    episodeCount,
    description,
    language,
    imdbScore,
    genres,
    countries,
    director,
    writers,
    cast,
    people,
}: EditMovieFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const [mediaType, setMediaType] =
        useState<MediaType>(initialMediaType);

    function handleSubmit(formData: FormData) {
        setError(null);

        // Make absolutely sure the selected media type is submitted.
        formData.set("mediaType", mediaType);

        // Series uses simple numeric totals instead of individual
        // season/episode records.
        if (mediaType === "series") {
            formData.set("seasonCount", String(seasonCountInputValue(formData)));
            formData.set(
                "episodeCount",
                String(episodeCountInputValue(formData)),
            );
        } else {
            formData.set("seasonCount", "0");
            formData.set("episodeCount", "0");
        }

        startTransition(async () => {
            const result = await updateMovieAction(
                movieId,
                formData,
            );

            if (result?.error) {
                setError(result.error);
            }
        });
    }

    function seasonCountInputValue(formData: FormData) {
        return Number(formData.get("seasonCount") ?? 0);
    }

    function episodeCountInputValue(formData: FormData) {
        return Number(formData.get("episodeCount") ?? 0);
    }

    const isSeries = mediaType === "series";
    const isGame = mediaType === "game";

    const mediaLabel = isSeries
        ? "Series"
        : isGame
          ? "Game"
          : "Movie";

    return (
        <form
            action={handleSubmit}
            className="space-y-6"
        >
            {/* =========================================================
                ERROR
            ========================================================== */}
            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
                    {error}
                </div>
            )}

            {/* =========================================================
                MEDIA TYPE
            ========================================================== */}
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold">
                        Media type
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Choose whether this entry is a movie, series or game.
                    </p>
                </div>

                <input
                    type="hidden"
                    name="mediaType"
                    value={mediaType}
                />

                <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-1">
                    <button
                        type="button"
                        onClick={() => setMediaType("movie")}
                        className={`rounded-lg px-3 py-3 text-sm font-medium transition ${
                            mediaType === "movie"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Movie
                    </button>

                    <button
                        type="button"
                        onClick={() => setMediaType("series")}
                        className={`rounded-lg px-3 py-3 text-sm font-medium transition ${
                            mediaType === "series"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Series
                    </button>

                    <button
                        type="button"
                        onClick={() => setMediaType("game")}
                        className={`rounded-lg px-3 py-3 text-sm font-medium transition ${
                            mediaType === "game"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Game
                    </button>
                </div>

                {isSeries && (
                    <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <p className="text-sm font-medium">
                            Series selected
                        </p>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Enter the total number of seasons and episodes for
                            this series.
                        </p>
                    </div>
                )}

                {isGame && (
                    <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <p className="text-sm font-medium">
                            Game selected
                        </p>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Game-specific metadata and reviews will be added
                            separately.
                        </p>
                    </div>
                )}
            </section>

            {/* =========================================================
                BASIC INFORMATION
            ========================================================== */}
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold">
                        Basic information
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Title, release information and description.
                    </p>
                </div>

                <div className="space-y-4">
                    <Input
                        name="title"
                        placeholder={`${mediaLabel} title *`}
                        defaultValue={title}
                        required
                    />

                    <Input
                        name="originalTitle"
                        placeholder="Original title (if different)"
                        defaultValue={originalTitle ?? ""}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            name="releaseYear"
                            placeholder="Release year"
                            defaultValue={releaseYear}
                        />

                        <Input
                            name="runtimeMinutes"
                            placeholder={
                                isSeries
                                    ? "Episode runtime (minutes)"
                                    : "Runtime (minutes)"
                            }
                            defaultValue={
                                runtimeMinutes?.toString() ?? ""
                            }
                            inputMode="numeric"
                        />
                    </div>

                    <textarea
                        name="description"
                        placeholder={
                            isGame
                                ? "Game description"
                                : isSeries
                                  ? "Series description"
                                  : "Description"
                        }
                        rows={5}
                        defaultValue={description ?? ""}
                        className="w-full resize-y rounded-md border border-border bg-input p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                    />
                </div>
            </section>

            {/* =========================================================
                SERIES COUNTS
            ========================================================== */}
            {isSeries && (
                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold">
                            Series counts
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Enter the total number of seasons and episodes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="seasonCount"
                                className="text-sm font-medium"
                            >
                                Seasons
                            </label>

                            <Input
                                id="seasonCount"
                                name="seasonCount"
                                type="number"
                                min="0"
                                step="1"
                                defaultValue={seasonCount}
                                inputMode="numeric"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="episodeCount"
                                className="text-sm font-medium"
                            >
                                Episodes
                            </label>

                            <Input
                                id="episodeCount"
                                name="episodeCount"
                                type="number"
                                min="0"
                                step="1"
                                defaultValue={episodeCount}
                                inputMode="numeric"
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* =========================================================
                POSTER
            ========================================================== */}
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold">
                        {mediaLabel} poster
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Replace the current poster if you want.
                    </p>
                </div>

                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
                    <label className="mb-3 block text-sm font-medium">
                        Choose a new poster
                    </label>

                    <input
                        type="file"
                        name="poster"
                        accept="image/*"
                        className="block w-full cursor-pointer rounded-md border border-border bg-background px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                    />

                    {posterUrl ? (
                        <div className="mt-5 flex gap-4">
                            <div className="relative h-44 w-28 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                                <img
                                    src={posterUrl}
                                    alt={title}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>

                            <div className="flex flex-col justify-center">
                                <p className="text-sm font-medium">
                                    Current poster
                                </p>

                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    Leave the upload field empty to keep
                                    this poster.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-3 text-xs text-muted-foreground">
                            This {mediaLabel.toLowerCase()} currently has no
                            poster.
                        </p>
                    )}
                </div>
            </section>

            {/* =========================================================
                RATING / LANGUAGE
            ========================================================== */}
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold">
                        Language & rating
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Set the primary language and IMDb score.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        name="languageFallback"
                        defaultValue=""
                        className="hidden"
                        tabIndex={-1}
                        aria-hidden="true"
                    />

                    <Input
                        name="imdbScore"
                        placeholder="IMDb score (0-10)"
                        defaultValue={imdbScore ?? ""}
                        inputMode="decimal"
                    />
                </div>
            </section>

            {/* =========================================================
                METADATA
            ========================================================== */}
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold">
                        {isGame
                            ? "Game details"
                            : isSeries
                              ? "Series details"
                              : "Movie details"}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Choose genres, countries and people associated with
                        this {mediaLabel.toLowerCase()}.
                    </p>
                </div>

                <MovieMetadataFields
                    people={people}
                    initialGenres={genres}
                    initialCountries={countries}
                    initialLanguage={language}
                    initialDirector={director}
                    initialWriters={writers}
                    initialCast={cast}
                />
            </section>

            {/* =========================================================
                SAVE
            ========================================================== */}
            <div className="sticky bottom-4 z-10 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
                <Button
                    type="submit"
                    disabled={pending}
                    className="w-full"
                >
                    {pending
                        ? "Saving changes..."
                        : `Save ${mediaLabel.toLowerCase()}`}
                </Button>
            </div>
        </form>
    );
}