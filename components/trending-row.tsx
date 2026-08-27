"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatScore } from "@/lib/format";

type TrendingMovie = {
  id: string;
  title: string;
  posterUrl: string | null;
  imdbScore?: string | number | null;
};

export function TrendingRow({ movies }: { movies: TrendingMovie[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (movies.length === 0) return null;

  function scrollByAmount(amount: number) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className="group/row relative">
      <div
        ref={scrollerRef}
        className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto scroll-smooth px-4 pb-1 sm:mx-0 sm:px-0"
      >
        {movies.map((movie, index) => {
          const score = formatScore(movie.imdbScore ?? null);

          return (
            <Link
              key={movie.id}
              href={`/movie/${movie.id}`}
              className="group w-32 shrink-0 sm:w-40"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted ring-1 ring-border transition-all duration-200 group-hover:-translate-y-1.5 group-hover:ring-2 group-hover:ring-primary/60">
                <span className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-xs font-bold text-primary ring-1 ring-primary/30">
                  {index + 1}
                </span>

                {movie.posterUrl ? (
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    fill
                    unoptimized
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No poster
                  </div>
                )}

                {score && (
                  <span className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold text-primary">
                    ★ {score}
                  </span>
                )}
              </div>

              <p className="mt-2 truncate text-sm font-medium">{movie.title}</p>
            </Link>
          );
        })}
      </div>

      {movies.length > 4 && (
        <>
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollByAmount(-320)}
            className="absolute left-0 top-1/3 hidden -translate-x-1/2 items-center justify-center rounded-full border border-border bg-background/90 p-2 text-foreground opacity-0 shadow-lg transition-opacity group-hover/row:opacity-100 hover:border-primary/50 hover:text-primary sm:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByAmount(320)}
            className="absolute right-0 top-1/3 hidden translate-x-1/2 items-center justify-center rounded-full border border-border bg-background/90 p-2 text-foreground opacity-0 shadow-lg transition-opacity group-hover/row:opacity-100 hover:border-primary/50 hover:text-primary sm:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}