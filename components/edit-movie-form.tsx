"use client";

import { useState, useTransition } from "react";
import { updateMovieAction } from "@/lib/actions/movies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    writers: string;
    cast: string;
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
}: EditMovieFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    function handleSubmit(formData: FormData) {
        setError(null);

        startTransition(async () => {
            const result = await updateMovieAction(movieId, formData);

            // updateMovieAction only returns when something went wrong —
            // on success it redirects and never returns here.
            if (result?.error) {
                setError(result.error);
            }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-4">

            {error && (
                <div className="rounded-md border border-red-500 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Title */}
            <Input
                name="title"
                placeholder="Title *"
                defaultValue={title}
                required
            />

            {/* Original title */}
            <Input
                name="originalTitle"
                placeholder="Original title (if different)"
                defaultValue={originalTitle ?? ""}
            />

            {/* POSTER */}
            <div>

                <label className="mb-1 block text-sm font-medium">
                    Replace poster
                </label>

                <input
                    type="file"
                    name="poster"
                    accept="image/*"
                    className="block w-full text-sm"
                />

                {/* Current poster */}
                {posterUrl ? (
                    <div className="mt-3">

                        <p className="mb-2 text-xs text-muted-foreground">
                            Current poster
                        </p>

                        <div className="relative h-48 w-32 overflow-hidden rounded-md border bg-muted">

                            <img
                                src={posterUrl}
                                alt={title}
                                className="absolute inset-0 h-full w-full object-cover"
                            />

                        </div>

                        <p className="mt-2 text-xs text-muted-foreground">
                            Leave the file field empty to keep the
                            current poster.
                        </p>

                    </div>
                ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                        This movie currently has no poster.
                    </p>
                )}

            </div>

            {/* Release year / runtime */}
            <div className="grid grid-cols-2 gap-4">

                <Input
                    name="releaseYear"
                    placeholder="Release year"
                    defaultValue={releaseYear}
                />

                <Input
                    name="runtimeMinutes"
                    placeholder="Runtime (minutes)"
                    defaultValue={runtimeMinutes?.toString() ?? ""}
                />

            </div>

            {/* Description */}
            <textarea
                name="description"
                placeholder="Description"
                rows={4}
                defaultValue={description ?? ""}
                className="w-full rounded-md border border-border bg-input p-2 text-sm text-foreground"
            />

            {/* Language / IMDb */}
            <div className="grid grid-cols-2 gap-4">

                <Input
                    name="language"
                    placeholder="Language"
                    defaultValue={language ?? ""}
                />

                <Input
                    name="imdbScore"
                    placeholder="IMDb score (0-10)"
                    defaultValue={imdbScore?.toString() ?? ""}
                />

            </div>

            {/* Genres */}
            <Input
                name="genres"
                placeholder="Genres, comma-separated"
                defaultValue={genres.join(", ")}
            />

            {/* Countries */}
            <Input
                name="countries"
                placeholder="Countries, comma-separated"
                defaultValue={countries.join(", ")}
            />

            {/* Director */}
            <Input
                name="director"
                placeholder="Director"
                defaultValue={director}
            />

            {/* Writers */}
            <Input
                name="writers"
                placeholder="Writers, comma-separated"
                defaultValue={writers}
            />

            {/* Cast */}
            <Input
                name="cast"
                placeholder='Cast: "Actor Name as Character", comma-separated'
                defaultValue={cast}
            />

            {/* Submit */}
            <Button
                type="submit"
                disabled={pending}
                className="w-full"
            >
                {pending ? "Saving..." : "Save changes"}
            </Button>

        </form>
    );
}