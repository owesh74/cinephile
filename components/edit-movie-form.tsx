"use client";

import { useState, useTransition } from "react";

import { updateMovieAction } from "@/lib/actions/movies";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { MovieMetadataFields } from "@/components/movie-metadata-fields";

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
    releaseYear: string;
    runtimeMinutes: number | null;
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
    releaseYear,
    runtimeMinutes,
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

    function handleSubmit(formData: FormData) {
        setError(null);

        startTransition(async () => {
            const result = await updateMovieAction(
                movieId,
                formData
            );

            if (result?.error) {
                setError(result.error);
            }
        });
    }

    return (
        <form
            action={handleSubmit}
            className="space-y-6"
        >
            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
                    {error}
                </div>
            )}

            {/* Basic information */}
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
                        placeholder="Title *"
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
                            placeholder="Runtime (minutes)"
                            defaultValue={
                                runtimeMinutes?.toString() ?? ""
                            }
                        />
                    </div>

                    <textarea
                        name="description"
                        placeholder="Description"
                        rows={5}
                        defaultValue={description ?? ""}
                        className="w-full resize-y rounded-md border border-border bg-input p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                    />
                </div>
            </section>

            {/* Poster */}
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold">
                        Movie poster
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
                                    Leave the upload field empty to
                                    keep this poster.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-3 text-xs text-muted-foreground">
                            This movie currently has no poster.
                        </p>
                    )}
                </div>
            </section>

            {/* Rating / language */}
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
                    />
                </div>
            </section>

            {/* Metadata selectors */}
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold">
                        Movie details
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Choose genres, countries and people associated
                        with this movie.
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

            {/* Save */}
            <div className="sticky bottom-4 z-10 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
                <Button
                    type="submit"
                    disabled={pending}
                    className="w-full"
                >
                    {pending
                        ? "Saving changes..."
                        : "Save changes"}
                </Button>
            </div>
        </form>
    );
}