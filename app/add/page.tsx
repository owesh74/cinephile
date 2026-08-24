"use client";

import { useState, useTransition } from "react";
import { searchExistingMovies, createMovieAction } from "@/lib/actions/movies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type SearchResult = { id: string; title: string; releaseDate: string | null };

export default function AddMoviePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateLink, setDuplicateLink] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSearch() {
    if (!query.trim()) return;
    const res = await searchExistingMovies(query);
    setResults(res);
    setSearched(true);
    setShowForm(res.length === 0);
  }

  async function handleCreate(formData: FormData) {
    setError(null);
    setDuplicateLink(null);
    startTransition(async () => {
      const result = await createMovieAction(formData);
      if (result?.error === "duplicate") {
        setDuplicateLink(result.movieId!);
      } else if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-16">
      <h1 className="text-2xl font-semibold">Add a movie</h1>

      {!showForm && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            First, search to make sure this movie isn't already on Cinephile.
          </p>
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title..."
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {searched && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Found existing movies:</p>
              {results.map((r) => (
                <Link
                  key={r.id}
                  href={`/movie/${r.id}`}
                  className="block rounded-md border p-3 text-sm hover:bg-muted"
                >
                  {r.title}
                  {r.releaseDate && ` (${new Date(r.releaseDate).getFullYear()})`}
                </Link>
              ))}
              <p className="pt-2 text-sm text-muted-foreground">
                Not the one you're looking for?{" "}
                <button
                  onClick={() => setShowForm(true)}
                  className="underline"
                >
                  Add a new movie
                </button>
              </p>
            </div>
          )}

          {searched && results.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No matches found — showing the add form below.
            </p>
          )}
        </div>
      )}

      {showForm && (
        <form action={handleCreate} className="space-y-4">
          {duplicateLink && (
            <div className="rounded-md border border-yellow-500 bg-yellow-50 p-3 text-sm">
              This movie already exists.{" "}
              <Link href={`/movie/${duplicateLink}`} className="underline">
                View it here
              </Link>
              .
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}

          <Input name="title" placeholder="Title *" defaultValue={query} required />
          <Input name="originalTitle" placeholder="Original title (if different)" />

          <div>
            <label className="mb-1 block text-sm font-medium">Poster</label>
            <input type="file" name="poster" accept="image/*" className="text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input name="releaseYear" placeholder="Release year (e.g. 2014)" />
            <Input name="runtimeMinutes" placeholder="Runtime (minutes)" />
          </div>

          <textarea
            name="description"
            placeholder="Description"
            rows={3}
            className="w-full rounded-md border bg-transparent p-2 text-sm"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input name="language" placeholder="Language" />
            <Input name="imdbScore" placeholder="IMDb score (0-10)" />
          </div>

          <Input name="genres" placeholder="Genres, comma-separated (e.g. Drama, Sci-Fi)" />
          <Input name="countries" placeholder="Countries, comma-separated" />
          <Input name="director" placeholder="Director" />
          <Input name="writers" placeholder="Writers, comma-separated" />
          <Input
            name="cast"
            placeholder='Cast: "Actor Name as Character", comma-separated'
          />

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creating..." : "Create movie"}
          </Button>
        </form>
      )}
    </div>
  );
}