import { searchMovies } from "@/lib/data/search";
import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchMovies(query) : [];

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-12">
      <div>
        <h1 className="text-2xl font-semibold">
          {query ? `Search results for "${query}"` : "Search"}
        </h1>

        {!query && (
          <p className="mt-2 text-sm text-muted-foreground">
            Use the search box in the navigation bar to find movies.
          </p>
        )}
      </div>

      {query && results.length === 0 && (
        <div className="rounded-md border border-border p-8 text-center">
          <p className="font-medium">No movies found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Nothing matched "{query}".
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((movie) => (
            <Link
              key={movie.id}
              href={`/movie/${movie.id}`}
              className="group flex gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="relative h-32 w-22 shrink-0 overflow-hidden rounded-md bg-muted">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
                    No poster
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h2 className="font-medium group-hover:underline">
                  {movie.title}
                </h2>

                {movie.releaseDate && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(movie.releaseDate).getFullYear()}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}