"use client";

import { useRef, useState, useTransition } from "react";
import { searchExistingMovies, createMovieAction } from "@/lib/actions/movies";
import { MovieMetadataFields } from "@/components/movie-metadata-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type Person = {
  id: string;
  name: string;
  photoUrl: string | null;
};

type SearchResult = {
  id: string;
  title: string;
  releaseDate: string | null;
};

type AddMovieFormProps = {
  people: Person[];
};

export function AddMovieForm({ people }: AddMovieFormProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateLink, setDuplicateLink] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterName, setPosterName] = useState<string | null>(null);
  const [posterSize, setPosterSize] = useState<number | null>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  function handlePosterChange(file: File | null) {
    if (posterPreview) {
      URL.revokeObjectURL(posterPreview);
    }

    if (!file) {
      setPosterPreview(null);
      setPosterName(null);
      setPosterSize(null);
      return;
    }

    setPosterPreview(URL.createObjectURL(file));
    setPosterName(file.name);
    setPosterSize(file.size);
  }

  function removePoster() {
    if (posterPreview) {
      URL.revokeObjectURL(posterPreview);
    }

    setPosterPreview(null);
    setPosterName(null);
    setPosterSize(null);

    if (posterInputRef.current) {
      posterInputRef.current.value = "";
    }
  }

  function formatFileSize(bytes: number | null) {
    if (bytes === null) return "";
    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleSearch() {
    const trimmed = query.trim();

    if (!trimmed) return;

    const res = await searchExistingMovies(trimmed);

    setResults(res);
    setSearched(true);
    setShowForm(res.length === 0);
  }

  function handleCreate(formData: FormData) {
    setError(null);
    setDuplicateLink(null);

    startTransition(async () => {
      const result = await createMovieAction(formData);

      if (result?.error === "duplicate" && result.movieId) {
        setDuplicateLink(result.movieId);
      } else if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-8">
      {!showForm && (
        <section className="rounded-2xl border border-border bg-card/40 p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Find the movie first</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search Cinephile before adding a new movie so you don't create
              duplicates.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Search by movie title..."
              className="h-11"
            />

            <Button
              type="button"
              onClick={handleSearch}
              className="h-11 sm:px-6"
            >
              Search
            </Button>
          </div>

          {searched && results.length > 0 && (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium">Existing movies</p>

              {results.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movie/${movie.id}`}
                  className="flex items-center justify-between rounded-xl border border-border p-4 text-sm transition hover:bg-muted"
                >
                  <span className="font-medium">{movie.title}</span>

                  {movie.releaseDate && (
                    <span className="text-muted-foreground">
                      {new Date(movie.releaseDate).getFullYear()}
                    </span>
                  )}
                </Link>
              ))}

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="pt-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Not the movie you're looking for? Add a new one
              </button>
            </div>
          )}

          {searched && results.length === 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-border p-4">
              <p className="text-sm text-muted-foreground">
                No matching movies found. The movie form is ready below.
              </p>
            </div>
          )}
        </section>
      )}

      {showForm && (
        <form action={handleCreate} className="space-y-6">
          {duplicateLink && (
            <div className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm">
              <p className="font-medium">This movie already exists.</p>
              <Link
                href={`/movie/${duplicateLink}`}
                className="mt-1 inline-block underline underline-offset-4"
              >
                View the existing movie
              </Link>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <section className="rounded-2xl border border-border bg-card/40 p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">Movie details</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Basic information about the movie.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                name="title"
                placeholder="Movie title *"
                defaultValue={query}
                required
              />

              <Input
                name="originalTitle"
                placeholder="Original title (if different)"
              />

              <div className="rounded-xl border border-border bg-background/30 p-4">
                <div className="mb-4">
                  <p className="text-sm font-medium">Poster</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG, WEBP or another image format. Maximum 5MB.
                  </p>
                </div>

                {posterPreview ? (
                  <div className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="h-48 w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        <img
                          src={posterPreview}
                          alt="Selected poster preview"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-3">
                          <p className="text-sm font-medium">
                            Poster selected
                          </p>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {posterName}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatFileSize(posterSize)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <label className="cursor-pointer rounded-md border border-border px-3 py-2 text-sm font-medium transition hover:bg-muted">
                            Change poster
                            <input
                              ref={posterInputRef}
                              type="file"
                              name="poster"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) =>
                                handlePosterChange(
                                  e.target.files?.[0] ?? null
                                )
                              }
                            />
                          </label>

                          <button
                            type="button"
                            onClick={removePoster}
                            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 py-10 text-center transition hover:border-primary hover:bg-muted/30">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-border text-xl">
                      +
                    </div>

                    <span className="text-sm font-medium">
                      Choose poster image
                    </span>

                    <span className="mt-1 text-xs text-muted-foreground">
                      Click to browse your computer
                    </span>

                    <input
                      ref={posterInputRef}
                      type="file"
                      name="poster"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) =>
                        handlePosterChange(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="releaseYear"
                  placeholder="Release year (e.g. 2014)"
                  inputMode="numeric"
                />

                <Input
                  name="runtimeMinutes"
                  placeholder="Runtime (minutes)"
                  inputMode="numeric"
                />
              </div>

              <textarea
                name="description"
                placeholder="Description"
                rows={5}
                className="w-full rounded-md border border-border bg-input p-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="imdbScore"
                  placeholder="IMDb score (0-10)"
                  inputMode="decimal"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card/40 p-5 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Movie metadata</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Use the suggestions to keep Cinephile's movie data consistent.
              </p>
            </div>

            <MovieMetadataFields people={people} />
          </section>

          <div className="rounded-2xl border border-border bg-card/40 p-4">
            <Button
              type="submit"
              disabled={pending}
              className="h-11 w-full"
            >
              {pending ? "Creating movie..." : "Create movie"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}