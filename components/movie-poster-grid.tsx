import Link from "next/link";
import Image from "next/image";

type GridMovie = {
  id: string;
  title: string;
  posterUrl: string | null;
};

export function MoviePosterGrid({
  movies,
}: {
  movies: GridMovie[];
}) {
  if (movies.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing here yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
      {movies.map((movie) => (
        <Link
          key={movie.id}
          href={`/movie/${movie.id}`}
          className="group space-y-1"
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-muted ring-1 ring-border transition-transform duration-200 motion-safe:group-hover:-translate-y-1 group-hover:ring-primary/50">
            {movie.posterUrl && (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
              />
            )}

            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <p className="truncate text-sm font-medium">
            {movie.title}
          </p>
        </Link>
      ))}
    </div>
  );
}