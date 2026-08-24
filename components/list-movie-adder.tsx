"use client";

import { useState, useTransition } from "react";
import { searchMoviesForListAction } from "@/lib/actions/lists";
import { addMovieToListAction } from "@/lib/actions/lists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchResult = { id: string; title: string; posterUrl: string | null; releaseDate: string | null };

export function ListMovieAdder({ listId }: { listId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSearch() {
    if (!query.trim()) return;
    const res = await searchMoviesForListAction(query);
    setResults(res);
  }

  function handleAdd(movieId: string) {
    setError(null);
    startTransition(async () => {
      const result = await addMovieToListAction(listId, movieId);
      if (result?.error) {
        setError(result.error);
      } else {
        setQuery("");
        setResults([]);
      }
    });
  }

  return (
    <div className="space-y-3 rounded-md border p-3">
      <p className="text-sm font-medium">Add a movie</p>
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title..."
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button type="button" onClick={handleSearch}>
          Search
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {results.length > 0 && (
        <div className="space-y-1">
          {results.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
              <span>
                {r.title}
                {r.releaseDate && ` (${new Date(r.releaseDate).getFullYear()})`}
              </span>
              <Button size="sm" disabled={pending} onClick={() => handleAdd(r.id)}>
                Add
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}