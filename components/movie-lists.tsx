import Link from "next/link";
import Image from "next/image";
import { formatRuntime, formatYear, formatScore } from "@/lib/format";

type TopRatedMovie = {
  id: string;
  title: string;
  posterUrl: string | null;
  releaseDate: string | Date | null;
  runtimeMinutes: number | null;
  imdbScore: string | number | null;
};

export function TopRatedList({ movies }: { movies: TopRatedMovie[] }) {
  if (movies.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No rated movies yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {movies.map((movie, index) => (
        <TopRatedRow key={movie.id} rank={index + 1} movie={movie} />
      ))}
    </div>
  );
}

function TopRatedRow({
  rank,
  movie,
}: {
  rank: number;
  movie: TopRatedMovie;
}) {
  const year = formatYear(movie.releaseDate);
  const runtime = formatRuntime(movie.runtimeMinutes);
  const score = formatScore(movie.imdbScore);

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="flex items-center gap-3 py-3 transition-colors hover:bg-muted/50"
    >
      <span className="w-4 shrink-0 text-sm font-semibold text-muted-foreground">
        {rank}
      </span>

      <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border">
        {movie.posterUrl && (
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            unoptimized
            sizes="40px"
            className="object-cover"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{movie.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[year, runtime].filter(Boolean).join(" • ")}
        </p>
      </div>

      {score && (
        <span className="shrink-0 text-sm font-semibold text-primary">
          ★ {score}
        </span>
      )}
    </Link>
  );
}

type UpcomingMovie = {
  id: string;
  title: string;
  posterUrl: string | null;
  releaseDate: string | Date | null;
};

export function UpcomingList({ movies }: { movies: UpcomingMovie[] }) {
  if (movies.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing upcoming yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {movies.map((movie) => (
        <Link
          key={movie.id}
          href={`/movie/${movie.id}`}
          className="flex items-center gap-3 py-3 transition-colors hover:bg-muted/50"
        >
          <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border">
            {movie.posterUrl && (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                unoptimized
                sizes="40px"
                className="object-cover"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{movie.title}</p>
            <p className="text-xs text-muted-foreground">
              {movie.releaseDate
                ? new Date(movie.releaseDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "TBA"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}