import { getMovieById } from "@/lib/data/movies";
import { updateMovieAction } from "@/lib/actions/movies";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function EditMoviePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const movie = await getMovieById(id);

    if (!movie) {
        notFound();
    }

    const releaseYear = movie.releaseDate
        ? new Date(movie.releaseDate).getFullYear().toString()
        : "";

    const directors = movie.directors.map((d) => d.name).join(", ");

    const writers = movie.writers.map((w) => w.name).join(", ");

    const cast = movie.cast
        .map((c) =>
            c.characterName
                ? `${c.name} as ${c.characterName}`
                : c.name
        )
        .join(", ");

    return (
        <div className="mx-auto max-w-2xl space-y-8 py-16">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Edit movie</h1>

                <Link
                    href={`/movie/${movie.id}`}
                    className="text-sm underline"
                >
                    Cancel
                </Link>
            </div>

            <form
                action={async (formData) => {
                    "use server";
                    await updateMovieAction(movie.id, formData);
                }}

                className="space-y-4"
            >
                <Input
                    name="title"
                    placeholder="Title *"
                    defaultValue={movie.title}
                    required
                />

                <Input
                    name="originalTitle"
                    placeholder="Original title (if different)"
                    defaultValue={movie.originalTitle ?? ""}
                />

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

                    {movie.posterUrl ? (
                        <div className="mt-3">
                            <p className="mb-2 text-xs text-muted-foreground">
                                Current poster
                            </p>

                            <div className="relative h-48 w-32 overflow-hidden rounded-md border bg-muted">
                                <Image
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    fill
                                    sizes="192px"
                                    unoptimized
                                    className="object-cover"
                                />
                            </div>

                            <p className="mt-2 text-xs text-muted-foreground">
                                Leave the file field empty to keep the current poster.
                            </p>
                        </div>
                    ) : (
                        <p className="mt-2 text-xs text-muted-foreground">
                            This movie currently has no poster.
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        name="releaseYear"
                        placeholder="Release year"
                        defaultValue={releaseYear}
                    />

                    <Input
                        name="runtimeMinutes"
                        placeholder="Runtime (minutes)"
                        defaultValue={movie.runtimeMinutes?.toString() ?? ""}
                    />
                </div>

                <textarea
                    name="description"
                    placeholder="Description"
                    rows={4}
                    defaultValue={movie.description ?? ""}
                    className="w-full rounded-md border border-border bg-input p-2 text-sm text-foreground"
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        name="language"
                        placeholder="Language"
                        defaultValue={movie.language ?? ""}
                    />

                    <Input
                        name="imdbScore"
                        placeholder="IMDb score (0-10)"
                        defaultValue={movie.imdbScore?.toString() ?? ""}
                    />
                </div>

                <Input
                    name="genres"
                    placeholder="Genres, comma-separated"
                    defaultValue={movie.genres.join(", ")}
                />

                <Input
                    name="countries"
                    placeholder="Countries, comma-separated"
                    defaultValue={movie.countries.join(", ")}
                />

                <Input
                    name="director"
                    placeholder="Director"
                    defaultValue={directors}
                />

                <Input
                    name="writers"
                    placeholder="Writers, comma-separated"
                    defaultValue={writers}
                />

                <Input
                    name="cast"
                    placeholder='Cast: "Actor Name as Character", comma-separated'
                    defaultValue={cast}
                />

                <Button type="submit" className="w-full">
                    Save changes
                </Button>
            </form>
        </div>
    );
}