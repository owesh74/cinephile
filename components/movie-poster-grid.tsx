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
        <a key={movie.id} href={`/movie/${movie.id}`} className="group block cursor-pointer" aria-label={`Open ${movie.title}`}>
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted ring-1 ring-border transition-all duration-200 motion-safe:group-hover:-translate-y-1.5 group-hover:ring-2 group-hover:ring-primary/60 group-hover:shadow-[0_8px_24px_-8px_theme(colors.primary/40%)]">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                unoptimized
                className="pointer-events-none object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No poster
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
          <p className="pointer-events-none mt-2 truncate text-sm font-medium">
            {movie.title}
          </p>
        </a>
      ))}
    </div>
  );
}
