import { searchMovies } from "@/lib/data/search";
import Link from "next/link";
import Image from "next/image";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = q ? await searchMovies(q) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-12">
      <form action="/search" method="GET">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search movies..."
          className="w-full rounded-md border bg-transparent p-3 text-sm"
          autoFocus
        />
      </form>

      {q && results.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No movies found for "{q}".
        </p>
      )}

      <div className="space-y-2">
        {results.map((movie) => (
          <Link
            key={movie.id}
            href={`/movie/${movie.id}`}
            className="flex items-center gap-4 rounded-md border p-3 hover:bg-muted"
          >
            <div className="relative h-16 w-11 flex-shrink-0 overflow-hidden rounded bg-muted">
              {movie.posterUrl && (
                <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
              )}
            </div>
            <div>
              <p className="font-medium">{movie.title}</p>
              {movie.releaseDate && (
                <p className="text-sm text-muted-foreground">
                  {new Date(movie.releaseDate).getFullYear()}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}